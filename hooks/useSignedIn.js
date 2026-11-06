import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

/**
 * For pages that need an account: sends a signed-out visitor to sign in,
 * then back to this page.
 *
 * A page with unsaved work (the story editor) passes keepPageOnSignOut, so
 * that if the session ends while it is open, for instance by signing out in
 * another tab, it stays and is told through `sessionEnded` instead of being
 * redirected and losing the work.
 *
 * @param {{ keepPageOnSignOut?: boolean }} [options]
 * @returns {{ session: object|null, status: 'loading'|'authenticated'|'unauthenticated', sessionEnded: boolean }}
 */
export function useSignedIn({ keepPageOnSignOut = false } = {}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (status === 'authenticated') wasSignedIn.current = true;
  }, [status]);

  useEffect(() => {
    if (status !== 'unauthenticated') return;
    if (keepPageOnSignOut && wasSignedIn.current) return;
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`);
  }, [status, router, keepPageOnSignOut]);

  return { session, status, sessionEnded: status === 'unauthenticated' && wasSignedIn.current };
}

export default useSignedIn;
