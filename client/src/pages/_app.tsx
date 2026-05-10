import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';

export default function App({
  Component,
  pageProps,
}: AppProps) {
  useOnboardingGuard();

  return <Component {...pageProps} />;
}
