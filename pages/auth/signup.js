import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SignUp() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to signin page with register mode
    router.push('/auth/signin?mode=register');
  }, [router]);
  
  return null;
}