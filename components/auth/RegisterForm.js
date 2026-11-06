import React, { useId, useState } from 'react';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const RegisterForm = ({ onSuccess, onToggleMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = useId();

  const handleSubmit = async (e) => {
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
          onSuccess && onSuccess();
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
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
        <label htmlFor={`${id}-name`} className="block text-sm font-medium text-ink mb-1">
          Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={18} className="text-ink/40" />
          </div>
          <input
            id={`${id}-name`}
            autoComplete="name"
            maxLength={60}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 w-full border border-ink/25 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sun focus:border-transparent"
            placeholder="John Smith"
            required
          />
        </div>
      </div>

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
            autoComplete="new-password"
            aria-describedby={`${id}-password-hint`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 w-full border border-ink/25 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sun focus:border-transparent"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>
        <p id={`${id}-password-hint`} className="mt-1 text-sm text-ink/70">
          At least 8 characters.
        </p>
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
            <UserPlus size={18} className="mr-2" />
            Create account
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-ink/70">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-ink hover:text-ink/70 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;