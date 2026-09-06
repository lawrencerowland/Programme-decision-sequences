/* Presentation only: every value and branch comes from the unchanged exact solver. */
(function (root) {
  'use strict';
  const M = typeof module !== 'undefined' && module.exports ? require('./evidence-model.js') : root.EvidenceModel;
  const fmt = n => Math.abs(n) < 1e-9 ? '0' : n.toLocaleString('en-GB', { maximumFractionDigits: 2 });
  const pct = n => `${fmt(n * 100)}%`;
  const short = a => ({ limited: 'Reserve one bus', full: 'Reserve three buses', stop: 'Run no shuttle', test: 'Buy a fresh survey', wait: 'Wait for booking counts' }[a.id]);
  function policySummary(solution) {
    const paths = M.policyPaths(solution.root), c = solution.config;
    const terminalValue = paths.reduce((s, p) => s + p.probability * p.action.value, 0);
    const surveyFees = paths.reduce((s, p) => s + p.probability * p.history.filter(h => h.action === 'test').length * c.cost, 0);
    const waitingCost = paths.reduce((s, p) => s + p.probability * p.t * c.delay, 0);
    const baseline = M.bestCommit(c.prior).value;
    return { baseline, terminalValue, surveyFees, waitingCost, grossGain: terminalValue - baseline, netValue: solution.root.value, gain: solution.root.value - baseline, paths: paths.length };
  }
  function waterfallRows(s) {
    return [
      { label: 'Commit now', start: 0, end: s.baseline, value: s.baseline, type: 'baseline' },
      { label: 'Gain from adapting', start: s.baseline, end: s.terminalValue, value: s.grossGain, type: 'gain' },
      { label: 'Survey fees', start: s.terminalValue, end: s.terminalValue - s.surveyFees, value: -s.surveyFees, type: 'cost' },
      { label: 'Waiting costs', start: s.terminalValue - s.surveyFees, end: s.netValue, value: -s.waitingCost, type: 'cost' },
      { label: 'Best policy, net', start: 0, end: s.netValue, value: s.netValue, type: 'total' }
    ];
  }
  function timingData(c) {
    const horizon = Math.max(c.deadline, c.latency);
    return { horizon, deadline: c.deadline, lanes: [
      { label: 'Choice stays open', duration: c.deadline, state: 'open', note: `Commit by day ${c.deadline}` },
      { label: 'Booking count', duration: 1, state: 'routine', note: 'Next count: day 1' },
      { label: 'Fresh survey', duration: c.latency, state: c.latency <= c.deadline ? 'timely' : 'late', note: `Result: day ${c.latency}${c.latency > c.deadline ? ' — too late' : ''}` }
    ] };
  }
  const $ = id => document.getElementById(id);
  function beliefTrack(p, extra = '') {
    return `<span class="belief-track" aria-hidden="true"><span class="belief-one"></span><span class="belief-three"></span><span class="belief-cut"></span><span class="belief-dot ${extra}" style="left:${p * 100}%"></span></span>`;
  }
  function renderOverview(solution) {
    const c = solution.config, s = policySummary(solution), one = M.oneSignal(c.prior, c.accuracy), timely = c.latency <= c.deadline;
    $('visual-title').textContent = !timely ? 'The answer arrives after the choice closes.'
      : solution.root.best.id === 'wait' ? 'The useful answer is already on its way.'
      : s.gain <= 1e-9 ? 'More evidence does not earn a better first move.'
      : one.grossValue < 1e-9 ? 'A first answer can make a second test worth taking.'
      : c.deadline > 2 ? 'Each answer decides whether to test again.'
      : 'One choice now. Different choices after evidence.';
    const lesson = !timely ? 'A useful answer can arrive too late to be useful here. The reservation closes before this survey returns.'
      : solution.root.best.id === 'wait' ? 'The next booking count is good enough. Paying for a survey would buy no better first step.'
      : s.gain <= 1e-9 ? 'A clearer picture does not necessarily change the choice. Here, keeping the reservation open does not pay.'
      : one.grossValue < 1e-9 ? 'The first answer does not change the reservation. It changes whether another test is worth taking.'
      : c.deadline > 2 ? 'Testing is a route, not a habit. Follow each answer to see when the policy tests again—and when it stops.'
      : 'Buy the answer only if it can change what you do. Here, a high signal leads to three buses; a low signal leads to one.';
    $('visual-lesson').textContent = lesson;
    const rows = waterfallRows(s), max = Math.max(1, ...rows.flatMap(r => [r.start, r.end]));
    $('value-bridge').innerHTML = rows.map(r => `<div class="bridge-row ${r.type}"><span class="bridge-label">${r.label}</span><div class="bridge-track" aria-hidden="true"><span class="bridge-bar" style="left:${Math.min(r.start, r.end) / max * 100}%;width:${Math.abs(r.end - r.start) / max * 100}%"></span>${Math.abs(r.end - r.start) < 1e-9 ? `<span class="bridge-zero" style="left:${r.start / max * 100}%"></span>` : ''}</div><strong>${r.type === 'gain' && r.value > 1e-9 ? '+' : ''}${fmt(r.value)}</strong></div>`).join('');
    $('value-caption').textContent = `${fmt(s.baseline)} + ${fmt(s.grossGain)} − ${fmt(s.surveyFees)} − ${fmt(s.waitingCost)} = ${fmt(s.netValue)} points. ${s.gain > 1e-9 ? `A net gain of ${fmt(s.gain)} over committing now.` : 'No evidence costs are paid by the recommended policy.'} Costs are averaged over the paths actually taken.`;
    const timing = timingData(c);
    $('timeline').innerHTML = `<div class="time-axis"><span>Day</span><div>${Array.from({ length: timing.horizon + 1 }, (_, t) => `<b style="left:${t / timing.horizon * 100}%">${t}</b>`).join('')}</div></div>${timing.lanes.map(l => `<div class="time-row"><span>${l.label}</span><div class="time-lane" aria-hidden="true"><span class="time-bar ${l.state}" style="width:${l.duration / timing.horizon * 100}%"></span><span class="deadline-line" style="left:${c.deadline / timing.horizon * 100}%"></span></div><small class="${l.state === 'late' ? 'late-copy' : ''}">${l.note}</small></div>`).join('')}`;
    $('timing-caption').textContent = `Compare one evidence step starting today; these are alternative routes, not concurrent activities. ${timely ? `The survey arrives ${c.latency === c.deadline ? 'exactly at the last usable review' : 'before the deadline'}. Later tests must also fit before day ${c.deadline}.` : 'The survey is unavailable for this decision: we do not buy it or charge its cost.'}`;
    const beliefs = [{ label: 'Before the survey', p: c.prior, decision: M.bestCommit(c.prior) }, ...one.branches.map(b => ({ label: `${b.sign === '+' ? 'High' : 'Low'} signal · ${pct(b.probability)} chance`, p: b.posterior, decision: b.decision }))];
    $('belief-map').innerHTML = `<div class="belief-key"><span>One bus</span><span>Three buses</span></div>${beliefs.map(b => `<div class="belief-row"><div><span>${b.label}</span><strong>${pct(b.p)}</strong></div>${beliefTrack(b.p)}<small>${short(b.decision)}${timely ? '' : ' · hypothetical: too late'}</small></div>`).join('')}`;
  }
  function renderPolicy(node, history, spent, c) {
    const a = node.best, terminal = a.kind === 'commit';
    $('visual-history').textContent = history.length ? `From day 0: ${history.map(h => `${h.action === 'test' ? 'survey' : 'booking count'} ${h.sign === '+' ? 'high' : 'low'} at day ${h.arrival}`).join(' → ')}` : 'Start here · no new evidence received';
    $('visual-reset').disabled = history.length === 0;
    $('policy-map').innerHTML = `<div class="policy-node ${terminal ? 'terminal' : ''}"><span class="node-day">Day ${node.t} · ${pct(node.p)} chance of high demand</span><strong>${short(a)}</strong><span>${terminal ? `Decision closes here · expected ${fmt(a.value - spent)} points after all costs` : `Pay ${fmt(a.expense)} points · answer arrives day ${a.arrival}`}</span></div>${terminal ? `<div class="closed-choice"><span aria-hidden="true">●</span> No further branch: the reservation is now fixed.</div>` : `<div class="policy-fork" aria-hidden="true"></div><div class="policy-children">${a.branches.map(b => `<button class="policy-child ${b.node.best.kind === 'commit' ? 'ends' : 'continues'}" type="button" data-follow-signal="${b.sign}"><span class="signal-label">${b.sign === '+' ? 'High-demand signal' : 'Low-demand signal'} <b>${pct(b.probability)}</b></span><span class="posterior-label">Belief becomes <strong>${pct(b.posterior)} high</strong></span>${beliefTrack(b.posterior)}<strong class="next-choice">${short(b.node.best)}</strong><span class="child-day">Day ${b.node.t} · ${b.node.best.kind === 'commit' ? 'reserve and stop' : 'keep learning'}</span><span class="follow-label">Follow this answer →</span></button>`).join('')}</div>`}`;
    $('policy-map-caption').textContent = terminal ? `This is a model branch, not a booking or approval. Use “Back to the first choice” to compare the other possible answers. Deadline: day ${c.deadline}.` : 'Click either answer to follow the next decision. Branch percentages are chances of signals, not chances that a reservation succeeds. Belief bars show the 56.25% reservation boundary.';
  }
  const api = { policySummary, waterfallRows, timingData, renderOverview, renderPolicy };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.EvidenceVisuals = api;
})(typeof window !== 'undefined' ? window : globalThis);
