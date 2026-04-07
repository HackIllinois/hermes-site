// ReplyEmailModal.tsx
import { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Modal, TextField, Typography,
  RadioGroup, FormControlLabel, Radio, FormControl,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  Stack,
} from '@mui/material';
import type { Email } from '../util/api/types';
import type { Task } from '../util/api/types';
import { DEFAULT_CONTACT_EMAIL } from '../config';
import { ReplyEmailsInput } from '../components/emails/ReplyEmailsInput';
import { makeReplyQuotePlain } from '../util/helpers/make-reply-quotes-plain';
import { normalizeEmails } from '../util/helpers/normalize-emails';
import MDEditor from '@uiw/react-md-editor';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { replyToEmail, scheduleEmail } from '../util/api/emails';
import type { EmailReply, EmailScheduleRequest } from '../util/api/types';

interface ReplyEmailModalProps {
  emailToReplyTo: Email;
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
  maxHeight: '90vh', // Set a max height (90% of viewport height)
  overflowY: 'auto'
};
  
  

export default function ReplyEmailModal({ emailToReplyTo, task, open, onClose, onEmailSent }: ReplyEmailModalProps) {
  const [body, setBody] = useState('');
  const [replyType, setReplyType] = useState<'REPLY' | 'REPLY_ALL'>('REPLY_ALL');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: cc/bcc chip inputs (each on its own line)
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);

  const [scheduleAnchorEl, setScheduleAnchorEl] = useState<null | HTMLElement>(null);
  const [scheduleDate, setScheduleDate] = useState<Dayjs | null>(dayjs().add(1, 'hour'));
  const defaultContactEmail = task.team?.default_contact_email?.trim() || DEFAULT_CONTACT_EMAIL;

  useEffect(() => {
    if (emailToReplyTo) {
      const dateISO = emailToReplyTo.sent_at || new Date().toISOString();
      const quotedBody = makeReplyQuotePlain(
        emailToReplyTo.sender_email,
        dateISO,
        emailToReplyTo.body || ''
      ); 
      setBody(`\n\n${quotedBody}`);
      setCc([]);   // reset on open
      setBcc([]);  // reset on open
      setReplyType('REPLY_ALL');
      setError(null);
    }
  }, [emailToReplyTo]);

  const isReplyingToSelf = emailToReplyTo.direction === 'OUTBOUND'; // if the email is outgoing, we are replying to ourselves

  useEffect(() => {
    if (!open || !emailToReplyTo) return; // Don't run if modal is closed

    // Start with our constant email
    let baseCcList: string[] = [defaultContactEmail];

    if (replyType === 'REPLY_ALL') {
      const originalTo = emailToReplyTo.to_recipients || [];
      const originalCc = emailToReplyTo.cc_recipients || [];

      if (isReplyingToSelf) {
        // We are replying to our own email.
        // 'To' is already set to the original recipients.
        // We just need to add the *original* CC list.
        baseCcList = baseCcList.concat(originalCc);
      } else {
        // We are replying to someone else.
        // 'To' is already set to the original sender.
        // We need to add the original 'To' list AND the original 'Cc' list.
        const originalSender = emailToReplyTo.sender_email;

        // Filter out the original sender (who is already in 'To')
        const replyAllTo = originalTo.filter(
          (email) => email.toLowerCase() !== originalSender.toLowerCase(),
        );

        baseCcList = baseCcList.concat(replyAllTo);
        baseCcList = baseCcList.concat(originalCc);
      }
    }

    // Set the CC field, removing duplicates
    setCc(normalizeEmails(baseCcList));
  }, [defaultContactEmail, replyType, open, emailToReplyTo, isReplyingToSelf]);

  const handleScheduleReply = async () => {
    if (!scheduleDate || scheduleDate.isBefore(dayjs())) {
      setError("Cannot schedule an email in the past.");
      return;
    }

    setIsSending(true);
    setError(null);
    setScheduleAnchorEl(null);

    try {
      // 1. Get Unix timestamp as a string
      const unixTimestamp = String(scheduleDate.unix());

      // 2. Create the job_data payload
      const jobData: EmailReply = {
        email_thread_id: emailToReplyTo.thread_id || -1, // -1 is a placeholder for no thread id
        message_id_to_reply_to: emailToReplyTo.gmail_message_id,
        body: body,
        reply_type: replyType,
        cc: cc,
        bcc:bcc,
      }

      console.log("email to reply to", emailToReplyTo);

      // 3. Create the schedule request
      const payload: EmailScheduleRequest = {
        email_thread_id: emailToReplyTo.thread_id || -1, // Get task_id from the email
        send_at: unixTimestamp,
        job_data: jobData,
      };

      // 4. Call the new API
      await scheduleEmail(payload);

      // 5. Success
      onEmailSent(); // Refresh tasks
      onClose();

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReply = async () => {
    setIsSending(true);
    setError(null);
    try {
      const response = await replyToEmail({
        email_thread_id: emailToReplyTo.thread_id || -1, // -1 is a placeholder for no thread id
        message_id_to_reply_to: emailToReplyTo.gmail_message_id,
        body,
        reply_type: replyType,
        cc,
        bcc,
      });

      if (response.response_status !== 200) {
        throw new Error(response.message);
      }

      onEmailSent();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const toRecipient = isReplyingToSelf
    ? (emailToReplyTo.to_recipients || []).join(', ') // 'To' should be the *original* recipients
    : emailToReplyTo.sender_email; // 'To' is the sender

  const toLabel = isReplyingToSelf ? "To (Original Recipients)" : "To";

  const subject = emailToReplyTo.subject!.toLowerCase().startsWith('re:')
    ? emailToReplyTo.subject
    : `Re: ${emailToReplyTo.subject}`;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6">Replying to {emailToReplyTo.sender_email}</Typography>
        
        <TextField label={toLabel} value={toRecipient} disabled fullWidth />
        <TextField label="Subject" value={subject} disabled fullWidth />

        {/* Each on its own line */}
        <ReplyEmailsInput
          label="Cc"
          values={cc}
          onChange={setCc}
          placeholder="Add Cc recipients and press Enter or +"
        />
        <ReplyEmailsInput
          label="Bcc"
          values={bcc}
          onChange={setBcc}
          placeholder="Add Bcc recipients and press Enter or +"
        />

        <Box data-color-mode="light">
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Body</Typography>
          <MDEditor
            value={body}
            onChange={(value) => setBody(value || '')}
            height={300}
            preview="edit"
            autoFocus
          />
        </Box>

        <FormControl>
          <RadioGroup
            row
            value={replyType}
            onChange={(e) => setReplyType(e.target.value as 'REPLY' | 'REPLY_ALL')}
          >
            <FormControlLabel value="REPLY" control={<Radio />} label="Reply" />
            <FormControlLabel value="REPLY_ALL" control={<Radio />} label="Reply All" />
          </RadioGroup>
        </FormControl>

        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, position: 'relative' }}>
          <Button onClick={onClose} color="secondary">Cancel</Button>
          
          <ButtonGroup variant="contained" disabled={isSending}>
            <Button
              onClick={handleSendReply}
              disabled={isSending}
              startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : null}
            >
              Send Reply
            </Button>
            <Button
              size="small"
              onClick={(e) => setScheduleAnchorEl(e.currentTarget)}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>

          <Popper
            sx={{ zIndex: 1301 }} // Ensure it's above the modal (1300)
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
                        onClick={handleScheduleReply}
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
