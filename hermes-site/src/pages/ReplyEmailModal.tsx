// ReplyEmailModal.tsx
import { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Modal, TextField, Typography,
  RadioGroup, FormControlLabel, Radio, FormControl
} from '@mui/material';
import type { Email } from '../util/api/types';
import { BASE_BACKEND_URL } from '../config';
import { ReplyEmailsInput } from '../components/emails/ReplyEmailsInput';
import { makeReplyQuotePlain } from '../util/helpers/make-reply-quotes-plain';
import { normalizeEmails } from '../util/helpers/normalize-emails';

interface ReplyEmailModalProps {
  emailToReplyTo: Email;
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
  
  

export default function ReplyEmailModal({ emailToReplyTo, open, onClose, onEmailSent }: ReplyEmailModalProps) {
  const [body, setBody] = useState('');
  const [replyType, setReplyType] = useState<'REPLY' | 'REPLY_ALL'>('REPLY');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: cc/bcc chip inputs (each on its own line)
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);

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
      setReplyType('REPLY');
      setError(null);
    }
  }, [emailToReplyTo]);

  useEffect(() => {
    if (!open || !emailToReplyTo) return; // Don't run if modal is closed

    if (replyType === 'REPLY_ALL') {
      // User selected "Reply All"
      const originalTo = emailToReplyTo.to_recipients || [];
      const originalCc = emailToReplyTo.cc_recipients || [];
      const originalSender = emailToReplyTo.sender_email;

      // Combine all original recipients
      const allRecipients = [...originalTo, ...originalCc];
      
      // Filter out the original sender (who is already in the "To" field)
      // The backend will handle filtering out the user's *own* email
      const ccRecipients = allRecipients.filter(
        email => email.toLowerCase() !== originalSender.toLowerCase()
      );
      
      // Set the CC field, removing duplicates
      setCc(normalizeEmails(ccRecipients));
    } else {
      // User selected "Reply"
      // Clear the CC field
      setCc([]);
    }
    // This effect runs when the user *changes* the replyType
  }, [replyType, open, emailToReplyTo]);

  const handleSendReply = async () => {
    setIsSending(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/emails/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          db_thread_id: emailToReplyTo.thread_id,
          message_id_to_reply_to: emailToReplyTo.gmail_message_id,
          body,
          reply_type: replyType,
          cc,
          bcc,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reply.');
      }
      onEmailSent();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const subject = emailToReplyTo.subject!.toLowerCase().startsWith('re:')
    ? emailToReplyTo.subject
    : `Re: ${emailToReplyTo.subject}`;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6">Replying to {emailToReplyTo.sender_email}</Typography>

        <TextField label="To" value={emailToReplyTo.sender_email} disabled fullWidth />
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

        <TextField
          label="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          multiline
          rows={10}
          fullWidth
          required
          autoFocus
        />

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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} color="secondary">Cancel</Button>
          <Button onClick={handleSendReply} variant="contained" disabled={isSending}>
            {isSending ? <CircularProgress size={24} /> : 'Send Reply'}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
            Tip: Type a recipient's email and add it by clicking <b>Enter</b>, <b>comma</b>, <b>semicolon</b>, or click <b>+</b>.
        </Typography>
      </Box>
    </Modal>
  );
}
