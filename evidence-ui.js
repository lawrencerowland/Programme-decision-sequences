(function () {
  'use strict';
  const M = window.EvidenceModel, $ = id => document.getElementById(id);
  const presets = {
    timely: { ...M.DEFAULTS },
    unchanged: { ...M.DEFAULTS, prior: .95 },
    late: { ...M.DEFAULTS, deadline: 1, latency: 2 },
    routine: { ...M.DEFAULTS, passive: .8 },
    sequential: { ...M.DEFAULTS, cost: .5, delay: .5, accuracy: .7, deadline: 3 },
    nonmyopic: { ...M.DEFAULTS, prior: .2, cost: 0, delay: 0, deadline: 2 }
  };
  const fmt = n => Math.abs(n) < 1e-9 ? '0' : n.toLocaleString('en-GB', { maximumFractionDigits: 2 });
  const pct = n => `${fmt(n * 100)}%`;
  let solution, focus, inspected, history = [], spent = 0;
  const label = id => M.ACTIONS.find(a => a.id === id)?.label || (id === 'test' ? 'Fresh test' : 'Routine evidence');
  function writeFields(c) { for (const k of Object.keys(M.DEFAULTS)) $(k).value = c[k]; }
  function markPreset(c) {
    document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', String(Object.keys(M.DEFAULTS).every(k => presets[b.dataset.preset][k] === c[k]))));
  }
  function address(c) {
    const url = new URL(location.href); url.search = '';
    for (const k of Object.keys(M.DEFAULTS)) url.searchParams.set(k, c[k]);
    try { window.history.replaceState(null, '', url); return true; } catch { return false; }
  }
  function apply(c, message = 'Experiment updated.') {
    solution = M.solve(c); focus = solution.root; inspected = focus.best.id; history = []; spent = 0;
    writeFields(solution.config); markPreset(solution.config);
    $('form-error').hidden = true;
    document.querySelectorAll('input').forEach(el => el.removeAttribute('aria-invalid'));
    const kept = address(solution.config);
    $('form-status').textContent = `${message} ${kept ? 'Settings kept in this page’s address.' : 'This browser could not keep settings in the address; reload may reset them.'} No programme changes or file created.`;
    render();
  }
  function render() {
    const c = solution.config, root = solution.root, commit = M.bestCommit(c.prior), single = M.oneSignal(c.prior, c.accuracy);
    const timely = c.latency <= c.deadline;
    $('verdict-title').textContent = root.best.label;
    const info = root.best.kind === 'learn';
    $('verdict-copy').textContent = info
      ? `Keep the scope decision open. Pay ${fmt(root.best.expense)} points for this step, receive a signal at review ${root.best.arrival}, then choose again using only what has arrived.`
      : `With these assumptions, no available evidence route improves on committing now. ${commit.label} has the highest current expected value; uncertainty alone is not a reason to delay.`;
    $('policy-value').textContent = fmt(root.value);
    $('commit-value').textContent = fmt(commit.value);
    $('advantage').textContent = `+${fmt(root.value - commit.value)}`;
    $('bits').textContent = `${fmt(single.informationBits)} bits`;
    $('gross').textContent = `${fmt(single.grossValue)} points`;
    $('usable').textContent = `${fmt(timely ? single.grossValue : 0)} points`;
    $('usable-caption').textContent = timely ? `Net gain vs commit-now: ${fmt(single.grossValue - c.cost - c.delay * c.latency)} points` : 'Arrives after the binding review';
    $('difference-copy').textContent = !timely
      ? `The test could be informative, but arrives at review ${c.latency}; scope is already fixed at review ${c.deadline}. Its usable value for this decision is zero, so it is not a feasible purchase.`
      : single.grossValue < 1e-9
        ? `One test alone leaves the same scope choice best after either answer. It removes ${fmt(single.informationBits)} bits of uncertainty but adds no immediate expected scope value. ${root.value > commit.value + 1e-9 ? (root.best.id === 'test' && single.informationBits > 1e-9 ? `Yet the chosen test-first policy adds ${fmt(root.value - commit.value)} points through subsequent evidence choices. Zero one-test value does not mean zero sequential value.` : `Another evidence route adds ${fmt(root.value - commit.value)} points. That does not establish value for this fresh test; inspect the recommended route below.`) : 'The remaining evidence opportunities also fail to improve on committing now; test and waiting costs still count.'}`
        : `The test can cross the scope-choice boundary. Its ${fmt(single.grossValue)}-point gross gain must cover ${fmt(c.cost)} points for the test and ${fmt(c.delay * c.latency)} for waiting. The multi-review policy may do better than this single-test comparison.`;
    $('single-branches').innerHTML = single.branches.map(b => `<div class="branch"><strong>${b.sign === '+' ? 'Positive' : 'Negative'} signal · chance ${pct(b.probability)}</strong><span>Updated chance of high demand: ${pct(b.posterior)}</span><span>${b.decision.label} · expected ${fmt(b.decision.value)} points</span>${timely ? '' : '<span>Hypothetical only: arrives too late.</span>'}</div>`).join('');
    window.EvidenceVisuals.renderOverview(solution);
    const paths = M.policyPaths(root);
    $('paths').innerHTML = paths.map(p => `<tr><td>${p.history.length ? p.history.map(h => `${h.action === 'test' ? 'Test' : 'Routine'} ${h.sign} @${h.arrival}`).join(' → ') : 'None needed'}</td><td class="num">${pct(p.probability)}</td><td>${p.t}</td><td class="num">${pct(p.posterior)}</td><td>${p.action.label.replace('Commit ', '')}</td><td class="num">${fmt(p.spent)}</td><td class="num">${fmt(p.net)}</td></tr>`).join('');
    $('path-check').textContent = `${paths.length} terminal ${paths.length === 1 ? 'path' : 'paths'} · probabilities total ${pct(paths.reduce((s, p) => s + p.probability, 0))} · probability-weighted net value ${fmt(paths.reduce((s, p) => s + p.probability * p.net, 0))} = policy value.`;
    const pi = M.perfectInformation(c.prior);
    $('nonanticipative').textContent = fmt(commit.value); $('clairvoyant').textContent = fmt(pi); $('pi-gap').textContent = fmt(pi - commit.value);
    $('same-history').textContent = `Same review, same received evidence, same belief ${pct(c.prior)}: the solver chooses “${root.best.label}” whether the hidden world is high or low. Before a signal, two imagined worlds do not license two different decisions.`;
    renderFocus();
  }
  function renderFocus() {
    window.EvidenceVisuals.renderPolicy(focus, history, spent, solution.config);
    $('breadcrumb').textContent = history.length ? `Review 0 → ${history.map(h => `${label(h.action)} ${h.sign} at review ${h.arrival}`).join(' → ')}` : 'Review 0 · no new evidence received';
    $('node-heading').textContent = `Review ${focus.t} · chance of high demand ${pct(focus.p)}`;
    $('node-detail').textContent = `Best remaining value ${fmt(focus.value)} · costs already paid ${fmt(spent)}`;
    $('alternatives').innerHTML = focus.options.map(a => `<tr class="${a.id === focus.best.id ? 'best' : ''}"><td>${a.label}${a.id === focus.best.id ? '<span class="badge">BEST / TIE-BREAK PREFERENCE</span>' : ''}</td><td class="num">${a.available ? fmt(a.value) : 'Unavailable'}${a.available ? '' : `<span class="hint">Result at ${a.arrival}, after ${solution.config.deadline}</span>`}</td><td>${a.available ? `<button type="button" data-inspect="${a.id}" aria-pressed="${a.id === inspected}">Inspect</button>` : '—'}</td></tr>`).join('');
    const a = focus.options.find(a => a.id === inspected && a.available) || focus.best; inspected = a.id;
    if (a.kind === 'commit') {
      $('branch-inspector').innerHTML = `<h3>${a.label}</h3><p>Ends this decision at review ${focus.t}. No future signal can change the committed scope here.</p><p>High world: ${fmt(a.high)} points. Low world: ${fmt(a.low)} points.</p><p><strong>${pct(focus.p)} × ${fmt(a.high)} + ${pct(1 - focus.p)} × ${fmt(a.low)} = ${fmt(a.value)}</strong></p><p class="hint">Expected net value along this explored history: ${fmt(a.value - spent)} after the ${fmt(spent)} points already paid. Not a real approval or commitment.</p>`;
    } else {
      $('branch-inspector').innerHTML = `<h3>${a.label}</h3><p>Pay ${fmt(a.expense)} points now in the model. The next signal arrives at review ${a.arrival}. Which branch would you like to inspect?</p><div class="branch-pair">${a.branches.map(b => `<button type="button" class="branch" data-signal="${b.sign}" data-action="${a.id}"><strong>${b.sign === '+' ? 'Positive' : 'Negative'} · chance ${pct(b.probability)}</strong><span>Belief becomes ${pct(b.posterior)} high</span><span>Then: ${b.node.best.label} (${fmt(b.node.value)} remaining points)</span></button>`).join('')}</div><p class="receipt">${a.branches.map(b => `${pct(b.probability)} × ${fmt(b.node.value)}`).join(' + ')} − ${fmt(a.expense)} = ${fmt(a.value)} points</p>`;
    }
  }
  $('settings').addEventListener('input', () => { $('form-status').textContent = 'Settings changed, not yet applied. Results still show the last calculated experiment.'; });
  $('settings').addEventListener('submit', event => {
    event.preventDefault();
    const c = {}; let error = false;
    for (const key of Object.keys(M.DEFAULTS)) {
      const input = $(key), value = input.value.trim() === '' ? NaN : Number(input.value), [lo, hi] = M.LIMITS[key];
      const invalid = !Number.isFinite(value) || value < lo || value > hi || (['deadline', 'latency'].includes(key) && !Number.isInteger(value));
      input.setAttribute('aria-invalid', String(invalid)); c[key] = value;
      if (invalid && !error) { error = true; input.focus(); }
    }
    if (error) { $('form-error').textContent = 'Please enter values within the shown ranges; review counts must be whole numbers. Your entries are kept, and the previous result is unchanged.'; $('form-error').hidden = false; return; }
    apply(c);
  });
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => apply(presets[b.dataset.preset], `Worked experiment ${b.textContent} loaded.`)));
  $('reset').addEventListener('click', () => apply(presets.timely, 'Reset to the first experiment.'));
  $('start-again').addEventListener('click', () => { focus = solution.root; inspected = focus.best.id; history = []; spent = 0; renderFocus(); });
  $('visual-reset').addEventListener('click', () => { focus = solution.root; inspected = focus.best.id; history = []; spent = 0; renderFocus(); });
  $('policy-map').addEventListener('click', e => {
    const b = e.target.closest('[data-follow-signal]'); if (!b) return;
    const a = focus.best, branch = a.branches.find(s => s.sign === b.dataset.followSignal);
    if (!branch) return;
    history.push({ action: a.id, sign: branch.sign, arrival: branch.node.t }); spent += a.expense; focus = branch.node; inspected = focus.best.id; renderFocus();
    ($('policy-map').querySelector('[data-follow-signal]') || $('visual-reset')).focus();
  });
  $('alternatives').addEventListener('click', e => { const b = e.target.closest('[data-inspect]'); if (b) { inspected = b.dataset.inspect; renderFocus(); } });
  $('branch-inspector').addEventListener('click', e => {
    const b = e.target.closest('[data-signal]'); if (!b) return;
    const a = focus.options.find(a => a.id === b.dataset.action), branch = a.branches.find(s => s.sign === b.dataset.signal);
    history.push({ action: a.id, sign: branch.sign, arrival: branch.node.t }); spent += a.expense; focus = branch.node; inspected = focus.best.id; renderFocus();
  });
  let initial = { ...M.DEFAULTS }, badLink = false;
  const query = new URLSearchParams(location.search);
  for (const key of Object.keys(M.DEFAULTS)) if (query.has(key)) initial[key] = query.get(key).trim() === '' ? NaN : Number(query.get(key));
  try { M.validate(initial); } catch { initial = { ...M.DEFAULTS }; badLink = true; }
  apply(initial, badLink ? 'The address contained invalid settings; the first experiment has been restored.' : 'Experiment ready.');
})();
