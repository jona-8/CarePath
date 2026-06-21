import type { Assessment } from '../types';
import { REFERRAL_RESOURCES, PROGRAMS } from '../data/programs';
import { SectionHead, Card } from './ui';

// ── Before vs After impact panel ───────────────────────────────────────────
export function BeforeAfterPanel() {
  const before = [
    'Doesn’t know where to start.',
    'Confused by eligibility terms and jargon.',
    'May assume they can’t get any help.',
    'Doesn’t know what to prepare.',
  ];
  const after = [
    'Sees possible support paths, grouped clearly.',
    'Understands why each option appeared.',
    'Knows exactly what information is missing.',
    'Has next steps, a checklist, and a human-handoff script.',
    'Knows what to verify with official sources.',
  ];
  return (
    <section>
      <SectionHead eyebrow="Impact & decision value" title="What changed for the user?" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <span className="inline-block rounded-md bg-rose-50 px-2.5 py-1 text-[12px] font-semibold text-rose-600">Before CarePath</span>
          <ul className="mt-4 space-y-2.5">
            {before.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] text-slate2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />{b}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 ring-1 ring-leaf-500/20">
          <span className="inline-block rounded-md bg-leaf-50 px-2.5 py-1 text-[12px] font-semibold text-leaf-600">After CarePath</span>
          <ul className="mt-4 space-y-2.5">
            {after.map((a, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] text-ink"><span className="mt-0.5 text-leaf-500">&#10003;</span>{a}</li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

// ── Official verification starting points ──────────────────────────────────
export function OfficialSourcesPanel() {
  const sources = [
    { label: 'HealthCare.gov', url: PROGRAMS.aca.officialSource.url, note: 'Marketplace plans & subsidies' },
    { label: 'Medicaid.gov', url: PROGRAMS.medicaid.officialSource.url, note: 'Medicaid & CHIP' },
    { label: REFERRAL_RESOURCES.benefits.label, url: REFERRAL_RESOURCES.benefits.url, note: 'Broad benefits finder' },
    { label: 'HRSA Find a Health Center', url: REFERRAL_RESOURCES.findHealthCenter.url, note: 'Sliding-scale clinics' },
    { label: '211', url: REFERRAL_RESOURCES.twoOneOne.url, note: 'Local referral & caseworkers' },
  ];
  return (
    <section>
      <SectionHead eyebrow="Where to verify" title="Official verification starting points" />
      <Card className="p-5">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg border border-black/[0.06] bg-white px-3.5 py-3 transition hover:border-teal-300 hover:bg-teal-50/40">
              <span>
                <span className="block text-[13px] font-semibold text-ink">{s.label}</span>
                <span className="block text-[11px] text-slate2">{s.note}</span>
              </span>
              <svg className="h-4 w-4 text-teal-600" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3h6v6h-2V6.4l-7.3 7.3-1.4-1.4L13.6 5H11V3zM5 5h3v2H5v8h8v-3h2v5H3V5h2z"/></svg>
            </a>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-slate2">
          These links help you verify next steps. They do not confirm eligibility by themselves.
        </p>
      </Card>
    </section>
  );
}

// ── State-specific limitation + verification path ──────────────────────────
export function StateNotePanel({ assessment }: { assessment: Assessment }) {
  const state = assessment.normalized.state;
  return (
    <Card className="p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">State-specific note</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate2">
        <strong className="text-ink">State selected: {state}.</strong> This prototype does not make
        state-specific legal determinations. Your state helps guide where to verify next, but official
        state rules must be checked through Medicaid, the Marketplace, or a caseworker.
      </p>
      <ol className="mt-3 space-y-1.5">
        {['Check Medicaid.gov or your state Medicaid office.', 'Check HealthCare.gov or your state Marketplace.', 'Contact 211 or a local caseworker.'].map((s, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] text-ink">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ── Plain-language translator ──────────────────────────────────────────────
export function TranslatorPanel() {
  const terms = [
    { t: 'Federal Poverty Level (FPL)', d: 'A government income line used to decide who qualifies for many programs. Limits are often written as a percent of it (like "138% of FPL").' },
    { t: 'Premium tax credit', d: 'A discount that lowers your monthly health-plan payment on the Marketplace, based on income and household size.' },
    { t: 'Sliding scale', d: 'A pricing system where what you pay goes down as your income goes down.' },
    { t: 'Charity care / hospital financial assistance', d: 'Hospital programs that reduce or cancel bills for patients who can’t afford to pay.' },
    { t: 'Household size', d: 'The people counted together (often on one tax return). It changes your income limit.' },
    { t: 'Variable income', d: 'Income that changes month to month — common for gig and part-time work. Programs usually look at your ongoing average.' },
    { t: 'Official eligibility determination', d: 'The final yes/no decision — only a program or agency can make it, never this tool.' },
  ];
  return (
    <section>
      <SectionHead eyebrow="Plain language" title="Confusing terms, translated" />
      <Card className="p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          {terms.map((x) => (
            <div key={x.t}>
              <dt className="text-[13px] font-semibold text-ink">{x.t}</dt>
              <dd className="mt-0.5 text-[12px] leading-relaxed text-slate2">{x.d}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  );
}

// ── Responsible AI design choices ──────────────────────────────────────────
export function ResponsibleAiPanel() {
  const choices = [
    'The app never makes final eligibility decisions.',
    'The deterministic rules engine controls verdict labels — not the language model.',
    'The app uses cautious "may qualify" language, enforced in code.',
    'Confidence is lowered when income is variable, information is missing, or a result is borderline.',
    'The app does not collect unnecessary sensitive data.',
    'The app does not ask for immigration status under any condition.',
    'Unclear or high-risk cases are routed to human verification.',
    'The app uses synthetic rules and clearly discloses they are not official.',
  ];
  return (
    <section>
      <SectionHead eyebrow="Responsible AI" title="Responsible AI design choices" />
      <Card className="p-5">
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {choices.map((c, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM9 11.6L6.7 9.3 5.3 10.7 9 14.4l6.7-6.7-1.4-1.4z"/></svg>
              {c}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

// ── Social impact: reducing friction ───────────────────────────────────────
export function SocialImpactPanel() {
  const points = [
    'CarePath helps users who might otherwise give up because healthcare-support rules feel confusing.',
    'It turns scattered program information into a clear, step-by-step verification path.',
    'It helps users prepare documents and questions before contacting a caseworker.',
    'It reduces false certainty by showing uncertainty and missing information.',
    'It supports people under stress without replacing official programs or human help.',
  ];
  return (
    <section>
      <SectionHead eyebrow="Social impact" title="Social impact: reducing friction" />
      <Card className="p-5">
        <ul className="space-y-2.5">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />{p}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

// ── "Why this is not just a directory" (judge evidence summary) ─────────────
export function NotADirectoryPanel() {
  const rows = [
    ['Guided intake', 'collects structured user context (not an open search box).'],
    ['NLP-style interpretation', 'normalizes messy, variable answers into clean fields.'],
    ['Deterministic rules engine', 'produces cautious, auditable status labels.'],
    ['Explanation layer', 'translates results into plain language without changing the verdict.'],
    ['Human-in-the-loop', 'keeps final decisions with official programs and people.'],
    ['Guardrail', 'prevents over-promising wording, enforced in code and tests.'],
  ];
  return (
    <Card className="p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">Why this is not just a directory</p>
      <ul className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <li key={k} className="text-[13px] leading-relaxed text-ink">
            <span className="font-semibold">{k}</span> <span className="text-slate2">{v}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ── Prize fit panel ────────────────────────────────────────────────────────
export function PrizeFitPanel() {
  const cols = [
    { h: 'Overall judging strength', items: ['Complete working prototype', 'Clear AI reasoning pipeline', 'Real user journey end to end', 'Strong UX and responsible design'] },
    { h: 'Responsible AI strength', items: ['Cautious "may qualify" language', 'Deterministic verdicts', 'Human verification path', 'Confidence & uncertainty display', 'Privacy-conscious intake', 'Synthetic-data disclosure'] },
    { h: 'Social Impact strength', items: ['Helps navigate healthcare-support confusion', 'Turns uncertainty into next steps', 'Supports uninsured/underinsured young adults', 'Caseworker script & verification checklist'] },
  ];
  return (
    <section>
      <SectionHead eyebrow="For judges" title="Project strengths at a glance" />
      <div className="grid gap-4 md:grid-cols-3">
        {cols.map((c) => (
          <Card key={c.h} className="p-5">
            <h4 className="font-display text-[16px] text-ink">{c.h}</h4>
            <ul className="mt-3 space-y-1.5">
              {c.items.map((it, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-slate2"><span className="mt-0.5 text-teal-500">&#10003;</span>{it}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
