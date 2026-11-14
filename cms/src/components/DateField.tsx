// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=26-531
// MUI text field + native calendar: unfinished text stays in the draft verbatim.
import { useRef } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import { calendarDate } from '../lib/calendar-date';
export function DateField({ label, value, onChange, error }: {
  label: string; value: string; onChange: (value: string) => void; error?: string;
}) {
  const picker = useRef<HTMLInputElement>(null);
  return <div className="relative w-cms-date">
    <TextField label={label} value={value} onChange={event => onChange(event.target.value)}
      required fullWidth error={Boolean(error)} helperText={error}
      slotProps={{ inputLabel: { shrink: true }, htmlInput: { required: false, 'aria-required': true },
        input: { endAdornment: <InputAdornment position="end"><IconButton edge="end" aria-label={`${label}をカレンダーで選択`}
          onClick={() => picker.current?.showPicker()}><CalendarMonth /></IconButton></InputAdornment> } }} />
    <input ref={picker} type="date" value={calendarDate(value) ?? ''} tabIndex={-1} aria-hidden="true"
      className="absolute bottom-0 left-0 h-px w-px opacity-0 pointer-events-none"
      onChange={event => onChange(event.target.value.replaceAll('-', '/'))} />
  </div>;
}
