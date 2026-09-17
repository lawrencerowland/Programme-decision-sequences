import { describe, expect, it, vi } from 'vitest';
import { advanceWeek, initialState, validateDecision } from './model';
const choice = { hireDevelopers: 0, allocateToBugs: 2, allocateToNewFeatures: 3 };
const steady = () => 0.5;
describe('weekly decision boundaries', () => {
  it.each(['', ' ', 'oops', NaN, Infinity, -1, 1.5, '1e999', null, true])('rejects invalid whole-person input %s without spending or sampling', value => {
    const state = initialState(), random = vi.fn(steady);
    const result = advanceWeek(state, { ...choice, hireDevelopers: value }, random);
    expect(result.ok).toBe(false); expect(result.state).toBe(state); expect(random).not.toHaveBeenCalled();
  });
  it('rejects over-allocation and more than five hires', () => {
    expect(validateDecision(initialState(), { ...choice, allocateToNewFeatures: 4 }).valid).toBe(false);
    expect(validateDecision(initialState(), { ...choice, hireDevelopers: 6 }).valid).toBe(false);
  });
  it('makes new hires immediately available and charges hiring plus the entire payroll', () => {
    const state = initialState();
    const round = advanceWeek(state, { hireDevelopers: '1', allocateToBugs: '2', allocateToNewFeatures: '4' }, steady);
    expect(round.ok).toBe(true); expect(round.cost).toBe(22000);
    expect(round.state).toMatchObject({ week: 1, developers: 6, budget: 78000, progress: 12, quality: 79, customerSatisfaction: 75.5 });
    expect(state).toEqual(initialState());
    const next = advanceWeek(round.state, { ...choice, hireDevelopers: 0 }, steady);
    expect(next.cost).toBe(12000); expect(next.state.budget).toBe(66000);
  });
  it('does not spend an unaffordable choice and still charges idle staff', () => {
    const random = vi.fn(steady), state = { ...initialState(), budget: 21000 };
    expect(advanceWeek(state, { ...choice, hireDevelopers: 1 }, random).ok).toBe(false); expect(random).not.toHaveBeenCalled();
    const round = advanceWeek(state, { ...choice, allocateToBugs: 0, allocateToNewFeatures: 0 }, steady);
    expect(round.cost).toBe(10000); expect(round.state.progress).toBe(0);
  });
  it('bounds quality and satisfaction at both ends', () => {
    const low = advanceWeek({ ...initialState(), quality: 1, customerSatisfaction: 1 }, { ...choice, allocateToBugs: 0, allocateToNewFeatures: 0 }, () => 0.99);
    expect(low.state.quality).toBe(0); expect(low.state.customerSatisfaction).toBe(0);
    const high = advanceWeek({ ...initialState(), quality: 99, customerSatisfaction: 99 }, { ...choice, allocateToBugs: 5, allocateToNewFeatures: 0 }, () => 0.25);
    expect(high.state.quality).toBe(100); expect(high.state.customerSatisfaction).toBe(100);
  });
  it('caps completion and gives completion precedence at the horizon with exactly enough payroll', () => {
    const round = advanceWeek({ ...initialState(), week: 11, progress: 99, budget: 10000 }, choice, steady);
    expect(round.state).toMatchObject({ week: 12, progress: 100, budget: 0, status: 'complete' });
  });
  it('ends an unfinished run at the horizon or when next payroll is unaffordable', () => {
    expect(advanceWeek({ ...initialState(), week: 11 }, choice, steady).state.status).toBe('horizon');
    expect(advanceWeek({ ...initialState(), budget: 19000 }, choice, steady).state).toMatchObject({ budget: 9000, status: 'resources' });
  });
  it.each(['complete', 'horizon', 'resources'])('never advances ended state %s', status => {
    const random = vi.fn(steady), state = { ...initialState(), status };
    expect(advanceWeek(state, choice, random)).toMatchObject({ ok: false, state }); expect(random).not.toHaveBeenCalled();
  });
  it('every generated run stays finite and within resource bounds', () => {
    let seed = 29; const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let run = 0; run < 100; run++) {
      let state = initialState();
      while (state.status === 'active') {
        const bugs = Math.floor(random() * 6);
        state = advanceWeek(state, { hireDevelopers: 0, allocateToBugs: bugs, allocateToNewFeatures: 5 - bugs }, random).state;
        expect(state.week).toBeLessThanOrEqual(12); expect(state.budget).toBeGreaterThanOrEqual(0);
        for (const key of ['progress', 'quality', 'customerSatisfaction']) { expect(Number.isFinite(state[key])).toBe(true); expect(state[key]).toBeGreaterThanOrEqual(0); expect(state[key]).toBeLessThanOrEqual(100); }
      }
    }
  });
});
