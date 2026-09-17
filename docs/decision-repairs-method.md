# Decision tools: repair record

17 September 2026. The repairs below were first published at the original Project-web-apps URLs. The repaired tools now live in this specialist collection; the [migration record](decision-migration.md) identifies their maintained routes and source provenance. Their useful interactions and model code are preserved.

## Sequential decisions

`apps/climate-policy-simulator/index.html` keeps the model, policy, single-path, many-path, action-ribbon and full physical/information/belief framing sections.

Before the repair, the five policy labels selected temperature threshold rules; the benchmark was a hard-coded table. The variable `mu` simultaneously drove the physical world and purported to be the learner's estimate, and `true_k` reported its final mutable value. The belief update moved in the wrong direction for the model's negative effectiveness coefficient, while its uncertainty shrank regardless of exposure. Horizon and run controls were not validated, and the ensemble ignored the single-path horizon/seed. The climate-example button reset only the cadence.

The repaired app uses an independently callable pure model embedded in the same HTML:

- The world holds a **fixed** effectiveness `k` and actual temperature. The manager holds estimated temperature, deployed scope, funding balance, observed readiness, posterior mean/variance and the latest observation/prediction. Policies do not receive world truth or future shocks.
- A decision selects a scope increment of at most 0.05 (with scope in [0,1]), monitoring low/medium/high and governance low/medium. Readiness follows a bounded illustrative update. The world then produces its process, measurement, governance and cost shocks.
- Under exposure `a = scope × (0.45 + 0.75 × readiness)`, the trend observation is `y = g - a*k + process_noise + measurement_noise`. The Gaussian update uses `h=-a`, known noise variance `R=processSD²+measurementSD²`, posterior variance `v' = vR/(h²v+R)` and mean `mu' = mu + vh/(h²v+R) × (y-(g+h*mu))`. Zero exposure gives no information about effectiveness. The normal prior can assign weight to ineffective or adverse outcomes; it is not a calibrated physical prior.
- Estimated temperature accumulates observed trends. Actual temperature is a separate diagnostic revealed in the completed-run view. Scoring uses realised world outcomes; decisions use their information state. Monitoring never edits the latent coefficient.
- The stage score is `70*(T-target)² + 140*max(0,T-target)² + spend + 0.6*(1-ready)² + 0.4*abs(scopeChange) + 0.04*max(0,-balance)²`, discounted by 0.985 per quarter. Funding balance is a **soft** model limit: a negative balance is an unfunded path, not authorisation to spend. Scope/readiness and user input ranges are hard bounded.

The policy representatives now have distinct mechanisms:

| Representative | Actual calculation | Limit |
| --- | --- | --- |
| PFA | Direct six-quarter trend/risk rule for scope, posterior variance rule for monitoring and readiness rule for governance | Hand-designed parameters, not fitted |
| CFA | Enumerates up to 18 first actions and minimises belief-mean immediate score plus a conservative-temperature penalty and posterior-variance penalty | Modified one-step objective; penalties are illustrative |
| VFA | Enumerates first actions and minimises belief-mean immediate score plus an explicit downstream-value approximation | Hand-written value, not learned or optimal |
| DLA | Enumerates first actions, projects up to four quarters and follows the PFA tail after the first choice | Deterministic belief-mean rollout; no exhaustive future policy search or exact value of information |
| Hybrid | The DLA calculation plus the VFA approximate remaining value at its boundary | Inherits both approximations |

The CFA/VFA/DLA calculations plug projected mean states into nonlinear loss; they do not integrate loss over the full uncertainty distribution. Rollouts leave the posterior mean unchanged under expected observations and contract its variance using anticipated exposure/measurement precision. This is a certainty-equivalent approximation. No rollout receives the hidden coefficient, sampled future world shocks, or a privileged future tail policy. It does not branch on future observations and does not claim an exact information-constrained optimum.

