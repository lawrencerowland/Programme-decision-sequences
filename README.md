# Programme decision sequences

Inspectable experiments in programme decisions under uncertainty: the original two-tab simulator plus a separate exact decision-tree essay.

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

Run the dependency-free smoke checks with:

```text
npm test
```

The checks evaluate the model embedded in `index.html`: deterministic seeds, finite outputs, ramp-feasible decisions, four policy classes, path lengths and scenario-tree structure.

## Portfolio Wave handshake

`FORAY-PROG-DECISION-SEQ · R-005`

2026-09-06 extension: `FORAY-PROG-DECISION-SEQ · R-009` — evidence earns value through feasible future choices before commitment. Original apps and provenance snapshots retained. The earlier DLA tail-policy limitation is now explicit; its numerical behaviour has not been silently changed.

This repository is the experiment-layer receiver for the local Portfolio Wave foray. The return receipt records what the prototype changed in the plan and intent layer.

The [evidence essay](evidence.html) now opens with a clickable policy fork, expected-value bridge, evidence-arrival lanes and belief/decision-boundary chart. All six examples drive the visuals; the solver, original simulator and detailed calculations are retained unchanged. This extends the explanation, not the programme model. See [the visual verification note](EVIDENCE_METHOD.md#visual-explanation--6-september-2026).
