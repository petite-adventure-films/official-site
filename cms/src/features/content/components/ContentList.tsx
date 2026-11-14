// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=33-330
import { useEffect, useState } from 'react';
import { Alert, Button, Chip, CircularProgress, InputAdornment, Link, TextField, Typography } from '@mui/material';
import Search from '@mui/icons-material/Search';
import { ListLayout, ListRow, Pagination } from '../../../components/List';
import { api, type SavedDraft, type Tags } from '../../../lib/api-client';
export function ContentList<T>({ tags, summarize }: { tags: Tags; summarize: (payload: T) => { title: string; filmTagIds: string[]; eventTagIds: string[] } }) {
  const [query, setQuery] = useState(''); const [keyword, setKeyword] = useState(''); const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: SavedDraft<T>[]; count: number; total: number } | null>(null);
  const [error, setError] = useState(false); const [retry, setRetry] = useState(0);
  useEffect(() => { let current = true; setData(null); setError(false);
    api<typeof data>(`/api/contents?type=event&page=${page}&q=${encodeURIComponent(keyword)}`).then((data) => { if (current) setData(data); }).catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, [keyword, page, retry]);
  const names = (ids: string[], kind: 'filmTags' | 'eventTags') => ids.length ? ids.map((id) => <Chip key={id} size="small" variant="outlined" label={tags[kind].find((tag) => tag.id === id)?.name ?? id} />) : '—';
  return <ListLayout>
    <div className="flex flex-wrap items-center gap-cms-content"><TextField label="キーワード検索" value={query} onChange={(e) => setQuery(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
      onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) { setKeyword(query.trim()); setPage(1); } }} /><Button variant="contained" href="/cms/events/new">新規作成</Button></div>
    {error ? <Alert severity="error" action={<Button onClick={() => setRetry(retry + 1)}>再試行</Button>}>一覧を取得できませんでした。</Alert> : !data ? <CircularProgress aria-label="読み込み中" /> : <>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="イベント一覧">
        <table className="w-full table-fixed min-w-cms-list-min text-sm"><thead><ListRow header title="タイトル" filmTags="映画タグ" eventTags="イベントタグ" status="公開状態" /></thead>
          <tbody>{data.items.map((item) => <ListRow key={item.id}
            title={<Link className="block truncate" href={`/cms/events/${item.id}/edit`} title={summarize(item.payload).title}>{summarize(item.payload).title || '（タイトル未入力）'}</Link>}
            filmTags={<div className="flex flex-wrap gap-cms-related">{names(summarize(item.payload).filmTagIds, 'filmTags')}</div>}
            eventTags={<div className="flex flex-wrap gap-cms-related">{names(summarize(item.payload).eventTagIds, 'eventTags')}</div>}
            status={<Chip size="small" label={item.published ? "公開済" : "下書き"} />} />)}</tbody></table>
      </div>
      <div className="flex flex-wrap justify-between items-center gap-cms-content"><Typography variant="body2">{keyword ? `検索結果 ${data.count}件（全${data.total}件）` : `全${data.count}件`}{data.count > 20 && `中 ${(page - 1) * 20 + 1}〜${Math.min(page * 20, data.count)}件`}</Typography>
        {data.count > 20 && <Pagination count={Math.ceil(data.count / 20)} page={page} onChange={setPage} />}</div>
    </>}
  </ListLayout>;
}
