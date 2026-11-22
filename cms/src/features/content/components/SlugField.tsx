// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=17-2247
import { TextField } from '@mui/material';
import { slugIssue } from '../slug';
export function SlugField({ value, contentId, onChange, error, prefix = '/events' }: {
  prefix?: string; value?: string; contentId?: string; error?: string; onChange: (value: string) => void;
}) {
  const slug = value ?? contentId ?? '';
  const awaitingId = value === undefined && !contentId;
  const issue = error ?? (awaitingId ? undefined : slugIssue(slug));
  return <TextField label="slug" value={slug} fullWidth onChange={(event) => onChange(event.target.value)}
    error={Boolean(issue)} placeholder={awaitingId ? '保存すると記事IDが入ります' : undefined}
    helperText={issue ? `${issue} 入力途中でも下書き保存できます。` : awaitingId ? '初期値は記事IDです。保存後にURLを確認できます。' : `公開時のURL：${prefix}/${slug}/`}
    slotProps={{ inputLabel: { shrink: true }, htmlInput: { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false }, formHelperText: { className: 'break-all' } }} />;
}
