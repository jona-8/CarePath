// ─────────────────────────────────────────────────────────────────────────
// CarePath Navigator — shared types
// These types are the contract between the intake, the NLP layer, the
// deterministic rules engine, and the UI. Both Mock AI Mode and Real LLM
// Mode MUST produce the same shapes so the UI never has to branch on mode.
// ─────────────────────────────────────────────────────────────────────────

export type IncomeType =
  | 'steady'
  | 'part_time'
  | 'gig_variable'
  | 'unemployed'
  | 'not_sure';

export type EmploymentStatus =
  | 'full_time'
  | 'part_time'
  | 'gig'
  | 'student'
  | 'unemployed'
  | 'not_sure';

export type InsuranceStatus =
  | 'uninsured'
  | 'underinsured'
  | 'insured'
  | 'not_sure';

export type YesNoUnsure = 'yes' | 'no' | 'not_sure';

/** Raw answers collected by the guided intake (pre-normalization). */
export interface IntakeAnswers {
  state: string;
  householdSize: number | null;
  incomeAmount: number | null;          // user-entered number
  incomePeriod: 'monthly' | 'annual';   // how they entered it
  incomeType: IncomeType;
  employment: EmploymentStatus;
  insurance: InsuranceStatus;
  employerInsuranceOffered: YesNoUnsure;
  dependents: YesNoUnsure;
  dependentCount: number | null;
  wantsDependentCoverage: YesNoUnsure | null;
  immediateCareNeed: YesNoUnsure;
  // conditional follow-ups for variable income
  avgMonthlyIncomeLow: number | null;
  avgMonthlyIncomeHigh: number | null;
  lastMonthTypical: YesNoUnsure | null;
  // optional free text
  freeText: string;
}

/**
 * Normalized inputs produced by the NLP layer BEFORE the rules engine runs.
 * Messy/ambiguous real-life descriptions are turned into clean fields plus
 * a list of detected ambiguities the engine and UI can react to.
 */
export interface NormalizedInputs {
  state: string;
  householdSize: number;
  annualIncome: number;            // best-estimate annualized income
  incomeIsUncertain: boolean;      // variable / unsure / range provided
  incomeRange: { low: number; high: number } | null; // annualized range
  incomeType: IncomeType;
  employment: EmploymentStatus;
  insurance: InsuranceStatus;
  employerInsuranceOffered: YesNoUnsure;
  hasDependents: boolean;
  dependentCount: number;
  wantsDependentCoverage: boolean;
  immediateCareNeed: boolean;
  flags: AmbiguityFlag[];
}

/** Ambiguities/situations the NLP layer detects from intake + free text. */
export type AmbiguityFlag =
  | 'variable_income'
  | 'unsure_income'
  | 'missing_household_size'
  | 'immediate_need'
  | 'no_insurance'
  | 'no_employer_coverage'
  | 'has_dependents'
  | 'immigration_concern'      // detected ONLY to route to human help;
                               // status is NEVER classified or stored.
  | 'near_threshold';

/** A follow-up question the NLP layer wants answered before/within intake. */
export interface FollowUpQuestion {
  id: string;
  prompt: string;
  reason: string;
}

// ── Rules engine output ────────────────────────────────────────────────────

export type ProgramStatus =
  | 'MAY_QUALIFY'
  | 'POSSIBLY_ELIGIBLE_VERIFY'
  | 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type NextStepType =
  | 'apply_pathway'
  | 'verify_income'
  | 'contact_clinic'
  | 'contact_caseworker'
  | 'urgent_care_help'
  | 'gather_documents';

export interface ProgramResult {
  programId: string;
  programName: string;
  status: ProgramStatus;       // FIXED by rules engine — never by the LLM
  confidence: Confidence;
  reasonCodes: string[];       // machine codes; mapped to plain text by NLP
  thresholdDistance: number;   // % of FPL relative to the program ceiling
  missingInformation: string[];
  affectedInputs: string[];    // which intake fields drove this result
  nextStepType: NextStepType;
  confidenceFactors: ConfidenceFactors; // why this confidence level
}

/** Transparent breakdown of how the confidence score was reached. */
export interface ConfidenceFactors {
  raised: string[];   // things that increased confidence
  lowered: string[];  // things that decreased confidence
}

// ── NLP explanation layer output (AFTER rules) ──────────────────────────────

export interface ProgramExplanation {
  programId: string;
  plainExplanation: string;       // why this result, in plain language
  whyThisResult: string[];        // bullet reasons tied to inputs
  missingInfoExplained: string[]; // friendly version of missingInformation
  nextStep: string;               // one concrete action
  glossary: GlossaryTerm[];       // jargon used in this card
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

/** Everything the UI needs for one program card. */
export interface ProgramCard extends ProgramResult, ProgramExplanation {
  comparison: ComparisonRow;
}

export interface ComparisonRow {
  helpsWith: string;
  whyAppeared: string;
  verify: string;
  bestNextStep: string;
}

/** Full assessment object handed to the dashboard. */
export interface Assessment {
  normalized: NormalizedInputs;
  followUps: FollowUpQuestion[];
  cards: ProgramCard[];
  caseworkerScript: string;
  humanHandoffEmphasis: string[]; // reasons human handoff is highlighted
  evidence: JudgeEvidence;
  roadmap: VerificationRoadmap;
  checklist: VerificationChecklist;
  mode: 'mock' | 'real';
}

/** Personalized 5-stage verification roadmap. */
export interface RoadmapStage {
  id: string;
  title: string;
  purpose: string;
  steps: string[];
  tone?: 'normal' | 'warn' | 'highlight';
}
export interface VerificationRoadmap {
  stages: RoadmapStage[];
  suggestedFirstStep: { label: string; detail: string; url: string };
  lowConfidence: boolean;
  missingInfo: boolean;
}

/** Copy/print-ready personal action plan. */
export interface VerificationChecklist {
  situationSummary: string;
  topOptions: { name: string; status: string; why: string }[];
  missingInfo: string[];
  documentsToGather: string[];
  officialStartingPoints: { label: string; url: string }[];
  questionsForCaseworker: string[];
  caseworkerScript: string;
  plainText: string; // assembled copy/print version
}

/** "Evidence for judges" transparency object. */
export interface JudgeEvidence {
  inputsCollected: Record<string, unknown>;
  aiInterpreted: string[];
  rulesFired: { programId: string; status: ProgramStatus; rule: string }[];
  whyShown: string[];
  refusedToDecide: string[];
}
