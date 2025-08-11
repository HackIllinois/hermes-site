// ReplyEmailModal.tsx
import { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Modal, TextField, Typography,
  RadioGroup, FormControlLabel, Radio, FormControl, IconButton
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import type { Email } from '../types/emails';
import { BASE_BACKEND_URL } from '../config';

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const normalizeEmails = (list: string[]) =>
  Array.from(new Set(list.map((e) => e.trim().toLowerCase()).filter(Boolean)));
const splitCandidate = (input: string) =>
  input.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);

type EmailsInputProps = {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

function EmailsInput({ label, values, onChange, placeholder }: EmailsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const commit = () => {
    if (!inputValue.trim()) return;
    const candidates = splitCandidate(inputValue);
    const invalid = candidates.filter((c) => !emailRegex.test(c));
    if (invalid.length) {
      setFieldError(`Invalid ${invalid.length > 1 ? 'emails' : 'email'}: ${invalid.join(', ')}`);
      return;
    }
    onChange(normalizeEmails([...values, ...candidates]));
    setInputValue('');
    setFieldError(null);
  };

  const removeAt = (idx: number) => {
    const next = values.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={values}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, newValues) => {
        const valid = newValues.filter((v) => emailRegex.test(v));
        onChange(normalizeEmails(valid));
        setFieldError(null);
      }}
      filterOptions={(x) => x}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={`${option}-${index}`}
            label={option}
            onDelete={() => removeAt(index)}
            size="small"
            variant="outlined"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!fieldError}
          helperText={fieldError ?? ' '}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ',' || e.key === ';' || e.key === ' ') && inputValue.trim()) {
              e.preventDefault();
              commit();
            }
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                <IconButton aria-label={`Add ${label}`} edge="end" size="small" onClick={commit} sx={{ mr: 0.5 }}>
                  <AddIcon fontSize="small" />
                </IconButton>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

function makeReplyQuotePlain(fromEmail: string, dateISO: string, originalBody: string) {
    const d = new Date(dateISO || Date.now());
    const datePart = d.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    const timePart = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  
    const header = `On ${datePart} at ${timePart} ${fromEmail} wrote:`;
  
    const quoted = (originalBody || '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(line => `> ${line}`)       // nested quoting becomes >>, >>>, etc.
      .join('\r\n');
  
    return `${header}\r\n${quoted}`;
}
  
  

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
        <EmailsInput
          label="Cc"
          values={cc}
          onChange={setCc}
          placeholder="Add Cc recipients and press Enter or +"
        />
        <EmailsInput
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
          Tip: Type an email and hit <b>Enter</b>, <b>comma</b>, <b>semicolon</b>, or click <b>+</b> to add it as a chip.
        </Typography>
      </Box>
    </Modal>
  );
}
