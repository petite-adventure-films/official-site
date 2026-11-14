// A calendar date is not an instant: do not parse in the browser's local timezone.
export function calendarDate(input: string): string | null {
  const match = /^(\d{4})([-/])(\d{2})\2(\d{2})$/.exec(input);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[3]), day = Number(match[4]);
  if (year < 1) return null;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day); date.setUTCHours(0, 0, 0, 0);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? `${match[1]}-${match[3]}-${match[4]}` : null;
}
