// ─────────────────────────────────────────────────────────────────────────
// SYNTHETIC DEMO DATA — NOT REAL OR AUTHORITATIVE LAW
// ─────────────────────────────────────────────────────────────────────────
// Every number below is a SIMPLIFIED, SYNTHETIC value created solely for a
// hackathon demonstration. They are loosely *inspired* by the shape of real
// U.S. Federal Poverty Level (FPL) guidelines (a base amount plus a per-person
// increment) but are rounded, generalized, and NOT state-specific. They do
// not reflect current law, do not vary by state (real Medicaid does), and
// must never be presented to a user as a real eligibility determination.
//
// HOW THE SYNTHETIC FPL TABLE WAS CREATED:
//   base (household of 1) = $15,000  (round synthetic anchor)
//   each additional person = +$5,300 (round synthetic increment)
//   FPL(n) = 15000 + (n - 1) * 5300
// These two round numbers were chosen to be memorable and obviously synthetic.
// Program ceilings below are expressed as a PERCENT OF this synthetic FPL,
// echoing how real programs express limits (e.g. "138% FPL", "400% FPL"),
// again with simplified round percentages.
// ─────────────────────────────────────────────────────────────────────────

export const SYNTHETIC_FPL_BASE = 15000;          // synthetic, household of 1
export const SYNTHETIC_FPL_PER_PERSON = 5300;      // synthetic increment

/** Synthetic Federal-Poverty-Level-style figure for a household size. */
export function syntheticFpl(householdSize: number): number {
  const n = Math.max(1, householdSize);
  return SYNTHETIC_FPL_BASE + (n - 1) * SYNTHETIC_FPL_PER_PERSON;
}

/** Annual income as a percent of the synthetic FPL for a household. */
export function fplPercent(annualIncome: number, householdSize: number): number {
  return Math.round((annualIncome / syntheticFpl(householdSize)) * 100);
}

export interface ProgramMeta {
  programId: string;
  programName: string;
  /** Synthetic % FPL ceiling that maps to a "may qualify" pathway. */
  fplCeiling: number;
  /** % FPL above ceiling still treated as borderline / verify. */
  borderlineBand: number;
  helpsWith: string;
  officialSource: { label: string; url: string };
  /** Short jargon glossary attached to this program. */
  glossary: { term: string; definition: string }[];
}

// Generic, stable verification links. Labelled in the UI as starting points
// for verification — NOT proof of eligibility.
export const PROGRAMS: Record<string, ProgramMeta> = {
  medicaid: {
    programId: 'medicaid',
    programName: 'Medicaid-style coverage',
    fplCeiling: 138, // synthetic, echoes common expansion figure
    borderlineBand: 20,
    helpsWith: 'Low-cost or no-cost comprehensive health coverage.',
    officialSource: { label: 'Medicaid.gov', url: 'https://www.medicaid.gov/' },
    glossary: [
      { term: 'Medicaid', definition: 'A joint federal-state program that provides health coverage to people with limited income. Rules differ by state.' },
      { term: 'Household size', definition: 'Generally the people you list together on a tax return — it affects income limits.' },
    ],
  },
  aca: {
    programId: 'aca',
    programName: 'ACA Marketplace subsidies',
    fplCeiling: 400, // synthetic, echoes common subsidy reference point
    borderlineBand: 50,
    helpsWith: 'Discounts (premium tax credits) on private Marketplace plans.',
    officialSource: { label: 'HealthCare.gov', url: 'https://www.healthcare.gov/' },
    glossary: [
      { term: 'Premium tax credit', definition: 'A subsidy that lowers your monthly insurance payment on a Marketplace plan, based on income and household size.' },
      { term: 'Marketplace', definition: 'A government website where you can compare and buy private health plans, sometimes with subsidies.' },
      { term: 'Premium', definition: 'The amount you pay each month to keep an insurance plan active.' },
    ],
  },
  chc: {
    programId: 'chc',
    programName: 'Community health center sliding-scale care',
    fplCeiling: 200, // synthetic
    borderlineBand: 100, // sliding scale extends well up; mostly always an option
    helpsWith: 'In-person checkups and care priced on a sliding scale by income.',
    officialSource: { label: 'Find a Health Center (HRSA)', url: 'https://findahealthcenter.hrsa.gov/' },
    glossary: [
      { term: 'Sliding scale', definition: 'A discount system where the amount you pay goes down as your income goes down.' },
      { term: 'Community health center', definition: 'A local clinic that serves everyone, including people without insurance, often at reduced cost.' },
    ],
  },
  hospital: {
    programId: 'hospital',
    programName: 'Hospital financial assistance / charity care',
    fplCeiling: 250, // synthetic
    borderlineBand: 150,
    helpsWith: 'Reduced or forgiven hospital bills for qualifying patients.',
    officialSource: { label: 'Benefits.gov', url: 'https://www.benefits.gov/' },
    glossary: [
      { term: 'Charity care', definition: 'A hospital program that reduces or cancels bills for patients who cannot afford to pay.' },
      { term: 'Financial assistance policy', definition: 'A hospital’s written rules for who can get discounted or free care.' },
    ],
  },
  chip: {
    programId: 'chip',
    programName: 'CHIP (children’s coverage)',
    fplCeiling: 250, // synthetic
    borderlineBand: 50,
    helpsWith: 'Low-cost health coverage for children when income is modest.',
    officialSource: { label: 'Medicaid.gov — CHIP', url: 'https://www.medicaid.gov/chip/' },
    glossary: [
      { term: 'CHIP', definition: 'The Children’s Health Insurance Program — covers kids in families that earn too much for Medicaid but still need help.' },
    ],
  },
  emergency_medicaid: {
    programId: 'emergency_medicaid',
    programName: 'Emergency Medicaid (informational)',
    fplCeiling: 138, // synthetic; same income shape as Medicaid
    borderlineBand: 100,
    helpsWith: 'Coverage for emergency-only care for some who don’t qualify for full Medicaid.',
    officialSource: { label: 'Medicaid.gov', url: 'https://www.medicaid.gov/' },
    glossary: [
      { term: 'Emergency Medicaid', definition: 'A limited program that may pay for emergency care for some people who are not eligible for full Medicaid. Eligibility depends on factors a person should verify privately with an official source or caseworker.' },
    ],
  },
};

// Generic referral resources shown app-wide.
export const REFERRAL_RESOURCES = {
  benefits: { label: 'Benefits.gov', url: 'https://www.benefits.gov/' },
  twoOneOne: { label: '211 referral service', url: 'https://www.211.org/' },
  findHealthCenter: { label: 'Find a Health Center (HRSA)', url: 'https://findahealthcenter.hrsa.gov/' },
};
