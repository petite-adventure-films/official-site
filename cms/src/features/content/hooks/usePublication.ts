import { useEffect, useRef, useState } from 'react';
import { api, ApiError, type SavedDraft } from '../../../lib/api-client';
type State = { enabled: boolean; version: number; published: boolean; url: string | null; operation: { id: string; state: string } | null };
export function usePublication<T>(id: string | undefined, flush: () => Promise<SavedDraft<T> | null>) {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [issues, setIssues] = useState<{ field: string; message: string }[]>([]);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const active = useRef(false);
  const pending = useRef<{ id: string; body: { operationId: string; expectedVersion: number; expectedPublicationVersion: number } } | null>(null);
  const processing = state?.operation && ['ready', 'delivering', 'unknown'].includes(state.operation.state);
  useEffect(() => {
    let current = true; let timer: ReturnType<typeof setTimeout>;
    if (!id) { void api<{ enabled: boolean }>('/api/publication').then(config => { if (current) { setStatusError(''); setState({ enabled: config.enabled, version: 0, published: false, url: null, operation: null }); } }).catch(() => { if (current) setStatusError('公開状態を取得できませんでした。'); }); return () => { current = false; }; }
    async function poll() {
      try {
        const next = await api<State>(`/api/contents/${id}/publication`);
        if (!current) return;
        setStatusError(''); setState(next);
        if (['succeeded', 'noop'].includes(next.operation?.state ?? '')) { pending.current = null; }
        if (['ready', 'delivering', 'unknown'].includes(next.operation?.state ?? '')) timer = setTimeout(poll, 1000);
      } catch { if (current) { setStatusError('公開状態を取得できませんでした。'); timer = setTimeout(poll, 3000); } }
    }
    void poll(); return () => { current = false; clearTimeout(timer); };
  }, [id, refresh]);
  async function publish() {
    if (active.current) return;
    active.current = true; setBusy(true); setError(''); setIssues([]);
    try {
      if (!pending.current) {
        const saved = await flush();
        if (!saved) { setError('保存できませんでした。入力内容を保持しています。'); return; }
        pending.current = { id: saved.id, body: { operationId: crypto.randomUUID(), expectedVersion: saved.version, expectedPublicationVersion: state?.version ?? 0 } };
      }
      const request = pending.current;
      await api(`/api/contents/${request.id}/publication`, { method: 'POST', body: JSON.stringify(request.body) });
      setRefresh(v => v + 1);
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) { setIssues(e.issues ?? []); setError('入力内容を確認してください。'); pending.current = null; }
      else if (e instanceof ApiError && e.status === 409) { setError('別の公開処理または更新があります。公開状態を確認してから再試行してください。'); pending.current = null; setRefresh(v => v + 1); }
      else { setError('公開結果を確認できませんでした。再試行してください。'); setRefresh(v => v + 1); }
    } finally { active.current = false; setBusy(false); }
  }
  return { state, busy, processing: Boolean(processing), issues, error: error || statusError, publish, retry: () => error ? publish() : setRefresh(v => v + 1), clear: () => setIssues([]) };
}
