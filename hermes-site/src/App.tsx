// src/App.tsx
import { ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import AppLayout from './pages/AppLayout';
import Contacts from './pages/Contacts';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import { validateEnv } from './config';
import ProtectedRoute from './components/ProtectedRoute';

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
                <Route path="contacts" element={<Contacts />} />
                <Route path="users" element={<Users />} />
            </Route>
          </Route>
          
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
