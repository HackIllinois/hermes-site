import { Link, Stack, Typography } from '@mui/material';

const PRIVACY_POLICY_URL =
  typeof window === 'undefined' ? 'https://hermes.hackillinois.org/privacy-policy' : `${window.location.origin}/privacy-policy`;
const LEGAL_URL = typeof window === 'undefined' ? 'https://hermes.hackillinois.org/legal' : `${window.location.origin}/legal`;

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
