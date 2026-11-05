import { Andika, Fredoka } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';
import '../styles/learningAdaptations.css';
import ErrorBoundary from '../components/ErrorBoundary';

// Downloaded at build time and served from this site; no request to Google at runtime.
const andika = Andika({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-read', display: 'swap' });
const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display', display: 'swap' });

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ErrorBoundary>
        <div className={`${andika.variable} ${fredoka.variable} min-h-screen`}>
          <Component {...pageProps} />
        </div>
      </ErrorBoundary>
    </SessionProvider>
  );
}

export default MyApp;
