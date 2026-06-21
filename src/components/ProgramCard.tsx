import { useState } from 'react';
import type { ProgramCard as ProgramCardType } from '../types';
import { PROGRAMS } from '../data/programs';
import { StatusBadge, ConfidencePill, GlossaryTip, Card } from './ui';

export function ProgramCard({
  card,
  onTalkToPerson,
}: {
  card: ProgramCardType;
  onTalkToPerson: () => void;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const meta = PROGRAMS[card.programId];

  return (
    <Card className="rise overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-ink">{card.programName}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={card.status} />
              <ConfidencePill confidence={card.confidence} />
              <button
                onClick={() => setShowConf((s) => !s)}
                className="text-[11px] font-semibold text-teal-700 hover:underline"
                aria-expanded={showConf}
              >
                {showConf ? 'Hide' : 'Why this confidence level?'}
              </button>
            </div>
          </div>
        </div>

        {showConf && (
          <div className="mt-3 rounded-lg border border-black/[0.05] bg-mist p-4">
            <p className="text-[12px] leading-relaxed text-slate2">
              This confidence level reflects how complete and clear your intake information is.
              <strong className="text-ink"> It is not a final eligibility decision.</strong>
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-leaf-600">What raised confidence</p>
                <ul className="space-y-1">
                  {card.confidenceFactors.raised.map((r, i) => (
                    <li key={i} className="flex gap-1.5 text-[12px] text-ink"><span className="text-leaf-500">+</span>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-600">What lowered confidence</p>
                <ul className="space-y-1">
                  {card.confidenceFactors.lowered.map((l, i) => (
                    <li key={i} className="flex gap-1.5 text-[12px] text-ink"><span className="text-amber-600">{'−'}</span>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-[14px] leading-relaxed text-slate2">{card.plainExplanation}</p>

        {/* Why this result */}
        <button
          onClick={() => setShowWhy((s) => !s)}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal-700 hover:underline"
          aria-expanded={showWhy}
        >
          <svg className={`h-4 w-4 transition ${showWhy ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 5l5 5-5 5V5z" />
          </svg>
          Why this result?
        </button>

        {showWhy && (
          <div className="mt-3 rounded-lg bg-mist p-4">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate2">
              Your answers that shaped this
            </p>
            <ul className="space-y-1.5">
              {card.whyThisResult.map((w, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-ink">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-slate2">
              Inputs used: {card.affectedInputs.join(', ')} &middot; Threshold distance: {card.thresholdDistance}% of a synthetic limit
            </p>
          </div>
        )}

        {/* Missing info checklist */}
        {card.missingInfoExplained.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate2">
              To verify, you&rsquo;ll still need
            </p>
            <ul className="space-y-1.5">
              {card.missingInfoExplained.map((m, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-slate2">
                  <span className="mt-0.5 text-teal-500">&#9744;</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Glossary */}
        {card.glossary.length > 0 && (
          <p className="mt-4 text-[13px] text-slate2">
            Terms:{' '}
            {card.glossary.map((g, i) => (
              <span key={g.term}>
                <GlossaryTip term={g.term} definition={g.definition} />
                {i < card.glossary.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        )}

        {/* Next step */}
        <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50/50 p-3.5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-teal-700">Next step</p>
          <p className="mt-1 text-[14px] text-ink">{card.nextStep}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-black/[0.05] bg-mist/50 px-5 py-3.5 sm:px-6">
        <a
          href={meta.officialSource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-700"
        >
          Verify with {meta.officialSource.label}
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3h6v6h-2V6.4l-7.3 7.3-1.4-1.4L13.6 5H11V3zM5 5h3v2H5v8h8v-3h2v5H3V5h2z"/></svg>
        </a>
        <button
          onClick={onTalkToPerson}
          className="rounded-lg border border-teal-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          Talk to a real person
        </button>
      </div>
    </Card>
  );
}
