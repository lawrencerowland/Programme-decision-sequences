import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
const commit = () => fireEvent.click(screen.getByRole('button', { name: /Commit decision/ }));
const fill = (name, value) => fireEvent.change(screen.getByLabelText(name), { target: { value } });
beforeEach(() => vi.spyOn(Math, 'random').mockReturnValue(0.5));
afterEach(() => vi.restoreAllMocks());
test('invalid allocation does not advance or draw a shock, then a corrected decision can proceed', () => {
  render(<React.StrictMode><App /></React.StrictMode>); fill('Allocate to new features', '4'); const calls = Math.random.mock.calls.length; commit();
  expect(screen.getByRole('alert')).toHaveTextContent('Allocate at most 5'); expect(screen.getByRole('heading', { name: /Current state/ })).toHaveTextContent('Week 0'); expect(Math.random.mock.calls.length).toBe(calls);
  fill('Allocate to new features', '3'); commit();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument(); expect(screen.getByRole('heading', { name: /Current state/ })).toHaveTextContent('Week 1'); expect(screen.getAllByRole('row')).toHaveLength(2);
});
test('blank and fractional inputs produce understandable validation', () => {
  render(<App />); fill('Hire developers', ''); commit(); expect(screen.getByRole('alert')).toHaveTextContent('whole number');
  fill('Hire developers', '1.5'); commit(); expect(screen.getByRole('alert')).toHaveTextContent('whole number');
});
test('new hires work immediately, but are not bought again in the following week', () => {
  render(<App />); fill('Hire developers', '1'); fill('Allocate to new features', '4'); commit();
  expect(screen.getByLabelText('Hire developers')).toHaveValue(0); expect(screen.getByRole('region', { name: /Current state/ })).toHaveTextContent('$78,000');
  commit(); expect(screen.getByRole('region', { name: /Current state/ })).toHaveTextContent('$66,000'); expect(screen.getAllByRole('row')).toHaveLength(3);
});
test('completion disables choices and reset clears history, outcome and decisions', () => {
  render(<App />); fill('Allocate to bug fixing', '0'); fill('Allocate to new features', '5'); for (let i = 0; i < 7; i++) commit();
  expect(screen.getByRole('status')).toHaveTextContent('Feature scope complete'); expect(screen.getByRole('button', { name: /Commit decision/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Reset game' })); expect(screen.queryByRole('status')).not.toBeInTheDocument(); expect(screen.queryByRole('table')).not.toBeInTheDocument(); expect(screen.getByLabelText('Allocate to bug fixing')).toHaveValue(2); expect(screen.getByRole('heading', { name: /Current state/ })).toHaveTextContent('Week 0');
});
test('an unaffordable hire leaves the current week intact and exhaustion ends the run', () => {
  render(<App />); for (let i = 0; i < 8; i++) commit();
  fill('Hire developers', '1'); commit(); expect(screen.getByRole('alert')).toHaveTextContent('only $20,000 remains'); expect(screen.getByRole('heading', { name: /Current state/ })).toHaveTextContent('Week 8');
  fill('Hire developers', '0'); commit(); commit(); expect(screen.getByRole('status')).toHaveTextContent('Cannot fund another week'); expect(screen.getAllByRole('row')).toHaveLength(11);
});
