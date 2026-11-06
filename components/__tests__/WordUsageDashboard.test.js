import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordUsageDashboard from '../analytics/WordUsageDashboard';

const analytics = { topWords: [], byGrade: { 0: 0, 1: 2, 2: 0, 3: 0 }, totalStories: 1, totalUniqueWords: 2 };
const reply = (ok, body) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

it('recovers when "Try Again" succeeds after a failed load', async () => {
  global.fetch = jest.fn().mockReturnValueOnce(reply(false, {})).mockReturnValueOnce(reply(true, analytics));
  render(<WordUsageDashboard />);

  await userEvent.click(await screen.findByRole('button', { name: 'Try Again' }));

  expect(await screen.findByText('Most used reading level')).toBeInTheDocument();
  expect(screen.queryByText(/Error loading analytics/)).not.toBeInTheDocument();
});
