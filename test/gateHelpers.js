import { screen } from '@testing-library/react';

/** Read the grown-ups sum ("What is 6 + 7?") from the dialog and return the answer. */
export const answerGate = () => {
  const question = screen.getByText(/What is \d+ \+ \d+\?/).textContent;
  const [, a, b] = question.match(/(\d+) \+ (\d+)/);
  return String(Number(a) + Number(b));
};
