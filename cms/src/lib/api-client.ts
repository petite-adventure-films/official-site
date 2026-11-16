export class ApiError extends Error { constructor(public status: number, public code: string, public issues?: { field: string; message: string }[]) { super(code); } }
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, redirect: 'error', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.headers.get('Content-Type')?.includes('application/json')) throw new ApiError(401, 'invalid_session');
  const result = await response.json();
  if (!response.ok) throw new ApiError(response.status, result.error ?? 'unavailable', result.issues);
  return result;
}
export type SavedDraft<T> = { id: string; type?: 'event' | 'blog'; payloadSchemaVersion?: string; published?: boolean; version: number; payload: T; createdAt: string; updatedAt: string };
export type Tag = { id: string; name: string };
export type Tags = { filmTags: Tag[]; eventTags: Tag[] };
