import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, LogIn } from 'lucide-react';
import Modal from '../storybook/Modal';
import { signInErrorMessage } from '../../lib/authErrors';

const AuthDialog = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError(signInErrorMessage(result.error));
        setIsSubmitting(false);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
      setIsSubmitting(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name || !email || !password) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setIsSubmitting(false);
      } else {
        // Auto-login after successful registration
        const loginResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (loginResult.error) {
          setError('Registration successful, but login failed');
          setIsSubmitting(false);
        } else {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
      setIsSubmitting(false);
    }
  };

  const isLogin = mode === 'login';
  const fieldWithIcon = (id, label, Icon, input) => (
    <div>
      <label htmlFor={id} className="mb-1 block font-display text-base font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" aria-hidden="true" />
        {input}
      </div>
    </div>
  );

  return (
    <Modal title={isLogin ? 'Sign in' : 'Create an account'} onClose={onClose} labelledBy="auth-title">
      {error && (
        <p className="mb-4 rounded-xl bg-berry/10 p-3 font-display text-base text-ink" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
        {!isLogin &&
          fieldWithIcon(
            'auth-name',
            'Name',
            User,
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field pl-10"
              autoComplete="name"
              maxLength={60}
            />
          )}
        {fieldWithIcon(
          'auth-email',
          'Email address',
          Mail,
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field pl-10"
            autoComplete="email"
          />
        )}
        {fieldWithIcon(
          'auth-password',
          'Password',
          Lock,
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field pl-10"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            aria-describedby={isLogin ? undefined : 'auth-password-hint'}
          />
        )}
        {!isLogin && (
          <p id="auth-password-hint" className="-mt-2 font-display text-sm text-ink/70">
            At least 8 characters.
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn btn-sun w-full">
          <LogIn size={20} strokeWidth={2.5} aria-hidden="true" />
          {isSubmitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center font-display text-base text-ink/80">
        {isLogin ? 'No account yet? ' : 'Already have an account? '}
        <button
          type="button"
          onClick={() => setMode(isLogin ? 'register' : 'login')}
          className="font-semibold text-ink underline underline-offset-4"
        >
          {isLogin ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </Modal>
  );
};

export default AuthDialog;