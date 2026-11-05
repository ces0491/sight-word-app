import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

/**
 * For pages that need an account: sends a signed-out visitor to sign in,
 * then back to this page.
 * @returns {{ session: object|null, status: 'loading'|'authenticated'|'unauthenticated' }}
 */
export function useSignedIn() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [status, router]);

  return { session, status };
}

export default useSignedIn;
