// ─────────────────────────────────────────────────────────────────────────
// Verification roadmap generator
// ─────────────────────────────────────────────────────────────────────────
// Turns the deterministic results + normalized inputs into a personalized,
// 5-stage roadmap: Right now → Before contacting anyone → Suggested first
// verification step → This week → Before applying. Everything here is
// preparation guidance and verification framing — it NEVER confirms
// eligibility, submits anything, or replaces an official decision.
// ─────────────────────────────────────────────────────────────────────────

import type {
  NormalizedInputs,
  ProgramResult,
  VerificationRoadmap,
  RoadmapStage,
} from '../types';
import { PROGRAMS, REFERRAL_RESOURCES } from '../data/programs';

export function buildRoadmap(
  results: ProgramResult[],
  n: NormalizedInputs,
): VerificationRoadmap {
  const surfaced = results.filter((r) => r.status !== 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE');
  const lowConfidence = results.some((r) => r.confidence === 'LOW');
  const borderline = results.some((r) => Math.abs(r.thresholdDistance) <= 15);
  const missingInfo = n.incomeIsUncertain || n.flags.includes('missing_household_size');
  const top = surfaced.slice(0, 3);

  // ── Suggested first verification step (cautious wording) ────────────────
  const suggestedFirstStep = pickFirstStep(results, n);

  // ── A. Right now ────────────────────────────────────────────────────────
  const rightNow: string[] = [
    `Review the top ${Math.min(3, top.length || 1)} option${top.length === 1 ? '' : 's'} that appeared and open "Why this result?" on each.`,
    'Check the "to verify" list on each card so you know what is still unknown.',
    'Save or estimate your most recent income (a rough number is fine to start).',
  ];
  if (n.incomeIsUncertain) {
    rightNow.push('Because your income varies, write down a low, average, and high monthly estimate.');
  }
  if (lowConfidence || borderline || n.immediateCareNeed || n.flags.includes('immigration_concern')) {
    rightNow.push('This case is unclear, borderline, or time-sensitive — use the "Talk to a real person" script before relying on any result.');
  }

  // ── B. Before contacting anyone ─────────────────────────────────────────
  const beforeContacting: string[] = ['Confirm your household size (it sets the income limit).'];
  const docs = documentsToGather(n);
  beforeContacting.push(`Gather: ${docs.join('; ')}.`);
  beforeContacting.push('Write down your insurance status and whether a job offers you coverage.');
  beforeContacting.push('Save your verification checklist and copy or print the caseworker script.');
  beforeContacting.push('Prepare questions about how income, household size, and your state’s rules are counted.');

  // ── D. This week ────────────────────────────────────────────────────────
  const thisWeek: string[] = [
    `Verify your state’s specific rules${n.state && n.state !== 'Not provided' ? ` (you selected ${n.state})` : ''} through an official source.`,
  ];
  if (n.incomeIsUncertain) thisWeek.push('Ask exactly how variable or gig income is counted in your state.');
  thisWeek.push('Compare the Marketplace, Medicaid-style, clinic, and hospital-assistance options side by side.');
  thisWeek.push('Contact a caseworker if anything is unclear.');
  thisWeek.push('Do not submit anything based only on this prototype.');

  // ── E. Before applying ──────────────────────────────────────────────────
  const beforeApplying: string[] = [
    'Re-check official sources for the latest rules and limits.',
    'Confirm exactly which documents each program needs.',
    'Confirm your income and household information one more time.',
    'Ask a caseworker or official program representative about anything uncertain.',
    'Remember: this tool does not confirm eligibility.',
  ];

  const stages: RoadmapStage[] = [
    { id: 'now', title: 'Right now', purpose: 'Avoid confusion and know your first action.', steps: rightNow, tone: 'normal' },
    { id: 'before_contact', title: 'Before contacting anyone', purpose: 'Prepare so you don’t feel lost.', steps: beforeContacting, tone: 'normal' },
    { id: 'this_week', title: 'This week', purpose: 'Keep going if the first step isn’t enough.', steps: thisWeek, tone: 'normal' },
    { id: 'before_apply', title: 'Before applying', purpose: 'Protect against over-reliance.', steps: beforeApplying, tone: 'warn' },
  ];

  return { stages, suggestedFirstStep, lowConfidence, missingInfo };
}

/** Choose the cautious "suggested first verification step" from results. */
function pickFirstStep(
  results: ProgramResult[],
  n: NormalizedInputs,
): { label: string; detail: string; url: string } {
  // High-risk / unclear cases go to a human first.
  const lowConfidence = results.some((r) => r.confidence === 'LOW');
  if (n.flags.includes('immigration_concern') || n.incomeIsUncertain || lowConfidence) {
    return {
      label: 'Start with 211 or a local caseworker',
      detail: 'Because your situation is variable, unclear, or situation-specific, a person can help you verify which rules apply before you rely on any result.',
      url: REFERRAL_RESOURCES.twoOneOne.url,
    };
  }
  const has = (id: string) =>
    results.some((r) => r.programId === id && r.status !== 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE');

  if (has('medicaid'))
    return { label: `Start with ${PROGRAMS.medicaid.officialSource.label} or your state Medicaid office`, detail: 'Medicaid-style support surfaced as a possible path. Begin verification here.', url: PROGRAMS.medicaid.officialSource.url };
  if (has('aca'))
    return { label: `Start with ${PROGRAMS.aca.officialSource.label} or your state Marketplace`, detail: 'A Marketplace subsidy pathway surfaced. Begin verification here.', url: PROGRAMS.aca.officialSource.url };
  if (has('chc'))
    return { label: 'Contact a community health center (HRSA Find a Health Center)', detail: 'Sliding-scale clinic care surfaced as a reliable option to verify.', url: PROGRAMS.chc.officialSource.url };
  if (has('hospital'))
    return { label: 'Contact the hospital billing / financial assistance office', detail: 'Hospital financial assistance surfaced. Ask their billing office about their policy.', url: PROGRAMS.hospital.officialSource.url };

  return { label: 'Start with 211 referral support', detail: 'A referral line can point you to the right local starting place.', url: REFERRAL_RESOURCES.twoOneOne.url };
}

/** Documents the user should gather, tailored to their situation. */
export function documentsToGather(n: NormalizedInputs): string[] {
  const docs = ['recent pay stubs or income summary'];
  if (n.incomeType === 'gig_variable' || n.incomeIsUncertain) docs.push('gig/app payment summaries for the last few months', 'bank records showing deposits');
  if (n.employment === 'student') docs.push('student status or enrollment info');
  if (n.hasDependents) docs.push('information for each child or dependent');
  docs.push('a note of your household size');
  return docs;
}
