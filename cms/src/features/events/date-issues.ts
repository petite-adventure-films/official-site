import type { EventDraft } from './draft';
function timestamp(input: string) {
  const match = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(input);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day); date.setUTCHours(0, 0, 0, 0);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date.getTime() : null;
}
export function dateIssues(value: EventDraft): Partial<Record<'startDate' | 'endDate', string>> {
  const start = timestamp(value.startDate); const end = timestamp(value.endDate);
  const issues: Partial<Record<'startDate' | 'endDate', string>> = {};
  if (value.startDate && start === null) issues.startDate = '日付を確認してください。途中の内容も保存されます。';
  if (value.multiDay && value.endDate && end === null) issues.endDate = '日付を確認してください。途中の内容も保存されます。';
  else if (value.multiDay && start !== null && end !== null && end < start) issues.endDate = '終了日が開催日より前です。下書きには保存できます。';
  return issues;
}
