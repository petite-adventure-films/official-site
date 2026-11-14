import { DuplicateAction } from '../features/content/components/DuplicateAction';
import { ContentList } from '../features/content/components/ContentList';
import { loadSession } from '../features/auth/session';
import { useEffect, useState } from 'react';
import { Alert, Button, Chip, CircularProgress, Link, TextField, Typography } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { CMSLayout, EditorLayout, Section } from '../components/Layout';
import { api, ApiError, type SavedDraft, type Tags } from '../lib/api-client';
import { EventForm, EventSettings } from '../features/events/components/EventForm';
import { emptyDraft, type EventDraft } from '../features/events/draft';
import { useDraftSave } from '../features/content/hooks/useDraftSave';

function Editor({ existing, tags }: { existing: SavedDraft<EventDraft> | null; tags: Tags }) {
  const draft = useDraftSave(existing?.payload ?? emptyDraft(), existing);
  const [duplicating, setDuplicating] = useState(false);
  const conflict = draft.error instanceof ApiError && draft.error.status === 409;
  return <>
    {duplicating && <Typography role="status" variant="body2">複製中…</Typography>}
    <div inert={duplicating || undefined} aria-busy={duplicating}><EditorLayout aside={<>
    <Section label="公開管理"><Chip size="small" label="下書き" className="self-start" />
      {draft.saved && <div className="flex flex-col gap-cms-detail"><Typography variant="caption">作成日時 {new Date(draft.saved.createdAt).toLocaleString('ja-JP')}</Typography><Typography variant="caption">最終編集日時 {new Date(draft.saved.updatedAt).toLocaleString('ja-JP')}</Typography></div>}
    </Section>
    <div className="border-t border-cms-divider pt-cms-content flex flex-col gap-cms-section"><EventSettings value={draft.value} change={draft.change} tags={tags} /></div>
    <div className="border-t border-cms-divider pt-cms-content"><Section label="複製"><DuplicateAction flush={draft.flush} disabled={draft.blocked} busy={duplicating} onBusy={setDuplicating} /></Section></div>
  </>}>
    <div className="flex flex-wrap items-center gap-cms-actions">
      <Button href="/cms/events" startIcon={<ChevronLeft />}>イベント一覧</Button><div className="flex-1" />
      <Typography variant="body2" role="status">{draft.status}</Typography>
      <Button disabled>公開履歴</Button><Button variant="contained" disabled={draft.blocked || draft.status === '保存中'} onClick={() => void draft.save()}>保存</Button>
      <Button variant="outlined" disabled>プレビュー</Button>
    </div>
    {draft.error && <Alert severity="error" action={!draft.blocked && <Button color="inherit" onClick={() => void draft.save()}>再試行</Button>}>
      {conflict ? '別の画面で更新されています。入力内容はこの画面に残っています。内容を控えてから再読み込みしてください。' : draft.error instanceof ApiError && draft.error.status === 401 ? '認証が切れました。別のタブでログインしてから再試行してください。' : '保存できませんでした。入力内容はこの画面に残っています。文字数や通信状態を確認してください。'}
    </Alert>}
    <EventForm value={draft.value} change={draft.change} contentId={draft.saved?.id} />
  </EditorLayout></div></>;
}
export function App() {
  const [state, setState] = useState<{ user: string; tags: Tags; existing: SavedDraft<EventDraft> | null } | null>(null);
  const [error, setError] = useState(false);
  const path = window.location.pathname;
  const edit = path.match(/^\/cms\/events\/([0-9a-f-]{36})\/edit$/i);
  useEffect(() => { Promise.all([
    loadSession(), api<Tags>('/api/tags'), edit ? api<SavedDraft<EventDraft>>(`/api/contents/${edit[1]}`) : Promise.resolve(null),
  ]).then(([session, tags, existing]) => setState({ user: session.user.name, tags, existing })).catch(() => setError(true)); }, []);
  if (error) return <Alert severity="error" action={<Button onClick={() => location.reload()}>再試行</Button>}>読み込めませんでした。ログイン状態と通信を確認してください。</Alert>;
  if (!state) return <CircularProgress aria-label="読み込み中" />;
  return <CMSLayout user={state.user}>{edit || path === '/cms/events/new' ? <Editor existing={state.existing} tags={state.tags} /> : <ContentList<EventDraft> tags={state.tags} summarize={(payload) => payload} />}</CMSLayout>;
}