The default hidden coefficient is now explicitly 0.018 and the initial belief mean 0.009, making the learning distinction inspectable. Both are visible *scenario-author* controls; the policy interface receives neither the hidden control nor the simulator world. Changing the hidden coefficient may change later observations and hence later actions, but cannot change the initial choice when the information state is identical.

Every refresh rebuilds the benchmark, single path and ensemble from the same validated horizon, assumptions and seed batch. Each policy sees the same four underlying standard-normal shocks per quarter for a given seed; action-dependent monitoring scales measurement noise. Means, standard deviations and target-miss fractions are calculated from those actual runs. Changing horizon, run count, seed, target, world effectiveness, prior mean or funding balance changes the computed comparison. Sample rankings are not general policy-class rankings or real-world validation.

The full R/I/B framing tool is retained. Loading the climate example now resets all its fields. “Cumulative” and “terminal” objective labels no longer incorrectly equate those choices with online/offline learning.

## Historical climate SDAM report

`apps/climate-sdam-report/index.html` remains a historical precomputed report. Every original Plotly script and chart payload is unchanged. The framing sample loader now joins array items with real newline characters, so Generate frame returns separate decision and R/I/B entries instead of one literal-backslash-n string. A prominent status explanation distinguishes inspecting stored figures from rerunning a solver, records the unavailable generating solver and unverified coefficients, and links to the rerunnable local tool. The unsupported “excellent director” label is removed. The quarter timing now explicitly places decisions before new information. Sankey frequencies are labelled simulated-sample frequencies rather than real observations.

## Two-path explainer

`apps/climate-decision-paths/index.html` keeps its two paths, node narratives, stepping, playback and SVG download. Private file-service links and raw internal citation tokens are replaced by public primary sources. Internal canvas instructions are removed from the public reference list. Escaped node notes link to the public sources section. The definition of new information allows its distribution to depend on the state/action (for example monitoring), while maintaining that it is unknown at the current choice.

## Framing questionnaire

`apps/project-framing/index.html` adds the missing fifth model element: an editable transition rule, included safely as text in the generated summary. All previous fields remain. Source links and the before/after information timing are clarified.

## Sources checked

These sources support the framework and taxonomy, not the invented numerical model:

- Warren B. Powell, [The universal modeling framework](https://warrenpowell.org/universal-modeling-framework/).
- Warren B. Powell, [Policies](https://warrenpowell.org/policies/).
- Warren B. Powell, [State variables](https://warrenpowell.org/statevariables/).

The path explainer's climate references were reopened on 17 September 2026: [NASA GISTEMP](https://data.giss.nasa.gov/gistemp/), [Met Office HadCRUT5](https://www.metoffice.gov.uk/hadobs/hadcrut5/), [Copernicus temperature](https://climate.copernicus.eu/climate-indicators/temperature), [University of Washington MCB research](https://atmos.uw.edu/faculty-and-research/marine-cloud-brightening-program/), and [Harvard SGRP](https://salatainstitute.harvard.edu/research-initiatives/the-harvard-solar-geoengineering-research-program/) (SCoPEx ended March 2024). They provide context, not evidence that the fictional 2028 scenarios are forecasts.

## Checks

Run `node tests/decision-repairs-model.cjs`. Its 19 checks cover syntax for all four pages, strict finite/bounded inputs, repeatability, fixed truth versus learning, initial-choice nonanticipation, invariance of past actions to altered future shocks, an independent precision-form posterior calculation, zero-exposure learning, world/spend/balance laws, objective minimisation, distinct algorithm families, path bounds, even-sample median/quantile interpolation, matching-seed benchmark aggregation, benchmark sensitivity to every assumption, byte-preserved historical chart payloads, sample-load/newline framing round-trip, public sources and the transition-summary output.

Browser interaction and publication checks are recorded separately by the releasing task. These tests establish properties of the declared toy implementation; they do not establish climate validity, practitioner benefit or optimal policies.
