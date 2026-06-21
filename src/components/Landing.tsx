import { Disclaimer } from './ui';

export function Landing({
  onStart,
  onDemo,
}: {
  onStart: () => void;
  onDemo: () => void;
}) {
  return (
    <div className="relative mx-auto max-w-3xl px-5 py-12 sm:py-20">
      <div className="rise">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[12px] font-semibold text-teal-700">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          Healthcare benefits decision support
        </p>

        <h1 className="font-display text-4xl font-500 leading-[1.05] text-ink sm:text-6xl">
          Healthcare benefits guidance in&nbsp;plain&nbsp;language.
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate2 sm:text-lg">
          CarePath Navigator helps uninsured or underinsured young adults move from
          <em className="text-ink"> &ldquo;I have no idea where to start&rdquo;</em> to a clear list of
          support options you may be able to explore &mdash; why each one showed up, what to verify,
          and what to do next.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onStart}
            className="rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lift transition hover:bg-teal-700"
          >
            Start guided check &rarr;
          </button>
          <button
            onClick={onDemo}
            className="rounded-xl border border-teal-200 bg-white px-6 py-3.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
          >
            Open Judge Demo Mode
          </button>
        </div>

        <div className="mt-10">
          <Disclaimer />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { h: 'Guided, not a chatbot', p: 'A short structured intake adapts to your situation — no open-ended typing required.' },
            { h: 'It explains its reasoning', p: 'Every result shows which of your answers drove it, with confidence and what to verify.' },
            { h: 'A person stays in control', p: 'CarePath never decides eligibility. We point you to official sources and real people.' },
          ].map((f) => (
            <div key={f.h} className="rounded-xl border border-black/[0.04] bg-white/70 p-4">
              <h3 className="text-sm font-semibold text-ink">{f.h}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate2">{f.p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
