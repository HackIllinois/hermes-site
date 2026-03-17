import { Box, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import AuthLegalLinks from '../components/AuthLegalLinks';
import HackLogoLink from '../components/HackIllinoisLogo';

const sections = [
  {
    title: 'Overview',
    body: 'Hermes is a HackIllinois website used to automate sponsor outreach email workflows. This page explains the types of information Hermes uses, why that information is used, and how it is handled by HackIllinois.',
  },
  {
    title: 'Information Hermes uses',
    body: 'When you sign in, Hermes may process account details such as your name, HackIllinois email address, team selection, task ownership, and the email content or metadata needed to draft, send, sync, and track sponsor outreach.',
  },
  {
    title: 'How information is used',
    body: 'HackIllinois uses this information to authenticate members, assign outreach responsibilities, send and monitor sponsor emails, maintain follow-up reminders and thread history, support operations, and protect the reliability and security of the platform.',
  },
  {
    title: 'Sharing and service providers',
    body: 'Information may be accessible to authorized HackIllinois organizers, relevant University of Illinois staff supporting HackIllinois operations, and service providers involved in authentication, hosting, analytics, infrastructure, or email delivery when needed to operate Hermes.',
  },
  {
    title: 'Legal and operational disclosures',
    body: 'HackIllinois may disclose information when required for legal compliance, safety, abuse prevention, or other legitimate operational needs connected to running HackIllinois programs and services.',
  },
  {
    title: 'Questions',
    body: 'For privacy questions or requests related to Hermes, please contact HackIllinois at contact@hackillinois.org.',
  },
];

export default function PrivacyPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f0f0', px: 2, py: 5 }}>
      <Card sx={{ maxWidth: 900, mx: 'auto', boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <HackLogoLink />
            <Link href="/login" underline="hover">
              Log In
            </Link>
          </Stack>

          <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
            Hermes Privacy Policy
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            This Hermes-specific summary is based on the broader HackIllinois privacy policy and adapted for Hermes as
            an outreach email automation platform.
          </Typography>

          <Stack spacing={3}>
            {sections.map((section) => (
              <Box key={section.title}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {section.title}
                </Typography>
                <Typography color="text.secondary">{section.body}</Typography>
              </Box>
            ))}
          </Stack>

          <Typography color="text.secondary" sx={{ mt: 4 }}>
            Official HackIllinois privacy policy:{' '}
            <Link href="https://info.hackillinois.org/privacy-policy" target="_blank" rel="noopener noreferrer">
              info.hackillinois.org/privacy-policy
            </Link>
          </Typography>

          <AuthLegalLinks />
        </CardContent>
      </Card>
    </Box>
  );
}
