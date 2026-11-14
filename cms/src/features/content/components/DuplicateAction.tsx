// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=17-2247 (Section / 複製)
import { useRef, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { api, ApiError, type SavedDraft } from '../../../lib/api-client';
export function DuplicateAction<T>({ flush, disabled, busy, onBusy }: {
  flush: () => Promise<SavedDraft<T> | null>; disabled: boolean; busy: boolean; onBusy: (busy: boolean) => void;
}) {
  const pending = useRef<null | { sourceId: string; operationId: string; expectedVersion: number }>(null);
  const active = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  async function duplicate() {
    if (active.current || blocked) return;
    active.current = true; onBusy(true); setError(null);
    try {
      const saved = await flush();
      if (!saved) { setError('保存できなかったため、複製を中止しました。入力内容は残っています。'); return; }
      pending.current ??= { sourceId: saved.id, operationId: crypto.randomUUID(), expectedVersion: saved.version };
      const { sourceId, ...body } = pending.current;
      const result = await api<SavedDraft<T>>(`/api/contents/${sourceId}/duplicate`, { method: 'POST', body: JSON.stringify(body) });
      window.location.assign(`/cms/events/${result.id}/edit`);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      if ([403, 404, 409].includes(status)) setBlocked(true);
      setError(status === 409 ? '元の記事が更新されています。入力内容を控えてから再読み込みしてください。' :
        status === 401 ? '認証が切れました。別のタブでログインしてから複製を再試行してください。' :
        [403, 404].includes(status) ? '元の記事を複製できません。権限と記事の状態を確認してください。' :
        '複製の結果を確認できませんでした。再試行では同じ複製を確認します。');
    } finally { active.current = false; onBusy(false); }
  }
  return <>
    <Button className="self-start" disabled={disabled || busy || blocked} onClick={() => void duplicate()}>{error && pending.current ? '複製を再試行' : '複製'}</Button>
    {error && <Alert severity="error">{error}</Alert>}
  </>;
}
