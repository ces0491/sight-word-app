import React, { useId, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, LogIn } from 'lucide-react';

const LoginForm = ({ onSuccess, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = useId();

  const handleSubmit = async (e) => {
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
        setError('Invalid email or password');
        setIsSubmitting(false);
      } else {
        onSuccess && onSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-berry/15 text-ink rounded-xl text-sm" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor={`${id}-email`} className="block text-sm font-medium text-ink mb-1">
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={18} className="text-ink/40" />
          </div>
          <input
            id={`${id}-email`}
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 w-full border border-ink/25 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sun focus:border-transparent"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-password`} className="block text-sm font-medium text-ink mb-1">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-ink/40" />
          </div>
          <input
            id={`${id}-password`}
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 w-full border border-ink/25 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sun focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-sun w-full"
      >
        {isSubmitting ? (
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
        ) : (
          <>
            <LogIn size={18} className="mr-2" />
            Sign in
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-ink/70">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-ink hover:text-ink/70 font-medium"
          >
            Create one
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;