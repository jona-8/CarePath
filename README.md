# CarePath Navigator

**Healthcare Benefits Navigator for uninsured or underinsured young adults in the United States.**

A polished, mobile-responsive decision-support web app that helps a college student, recent
graduate, part-time worker, or gig worker move from *"I have no idea where to start"* to
*"Here are the healthcare support options I may be able to explore, why they showed up, what I
still need, and what to do next."*

Built for the **USAII Global AI Hackathon 2026** — Undergraduate Track, Challenge Brief 4
(*Fix Systems People Depend On*), Direction A (*Benefits Navigator*).

> ⚠️ **This tool provides decision support only.** It is not a legal, financial, medical, or
> official eligibility determination. Only the program or agency can confirm eligibility. All
> eligibility thresholds in this prototype are **simplified and synthetic** — not real law.

---

## Quick start

Requires **Node.js 18+** (Node 20/22 recommended).

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default **http://localhost:5173**).

To run the responsible-AI guardrail test:

```bash
npm test
```

To build for production:

```bash
npm run build
npm run preview
```

---

## How to demo it (for judges)

1. On the landing screen, click **Open Judge Demo Mode**. A collapsible
   **"Recommended 3–5 minute demo flow"** helper sits at the top of that screen.
2. Pick any of the four one-click presets. Each fully populates the guided intake and runs the
   whole pipeline end-to-end:

   | Preset | Scenario | What you should see |
   |--------|----------|---------------------|
   | **A** | College student, low part-time income, no dependents | Medicaid-style support and sliding-scale clinic care surface as **"You may qualify"** |
   | **B ⭐ (recommended)** | Gig worker with variable income near a threshold | Ambiguity detected, variable range annualized, **confidence lowered**, missing-info surfaced, first step routed to a caseworker, everything framed as verification |
   | **C** | Recent grad, moderate income, no employer plan | **ACA Marketplace subsidy** pathway with premium tax credits explained in plain language |
   | **D** | User with an immigration-related concern | App **never asks immigration status**; shows informational guidance incl. Emergency Medicaid; routes to human verification |

3. On the results dashboard, open **"Why this result?"** and **"Why this confidence level?"** on any
   card, click **"Create my verification checklist"** (then **Copy** or **Print** it), and open the
   **Architecture** panel → **"Show evidence for judges"** to see inputs collected, what the AI
   interpreted, which deterministic rule fired, and what the app refused to decide.

### Recommended 3–5 minute judge demo flow

1. Frame the problem: healthcare rules are confusing for uninsured young adults.
2. Open **Judge Demo Mode**.
3. Select the **gig worker preset (B)** — the flagship journey.
4. Show how the app interprets **variable income and uncertainty** in the interpreting state.
5. Open **"Why this result?"** on a card.
6. Open **"Why this confidence level?"** to show what raised/lowered confidence and the missing-info list.
7. Scroll to **"Your verification roadmap"** and the highlighted **Suggested first verification step**.
8. Click **"Create my verification checklist"** and **Copy/Print** it.
9. Show the **Talk to a real person** handoff and **Official verification starting points**.
10. End on responsible AI: the **Responsible AI design choices** panel and the fact that the app
    never makes the final decision.

### Why Preset B is the strongest demo

Preset B is the flagship because it exercises every part of the pipeline at once: the NLP layer
annualizes a variable income *range* (not a single number) and flags it as uncertain; the
deterministic engine still produces a cautious status; confidence is **lowered** because income is
variable and the result is near a synthetic threshold; the missing-information list appears; the
roadmap routes the **first** verification step to a caseworker rather than an application; and the
checklist + human-handoff script give the user something concrete to act on. It is the clearest
single story for AI reasoning, uncertainty handling, and responsible AI.

You can also click **Start guided check** to walk the intake manually.

---

## Feature list

Core flow: confused user → guided intake → AI/NLP interpretation → deterministic rules reasoning →
cautious result → verification roadmap → human handoff → safer access to healthcare support.

Results dashboard (top to bottom):
- **Grouped result cards** — *You may qualify* / *Possibly eligible — verify* / *Likely not eligible — alternative*.
- **"Why this result?"** — the exact intake answers and threshold distance that drove each card.
- **"Why this confidence level?"** — a transparent breakdown of what *raised* and *lowered*
  confidence (variable income, missing household size, borderline distance, state verification),
  with a clear note that confidence is **not** a final eligibility decision.
