'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { Role } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      const target = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${target}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/unauthorized');
    }
  }, [user, isLoading, allowedRoles, router, pathname]);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Verifying your session..." />;
  }

  if (!user) {
    return <LoadingSpinner fullScreen label="Redirecting to login..." />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <LoadingSpinner fullScreen label="Checking permissions..." />;
  }

  return <>{children}</>;
}

