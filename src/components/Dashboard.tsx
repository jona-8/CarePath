import { useEffect, useRef } from 'react';
import type { Assessment, ProgramCard as ProgramCardType, ProgramStatus } from '../types';
import { ProgramCard } from './ProgramCard';
import { ComparisonTable } from './ComparisonTable';
import { VerificationRoadmap } from './VerificationRoadmap';
import { ChecklistPanel } from './ChecklistPanel';
import { HumanHandoff } from './HumanHandoff';
import { TransparencyPanel, ArchitecturePanel } from './Panels';
import {
  BeforeAfterPanel, OfficialSourcesPanel, StateNotePanel, TranslatorPanel,
  ResponsibleAiPanel, SocialImpactPanel, NotADirectoryPanel, PrizeFitPanel,
} from './ImpactPanels';
import { Disclaimer, SectionHead } from './ui';

const GROUPS: { status: ProgramStatus; title: string; sub: string }[] = [
  { status: 'MAY_QUALIFY', title: 'You may qualify', sub: 'These fit the typical range based on what you told us. Still verify.' },
  { status: 'POSSIBLY_ELIGIBLE_VERIFY', title: 'Possibly eligible — verify', sub: 'Close calls that depend on details only an official source can confirm.' },
  { status: 'LIKELY_NOT_ELIGIBLE_ALTERNATIVE', title: 'Likely not eligible — alternative options', sub: 'Less likely to fit, with a better-matched path suggested instead.' },
];

export function Dashboard({
  assessment,
  onRestart,
}: {
  assessment: Assessment;
  onRestart: () => void;
}) {
  const handoffHighlight = assessment.humanHandoffEmphasis.length > 0;
  const topRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);

  // Reliable scroll-to-top: runs AFTER the results DOM has mounted, so the
  // page always lands at the top of the dashboard (never auto-jumps to the
  // human-handoff section). Fixes the prior auto-scroll bug.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    topRef.current?.scrollIntoView({ block: 'start' });
  }, []);

  // Only scrolls when the user explicitly clicks a "Talk to a real person" button.
  const scrollToHandoff = () => {
    handoffRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const grouped = (status: ProgramStatus): ProgramCardType[] =>
    assessment.cards.filter((c) => c.status === status);

  return (
    <div ref={topRef} className="mx-auto max-w-5xl px-5 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600">Your results</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">Here&rsquo;s what you may be able to explore</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate2">
            Grouped by how well your answers fit each program. Open &ldquo;Why this result?&rdquo; on any card
            to see exactly which answers drove it.
          </p>
        </div>
        <button onClick={onRestart} className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-[13px] font-semibold text-teal-700 hover:bg-teal-50">
          Start over
        </button>
      </div>

      <div className="mb-8"><Disclaimer compact /></div>

      {/* 1) Results — the core answer first */}
      <div className="space-y-10">
        {GROUPS.map((g) => {
          const cards = grouped(g.status);
          if (cards.length === 0) return null;
          return (
            <section key={g.status}>
              <SectionHead title={g.title} sub={g.sub} />
              <div className="grid gap-5 lg:grid-cols-2">
                {cards.map((c) => (
                  <ProgramCard key={c.programId} card={c} onTalkToPerson={scrollToHandoff} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-12 space-y-12">
        {/* 2) Compare options */}
        <ComparisonTable cards={assessment.cards} />

        {/* 3) What to do — roadmap, then a usable checklist */}
        <VerificationRoadmap assessment={assessment} onTalkToPerson={scrollToHandoff} />
        <ChecklistPanel assessment={assessment} />

        {/* 4) Human handoff (only scrolls here on manual click) */}
        <div ref={handoffRef}>
          <HumanHandoff assessment={assessment} highlight={handoffHighlight} />
        </div>

        {/* 5) Where + how to verify */}
        <OfficialSourcesPanel />
        <StateNotePanel assessment={assessment} />
        <TranslatorPanel />

        {/* 6) Impact framing */}
        <BeforeAfterPanel />
        <SocialImpactPanel />

        {/* 7) Responsible AI + architecture transparency */}
        <ResponsibleAiPanel />
        <ArchitecturePanel assessment={assessment} />
        <NotADirectoryPanel />
        <TransparencyPanel />

        {/* 8) Judge aids last */}
        <PrizeFitPanel />
      </div>

      <footer className="mt-16 border-t border-black/[0.06] pt-6 text-center text-[12px] text-slate2">
        CarePath Navigator &middot; Prototype for the USAII Global AI Hackathon 2026 &middot;
        Decision support only, not an official eligibility determination.
      </footer>
    </div>
  );
}
