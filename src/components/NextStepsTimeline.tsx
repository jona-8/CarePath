import type { Assessment } from '../types';
import { SectionHead, Card } from './ui';

export function NextStepsTimeline({ assessment }: { assessment: Assessment }) {
  const n = assessment.normalized;

  // Tailor a couple of items to the situation while keeping a stable backbone.
  const today = [
    'Estimate your monthly income range.',
    'Save recent pay or gig payment records.',
    'Contact a community health center or a 211 referral line.',
  ];
  if (n.immediateCareNeed) {
    today.unshift('If you need care now, go to a clinic or ER and ask about financial assistance at intake.');
  }

  const thisWeek = [
    'Check your state\u2019s Medicaid or Marketplace website.',
    'Ask a clinic or hospital about its financial assistance policy.',
  ];
  if (n.incomeIsUncertain || n.flags.includes('immigration_concern')) {
    thisWeek.push('Talk to a caseworker if your income, household, or situation is unclear.');
  }

  const beforeApplying = [
    'Gather income documents (pay stubs, gig summaries, bank records).',
    'Confirm your household size.',
    'Verify program-specific rules with an official source.',
  ];

  const cols = [
    { title: 'Today', tint: 'bg-leaf-50 text-leaf-600', items: today },
    { title: 'This week', tint: 'bg-teal-50 text-teal-700', items: thisWeek },
    { title: 'Before applying', tint: 'bg-amber-50 text-amber-600', items: beforeApplying },
  ];

  return (
    <section>
      <SectionHead eyebrow="A plan you can act on" title="Your next steps" />
      <div className="grid gap-4 md:grid-cols-3">
        {cols.map((col) => (
          <Card key={col.title} className="p-5">
            <span className={`inline-block rounded-md px-2.5 py-1 text-[12px] font-semibold ${col.tint}`}>
              {col.title}
            </span>
            <ul className="mt-4 space-y-3">
              {col.items.map((it, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  {it}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
