// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=66-388
import { useRef } from 'react';
import { Button, Dialog, Typography } from '@mui/material';
export function StatusDialog({ open, title, subject, description, confirmLabel, onCancel, onConfirm }: {
  open: boolean; title: string; subject: string; description: string; confirmLabel: string;
  onCancel(): void; onConfirm(): void;
}) {
  const cancel = useRef<HTMLButtonElement>(null);
  return <Dialog open={open} onClose={(_, reason) => { if (reason === 'escapeKeyDown') onCancel(); }}
    aria-labelledby="status-dialog-title" aria-describedby="status-dialog-description"
    slotProps={{ transition: { onEntered: () => cancel.current?.focus() }, paper: { className: 'w-cms-dialog p-cms-content border border-cms-divider', elevation: 2 } }}>
    <div className="flex flex-col gap-cms-content">
      <div className="flex flex-col gap-cms-heading">
        <Typography id="status-dialog-title" variant="subtitle2">{title}</Typography>
        <div className="flex flex-col gap-cms-detail break-words">
          <Typography variant="subtitle2">{subject}</Typography>
          <Typography id="status-dialog-description" variant="body2">{description}</Typography>
        </div>
      </div>
      <div className="flex justify-end gap-cms-actions"><Button ref={cancel} autoFocus onClick={onCancel}>キャンセル</Button><Button variant="contained" color="success" onClick={onConfirm}>{confirmLabel}</Button></div>
    </div>
  </Dialog>;
}
