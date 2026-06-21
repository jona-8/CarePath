import type { Assessment } from '../types';
import { SectionHead, Card } from './ui';

export function VerificationRoadmap({
  assessment,
  onTalkToPerson,
}: {
  assessment: Assessment;
  onTalkToPerson: () => void;
}) {
  const { roadmap } = assessment;

  return (
    <section>
      <SectionHead
        eyebrow="A plan you can act on"
        title="Your verification roadmap"
        sub="What to do next, what to prepare, and what to verify before applying."
      />

      {/* Responsible-AI note */}
      <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-teal-100 bg-teal-50/60 p-3.5">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <p className="text-[13px] leading-relaxed text-slate2">
          This roadmap helps you prepare for verification. It does not confirm eligibility, submit an
          application, or replace an official program decision.
        </p>
      </div>

      {/* Warnings for low-confidence / missing-info cases */}
      {(roadmap.lowConfidence || roadmap.missingInfo) && (
        <div className="mb-5 rounded-lg border border-amber-400/40 bg-amber-50 p-3.5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-600">Extra care needed</p>
          <p className="mt-1 text-[13px] text-ink">
            {roadmap.lowConfidence && 'Some results are low confidence. '}
            {roadmap.missingInfo && 'Some information is missing or uncertain. '}
            Consider talking to a real person before relying on any result.
          </p>
        </div>
      )}

      {/* Suggested first verification step — highlighted */}
      <Card className="mb-6 border-teal-200 p-5 ring-1 ring-teal-500/30">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">Suggested first verification step</p>
            <h3 className="mt-0.5 font-display text-lg text-ink">{roadmap.suggestedFirstStep.label}</h3>
            <p className="mt-1 text-[13px] text-slate2">{roadmap.suggestedFirstStep.detail}</p>
            <a
              href={roadmap.suggestedFirstStep.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-700"
            >
              Open verification starting point
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3h6v6h-2V6.4l-7.3 7.3-1.4-1.4L13.6 5H11V3zM5 5h3v2H5v8h8v-3h2v5H3V5h2z"/></svg>
            </a>
          </div>
        </div>
      </Card>

      {/* Staged checklist timeline */}
      <div className="relative space-y-4 border-l-2 border-teal-100 pl-6">
        {roadmap.stages.map((stage, idx) => (
          <div key={stage.id} className="relative">
            <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">
              {idx + 1}
            </span>
            <Card className={`p-4 ${stage.tone === 'warn' ? 'border-amber-400/30 bg-amber-50/40' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-display text-[17px] text-ink">{stage.title}</h4>
                <span className="text-[12px] text-slate2">{stage.purpose}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {stage.steps.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink">
                    <span className={`mt-0.5 ${stage.tone === 'warn' ? 'text-amber-600' : 'text-teal-500'}`}>&#9744;</span>
                    {s}
                  </li>
                ))}
              </ul>
              {stage.id === 'now' && (
                <button
                  onClick={onTalkToPerson}
                  className="mt-3 rounded-lg border border-teal-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-50"
                >
                  Jump to &ldquo;Talk to a real person&rdquo;
                </button>
              )}
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
