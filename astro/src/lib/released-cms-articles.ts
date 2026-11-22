import type { ArticleDraft, ArticleType } from '../../../cms/src/features/articles/draft';
import { readCmsRelease } from './released-cms-blogs';
import snapshot from '../../data/wordpress-export.json';
export type ArticleEntry = {
  type: ArticleType;
  path: string;
  publishedAt: string;
  content: ArticleDraft;
};
export async function releasedCmsArticles(type: ArticleType) {
  const { articles, render, assetPath } = await readCmsRelease();
  const filmNames = new Map<string, string>();
  for (const item of [
    ...snapshot.content.media,
    ...snapshot.content.channels,
    ...snapshot.content.events,
  ]) {
    if (Array.isArray(item.film_tags))
      for (const tag of item.film_tags) filmNames.set(String(tag.term_id), tag.name);
  }
  return articles
    .filter((article) => article.type === type)
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) ||
        (a.path.split('#cms-').at(-1) ?? '').localeCompare(b.path.split('#cms-').at(-1) ?? ''),
    )
    .map(({ content, path, publishedAt }) => ({
      id: type === 'news' ? path.split('#cms-')[1] : (content.slug ?? ''),
      title: content.title,
      content: render(content.body.doc),
      published: publishedAt,
      cmsPath: path,
      cmsMarker: Buffer.from(path).toString('hex'),
      film_tags: content.filmTagIds.map((id) => ({ name: filmNames.get(id) ?? id })),
      media_name: content.sourceName ?? '',
      media_volume: content.sourceIssue ?? '',
      media_contents: content.coverageLabel ?? '',
      media_video: content.youtubeId ?? '',
      media_pdf_url: content.attachmentAssetIds?.[0]
        ? assetPath(content.attachmentAssetIds[0])
        : false,
      cmsPdfUrls: (content.attachmentAssetIds ?? []).map(assetPath),
      article_title: content.articleHeadline ?? '',
      article_subtitle: content.articleSubheadline ?? '',
      article_contents: content.articleBody ? render(content.articleBody.doc) : '',
      youtube_id: content.youtubeId ?? '',
      created_year: content.productionYear ?? '',
      created_country: content.productionCountry ?? '',
      running_time: content.duration ?? '',
    }));
}
