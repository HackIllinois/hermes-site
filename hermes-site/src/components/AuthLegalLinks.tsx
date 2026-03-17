import { Link, Stack, Typography } from '@mui/material';

const PRIVACY_POLICY_URL = 'https://info.hackillinois.org/privacy-policy';
const LEGAL_URL = 'https://hackillinois.org/legal';

export default function AuthLegalLinks() {
  return (
    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
      <Link href={PRIVACY_POLICY_URL} underline="hover" color="primary">
        Privacy Policy
      </Link>
      <Typography color="text.secondary">|</Typography>
      <Link href={LEGAL_URL} underline="hover" color="primary">
        Legal
      </Link>
    </Stack>
  );
}
