import { ArticleEditor, ArticleHistoryContent } from '../features/articles/ArticleEditor';
import { contentSections, isArticleType, type ArticleDraft, type ContentType } from '../features/articles/draft';
import { BlogHistoryContent } from '../features/blog/components/BlogHistoryContent';
import { BlogEditor } from '../features/blog/components/BlogEditor';
import type { BlogDraft } from '../features/blog/draft';
import type { Tag } from '../lib/api-client';
import { usePublication } from '../features/content/hooks/usePublication';
import { StatusDialog } from '../components/StatusDialog';
import { HistoryView, EventHistoryContent } from '../features/content/components/HistoryView';
import { HistoryEntry } from '../features/content/components/HistoryEntry';
import { DuplicateAction } from '../features/content/components/DuplicateAction';
import { ContentList } from '../features/content/components/ContentList';
import { loadSession } from '../features/auth/session';
import { useEffect, useState, useRef } from 'react';
import { Alert, Button, Chip, CircularProgress, Link, TextField, Typography } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { CMSLayout, EditorLayout, Section } from '../components/Layout';
import { api, ApiError, type SavedDraft, type Tags } from '../lib/api-client';
import { EventForm, EventSettings } from '../features/events/components/EventForm';
import { emptyDraft, type EventDraft } from '../features/events/draft';
import { useDraftSave } from '../features/content/hooks/useDraftSave';

