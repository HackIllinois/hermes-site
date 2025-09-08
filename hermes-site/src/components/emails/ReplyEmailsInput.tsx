import { useState } from "react";
import { splitEmails } from "../../util/helpers/split-emails";
import { normalizeEmails } from "../../util/helpers/normalize-emails";
import { Autocomplete, Chip, IconButton, TextField } from "@mui/material";
import { isValidEmail } from "../../util/helpers/validate-email";
import AddIcon from '@mui/icons-material/Add';
import type { EmailsInputProps } from "./EmailsInputsProps";




export function ReplyEmailsInput({ label, values, onChange, placeholder }: EmailsInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [fieldError, setFieldError] = useState<string | null>(null);
  
    const addEmails = () => {
      if (!inputValue.trim()) return;
      
      const candidates = splitEmails(inputValue);

      const invalid = candidates.filter((c) => !isValidEmail(c));
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
          const valid = newValues.filter((v) => isValidEmail(v));
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
                addEmails();
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  <IconButton aria-label={`Add ${label}`} edge="end" size="small" onClick={addEmails} sx={{ mr: 0.5 }}>
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