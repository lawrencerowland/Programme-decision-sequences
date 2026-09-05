/* Exact finite teaching model. No simulator truth enters a policy decision. */
(function (root) {
  'use strict';
  const ACTIONS = [
    { id: 'limited', label: 'Reserve one shuttle bus', high: 25, low: 5 },
    { id: 'full', label: 'Reserve the three-bus fleet', high: 60, low: -40 },
    { id: 'stop', label: 'Run no shuttle', high: 0, low: 0 }
  ];
  const DEFAULTS = { prior: .5, accuracy: .8, passive: .5, cost: 4, delay: 3, deadline: 2, latency: 1 };
  const LIMITS = { prior: [0, 1], accuracy: [.5, 1], passive: [.5, 1], cost: [0, 30], delay: [0, 15], deadline: [1, 4], latency: [1, 5] };
  function validate(input) {
    const c = { ...DEFAULTS, ...input };
    for (const [key, [lo, hi]] of Object.entries(LIMITS)) {
      if (typeof c[key] !== 'number' || !Number.isFinite(c[key]) || c[key] < lo || c[key] > hi || (['deadline', 'latency'].includes(key) && !Number.isInteger(c[key]))) {
        throw new Error(`Invalid ${key}: expected ${lo} to ${hi}${['deadline', 'latency'].includes(key) ? ' in whole reviews' : ''}.`);
      }
    }
    return c;
  }
  function entropy(p) { return p === 0 || p === 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p); }
  function signals(p, q) {
    return ['+', '-'].map(sign => {
      const highLikelihood = sign === '+' ? q : 1 - q;
      const lowLikelihood = 1 - highLikelihood;
      const probability = p * highLikelihood + (1 - p) * lowLikelihood;
      return { sign, probability, posterior: probability === 0 ? null : p * highLikelihood / probability };
    }).filter(s => s.probability > 0);
  }
  function commitments(p) { return ACTIONS.map(a => ({ ...a, value: p * a.high + (1 - p) * a.low })); }
  function bestCommit(p) { return commitments(p).reduce((best, a) => a.value > best.value + 1e-10 ? a : best); }
  function oneSignal(p, q) {
    const branches = signals(p, q).map(s => ({ ...s, decision: bestCommit(s.posterior) }));
    const after = branches.reduce((sum, b) => sum + b.probability * b.decision.value, 0);
    return { branches, after, grossValue: after - bestCommit(p).value, informationBits: entropy(p) - branches.reduce((sum, b) => sum + b.probability * entropy(b.posterior), 0) };
  }
  function solve(input) {
    const config = validate(input), memo = new Map();
    function at(t, p) {
      if (!Number.isInteger(t) || t < 0 || t > config.deadline || !Number.isFinite(p) || p < 0 || p > 1) throw new Error('Invalid decision state.');
      const key = `${t}:${p}`;
      if (memo.has(key)) return memo.get(key);
      const options = commitments(p).map(a => ({ ...a, kind: 'commit', available: true, branches: [] }));
      for (const [id, label, span, q, fee] of [
        ['wait', 'Wait for fresh booking counts', 1, config.passive, 0],
        ['test', 'Commission a demand survey', config.latency, config.accuracy, config.cost]
      ]) {
        const arrival = t + span, available = arrival <= config.deadline;
        const option = { id, label, kind: 'learn', available, arrival, duration: span, expense: fee + config.delay * span, branches: [], value: null };
        if (available) {
          option.branches = signals(p, q).map(s => ({ ...s, node: at(arrival, s.posterior) }));
          option.value = -option.expense + option.branches.reduce((sum, b) => sum + b.probability * b.node.value, 0);
        }
        options.push(option);
      }
      const best = options.filter(a => a.available).reduce((b, a) => a.value > b.value + 1e-10 ? a : b);
      const node = { t, p, value: best.value, best, options };
      memo.set(key, node);
      return node;
    }
    const node = at(0, config.prior);
    return { config, root: node, at };
  }
  function policyPaths(node, probability = 1, spent = 0, history = []) {
    const a = node.best;
    if (a.kind === 'commit') return [{ probability, spent, history, t: node.t, posterior: node.p, action: a, net: a.value - spent }];
    return a.branches.flatMap(b => policyPaths(b.node, probability * b.probability, spent + a.expense, [...history, { action: a.id, sign: b.sign, arrival: b.node.t }]));
  }
  function perfectInformation(p) { return p * Math.max(...ACTIONS.map(a => a.high)) + (1 - p) * Math.max(...ACTIONS.map(a => a.low)); }
  const api = { ACTIONS, DEFAULTS, LIMITS, validate, entropy, signals, commitments, bestCommit, oneSignal, solve, policyPaths, perfectInformation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EvidenceModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
