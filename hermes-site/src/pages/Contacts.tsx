// src/pages/Contacts.tsx
import { Card, CardContent, Typography } from '@mui/material';

export default function Contacts() {
  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 2, p: 1 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Contacts
        </Typography>
        <Typography>
          Placeholder for your Contacts page—address book, profiles, etc.
        </Typography>
      </CardContent>
    </Card>
  );
}
