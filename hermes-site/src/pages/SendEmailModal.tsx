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
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
} from '@mui/material';
import { isValidEmail } from '../util/helpers/validate-email';
import { normalizeEmails } from '../util/helpers/normalize-emails';
import { SendEmailsInput } from '../components/emails/SendEmailsInput';
import { scheduleEmail, sendEmail } from '../util/api/emails';
import type { EmailScheduleRequest, SendEmail, Task, Template } from '../util/api/types';
import { DEFAULT_CONTACT_EMAIL } from '../config';
import MDEditor from '@uiw/react-md-editor';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs'
import { getTemplates } from '../util/api/templates';
import { replaceTemplate } from '../util/helpers/replace-template';

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
  maxHeight: '90vh', // ✨ ADD THIS
  overflowY: 'auto',
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

  const [scheduleAnchorEl, setScheduleAnchorEl] = useState<null | HTMLElement>(null);
  const [_, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Dayjs | null>(dayjs().add(1, 'hour'));

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(""); // Store template ID
  const [loadingTemplates, setLoadingTemplates] = useState(false);

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

      const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
          const data = await getTemplates();
          setTemplates(data);
        } catch (error) {
          console.error("Failed to fetch templates", error);
        } finally {
          setLoadingTemplates(false);
        }
      };
      
      fetchTemplates();
    }
  }, [open, task]);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === parseInt(selectedTemplate));
      if (template) {
        setFormData({
          subject: replaceTemplate(template.subject || '', task.sponsors),
          body: replaceTemplate(template.body || '', task.sponsors),
        });
      }
    }
  }, [selectedTemplate, templates]);

  const companyNameCheck = (): boolean => {
    const regex = /\[.+\]/; // Case-insensitive check
    if (regex.test(formData.subject) || regex.test(formData.body)) {
      return window.confirm(
        'Warning: The subject or body contains "COMPANY NAME".\n\n' +
        'Did you mean to replace this with the actual company name?\n\n' +
        'Press OK to send anyway, or Cancel to go back and edit.'
      );
    }
    return true; // No "COMPANY NAME" found, proceed
  };

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

    if (!companyNameCheck()) {
      return; // User clicked "Cancel"
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

  const resetForm = () => {
    setFormData({ subject: '', body: '' });
    setTo([]);
    setCc([]);
    setBcc([]);
    setHideCc(true);
    setHideBcc(true);
  };

  const handleScheduleSend = async () => {
    if (!canSend) {
      setError('Cannot schedule. Please provide a subject, body, and at least one valid recipient.');
      return;
    }

    if (!scheduleDate || scheduleDate.isBefore(dayjs())) {
      setError("Cannot schedule an email in the past.");
      return;
    }

    if (!companyNameCheck()) {
      return; // User clicked "Cancel"
    }

    setIsSending(true);
    setError(null);
    setScheduleOpen(false);

    try {
      // 1. Get Unix timestamp as a string
      const unixTimestamp = String(scheduleDate.unix());

      // 2. Create the job_data payload
      const jobData: SendEmail = {
        contact_task_id: task.id,
        subject: formData.subject,
        body: formData.body,
        to: to,
        cc: cc,
        bcc: bcc,
      };

      // 3. Create the schedule request
      const payload: EmailScheduleRequest = {
        contact_task_id: task.id,
        send_at: unixTimestamp,
        job_data: jobData,
      };

      // 4. Call the new API
      await scheduleEmail(payload);

      // 5. Success
      onEmailSent(); // Refresh tasks to show new status
      onClose();
      resetForm();

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

        <TextField
          select
          label="Select Template"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          fullWidth
          disabled={loadingTemplates}
          helperText={loadingTemplates ? "Loading templates..." : "Select a template to auto-fill subject and body."}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {templates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              {template.template_name}
            </MenuItem>
          ))}
        </TextField>

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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, position: 'relative' }}>
          <Button onClick={onClose} color="secondary">Cancel</Button>
          
          <ButtonGroup variant="contained" disabled={isSending || !canSend}>
            <Button
              onClick={handleSendEmail}
              disabled={isSending || !canSend}
              startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : null}
            >
              Send
            </Button>
            <Button
              size="small"
              onClick={(e) => setScheduleAnchorEl(e.currentTarget)}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>

          <Popper
            sx={{ zIndex: 1301 }}
            open={!!scheduleAnchorEl}
            anchorEl={scheduleAnchorEl}
            transition
          >
            {({ TransitionProps }) => (
              <Grow {...TransitionProps} style={{ transformOrigin: 'bottom right' }}>
                <Paper sx={{ p: 2, mt: 1, boxShadow: 4, borderRadius: 2 }}>
                  <ClickAwayListener onClickAway={() => setScheduleAnchorEl(null)}>
                    <Stack spacing={2}>
                      <Typography variant="h6">Schedule Send</Typography>
                      <DateTimePicker
                        label="Send at"
                        value={scheduleDate}
                        onChange={(newValue) => setScheduleDate(newValue)}
                        disablePast
                      />
                      <Button
                        variant="contained"
                        onClick={handleScheduleSend}
                        disabled={!scheduleDate || isSending}
                      >
                        Schedule
                      </Button>
                    </Stack>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>

        </Box>

        <Typography variant="caption" color="text.secondary">
            Tip: Type a recipient's email and add it by clicking <b>Enter</b>, <b>comma</b>, <b>semicolon</b>, or click <b>+</b>.
        </Typography>
      </Box>
    </Modal>
  );
}
