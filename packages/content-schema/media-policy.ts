// Shared by the CMS upload API and the read-only legacy transfer preflight.
export const mediaTypes = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'application/pdf': 'pdf' } as const;
export type MediaType = keyof typeof mediaTypes;
export const maxMediaBytes = (type: string) => (type === 'application/pdf' ? 20 : 10) * 1024 * 1024;
