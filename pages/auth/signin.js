import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { BookOpen } from 'lucide-react';

export default function SignIn() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const router = useRouter();
  const { callbackUrl } = router.query;

  const handleSuccess = () => {
    router.push(callbackUrl || '/');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Sign In' : 'Create Account'} | Sight Word Story Generator</title>
        <meta name="description" content="Sign in or create an account to manage your sight word stories" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <BookOpen size={64} className="text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'login' 
              ? 'Access your saved sight word stories' 
              : 'Start creating and saving custom stories'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {mode === 'login' ? (
              <LoginForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
            )}
          </div>
          
          <div className="mt-6 text-center">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}