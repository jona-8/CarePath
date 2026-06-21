// ─────────────────────────────────────────────────────────────────────────
// Deterministic eligibility rules engine
// ─────────────────────────────────────────────────────────────────────────
// This file, and ONLY this file, decides verdict labels (status) and
// confidence. It is fully deterministic and auditable: same inputs -> same
// output, every time. The NLP/LLM layer may explain these results in plain
// language but may NEVER change a status or confidence value.
//
// All thresholds come from SYNTHETIC data (see data/programs.ts). They are
// simplified, not state-specific, and not real law.
// ─────────────────────────────────────────────────────────────────────────

import type {
  NormalizedInputs,
  ProgramResult,
  ProgramStatus,
  Confidence,
} from '../types';
import { PROGRAMS, fplPercent } from '../data/programs';

// Placeholder filled by the post-pass below; keeps the 6 construction sites tidy.
const EMPTY_FACTORS = { raised: [] as string[], lowered: [] as string[] };

/** Run the full deterministic assessment. Returns one result per program. */
export function runRulesEngine(n: NormalizedInputs): ProgramResult[] {
  const pct = fplPercent(n.annualIncome, n.householdSize);
  const results: ProgramResult[] = [];

  // ── 1. Medicaid-style coverage ────────────────────────────────────────
  results.push(
    incomeCeilingProgram('medicaid', n, pct, {
      affectedInputs: ['annualIncome', 'householdSize', 'insurance'],
      baseReasons: n.insurance === 'uninsured' ? ['REASON_UNINSURED'] : [],
    }),
  );

  // ── 2. ACA Marketplace subsidies ──────────────────────────────────────
  // Most relevant when income is above Medicaid range and no employer plan.
  {
    const meta = PROGRAMS.aca;
    const distance = pct - meta.fplCeiling;
    let status: ProgramStatus;
    const reasons: string[] = [];
    // Below the ACA ceiling AND above the Medicaid ceiling = strong subsidy zone.
    if (pct <= meta.fplCeiling && pct > PROGRAMS.medicaid.fplCeiling) {
      status = 'MAY_QUALIFY';
      reasons.push('REASON_SUBSIDY_INCOME_BAND');
    } else if (pct <= meta.fplCeiling) {
      // Income low enough for ACA too, but Medicaid likely fits better.
      status = 'POSSIBLY_ELIGIBLE_VERIFY';
      reasons.push('REASON_LOWER_COST_OPTION_FIRST');
    } else if (distance <= meta.borderlineBand) {
      status = 'POSSIBLY_ELIGIBLE_VERIFY';
      reasons.push('REASON_NEAR_THRESHOLD');
    } else {
      status = 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE';
      reasons.push('REASON_INCOME_ABOVE_LIMIT');
    }
    if (n.employerInsuranceOffered === 'yes') reasons.push('REASON_EMPLOYER_PLAN_OFFERED');
    if (n.employerInsuranceOffered === 'no') reasons.push('REASON_NO_EMPLOYER_PLAN');
    results.push({
      programId: meta.programId,
      programName: meta.programName,
      status,
      confidence: scoreConfidence(n, Math.abs(distance), status),
      reasonCodes: reasons,
      thresholdDistance: distance,
      missingInformation: baseMissingInfo(n),
      affectedInputs: ['annualIncome', 'householdSize', 'employerInsuranceOffered'],
      nextStepType: status === 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE' ? 'contact_clinic' : 'apply_pathway',
      confidenceFactors: EMPTY_FACTORS,
    });
  }

  // ── 3. Community health center sliding scale ──────────────────────────
  // Almost always available; cost scales with income. Frame as a reliable
  // fallback option rather than an income gate.
  {
    const meta = PROGRAMS.chc;
    const distance = pct - meta.fplCeiling;
    const status: ProgramStatus =
      pct <= meta.fplCeiling ? 'MAY_QUALIFY' : 'POSSIBLY_ELIGIBLE_VERIFY';
    results.push({
      programId: meta.programId,
      programName: meta.programName,
      status,
      confidence: pct <= meta.fplCeiling ? 'HIGH' : 'MEDIUM',
      reasonCodes: ['REASON_SLIDING_SCALE_OPEN', ...(n.insurance === 'uninsured' ? ['REASON_UNINSURED'] : [])],
      thresholdDistance: distance,
      missingInformation: [],
      affectedInputs: ['annualIncome', 'insurance'],
      nextStepType: 'contact_clinic',
      confidenceFactors: EMPTY_FACTORS,
    });
  }

  // ── 4. Hospital financial assistance / charity care ───────────────────
  {
    const meta = PROGRAMS.hospital;
    const distance = pct - meta.fplCeiling;
    let status: ProgramStatus;
    const reasons: string[] = [];
    if (n.immediateCareNeed) {
      status = 'MAY_QUALIFY';
      reasons.push('REASON_IMMEDIATE_NEED');
    } else if (pct <= meta.fplCeiling) {
      status = 'POSSIBLY_ELIGIBLE_VERIFY';
      reasons.push('REASON_INCOME_WITHIN_RANGE');
    } else {
      status = 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE';
      reasons.push('REASON_INCOME_ABOVE_LIMIT');
    }
    results.push({
      programId: meta.programId,
      programName: meta.programName,
      status,
      confidence: n.immediateCareNeed ? 'MEDIUM' : scoreConfidence(n, Math.abs(distance), status),
      reasonCodes: reasons,
      thresholdDistance: distance,
      missingInformation: ['Specific hospital’s financial assistance policy'],
      affectedInputs: ['annualIncome', 'immediateCareNeed'],
      nextStepType: n.immediateCareNeed ? 'urgent_care_help' : 'gather_documents',
      confidenceFactors: EMPTY_FACTORS,
    });
  }

  // ── 5. CHIP — ONLY when dependents are reported ───────────────────────
  if (n.hasDependents) {
    const meta = PROGRAMS.chip;
    const distance = pct - meta.fplCeiling;
    let status: ProgramStatus;
    if (pct <= meta.fplCeiling) status = 'MAY_QUALIFY';
    else if (distance <= meta.borderlineBand) status = 'POSSIBLY_ELIGIBLE_VERIFY';
    else status = 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE';
    results.push({
      programId: meta.programId,
      programName: meta.programName,
      status,
      confidence: scoreConfidence(n, Math.abs(distance), status),
      reasonCodes: ['REASON_HAS_DEPENDENTS', 'REASON_CHILD_HIGHER_LIMITS'],
      thresholdDistance: distance,
      missingInformation: ['Number and ages of children', 'Household income for the year'],
      affectedInputs: ['dependents', 'dependentCount', 'annualIncome', 'householdSize'],
      nextStepType: 'apply_pathway',
      confidenceFactors: EMPTY_FACTORS,
    });
  }

  // ── 6. Emergency Medicaid — INFORMATIONAL only ────────────────────────
  // Surfaced only when an immediate need OR an immigration-related concern was
  // raised. We present it as informational and route to human verification.
  // We do NOT assess immigration status — eligibility here depends on factors
  // the app intentionally refuses to evaluate.
  if (n.immediateCareNeed || n.flags.includes('immigration_concern')) {
    const meta = PROGRAMS.emergency_medicaid;
    results.push({
      programId: meta.programId,
      programName: meta.programName,
      status: 'POSSIBLY_ELIGIBLE_VERIFY',
      confidence: 'LOW', // we deliberately do not have enough info to be sure
      reasonCodes: [
        ...(n.immediateCareNeed ? ['REASON_IMMEDIATE_NEED'] : []),
        ...(n.flags.includes('immigration_concern') ? ['REASON_STATUS_SPECIFIC_RULES'] : []),
        'REASON_INFORMATIONAL_ONLY',
      ],
      thresholdDistance: 0,
      missingInformation: ['Verification with an official source or caseworker (rules can be situation-specific)'],
      affectedInputs: n.immediateCareNeed ? ['immediateCareNeed'] : ['freeText'],
      nextStepType: 'contact_caseworker',
      confidenceFactors: EMPTY_FACTORS,
    });
  }

  // Attach a transparent confidence breakdown to every result. Centralizing
  // this keeps the six construction sites simple and guarantees the breakdown
  // always matches the score that scoreConfidence() produced.
  for (const r of results) {
    r.confidenceFactors = computeConfidenceFactors(n, Math.abs(r.thresholdDistance), r.status);
  }

  return results;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function incomeCeilingProgram(
  programId: 'medicaid',
  n: NormalizedInputs,
  pct: number,
  extra: { affectedInputs: string[]; baseReasons: string[] },
): ProgramResult {
  const meta = PROGRAMS[programId];
  const distance = pct - meta.fplCeiling;
  let status: ProgramStatus;
  const reasons = [...extra.baseReasons];

  if (pct <= meta.fplCeiling) {
    status = 'MAY_QUALIFY';
    reasons.push('REASON_INCOME_WITHIN_RANGE');
  } else if (distance <= meta.borderlineBand) {
    status = 'POSSIBLY_ELIGIBLE_VERIFY';
    reasons.push('REASON_NEAR_THRESHOLD');
  } else {
    status = 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE';
    reasons.push('REASON_INCOME_ABOVE_LIMIT');
  }

  return {
    programId: meta.programId,
    programName: meta.programName,
    status,
    confidence: scoreConfidence(n, Math.abs(distance), status),
    reasonCodes: reasons,
    thresholdDistance: distance,
    missingInformation: baseMissingInfo(n),
    affectedInputs: extra.affectedInputs,
    nextStepType:
      status === 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE' ? 'contact_clinic' : 'apply_pathway',
    confidenceFactors: EMPTY_FACTORS,
  };
}

/**
 * Confidence is LOWER when income is uncertain, household was missing, or the
 * result sits close to a threshold. This makes uncertainty visible rather than
 * hiding it behind a single number — central to the responsible-AI design.
 */
function scoreConfidence(
  n: NormalizedInputs,
  absDistance: number,
  status: ProgramStatus,
): Confidence {
  let score = 2; // start at MEDIUM
  if (absDistance >= 40) score += 1;          // comfortably clear of threshold
  if (absDistance <= 15) score -= 1;          // borderline
  if (n.incomeIsUncertain) score -= 1;        // variable / unsure income
  if (n.flags.includes('missing_household_size')) score -= 1;
  if (status === 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE' && absDistance >= 60) score += 1;

  if (score >= 3) return 'HIGH';
  if (score <= 1) return 'LOW';
  return 'MEDIUM';
}

/**
 * Transparent, human-readable breakdown of WHY a confidence level was reached.
 * Mirrors the scoring logic in scoreConfidence so the two never drift.
 */
function computeConfidenceFactors(
  n: NormalizedInputs,
  absDistance: number,
  status: ProgramStatus,
): { raised: string[]; lowered: string[] } {
  const raised: string[] = [];
  const lowered: string[] = [];

  if (absDistance >= 40) raised.push('Your income is comfortably clear of the synthetic cutoff for this option.');
  if (absDistance <= 15) lowered.push('Your income sits close to the synthetic cutoff, so this is a borderline case.');
  if (n.incomeIsUncertain) lowered.push('Your income is variable or unsure, which makes any threshold harder to call.');
  if (n.flags.includes('missing_household_size')) lowered.push('Household size was missing, and it sets the income limit.');
  if (status === 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE' && absDistance >= 60)
    raised.push('Your income is well above this limit, so an alternative is the clearer path.');

  // Always-present honesty note.
  lowered.push('State-specific rules still need to be verified (this prototype is not state-specific).');

  if (raised.length === 0)
    raised.push('Your structured intake answers were complete enough to produce a result.');

  return { raised, lowered };
}

function baseMissingInfo(n: NormalizedInputs): string[] {
  const out: string[] = [];
  if (n.incomeIsUncertain) out.push('A steadier estimate of your yearly income');
  if (n.flags.includes('missing_household_size')) out.push('Your household size');
  out.push('State-specific income limits (these vary by state)');
  return out;
}
