import { Box, Button, Card, CardContent, CircularProgress, Divider, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { Task, TaskStatus, UserProfile } from '../util/api/types';
import TaskDetailModal from './TaskDetailModal';
import SendEmailModal from './SendEmailModal';
import { getTasks, updateTaskStatus } from '../util/api/tasks';
import { getUsers } from '../util/api/profiles';
import { TASK_STATUSES, TASK_STATUS_DISPLAY_NAMES } from '../util/api/types';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the "View Emails" modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ✨ State for the new "Send Email" modal
  const [taskToSendEmailFor, setTaskToSendEmailFor] = useState<Task | null>(null);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string>("me");

  const fetchTasks = async () => {
    setLoading(true);
    try {
        const apiOwnerParam = ownerFilter === 'me' ? undefined : ownerFilter;
        const data = await getTasks(apiOwnerParam);
        setTasks(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    const originalTasks = [...tasks]; // Save original state for revert

    // Optimistic update: Show the change immediately in the UI
    setTasks(prevTasks => 
        prevTasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
        )
    );

    try {
        // Call the new API function
        const updatedTask = await updateTaskStatus(taskId, newStatus);
        
        // On success, update the local state with the actual data from the server
        // (This includes any backend changes like `updated_at`)
        setTasks(prevTasks => 
            prevTasks.map(t => 
                t.id === taskId ? updatedTask : t
            )
        );
    } catch (err) {
        console.error("Failed to update task status:", err);
        setError(`Failed to update status for task ${taskId}. Please try again.`);
        // On failure, revert to the original state
        setTasks(originalTasks);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [ownerFilter]);

  const handleOpenModal = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  // ✨ Handlers for the "Send Email" modal
  const handleOpenSendEmailModal = (task: Task) => {
    setTaskToSendEmailFor(task);
  };

  const handleCloseSendEmailModal = () => {
    setTaskToSendEmailFor(null);
  };

  // ✨ This function will be called after an email is sent to refresh the data
  const handleRefreshTasks = () => {
      fetchTasks();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <>
      <Card sx={{ boxShadow: 2, borderRadius: 2, p: 2 }}>
        <CardContent>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" gutterBottom>
              Tasks
            </Typography>
            <TextField
                select
                label="View Tasks For"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                sx={{ minWidth: 200 }}
                size="small"
              >
                <MenuItem value="me">My Tasks</MenuItem>
                <MenuItem value="all">All Tasks</MenuItem>
                {/* Divider can be nice here */}
                <Divider sx={{ my: 0.5 }} /> 
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
          </Stack>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="tasks table">
              <TableHead>
                <TableRow>
                  <TableCell>Sponsor Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Notes</TableCell>
                  {/* ✅ Right align + fixed width to match body cells */}
                  <TableCell align="right" sx={{ width: 240 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell component="th" scope="row">{task.sponsor_email}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        size="small"
                        sx={{ minWidth: 150 }}
                        // Prevent the dropdown from changing status for "PENDING_EMAIL"
                        // as that should only be changed by sending the email.
                        disabled={task.status === "PENDING_EMAIL"}
                      >
                        {TASK_STATUSES.map((status: TaskStatus) => (
                          <MenuItem 
                            key={status} 
                            value={status}
                            // Don't allow manually selecting PENDING_EMAIL
                            disabled={status === "PENDING_EMAIL"}
                          >
                            {TASK_STATUS_DISPLAY_NAMES[status]}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{task.notes}</TableCell>
                    {/* ✅ Match header: right aligned cell + Stack for layout */}
                    <TableCell align="right" sx={{ width: 240 }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {task.status === "PENDING_EMAIL" && (
                          <Button variant="contained" size="small" onClick={() => handleOpenSendEmailModal(task)}>
                            Send Email
                          </Button>
                        )}
                        <Button variant="outlined" size="small" onClick={() => handleOpenModal(task)}>
                          View Emails
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* modals unchanged except props */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={handleCloseModal}
        />
      )}
      {taskToSendEmailFor && (
        <SendEmailModal
          task={taskToSendEmailFor}
          open={!!taskToSendEmailFor}
          onClose={handleCloseSendEmailModal}
          onEmailSent={handleRefreshTasks}
        />
      )}
    </>
  );
}