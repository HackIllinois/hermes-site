import { Box, Button, Card, CardContent, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { Task } from '../types/tasks';
import { BASE_BACKEND_URL } from '../config';
import TaskDetailModal from './TaskDetailModal';
import SendEmailModal from './SendEmailModal';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the "View Emails" modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ✨ State for the new "Send Email" modal
  const [taskToSendEmailFor, setTaskToSendEmailFor] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/tasks`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);

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
          <Typography variant="h4" gutterBottom>
            Tasks
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="tasks table">
              <TableHead>
                <TableRow>
                  <TableCell>Sponsor Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell component="th" scope="row">{task.sponsor_email}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{task.notes}</TableCell>
                    <TableCell align="right" sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {/* ✨ Conditionally render the "Send Email" button */}
                      {task.status === 'PENDING' && (
                        <Button variant="contained" size="small" onClick={() => handleOpenSendEmailModal(task)}>
                          Send Email
                        </Button>
                      )}
                      <Button variant="outlined" size="small" onClick={() => handleOpenModal(task)}>
                        View Emails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* The "View Emails" Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={handleCloseModal}
        />
      )}

      {/* ✨ The new "Send Email" Modal */}
      {taskToSendEmailFor && (
          <SendEmailModal
            task={taskToSendEmailFor}
            open={!!taskToSendEmailFor}
            onClose={handleCloseSendEmailModal}
            onEmailSent={handleRefreshTasks} // Pass the refresh function
          />
      )}
    </>
  );
}