// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=26-339
// Fields reuse Section 23:611 / Field 23:663 and the existing MUI input components.
import { useState } from 'react';
import { Button, Chip, Link, TextField, Typography } from '@mui/material';
import { Field, Section } from '../../components/Layout';
import type { SavedDraft, Tags } from '../../lib/api-client';
import { ContentEditor } from '../content/components/ContentEditor';
import { BodyEditor } from '../blog/components/BodyEditor';
import { MediaPicker } from '../blog/components/MediaPicker';
import { contentSections, emptyArticleDraft, type ArticleDraft, type ArticleType } from './draft';

const labels: Record<string, string> = { sourceName: '掲載元', sourceIssue: '掲載号・掲載日', coverageLabel: '掲載種別', youtubeId: 'YouTube ID', productionYear: '制作年', productionCountry: '制作国', duration: '上映時間', articleHeadline: '掲載記事の見出し', articleSubheadline: '掲載記事の副見出し' };
const fieldsFor = (type: ArticleType) => type === 'video' ? ['youtubeId', 'productionYear', 'productionCountry', 'duration'] : type === 'pressCoverage' ? ['sourceName', 'sourceIssue', 'coverageLabel', 'youtubeId', 'articleHeadline', 'articleSubheadline'] : [];
function ArticleFields({ type, value, change }: { type: ArticleType; value: ArticleDraft; change?(value: ArticleDraft): void }) {
  const [picker, setPicker] = useState(false);
  return <>
    {fieldsFor(type).length > 0 && <Section label="記事の詳細">{fieldsFor(type).map(key => {
      const text = (value as Record<string, unknown>)[key] as string;
      return change ? <TextField key={key} label={labels[key]} fullWidth required={type === 'video' && key === 'youtubeId'} value={text} onChange={e => change({ ...value, [key]: e.target.value })} slotProps={{ inputLabel: { shrink: true }, htmlInput: { required: false } }} helperText={key === 'youtubeId' ? '例：kwHsbFrH2EA（11文字）。未入力・入力途中でも下書き保存できます。' : undefined} /> : <Typography key={key} variant="body2">{labels[key]}：{text || '—'}</Typography>;
    })}</Section>}
    {type === 'pressCoverage' && <>
      <Section label="PDF"><Field label="掲載PDF">{value.attachmentAssetIds!.map((id, index) => <div key={id} className="flex items-center gap-cms-actions"><Link href={`/api/media/${id}/file`} target="_blank" rel="noopener">PDF {index + 1} を開く</Link>{change && <Button onClick={() => change({ ...value, attachmentAssetIds: value.attachmentAssetIds!.filter(a => a !== id) })}>取り外す</Button>}</div>)}{change && <Button variant="outlined" disabled={value.attachmentAssetIds!.length >= 20} onClick={() => setPicker(true)}>PDFを選択</Button>}</Field></Section>
      <Section label="掲載記事の本文"><Typography variant="body2">掲載記事の本文</Typography><BodyEditor key={change ? 'editing' : JSON.stringify(value.articleBody)} value={value.articleBody!.doc} change={change ? doc => change({ ...value, articleBody: { schemaVersion: 2, doc } }) : undefined} /></Section>
    </>}
    {picker && change && <MediaPicker kind="document" close={() => setPicker(false)} insert={id => { change({ ...value, attachmentAssetIds: [...new Set([...value.attachmentAssetIds!, id])] }); setPicker(false); }} />}
  </>;
}
export function ArticleEditor({ type, existing, tags }: { type: ArticleType; existing: SavedDraft<ArticleDraft> | null; tags: Tags }) {
  return <ContentEditor existing={existing} initial={emptyArticleDraft(type)} type={type} hideSlug={type === 'news'} prefix={`/${contentSections[type]}`}
    settings={(value, change) => type !== 'news' && <Section label="作品との関連"><Field label="映画タグ">{tags.filmTags.map(tag => <Chip key={tag.id} label={tag.name} aria-pressed={value.filmTagIds.includes(tag.id)} variant={value.filmTagIds.includes(tag.id) ? 'filled' : 'outlined'} onClick={() => change({ ...value, filmTagIds: value.filmTagIds.includes(tag.id) ? value.filmTagIds.filter(id => id !== tag.id) : [...value.filmTagIds, tag.id] })} />)}</Field></Section>}
    fields={(value, change) => <ArticleFields type={type} value={value} change={change} />} />;
}
export function ArticleHistoryContent({ type, value, tags }: { type: ArticleType; value: ArticleDraft; tags: Tags }) {
  return <>
    <Section label="記事タイトル"><Typography component="h1" variant="subtitle2">{value.title}</Typography></Section>
    <Section label="記事情報"><Typography variant="body2">{type !== 'news' && `slug：${value.slug || '—'}`}</Typography><Typography variant="body2">映画タグ：{value.filmTagIds.map(id => tags.filmTags.find(t => t.id === id)?.name ?? id).join('・') || '—'}</Typography></Section>
    <ArticleFields type={type} value={value} />
    <Section label="本文"><BodyEditor key={JSON.stringify(value.body)} value={value.body.doc} /></Section>
  </>;
}
