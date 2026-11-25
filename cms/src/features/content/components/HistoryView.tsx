import { BodyEditor } from '../../blog/components/BodyEditor';
import type { EventText } from '../../../../../packages/content-schema/event-text';
// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=54-970
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, Button, CircularProgress, Typography } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { EditorLayout, Section } from '../../../components/Layout';
import { HistoryListItem } from '../../../components/HistoryListItem';
import { api, ApiError, type Tags } from '../../../lib/api-client';
import type { EventDraft } from '../../events/draft';
export type HistoryData<T = EventDraft> = { version: number; items: { id: string; kind: 'publication' | 'protectedDraft'; at: string; actorName: string; payload: T }[] };
const text = (value: string) => value.trim() ? value : '-';
export function EventHistoryContent({ value, tags }: { value: EventDraft; tags: Tags }) {
  const groups: [string, [string, EventText][]][] = [
    ['日時', [['開催日', value.startDate + (value.multiDay ? ` 〜 ${text(value.endDate)}` : '')], ['時間の案内', value.timeDescription]]],
    ['開催場所', [['開催形式', value.formats.map(f => f === 'offline' ? 'オフライン' : f === 'online' ? 'オンライン' : '不明').join('・')],
      ...((value.formats.includes('offline') || value.formats.includes('unknown')) ? [['会場名', value.venue], ['住所', value.address], ['地図URL', value.mapUrl], ['アクセス', value.access]] as [string, EventText][] : []), ['備考', value.venueNotes]]],
    ['参加案内', [['料金', value.fee], ['主催者・問い合わせ', value.organizer], ['備考', value.notes]]],
    ['開催状況・タグ', [['開催状況', { normal: '通常開催', postponed: '延期', cancelled: '中止' }[value.status]],
      ['映画タグ', value.filmTagIds.map(id => tags.filmTags.find(t => t.id === id)?.name ?? '削除済みのタグ').join('・')],
      ['イベントタグ', value.eventTagIds.map(id => tags.eventTags.find(t => t.id === id)?.name ?? '削除済みのタグ').join('・')]]],
  ];
  return <><Section label="記事タイトル"><Typography component="h1" variant="subtitle2" className="whitespace-pre-wrap break-words">{text(value.title)}</Typography></Section>
    {groups.map(([heading, fields]) => <Section key={heading} label={heading}><div className="flex flex-col gap-cms-heading">
      <Typography component="h2" variant="subtitle2">{heading}</Typography><div>{fields.map(([label, value]) => <div key={label}>{typeof value === 'string' ? <Typography variant="body2" className="whitespace-pre-wrap break-words">{label}：{text(value)}</Typography> : <><Typography variant="body2">{label}</Typography><BodyEditor key={JSON.stringify(value.doc)} textOnly value={value.doc} /></>}</div>)}</div>
    </div></Section>)}</>;
}
export function HistoryView<T>({ id, section, renderContent }: { id: string; section: string; renderContent(value: T): ReactNode }) {
  const [data, setData] = useState<HistoryData<T> | null>(null);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const pending = useRef<string | null>(null);
  const running = useRef(false);
  const editUrl = `/cms/${section}/${id}/edit`;
  async function load() {
    setError('');
    try {
      const result = await api<HistoryData<T>>(`/api/contents/${id}/history`);
      if (!result.items.length) { location.replace(editUrl); return; }
      setData(result); setSelected(result.items[0].id); setBlocked(false); pending.current = null;
    } catch (e) { setError(e instanceof ApiError && e.status === 404 ? 'この記事は見つかりませんでした。' : '公開履歴を取得できませんでした。ログイン状態と通信を確認して再試行してください。'); }
  }
  useEffect(() => { void load(); }, [id]);
  async function restore() {
    const source = data?.items.find(item => item.id === selected);
    if (!source || running.current || blocked) return;
    pending.current ??= JSON.stringify({ operationId: crypto.randomUUID(), expectedVersion: data!.version, sourceKind: source.kind, sourceId: source.id });
    running.current = true; setBusy(true); setError('');
    try {
      await api(`/api/contents/${id}/restore`, { method: 'POST', body: pending.current });
      try { sessionStorage.setItem('cms-restored', id); } catch { /* Notification storage must not block a completed restore. */ }
      location.assign(editUrl);
    } catch (e) {
      const terminal = e instanceof ApiError && [404, 409, 422].includes(e.status);
      setBlocked(terminal);
      setError(e instanceof ApiError && e.status === 409 ? '別の画面で更新されています。履歴を再読み込みして内容を確認してください。' : terminal ? 'この履歴を復元できません。履歴を再読み込みして確認してください。' : '復元の結果を確認できませんでした。同じ操作を再試行してください。');
      setBusy(false); running.current = false;
    }
  }
  if (!data) return <div className="flex flex-col gap-cms-content"><Button href={editUrl} startIcon={<ChevronLeft />}>編集へ戻る</Button>{error ? <Alert severity="error" action={<Button onClick={() => void load()}>再試行</Button>}>{error}</Alert> : <CircularProgress aria-label="公開履歴を読み込み中" />}</div>;
  const source = data.items.find(item => item.id === selected)!;
  return <>
    {busy && <Typography role="status" variant="body2">下書きに戻しています…</Typography>}
    <div inert={busy || undefined} aria-busy={busy}><EditorLayout aside={<Section label="公開履歴"><div aria-label="公開履歴の選択">
      {data.items.map(item => <HistoryListItem key={item.id} selected={selected === item.id} disabled={Boolean(pending.current)}
        at={item.at} actor={item.actorName} status={item.kind === 'protectedDraft' ? '編集中' : '公開済'} onClick={() => setSelected(item.id)} />)}
    </div></Section>}>
      <div className="flex flex-wrap items-center justify-between gap-cms-actions"><Button href={editUrl} startIcon={<ChevronLeft />}>編集へ戻る</Button>
        <Button variant="contained" disabled={blocked} onClick={() => void restore()}>{pending.current ? '復元を再試行' : 'この内容を下書きに戻す'}</Button></div>
      {error && <Alert severity="error" action={blocked ? <Button onClick={() => void load()}>再読み込み</Button> : undefined}>{error}</Alert>}
      {renderContent(source.payload)}
    </EditorLayout></div>
  </>;
}
