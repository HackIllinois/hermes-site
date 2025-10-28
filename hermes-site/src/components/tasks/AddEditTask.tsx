// src/components/Tasks/AddEditTask.tsx

import { useEffect, useState } from "react";
import type { Task } from "../../util/api/types";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";

// Get today's date in YYYY-MM-DD format for the date picker default
const getToday = () => new Date().toISOString().split('T')[0];

interface TaskFormDialogProps {
  open: boolean;
  // We only pass a partial task, primarily for the sponsor_email
  initial?: Partial<Task> | null;
  onClose: () => void;
  // onSubmit prop will send the partial data to the API handler
  onSubmit: (data: Partial<Task>) => Promise<void>;
}

// This is the data our form will manage
interface TaskFormData {
    sponsor_email: string;
    due_date: string;
    notes: string;
}

export const AddEditTask = ({ open, initial, onClose, onSubmit }: TaskFormDialogProps) => {
  // We don't have an "edit" mode for tasks yet, but this follows the sponsor pattern
  const editing = Boolean(initial && initial.id);

  const [form, setForm] = useState<TaskFormData>({
    sponsor_email: initial?.sponsor_email ?? '',
    due_date: initial?.due_date ?? getToday(),
    notes: initial?.notes ?? '',
  });

  // This effect syncs the form state if the 'initial' prop changes (e.g., user clicks another sponsor)
  useEffect(() => {
    if (open) {
      setForm({
        sponsor_email: initial?.sponsor_email ?? '',
        due_date: initial?.due_date ?? getToday(),
        notes: initial?.notes ?? '',
      });
    }
  }, [open, initial]);

  // Basic validation
  const canSubmit =
    form.sponsor_email.trim().length > 0 &&
    form.due_date.trim().length > 0;

  const handleChange = (k: keyof TaskFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const handleSubmit = () => {
    const localDate = new Date(form.due_date + 'T00:00:00'); 
    
    // Get milliseconds since epoch, divide by 1000 for seconds, and round down.
    const unixTimestamp = Math.floor(localDate.getTime() / 1000);
    
    const payload: Partial<Task> = {
        sponsor_email: form.sponsor_email,
        due_date: unixTimestamp.toString(),
        notes: form.notes,
    };
    onSubmit(payload);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Sponsor Email"
            value={form.sponsor_email}
            disabled // Disabled because it's set by the sponsor you clicked
            fullWidth
          />
          <TextField
            label="Due Date"
            type="date" // Uses the browser's native date picker
            value={form.due_date}
            onChange={handleChange('due_date')}
            required
            autoFocus
            fullWidth
            InputLabelProps={{
                shrink: true, // Keeps the label from overlapping the date
            }}
          />
          <TextField
            label="Notes"
            multiline
            minRows={3}
            value={form.notes ?? ''}
            onChange={handleChange('notes')}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {editing ? 'Save' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}