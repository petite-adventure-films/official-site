// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=181-1879
// Selection composes existing MUI and Field/Section; representative state awaits user review.
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItemButton, ListItemText, TextField, Typography } from '@mui/material';
import { Field, Section } from '../../../components/Layout';
import { api, ApiError } from '../../../lib/api-client';
type Asset = { id: string; kind: 'image' | 'document'; originalFilename: string; defaultAltText?: string };
type Upload = { id: string; asset?: Asset; uploadUrl: string; headers: Record<string, string> };
export function MediaPicker({ kind, close, insert }: { kind: Asset['kind']; close: () => void; insert: (id: string, text: string) => void }) {
  const [items, setItems] = useState<Asset[]>([]), [q, setQ] = useState(''), [page, setPage] = useState(1), [count, setCount] = useState(0);
  const [selected, setSelected] = useState<Asset | null>(null), [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState(''), [refresh, setRefresh] = useState(0);
  const pending = useRef<{ file: File; operationId: string } | null>(null);
  const choose = (asset: Asset) => { setSelected(asset); setText(kind === 'image' ? asset.defaultAltText ?? '' : asset.originalFilename); };
  useEffect(() => {
    let active = true; setLoading(true);
    api<{ items: Asset[]; count: number }>(`/api/media?kind=${kind}&q=${encodeURIComponent(q)}&page=${page}`).then(result => { if (active) { setItems(result.items); setCount(result.count); } }).catch(() => { if (active) setError('一覧を取得できません。再読み込みしてください。'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, q, page, refresh]);
  async function upload() {
    if (!file || busy) return;
    setBusy(true); setError('');
    try {
      const allowed = kind === 'image' ? ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] : ['application/pdf'];
      if (!allowed.includes(file.type) || file.size === 0 || file.size > (kind === 'image' ? 10 : 20) * 1024 * 1024) throw new Error('invalid_file');
      if (pending.current?.file !== file) pending.current = { file, operationId: crypto.randomUUID() };
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      const sha256 = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      const registration = await api<Upload>('/api/media/uploads', { method: 'POST', body: JSON.stringify({ operationId: pending.current.operationId, filename: file.name, mimeType: file.type, sizeBytes: file.size, sha256 }) });
      let asset = registration.asset;
      if (!asset) {
        const result = await fetch(registration.uploadUrl, { method: 'PUT', headers: registration.headers, body: file });
        if (!result.ok) throw new Error('upload_failed');
        asset = await api<Asset>(`/api/media/${registration.id}/complete`, { method: 'POST', body: '{}' });
      }
      choose(asset); pending.current = null; setFile(null); setRefresh(n => n + 1);
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 410) pending.current = null;
      setError('登録できませんでした。ファイルの形式・サイズを確認し、もう一度登録してください。本文は変更されていません。');
    } finally { setBusy(false); }
  }
  return <Dialog open onClose={() => { if (!busy) close(); }} fullWidth maxWidth="sm" aria-labelledby="media-title">
    <DialogTitle id="media-title" variant="subtitle2">{kind === 'image' ? '画像' : 'PDF'}を挿入</DialogTitle>
    <DialogContent><div className="flex flex-col gap-cms-section pt-cms-heading">
      {error && <Alert severity="error">{error}</Alert>}
      <Section label="新規登録"><Field label="ファイルを登録">
        <Button component="label" variant="outlined" disabled={busy}>ファイルを選択<input className="sr-only" aria-label="登録するファイル" type="file" disabled={busy} accept={kind === 'image' ? 'image/png,image/jpeg,image/gif,image/webp' : 'application/pdf'} onChange={e => { setFile(e.target.files?.[0] ?? null); pending.current = null; }} /></Button>
        <Typography variant="body2" className="break-all">{file?.name ?? '未選択'}</Typography>
        <Typography variant="caption">{kind === 'image' ? 'PNG・JPEG・GIF・WebP、10 MiBまで' : 'PDF、20 MiBまで'}</Typography>
        <Button disabled={!file || busy} onClick={upload}>{busy ? '登録中…' : '登録'}</Button>
      </Field></Section>
      <Section label="登録済みファイル">
        <TextField label="ファイル名で検索" size="small" value={q} disabled={busy} onChange={e => { setQ(e.target.value); setPage(1); }} />
        {loading ? <Typography role="status" variant="body2">読み込み中…</Typography> : <>
          <Typography variant="body2">全{count}件</Typography>
          <List disablePadding aria-label="登録済みファイル">{items.map(asset => <ListItemButton key={asset.id} selected={selected?.id === asset.id} aria-pressed={selected?.id === asset.id} disabled={busy} onClick={() => choose(asset)}><ListItemText primary={asset.originalFilename} slotProps={{ primary: { variant: 'body2', className: 'break-all' } }} /></ListItemButton>)}</List>
        </>}
        <div className="flex gap-cms-actions"><Button disabled={busy || page <= 1} onClick={() => setPage(n => n - 1)}>前へ</Button><Button disabled={busy || page * 20 >= count} onClick={() => setPage(n => n + 1)}>次へ</Button><Button disabled={busy} onClick={() => { setError(''); setRefresh(n => n + 1); }}>再読み込み</Button></div>
      </Section>
      {selected && <Section label="選択中のファイル"><Typography variant="body2" className="break-all">選択中：{selected.originalFilename}</Typography>
        {kind === 'image' && <img src={`/api/media/${selected.id}/file`} alt="選択した画像の確認" className="max-w-full max-h-cms-dialog h-auto self-start object-contain" />}
        <TextField fullWidth label={kind === 'image' ? '代替テキスト' : 'リンク文字列'} value={text} disabled={busy} onChange={e => setText(e.target.value)} helperText={kind === 'image' ? '画像が伝える内容を記入します。装飾だけの画像は空欄にできます。' : undefined} />
      </Section>}
    </div></DialogContent>
    <DialogActions><Button disabled={busy} onClick={close}>キャンセル</Button><Button variant="contained" disabled={busy || !selected || text.length > 2000 || (kind === 'document' && !text.trim())} onClick={() => { if (selected) insert(selected.id, text); }}>挿入</Button></DialogActions>
  </Dialog>;
}
