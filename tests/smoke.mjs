import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const indexUrl = new URL("../index.html", import.meta.url);
const html = await readFile(indexUrl, "utf8");
const match = html.match(/<script id="model-source">([\s\S]*?)<\/script>/);
assert.ok(match, "embedded model source is present");

const context = vm.createContext({ window: {} });
vm.runInContext(match[1], context, { filename: "embedded-model.js" });
const Model = context.window.DecisionModel;

assert.deepEqual(Object.keys(Model.POLICY_META), ["pfa", "cfa", "vfa", "dla"]);

const params = { quarters: 12, target: 1.55, observationNoise: 0.018, lookaheadRollouts: 4 };
for (const policy of Object.keys(Model.POLICY_META)) {
  const first = Model.simulatePath(policy, params, 220);
  const second = Model.simulatePath(policy, params, 220);
  assert.equal(first.history.length, 13, `${policy} path includes S0 plus 12 transitions`);
  assert.equal(JSON.stringify(first.history), JSON.stringify(second.history), `${policy} is reproducible for a fixed seed`);
  for (let index = 1; index < first.history.length; index += 1) {
    const previous = first.history[index - 1];
    const current = first.history[index];
    assert.ok(Number.isFinite(current.tempEstimate), `${policy} temperature is finite`);
    assert.ok(Number.isFinite(current.objective), `${policy} objective is finite`);
    assert.ok(current.p00 > 0 && current.p11 > 0, `${policy} covariance remains positive on the diagonal`);
    assert.ok(Math.abs(current.lastDecision.effort - previous.effort) <= first.params.ramp + 1e-9, `${policy} intended decision respects ramp`);
  }
  const sample = Model.simulateMany(policy, params, 8, 707);
  const summary = Model.summarize(sample);
  assert.ok(Number.isFinite(summary.objectiveP90), `${policy} summary is finite`);
}

const tree = Model.scenarioTree("pfa", params, 77, 3);
assert.equal(tree.length, 40, "three-level ternary scenario tree has 40 nodes");
assert.equal(tree.filter(node => node.depth === 3).length, 27, "scenario tree has 27 leaves");

assert.match(html, /Scenario tree · not MCTS/);
assert.match(html, /PFA · Policy function approximation/);
assert.match(html, /DLA · Direct lookahead approximation/);
assert.doesNotMatch(html, /fetch\s*\(/);

console.log("Smoke checks passed: embedded model, four policies, deterministic paths, ramp constraints and scenario tree.");

