import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '../../components/storybook/AppHeader';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';

/** Only send people back to a page on this site after signing in. */
const safeCallback = (url) => (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') ? url : '/');

export default function SignIn() {
  const router = useRouter();
  const [mode, setMode] = useState(router.query.mode === 'register' ? 'register' : 'login');
  const isLogin = mode === 'login';

  const handleSuccess = () => {
    router.push(safeCallback(router.query.callbackUrl));
  };
  const toggleMode = () => setMode(isLogin ? 'register' : 'login');

  return (
    <div className="min-h-screen bg-sky">
      <Head>
        <title>{`${isLogin ? 'Sign in' : 'Create an account'} | Sight Word Stories`}</title>
        <meta name="description" content="Sign in to save, share and print your sight word stories." />
      </Head>
      <AppHeader>
        <Link href="/" className="btn btn-paper whitespace-nowrap px-3 text-base sm:px-5 sm:text-lg">
          <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" /> Story time
        </Link>
      </AppHeader>
      <main className="mx-auto max-w-md px-4 pb-16">
        <div className="cutout p-6 sm:p-8">
          <h1 className="font-display text-3xl font-bold text-ink">{isLogin ? 'Sign in' : 'Create an account'}</h1>
          <p className="mb-6 mt-1 font-display text-base text-ink/70">
            {isLogin ? 'Read your saved stories on any device.' : 'Save, share and print the stories you make.'}
          </p>
          {isLogin ? (
            <LoginForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
          )}
        </div>
      </main>
    </div>
  );
}
