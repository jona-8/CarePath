import { PRESETS, type Preset } from '../presets/presets';
import { SectionHead, Card } from './ui';
export function JudgeDemo({
  onRun,
  onBack,
}: {
  onRun: (p: Preset) => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <button onClick={onBack} className="mb-6 text-sm font-medium text-teal-700 hover:underline">
        &larr; Back
      </button>
      <SectionHead
        eyebrow="Judge Demo Mode"
        title="Run a full scenario in one click"
        sub={'Each preset fills the guided intake and runs end-to-end: NLP interpretation → deterministic rules → plain-language results. No API key required.'}
      />


      <div className="grid gap-4 sm:grid-cols-2">
        {PRESETS.map((p) => {
          const recommended = p.id === 'B';
          return (
            <Card key={p.id} className={`flex flex-col p-5 ${recommended ? 'ring-2 ring-teal-500' : ''}`}>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
                  {p.id}
                </span>
                <h3 className="text-[15px] font-semibold text-ink">{p.label}</h3>
                {recommended && (
                  <span className="ml-auto rounded-full bg-teal-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Recommended demo
                  </span>
                )}
              </div>
              <p className="text-[13px] text-slate2">{p.blurb}</p>
              <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-[12px] leading-snug text-slate2">
                <span className="font-semibold text-ink">Expected: </span>
                {p.expected}
              </p>
              {recommended && (
                <p className="mt-2 text-[12px] leading-snug text-teal-700">
                  Best end-to-end story: variable income &rarr; ambiguity &rarr; cautious result &rarr; low/medium
                  confidence &rarr; &ldquo;Why this result?&rdquo; &rarr; missing info &rarr; checklist &rarr; human handoff &rarr;
                  synthetic-data transparency.
                </p>
              )}
              <button
                onClick={() => onRun(p)}
                className={`mt-4 self-start rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition ${recommended ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-600 hover:bg-teal-700'}`}
              >
                Run scenario {p.id} &rarr;
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
