import type { EventDraft } from './draft';
import { calendarDate } from '../../lib/calendar-date';
export function dateIssues(value: EventDraft): Partial<Record<'startDate' | 'endDate', string>> {
  const start = calendarDate(value.startDate); const end = calendarDate(value.endDate);
  const issues: Partial<Record<'startDate' | 'endDate', string>> = {};
  if (value.startDate && start === null) issues.startDate = '日付を確認してください。途中の内容も保存されます。';
  if (value.multiDay && value.endDate && end === null) issues.endDate = '日付を確認してください。途中の内容も保存されます。';
  else if (value.multiDay && start !== null && end !== null && end < start) issues.endDate = '終了日が開催日より前です。下書きには保存できます。';
  return issues;
}
