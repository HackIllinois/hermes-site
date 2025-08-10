// src/App.tsx
import { ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import { validateEnv } from './config';
import AppLayout from './pages/AppLayout';
import Login from './pages/Login';
import Sponsors from './pages/Sponsors';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import { PageNotFound } from './pages/PageNotFound';

// Validate environment variables on startup
validateEnv();

const theme = createTheme({ 
  typography: {
    fontFamily: 'Montserrat, Arial',
  },
  palette: {
    primary: { main: '#1976d2' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="tasks" replace />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="sponsors" element={<Sponsors />} />
                <Route path="users" element={<Users />} />
            </Route>
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
