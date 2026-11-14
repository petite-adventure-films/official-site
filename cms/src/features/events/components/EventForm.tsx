// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=17-2247
import { TextField, Switch, Chip, Typography } from '@mui/material';
import { Field, Section } from '../../../components/Layout';
import type { EventDraft } from '../draft';
import type { Tags } from '../../../lib/api-client';
import { SlugField } from '../../content/components/SlugField';
import { dateIssues } from '../date-issues';
type Props = { value: EventDraft; change: (value: EventDraft) => void };
export function EventForm({ value, change, contentId }: Props & { contentId?: string }) {
  const issues = dateIssues(value);
  function text(key: keyof EventDraft, label: string, multiline = false) {
    const publicationRequired = ['title', 'startDate', 'endDate', 'venue'].includes(key);
    return <TextField required={publicationRequired} key={key} label={label} value={value[key]} onChange={(e) => change({ ...value, [key]: e.target.value })}
      error={key in issues} helperText={issues[key as keyof typeof issues] ?? (key === 'title' ? '* は公開時に必要な項目です。未入力でも下書き保存できます。' : undefined)}
      fullWidth multiline={multiline} rows={multiline ? 3 : undefined} slotProps={{ inputLabel: { shrink: true }, htmlInput: { required: false, 'aria-required': publicationRequired || undefined } }} />;
  }
  return <>
    <Section label="記事情報">{text('title', 'タイトル')}
      <SlugField value={value.slug} contentId={contentId} onChange={(slug) => change({ ...value, slug })} />
    </Section>
    <Section label="日時"><div className="flex flex-wrap items-start gap-cms-content">
      <div className="w-cms-date">{text('startDate', '開催日')}</div>
      {value.multiDay && <div className="w-cms-date">{text('endDate', '終了日')}</div>}
      <label className="flex items-center gap-cms-related h-cms-input-height"><Typography variant="body2">複数日にわたる</Typography><Switch checked={value.multiDay} onChange={(_, checked) => change({ ...value, multiDay: checked })} /></label>
    </div>{text('timeDescription', '時間の案内')}</Section>
    <Section label="開催場所"><Field label="開催形式 *" outlined>
      {(['offline', 'online'] as const).map((format) => <Chip key={format} label={format === 'offline' ? 'オフライン' : 'オンライン'}
        variant={value.formats.includes(format) ? 'filled' : 'outlined'} aria-pressed={value.formats.includes(format)}
        onClick={() => change({ ...value, formats: value.formats.includes(format) ? value.formats.filter((v) => v !== format) : [...value.formats, format] })} />)}
    </Field>
    {value.formats.includes('offline') && <>{text('venue', '会場名')}{text('address', '住所')}{text('mapUrl', '地図URL')}{text('access', 'アクセス')}</>}
    {text('venueNotes', '開催場所の備考', true)}</Section>
    <Section label="参加案内">{text('fee', '料金')}{text('organizer', '主催者・問い合わせ', true)}{text('notes', '備考', true)}</Section>
  </>;
}
export function EventSettings({ value, change, tags }: Props & { tags: Tags }) {
  return <>
    <Section label="開催状況"><Field label="開催状況">{(['postponed', 'cancelled'] as const).map((status) =>
      <Chip key={status} label={status === 'postponed' ? '延期' : '中止'} variant={value.status === status ? 'filled' : 'outlined'} aria-pressed={value.status === status}
        onClick={() => change({ ...value, status: value.status === status ? 'normal' : status })} />)}</Field></Section>
    <div className="border-t border-cms-divider pt-cms-content"><Section label="タグ">
      {(['film', 'event'] as const).map((kind) => { const key = kind === 'film' ? 'filmTagIds' : 'eventTagIds'; return <Field key={kind} label={kind === 'film' ? '映画タグ' : 'イベントタグ'}>
        {tags[kind === 'film' ? 'filmTags' : 'eventTags'].map((tag) => <Chip key={tag.id} label={tag.name} variant={value[key].includes(tag.id) ? 'filled' : 'outlined'} aria-pressed={value[key].includes(tag.id)}
          onClick={() => change({ ...value, [key]: value[key].includes(tag.id) ? value[key].filter((id) => id !== tag.id) : [...value[key], tag.id] })} />)}
      </Field>; })}
    </Section></div>
  </>;
}
