# Evidence before commitment

`FORAY-PROG-DECISION-SEQ · R-009` · 2026-09-06

## The advance

The original foray distinguishes scheduled work, management decisions and uncertainty-reduction effort. The first public simulator made their timing visible. This essay computes the interaction of evidence gathering and scope commitment: information is useful through the future choices it can change, given cost, latency and a binding decision horizon. Scheduled delivery is collapsed into fixed scope payoffs, not separately simulated here.

It is a new essay in the same project, not an integrated replacement or a newly established general theory.

## Source and lineage

- Powell, *Sequential Decision Analytics and Modeling: Modeling with Python* (2022), §1.4 (state/decision/information/transition/objective) and §12.4.3 (posterior-dependent value-of-information lookahead). Publisher: [Part I](https://doi.org/10.1561/0200000103), [Part II](https://doi.org/10.1561/0200000103-II).
- [Powell's case-study code](https://github.com/wbpowell328/stochastic-optimization) provides historical implementation context; the new solver is independently written, not a port or reproduction of numerical results.
- [Project_decisions](https://github.com/lawrencerowland/Project_decisions) includes the earlier portfolio lifecycle and decision-cadence exploration. The current repository's two-tab simulator and archived February prototypes are retained.

Source ideas, our modelling assumptions and tested calculations are separate. No copyrighted source PDFs, private source extracts or client data are included.

## Model contract

The fictional mountain-festival organiser must reserve three buses, one bus or no shuttle before the hire hold expires. High/low weekend demand is fixed but hidden during this short booking window. The decision-maker knows a prior probability, not the world. State is `(t,p)` plus fixed known model settings. Actions are full/limited/no shuttle (terminal), wait for a new booking-count signal at the next daily review, or commission a fresh demand survey after its stated latency. A survey is available only if it arrives by final review `T`, inclusive. One review is one day. Bus capacities, fares and operating schedules are not modelled.

Terminal values, in arbitrary net service-value points combining visitor benefit and hire cost:

| Choice | High | Low |
|---|---:|---:|
| Full: three buses | 60 | -40 |
| Limited: one bus | 25 | 5 |
| No shuttle | 0 | 0 |

Limited strictly dominates not proceeding; the latter is only a comparator in this particular fixture. Full overtakes limited at `p > 0.5625`. The model's adaptive stopping is **stopping evidence gathering**, not necessarily cancelling the programme.

Every observation is fresh and conditionally independent given the same hidden world. Positive signal likelihood is `q` in high and `1-q` in low; negative reverses these. Impossible branches are omitted rather than assigned invented posteriors. Bayes updates the belief. No interim decisions or routine observations occur during a test. Signals are independent conditional on the world, not generally independent after marginalising it.

Waiting costs accrue once per elapsed review; a test also charges its fee once. Unavailable late tests are not purchased or charged. Past costs are sunk and do not change continuation choices under this additive objective; the path ledger still subtracts them from total net value. Commitment ends the model and forecloses later evidence benefits here only.

Finite Bellman recursion enumerates all feasible actions and observations. No latent world enters policy selection. Memoisation uses the full JavaScript number string, not rounded belief bins. Floating-point comparisons use a `1e-10` tie tolerance, preferring earlier-listed commitments (limited, full, stop), then routine evidence, then tests. “Exact” means finite enumeration, subject to floating-point arithmetic and that tie convention—not symbolic arithmetic.

## Discriminating results

1. Default `p=.5, qTest=.8, qRoutine=.5, cost=4, waitCost=3, T=2, latency=1`: commit limited =15; wait =14.5; test =17.5. Test signals yield posterior .8/full or .2/limited. Gross one-test value9.5; costs7; net gain2.5.
2. Prior .95: one test reduces uncertainty but both posterior beliefs still select full. Gross one-test value0; best policy commits now at55.
3. Deadline1, latency2: test unavailable; useful hypothetical information cannot change this commitment. Best value15.
4. Routine accuracy .8: wait is preferred to an otherwise equivalent paid test; net value21.5.
5. Accuracy .7, cost .5, waitCost .5, T3: policy value21.44. Matching first two signals stop testing at review2; conflicting signals justify a third test.
6. Prior .2, free testing and waiting, T2: a single test has gross value0, yet adaptive two-test value is12.04 versus immediate commitment9. A positive first result justifies another test; a negative result commits limited. This prevents the false inference that zero immediate value means no sequential value.

Perfect information before any cost gives `5+55p`, an upper bound, not an available policy. Choosing a different initial commitment in each hidden world is clairvoyance; the actual policy must make the same choice for the same received information.

## Verification

`npm test` runs original smoke checks unchanged plus `tests/evidence.cjs`. The new test independently enumerates deterministic information-history policies and evaluates their values conditional on the two latent worlds, rather than using the solver's Bellman recursion. It checks 673,596 policies across 1,701 two-review configurations, every available root action value, Bayesian posterior/martingale identities, probability and path-cost conservation, perfect-information bounds, deadline inclusion and late exclusion, non-anticipativity, input validation, and the sequential counterexample.

Browser verification covers home→essay→home, both original tabs, all six presets, keyboard branch exploration, apply receipt, invalid inputs preserving the earlier calculation, correction and reload from the URL, malformed URL recovery, and 390/768/1440px layouts. The routine-evidence/fresh-survey attribution counterexample is also checked. All passed locally on 6 September with no runtime errors. This is agent verification, not human-user testing.

The optional `tests/browser.cjs` uses Playwright against `PW_QA_URL` (defaults to a local server at port8766). It accepts `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` for an existing browser-test runtime; it does not add a production dependency. Screenshots are temporary test output, not app records.

The app has no backend, actual commitment, uploads or generated files. A calculation receipt identifies the applied settings' location (the URL) and non-effects. Reload reopens the applied experiment; branch exploration resets to review0. No object History is applicable because no record is saved.

## Limits

Not a real transport plan, budget or recommendation. The payoff table, binary demand world and signal likelihoods are declared illustrative assumptions. Daily reviews provide a simple calendar interpretation; irregular decision calendars are not represented. The organising team is assumed able to process either booking evidence or a commissioned survey, not both concurrently. Correlated evidence, model uncertainty, changing demand, risk aversion, overlapping surveys and later reversibility require different models. The objective is held fixed; this is not the neighbouring foray about legitimate changes of ends.

## Scenario decision

During the 6 September session Lawrence explicitly invited a better toy scenario than the climate programme. The mountain-festival shuttle was selected because a bus-hire deadline, uncertain demand, fresh bookings and a paid survey give direct meaning to the model's choices. This changes the new essay's scenario, not its equations or Powell method. The original climate simulator and fixed original foray prompt are retained unchanged.

## Visual explanation — 6 September 2026

The essay now opens on a linked visual explanation rather than the parameter form. This is a presentation extension, not a new decision model or a broader claim about programme dynamics.

- A clickable policy fork shows the recommended next evidence action, signal probabilities, posterior beliefs and the next recommended choices. Following a signal updates the existing detailed explorer to the same information state; either reset returns both to review 0. It never exposes the hidden world to the policy.
- An expected-value bridge reconciles commitment now, the gross benefit of adapting, expected survey fees, expected waiting costs and net policy value. Fees and elapsed time are probability-weighted over all paths actually followed. It does not charge a rejected survey or a hypothetical late test.
- Three aligned timing lanes compare one routine count and one fresh survey with the commitment window, starting today. They are alternatives, not concurrent observations. A result at the deadline remains usable; a later result is marked unavailable.
- A belief chart places the prior and the two one-survey posteriors against the 56.25% reservation boundary. It is explicitly separate from the multi-review policy: the sixth witness still has zero one-survey gain and positive sequential value.

`evidence-model.js` and the original simulator are unchanged. All existing settings, six examples, numerical tables, alternative-action inspection, URL persistence, sources and assumptions remain available. Visual branches are temporary exploration, not a real booking or evidence record. The original receipt/reload/correction and non-effect boundaries continue to apply.

`tests/evidence-visuals.cjs` verifies the presentation decomposition across 1,458 settings, including zero-probability cases, deadline exclusion and the nonmyopic witness. Existing independent policy-enumeration tests still pass. The expanded browser test covers the visual branch/reset journey, keyboard focus at a terminal choice, shared state with the detailed explorer, six examples, correction/reload, and 360/390/768/1440px layouts. Desktop and phone visual captures were inspected. These are agent checks, not evidence of improved audience understanding or human-user testing.
