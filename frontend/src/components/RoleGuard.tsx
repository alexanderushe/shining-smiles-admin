import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
  userRole: string;
}

export const RoleGuard = ({ allowedRoles, children, userRole }: Props) => {
  const router = useRouter();

  useEffect(() => {
    if (!allowedRoles.includes(userRole)) {
      router.push('/auth/login');
    }
  }, [userRole]);

  return <>{children}</>;
};