- **Comparison table** across all options.
- **Your verification roadmap** — a personalized five-stage plan: *Right now → Before contacting
  anyone → This week → Before applying*, plus a highlighted **Suggested first verification step**,
  warnings for low-confidence/missing-info cases, and an embedded responsible-AI note.
- **Your personal action plan** — a one-click **verification checklist** (situation summary, options
  to verify, missing info, documents to gather, official starting points, caseworker questions, and
  an auto-filled script) with **Copy** and **Print** buttons.
- **Talk to a real person** — human handoff with an auto-filled caseworker script. *It only scrolls
  into view when the user clicks a handoff button; the page always lands at the top of the results.*
- **Official verification starting points**, a **state-specific limitation note** with a 3-step
  verification path, and a **plain-language translator** ("Confusing terms, translated").
- **Impact framing** — a **Before vs After** ("What changed for the user?") panel and a
  **Social impact: reducing friction** panel.
- **Responsible AI** — a **Responsible AI design choices** panel, the **architecture + "evidence for
  judges"** panel (including *what the app refused to decide*), a **"Why this is not just a
  directory"** summary, and a **synthetic-data transparency** panel.
- **Judge aids** — a **"Recommended 3–5 minute demo flow"** helper (also in Judge Demo Mode) and a
  **"Why this project fits the awards"** (Prize Fit) panel.

### How the verification checklist / action plan works
Click **"Create my verification checklist"** on the results page. It assembles a personalized,
copy/print-ready plan from the deterministic results and your normalized intake. **Copy checklist**
writes a plain-text version to the clipboard; **Print checklist** opens a clean print window
(`window.print()` fallback). It is preparation support only and never confirms eligibility.

### How the confidence breakdown works
The rules engine computes confidence deterministically, then attaches a human-readable list of
factors that *raised* and *lowered* it. The breakdown text mirrors the scoring logic exactly, so the
explanation can never drift from the score. Confidence reflects how complete and clear the intake
is — it is explicitly **not** an eligibility decision.

### Why Mock AI Mode is recommended for the live demo
Mock AI Mode is deterministic and offline: the same preset always produces the same result, with no
API key, no network dependency, and no rate limits. That makes it reliable for a live walkthrough or
a recorded video. Real LLM Mode is an optional upgrade for the explanation layer only and is not
needed to demonstrate the full pipeline.

---

## Two AI modes

The app runs fully **without any API key**.

- **Mock AI Mode (default).** A deterministic NLP-style layer normalizes messy input and explains
  results in plain language. Reliable for live demos and video recording.
- **Real LLM Mode (optional).** If you provide a key, the *explanation layer only* can be produced
  by a real LLM. It returns the **same structured JSON shape** as Mock AI Mode, so the UI never
  changes. **The deterministic rules engine always decides the verdict — never the LLM.** If the
  key is missing or a request fails, the app silently falls back to Mock AI Mode and never breaks.

To enable Real LLM Mode, copy `.env.example` to `.env`, set `VITE_AI_MODE=real`, and add a key.
See `.env.example` for details.

---

## Architecture

```
Guided Intake
  → NLP interpretation (pre-rules normalization + ambiguity detection)
  → Deterministic Eligibility Rules Engine   ← sets the verdict label + confidence
  → Confidence / uncertainty scoring
  → Plain-Language Explanation (Mock AI or optional Real LLM)
  → Human Verification / Next Step
```

**Why a hybrid (rules + NLP) design?**
- **Rules** are best for thresholds and status labels: they are auditable, deterministic, and
  testable, so the same inputs always produce the same verdict.
- **NLP/LLM-style reasoning** is best for the messy first and last mile: turning variable income,
  ambiguous household situations, and free text into clean fields, and turning machine output into
  plain-language explanations and personalized next steps.
- **The LLM never controls the verdict label.** It may only fill explanation text, next steps,
  glossary, the caseworker script, and missing-information notes.

### Responsible-AI guardrail (enforced in code, not just prompting)
`src/lib/guardrail.ts` scans every user-visible string and neutralizes forbidden over-promising
phrases (*"you qualify", "you are eligible", "guaranteed", "approved", "confirmed eligible"*).
The verdict labels themselves are hard-coded by the rules engine. `npm test` verifies this.

