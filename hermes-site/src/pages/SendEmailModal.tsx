// SendEmailModal.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Link,
  Modal,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Task } from '../types/tasks';
import { BASE_BACKEND_URL } from '../config';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

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

const emailRegex =
  // lightweight but practical email validation
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function normalizeEmails(list: string[]) {
  // trim, lowercase, dedupe
  const norm = list
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => e.toLowerCase());
  return Array.from(new Set(norm));
}

function splitCandidate(input: string): string[] {
  // allow typing multiple separated by , ; space or newline
  return input
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type EmailsInputProps = {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
  hidden?: boolean;
  setHidden?: (v: boolean) => void;
};

/**
 * Gmail-like chips input using MUI Autocomplete (multiple + freeSolo),
 * with a "+" button to formalize current input.
 */
function EmailsInput({
  label,
  values,
  onChange,
  placeholder,
  autoFocus,
  hidden,
  setHidden,
}: EmailsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (hidden) {
      // reset any transient UI state when a field is hidden
      setInputValue('');
      setFieldError(null);
    }
  }, [hidden]);

  const commit = () => {
    if (!inputValue.trim()) return;
    const candidates = splitCandidate(inputValue);
    const invalid = candidates.filter((c) => !emailRegex.test(c));
    if (invalid.length) {
      setFieldError(`Invalid email${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`);
      return;
    }
    const next = normalizeEmails([...values, ...candidates]);
    onChange(next);
    setInputValue('');
    setFieldError(null);
  };

  const removeAt = (idx: number) => {
    const next = values.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  if (hidden) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2">{label}:</Typography>
        <Link component="button" type="button" onClick={() => setHidden && setHidden(false)}>
          Add {label}
        </Link>
      </Stack>
    );
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={values}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, newValues) => {
        // User can paste/press enter to add; validate added tokens
        // Filter out non-emails (we only accept emails)
        const valid = newValues.filter((v) => emailRegex.test(v));
        const next = normalizeEmails(valid);
        onChange(next);
        setFieldError(null);
      }}
      filterOptions={(x) => x} // keep exactly what user typed
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
          autoFocus={autoFocus}
          error={!!fieldError}
          helperText={fieldError ?? ' '}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                <IconButton
                  aria-label={`Add ${label}`}
                  edge="end"
                  size="small"
                  onClick={commit}
                  sx={{ mr: 0.5 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          onKeyDown={(e) => {
            if (
              (e.key === 'Enter' || e.key === ',' || e.key === ';' || e.key === ' ') &&
              inputValue.trim()
            ) {
              e.preventDefault();
              commit();
            }
          }}
        />
      )}
    />
  );
}

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
    if (open && task?.sponsor_email) {
      setTo((prev) => (prev.length ? prev : normalizeEmails([task.sponsor_email])));
    }
  }, [open, task]);

  const canSend = useMemo(() => {
    return (
      formData.subject.trim().length > 0 &&
      formData.body.trim().length > 0 &&
      to.length > 0 &&
      to.every((e) => emailRegex.test(e)) &&
      cc.every((e) => emailRegex.test(e)) &&
      bcc.every((e) => emailRegex.test(e))
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
      const response = await fetch(`${BASE_BACKEND_URL}/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contact_task_id: task.id,
          subject: formData.subject.trim(),
          body: formData.body,
          // NEW: send recipients; backend should accept `to?: string[]`, `cc?: string[]`, `bcc?: string[]`
          to,
          cc,
          bcc,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send email.');
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

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          New Email
        </Typography>

        {/* Recipients */}
        <Stack spacing={1}>
          <EmailsInput
            label="To"
            values={to}
            onChange={setTo}
            placeholder="Add recipients and press Enter or +"
            autoFocus
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <EmailsInput
              label="Cc"
              values={cc}
              onChange={setCc}
              hidden={hideCc}
              setHidden={setHideCc}
              placeholder="Add Cc and press Enter or +"
            />
            <EmailsInput
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
        <TextField
          label="Body"
          name="body"
          value={formData.body}
          onChange={(e) => setFormData((p) => ({ ...p, body: e.target.value }))}
          multiline
          rows={10}
          fullWidth
          required
        />

        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} color="secondary">Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained" disabled={isSending || !canSend}>
            {isSending ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Tip: Type an email and hit <b>Enter</b>, <b>comma</b>, <b>semicolon</b>, or click <b>+</b> to add it as a chip.
        </Typography>
      </Box>
    </Modal>
  );
}
