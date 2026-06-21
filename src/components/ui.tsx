import type { ReactNode } from 'react';
import type { Confidence, ProgramStatus } from '../types';

// ── Status badge (verdict label) ───────────────────────────────────────────
const STATUS_STYLE: Record<ProgramStatus, { label: string; cls: string }> = {
  MAY_QUALIFY: { label: 'You may qualify', cls: 'bg-leaf-50 text-leaf-600 ring-leaf-500/30' },
  POSSIBLY_ELIGIBLE_VERIFY: { label: 'Possibly eligible — verify', cls: 'bg-amber-50 text-amber-600 ring-amber-400/40' },
  LIKELY_NOT_ELIGIBLE_ALTERNATIVE: { label: 'Likely not eligible — alternative', cls: 'bg-rose-50 text-rose-600 ring-rose-400/40' },
};

export function StatusBadge({ status }: { status: ProgramStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}

// ── Confidence pill ────────────────────────────────────────────────────────
const CONF_STYLE: Record<Confidence, string> = {
  HIGH: 'bg-teal-50 text-teal-700',
  MEDIUM: 'bg-amber-50 text-amber-600',
  LOW: 'bg-rose-50 text-rose-600',
};
export function ConfidencePill({ confidence }: { confidence: Confidence }) {
  const label = confidence.charAt(0) + confidence.slice(1).toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${CONF_STYLE[confidence]}`}>
      Confidence: {label}
    </span>
  );
}

// ── Glossary tooltip ───────────────────────────────────────────────────────
export function GlossaryTip({ term, definition }: { term: string; definition: string }) {
  return (
    <span className="tip inline-flex items-center" tabIndex={0}>
      <span className="cursor-help border-b border-dashed border-teal-500/60 text-teal-700">
        {term}
      </span>
      <span className="tip-body rounded-lg bg-ink px-3 py-2 text-left text-[12px] leading-snug text-white shadow-lift">
        <strong className="block text-teal-100">{term}</strong>
        {definition}
      </span>
    </span>
  );
}

// ── Section heading with eyebrow ───────────────────────────────────────────
export function SectionHead({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-500 text-ink sm:text-[28px]">{title}</h2>
      {sub && <p className="mt-1.5 max-w-2xl text-sm text-slate2">{sub}</p>}
    </div>
  );
}

// ── Disclaimer bar (reused on landing + results) ───────────────────────────
export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/60 ${compact ? 'p-3' : 'p-4'}`}>
      <svg className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
      <p className={`text-slate2 ${compact ? 'text-[12px]' : 'text-[13px]'} leading-relaxed`}>
        This tool provides <strong className="text-ink">decision support only</strong>. It is not a legal,
        financial, medical, or official eligibility determination. Only the program or agency can confirm eligibility.
      </p>
    </div>
  );
}

// ── Card shell ─────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl2 border border-black/[0.04] bg-card shadow-card ${className}`}>{children}</div>;
}
