import { useEffect, useRef, useState } from 'react';
import { api, ApiError, type SavedDraft } from '../../../lib/api-client';
export function useDraftSave<T>(initial: T, existing: SavedDraft<T> | null) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(existing);
  const [status, setStatus] = useState(existing ? '保存済み' : '未保存');
  const [error, setError] = useState<ApiError | Error | null>(null);
  const model = useRef({ value: initial, saved: existing, generation: 0, savedGeneration: 0, running: false,
    blocked: false, pending: null as null | { path: string; method: string; body: string; generation: number } });
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  function change(next: T) { model.current.value = next; model.current.generation++; setValue(next); setStatus('未保存'); }
  async function save() {
    const m = model.current;
    if (m.running || m.blocked) return;
    if (m.saved && m.savedGeneration === m.generation && !m.pending) return;
    m.pending ??= { path: m.saved ? `/api/contents/${m.saved.id}` : '/api/contents', method: m.saved ? 'PUT' : 'POST', generation: m.generation,
      body: JSON.stringify({ operationId: crypto.randomUUID(), ...(m.saved ? { expectedVersion: m.saved.version } : { type: 'event' }), payload: m.value }) };
    m.running = true; setStatus('保存中'); setError(null);
    try {
      const response = await api<SavedDraft<T>>(m.pending.path, { method: m.pending.method, body: m.pending.body });
      m.saved = response; m.savedGeneration = m.pending.generation; m.pending = null;
      if (mounted.current) {
        setSaved(response);
        window.history.replaceState(null, '', `/cms/events/${response.id}/edit`);
        setStatus(m.generation === m.savedGeneration ? '保存済み' : '未保存');
      }
    } catch (error) {
      if (error instanceof ApiError && [403, 404, 409].includes(error.status)) m.blocked = true;
      if (error instanceof ApiError && [413, 422].includes(error.status)) m.pending = null;
      if (mounted.current) { setError(error as Error); setStatus('保存できませんでした'); }
    } finally { m.running = false; }
  }
  useEffect(() => {
    if (status !== '未保存' || model.current.generation === model.current.savedGeneration) return;
    const timer = setTimeout(() => { void save(); }, 1000);
    return () => clearTimeout(timer);
  }, [value, status, saved]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      const m = model.current;
      if (m.generation !== m.savedGeneration || m.running || m.pending) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  return { value, change, save, saved, status, error, blocked: model.current.blocked };
}
