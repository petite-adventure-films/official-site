import { Typography } from '@mui/material';
import { Section } from '../../../components/Layout';
import type { Tag, Tags } from '../../../lib/api-client';
import type { BlogDraft } from '../draft';
import { BodyEditor } from './BodyEditor';

export function BlogHistoryContent({ value, tags, categories }: { value: BlogDraft; tags: Tags; categories: Tag[] }) {
  const names = (ids: string[], options: Tag[]) => ids.map(id => options.find(option => option.id === id)?.name ?? id).join('・') || '—';
  return <>
    <Section label="記事タイトル"><Typography component="h1" variant="subtitle2">{value.title || '（タイトル未入力）'}</Typography></Section>
    <Section label="記事情報">
      <Typography variant="body2">slug：{value.slug || '—'}</Typography>
      <Typography variant="body2">カテゴリ：{value.categoryId ? names([value.categoryId], categories) : '—'}</Typography>
      <Typography variant="body2">映画タグ：{names(value.filmTagIds, tags.filmTags)}</Typography>
      <Typography variant="body2">イベントタグ：{names(value.eventTagIds, tags.eventTags)}</Typography>
      <Typography variant="body2">おすすめ：{value.isRecommended ? 'オン' : 'オフ'}</Typography>
      <Typography variant="body2">ワークショップ報告：{value.isWorkshopReport ? 'オン' : 'オフ'}</Typography>
    </Section>
    <Section label="本文"><BodyEditor key={JSON.stringify(value.body)} value={value.body.doc} /></Section>
  </>;
}
