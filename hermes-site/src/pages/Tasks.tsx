// src/pages/Tasks.tsx
import { Card, CardContent, Typography } from '@mui/material';

export default function Tasks() {
  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 2, p: 1 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>
        <Typography>
          Placeholder for your Tasks page—list, details, whatever you need!
        </Typography>
      </CardContent>
    </Card>
  );
}
