// SendEmailModal.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import { isValidEmail } from '../util/helpers/validate-email';
import { normalizeEmails } from '../util/helpers/normalize-emails';
import { SendEmailsInput } from '../components/emails/SendEmailsInput';
import { sendEmail } from '../util/api/emails';
import type { Task } from '../util/api/types';
import { DEFAULT_CONTACT_EMAIL } from '../config';
import MDEditor from '@uiw/react-md-editor';

interface EmailFormData {
  subject: string;
  body: string;
}

interface SendEmailModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onEmailSent: () => void;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 2,
};

export default function SendEmailModal({ task, open, onClose, onEmailSent }: SendEmailModalProps) {
  const [formData, setFormData] = useState<EmailFormData>({ subject: '', body: '' });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recipients
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);

  // Toggle show/hide like Gmail
  const [hideCc, setHideCc] = useState(true);
  const [hideBcc, setHideBcc] = useState(true);

  // Prefill sponsor in To when modal opens or task changes
  useEffect(() => {
    if (open) {
      // Prefill 'To' field if it's empty
      if (task?.sponsor_email) {
        setTo((prev) => (prev.length ? prev : normalizeEmails([task.sponsor_email])));
      }
      
      // ✨ 2. Prefill 'Cc' field if it's empty
      setCc((prev) => (prev.length ? prev : normalizeEmails([DEFAULT_CONTACT_EMAIL])));
      
      // ✨ 3. Automatically show the Cc field
      setHideCc(false);
    }
  }, [open, task]);

  const canSend = useMemo(() => {
    return (
      formData.subject.trim().length > 0 &&
      formData.body.trim().length > 0 &&
      to.length > 0 &&
      to.every((e) => isValidEmail(e)) &&
      cc.every((e) => isValidEmail(e)) &&
      bcc.every((e) => isValidEmail(e))
    );
  }, [formData, to, cc, bcc]);

  const handleSendEmail = async () => {
    if (!canSend) {
      setError('Please provide a subject, body, and at least one valid recipient.');
      return;
    }
    setIsSending(true);
    setError(null);

    try {
      const response = await sendEmail({
        contact_task_id: task.id,
        subject: formData.subject,
        body: formData.body,
        to: to,
        cc: cc,
        bcc: bcc,
      });
      
      if (response.response_status !== 200) {
        throw new Error(response.message);
      }

      onEmailSent();
      onClose();
      // reset form
      setFormData({ subject: '', body: '' });
      setTo([]);
      setCc([]);
      setBcc([]);
      setHideCc(true);
      setHideBcc(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const showLinksOnly = hideCc && hideBcc;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          New Email
        </Typography>

        {/* Recipients */}
        <Stack spacing={1}>
          <SendEmailsInput
            label="To"
            values={to}
            onChange={setTo}
            placeholder="Add recipients and press Enter or +"
            autoFocus
          />
          <Stack 
            direction={showLinksOnly ? "row" : "column"} 
            spacing={showLinksOnly ? 2 : 1}
          >
            <SendEmailsInput
              label="Cc"
              values={cc}
              onChange={setCc}
              hidden={hideCc}
              setHidden={setHideCc}
              placeholder="Add Cc and press Enter or +"
            />
            <SendEmailsInput
              label="Bcc"
              values={bcc}
              onChange={setBcc}
              hidden={hideBcc}
              setHidden={setHideBcc}
              placeholder="Add Bcc and press Enter or +"
            />
          </Stack>
        </Stack>

        {/* Subject & Body */}
        <TextField
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
          fullWidth
          required
        />
        
        <Box data-color-mode="light">
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Body</Typography>
          <MDEditor
            value={formData.body}
            onChange={(value) => setFormData((p) => ({ ...p, body: value || '' }))}
            height={300}
            preview="edit" // Show only the editor by default
          />
        </Box>

        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} color="secondary">Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained" disabled={isSending || !canSend}>
            {isSending ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
            Tip: Type a recipient's email and add it by clicking <b>Enter</b>, <b>comma</b>, <b>semicolon</b>, or click <b>+</b>.
        </Typography>
      </Box>
    </Modal>
  );
}
