# CarePath Navigator — Technical Manifest

A factual disclosure of tools, data, and methods used in this prototype.

---

## 1. AI tools, libraries, and APIs used (free vs. paid)

| Item | Role in the project | Free or paid |
|------|---------------------|--------------|
| **Deterministic rules engine** (`src/lib/rulesEngine.ts`, custom code) | Decides every eligibility verdict label and confidence score. No external service. | Free (own code) |
| **Mock NLP / reasoning layer** (`src/lib/nlpNormalize.ts`, `src/lib/nlpExplain.ts`, custom code) | Normalizes messy/variable input into structured fields, detects ambiguity, and produces plain-language explanations, next steps, glossary, and the caseworker script. Runs deterministically with **no API key**. | Free (own code) |
| **Output guardrail** (`src/lib/guardrail.ts`, custom code) | Scans all user-visible text and neutralizes forbidden over-promising phrases. | Free (own code) |
| **Verification roadmap generator** (`src/lib/roadmap.ts`, custom code) | Builds a personalized five-stage roadmap and the cautious "suggested first verification step" from the deterministic results. Pure preparation guidance; sets no verdicts. | Free (own code) |
| **Verification checklist generator** (`src/lib/checklist.ts`, custom code) | Assembles the copy/print personal action plan (situation summary, options to verify, documents, official starting points, caseworker questions, script). Guardrail-checked. | Free (own code) |
| **Optional Real LLM Mode** (`src/lib/realLlm.ts`) | *Dormant unless explicitly enabled.* Can route only the **explanation layer** to a hosted LLM (configured for the Anthropic Messages API as the example provider). Returns the same JSON shape as Mock AI Mode. Never sets verdict labels. | Optional / **paid only if enabled**. The app runs fully free without it. |
| **React 18 + Vite 5** | UI framework and dev/build tooling. | Free, open source |
| **TypeScript 5** | Type safety across the rules/NLP/UI contract. | Free, open source |
| **Tailwind CSS 3 + PostCSS + Autoprefixer** | Styling. | Free, open source |
| **Google Fonts (Fraunces, Inter)** | Typography, loaded via CDN `<link>`. | Free |
| **Node.js built-in test runner** (`node --test`) | Runs the guardrail test; no testing framework dependency. | Free |

**No paid API key is required to run, demo, or evaluate this prototype.** Real LLM Mode is the only
component that could incur cost, and only if a participant deliberately enables it.

---

## 2. Data sources / synthetic-data methods

- **No real user data is used.** All demo scenarios are synthetic (`src/presets/presets.ts`).
- **No live government data is fetched or scraped.** Eligibility thresholds are synthetic constants
  defined in `src/data/programs.ts`.
- **External links** point to stable, generic government/referral starting points
  (Benefits.gov, HealthCare.gov, Medicaid.gov, HRSA "Find a Health Center", 211). They are labelled
  in the UI as **verification starting points, not proof of eligibility**. No data is sent to them;
  they are plain outbound links the user can choose to open.
- **No personal data leaves the browser** in Mock AI Mode. The intake intentionally does not collect
  name, SSN, address, exact date of birth, immigration status, or medical diagnosis.

### What changed in this iteration (still no new data sources)
This iteration added the verification roadmap, the copy/print verification checklist, the
per-card confidence breakdown, and several judge/impact panels (Before vs After, Social Impact,
Responsible AI design choices, Official verification starting points, plain-language translator,
"why this is not just a directory", demo-flow helper, prize-fit). **All of these are generated from
the existing synthetic rules and the user's own in-browser intake.** No new datasets, no new APIs,
no live government scraping, and no real user data were introduced. The synthetic thresholds are
unchanged. The new confidence-breakdown text mirrors the existing deterministic scoring logic.

---

## 3. How the synthetic thresholds were created

All thresholds are **simplified, synthetic, and not real or current law**, and are not
state-specific (real Medicaid is). They are *loosely inspired* by the shape of real U.S. Federal
Poverty Level (FPL) guidelines — a base amount plus a per-person increment — using deliberately
round, obviously-synthetic numbers (`src/data/programs.ts`):

```
Synthetic FPL base (household of 1) = $15,000
Synthetic per-additional-person     = $5,300
Synthetic FPL(n) = 15000 + (n - 1) * 5300
```

Program ceilings are then expressed as a **percent of this synthetic FPL**, echoing how real
programs phrase limits (e.g. "138% FPL", "400% FPL"), again with round synthetic percentages:

| Program | Synthetic % FPL ceiling | Notes |
|---------|------------------------|-------|
| Medicaid-style coverage | 138% | Echoes a common expansion figure (synthetic) |
| ACA Marketplace subsidies | 400% | Echoes a common subsidy reference point (synthetic) |
| Community health center sliding scale | 200% | Sliding scale modeled as broadly available |
| Hospital financial assistance / charity care | 250% | Plus an "immediate need" path |
| CHIP (children) | 250% | Only evaluated when dependents are reported |
| Emergency Medicaid (informational) | 138% income shape | Surfaced only on immediate need or an immigration-related concern; presented as informational and routed to human verification — status is never assessed |

Income entered by the user is annualized, compared to the synthetic FPL for the household size, and
turned into a percent. A `thresholdDistance` (how far above/below the ceiling) drives both the
status label and the confidence score. Variable/unsure income, a missing household size, and
borderline distances all **lower** confidence so uncertainty is visible rather than hidden.

These numbers exist solely to demonstrate auditable rule logic. They must not be presented to a user
as a real eligibility determination.

---

## 4. AI-assisted coding disclosure

Per the hackathon rules, **any use of AI tools to help build this project must be disclosed
separately by the participant** in the Devpost "Tools Used" field. This manifest documents the AI
capabilities *inside the running application*; it does not substitute for the participant's own
disclosure of AI coding assistance used during development. Transparency is required and does not
disqualify a submission.
