// Draft values are retained verbatim. Publishing must also check URL ownership.
export function slugIssue(slug: string): string | undefined {
  if (!slug) return '公開用のslugを入力してください。';
  if (slug === '.' || slug === '..' || /[\s/\\?#%\u0000-\u001f\u007f]/u.test(slug)) return '空白・スラッシュ・URLの区切り記号は使えません。';
  if (slug.toLowerCase() === 'archive') return 'このslugはイベント一覧で使用しています。';
  if (slug.length > 200) return '公開用のslugは200文字以内にしてください。';
  return undefined;
}
