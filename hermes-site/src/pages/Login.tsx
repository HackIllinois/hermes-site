import BoltIcon from '@mui/icons-material/Bolt';
import { Box, Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import HackLogoLink from '../components/HackIllinoisLogo';
import { BASE_BACKEND_URL } from '../config';

function Login() {
    function handleLogin() {
        window.location.href = `${BASE_BACKEND_URL}/auth/login`;
    }
    
    return (
       <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',   // or 'row' if you prefer
          justifyContent: 'center',  // vertical centering
          alignItems: 'center',      // horizontal centering
          minHeight: '100vh',        // fill viewport height
          textAlign: 'center',       // center text inside children
          backgroundColor: '#f0f0f0', // light gray background
        }}
      >
        <Box border={'1px solid ##C4D1D3'} boxShadow={3} sx={{ padding: 4, borderRadius: 2, backgroundColor: 'white' }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="flex-start"
            justifyContent="flex-start"
            sx={{ width: '100%', mb: 3 }}
          >
            <HackLogoLink />
          </Stack >
          <Stack sx={{padding: 4, paddingTop: 1}}>
            <Stack
              direction="row"
              spacing={0}
              alignItems="center"
              justifyContent="center"
              sx={{ mb: 1, marginRight: 4 }}
            >
                <BoltIcon sx={{ fontSize: 64, color: '#979797ff' }} />
                <Typography variant="h2" fontWeight={"bold"}>
                    Hermes
                </Typography>
            </Stack>
            <Typography variant="h6" sx={{marginBottom: 3, marginTop: 0}}>
              Lightning-fast outreach management
            </Typography>

            <Button variant="contained" color="primary" size="large" onClick={handleLogin}>
              Log In
            </Button>
          </Stack>
        </Box>
      </Box>
    )
}

export default Login;