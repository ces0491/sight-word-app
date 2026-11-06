import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../storybook/Modal';

/** A dialog whose parent re-renders on every keystroke and passes a new onClose each time. */
const Harness = ({ onClose }) => {
  const [value, setValue] = useState('');
  return (
    <>
      <button type="button">Behind</button>
      <Modal title="Share" onClose={() => onClose(value)} labelledBy="share-title">
        <label htmlFor="email">Email</label>
        <input id="email" value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="button">Send</button>
      </Modal>
    </>
  );
};

describe('Modal', () => {
  it('keeps focus in the field while typing, even though the parent re-renders', async () => {
    const user = userEvent.setup();
    render(<Harness onClose={() => {}} />);
    const field = screen.getByLabelText('Email');

    expect(field).toHaveFocus();
    await user.type(field, 'abc');

    expect(field).toHaveValue('abc');
    expect(field).toHaveFocus();
  });

  it('keeps Tab inside the dialog', async () => {
    const user = userEvent.setup();
    render(<Harness onClose={() => {}} />);

    await user.tab(); // Send
    await user.tab(); // wraps to Close, the first control
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await user.tab({ shift: true }); // back round to Send
    expect(screen.getByRole('button', { name: 'Send' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Behind' })).not.toHaveFocus();
  });

  it('closes on Escape with the latest onClose', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<Harness onClose={onClose} />);

    await user.type(screen.getByLabelText('Email'), 'hi');
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledWith('hi');
  });
});
