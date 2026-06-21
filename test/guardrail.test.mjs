// Guardrail test — runnable with: npm test  (no build step, no deps)
//
// This mirrors src/lib/guardrail.ts. It verifies that forbidden over-promising
// phrases are detected and neutralized, and that sample output strings from the
// app contain none of them. Keeping a copy here lets the test run with plain
// `node --test` without a TypeScript loader; the logic is intentionally tiny
// and identical to the source so it stays a faithful check.

import { test } from 'node:test';
import assert from 'node:assert/strict';

const FORBIDDEN_PHRASES = [
  'you qualify',
  'you are eligible',
  "you're eligible",
  'guaranteed',
  'approved',
  'confirmed eligible',
];
const REPLACEMENTS = {
  'you qualify': 'you may qualify',
  'you are eligible': 'you may be eligible',
  "you're eligible": 'you may be eligible',
  'guaranteed': 'possible (verify with an official source)',
  'approved': 'worth checking',
  'confirmed eligible': 'possibly eligible — verify',
};
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function sanitizeText(input) {
  let clean = input;
  const violations = [];
  for (const phrase of FORBIDDEN_PHRASES) {
    const re = new RegExp(escapeRegExp(phrase), 'gi');
    if (re.test(clean)) {
      violations.push(phrase);
      clean = clean.replace(re, REPLACEMENTS[phrase.toLowerCase()] ?? '[removed]');
    }
  }
  return { clean, violations };
}

test('detects each forbidden phrase', () => {
  for (const phrase of FORBIDDEN_PHRASES) {
    const { violations } = sanitizeText(`Result: ${phrase} for this program.`);
    assert.ok(violations.includes(phrase), `should flag "${phrase}"`);
  }
});

test('is case-insensitive', () => {
  const { violations } = sanitizeText('YOU QUALIFY for Medicaid');
  assert.ok(violations.includes('you qualify'));
});

test('neutralizes "you qualify" into "you may qualify"', () => {
  const { clean } = sanitizeText('Good news, you qualify!');
  assert.ok(/you may qualify/i.test(clean));
  assert.ok(!/\byou qualify\b/i.test(clean));
});

test('clean copy passes through unchanged', () => {
  const safe = 'You may qualify for Medicaid-style support — verify with an official source.';
  const { clean, violations } = sanitizeText(safe);
  assert.equal(violations.length, 0);
  assert.equal(clean, safe);
});

test('sanitized output of forbidden input is itself clean', () => {
  const { clean } = sanitizeText('You are eligible and approved, guaranteed.');
  const second = sanitizeText(clean);
  assert.equal(second.violations.length, 0);
});

test('sample app strings contain no forbidden phrases', () => {
  const samples = [
    'Medicaid-style coverage may be worth pursuing.',
    'Possibly eligible — verify with an official source.',
    'Likely not eligible — here is an alternative option.',
    'This tool provides decision support only.',
    'Only the program or agency can confirm eligibility.',
    // New-feature copy (roadmap, checklist, panels):
    'Suggested first verification step',
    'This roadmap helps you prepare for verification. It does not confirm eligibility.',
    'The app never makes final eligibility decisions.',
    'The deterministic rules engine controls verdict labels — not the language model.',
    'This confidence level reflects how complete and clear your intake information is.',
    'These links help you verify next steps. They do not confirm eligibility by themselves.',
    'Start with Medicaid.gov or your state Medicaid office',
    'Contact a community health center (HRSA Find a Health Center)',
  ];
  for (const s of samples) {
    assert.equal(sanitizeText(s).violations.length, 0, `unexpected violation in: ${s}`);
  }
});

test('roadmap stage titles use cautious framing', () => {
  // The five-stage roadmap must never assert eligibility in a heading.
  const titles = ['Right now', 'Before contacting anyone', 'Suggested first verification step', 'This week', 'Before applying'];
  for (const t of titles) assert.equal(sanitizeText(t).violations.length, 0);
});
