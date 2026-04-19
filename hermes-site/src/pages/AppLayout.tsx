import ContactsIcon from '@mui/icons-material/Contacts';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { watchEmailSync } from '../util/api/emails';
import { logout } from '../util/api/auth';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

const drawerWidth = 240;

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const selected = useMemo<'tasks' | 'sponsors' | 'templates'>(() => {
    if (pathname.endsWith('/sponsors')) return 'sponsors';
    if (pathname.endsWith('/templates')) return 'templates';
    return 'tasks';
  }, [pathname]);

  useEffect(() => {
    const initEmailSync = async () => {
      try {
        await watchEmailSync();
        console.log("Email sync watch successfully initiated or renewed.");
      } catch (err) {
        console.error("Failed to initiate email sync watch:", err);
      }
    };

    initEmailSync();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout API call failed:", err);
    }
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
          },
          boxShadow: 2
        }}
      >
        <List sx={{ flexGrow: 1 }}>

          <Stack
            direction="row"
            spacing={0}
            alignItems="center"
            justifyContent="flex-start"
            sx={{ mb: 1, marginRight: 4, my: 3, mx: 1 }}
          >
              <BoltIcon sx={{ fontSize: 40, color: '#979797ff' }} />
              <Typography variant="h3" sx={{fontSize: 26, fontWeight: 'bold'}}>
                  Hermes
              </Typography>
          </Stack>

          <ListItemButton
            component={Link}
            to="tasks"
            selected={selected === 'tasks'}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ListAltIcon />
            </ListItemIcon>
            <ListItemText primary="Tasks" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="sponsors"
            selected={selected === 'sponsors'}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ContactsIcon />
            </ListItemIcon>
            <ListItemText primary="Sponsors" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="templates"
            selected={selected === 'templates'}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <TextSnippetIcon />
            </ListItemIcon>
            <ListItemText primary="Templates" />
          </ListItemButton>
        </List>

        <List>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
