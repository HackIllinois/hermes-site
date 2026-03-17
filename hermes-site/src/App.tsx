// src/App.tsx
import { ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { validateEnv } from './config';
import AppLayout from './pages/AppLayout';
import Home from './pages/Home';
import Legal from './pages/Legal';
import Login from './pages/Login';
import Sponsors from './pages/Sponsors';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import { PageNotFound } from './pages/PageNotFound';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Templates from './pages/Templates';
// import TeamSelection from './pages/TeamSelection';

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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/legal" element={<Legal />} />
            <Route element={<ProtectedRoute />}>
              {/* <Route path="/onboarding/team" element={<TeamSelection />} /> */}
              <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Navigate to="tasks" replace />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="sponsors" element={<Sponsors />} />
                  <Route path="users" element={<Users />} />
                  <Route path="templates" element={<Templates />} />
              </Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
