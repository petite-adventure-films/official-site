import { useRef, useState } from 'react';
import { api, ApiError, type SavedDraft } from '../../../lib/api-client';
import type { PublicationIssue } from '../../../../worker/event-publication';
export function usePublicationCheck<T>(flush: () => Promise<SavedDraft<T> | null>) {
  const [checking, setChecking] = useState(false);
  const [issues, setIssues] = useState<PublicationIssue[]>([]);
  const [message, setMessage] = useState('');
  const [passed, setPassed] = useState(false);
  const active = useRef(false);
  function clear() { setIssues([]); setMessage(''); setPassed(false); }
  async function check() {
    if (active.current) return;
    active.current = true; setChecking(true); clear();
    try {
      const saved = await flush();
      if (!saved) { setMessage('保存できなかったため、公開前チェックを中止しました。入力内容は残っています。'); return; }
      const result = await api<{ ok: boolean; version: number; issues?: PublicationIssue[] }>(`/api/contents/${saved.id}/check-publication`, {
        method: 'POST', body: JSON.stringify({ expectedVersion: saved.version }),
      });
      setPassed(result.ok);
      setIssues(result.issues ?? []);
      setMessage(result.ok ? '入力内容に問題は見つかりませんでした。公開は行っていません。' : '入力内容を確認してください。下書きは保存されています。');
    } catch (error) {
      setMessage(error instanceof ApiError && error.status === 409 ? '別の画面で更新されています。入力内容を控えてから再読み込みしてください。' :
        error instanceof ApiError && error.status === 401 ? '認証が切れました。別のタブでログインしてから再度チェックしてください。' :
        '公開前チェックができませんでした。入力内容は残っています。ログイン状態と通信を確認して再度チェックしてください。');
    } finally { active.current = false; setChecking(false); }
  }
  return { checking, issues, message, passed, check, clear };
}
