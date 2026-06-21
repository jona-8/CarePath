import { useState } from 'react';
import type { Assessment } from '../types';
import { SectionHead, Card } from './ui';

export function TransparencyPanel() {
  const points = [
    'This prototype uses simplified, synthetic eligibility rules — not real or current law.',
    'It does not use live government data.',
    'It is not state-specific or authoritative.',
    'It does not make final eligibility decisions.',
    'It avoids collecting unnecessary sensitive information.',
    'It does not ask for immigration status under any condition.',
    'You should verify everything with official sources or a caseworker.',
  ];
  return (
    <section>
      <SectionHead eyebrow="Be skeptical — on purpose" title="Data & safety transparency" />
      <Card className="p-5 sm:p-6">
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-slate2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM9 11.6l-2.3-2.3-1.4 1.4L9 14.4l6.7-6.7-1.4-1.4z" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

const FLOW = [
  { t: 'Guided intake', d: 'Structured questions adapt to your answers.' },
  { t: 'NLP interpretation', d: 'Messy/variable inputs normalized; ambiguity detected.' },
  { t: 'Rules engine', d: 'Deterministic, auditable thresholds set the verdict label.' },
  { t: 'Confidence scoring', d: 'Uncertainty (variable income, borderline) made visible.' },
  { t: 'Plain-language explanation', d: 'Results explained without changing the verdict.' },
  { t: 'Human verification', d: 'Official sources + caseworker handoff for the final call.' },
];

export function ArchitecturePanel({ assessment }: { assessment: Assessment }) {
  const [showEvidence, setShowEvidence] = useState(false);
  const ev = assessment.evidence;

  return (
    <section>
      <SectionHead
        eyebrow="How this works"
        title="Architecture"
        sub={`Mode: ${assessment.mode === 'mock' ? 'Mock AI Mode (deterministic, no API key)' : 'Real LLM Mode (explanations only)'}. The rules engine — never the language model — decides every verdict label.`}
      />
      <Card className="p-5 sm:p-6">
        <ol className="flex flex-col gap-3 md:flex-row md:items-stretch">
          {FLOW.map((f, i) => (
            <li key={f.t} className="flex flex-1 items-start gap-3 md:flex-col">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-[12px] font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">{f.t}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-slate2">{f.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          onClick={() => setShowEvidence((s) => !s)}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal-700 hover:underline"
          aria-expanded={showEvidence}
        >
          <svg className={`h-4 w-4 transition ${showEvidence ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 5l5 5-5 5V5z" />
          </svg>
          {showEvidence ? 'Hide' : 'Show'} evidence for judges
        </button>

        {showEvidence && (
          <div className="mt-4 grid gap-4 rounded-xl bg-mist p-4 md:grid-cols-2">
            <EvidenceBlock title="Inputs collected">
              <ul className="space-y-1">
                {Object.entries(ev.inputsCollected).map(([k, v]) => (
                  <li key={k} className="text-[12px] text-slate2">
                    <span className="font-semibold text-ink">{k}:</span> {String(v)}
                  </li>
                ))}
              </ul>
            </EvidenceBlock>
            <EvidenceBlock title="What the AI interpreted">
              <ul className="space-y-1 text-[12px] text-slate2">
                {ev.aiInterpreted.map((s, i) => <li key={i}>&bull; {s}</li>)}
              </ul>
            </EvidenceBlock>
            <EvidenceBlock title="Which rules fired">
              <ul className="space-y-1 text-[12px] text-slate2">
                {ev.rulesFired.map((r, i) => (
                  <li key={i}><span className="font-semibold text-ink">{r.status}</span> &mdash; {r.rule}</li>
                ))}
              </ul>
            </EvidenceBlock>
            <EvidenceBlock title="What the app refused to decide">
              <ul className="space-y-1 text-[12px] text-slate2">
                {ev.refusedToDecide.map((s, i) => <li key={i}>&bull; {s}</li>)}
              </ul>
            </EvidenceBlock>
          </div>
        )}
      </Card>
    </section>
  );
}

function EvidenceBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-teal-700">{title}</p>
      {children}
    </div>
  );
}
