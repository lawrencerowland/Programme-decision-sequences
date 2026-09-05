'use strict';
const assert = require('node:assert/strict');
const model = require('../evidence-model.js');
const PAYOFF = { limited: [25, 5], full: [60, -40], stop: [0, 0] };
const commits = Object.keys(PAYOFF);
let checks = 0;
const close = (actual, expected, label) => {
  checks++;
  assert.ok(Math.abs(actual - expected) < 1e-8, `${label}: got ${actual}, expected ${expected}`);
};

// Independent exhaustive deterministic policy enumeration for horizon 2.
// No Bellman recursion or model helpers are used here. Each root action and
// every mapping from observed signs to subsequent actions is explicitly listed.
// Values are evaluated twice, conditional on the SAME latent high/low state,
// and mixed once using the initial prior. Policies may condition on signs only.
function enumerate(config) {
  const c = { ...model.DEFAULTS, ...config };
  assert.equal(c.deadline, 2);
  const terminal = commits.map(action => ({ action }));
  const afterFirstReview = [...terminal];
  for (const learn of ['wait', ...(c.latency === 1 ? ['test'] : [])]) {
    for (const plus of commits) for (const minus of commits) {
      afterFirstReview.push({ action: learn, plus, minus });
    }
  }
  const policies = terminal.map(p => ({ root: p.action }));
  for (const root of ['wait', ...(c.latency <= 2 ? ['test'] : [])]) {
    const span = root === 'wait' ? 1 : c.latency;
    const children = span === 2 ? terminal : afterFirstReview;
    for (const plus of children) for (const minus of children) {
      policies.push({ root, plus, minus });
    }
  }
  const q = action => action === 'wait' ? c.passive : c.accuracy;
  const expense = action => action === 'wait' ? c.delay : c.cost + c.delay * c.latency;
  const signProbability = (action, high, plus) => plus === high ? q(action) : 1 - q(action);
  function conditionalValue(policy, high) {
    const theta = high ? 0 : 1;
    if (PAYOFF[policy.root]) return PAYOFF[policy.root][theta];
    let value = -expense(policy.root);
    for (const plus of [true, false]) {
      const branch = plus ? policy.plus : policy.minus;
      let continuation;
      if (PAYOFF[branch.action]) continuation = PAYOFF[branch.action][theta];
      else {
        continuation = -expense(branch.action)
          + signProbability(branch.action, high, true) * PAYOFF[branch.plus][theta]
          + signProbability(branch.action, high, false) * PAYOFF[branch.minus][theta];
      }
      value += signProbability(policy.root, high, plus) * continuation;
    }
    return value;
  }
  let best = -Infinity;
  const actionBest = {};
  for (const policy of policies) {
    const value = c.prior * conditionalValue(policy, true) + (1 - c.prior) * conditionalValue(policy, false);
    best = Math.max(best, value);
    actionBest[policy.root] = Math.max(actionBest[policy.root] ?? -Infinity, value);
  }
  return { best, actionBest, policies: policies.length };
}

// Bayesian update and posterior martingale, including degenerate events.
for (const prior of [0, .01, .2, .5, .5625, .8, .99, 1]) {
  for (const accuracy of [.5, .65, .8, .999, 1]) {
    const branches = model.signals(prior, accuracy);
    close(branches.reduce((s, b) => s + b.probability, 0), 1, 'signal mass');
    close(branches.reduce((s, b) => s + b.probability * b.posterior, 0), prior, 'posterior martingale');
    for (const b of branches) {
      const highLikelihood = b.sign === '+' ? accuracy : 1 - accuracy;
      const lowLikelihood = b.sign === '+' ? 1 - accuracy : accuracy;
      const evidence = prior * highLikelihood + (1 - prior) * lowLikelihood;
      close(b.probability, evidence, 'Bayes evidence');
      close(b.posterior, prior * highLikelihood / evidence, 'Bayes posterior');
      assert.ok(Number.isFinite(b.posterior) && b.posterior >= 0 && b.posterior <= 1);
    }
    assert.ok(model.oneSignal(prior, accuracy).grossValue >= -1e-8);
    assert.ok(model.oneSignal(prior, accuracy).informationBits >= -1e-8);
  }
}

