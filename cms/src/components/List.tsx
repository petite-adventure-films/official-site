// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=33-297
// ListRow: node-id=33-301; Pagination: node-id=33-304
import type { ReactNode } from 'react';
import { Pagination as MuiPagination } from '@mui/material';
export function ListLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-cms-section">{children}</div>;
}
export function ListRow({ title, filmTags, eventTags, status, header = false }: { title: ReactNode; filmTags?: ReactNode; eventTags?: ReactNode; status: ReactNode; header?: boolean }) {
  const Cell = header ? 'th' : 'td';
  return <tr>{[{content: title, width: ''}, ...(filmTags === undefined ? [] : [{content: filmTags, width: 'w-cms-film-column'}]), ...(eventTags === undefined ? [] : [{content: eventTags, width: 'w-cms-event-column'}]), {content: status, width: 'w-cms-status-column'}].map(({content, width}, index) => <Cell key={index} scope={header ? 'col' : undefined}
    className={'text-left pr-cms-related first:pl-cms-list-x last:pr-cms-list-x py-cms-list-y border-b border-cms-divider ' +
      width}>{content}</Cell>)}</tr>;
}
export function Pagination({ count, page, onChange }: { count: number; page: number; onChange: (page: number) => void }) {
  return <MuiPagination count={count} page={page} onChange={(_, next) => onChange(next)} getItemAriaLabel={(type, number, selected) =>
    type === 'page' ? `${number}ページ${selected ? '（現在のページ）' : 'へ'}` : type === 'previous' ? '前のページ' : type === 'next' ? '次のページ' : type === 'first' ? '最初のページ' : '最後のページ'} />;
}
