import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** /auth/signup is an alias for the sign-in page's register form. */
export default function SignUp() {
  const router = useRouter();

  useEffect(() => {
    // replace, so Back skips this page instead of bouncing here again
    router.replace('/auth/signin?mode=register');
  }, [router]);

  return null;
}
