import { Box, Button, Card, CardContent, Chip, CircularProgress, Divider, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, type SelectChangeEvent } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { Task, TaskStatus, UserProfile } from '../util/api/types';
import TaskDetailModal from './TaskDetailModal';
import SendEmailModal from './SendEmailModal';
import { getTasks, updateTaskStatus } from '../util/api/tasks';
import { getUsers } from '../util/api/profiles';
import { TASK_STATUSES, TASK_STATUS_DISPLAY_NAMES } from '../util/api/types';

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  handleStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  handleOpenSendEmailModal: (task: Task) => void;
  handleOpenModal: (task: Task) => void;
}

function TaskSection({ title, tasks, handleStatusChange, handleOpenSendEmailModal, handleOpenModal }: TaskSectionProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title} ({tasks.length})
      </Typography>
      {tasks.length === 0 ? (
        <Typography color="text.secondary" sx={{ pl: 1 }}>
          No tasks in this section.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label={`${title} tasks table`}>
            <TableHead>
              <TableRow>
                <TableCell>Sponsor Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right" sx={{ width: 240 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell component="th" scope="row">{task.sponsor_email}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      size="small"
                      sx={{ minWidth: 150 }}
                      disabled={task.status === "PENDING_EMAIL"}
                    >
                      {TASK_STATUSES.map((status: TaskStatus) => (
                        <MenuItem 
                          key={status} 
                          value={status}
                          disabled={status === "PENDING_EMAIL"}
                        >
                          {TASK_STATUS_DISPLAY_NAMES[status]}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>{task.notes}</TableCell>
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
      )}
    </Box>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the "View Emails" modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // State for the "Send Email" modal
  const [taskToSendEmailFor, setTaskToSendEmailFor] = useState<Task | null>(null);

  // State for the status filter
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([...TASK_STATUSES]);

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

  const categorizedTasks = useMemo(() => {
    const needsReply: Task[] = [];
    const important: Task[] = [];
    const other: Task[] = [];
    
    // Create a Set for quick lookups
    const statusFilterSet = new Set(statusFilter);

    // Apply the status filter *before* categorizing
    const filteredTasks = tasks.filter(task => statusFilterSet.has(task.status));

    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    // Now, categorize the *filtered* tasks
    for (const task of filteredTasks) {
      if (task.status === "NEEDS_REPLY") {
        needsReply.push(task);
      } else {
        const updatedAt = new Date(task.updated_at);
        if (updatedAt < fiveDaysAgo) {
          important.push(task);
        } else {
          other.push(task);
        }
      }
    }
    
    const sortByDate = (a: Task, b: Task) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    
    return {
      needsReply: needsReply.sort(sortByDate),
      important: important.sort(sortByDate),
      other: other.sort(sortByDate),
    };

  }, [tasks, statusFilter]);

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

  const handleStatusFilterChange = (event: SelectChangeEvent<unknown>) => {
    const { target: { value } } = event;
    setStatusFilter(
      typeof value === 'string' ? (value.split(',') as TaskStatus[]) : value as TaskStatus[]
    );
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

            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Filter by Status"
                value={statusFilter}
                sx={{ minWidth: 200 }}
                size="small"
                SelectProps={{
                  multiple: true,
                  onChange: handleStatusFilterChange,
                  // This renders the selected values as chips
                  renderValue: (selected) => {
                    const selectedStatuses = selected as TaskStatus[];

                    // Case 1: All statuses are selected
                    if (selectedStatuses.length === TASK_STATUSES.length) {
                      return (
                        <Typography variant="body2" sx={{ pl: 0.5 }}>
                          All Statuses
                        </Typography>
                      );
                    }

                    // Case 2: No statuses are selected
                    if (selectedStatuses.length === 0) {
                      return (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 0.5 }}>
                          Select status...
                        </Typography>
                      );
                    }

                    // Case 3: 1 or more are selected (but not all)
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip
                          key={selectedStatuses[0]}
                          label={TASK_STATUS_DISPLAY_NAMES[selectedStatuses[0]]}
                          size="small"
                        />
                        {/* If there's more than one, show the "+N more" chip */}
                        {selectedStatuses.length > 1 && (
                          <Chip
                            label={`+${selectedStatuses.length - 1} more`}
                            size="small"
                          />
                        )}
                      </Box>
                    );
                  },
                }}
              >
                {TASK_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {TASK_STATUS_DISPLAY_NAMES[status]}
                  </MenuItem>
                ))}
              </TextField>

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
          </Stack>

          <Stack spacing={4}>
            <TaskSection
              title="Needs Reply"
              tasks={categorizedTasks.needsReply}
              handleStatusChange={handleStatusChange}
              handleOpenModal={handleOpenModal}
              handleOpenSendEmailModal={handleOpenSendEmailModal}
            />

            <TaskSection
              title="Important (Older than 5 days)"
              tasks={categorizedTasks.important}
              handleStatusChange={handleStatusChange}
              handleOpenModal={handleOpenModal}
              handleOpenSendEmailModal={handleOpenSendEmailModal}
            />
            
            <TaskSection
              title="Other Tasks"
              tasks={categorizedTasks.other}
              handleStatusChange={handleStatusChange}
              handleOpenModal={handleOpenModal}
              handleOpenSendEmailModal={handleOpenSendEmailModal}
            />
          </Stack>
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