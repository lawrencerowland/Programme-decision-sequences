# Decision companion migration — 17 September 2026

[Back to the catalogue](../experiments.html)

Six repaired tools move into Programme-decision-sequences as distinct maintained companions. The original specialist two-tab model and exact evidence essay remain separate and their model scripts are unchanged. The catalogue describes which pages simulate, explain, frame, or display historical results.

## Routes and capabilities

| Source route | Maintained route | Preserved purpose |
| --- | --- | --- |
| Project-web-apps/web_apps/Project_Decision_Framing_Tool.html | [apps/project-framing/](../apps/project-framing/) | Editable narrative, five model elements, generated summary |
| Project-web-apps/web_apps/climate-sequential-decision-paths.html | [apps/climate-decision-paths/](../apps/climate-decision-paths/) | Two paths, node detail, stepping, playback, SVG export and public sources |
| Project-web-apps/web_apps/climate_megaproject_sdam.html | [apps/climate-sdam-report/](../apps/climate-sdam-report/) | Historical charts, sample action paths, Sankey and working R/I/B form |
| Project-web-apps/web_apps/Sequential%20decisions.html | [apps/climate-policy-simulator/](../apps/climate-policy-simulator/) | Distinct approximate policy mechanisms, seeded benchmarks, single and multiple paths, action ribbons and framing |
| React_proj-apps/apps/Another-IT-project-simulation/ | [apps/weekly-it-project-game/](../apps/weekly-it-project-game/) | Constrained weekly decisions, stochastic post-choice information, terminal outcomes, history chart/table and reset |
| React_proj-apps/apps/IT-project-seq-decisions/ | [apps/it-decision-tutorial/](../apps/it-decision-tutorial/) | Six navigable teaching steps and the proposed IT formulation |

Source revisions are Project-web-apps `a83541f0b872518601a772b3d311741a7bd7e945` and React_proj-apps `12957f34702676f166f09dbb625d5c671c6dbac8`. Machine-readable source paths and SHA-256 hashes are in [decision-migration-provenance.json](decision-migration-provenance.json). The HTML apps change navigation only during migration; their complete inline script payloads are preserved. React App, model, styles and tests are copied unchanged; only entry imports and the page shell change to suit this repository. An inherited shared CSS class selector for `h-0.5` is escaped correctly so the build has no CSS syntax warning.

## Evidence boundaries

The [repair record](decision-repairs-method.md) records the climate model, approximation limits, snapshot provenance and public references. The historical SDAM report does not rerun its unavailable generating model. Its nine Plotly chart payloads remain unchanged. Its illustrative results are not compared numerically against the separate rerunnable model as if they shared assumptions.

The weekly IT game has invented costs, transition rules and event probabilities. It validates choices before drawing information and enforces its budget, staffing and terminal rules. Its usefulness is as a teaching game, not a calibrated project forecast. The tutorial proposes a formulation and does not claim to execute the model it describes.

## Source and build

Four HTML companions are maintained directly under `apps/`. The two React applications are maintained under `react-src/weekly-it-project-game/` and `react-src/it-decision-tutorial/`, with shared entry styles/test setup under `react-src/common/`.

With Node 22 or later and pnpm 11.19.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm run build:check
```

`pnpm-lock.yaml` locks the dependency tree. Vite builds both React entry points with relative assets, then the build script copies only their two route directories and shared `apps/assets/`. It never overwrites the four directly maintained HTML tools. Generated files are checked in so the existing branch-based Pages host continues to serve the repository; no hosting settings are changed.

`build:check` rebuilds from maintained sources and verifies every generated route/asset against the checked-in files and SHA-256 manifest. Include both source and generated updates when editing React. The provenance guards deliberately document the migration baseline: review and update them alongside a documented future model change.

## Verification

- Existing original-model, exact-evidence and visual tests remain.
- Nineteen climate/worksheet repair checks follow the moved model, covering reproducibility, fixed truth, nonanticipation, Bayesian update, controls, candidate objectives, same-model benchmarks and historical data/form preservation.
- The copied React tests exercise game guards, transition laws and interaction journeys, plus tutorial navigation.
- Migration tests check all eight catalogue destinations, return links, local asset resolution, complete imported script/source preservation and unchanged existing model scripts.
- Generated-route verification catches stale bundles and missing assets.

Browser interaction and deployed-byte checks are recorded by the releasing task. Code/property checks alone do not establish human usefulness, climate validity, or operational engineering assurance.
