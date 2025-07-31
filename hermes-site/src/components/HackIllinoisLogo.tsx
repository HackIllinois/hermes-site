import { Box, Link } from "@mui/material";

export default function HackLogoLink() {
  return (
    <Link
      href="https://hackillinois.org"
      target="_blank"
      rel="noopener noreferrer"
      sx={{ display: 'inline-block' }}  // ensure Box hover works properly
    >
      <Box
        component="img"
        src="/hack-logo.svg"
        alt="Hack Logo"
        sx={{
          height: 30,
          opacity: 0.3,
          transition: 'opacity 0.3s ease',
          '&:hover': {
            opacity: 1,
          },
        }}
      />
    </Link>
  );
}