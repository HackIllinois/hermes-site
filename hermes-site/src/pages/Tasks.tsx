// Tasks.tsx (additions)
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import TasksTableSection from '../components/Tasks/TasksTableSection';
import CreateTaskDialog from '../components/Tasks/CreateTaskDialog';

export default function Tasks() {
  const [assignee, setAssignee] = React.useState('');
  const [openCreate, setOpenCreate] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAssignee(event.target.value as string);
  };

  // call this after creating a task to refresh the tables
  async function refresh() {
    // ...your implementation from earlier
  }

  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 2, p: 1 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>

        <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel id="assignee">Assignee</InputLabel>
            <Select
              sx={{ maxWidth: 400 }}
              labelId="assignee"
              id="assignee"
              value={assignee}
              label="Assignee"
              onChange={handleChange}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="person1-id">Person 1</MenuItem>
              <MenuItem value="person2-id">Person 2</MenuItem>
              <MenuItem value="person3-id">Person 3</MenuItem>
            </Select>
          </FormControl>

          {/* Create new button */}
          <Button
            variant="contained"
            endIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Create New Task
          </Button>
        </Stack>

        <Stack direction="column">
          <TasksTableSection name="Needs attention" />
          <TasksTableSection name="Upcoming" />
          <TasksTableSection name="Archived" />
        </Stack>
      </CardContent>

      {/* Modal */}
      <CreateTaskDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        defaultOwnerId={assignee || undefined}
        onCreated={() => {
          setOpenCreate(false);
          void refresh();
        }}
      />
    </Card>
  );
}
