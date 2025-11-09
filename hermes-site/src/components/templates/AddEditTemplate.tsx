import { useEffect, useState } from "react";
import type { Template } from "../../util/api/types";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";

interface TemplateFormDialogProps {
  open: boolean;
  initial?: Partial<Template> | null;
  onClose: () => void;
  // This prop receives the handler from the parent page
  onSubmit: (data: Partial<Template>) => Promise<void>; 
}

interface TemplateFormData {
  template_name: string;
  subject: string;
  body: string;
}

export const AddEditTemplate = ({ open, initial, onClose, onSubmit }: TemplateFormDialogProps) => {
  const editing = Boolean(initial && initial.id);
  
  // The form state is a full Template object
  const [form, setForm] = useState<TemplateFormData>({
    template_name: '',
    subject: '',
    body: '',
  });

  // Reset the form state whenever the modal opens
  useEffect(() => {
    if (open) {
      setForm({
        template_name: initial?.template_name ?? '',
        subject: initial?.subject ?? '',
        body: initial?.body ?? '',
      });
    }
  }, [open, initial]);

  // Validation
  const canSubmit = form.template_name.trim().length > 0;

  // Generic change handler
  const handleChange = (k: keyof TemplateFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  // When submitting, pass the form state up to the parent
  const handleSubmit = () => {
    const payload: Partial<Template> = {
      template_name: form.template_name,
      subject: form.subject,
      body: form.body,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{editing ? 'Edit template' : 'Add template'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Template name"
            value={form.template_name}
            onChange={handleChange('template_name')}
            required
            autoFocus
            helperText="This is only visible to you."
          />
          <TextField
            label="Subject"
            value={form.subject ?? ''}
            onChange={handleChange('subject')}
          />
          <Box data-color-mode="light">
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
              Body
            </Typography>
            <MDEditor
              value={form.body}
              onChange={(value) => setForm((f) => ({ ...f, body: value || '' }))}
              height={300}
              preview="edit" // Show only the editor
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {editing ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}