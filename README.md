# Programme decision sequences

Inspectable experiments in programme decisions under uncertainty. [Browse all eight experiments](experiments.html): the original two-tab simulator, a separate exact decision-tree essay, and six maintained teaching companions. Each model retains its own assumptions and evidence status.

## Decision experiments catalogue

- [Project decision framing](apps/project-framing/): editable model worksheet.
- [Two climate decision paths](apps/climate-decision-paths/): narrated path diagram, playback and SVG export.
- [Climate policy simulator](apps/climate-policy-simulator/): seeded policy comparison, fixed world truth versus belief, paths, ribbons and R/I/B framing.
- [Climate SDAM snapshot](apps/climate-sdam-report/): historical precomputed charts, Sankey and framing; unavailable generating solver and unverified coefficients.
- [Weekly IT project game](apps/weekly-it-project-game/): hiring, constrained resource allocation, uncertain outcomes and decision history.
- [IT project decision tutorial](apps/it-decision-tutorial/): six-step formulation guide; no executing solver.

These companions were moved after their September repairs. Their maintained source, tests, provenance and rebuild instructions are documented in [the migration record](docs/decision-migration.md).

## New essay: evidence before commitment

Open [When is evidence worth waiting for?](evidence.html). Reserve a one-bus or three-bus shuttle for a fictional mountain festival, wait for fresh booking counts, or pay for a demand survey before the hire hold expires. Six worked experiments distinguish uncertainty reduction, decision value, evidence latency, routine versus commissioned evidence, adaptive stopping, and a first test whose value lies in guiding a second one. Every possible policy path is inspectable. Applied settings are retained in the page URL; no programme record or file is created.

The finite solver conditions on received evidence, never hidden truth. An independent check evaluates 673,596 deterministic policies across 1,701 two-review configurations. It is exact for the declared toy model, not a real transport plan or evidence of practitioner value. [Model and verification contract](EVIDENCE_METHOD.md).

The public entry page is [`index.html`](index.html):

1. **Sequence & belief** makes the repeating `S_t → x_t → W_{t+1} → S_{t+1}` structure explicit, runs one realised path and shows how arriving information changes the decision state.
2. **Policy lab & framing** compares small representatives of Powell's four policy classes, visualises many paths and a scenario tree, and helps frame a recurring management decision around its information cadence.

Open `index.html` directly in a modern browser. It is self-contained and makes no network requests.

## Why this version exists

Two earlier HTML prototypes had useful ingredients but mixed together several distinct ideas. This version keeps their intent and corrects the analysis before treating it as a public experiment:

- Powell's four classes are **policy function approximation (PFA), cost function approximation (CFA), value function approximation (VFA), and direct lookahead approximation (DLA)**.
- Reinforcement learning is not substituted for DLA as the fourth class; RL methods can instantiate or combine policy classes.
- A branching scenario view is called a **scenario tree**, not Monte Carlo tree search. This code does not implement action exploration, visit counts or value backup.
- Information received since the previous decision is part of `S_t`; current exogenous information `W_{t+1}` arrives after `x_t` and is used to form `S_{t+1}`.
- Latent simulator truth is separated from the information available to the decision-maker.
- All climate and programme coefficients are labelled **illustrative**. The tool is not a climate forecast, calibrated programme model or engineering-assurance product.
- The old all-path target miss is treated as a feasibility/reachability warning, not evidence of an “excellent” policy.

The full modelling and correction record is in [`METHOD.md`](METHOD.md).

## Evidence status

| Layer | Status |
|---|---|
| Sequential-decision structure and policy taxonomy | Source-backed by the Powell material listed below |
| RL framing | Source-backed at the level of basic state/action/reward/policy distinctions |
| Browser model and four representatives | Prototype-tested code |
| Climate and programme dynamics | Illustrative assumptions only |
| Policy superiority or real-world safety | Not established |

## Sources used

- Warren B. Powell, *Sequential Decision Analytics and Modeling: Modeling with Python* (2022).
- Warren B. Powell, *Reinforcement Learning and Stochastic Optimization: A Unified Framework for Sequential Decisions* (2022).
- Warren B. Powell, “A Unified Framework for Stochastic Optimization” (2018).
- Richard S. Sutton and Andrew G. Barto, *Reinforcement Learning: An Introduction*, second edition (2018).
- Powell's public case-study implementation repository: [wbpowell328/stochastic-optimization](https://github.com/wbpowell328/stochastic-optimization).

No copyrighted source PDFs are included.

## Original-code provenance

The two February 2026 HTML files are retained unchanged under [`archive/originals/`](archive/originals/) as provenance snapshots. They are not the validated or recommended entry surface. The local foray prompt is included under [`source/`](source/) to preserve the experiment's purpose and method.

## Checks

Install the locked toolchain and run all checks with Node 22 or later and pnpm 11.19.0:

```text
pnpm install --frozen-lockfile
pnpm test
pnpm run build:check
```

The original specialist-model tests remain dependency-free. The full suite additionally tests the imported model, React interactions and migration routes. `pnpm run build` regenerates only the two React routes and their shared assets. The existing branch-based GitHub Pages arrangement remains unchanged; generated assets are checked in alongside maintained sources.

The checks evaluate the model embedded in `index.html`: deterministic seeds, finite outputs, ramp-feasible decisions, four policy classes, path lengths and scenario-tree structure.

## Portfolio Wave handshake

`FORAY-PROG-DECISION-SEQ · R-005`

2026-09-06 extension: `FORAY-PROG-DECISION-SEQ · R-009` — evidence earns value through feasible future choices before commitment. Original apps and provenance snapshots retained. The earlier DLA tail-policy limitation is now explicit; its numerical behaviour has not been silently changed.

This repository is the experiment-layer receiver for the local Portfolio Wave foray. The return receipt records what the prototype changed in the plan and intent layer.

The [evidence essay](evidence.html) now opens with a clickable policy fork, expected-value bridge, evidence-arrival lanes and belief/decision-boundary chart. All six examples drive the visuals; the solver, original simulator and detailed calculations are retained unchanged. This extends the explanation, not the programme model. See [the visual verification note](EVIDENCE_METHOD.md#visual-explanation--6-september-2026).
