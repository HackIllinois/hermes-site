import ContactsIcon from '@mui/icons-material/Contacts';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import BoltIcon from '@mui/icons-material/Bolt';
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
import { useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router';

const drawerWidth = 240;

export default function AppLayout() {
  const { pathname } = useLocation();
  const selected = useMemo<'tasks' | 'contacts' | 'users'>(() => {
    if (pathname.endsWith('/contacts')) return 'contacts';
    if (pathname.endsWith('/users')) return 'users';
    return 'tasks';
  }, [pathname]);

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
          },
          boxShadow: 2
        }}
      >
        <List>

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
            to="contacts"
            selected={selected === 'contacts'}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ContactsIcon />
            </ListItemIcon>
            <ListItemText primary="Contacts" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="users"
            selected={selected === 'users'}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
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
