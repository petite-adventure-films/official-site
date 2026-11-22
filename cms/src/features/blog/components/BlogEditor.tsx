// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=155-1483
import { Chip, Switch, Typography } from '@mui/material';
import { Field, Section } from '../../../components/Layout';
import type { SavedDraft, Tags, Tag } from '../../../lib/api-client';
import { ContentEditor } from '../../content/components/ContentEditor';
import { emptyBlogDraft, type BlogDraft } from '../draft';
export function BlogEditor({ existing, tags, categories }: { existing: SavedDraft<BlogDraft> | null; tags: Tags; categories: Tag[] }) {
  return <ContentEditor existing={existing} initial={emptyBlogDraft()} type="blog" settings={(value, change) => <>
    <Section label="ブログ設定"><Field label="カテゴリ" required>{categories.map(c => <Chip key={c.id} label={c.name} aria-pressed={value.categoryId === c.id} variant={value.categoryId === c.id ? 'filled' : 'outlined'} onClick={() => change({ ...value, categoryId: value.categoryId === c.id ? null : c.id })} />)}</Field>
      {(['isRecommended', 'isWorkshopReport'] as const).map(key => <label key={key} className="flex items-center gap-cms-related"><Typography variant="body2">{key === 'isRecommended' ? 'おすすめ' : 'ワークショップ報告'}</Typography><Switch checked={value[key]} onChange={(_, checked) => change({ ...value, [key]: checked })} /></label>)}
    </Section>
    <div className="border-t border-cms-divider pt-cms-content"><Section label="タグ">{(['filmTagIds', 'eventTagIds'] as const).map(key => <Field key={key} label={key === 'filmTagIds' ? '映画タグ' : 'イベントタグ'}>{tags[key === 'filmTagIds' ? 'filmTags' : 'eventTags'].map(tag => <Chip key={tag.id} label={tag.name} variant={value[key].includes(tag.id) ? 'filled' : 'outlined'} aria-pressed={value[key].includes(tag.id)} onClick={() => change({ ...value, [key]: value[key].includes(tag.id) ? value[key].filter(id => id !== tag.id) : [...value[key], tag.id] })} />)}</Field>)}</Section></div>
  </>} />;
}
