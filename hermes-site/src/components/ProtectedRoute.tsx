// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { BASE_BACKEND_URL } from '../config';

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // The browser automatically sends the HttpOnly cookie
        const response = await fetch(`${BASE_BACKEND_URL}/auth/me`, {
            credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session check failed', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  if (isAuthenticated === null) {
    // Show a loading spinner while we check the session
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated, render the nested routes (AppLayout). 
  // If not, redirect to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}