### Human-in-the-loop
The app states plainly: *"We help you understand your options. Only the program or agency can
confirm eligibility — you take it from here."* It never submits an application, contacts an agency,
makes a final eligibility decision, or gives medical advice. Human handoff is emphasized for
low-confidence results, borderline thresholds, ambiguous income, immigration-related concerns, and
immediate care needs.

---

## Project structure

```
carepath-navigator/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .env.example                  # optional Real LLM Mode config
├── README.md
├── TECHNICAL_MANIFEST.md         # factual tools/data disclosure
├── test/
│   └── guardrail.test.mjs        # responsible-AI guardrail test (npm test)
└── src/
    ├── main.tsx
    ├── App.tsx                   # screen state machine
    ├── vite-env.d.ts
    ├── types/index.ts            # shared contract between all layers
    ├── data/
    │   └── programs.ts           # SYNTHETIC FPL thresholds + program metadata
    ├── lib/
    │   ├── guardrail.ts          # forbidden-phrase enforcement
    │   ├── nlpNormalize.ts       # NLP layer — PRE-rules (messy → structured)
    │   ├── rulesEngine.ts        # deterministic verdicts + confidence factors
    │   ├── nlpExplain.ts         # NLP layer — POST-rules (plain language)
    │   ├── roadmap.ts            # personalized 5-stage verification roadmap
    │   ├── checklist.ts          # copy/print verification checklist (action plan)
    │   ├── realLlm.ts            # optional Real LLM Mode + safe fallback
    │   └── assessment.ts         # orchestrator wiring the full pipeline
    ├── presets/
    │   └── presets.ts            # four judge demo scenarios (B is the flagship)
    ├── components/               # Landing, JudgeDemo, Intake, Interpreting, Dashboard,
    │   ├── ProgramCard.tsx       #   result card + "why this confidence level?"
    │   ├── VerificationRoadmap.tsx
    │   ├── ChecklistPanel.tsx    #   create / copy / print action plan
    │   ├── HumanHandoff.tsx      #   caseworker script (manual-scroll only)
    │   ├── ImpactPanels.tsx      #   before/after, social impact, responsible-AI,
    │   │                         #   official sources, translator, demo, prize-fit
    │   ├── Panels.tsx            #   architecture + evidence-for-judges
    │   └── ...                   #   ComparisonTable, ui primitives
    └── styles/index.css
```

---

## Privacy-conscious by design

The intake never asks for name, SSN, address, exact date of birth, **immigration status**, medical
diagnosis, or other unnecessary sensitive data. If a user mentions an immigration concern in free
text, the app does **not** classify status — it explains that rules can be situation-specific and
routes the user to official or human verification. No data leaves the browser in Mock AI Mode.

---

## Award alignment

This prototype is built to be strong across all judging categories and visibly competitive for the
specialty awards. (This describes design intent and alignment, not a claim of any outcome.)

**Responsible AI Design** — visible *inside the app*, not only here:
- Cautious "may qualify" language enforced in code (`guardrail.ts`) and verified by `npm test`.
- Deterministic verdicts; the LLM never decides eligibility.
- A confidence breakdown that shows what raised/lowered certainty.
- A missing-information checklist on every relevant card.
- Synthetic-data transparency panel and a "what the app refused to decide" evidence block.
- Privacy-by-design intake; **no immigration-status collection** under any condition.
- High-risk/unclear cases routed to human verification.

**Social Impact** — access-to-support friction made visible:
- Before vs After impact panel and a "reducing friction" panel.
- A personalized verification roadmap and a copy/print action-plan checklist.
- An auto-filled caseworker script and official verification starting points.
- Plain-language translator and accessible, mobile-friendly UX.

**Grand Prize / Runner-Up / Third Place** — a complete, polished, demo-ready prototype with a real
user journey, a clear hybrid AI-reasoning pipeline (not a directory), safe and useful outputs, and a
tight 3–5 minute demo path centered on Preset B.

> Reminder: CarePath is **decision support**, not a final eligibility determination.

---

## Disclosure

AI-assisted coding (if used by the participant) must be disclosed separately by the participant in
the Devpost submission. See `TECHNICAL_MANIFEST.md` for tools, data, and synthetic-threshold
methodology.
