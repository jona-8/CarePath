import { useMemo, useState } from 'react';
import type { IntakeAnswers } from '../types';
import { Card } from './ui';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming','District of Columbia',
];

export const EMPTY_INTAKE: IntakeAnswers = {
  state: '', householdSize: 1, incomeAmount: null, incomePeriod: 'monthly',
  incomeType: 'steady', employment: 'student', insurance: 'uninsured',
  employerInsuranceOffered: 'no', dependents: 'no', dependentCount: null,
  wantsDependentCoverage: null, immediateCareNeed: 'no',
  avgMonthlyIncomeLow: null, avgMonthlyIncomeHigh: null, lastMonthTypical: null,
  freeText: '',
};

// Reusable choice button row
function Choices<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { v: T; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`rounded-lg border px-3.5 py-2 text-[13px] font-medium transition ${
            value === o.v
              ? 'border-teal-600 bg-teal-600 text-white'
              : 'border-black/10 bg-white text-ink hover:border-teal-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {hint && <span className="mb-2 block text-[12px] text-slate2">{hint}</span>}
      {children}
    </label>
  );
}

export function Intake({
  initial,
  onComplete,
  onBack,
}: {
  initial?: IntakeAnswers;
  onComplete: (a: IntakeAnswers) => void;
  onBack: () => void;
}) {
  const [a, setA] = useState<IntakeAnswers>(initial ?? EMPTY_INTAKE);
  const set = <K extends keyof IntakeAnswers>(k: K, v: IntakeAnswers[K]) =>
    setA((prev) => ({ ...prev, [k]: v }));

  // Conditional follow-ups are derived live from current answers.
  const needsIncomeRange = a.incomeType === 'gig_variable' || a.incomeType === 'not_sure';
  const needsDependentDetail = a.dependents === 'yes';

  // Build step list dynamically so conditional steps appear inline.
  const steps = useMemo(() => {
    const s: { id: string; render: () => React.ReactNode }[] = [];

    s.push({ id: 'state', render: () => (
      <Field label="Which state do you live in?" hint="Income limits vary by state. We use this only to frame guidance — we never store an address.">
        <select
          value={a.state}
          onChange={(e) => set('state', e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">Select a state…</option>
          {US_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
        </select>
      </Field>
    )});

    s.push({ id: 'household', render: () => (
      <Field label="How many people are in your household?" hint="Count yourself and anyone you share income/expenses with on a tax return.">
        <input
          type="number" min={1} max={12} value={a.householdSize ?? ''}
          onChange={(e) => set('householdSize', e.target.value ? Number(e.target.value) : null)}
          className="w-32 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm"
        />
      </Field>
    )});

    s.push({ id: 'income', render: () => (
      <div className="space-y-4">
        <Field label="About how much do you earn?" hint="A rough number is fine — you can refine it later.">
          <div className="flex items-center gap-2">
            <span className="text-slate2">$</span>
            <input
              type="number" min={0} value={a.incomeAmount ?? ''}
              onChange={(e) => set('incomeAmount', e.target.value ? Number(e.target.value) : null)}
              className="w-40 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm"
              placeholder="0"
            />
            <Choices
              value={a.incomePeriod}
              onChange={(v) => set('incomePeriod', v)}
              options={[{ v: 'monthly', label: 'per month' }, { v: 'annual', label: 'per year' }]}
            />
          </div>
        </Field>
        <Field label="What kind of income is it?">
          <Choices
            value={a.incomeType}
            onChange={(v) => set('incomeType', v)}
            options={[
              { v: 'steady', label: 'Steady' }, { v: 'part_time', label: 'Part-time' },
              { v: 'gig_variable', label: 'Gig / variable' }, { v: 'unemployed', label: 'No income now' },
              { v: 'not_sure', label: 'Not sure' },
            ]}
          />
        </Field>
      </div>
    )});

    if (needsIncomeRange) {
      s.push({ id: 'income_followup', render: () => (
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-600">
            Because your income varies, a range gives a safer estimate than one number.
          </div>
          <Field label="In a typical month, what is your range?" hint="Lowest and highest you usually bring in.">
            <div className="flex items-center gap-2">
              <span className="text-slate2">$</span>
              <input type="number" min={0} placeholder="low" value={a.avgMonthlyIncomeLow ?? ''}
                onChange={(e) => set('avgMonthlyIncomeLow', e.target.value ? Number(e.target.value) : null)}
                className="w-28 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm" />
              <span className="text-slate2">to $</span>
              <input type="number" min={0} placeholder="high" value={a.avgMonthlyIncomeHigh ?? ''}
                onChange={(e) => set('avgMonthlyIncomeHigh', e.target.value ? Number(e.target.value) : null)}
                className="w-28 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm" />
            </div>
          </Field>
          <Field label="Was last month a typical month?">
            <Choices value={a.lastMonthTypical ?? 'not_sure'}
              onChange={(v) => set('lastMonthTypical', v)}
              options={[{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'not_sure', label: 'Not sure' }]} />
          </Field>
        </div>
      )});
    }

    s.push({ id: 'employment', render: () => (
      <Field label="What best describes your work right now?">
        <Choices value={a.employment} onChange={(v) => set('employment', v)}
          options={[
            { v: 'full_time', label: 'Full-time' }, { v: 'part_time', label: 'Part-time' },
            { v: 'gig', label: 'Gig / freelance' }, { v: 'student', label: 'Student' },
            { v: 'unemployed', label: 'Not working now' }, { v: 'not_sure', label: 'Not sure' },
          ]} />
      </Field>
    )});

    s.push({ id: 'insurance', render: () => (
      <div className="space-y-4">
        <Field label="What is your current insurance situation?">
          <Choices value={a.insurance} onChange={(v) => set('insurance', v)}
            options={[
              { v: 'uninsured', label: 'No insurance' }, { v: 'underinsured', label: 'Some, but not enough' },
              { v: 'insured', label: 'Insured' }, { v: 'not_sure', label: 'Not sure' },
            ]} />
        </Field>
        <Field label="Does a job offer you health insurance?">
          <Choices value={a.employerInsuranceOffered} onChange={(v) => set('employerInsuranceOffered', v)}
            options={[{ v: 'no', label: 'No' }, { v: 'yes', label: 'Yes' }, { v: 'not_sure', label: 'Not sure' }]} />
        </Field>
      </div>
    )});

    s.push({ id: 'dependents', render: () => (
      <div className="space-y-4">
        <Field label="Do you have any children or dependents?">
          <Choices value={a.dependents} onChange={(v) => set('dependents', v)}
            options={[{ v: 'no', label: 'No' }, { v: 'yes', label: 'Yes' }, { v: 'not_sure', label: 'Not sure' }]} />
        </Field>
        {needsDependentDetail && (
          <>
            <Field label="How many?">
              <input type="number" min={1} max={10} value={a.dependentCount ?? ''}
                onChange={(e) => set('dependentCount', e.target.value ? Number(e.target.value) : null)}
                className="w-28 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm" />
            </Field>
            <Field label="Want guidance on coverage for them too?">
              <Choices value={a.wantsDependentCoverage ?? 'yes'} onChange={(v) => set('wantsDependentCoverage', v)}
                options={[{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }]} />
            </Field>
          </>
        )}
      </div>
    )});

    s.push({ id: 'urgent', render: () => (
      <Field label="Do you need medical care soon?" hint="We won’t give medical advice — this only helps us point you to faster help if needed.">
        <Choices value={a.immediateCareNeed} onChange={(v) => set('immediateCareNeed', v)}
          options={[{ v: 'no', label: 'No, just planning' }, { v: 'yes', label: 'Yes, soon' }, { v: 'not_sure', label: 'Not sure' }]} />
      </Field>
    )});

    s.push({ id: 'freetext', render: () => (
      <Field label="Anything else we should consider?" hint="Optional. Don’t include sensitive details — we never ask for immigration status, SSN, diagnosis, or your name.">
        <textarea rows={4} value={a.freeText}
          onChange={(e) => set('freeText', e.target.value)}
          placeholder="e.g. My hours change a lot, or I have a bill I can’t pay…"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm" />
      </Field>
    )});

    return s;
  }, [a, needsIncomeRange, needsDependentDetail]);

  const [stepIdx, setStepIdx] = useState(0);
  const current = steps[Math.min(stepIdx, steps.length - 1)];
  const isLast = stepIdx >= steps.length - 1;

  // Lightweight per-step validity.
  const canContinue = (() => {
    if (current.id === 'state') return a.state !== '';
    if (current.id === 'household') return !!a.householdSize && a.householdSize >= 1;
    return true;
  })();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <button onClick={onBack} className="mb-6 text-sm font-medium text-teal-700 hover:underline">
        &larr; Back
      </button>

      {/* progress */}
      <div className="mb-6 flex gap-1.5" aria-label={`Step ${stepIdx + 1} of ${steps.length}`}>
        {steps.map((_, i) => (
          <div key={i} className={`step-dash flex-1 ${i <= stepIdx ? 'bg-teal-500' : 'bg-black/10'}`} />
        ))}
      </div>

      <Card className="p-6 sm:p-8">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">
          Step {stepIdx + 1} of {steps.length}
        </p>
        <div className="mt-4 rise" key={current.id}>{current.render()}</div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
            className="text-sm font-medium text-slate2 disabled:opacity-40"
          >
            Previous
          </button>
          {isLast ? (
            <button
              onClick={() => onComplete(a)}
              className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              See my options &rarr;
            </button>
          ) : (
            <button
              onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
              disabled={!canContinue}
              className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </div>
      </Card>

      <p className="mt-4 text-center text-[12px] text-slate2">
        Privacy-conscious by design: no name, SSN, address, exact birth date, immigration status, or diagnosis is collected.
      </p>
    </div>
  );
}