function Editor({ existing, tags }: { existing: SavedDraft<EventDraft> | null; tags: Tags }) {
  const draft = useDraftSave(existing?.payload ?? emptyDraft(), existing);
  const publication = usePublication(draft.saved?.id, draft.flush);
  const [confirm, setConfirm] = useState(false);
  const fields = useRef<HTMLDivElement>(null);
  const errors = Object.fromEntries(publication.issues.map(issue => [issue.field, issue.message]));
  function change(value: EventDraft) { publication.clear(); draft.change(value); }
  useEffect(() => { if (publication.issues.length) fields.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); }, [publication.issues]);
  const [duplicating, setDuplicating] = useState(false);
  const [openingHistory, setOpeningHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [restored] = useState(() => { try { return sessionStorage.getItem('cms-restored') === existing?.id; } catch { return false; } });
  useEffect(() => { if (restored) { try { sessionStorage.removeItem('cms-restored'); } catch { /* Optional notification only. */ } } }, [restored]);
  const conflict = draft.error instanceof ApiError && draft.error.status === 409;
  return <>
    {(duplicating || openingHistory || publication.busy) && <Typography role="status" variant="body2">{openingHistory ? '公開履歴を開いています…' : publication.busy ? '公開しています…' : '複製中…'}</Typography>}
    <div ref={fields} inert={duplicating || openingHistory || publication.busy || undefined} aria-busy={duplicating || openingHistory || publication.busy}><EditorLayout aside={<>
    <Section label="公開管理"><div className="flex flex-wrap items-center gap-cms-actions"><Chip size="small" label={publication.state?.published ? "公開済" : "下書き"} /><Button variant="outlined" color="success" disabled={draft.blocked || publication.busy || publication.processing || !publication.state?.enabled} onClick={() => setConfirm(true)}>公開</Button></div>
      {publication.processing && <Typography variant="body2" role="status">反映中…</Typography>}
      {publication.state?.url && <Link href={publication.state.url} target="_blank" rel="noopener">公開ページを見る</Link>}
      {draft.saved && <div className="flex flex-col gap-cms-detail"><Typography variant="caption">作成日時 {new Date(draft.saved.createdAt).toLocaleString('ja-JP')}</Typography><Typography variant="caption">最終編集日時 {new Date(draft.saved.updatedAt).toLocaleString('ja-JP')}</Typography></div>}
    </Section>
    <div className="border-t border-cms-divider pt-cms-content flex flex-col gap-cms-section"><EventSettings errors={errors} value={draft.value} change={change} tags={tags} /></div>
    <div className="border-t border-cms-divider pt-cms-content"><Section label="記事の管理"><div className="flex flex-wrap items-start gap-cms-actions"><DuplicateAction flush={draft.flush} disabled={draft.blocked} busy={duplicating} onBusy={setDuplicating} /><Button color="error" disabled>ゴミ箱へ移動</Button></div></Section></div>
  </>}>
    <div className="flex flex-wrap items-center gap-cms-actions">
      <Button href="/cms/events" startIcon={<ChevronLeft />}>イベント一覧</Button><div className="flex-1" />
      <Typography variant="body2" role="status">{draft.status}</Typography>
      <HistoryEntry key={publication.state?.version ?? 0} id={draft.saved?.id} flush={draft.flush} blocked={draft.blocked} onBusy={setOpeningHistory} onError={setHistoryError} /><Button variant="contained" disabled={draft.blocked || draft.status === '保存中'} onClick={() => void draft.save()}>保存</Button>
      <Button variant="outlined" disabled>プレビュー</Button>
    </div>
    {draft.error && <Alert severity="error" action={!draft.blocked && <Button color="inherit" onClick={() => void draft.save()}>再試行</Button>}>
      {conflict ? '別の画面で更新されています。入力内容はこの画面に残っています。内容を控えてから再読み込みしてください。' : draft.error instanceof ApiError && draft.error.status === 401 ? '認証が切れました。別のタブでログインしてから再試行してください。' : '保存できませんでした。入力内容はこの画面に残っています。文字数や通信状態を確認してください。'}
    </Alert>}
    {restored && <Alert severity="success">選んだ内容を下書きに戻しました。</Alert>}
    {historyError && <Alert severity="error">{historyError}</Alert>}
    {publication.error && <Alert severity="error" action={<Button color="inherit" disabled={publication.busy} onClick={() => void publication.retry()}>再試行</Button>}>{publication.error}</Alert>}
    {publication.state?.operation?.state === 'failed' && <Alert severity="error" action={<Button color="inherit" onClick={() => void publication.publish()}>再試行</Button>}>公開できませんでした。前の公開内容は保持されています。</Alert>}
    <EventForm errors={errors} value={draft.value} change={change} contentId={draft.saved?.id} />
  </EditorLayout></div>
    <StatusDialog open={confirm} title="この記事を公開しますか？" subject={draft.value.title || '（タイトル未入力）'} description="現在の内容をサイトに公開します。" confirmLabel="公開する"
      onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); void publication.publish(); }} />
  </>;
}
export function App() {
  const [state, setState] = useState<{ user: string; tags: Tags; categories: Tag[]; existing: SavedDraft<EventDraft | BlogDraft | ArticleDraft> | null } | null>(null);
  const [error, setError] = useState(false);
  const path = window.location.pathname;
  const type = (Object.entries(contentSections).find(([, section]) => path === `/cms/${section}` || path.startsWith(`/cms/${section}/`))?.[0] ?? 'event') as ContentType;
  const isBlog = type === 'blog';
  const history = path.match(/^\/cms\/(?:events|blog|news|media|channel)\/([0-9a-f-]{36})\/history$/i);
  const edit = path.match(/^\/cms\/(?:events|blog|news|media|channel)\/([0-9a-f-]{36})\/edit$/i);
  useEffect(() => { Promise.all([
    loadSession(), api<Tags>('/api/tags'), (edit ?? history) ? api<SavedDraft<EventDraft | BlogDraft | ArticleDraft>>(`/api/contents/${(edit ?? history)![1]}`) : Promise.resolve(null),
    isBlog ? api<{ items: Tag[] }>('/api/categories') : Promise.resolve({ items: [] }),
  ]).then(([session, tags, existing, categories]) => { if (existing && (existing.type !== type || existing.payloadSchemaVersion !== `${type}-draft/v1`)) throw new Error('content_type_mismatch'); setState({ user: session.user.name, tags, existing, categories: categories.items }); }).catch(() => setError(true)); }, []);
  if (error) return <Alert severity="error" action={<Button onClick={() => location.reload()}>再試行</Button>}>読み込めませんでした。ログイン状態と通信を確認してください。</Alert>;
  if (!state) return <CircularProgress aria-label="読み込み中" />;
  if (isArticleType(type)) return <CMSLayout user={state.user}>{history ?
    <HistoryView<ArticleDraft> id={history[1]} section={contentSections[type]} renderContent={value => <ArticleHistoryContent type={type} value={value} tags={state.tags} />} /> :
    edit || path === `/cms/${contentSections[type]}/new` ? <ArticleEditor type={type} existing={state.existing as SavedDraft<ArticleDraft> | null} tags={state.tags} /> :
    <ContentList<ArticleDraft> type={type} tags={state.tags} summarize={value => ({ ...value, eventTagIds: [] })} />}</CMSLayout>;
  if (history) return <CMSLayout user={state.user}>{isBlog ?
    <HistoryView<BlogDraft> id={history[1]} section="blog" renderContent={value => <BlogHistoryContent value={value} tags={state.tags} categories={state.categories} />} /> :
    <HistoryView<EventDraft> id={history[1]} section="events" renderContent={value => <EventHistoryContent value={value} tags={state.tags} />} />}
  </CMSLayout>;
  return <CMSLayout user={state.user}>{isBlog ? (edit || path === '/cms/blog/new' ? <BlogEditor existing={state.existing as SavedDraft<BlogDraft> | null} tags={state.tags} categories={state.categories} /> : <ContentList<BlogDraft> type="blog" tags={state.tags} summarize={payload => payload} />) : edit || path === '/cms/events/new' ? <Editor existing={state.existing as SavedDraft<EventDraft> | null} tags={state.tags} /> : <ContentList<EventDraft> tags={state.tags} summarize={(payload) => payload} />}</CMSLayout>;
}