let configurations = 0;
let policyEvaluations = 0;
for (const prior of [0, .15, .4, .5, .5625, .8, 1]) {
  for (const accuracy of [.5, .8, 1]) for (const passive of [.5, .7, .95]) {
    for (const cost of [0, 4, 12]) for (const delay of [0, 3, 9]) {
      for (const latency of [1, 2, 3]) {
        const config = { prior, accuracy, passive, cost, delay, latency, deadline: 2 };
        const enumeration = enumerate(config);
        const solution = model.solve(config);
        close(solution.root.value, enumeration.best, 'exhaustive policy optimum');
        for (const option of solution.root.options) {
          if (option.available) close(option.value, enumeration.actionBest[option.id], `root option ${option.id}`);
          else assert.equal(option.value, null);
        }
        const paths = model.policyPaths(solution.root);
        close(paths.reduce((s, p) => s + p.probability, 0), 1, 'chosen policy path mass');
        close(paths.reduce((s, p) => s + p.probability * p.net, 0), solution.root.value, 'chosen policy net expectation');
        assert.ok(solution.root.value <= prior * 60 + (1 - prior) * 5 + 1e-8, 'perfect-information upper bound');
        assert.ok(solution.root.value >= Math.max(prior * 25 + (1-prior)*5, prior*60-(1-prior)*40)-1e-8, 'can always commit now');
        assert.ok(paths.every(p => p.t <= 2 && p.action.id !== 'stop'), 'timely decisions and strictly dominated stop');
        configurations++;
        policyEvaluations += enumeration.policies;
      }
    }
  }
}

// Exact recognizable defaults: q=.8 produces posteriors .8/.2, full/limited.
const defaults = model.solve({});
assert.equal(defaults.root.best.id, 'test');
close(defaults.root.value, 17.5, 'default net test value');
close(model.oneSignal(.5, .8).after, 24.5, 'default gross informed payoff');
close(model.oneSignal(.5, .8).grossValue, 9.5, 'default EVSI');

// Zero immediate information value can conceal useful sequential learning.
const sequential = model.solve({prior:.2, cost:0, delay:0, deadline:2});
close(model.oneSignal(.2,.8).grossValue, 0, 'first signal alone does not change commitment');
close(sequential.root.value, 12.04, 'adaptive two-test value');
assert.equal(sequential.root.best.id, 'test');
assert.equal(sequential.root.best.branches.find(b=>b.sign==='+').node.best.id,'test');
assert.equal(sequential.root.best.branches.find(b=>b.sign==='-').node.best.id,'limited');
const stopping = model.solve({cost:.5,delay:.5,accuracy:.7,deadline:3});
assert.deepEqual([...new Set(model.policyPaths(stopping.root).map(p=>p.t))].sort(),[2,3]);

// At-deadline evidence is available; exactly one review too late is unusable.
const base = { prior: .5, accuracy: 1, passive: .5, cost: 0, delay: 0, deadline: 2 };
const onTime = model.solve({ ...base, latency: 2 });
const late = model.solve({ ...base, latency: 3 });
assert.equal(onTime.root.best.id, 'test');
close(onTime.root.value, 32.5, 'on-time perfect evidence');
assert.equal(late.root.best.id, 'limited');
close(late.root.value, 15, 'late perfect evidence');
assert.equal(late.root.options.find(o => o.id === 'test').available, false);

// No future truth can affect the policy: extra latent-state metadata is ignored.
const high = model.solve({ ...base, accuracy: .5, latency: 1, hiddenTruth: 'high' });
const low = model.solve({ ...base, accuracy: .5, latency: 1, hiddenTruth: 'low' });
assert.deepEqual(high.root, low.root);
assert.equal(high.root.best.id, 'limited');
close(high.root.value, 15, 'uninformative signals cannot unlock clairvoyance');
close(model.perfectInformation(.5), 32.5, 'clairvoyant bound uses state-contingent commitment');
assert.ok(high.root.value < model.perfectInformation(.5), 'enforced nonanticipativity costs 17.5 here');

// In this payoff table, proceeding on limited scope strictly dominates stop
// in BOTH states. Stop is an explanatory comparator, never an optimal policy.
for (let i=0; i<=100; i++) {
  const c = model.commitments(i / 100);
  assert.ok(c.find(x=>x.id==='limited').value > c.find(x=>x.id==='stop').value);
}

// Higher-horizon conservation and validation boundaries supplement exhaustive h=2.
for (const deadline of [1,3,4]) {
  const s = model.solve({deadline});
  const paths = model.policyPaths(s.root);
  close(paths.reduce((v,p)=>v+p.probability*p.net,0),s.root.value,'non-enumerated horizon conservation');
}
for (const bad of [{prior:-1},{prior:NaN},{accuracy:.49},{deadline:1.5},{latency:0},{cost:Infinity},{delay:-1}]) {
  assert.throws(()=>model.solve(bad));
}
console.log(JSON.stringify({status:'PASS',configurations,deterministicPoliciesEvaluated:policyEvaluations,numericChecks:checks,defaultValue:defaults.root.value,note:'Stop is strictly dominated by limited scope in both latent states; retained as comparator only.'},null,2));
