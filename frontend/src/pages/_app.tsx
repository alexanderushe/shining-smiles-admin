import '../app/globals.css';
import type { AppProps } from 'next/app';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Run auth check on initial load and route changes
    authCheck(router.asPath);

    const hideContent = () => setAuthorized(false);
    router.events.on('routeChangeStart', hideContent);
    router.events.on('routeChangeComplete', authCheck);

    return () => {
      router.events.off('routeChangeStart', hideContent);
      router.events.off('routeChangeComplete', authCheck);
    };
  }, []);

  function authCheck(url: string) {
    // Public paths that don't require auth
    const publicPaths = ['/auth/login'];
    const path = url.split('?')[0];

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token && !publicPaths.includes(path)) {
        setAuthorized(false);
        router.push({
          pathname: '/auth/login',
          query: { returnUrl: router.asPath }
        });
      } else {
        setAuthorized(true);
      }
    }
  }

  if (!authorized) return null;

  // Use Layout for authorized pages, raw component for login
  if (router.pathname.startsWith('/auth/')) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
