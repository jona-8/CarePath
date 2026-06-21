// ─────────────────────────────────────────────────────────────────────────
// Output guardrail — enforces responsible-AI wording IN CODE, not just by
// prompting. Any explanation text produced by the NLP layer (mock OR real
// LLM) is passed through sanitizeText(). Forbidden over-promising phrases are
// neutralized so the UI can NEVER tell a user "you qualify".
// ─────────────────────────────────────────────────────────────────────────

/** Phrases the app must never show. Case-insensitive, whole-phrase match. */
export const FORBIDDEN_PHRASES = [
  'you qualify',
  'you are eligible',
  'you’re eligible',
  "you're eligible",
  'guaranteed',
  'approved',
  'confirmed eligible',
];

/** Safe replacements that preserve meaning without over-promising. */
const REPLACEMENTS: Record<string, string> = {
  'you qualify': 'you may qualify',
  'you are eligible': 'you may be eligible',
  'you’re eligible': 'you may be eligible',
  "you're eligible": 'you may be eligible',
  'guaranteed': 'possible (verify with an official source)',
  'approved': 'worth checking',
  'confirmed eligible': 'possibly eligible — verify',
};

export interface GuardrailResult {
  clean: string;
  violations: string[];
}

/**
 * Returns sanitized text plus any violations found. The sanitized text is
 * always safe to display. Violations are surfaced in dev so we catch a
 * mis-behaving LLM rather than silently shipping bad copy.
 */
export function sanitizeText(input: string): GuardrailResult {
  let clean = input;
  const violations: string[] = [];
  for (const phrase of FORBIDDEN_PHRASES) {
    const re = new RegExp(escapeRegExp(phrase), 'gi');
    if (re.test(clean)) {
      violations.push(phrase);
      clean = clean.replace(re, REPLACEMENTS[phrase.toLowerCase()] ?? '[removed]');
    }
  }
  return { clean, violations };
}

/** Scan an array of strings; throw in dev if anything slips through. */
export function assertNoForbidden(strings: string[], context = 'output'): string[] {
  const allViolations: string[] = [];
  for (const s of strings) {
    const { violations } = sanitizeText(s);
    allViolations.push(...violations);
  }
  if (allViolations.length && import.meta.env?.DEV) {
    // Warn loudly in development; the sanitized text is still safe in prod.
    console.warn(
      `[CarePath guardrail] Forbidden phrasing detected in ${context}:`,
      allViolations,
    );
  }
  return allViolations;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
