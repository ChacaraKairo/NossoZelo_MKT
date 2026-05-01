import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EsqueciSenhaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/recuperar-senha');
  }, [router]);

  return null;
}
