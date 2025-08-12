// components/Tasks/CreateTaskDialog.tsx
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import * as React from 'react';
import { getSponsors } from '../../util/api/sponsors';
import { createTask } from '../../util/api/tasks';
import type { Profile, Sponsor, TaskInsert } from '../../util/api/types';
import { getUsers } from '../../util/api/users';

type TaskStatus = 'PENDING' | 'SENT' | 'FOLLOWED_UP' | 'COMPLETED' | 'REPLIED';


interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultOwnerId?: string;
}

export default function CreateTaskDialog({ open, onClose, onCreated, defaultOwnerId }: Props) {
  const [form, setForm] = React.useState({
    sponsor_email: '',
    owner_id: defaultOwnerId ?? '',
    due_date_local: '',
    notes: '',
    status: 'PENDING' as TaskStatus,
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sponsors
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = React.useState(false);
  const [sponsorsErr, setSponsorsErr] = React.useState<string | null>(null);

  // ⬇️ Users (for Owner dropdown)
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [usersErr, setUsersErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    // seed owner when dialog opens
    if (defaultOwnerId) {
      setForm((f) => ({ ...f, owner_id: defaultOwnerId }));
    }

    // load sponsors + users in parallel
    (async () => {
      try {
        setSponsorsLoading(true);
        setSponsorsErr(null);
        const data = await getSponsors();
        setSponsors(data);
      } catch (e) {
        setSponsorsErr(e instanceof Error ? e.message : 'Failed to load sponsors');
      } finally {
        setSponsorsLoading(false);
      }
    })();

    (async () => {
      try {
        setUsersLoading(true);
        setUsersErr(null);
        const data = await getUsers(); // Promise<Profile[]>, already sorted by name
        setUsers(data);
      } catch (e) {
        setUsersErr(e instanceof Error ? e.message : 'Failed to load users');
      } finally {
        setUsersLoading(false);
      }
    })();
  }, [open, defaultOwnerId]);

  const handleTextChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setForm((f) => ({ ...f, status: e.target.value as TaskStatus }));
  };

  // ⬇️ Owner dropdown change
  const handleOwnerChange = (e: SelectChangeEvent) => {
    setForm((f) => ({ ...f, owner_id: e.target.value }));
  };

  // ⬇️ Sponsor dropdown change
  const handleSponsorChange = (e: SelectChangeEvent) => {
    setForm((f) => ({ ...f, sponsor_email: e.target.value }));
  };

  const validate = (): string | null => {
    if (!form.sponsor_email.trim()) return 'Sponsor email is required.';
    if (!form.owner_id.trim()) return 'Owner ID is required.';
    if (!form.due_date_local.trim()) return 'Due date/time is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.sponsor_email)) return 'Enter a valid email.';
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    setSubmitting(true);

    const payload: TaskInsert = {
      sponsor_email: form.sponsor_email.trim(),
      owner_id: form.owner_id.trim(),
      due_date: new Date(form.due_date_local).toISOString(),
      notes: form.notes.trim() || '',
      status: form.status,
    };

    try {
        await createTask(
            payload
        );
        onCreated();
    } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to create task');
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Sponsor (from getSponsors) */}
          <FormControl fullWidth required>
            <InputLabel id="sponsor-email-label">Sponsor Email</InputLabel>
            <Select
              labelId="sponsor-email-label"
              id="sponsor-email"
              label="Sponsor Email"
              value={form.sponsor_email}
              onChange={handleSponsorChange}
              disabled={sponsorsLoading}
            >
              {sponsorsLoading && <MenuItem value="" disabled>Loading…</MenuItem>}
              {!sponsorsLoading && sponsors.length === 0 && (
                <MenuItem value="" disabled>No sponsors found</MenuItem>
              )}
              {sponsors.map((s) => (
                <MenuItem key={s.sponsor_email} value={s.sponsor_email}>
                  {s.sponsor_email} ({s.company_name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {sponsorsErr && <Typography style={{ color: 'crimson', fontSize: 13 }}>{sponsorsErr}</Typography>}

          {/* ⬇️ Owner (from getUsers) */}
          <FormControl fullWidth required>
            <InputLabel id="owner-id-label">Owner</InputLabel>
            <Select
              labelId="owner-id-label"
              id="owner-id"
              label="Owner"
              value={form.owner_id}
              onChange={handleOwnerChange}
              disabled={usersLoading}
            >
              {usersLoading && <MenuItem value="" disabled>Loading…</MenuItem>}
              {!usersLoading && users.length === 0 && (
                <MenuItem value="" disabled>No users found</MenuItem>
              )}
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {usersErr && <Typography style={{ color: 'crimson', fontSize: 13 }}>{usersErr}</Typography>}

          <TextField
            label="Due Date & Time"
            type="datetime-local"
            value={form.due_date_local}
            onChange={handleTextChange('due_date_local')}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={handleTextChange('notes')}
            fullWidth
            multiline
            minRows={3}
          />
          <FormControl fullWidth>
            <InputLabel id="task-status-label">Status</InputLabel>
            <Select
              labelId="task-status-label"
              id="task-status"
              label="Status"
              value={form.status}
              onChange={handleStatusChange}
            >
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="SENT">SENT</MenuItem>
              <MenuItem value="FOLLOWED_UP">FOLLOWED_UP</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="REPLIED">REPLIED</MenuItem>
            </Select>
          </FormControl>

          {error && <Typography style={{ color: 'crimson', fontSize: 14 }}>{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

async function safeErrorMessage(res: Response): Promise<string | null> {
  try {
    const data = await res.json();
    return typeof data?.message === 'string' ? data.message : null;
  } catch {
    return null;
  }
}
