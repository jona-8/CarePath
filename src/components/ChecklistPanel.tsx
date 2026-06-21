import { useState } from 'react';
import type { Assessment } from '../types';
import { SectionHead, Card } from './ui';

export function ChecklistPanel({ assessment }: { assessment: Assessment }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const c = assessment.checklist;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // Print just the checklist by opening a clean print window.
  const print = () => {
    const w = window.open('', '_blank', 'width=720,height=900');
    if (!w) {
      window.print();
      return;
    }
    w.document.write(
      `<html><head><title>CarePath Verification Checklist</title>` +
      `<style>body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#0F2A33;padding:32px;max-width:720px;margin:auto}h1{font-size:18px}pre{white-space:pre-wrap;font:13px/1.6 ui-monospace,Menlo,monospace}</style>` +
      `</head><body><pre>${escapeHtml(c.plainText)}</pre></body></html>`,
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  return (
    <section>
      <SectionHead
        eyebrow="Leave with something usable"
        title="Your personal action plan"
        sub="A practical checklist you can take to a caseworker, clinic, or official program."
      />
      <Card className="p-5 sm:p-6">
        {!open ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-[14px] text-slate2">
              Build a personalized verification checklist with your situation summary, the options to
              verify, what to gather, where to start, and questions to ask &mdash; ready to copy or print.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Create my verification checklist
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={copy} className="rounded-lg bg-teal-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-700">
                {copied ? 'Copied ✓' : 'Copy checklist'}
              </button>
              <button onClick={print} className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-50">
                Print checklist
              </button>
            </div>

            <div className="space-y-5">
              <Block title="My situation">
                <p className="text-[13px] text-ink">{c.situationSummary}</p>
              </Block>

              <Block title="Top options to verify">
                <ul className="space-y-2">
                  {c.topOptions.map((o, i) => (
                    <li key={i} className="text-[13px]">
                      <span className="font-semibold text-ink">{o.name}</span>{' '}
                      <span className="text-slate2">&mdash; {o.status}</span>
                      <div className="text-[12px] text-slate2">Why: {o.why}</div>
                    </li>
                  ))}
                </ul>
              </Block>

              <div className="grid gap-5 sm:grid-cols-2">
                <Block title="Information still to check">
                  <CheckList items={c.missingInfo.length ? c.missingInfo : ['Verify limits with an official source.']} />
                </Block>
                <Block title="Documents / details to gather">
                  <CheckList items={c.documentsToGather} />
                </Block>
              </div>

              <Block title="Official verification starting points">
                <ul className="space-y-1.5">
                  {c.officialStartingPoints.map((s, i) => (
                    <li key={i} className="text-[13px]">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 hover:underline">{s.label}</a>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[12px] text-slate2">These help you verify next steps. They do not confirm eligibility by themselves.</p>
              </Block>

              <Block title="Questions to ask a caseworker">
                <ul className="space-y-1.5">
                  {c.questionsForCaseworker.map((q, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-ink"><span className="text-teal-500">?</span>{q}</li>
                  ))}
                </ul>
              </Block>

              <Block title="Script I can read or send">
                <p className="rounded-lg bg-mist p-3 text-[13px] leading-relaxed text-ink">&ldquo;{c.caseworkerScript}&rdquo;</p>
              </Block>
            </div>

            <p className="mt-5 text-[12px] text-slate2">
              Reminder: this is decision support only. Only the program or agency can confirm eligibility.
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-teal-700">{title}</p>
      {children}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-[13px] text-slate2"><span className="mt-0.5 text-teal-500">&#9744;</span>{it}</li>
      ))}
    </ul>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch] as string));
}
