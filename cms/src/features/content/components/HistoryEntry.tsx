// Figma editor action: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=17-2247
import { useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import { api, type SavedDraft } from '../../../lib/api-client';
import type { HistoryData } from './HistoryView';
export function HistoryEntry<T>({ id, flush, blocked, onBusy, onError, section = 'events' }: {
  section?: 'events' | 'blog'; id?: string; flush(): Promise<SavedDraft<T> | null>; blocked: boolean; onBusy(value: boolean): void; onError(value: string): void;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const running = useRef(false);
  useEffect(() => {
    let active = true;
    setAvailable(null);
    if (id) void api<HistoryData<T>>(`/api/contents/${id}/history`).then(data => { if (active) setAvailable(data.items.length > 0); })
      .catch(() => { if (active) onError('公開履歴の有無を確認できませんでした。「公開履歴」から再試行できます。'); });
    return () => { active = false; };
  }, [id]);
  async function open() {
    if (!id || running.current) return;
    running.current = true; onBusy(true); onError('');
    try {
      const saved = await flush();
      if (!saved) { onError('保存できなかったため、公開履歴を開けませんでした。入力内容は残っています。'); return; }
      const result = await api<HistoryData<T>>(`/api/contents/${saved.id}/history`);
      setAvailable(result.items.length > 0);
      if (result.items.length) location.assign(`/cms/${section}/${saved.id}/history`);
    } catch { onError('公開履歴を取得できませんでした。入力内容は残っています。「公開履歴」から再試行してください。'); }
    finally { running.current = false; onBusy(false); }
  }
  return <Button disabled={!id || available === false || blocked} onClick={() => void open()}>公開履歴</Button>;
}
