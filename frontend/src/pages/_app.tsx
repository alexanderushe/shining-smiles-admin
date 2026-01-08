import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import { DashboardLayout } from '../../components/dashboard-layout';
import { CampusProvider } from '../../lib/campus-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Wrapper to handle route protection using AuthContext
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && !router.pathname.startsWith('/auth/')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not authenticated and trying to access protected route, don't render content
  if (!isAuthenticated && !router.pathname.startsWith('/auth/')) {
    return null;
  }

  return <>{children}</>;
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname.startsWith('/auth/');

  return (
    <AuthProvider>
      <AuthGuard>
        {isAuthPage ? (
          <Component {...pageProps} />
        ) : (
          <CampusProvider>
            <DashboardLayout>
              <Component {...pageProps} />
            </DashboardLayout>
          </CampusProvider>
        )}
      </AuthGuard>
    </AuthProvider>
  );
}
