import type { ProgramCard } from '../types';
import { SectionHead, Card } from './ui';

const CONF_LABEL: Record<string, string> = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };

export function ComparisonTable({ cards }: { cards: ProgramCard[] }) {
  return (
    <section>
      <SectionHead eyebrow="Side by side" title="Compare your options" />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-black/[0.06] text-[11px] uppercase tracking-wide text-slate2">
              <th className="p-4 font-semibold">Option</th>
              <th className="p-4 font-semibold">What it helps with</th>
              <th className="p-4 font-semibold">Why it appeared</th>
              <th className="p-4 font-semibold">Confidence</th>
              <th className="p-4 font-semibold">What to verify</th>
              <th className="p-4 font-semibold">Best next step</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.programId} className="border-b border-black/[0.04] align-top last:border-0">
                <td className="p-4 font-semibold text-ink">{c.programName}</td>
                <td className="p-4 text-slate2">{c.comparison.helpsWith}</td>
                <td className="p-4 text-slate2">{c.comparison.whyAppeared}</td>
                <td className="p-4 text-slate2">{CONF_LABEL[c.confidence]}</td>
                <td className="p-4 text-slate2">{c.comparison.verify}</td>
                <td className="p-4 text-slate2">{c.comparison.bestNextStep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
