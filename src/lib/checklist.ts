// ─────────────────────────────────────────────────────────────────────────
// Verification checklist (personal action plan) generator
// ─────────────────────────────────────────────────────────────────────────
// Produces a practical, copy/print-ready plan the user can take to a
// caseworker, clinic, or official program. Pure preparation support — it does
// not confirm eligibility. All program text comes from the deterministic
// results; wording is run through the guardrail.
// ─────────────────────────────────────────────────────────────────────────

import type {
  NormalizedInputs,
  ProgramResult,
  VerificationChecklist,
} from '../types';
import { PROGRAMS, REFERRAL_RESOURCES } from '../data/programs';
import { documentsToGather } from './roadmap';
import { sanitizeText } from './guardrail';

const STATUS_LABEL: Record<string, string> = {
  MAY_QUALIFY: 'You may qualify',
  POSSIBLY_ELIGIBLE_VERIFY: 'Possibly eligible — verify',
  LIKELY_NOT_ELIGIBLE_ALTERNATIVE: 'Likely not eligible — alternative',
};

export function buildChecklist(
  results: ProgramResult[],
  n: NormalizedInputs,
): VerificationChecklist {
  const surfaced = results.filter((r) => r.status !== 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE');
  const top = (surfaced.length ? surfaced : results).slice(0, 4);

  const incomeStr = n.incomeRange
    ? `$${n.incomeRange.low.toLocaleString()}–$${n.incomeRange.high.toLocaleString()}/yr (variable)`
    : n.annualIncome
      ? `about $${n.annualIncome.toLocaleString()}/yr`
      : 'still being estimated';

  const situationSummary = sanitizeText(
    `Uninsured/underinsured. Income ${incomeStr}. Household size ${n.flags.includes('missing_household_size') ? 'to confirm' : n.householdSize}. ` +
    `State: ${n.state}. ${n.hasDependents ? 'Has dependents. ' : ''}${n.immediateCareNeed ? 'Needs care soon. ' : ''}` +
    `${n.incomeIsUncertain ? 'Income varies month to month.' : ''}`,
  ).clean.trim();

  const topOptions = top.map((r) => ({
    name: PROGRAMS[r.programId].programName,
    status: STATUS_LABEL[r.status],
    why: r.status === 'MAY_QUALIFY' ? 'Your inputs fit the typical range.'
      : r.status === 'POSSIBLY_ELIGIBLE_VERIFY' ? 'A close call that depends on details to verify.'
      : 'Shown as an alternative option.',
  }));

  // De-duplicated missing info across surfaced programs.
  const missingSet = new Set<string>();
  top.forEach((r) => r.missingInformation.forEach((m) => missingSet.add(m)));
  const missingInfo = Array.from(missingSet);

  const documentsToGatherList = documentsToGather(n);

  const officialStartingPoints = dedupeLinks([
    ...top.map((r) => PROGRAMS[r.programId].officialSource),
    REFERRAL_RESOURCES.benefits,
    REFERRAL_RESOURCES.twoOneOne,
    REFERRAL_RESOURCES.findHealthCenter,
  ]);

  const questionsForCaseworker = [
    'How is my income counted if it changes month to month?',
    'How do you count my household size for this program?',
    `What are the income limits for these programs in ${n.state !== 'Not provided' ? n.state : 'my state'}?`,
    'Which documents do I need to verify income and household?',
    n.immediateCareNeed ? 'I need care soon — what can help me right away?' : 'How long does verification and enrollment usually take?',
  ];

  const caseworkerScript = buildScriptFromInputs(n);

  const plainText = assemblePlainText({
    situationSummary, topOptions, missingInfo,
    documentsToGather: documentsToGatherList, officialStartingPoints,
    questionsForCaseworker, caseworkerScript,
  });

  return {
    situationSummary,
    topOptions,
    missingInfo,
    documentsToGather: documentsToGatherList,
    officialStartingPoints,
    questionsForCaseworker,
    caseworkerScript,
    plainText,
  };
}

function buildScriptFromInputs(n: NormalizedInputs): string {
  const income = n.incomeRange
    ? `between $${n.incomeRange.low.toLocaleString()} and $${n.incomeRange.high.toLocaleString()} a year`
    : n.annualIncome ? `about $${n.annualIncome.toLocaleString()} a year` : 'something I’m still estimating';
  const household = n.flags.includes('missing_household_size') ? 'something I need to confirm' : `${n.householdSize}`;
  const unsure = n.incomeIsUncertain ? 'my income changes month to month'
    : n.flags.includes('immigration_concern') ? 'which rules apply to my specific situation'
    : 'which programs I should check first';
  return sanitizeText(
    `Hi, I’m uninsured or underinsured and trying to understand what healthcare support I may be able to apply for. ` +
    `My income is ${income}, my household size is ${household}, and I’m unsure about ${unsure}. ` +
    `Can you help me verify which programs I should check?`,
  ).clean;
}

function dedupeLinks(links: { label: string; url: string }[]): { label: string; url: string }[] {
  const seen = new Set<string>();
  return links.filter((l) => (seen.has(l.url) ? false : (seen.add(l.url), true)));
}

function assemblePlainText(c: Omit<VerificationChecklist, 'plainText'>): string {
  const lines: string[] = [];
  lines.push('CAREPATH NAVIGATOR — MY VERIFICATION CHECKLIST');
  lines.push('(Decision support only. This does NOT confirm eligibility.)');
  lines.push('');
  lines.push('MY SITUATION');
  lines.push('  ' + c.situationSummary);
  lines.push('');
  lines.push('TOP OPTIONS TO VERIFY');
  c.topOptions.forEach((o) => lines.push(`  [ ] ${o.name} — ${o.status}\n        Why it appeared: ${o.why}`));
  lines.push('');
  lines.push('INFORMATION STILL TO CHECK');
  (c.missingInfo.length ? c.missingInfo : ['Nothing flagged — still verify with an official source.']).forEach((m) => lines.push(`  [ ] ${m}`));
  lines.push('');
  lines.push('DOCUMENTS / DETAILS TO GATHER');
  c.documentsToGather.forEach((d) => lines.push(`  [ ] ${d}`));
  lines.push('');
  lines.push('OFFICIAL VERIFICATION STARTING POINTS (not proof of eligibility)');
  c.officialStartingPoints.forEach((s) => lines.push(`  - ${s.label}: ${s.url}`));
  lines.push('');
  lines.push('QUESTIONS TO ASK A CASEWORKER');
  c.questionsForCaseworker.forEach((q) => lines.push(`  - ${q}`));
  lines.push('');
  lines.push('SCRIPT I CAN READ OR SEND');
  lines.push('  "' + c.caseworkerScript + '"');
  lines.push('');
  lines.push('Reminder: Only the program or agency can confirm eligibility.');
  return lines.join('\n');
}
