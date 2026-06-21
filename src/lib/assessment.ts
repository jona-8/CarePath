// ─────────────────────────────────────────────────────────────────────────
// Assessment orchestrator
// ─────────────────────────────────────────────────────────────────────────
// Wires the full pipeline that the architecture panel shows judges:
//   Guided Intake
//     -> NLP normalize (pre-rules)
//     -> Deterministic Rules Engine        (sets verdict + confidence)
//     -> Confidence / uncertainty scoring  (inside the engine)
//     -> NLP explain (post-rules, plain language)  [mock OR real LLM]
//     -> Human verification / next step
// The mode flag selects mock vs real for the EXPLANATION layer only.
// ─────────────────────────────────────────────────────────────────────────

import type {
  IntakeAnswers,
  Assessment,
  ProgramCard,
  ComparisonRow,
  JudgeEvidence,
  ProgramResult,
  ProgramExplanation,
  NormalizedInputs,
} from '../types';
import { normalizeIntake, deriveFollowUps } from './nlpNormalize';
import { runRulesEngine } from './rulesEngine';
import { explainResult, buildCaseworkerScript } from './nlpExplain';
import { explainWithRealLlm, isRealModeAvailable } from './realLlm';
import { buildRoadmap } from './roadmap';
import { buildChecklist } from './checklist';
import { PROGRAMS } from '../data/programs';
import { assertNoForbidden } from './guardrail';

const CONFIDENCE_HINT: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export async function buildAssessment(intake: IntakeAnswers): Promise<Assessment> {
  // 1. PRE-RULES NLP normalization
  const normalized = normalizeIntake(intake);
  const followUps = deriveFollowUps(normalized);

  // 2. Deterministic rules engine — the ONLY place verdicts are set.
  const results = runRulesEngine(normalized);

  // 3. POST-RULES explanation. Choose mock or real; both return the same shape.
  const useReal = isRealModeAvailable();
  const explanations: ProgramExplanation[] = useReal
    ? await explainWithRealLlm(results, normalized)
    : results.map((r) => explainResult(r, normalized));

  // 4. Merge into UI cards + comparison rows.
  const cards: ProgramCard[] = results.map((r) => {
    const ex = explanations.find((e) => e.programId === r.programId)!;
    return { ...r, ...ex, comparison: buildComparisonRow(r) };
  });

  // Guardrail sweep across ALL user-visible strings (defense in depth).
  assertNoForbidden(
    cards.flatMap((c) => [
      c.plainExplanation,
      c.nextStep,
      ...c.whyThisResult,
      ...c.missingInfoExplained,
    ]),
    'assessment cards',
  );

  const caseworkerScript = buildCaseworkerScript(normalized);

  return {
    normalized,
    followUps,
    cards,
    caseworkerScript,
    humanHandoffEmphasis: buildHandoffEmphasis(normalized, results),
    evidence: buildEvidence(intake, normalized, results),
    roadmap: buildRoadmap(results, normalized),
    checklist: buildChecklist(results, normalized),
    mode: useReal ? 'real' : 'mock',
  };
}

function buildComparisonRow(r: ProgramResult): ComparisonRow {
  const meta = PROGRAMS[r.programId];
  return {
    helpsWith: meta.helpsWith,
    whyAppeared:
      r.status === 'MAY_QUALIFY'
        ? 'Your inputs fit the typical range.'
        : r.status === 'POSSIBLY_ELIGIBLE_VERIFY'
          ? 'Close call — depends on details to verify.'
          : 'Shown as an alternative path.',
    verify: r.missingInformation[0] ?? 'Official income limits for your state',
    bestNextStep:
      r.nextStepType === 'apply_pathway' ? 'Start official pre-screen'
      : r.nextStepType === 'contact_clinic' ? 'Call a community clinic'
      : r.nextStepType === 'contact_caseworker' ? 'Talk to a caseworker'
      : r.nextStepType === 'urgent_care_help' ? 'Ask about help at intake'
      : 'Gather income records',
  };
}

function buildHandoffEmphasis(n: NormalizedInputs, results: ProgramResult[]): string[] {
  const out: string[] = [];
  if (results.some((r) => r.confidence === 'LOW'))
    out.push('Some results are low confidence — a person should help you verify.');
  if (n.incomeIsUncertain)
    out.push('Your income is variable or unsure, which makes thresholds harder to call.');
  if (results.some((r) => Math.abs(r.thresholdDistance) <= 15))
    out.push('At least one result sits right at a cutoff (a borderline case).');
  if (n.flags.includes('immigration_concern'))
    out.push('You raised a situation-specific concern — rules can vary, so a caseworker should verify privately.');
  if (n.immediateCareNeed)
    out.push('You may need care soon — talk to a person at a clinic or hospital right away.');
  return out;
}

function buildEvidence(
  intake: IntakeAnswers,
  n: NormalizedInputs,
  results: ProgramResult[],
): JudgeEvidence {
  return {
    inputsCollected: {
      state: n.state,
      householdSize: n.householdSize,
      annualIncome: n.annualIncome,
      incomeType: n.incomeType,
      employment: n.employment,
      insurance: n.insurance,
      employerInsuranceOffered: n.employerInsuranceOffered,
      hasDependents: n.hasDependents,
      immediateCareNeed: n.immediateCareNeed,
      freeTextProvided: Boolean(intake.freeText?.trim()),
    },
    aiInterpreted: [
      `Annualized income estimate: $${n.annualIncome.toLocaleString()}${n.incomeIsUncertain ? ' (treated as uncertain)' : ''}.`,
      n.incomeRange ? `Income range used: $${n.incomeRange.low.toLocaleString()}–$${n.incomeRange.high.toLocaleString()}.` : 'Single income figure used.',
      `Ambiguities detected: ${n.flags.length ? n.flags.join(', ') : 'none'}.`,
      n.flags.includes('immigration_concern')
        ? 'Immigration topic detected in free text — routed to human help WITHOUT classifying any status.'
        : 'No immigration status was requested, inferred, or stored.',
    ],
    rulesFired: results.map((r) => ({
      programId: r.programId,
      status: r.status,
      rule: `${PROGRAMS[r.programId].programName}: ${r.reasonCodes.join(' + ')} (FPL distance ${r.thresholdDistance}%, confidence ${CONFIDENCE_HINT[r.confidence]})`,
    })),
    whyShown: results.map(
      (r) => `${PROGRAMS[r.programId].programName} → ${r.status} because inputs [${r.affectedInputs.join(', ')}] drove the threshold comparison.`,
    ),
    refusedToDecide: [
      'Did not declare anyone officially eligible or ineligible.',
      'Did not request, infer, or store immigration status.',
      'Did not give a medical diagnosis or treatment advice.',
      'Did not submit any application or contact any agency.',
      'Did not use real or state-specific legal thresholds (synthetic only).',
    ],
  };
}
