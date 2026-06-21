import { useEffect, useState } from 'react';

const STEPS = [
  'Reading intake answers',
  'Normalizing income & household information',
  'Checking simplified eligibility rules',
  'Generating plain-language next steps',
  'Adding verification reminders',
];

export function Interpreting({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setActive(i + 1), 360 * (i + 1)));
    });
    timers.push(window.setTimeout(onDone, 360 * (STEPS.length + 1) + 200));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500" />
        </span>
        <h2 className="font-display text-2xl text-ink">Interpreting your situation&hellip;</h2>
      </div>

      <ol className="space-y-3">
        {STEPS.map((label, i) => {
          const done = i < active;
          const isActive = i === active;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition ${
                  done ? 'bg-teal-600 text-white'
                  : isActive ? 'bg-teal-100 text-teal-700'
                  : 'bg-black/5 text-slate2'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={`text-sm ${done || isActive ? 'text-ink' : 'text-slate2'}`}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
