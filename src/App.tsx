import { useCallback, useState } from 'react';
import type { IntakeAnswers, Assessment } from './types';
import { buildAssessment } from './lib/assessment';
import { Landing } from './components/Landing';
import { JudgeDemo } from './components/JudgeDemo';
import { Intake } from './components/Intake';
import { Interpreting } from './components/Interpreting';
import { Dashboard } from './components/Dashboard';
import type { Preset } from './presets/presets';

type Screen = 'landing' | 'demo' | 'intake' | 'interpreting' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [intakeSeed, setIntakeSeed] = useState<IntakeAnswers | undefined>();
  const [pendingIntake, setPendingIntake] = useState<IntakeAnswers | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  // From intake -> show interpreting state, compute assessment in parallel.
  const handleIntakeComplete = useCallback((answers: IntakeAnswers) => {
    setPendingIntake(answers);
    setScreen('interpreting');
  }, []);

  // Called when the interpreting animation finishes.
  const finishInterpreting = useCallback(async () => {
    if (!pendingIntake) return;
    const result = await buildAssessment(pendingIntake);
    setAssessment(result);
    setScreen('results');
    // Scroll-to-top is handled by the Dashboard on mount, which is reliable
    // because it runs after the results DOM has actually rendered.
  }, [pendingIntake]);

  const runPreset = useCallback((p: Preset) => {
    // Presets prefill the intake so judges can see the populated answers,
    // then move straight into interpretation.
    setIntakeSeed(p.answers);
    setPendingIntake(p.answers);
    setScreen('interpreting');
  }, []);

  const restart = useCallback(() => {
    setAssessment(null);
    setPendingIntake(null);
    setIntakeSeed(undefined);
    setScreen('landing');
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="contour-bg" aria-hidden />
      <div className="relative z-10">
        <Header onHome={restart} showHome={screen !== 'landing'} />

        {screen === 'landing' && (
          <Landing onStart={() => { setIntakeSeed(undefined); setScreen('intake'); }} onDemo={() => setScreen('demo')} />
        )}

        {screen === 'demo' && (
          <JudgeDemo onRun={runPreset} onBack={() => setScreen('landing')} />
        )}

        {screen === 'intake' && (
          <Intake initial={intakeSeed} onComplete={handleIntakeComplete} onBack={() => setScreen('landing')} />
        )}

        {screen === 'interpreting' && <Interpreting onDone={finishInterpreting} />}

        {screen === 'results' && assessment && (
          <Dashboard assessment={assessment} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

function Header({ onHome, showHome }: { onHome: () => void; showHome: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/[0.05] bg-mist/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <button onClick={onHome} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 p-1">
            <img
              src="public/logowebsite.png"
              alt="CarePath Navigator logo"
              className="h-full w-full object-contain"
            />
          </span>
          <span className="font-display text-lg font-500 text-ink">CarePath Navigator</span>
        </button>
        {showHome && (
          <button onClick={onHome} className="text-[13px] font-semibold text-teal-700 hover:underline">
            Home
          </button>
        )}
      </div>
    </header>
  );
}
