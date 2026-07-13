# Method and correction record

## Purpose

The experiment asks whether a project or programme can gain useful structure from sequential-decision modelling even before it has a validated reinforcement-learning model.

The practical distinction is the important one:

- a **schedule action** says what work happens;
- a **management decision** changes the authorised programme position;
- an **uncertainty-reduction action** changes what can be known before a future decision.

The app makes those movements inspectable on a quarterly cadence.

## Powell-style model first

### Narrative

A stylised climate-engineering programme reviews its position each quarter. Management adjusts intervention effort and evidence-gathering effort. Climate variation, observation error and execution error arrive after the decision. The next decision state includes the updated programme position and beliefs about background drift and intervention effectiveness.

This is a teaching scenario. It is not a representation of a deployable climate intervention.

### Core elements

- **Metrics:** programme cost, schedule pressure, target exceedance and belief uncertainty.
- **Decisions:** programme effort and information effort, constrained by a quarterly ramp limit.
- **Uncertainty:** background drift, intervention effectiveness, climate noise, observation noise and execution error.

### Five model dimensions

1. **State `S_t`:** observed temperature estimate, last signal, current effort, programme cost, schedule pressure, posterior means and covariance for drift/effectiveness, and the feasible decision boundary.
2. **Decision `x_t`:** intended programme effort `u_t ∈ [0,1]` and information effort `m_t ∈ [0,1]`.
3. **Exogenous information `W_{t+1}`:** climate variation, observation error and execution error arriving after `x_t`.
4. **Transition `S^M`:** a stylised temperature update plus a two-parameter recursive Bayesian/least-squares belief update and simple programme cost/schedule dynamics.
5. **Objective:** cumulative programme cost, target exceedance and schedule pressure, plus a terminal target penalty.

The compact sequence is:

`(S_0, x_0, W_1, S_1, x_1, W_2, …, S_T)`

An important timing correction follows: information already received before quarter `t` belongs in `S_t`. A policy must not use `W_{t+1}` when selecting `x_t`.

## Illustrative transition

The simulator keeps a latent world state so that it can distinguish truth from the manager's information state:

```text
implemented effort = clamp(chosen effort + execution error)
latent change      = true drift - true effectiveness × implemented effort + climate noise
observation        = latent change + observation error(information effort)
observed level     = previous observed level + observation
```

The manager learns the coefficients in:

```text
observation ≈ drift - effectiveness × implemented effort
```

using a two-parameter recursive update. Information effort reduces observation variance but has an explicit cost. This gives the decision-maker a reason to attend to uncertainty rather than only control the physical programme.

The linear equations and weights are chosen for clarity and numerical behaviour. They are not estimated from climate or programme data.

## Four policy representatives

The representatives demonstrate the taxonomy; they do not cover the full mathematical or algorithmic range of each class.

| Class | Representative in this app | Important limitation |
|---|---|---|
| PFA | Direct set-point rule from state and belief uncertainty to programme and information effort | Hand-designed and not fitted |
| CFA | Candidate action chosen by a one-step objective modified with target-margin and uncertainty penalties | The modification is illustrative |
| VFA | Candidate action chosen from immediate cost plus an approximate downstream value | The value approximation is hand-designed |
| DLA | Candidate action chosen by sampled four-quarter lookahead with a simple tail policy | Short horizon, approximate model, not MCTS and not globally optimal |

RL may be useful later for policy search, value learning or decision-time planning. It is gated here behind repeated decisions, dependable feedback, a stable representation and safe policy evaluation.

## Policy evaluation

The policy lab uses the same scenario seeds across policy classes—common random numbers—so differences are less dominated by unrelated random draws. It reports:

- median final observed level;
- probability of ending above the illustrative guardrail;
- median programme cost;
- 90th-percentile model objective;
- a per-quarter P10–P90 fan chart.

These metrics evaluate the toy model, not the real world. A lower toy-model objective is evidence only that a representative performs better against the chosen equations and weights.

## Branching paths

The scenario tree branches on low, expected and high information signals for three quarters. At each node the selected policy maps the current state to the next decision.

The original prototype described its branching view as an ingredient for MCTS. The public app makes the boundary firmer: it is a scenario tree. MCTS would additionally require action selection/exploration, node statistics and value backup from rollouts.

## Corrections from the initial prototypes

| Initial analysis or code | Correction in this repository |
|---|---|
| PFA, CFA, ADP and RL shown as Powell's four classes | PFA, CFA, VFA and DLA shown explicitly; ADP/RL treated as method families |
| Random scenario branching discussed as MCTS | Relabelled scenario tree; MCTS claims removed |
| “Cautious” policy described as temperature-responsive but used only schedule/carbon thresholds | Every live representative uses the information/belief state explicitly |
| Temperature alternated between state and exogenous information without a timing boundary | Latent world, observation, information arrival and pre-decision state are separated |
| Parameters described as calibrated or IPCC-grounded without an auditable calibration record | All coefficients labelled illustrative; no forecast claim |
| “Excellent director” label despite a 100% target miss in the earlier run | Target miss interpreted as possible reachability, model or policy failure |
| Objective mentioned but not operational in the policy | Objective weights are explicit and used in evaluation; their subjectivity is stated |
| Static trajectory images mixed with live simulation | Live charts are regenerated from the current model and controls |

## Safe interpretation

This experiment can support a conversation about decision timing, information requirements, feasible actions, policy transparency and model risk.

It cannot establish climate efficacy, programme affordability, an optimal intervention, a safe action or an evidence-backed management recommendation. Moving beyond the toy model would require domain review, calibrated transition/evidence models, reference-class data, governance constraints, independent validation and explicit assurance gates.

