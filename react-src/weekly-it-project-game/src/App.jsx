import React, { useState } from 'react';
import { advanceWeek, initialState, RULES, validateDecision } from './model';
import './App.css';
const defaultDecision = () => ({ hireDevelopers: '0', allocateToBugs: '2', allocateToNewFeatures: '3' });
const newSession = () => ({ state: initialState(), history: [], lastRound: null });
const money = amount => `$${amount.toLocaleString('en-US')}`;
const outcomes = { complete: 'Feature scope complete', horizon: 'Twelve-week horizon reached', resources: 'Cannot fund another week' };
export default function App() {
  const [session, setSession] = useState(newSession);
  const [decision, setDecision] = useState(defaultDecision);
  const [errors, setErrors] = useState([]);
  const { state, history, lastRound } = session;
  const preview = validateDecision(state, decision);
  const ended = state.status !== 'active';
  const reset = () => { setSession(newSession()); setDecision(defaultDecision()); setErrors([]); };
  const play = event => {
    event.preventDefault();
    const round = advanceWeek(state, decision);
    if (!round.ok) { setErrors(round.errors); return; }
    setSession({ state: round.state, history: [...history, round], lastRound: round });
    setDecision({ ...decision, hireDevelopers: '0' });
    setErrors([]);
  };
  const points = key => [initialState(), ...history.map(round => round.state)].map(row => `${35 + row.week * 40},${130 - row[key]}`).join(' ');
  return <main className="it-game">
    <header><p className="it-kicker">An illustrative sequential-decision game</p><h1>Weekly IT project game</h1>
      <p>Choose your team’s work, receive new information, then inspect what changed. Aim to finish the feature scope within {RULES.weeks} weeks and the starting {money(100000)} budget.</p>
      <p className="it-note">These invented costs and response rules teach trade-offs; they are not a calibrated forecast or an optimal policy.</p>
    </header>
    <section aria-labelledby="state-title"><h2 id="state-title">Current state · Week {state.week} of {RULES.weeks}</h2>
      <dl className="it-metrics"><div><dt>Developers</dt><dd>{state.developers}</dd></div><div><dt>Budget remaining</dt><dd>{money(state.budget)}</dd></div><div><dt>Feature progress</dt><dd>{state.progress}%</dd></div><div><dt>Quality</dt><dd>{state.quality}%</dd></div><div><dt>Customer satisfaction</dt><dd>{state.customerSatisfaction}%</dd></div></dl>
    </section>
    {ended && <section className="it-outcome" role="status"><h2>{outcomes[state.status]}</h2>
      <p>{state.status === 'complete' ? 'The declared feature scope is complete. Compare the quality, satisfaction and spend you achieved.' : state.status === 'horizon' ? 'The decision horizon has ended with unfinished scope. Compare the outcome, then try another allocation.' : `Remaining budget cannot cover the next ${money(state.developers * RULES.weeklyPay)} payroll. This game has no layoffs or extra funding; the run ends here.`}</p>
      <p>Completion means 100% feature progress. It does not certify quality or customer acceptance.</p>
    </section>}
    <form onSubmit={play} noValidate><h2>Choose the next week</h2>
      <p>New hires work immediately: each costs {money(RULES.hiringCost)} once, plus {money(RULES.weeklyPay)} weekly pay. Every retained developer is paid, including anyone left unallocated. Up to {RULES.maxHires} hires per week. Hiring resets to zero after each choice.</p>
      <fieldset disabled={ended}><legend>Whole developers only; each person has one assignment</legend>
        <div className="it-inputs">{[['hireDevelopers', 'Hire developers'], ['allocateToBugs', 'Allocate to bug fixing'], ['allocateToNewFeatures', 'Allocate to new features']].map(([key, label]) => <label key={key}>{label}<input type="number" min="0" step="1" max={key === 'hireDevelopers' ? RULES.maxHires : undefined} value={decision[key]} onChange={event => { setDecision({ ...decision, [key]: event.target.value }); setErrors([]); }} /></label>)}</div>
        <p className="it-preview" aria-live="polite">{ended ? 'This run has ended. Reset to choose a new strategy.' : preview.cost === null ? 'Enter a whole number in each field to preview this week.' : `Available: ${preview.available} developers · Allocated: ${preview.decision.allocateToBugs + preview.decision.allocateToNewFeatures} · Week cost: ${money(preview.cost)} · Budget after: ${money(state.budget - preview.cost)}`}</p>
        {errors.length > 0 && <div role="alert"><strong>Week not advanced.</strong><ul>{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
        <button type="submit">Commit decision and advance one week</button>
      </fieldset>
    </form>
    <button className="it-reset" type="button" onClick={reset}>Reset game</button>
    {lastRound && <section aria-labelledby="update-title"><h2 id="update-title">Week {state.week} · information received after your choice</h2><p>New bugs: {lastRound.information.newBugs} · Market demand: {lastRound.information.marketDemand} · Competitor: {lastRound.information.competitorUpdate}</p><p>You hired {lastRound.decision.hireDevelopers}, assigned {lastRound.decision.allocateToBugs} to bugs and {lastRound.decision.allocateToNewFeatures} to new features; this week cost {money(lastRound.cost)}.</p></section>}
    <section aria-labelledby="history-title"><h2 id="history-title">Your decision history</h2>
      {history.length === 0 ? <p>Commit the first week to start a history. Invalid decisions spend nothing and do not draw new information.</p> : <>
        <svg className="it-history-chart" viewBox="0 0 550 165" role="img" aria-label="Feature progress and quality over time; exact values are in the table below."><path d="M35 25V130H530" fill="none" stroke="#94a3b8" /><text x="0" y="35">100%</text><text x="10" y="133">0%</text><polyline points={points('progress')} fill="none" stroke="#087f5b" strokeWidth="3" /><polyline points={points('quality')} fill="none" stroke="#6451aa" strokeWidth="3" /><text x="35" y="155" fill="#087f5b">Feature progress</text><text x="200" y="155" fill="#6451aa">Quality</text><text x="460" y="155">Week 12</text></svg>
        <div className="it-table"><table><caption>Weekly decisions and outcomes</caption><thead><tr><th>Week</th><th>Hires</th><th>Bugs / features</th><th>Spend</th><th>Budget left</th><th>Progress</th><th>Quality</th><th>Satisfaction</th></tr></thead><tbody>{history.map(round => <tr key={round.state.week}><th scope="row">{round.state.week}</th><td>{round.decision.hireDevelopers}</td><td>{round.decision.allocateToBugs} / {round.decision.allocateToNewFeatures}</td><td>{money(round.cost)}</td><td>{money(round.state.budget)}</td><td>{round.state.progress}%</td><td>{round.state.quality}%</td><td>{round.state.customerSatisfaction}%</td></tr>)}</tbody></table></div>
      </>}
    </section>
    <details><summary>Rules and experiments to try</summary><p>Each feature developer adds 3 percentage points. Each bug-fixing developer adds 2 quality points; 0–9 new bugs then reduce quality. Progress and quality stay within 0–100. Satisfaction responds to progress and quality changes, market demand (+5 / 0 / −5) and a major competitor release (−10), then stays within 0–100.</p><p>Each week independently draws increased / stable / decreased market demand with probabilities 30% / 42% / 28%, and a major competitor release with probability 20%. New information is drawn after your choice; it cannot be known when you commit.</p><p>Try finishing with the original team, hiring early, or protecting quality with more bug fixing. The starting budget buys only ten weeks of the original team’s payroll. Hiring changes both capacity and the number of affordable weeks. Inspect your history before resetting; random events mean repeated runs are different.</p></details>
  </main>;
}
