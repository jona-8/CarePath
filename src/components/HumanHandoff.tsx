import { useState } from 'react';
import type { Assessment } from '../types';
import { REFERRAL_RESOURCES } from '../data/programs';
import { Card } from './ui';

export function HumanHandoff({
  assessment,
  highlight,
}: {
  assessment: Assessment;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  // NOTE: We intentionally do NOT auto-scroll to this section. The page lands
  // at the top of the results after intake; this section only scrolls into
  // view when the user manually clicks a "Talk to a real person" button
  // (handled by the Dashboard). The `highlight` ring is still shown for
  // low-confidence / human-verification cases.

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(assessment.caseworkerScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section>
      <Card className={`p-5 sm:p-6 ${highlight ? 'ring-2 ring-teal-500' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl text-ink">Talk to a real person</h3>
            <p className="mt-1 text-[13px] text-slate2">
              We help you understand your options. Only the program or agency can confirm eligibility &mdash;
              you take it from here. Here&rsquo;s a script you can read or send, already filled in from your answers:
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-mist p-4 text-[14px] leading-relaxed text-ink">
          &ldquo;{assessment.caseworkerScript}&rdquo;
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={copy}
            className="rounded-lg bg-teal-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-700"
          >
            {copied ? 'Copied ✓' : 'Copy script'}
          </button>
          <a href={REFERRAL_RESOURCES.twoOneOne.url} target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-50">
            Find help via 211
          </a>
          <a href={REFERRAL_RESOURCES.findHealthCenter.url} target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-50">
            Find a health center
          </a>
        </div>

        {assessment.humanHandoffEmphasis.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-50 p-3.5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-600">
              Why a person should help here
            </p>
            <ul className="mt-2 space-y-1.5">
              {assessment.humanHandoffEmphasis.map((e, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-ink">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </section>
  );
}
