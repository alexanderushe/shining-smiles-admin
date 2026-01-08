import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Logout: NextPage = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
