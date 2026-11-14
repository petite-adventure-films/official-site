// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=59-743
import { Chip, ListItemButton, Typography } from '@mui/material';
export function HistoryListItem({ at, actor, status, selected, disabled, onClick }: {
  at: string; actor: string; status: string; selected: boolean; disabled: boolean; onClick(): void;
}) {
  const date = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(at));
  return <ListItemButton component="button" type="button" selected={selected} disabled={disabled} aria-pressed={selected} onClick={onClick}
    className="cms-history-item w-full flex-col items-start gap-cms-detail border-b border-cms-divider px-cms-list-x py-cms-list-y">
    <div className="flex w-full min-w-0 items-start gap-cms-related"><Typography component="time" dateTime={at} variant="subtitle2" className="shrink-0">{date}</Typography>
      <Typography variant="body2" title={actor} className="min-w-0 break-words">{actor}</Typography></div>
    <Chip size="small" label={status} />
  </ListItemButton>;
}
