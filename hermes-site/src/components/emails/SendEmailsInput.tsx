import { useEffect, useState } from "react";
import { splitEmails } from "../../util/helpers/split-emails";
import { isValidEmail } from "../../util/helpers/validate-email";
import { normalizeEmails } from "../../util/helpers/normalize-emails";
import { Autocomplete, Chip, IconButton, Link, Stack, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import type { EmailsInputProps } from "./EmailsInputsProps";

/**
 * Gmail-like chips input using MUI Autocomplete (multiple + freeSolo),
 * with a "+" button to formalize current input.
 */
export function SendEmailsInput({
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
  
    const addEmails = () => {
      if (!inputValue.trim()) return;
      const candidates = splitEmails(inputValue);
      const invalid = candidates.filter((c) => !isValidEmail(c));
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
          <Link component="button" type="button" variant="body2" onClick={() => setHidden && setHidden(false)}>
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
          const valid = newValues.filter((v) => isValidEmail(v));
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
                    onClick={addEmails}
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
                addEmails();
              }
            }}
          />
        )}
      />
    );
}