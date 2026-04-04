// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { getCurrentUser } from '../util/api/auth';
import type { AuthenticatedUser } from '../util/api/types';

export default function ProtectedRoute() {
  const { pathname } = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Session check failed', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isOnboardingRoute = pathname.startsWith('/onboarding/team');

  if (user.team_id === null && !isOnboardingRoute) {
    return <Navigate to="/onboarding/team" replace />;
  }

  if (user.team_id !== null && isOnboardingRoute) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
