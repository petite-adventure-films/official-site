// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=26-477
// EditorLayout: node-id=26-339; Section: node-id=23-611; Field: node-id=23-663
import type { ReactNode } from 'react';
import { Typography, Link } from '@mui/material';
export function CMSLayout({ children, user }: { children: ReactNode; user: string }) {
  return <div className="flex min-h-screen">
    <nav aria-label="管理メニュー" className="w-cms-nav shrink-0 bg-cms-navigation border-r border-cms-divider px-cms-content py-cms-section flex flex-col gap-cms-section">
      <Typography variant="body2">Petite Adventure Films<br />CMS</Typography>
      <Link href="/cms/events" underline="none" color="inherit" aria-current="page"><Typography variant="subtitle2">📅 イベント</Typography></Link>
      <Typography variant="body2" className="mt-auto">👤 {user}</Typography>
    </nav>
    <main className="min-w-0 flex-1 px-cms-page-x pt-cms-page-top pb-cms-page-bottom">{children}</main>
  </div>;
}
export function EditorLayout({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return <div className="flex gap-cms-section items-stretch"><div className="min-w-0 flex-1 flex flex-col gap-cms-section">{children}</div>
    <aside className="w-cms-aside shrink-0 border-l border-cms-divider pl-cms-content flex flex-col gap-cms-section">{aside}</aside></div>;
}
export function Section({ children, label }: { children: ReactNode; label: string }) {
  return <section aria-label={label} className="flex flex-col gap-cms-content">{children}</section>;
}
export function Field({ children, label, outlined = false }: { children: ReactNode; label: string; outlined?: boolean }) {
  return <fieldset className={outlined ? 'relative rounded border border-cms-divider px-cms-input-x py-cms-input-y' : 'border-0 m-0 p-0'}>
    <legend className={outlined ? "absolute -top-cms-heading left-cms-heading bg-white px-cms-detail text-xs" : "text-sm mb-cms-heading"}>{label}</legend><div className="flex flex-wrap items-center gap-cms-related">{children}</div>
  </fieldset>;
}
