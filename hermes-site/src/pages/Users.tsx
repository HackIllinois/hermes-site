// src/pages/Users.tsx
import { Card, CardContent, Typography } from '@mui/material';

export default function Users() {
  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2, p: 1 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Users
        </Typography>
        <Typography>
          Placeholder for your Users page—user management, stats, roles, etc.
        </Typography>
      </CardContent>
    </Card>
  );
}
