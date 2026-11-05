import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ParentGate, { grownUpChecked } from '../storybook/ParentGate';
import { answerGate } from '../../test/gateHelpers';

beforeEach(() => {
  window.sessionStorage.clear();
});

describe('ParentGate', () => {
  it('opens for the right answer and remembers it for the tab', async () => {
    const onPass = jest.fn();
    render(<ParentGate onPass={onPass} onClose={() => {}} />);

    await userEvent.type(screen.getByRole('textbox'), answerGate());
    await userEvent.click(screen.getByRole('button', { name: 'Open grown-ups' }));

    expect(onPass).toHaveBeenCalled();
    expect(grownUpChecked()).toBe(true);
  });

  it('asks a new sum after a wrong answer', async () => {
    const onPass = jest.fn();
    render(<ParentGate onPass={onPass} onClose={() => {}} />);
    const wrong = String(Number(answerGate()) + 1);

    await userEvent.type(screen.getByRole('textbox'), wrong);
    await userEvent.click(screen.getByRole('button', { name: 'Open grown-ups' }));

    expect(onPass).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent("That's not it");
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(grownUpChecked()).toBe(false);
  });

  it('closes on Escape', async () => {
    const onClose = jest.fn();
    render(<ParentGate onPass={() => {}} onClose={onClose} />);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });
});
