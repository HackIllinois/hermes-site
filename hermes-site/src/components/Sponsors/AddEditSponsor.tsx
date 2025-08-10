import { useEffect, useState } from "react";
import { SPONSOR_STATUS_DISPLAY_NAMES, SPONSOR_STATUSES, type Sponsor, type SponsorStatus } from "../../util/api/types";
import { isValidEmail } from "../../util/helpers/validate-email";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";

interface SponsorFormDialogProps {
  open: boolean;
  initial?: Partial<Sponsor> | null;
  onClose: () => void;
  onSubmit: (data: Sponsor) => Promise<void>;
}

export const AddEditSponsor =({ open, initial, onClose, onSubmit }: SponsorFormDialogProps) => {
  const editing = Boolean(initial && initial.sponsor_email);

  const [form, setForm] = useState<Sponsor>({
    company_name: initial?.company_name ?? '',
    sponsor_email: initial?.sponsor_email ?? '',
    sponsor_name: initial?.sponsor_name ?? '',
    notes: initial?.notes ?? '',
    status: (initial?.status as SponsorStatus) ?? 'PENDING_EMAIL',
    created_at: initial?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  useEffect(() => {
    if (open) {
      setForm({
        company_name: initial?.company_name ?? '',
        sponsor_email: initial?.sponsor_email ?? '',
        sponsor_name: initial?.sponsor_name ?? '',
        notes: initial?.notes ?? '',
        status: (initial?.status as SponsorStatus) ?? 'PENDING_EMAIL',
        created_at: initial?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [open, initial]);

  const canSubmit =
    form.sponsor_name.trim().length > 0 &&
    form.sponsor_email.trim().length > 0 &&
    isValidEmail(form.sponsor_email);

  const handleChange = (k: keyof Sponsor) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Edit sponsor' : 'Add sponsor'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Sponsor name"
            value={form.sponsor_name}
            onChange={handleChange('sponsor_name')}
            required
            autoFocus
          />
          <TextField
            label="Sponsor email"
            value={form.sponsor_email}
            onChange={handleChange('sponsor_email')}
            required
            error={form.sponsor_email.length > 0 && !isValidEmail(form.sponsor_email)}
            helperText={
              form.sponsor_email.length > 0 && !isValidEmail(form.sponsor_email)
                ? 'Enter a valid email'
                : ' '
            }
            disabled={editing} 
          />
          <TextField label="Company" value={form.company_name ?? ''} onChange={handleChange('company_name')} />
          <TextField
            label="Status"
            select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SponsorStatus }))}
          >
            {SPONSOR_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {SPONSOR_STATUS_DISPLAY_NAMES[s]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            multiline
            minRows={3}
            value={form.notes ?? ''}
            onChange={handleChange('notes')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSubmit({ ...form, updated_at: new Date().toISOString() })} disabled={!canSubmit}>
          {editing ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}