import { expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
test('retains a six-step tutorial with bounded navigation and honest execution scope', () => {
  render(<App />); expect(screen.getByText(/does not run a simulation/)).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('status')).toHaveTextContent('Step 6 of 6'); expect(screen.getByRole('heading', { name: 'Step 6: Policy Evaluation' })).toBeInTheDocument(); expect(screen.getByText(/page runs no Monte Carlo trials/)).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Previous' })); expect(screen.getByRole('status')).toHaveTextContent('Step 5 of 6'); expect(screen.getByText(/not implemented algorithms/)).toBeInTheDocument();
});
