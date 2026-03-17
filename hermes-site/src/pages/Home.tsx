import BoltIcon from '@mui/icons-material/Bolt';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import HackLogoLink from '../components/HackIllinoisLogo';
import AuthLegalLinks from '../components/AuthLegalLinks';
import { BASE_BACKEND_URL } from '../config';

export default function Home() {
  function handleLogin() {
    window.location.href = `${BASE_BACKEND_URL}/auth/login`;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        textAlign: 'center',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="flex-start" sx={{ mb: 3 }}>
            <HackLogoLink />
          </Stack>

          <Stack sx={{ p: 4, pt: 1 }}>
            <Stack direction="row" spacing={0} alignItems="center" justifyContent="center" sx={{ mb: 1, mr: 4 }}>
              <BoltIcon sx={{ fontSize: 64, color: '#979797ff' }} />
              <Typography variant="h2" fontWeight="bold">
                Hermes
              </Typography>
            </Stack>

            <Typography variant="h6" sx={{ mb: 3, mt: 0 }}>
              Lightning-fast outreach management
            </Typography>

            <Button variant="contained" size="large" onClick={handleLogin}>
              Log In With Google
            </Button>

            <AuthLegalLinks />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
