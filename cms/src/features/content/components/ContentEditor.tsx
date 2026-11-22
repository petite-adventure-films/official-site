// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=155-1483
import { useEffect, useState, type ReactNode } from 'react';
import { DuplicateAction } from '../components/DuplicateAction';
import { Alert, Button, Chip, Link, TextField, Typography } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { EditorLayout, Section } from '../../../components/Layout';
import { ApiError, type SavedDraft } from '../../../lib/api-client';
import { useDraftSave } from '../hooks/useDraftSave';
import { SlugField } from '../components/SlugField';
import type { BodyNode } from '../../blog/draft';
import { contentLabels, contentSections, type ContentType } from '../../articles/draft';
import { StatusDialog } from '../../../components/StatusDialog';
import { HistoryEntry } from '../components/HistoryEntry';
import { usePublication } from '../hooks/usePublication';
import { BodyEditor } from '../../blog/components/BodyEditor';
export function ContentEditor<T extends { title: string; slug?: string; body: { schemaVersion: 2; doc: BodyNode } }>({ existing, initial, type, settings, fields, prefix = '', hideSlug = false }: {
  existing: SavedDraft<T> | null; initial: T; type: Exclude<ContentType, 'event'>; prefix?: string; hideSlug?: boolean;
  settings(value: T, change: (value: T) => void): ReactNode;
  fields?(value: T, change: (value: T) => void): ReactNode;
}) {
  const draft = useDraftSave(existing?.payload ?? initial, existing, type);
  const section = contentSections[type];
  const value = draft.value;
  const publication = usePublication(draft.saved?.id, draft.flush, type);
  const [confirm, setConfirm] = useState(false);
  const [openingHistory, setOpeningHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [restored] = useState(() => { try { return sessionStorage.getItem('cms-restored') === existing?.id; } catch { return false; } });
  useEffect(() => { if (restored) { try { sessionStorage.removeItem('cms-restored'); } catch { /* Optional notification. */ } } }, [restored]);
  const [duplicating, setDuplicating] = useState(false);
  const busy = duplicating || openingHistory || publication.busy;
  return <>{busy && <Typography role="status" variant="body2">{openingHistory ? '公開履歴を開いています…' : publication.busy ? '公開しています…' : '複製中…'}</Typography>}<div inert={busy || undefined} aria-busy={busy}><EditorLayout aside={<>
    <Section label="公開管理"><div className="flex flex-wrap items-center gap-cms-actions"><Chip size="small" label={publication.state?.published ? '公開済' : '下書き'} /><Button variant="outlined" color="success" disabled={draft.blocked || busy || publication.processing || !publication.state?.enabled} onClick={() => setConfirm(true)}>公開</Button></div>
      {publication.processing && <Typography variant="body2" role="status">反映中…</Typography>}
      {publication.state?.url && <Link href={publication.state.url} target="_blank" rel="noopener">公開ページを見る</Link>}
      {draft.saved && <div className="flex flex-col gap-cms-detail"><Typography variant="caption">作成日時 {new Date(draft.saved.createdAt).toLocaleString('ja-JP')}</Typography><Typography variant="caption">最終編集日時 {new Date(draft.saved.updatedAt).toLocaleString('ja-JP')}</Typography></div>}
    </Section>
    {settings(value, draft.change)}
    <div className="border-t border-cms-divider pt-cms-content"><Section label="記事の管理"><div className="flex gap-cms-actions"><DuplicateAction type={type} flush={draft.flush} disabled={draft.blocked} busy={duplicating} onBusy={setDuplicating} /><Button color="error" disabled>ゴミ箱へ移動</Button></div></Section></div>
  </>}>
    <div className="flex flex-wrap items-center gap-cms-actions"><Button href={`/cms/${section}`} startIcon={<ChevronLeft />}>{contentLabels[type]}一覧</Button><div className="flex-1" /><Typography variant="body2" role="status">{draft.status}</Typography><HistoryEntry key={publication.state?.version ?? 0} section={section} id={draft.saved?.id} flush={draft.flush} blocked={draft.blocked} onBusy={setOpeningHistory} onError={setHistoryError} /><Button variant="contained" disabled={draft.blocked || draft.status === '保存中'} onClick={() => void draft.save()}>保存</Button><Button variant="outlined" disabled>プレビュー</Button></div>
    {draft.error && <Alert severity="error" action={!draft.blocked && <Button color="inherit" onClick={() => void draft.save()}>再試行</Button>}>{draft.error instanceof ApiError && draft.error.status === 409 ? '別の画面で更新されています。入力内容はこの画面に残っています。内容を控えてから再読み込みしてください。' : '保存できませんでした。入力内容はこの画面に残っています。文字数や通信状態を確認してください。'}</Alert>}
    {restored && <Alert severity="success">選んだ内容を下書きに戻しました。</Alert>}
    {historyError && <Alert severity="error">{historyError}</Alert>}
    {publication.error && <Alert severity="error" action={!publication.issues.length && <Button color="inherit" onClick={() => void publication.retry()}>再試行</Button>}>{publication.issues.map(issue => issue.message).join(' ') || publication.error}</Alert>}
    {publication.state?.operation?.state === 'failed' && <Alert severity="error" action={<Button color="inherit" onClick={() => void publication.publish()}>再試行</Button>}>公開できませんでした。前の公開内容は保持されています。</Alert>}
    <Section label="記事情報"><TextField label="タイトル" required fullWidth value={value.title} onChange={e => draft.change({ ...value, title: e.target.value })} helperText="* は公開時に必要な項目です。未入力でも下書き保存できます。" slotProps={{ inputLabel: { shrink: true }, htmlInput: { required: false, 'aria-required': true } }} />{!hideSlug && <SlugField prefix={prefix} value={value.slug} contentId={draft.saved?.id} onChange={slug => draft.change({ ...value, slug })} />}</Section>
    {fields?.(value, draft.change)}
    <Section label="本文"><div className="flex flex-col gap-cms-heading"><Typography variant="body2">本文</Typography><BodyEditor value={value.body.doc} change={doc => draft.change({ ...draft.value, body: { schemaVersion: 2, doc } })} /></div></Section>
  </EditorLayout></div>
    <StatusDialog open={confirm} title="この記事を公開しますか？" subject={value.title || '（タイトル未入力）'} description="現在の内容をサイトに公開します。" confirmLabel="公開する"
      onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); void publication.publish(); }} />
  </>;
}
