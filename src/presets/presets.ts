// ─────────────────────────────────────────────────────────────────────────
// Judge Demo Mode presets — four one-click scenarios.
// Each fully populates the intake so the demo runs end-to-end.
// ─────────────────────────────────────────────────────────────────────────

import type { IntakeAnswers } from '../types';

export interface Preset {
  id: string;
  label: string;
  blurb: string;
  expected: string;
  answers: IntakeAnswers;
}

const base: IntakeAnswers = {
  state: '',
  householdSize: 1,
  incomeAmount: null,
  incomePeriod: 'annual',
  incomeType: 'steady',
  employment: 'student',
  insurance: 'uninsured',
  employerInsuranceOffered: 'no',
  dependents: 'no',
  dependentCount: null,
  wantsDependentCoverage: null,
  immediateCareNeed: 'no',
  avgMonthlyIncomeLow: null,
  avgMonthlyIncomeHigh: null,
  lastMonthTypical: null,
  freeText: '',
};

export const PRESETS: Preset[] = [
  {
    id: 'A',
    label: 'College student, low part-time income',
    blurb: 'Part-time job, no dependents, uninsured.',
    expected: 'Medicaid-style support + sliding-scale clinic likely surface as "may qualify".',
    answers: {
      ...base,
      state: 'Ohio',
      householdSize: 1,
      incomeAmount: 1100,
      incomePeriod: 'monthly',
      incomeType: 'part_time',
      employment: 'part_time',
      insurance: 'uninsured',
      employerInsuranceOffered: 'no',
    },
  },
  {
    id: 'B',
    label: 'Gig worker, variable income near threshold',
    blurb: 'The flagship demo: income swings month to month and sits near a cutoff. Best shows AI reasoning, uncertainty, and responsible AI.',
    expected: 'Detects ambiguity, annualizes a variable range, lowers confidence, surfaces missing info, routes the first step to a caseworker, and frames everything as verification.',
    answers: {
      ...base,
      state: 'Texas',
      householdSize: 1,
      incomeAmount: null,
      incomePeriod: 'monthly',
      incomeType: 'gig_variable',
      employment: 'gig',
      insurance: 'uninsured',
      employerInsuranceOffered: 'no',
      avgMonthlyIncomeLow: 1300,
      avgMonthlyIncomeHigh: 2100,
      lastMonthTypical: 'no',
      freeText: 'I drive for delivery apps. Some weeks are great, some are nothing.',
    },
  },
  {
    id: 'C',
    label: 'Recent grad, moderate income, no employer plan',
    blurb: 'New job-hunting grad earning a moderate amount, no employer coverage.',
    expected: 'ACA Marketplace subsidy pathway surfaces; premium tax credits explained in plain language.',
    answers: {
      ...base,
      state: 'Colorado',
      householdSize: 1,
      incomeAmount: 38000,
      incomePeriod: 'annual',
      incomeType: 'steady',
      employment: 'full_time',
      insurance: 'uninsured',
      employerInsuranceOffered: 'no',
    },
  },
  {
    id: 'D',
    label: 'User with an immigration-related concern',
    blurb: 'Raises a status-specific worry in free text.',
    expected: 'App never asks status; shows informational guidance incl. Emergency Medicaid; routes to human verification.',
    answers: {
      ...base,
      state: 'Arizona',
      householdSize: 2,
      incomeAmount: 1400,
      incomePeriod: 'monthly',
      incomeType: 'part_time',
      employment: 'part_time',
      insurance: 'uninsured',
      employerInsuranceOffered: 'no',
      dependents: 'no',
      immediateCareNeed: 'no',
      freeText: 'I am worried because of my immigration situation and not sure what I can use.',
    },
  },
];
