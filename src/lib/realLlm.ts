// ─────────────────────────────────────────────────────────────────────────
// OPTIONAL Real LLM Mode — explanation layer only
// ─────────────────────────────────────────────────────────────────────────
// This module is dormant unless VITE_AI_MODE=real AND a key is present. It
// produces the SAME ProgramExplanation shape as the mock explainer, so the UI
// never branches on mode. If anything is missing or fails, callers fall back
// to Mock AI Mode — the app must NEVER break when no key exists.
//
// Hard rule preserved here too: the LLM only fills explanation/next-step/
// glossary text. It is given the verdict + confidence as FIXED context and is
// instructed never to change them. All output is still run through the
// guardrail by the mock explainer fallback path and by the orchestrator.
// ─────────────────────────────────────────────────────────────────────────

import type { ProgramResult, ProgramExplanation, NormalizedInputs } from '../types';
import { explainResult } from './nlpExplain';
import { sanitizeText } from './guardrail';

export function isRealModeAvailable(): boolean {
  const env = import.meta.env;
  return (
    env?.VITE_AI_MODE === 'real' &&
    typeof env?.VITE_ANTHROPIC_API_KEY === 'string' &&
    env.VITE_ANTHROPIC_API_KEY.length > 0
  );
}

/**
 * Real LLM explanation. Falls back to the deterministic explainer for any
 * program the model fails to return safely. The verdict labels are NEVER
 * sourced from the model.
 */
export async function explainWithRealLlm(
  results: ProgramResult[],
  n: NormalizedInputs,
): Promise<ProgramExplanation[]> {
  try {
    const env = import.meta.env;
    const model = env?.VITE_LLM_MODEL || 'claude-sonnet-4-6';

    const system =
      'You are a plain-language explainer for a healthcare benefits navigator. ' +
      'You will receive eligibility RESULTS that are ALREADY DECIDED by a ' +
      'deterministic rules engine. You must NOT change any status or ' +
      'confidence value. You only write friendly explanations. Never say ' +
      '"you qualify", "you are eligible", "guaranteed", "approved", or ' +
      '"confirmed eligible". Always frame as "may qualify"/"possibly eligible — verify". ' +
      'Return ONLY a JSON array, no prose, no markdown fences. Each item: ' +
      '{ "programId": string, "plainExplanation": string, "whyThisResult": string[], ' +
      '"missingInfoExplained": string[], "nextStep": string }.';

    const user = JSON.stringify({ results, normalized: n });

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!resp.ok) throw new Error(`LLM HTTP ${resp.status}`);
    const data = await resp.json();
    const text: string = (data.content ?? [])
      .map((b: { type: string; text?: string }) => (b.type === 'text' ? b.text : ''))
      .join('')
      .replace(/```json|```/g, '')
      .trim();
    const parsed = JSON.parse(text) as Array<Partial<ProgramExplanation>>;

    // Merge model prose with deterministic glossary + guardrail. Any program
    // the model omitted falls back to the mock explainer entirely.
    return results.map((r) => {
      const fromModel = parsed.find((p) => p.programId === r.programId);
      const fallback = explainResult(r, n);
      if (!fromModel) return fallback;
      return {
        programId: r.programId,
        plainExplanation: sanitizeText(fromModel.plainExplanation ?? fallback.plainExplanation).clean,
        whyThisResult: (fromModel.whyThisResult ?? fallback.whyThisResult).map((s) => sanitizeText(s).clean),
        missingInfoExplained: (fromModel.missingInfoExplained ?? fallback.missingInfoExplained).map((s) => sanitizeText(s).clean),
        nextStep: sanitizeText(fromModel.nextStep ?? fallback.nextStep).clean,
        glossary: fallback.glossary, // glossary stays deterministic/curated
      };
    });
  } catch (err) {
    // Any failure -> safe deterministic fallback. The app never breaks.
    if (import.meta.env?.DEV) console.warn('[CarePath] Real LLM mode failed, using Mock AI Mode:', err);
    return results.map((r) => explainResult(r, n));
  }
}
