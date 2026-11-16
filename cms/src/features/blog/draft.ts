export type BodyNode = { type: string; text?: string; attrs?: Record<string, unknown>; content?: BodyNode[]; marks?: BodyNode[] };
export type BlogDraft = { title: string; slug?: string; body: { schemaVersion: 2; doc: BodyNode }; categoryId: string | null; filmTagIds: string[]; eventTagIds: string[]; isRecommended: boolean; isWorkshopReport: boolean };
export const emptyBlogDraft = (): BlogDraft => ({ title: '', body: { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph' }] } }, categoryId: null, filmTagIds: [], eventTagIds: [], isRecommended: false, isWorkshopReport: false });
export function validLink(href: string) {
  if (/^mailto:[A-Za-z0-9.!#$%&'*+\-/=^_`{|}~]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(href)) return true;
  try { const url = new URL(href); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !/[\u0000-\u0020\u007f]/.test(href); } catch { return false; }
}
