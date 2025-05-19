import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, LogIn } from 'lucide-react';

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
        setError('Invalid email or password');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <>
                <LogIn size={18} className="mr-2" />
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDialog;