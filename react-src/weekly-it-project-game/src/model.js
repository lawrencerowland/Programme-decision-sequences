export const RULES = Object.freeze({ weeks: 12, hiringCost: 10000, weeklyPay: 2000, maxHires: 5 });
export function initialState() {
  return { week: 0, developers: 5, budget: 100000, progress: 0, quality: 80, customerSatisfaction: 70, status: 'active' };
}
const clamp = value => Math.min(100, Math.max(0, value));
export function validateDecision(state, input) {
  const names = { hireDevelopers: 'New hires', allocateToBugs: 'Bug fixing', allocateToNewFeatures: 'New features' };
  const decision = {}, errors = [];
  for (const [key, label] of Object.entries(names)) {
    const raw = input[key];
    const value = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
    if (!Number.isSafeInteger(value) || value < 0) errors.push(`${label} must be a whole number of zero or more.`);
    decision[key] = value;
  }
  if (state.status !== 'active') errors.push('This run has ended. Reset to play again.');
  if (errors.length) return { valid: false, errors, decision, cost: null, available: null };
  const available = state.developers + decision.hireDevelopers;
  const cost = decision.hireDevelopers * RULES.hiringCost + available * RULES.weeklyPay;
  if (decision.hireDevelopers > RULES.maxHires) errors.push(`You can hire at most ${RULES.maxHires} developers in one week.`);
  if (decision.allocateToBugs + decision.allocateToNewFeatures > available) errors.push(`Allocate at most ${available} developers in total, including this week's hires.`);
  if (cost > state.budget) errors.push(`This week costs $${cost.toLocaleString('en-US')}, but only $${state.budget.toLocaleString('en-US')} remains. Reduce new hires.`);
  return { valid: errors.length === 0, errors, decision, cost, available };
}
export function advanceWeek(state, input, random = Math.random) {
  const check = validateDecision(state, input);
  if (!check.valid) return { ok: false, errors: check.errors, state };
  // Draw information only after a valid choice has been committed.
  const market = random();
  const information = {
    newBugs: Math.floor(random() * 10),
    marketDemand: market < 0.3 ? 'Increased' : market < 0.72 ? 'Stable' : 'Decreased',
    competitorUpdate: random() < 0.2 ? 'Major Release' : 'No Significant Update',
  };
  const { decision, cost, available } = check;
  const progress = clamp(state.progress + decision.allocateToNewFeatures * 3);
  const quality = clamp(state.quality + decision.allocateToBugs * 2 - information.newBugs);
  const customerSatisfaction = clamp(state.customerSatisfaction + (progress - state.progress) / 2 + (quality - state.quality) / 2
    + (information.marketDemand === 'Increased' ? 5 : information.marketDemand === 'Decreased' ? -5 : 0)
    + (information.competitorUpdate === 'Major Release' ? -10 : 0));
  const next = { week: state.week + 1, developers: available, budget: state.budget - cost, progress, quality, customerSatisfaction, status: 'active' };
  // Completion on the final affordable week wins; quality remains a separate outcome.
  if (progress === 100) next.status = 'complete';
  else if (next.week >= RULES.weeks) next.status = 'horizon';
  else if (next.budget < available * RULES.weeklyPay) next.status = 'resources';
  return { ok: true, state: next, decision, information, cost };
}
