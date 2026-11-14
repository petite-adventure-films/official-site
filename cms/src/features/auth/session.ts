import { api } from '../../lib/api-client';
export type Session = { user: { id: string; name: string; email: string } };
export const loadSession = () => api<Session>('/api/session');
