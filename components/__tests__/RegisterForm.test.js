import { render, screen } from '@testing-library/react';
import RegisterForm from '../auth/RegisterForm';

jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));

describe('RegisterForm', () => {
  it('links to the privacy page in a new tab, so a story waiting to be saved stays open', () => {
    render(<RegisterForm onSuccess={jest.fn()} onToggleMode={jest.fn()} />);

    const link = screen.getByRole('link', { name: 'privacy page' });
    expect(link).toHaveAttribute('href', '/privacy');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
