import { legacyStyleHtml, legacyStyleKeys } from './legacy-text-style.ts';
export const semanticKeys = ['anchorId', 'lang', 'dir'];
export const preservedTypes = ['preservedInline', 'preservedBlock', 'preservedTextBlock', 'preservedStrong'];
export function validBodyAnchors(node: { attrs?: Record<string, unknown>; content?: any[] }): boolean {
  // IDs owned by the shared public page navigation cannot be claimed by article content.
  const seen = new Set(['nav-toggle', 'nav-menu']);
  function visit(n: typeof node): boolean {
    const id = n.attrs?.anchorId;
    if (typeof id === 'string') { if (seen.has(id)) return false; seen.add(id); }
    return (n.content ?? []).every(visit);
  }
  return visit(node);
}
export function semanticHtml(attrs: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'anchorId' && typeof value === 'string' && value.length <= 200 && /^[^\s\u0000-\u001f\u007f]+$/u.test(value)) result.id = value;
    else if (key === 'lang' && typeof value === 'string' && /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value)) result.lang = value;
    else if (key === 'dir' && ['auto', 'ltr', 'rtl'].includes(value as string)) result.dir = value as string;
    else throw Error('invalid_legacy_semantics');
  }
  return result;
}
export function containerHtml(attrs: Record<string, unknown>): Record<string, string> {
  const { ariaLabel, ...rest } = attrs;
  if (ariaLabel !== undefined && (typeof ariaLabel !== 'string' || !ariaLabel || ariaLabel.length > 2000)) throw Error('invalid_accessible_label');
  attrs = rest;
  const semantics = Object.fromEntries(Object.entries(attrs).filter(([key]) => !legacyStyleKeys.includes(key)));
  const style = Object.fromEntries(Object.entries(attrs).filter(([key]) => legacyStyleKeys.includes(key)));
  return { ...(ariaLabel !== undefined ? {role: 'img', 'aria-label': ariaLabel as string} : {}), ...semanticHtml(semantics), ...(Object.keys(style).length ? legacyStyleHtml(style) : {}) };
}
