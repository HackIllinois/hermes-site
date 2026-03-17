import { Box, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import AuthLegalLinks from '../components/AuthLegalLinks';
import HackLogoLink from '../components/HackIllinoisLogo';

const sections = [
  {
    title: 'Purpose of Hermes',
    body: 'Hermes is a HackIllinois website for organizing sponsor outreach, assigning ownership, sending emails, and tracking responses. It is intended for legitimate HackIllinois operations and approved outreach work.',
  },
  {
    title: 'Acceptable use',
    body: 'Users must use Hermes responsibly and lawfully. Do not use the platform for harassment, discriminatory conduct, unauthorized access, misleading outreach, or activity that violates HackIllinois policies, university standards, or applicable law.',
  },
  {
    title: 'Communications and content',
    body: 'Users are responsible for the emails, templates, notes, and other content they create or send through Hermes. Outreach should remain professional, accurate, and aligned with HackIllinois sponsorship and communications practices.',
  },
  {
    title: 'Enforcement and access',
    body: 'HackIllinois may limit, suspend, or remove access to Hermes when needed to protect users, enforce platform rules, investigate complaints, or comply with legal or organizational obligations.',
  },
  {
    title: 'Reporting concerns',
    body: 'Questions, complaints, or reports about misuse of Hermes may be sent to contact@hackillinois.org. Reports may be reviewed by HackIllinois leadership and other appropriate stakeholders based on the nature of the issue.',
  },
  {
    title: 'Related HackIllinois policies',
    body: 'Hermes operates within the larger HackIllinois policy framework, including HackIllinois legal materials, complaint procedures, and conduct expectations for participants, organizers, and community members.',
  },
];

export default function Legal() {
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
            Hermes Legal
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            This page summarizes legal and conduct expectations for Hermes as a HackIllinois outreach platform.
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
            Related HackIllinois legal resources:{' '}
            <Link href="https://hackillinois.org/legal" target="_blank" rel="noopener noreferrer">
              hackillinois.org/legal
            </Link>
          </Typography>

          <AuthLegalLinks />
        </CardContent>
      </Card>
    </Box>
  );
}
