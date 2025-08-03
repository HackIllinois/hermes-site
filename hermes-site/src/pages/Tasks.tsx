import AddIcon from '@mui/icons-material/Add';
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import React from 'react';
import TasksTableSection from '../components/TasksTable/TasksTableSection';

export default function Tasks() {

  const [assignee, setAssignee] = React.useState('');
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAssignee(event.target.value as string);
  };

  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 2, p: 1 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>
        <Stack
          direction={'row'}
          justifyContent={"space-between"}
          gap={2}
          sx={{mb: 2}}
        >
          <FormControl fullWidth sx={{maxWidth: 400}}>
            <InputLabel id="assignee">Assignee</InputLabel>
            <Select
              sx={{maxWidth: 400}}
              labelId="assignee"
              id="assignee"
              value={assignee}
              label="Assignee"
              onChange={handleChange}
            >
              <MenuItem value={10}>Any</MenuItem>
              <MenuItem value={10}>Person 1</MenuItem>
              <MenuItem value={20}>Person 2</MenuItem>
              <MenuItem value={30}>Person 3</MenuItem>
            </Select>
          </FormControl>
          {/* Create new button */}
          <Button variant="contained" endIcon={<AddIcon />}>Create New Task</Button>
        </Stack>
        <Stack
          direction={"column"}
        >
          <TasksTableSection name='Needs attention'/>
          <TasksTableSection name='Upcoming' />
          <TasksTableSection name='Archived' />
        </Stack>
      </CardContent>
    </Card>
  );
}
