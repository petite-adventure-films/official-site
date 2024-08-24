<?
// 日付成形
function format_date($date)
{
  if (preg_match('/^\d{8}$/', $date)) {
    return substr($date, 0, 4) . '/' . substr($date, 4, 2) . '/' . substr($date, 6, 2);
  }
  return $date;
}
