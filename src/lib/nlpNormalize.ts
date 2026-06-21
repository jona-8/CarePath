// ─────────────────────────────────────────────────────────────────────────
// NLP / reasoning layer — PRE-RULES normalization
// ─────────────────────────────────────────────────────────────────────────
// WHY THIS NEEDS AI/NLP-STYLE REASONING (and the rules engine does not):
//   Real people describe their lives messily: "I drive for two apps, some
//   weeks I make $900, some weeks nothing." A deterministic rules engine is
//   excellent at the LAST mile — applying a fixed threshold to a clean number
//   and emitting an auditable status label. But it is brittle at the FIRST
//   mile — turning ambiguous, variable, free-text human situations into the
//   clean fields a rules engine needs. That first-mile interpretation
//   (annualizing variable income, detecting "I'm not sure", spotting an
//   immediate need or an immigration concern in free text) is exactly what
//   NLP/LLM-style reasoning is good at. So: NLP normalizes IN, rules decide,
//   NLP explains OUT. The LLM never sets a verdict label.
// ─────────────────────────────────────────────────────────────────────────

import type {
  IntakeAnswers,
  NormalizedInputs,
  AmbiguityFlag,
  FollowUpQuestion,
} from '../types';

// Lightweight keyword detectors. In Real LLM Mode these same signals would be
// extracted by the model; the mock uses transparent, auditable keyword logic.
const IMMIGRATION_TERMS = [
  'immigration', 'immigrant', 'undocumented', 'visa', 'green card',
  'citizen', 'citizenship', 'asylum', 'refugee', 'daca', 'status',
  'documented', 'papers', 'deport',
];
const URGENT_TERMS = [
  'emergency', 'urgent', 'er', 'hospital now', 'pain', 'bleeding',
  'pregnant', 'cant wait', "can't wait", 'right now', 'today',
];

/**
 * Whole-word/phrase match so substrings inside larger words don't false-fire
 * (e.g. "er" must not match inside "delivery" or "were"). Multi-word phrases
 * are matched as substrings since they are already specific enough.
 */
function mentions(text: string, terms: string[]): boolean {
  return terms.some((term) => {
    if (term.includes(' ') || term.includes("'")) return text.includes(term);
    return new RegExp(`\\b${term}\\b`, 'i').test(text);
  });
}

function annualize(amount: number | null, period: 'monthly' | 'annual'): number {
  if (amount == null || Number.isNaN(amount)) return 0;
  return period === 'monthly' ? Math.round(amount * 12) : Math.round(amount);
}

/**
 * Turn raw intake answers into clean NormalizedInputs + detected ambiguities.
 * This is the PRE-rules NLP pass.
 */
export function normalizeIntake(a: IntakeAnswers): NormalizedInputs {
  const flags = new Set<AmbiguityFlag>();
  const freeTextLower = (a.freeText || '').toLowerCase();

  // ── Income normalization ──────────────────────────────────────────────
  let annualIncome = annualize(a.incomeAmount, a.incomePeriod);
  let incomeRange: { low: number; high: number } | null = null;
  let incomeIsUncertain = false;

  if (a.incomeType === 'gig_variable') {
    flags.add('variable_income');
    incomeIsUncertain = true;
  }
  if (a.incomeType === 'not_sure') {
    flags.add('unsure_income');
    incomeIsUncertain = true;
  }

  // If a variable-income range was provided, annualize it and use the midpoint
  // as the best estimate while preserving the range for confidence scoring.
  if (a.avgMonthlyIncomeLow != null && a.avgMonthlyIncomeHigh != null) {
    const low = Math.round(a.avgMonthlyIncomeLow * 12);
    const high = Math.round(a.avgMonthlyIncomeHigh * 12);
    incomeRange = { low, high };
    annualIncome = Math.round((low + high) / 2);
    incomeIsUncertain = true;
  }
  if (a.lastMonthTypical === 'no' || a.lastMonthTypical === 'not_sure') {
    incomeIsUncertain = true;
  }

  // ── Household ─────────────────────────────────────────────────────────
  let householdSize = a.householdSize ?? 0;
  if (!householdSize || householdSize < 1) {
    flags.add('missing_household_size');
    householdSize = 1; // safe default for estimation; flagged as missing info
  }

  // ── Insurance / employer coverage ─────────────────────────────────────
  if (a.insurance === 'uninsured') flags.add('no_insurance');
  if (a.employerInsuranceOffered === 'no') flags.add('no_employer_coverage');

  // ── Dependents ────────────────────────────────────────────────────────
  const hasDependents = a.dependents === 'yes';
  if (hasDependents) flags.add('has_dependents');
  const dependentCount = hasDependents ? (a.dependentCount ?? 1) : 0;

  // ── Immediate care ────────────────────────────────────────────────────
  const immediateCareNeed =
    a.immediateCareNeed === 'yes' || mentions(freeTextLower, URGENT_TERMS);
  if (immediateCareNeed) flags.add('immediate_need');

  // ── Immigration concern (detect to ROUTE TO HUMAN — never classify) ────
  // We deliberately do NOT infer, store, or label any immigration status.
  // We only note that the topic was raised so we can recommend private,
  // official verification and human support.
  if (mentions(freeTextLower, IMMIGRATION_TERMS)) {
    flags.add('immigration_concern');
  }

  return {
    state: a.state || 'Not provided',
    householdSize,
    annualIncome,
    incomeIsUncertain,
    incomeRange,
    incomeType: a.incomeType,
    employment: a.employment,
    insurance: a.insurance,
    employerInsuranceOffered: a.employerInsuranceOffered,
    hasDependents,
    dependentCount,
    wantsDependentCoverage: a.wantsDependentCoverage === 'yes',
    immediateCareNeed,
    flags: Array.from(flags),
  };
}

/** Follow-up questions the NLP layer raises based on detected ambiguity. */
export function deriveFollowUps(n: NormalizedInputs): FollowUpQuestion[] {
  const out: FollowUpQuestion[] = [];
  if (n.flags.includes('variable_income') || n.flags.includes('unsure_income')) {
    out.push({
      id: 'income_range',
      prompt: 'On a typical month, what is the lowest and highest you bring in?',
      reason: 'Variable income changes which programs apply, so a range gives a safer estimate than a single number.',
    });
    out.push({
      id: 'last_month_typical',
      prompt: 'Was last month a typical month for you?',
      reason: 'Programs usually look at ongoing income, not one unusual month.',
    });
  }
  if (n.flags.includes('missing_household_size')) {
    out.push({
      id: 'household',
      prompt: 'How many people do you count in your household (including yourself)?',
      reason: 'Household size sets the income limit for most programs.',
    });
  }
  if (n.flags.includes('has_dependents')) {
    out.push({
      id: 'dependent_coverage',
      prompt: 'Would you like guidance on coverage for your child or dependent too?',
      reason: 'Children often qualify for programs like CHIP even when adults do not.',
    });
  }
  return out;
}
