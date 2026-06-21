// ─────────────────────────────────────────────────────────────────────────
// NLP / reasoning layer — POST-RULES plain-language explanation
// ─────────────────────────────────────────────────────────────────────────
// This is the deterministic "Mock AI Mode" explainer. It takes the rules
// engine's machine output (status, confidence, reason codes) and renders
// human-readable explanations, next steps, glossary, and missing-info notes.
//
// CRITICAL GUARDRAIL: this layer reads `status`/`confidence` but NEVER sets or
// alters them. It only produces prose. All prose is run through sanitizeText()
// so forbidden phrasing can never reach the UI even if copy changes later.
// ─────────────────────────────────────────────────────────────────────────

import type {
  NormalizedInputs,
  ProgramResult,
  ProgramExplanation,
  GlossaryTerm,
} from '../types';
import { PROGRAMS } from '../data/programs';
import { sanitizeText } from './guardrail';

// Human-readable text for each machine reason code.
const REASON_TEXT: Record<string, string> = {
  REASON_INCOME_WITHIN_RANGE: 'your estimated income looks within the typical range for this program',
  REASON_NEAR_THRESHOLD: 'your income is close to the cutoff, so it could go either way',
  REASON_INCOME_ABOVE_LIMIT: 'your estimated income looks above the typical limit for this program',
  REASON_UNINSURED: 'you told us you currently have no insurance',
  REASON_SUBSIDY_INCOME_BAND: 'your income sits in the band where Marketplace discounts are usually largest',
  REASON_LOWER_COST_OPTION_FIRST: 'a lower-cost program may fit better first, so this is worth comparing',
  REASON_EMPLOYER_PLAN_OFFERED: 'an employer plan was offered, which can affect Marketplace discounts',
  REASON_NO_EMPLOYER_PLAN: 'no employer plan was offered to you',
  REASON_SLIDING_SCALE_OPEN: 'sliding-scale clinics serve people at most income levels, including the uninsured',
  REASON_IMMEDIATE_NEED: 'you told us you need care soon',
  REASON_HAS_DEPENDENTS: 'you reported having a child or dependent',
  REASON_CHILD_HIGHER_LIMITS: 'children often have higher income limits than adults',
  REASON_STATUS_SPECIFIC_RULES: 'some rules can be situation-specific, so this is shown for information only',
  REASON_INFORMATIONAL_ONLY: 'this is informational and should be verified privately with an official source',
};

const NEXT_STEP_TEXT: Record<string, string> = {
  apply_pathway: 'Start the official application or pre-screen on the verification link below.',
  verify_income: 'Pull together a recent estimate of your income before applying.',
  contact_clinic: 'Call a nearby community health center and ask about sliding-scale care.',
  contact_caseworker: 'Talk to a caseworker or 211 navigator who can verify situation-specific rules privately.',
  urgent_care_help: 'If you need care now, go to a clinic or ER and ask about financial assistance at intake.',
  gather_documents: 'Gather recent pay or income records so you can verify quickly later.',
};

/** Build the plain-language explanation for one rules result. */
export function explainResult(
  result: ProgramResult,
  n: NormalizedInputs,
): ProgramExplanation {
  const meta = PROGRAMS[result.programId];

  // Compose a why-list from reason codes + affected inputs.
  const whyRaw = result.reasonCodes
    .map((c) => REASON_TEXT[c])
    .filter(Boolean) as string[];

  const verdictWord =
    result.status === 'MAY_QUALIFY'
      ? 'may be worth pursuing'
      : result.status === 'POSSIBLY_ELIGIBLE_VERIFY'
        ? 'is possible but needs verification'
        : 'is less likely to fit, but there are alternatives';

  const plain =
    `${meta.programName} ${verdictWord}. We reached this because ` +
    `${joinList(whyRaw)}. Because rules also vary by state` +
    `${n.state && n.state !== 'Not provided' ? ` (you told us ${n.state})` : ''}, ` +
    `this is decision support only — only the program or agency can confirm anything.`;

  const missingExplained = result.missingInformation.map(
    (m) => `We still need: ${m.toLowerCase()}.`,
  );

  const glossary: GlossaryTerm[] = meta.glossary;

  const nextStep = NEXT_STEP_TEXT[result.nextStepType] ?? 'Verify with an official source below.';

  // Run EVERYTHING user-visible through the guardrail.
  return {
    programId: result.programId,
    plainExplanation: sanitizeText(plain).clean,
    whyThisResult: whyRaw.map((w) => sanitizeText(capitalize(w) + '.').clean),
    missingInfoExplained: missingExplained.map((m) => sanitizeText(m).clean),
    nextStep: sanitizeText(nextStep).clean,
    glossary,
  };
}

/** Build the auto-filled caseworker handoff script from intake. */
export function buildCaseworkerScript(n: NormalizedInputs): string {
  const income = n.incomeRange
    ? `between $${n.incomeRange.low.toLocaleString()} and $${n.incomeRange.high.toLocaleString()} a year`
    : n.annualIncome
      ? `about $${n.annualIncome.toLocaleString()} a year`
      : 'something I’m still estimating';
  const household = n.flags.includes('missing_household_size')
    ? 'something I need to confirm'
    : `${n.householdSize}`;
  const unsure = n.incomeIsUncertain
    ? 'my income changes month to month'
    : n.flags.includes('immigration_concern')
      ? 'which rules apply to my specific situation'
      : 'which programs I should check first';

  const script =
    `Hi, I’m uninsured or underinsured and trying to understand what ` +
    `healthcare support I may be able to apply for. My income is ${income}, ` +
    `my household size is ${household}, and I’m unsure about ${unsure}. ` +
    `Can you help me verify which programs I should check?`;
  return sanitizeText(script).clean;
}

// ── small text utils ────────────────────────────────────────────────────────
function joinList(items: string[]): string {
  if (items.length === 0) return 'of your overall situation';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
