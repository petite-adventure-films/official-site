import type { Content, ContentSummary, SearchQuery } from './types';
import { contentTitle } from './validation';

export type ContentIndex = {
  schemaVersion: 1;
  generatedAt: string;
  entries: ContentSummary[];
};

export function summaryFromContent(content: Content): ContentSummary {
  const { record, workingRevision } = content;
  return {
    id: record.id,
    type: record.type,
    publicationState: record.publication.state,
    title: contentTitle(workingRevision.payload),
    ...(typeof workingRevision.payload.slug === 'string'
      ? { slug: workingRevision.payload.slug }
      : {}),
    updatedAt: record.updatedAt,
    workingRevisionId: record.workingRevisionId,
    ...(record.publishedRevisionId
      ? { publishedRevisionId: record.publishedRevisionId }
      : {}),
  };
}

export function searchIndex(
  index: ContentIndex,
  query: SearchQuery,
): ContentSummary[] {
  const text = query.text?.trim().toLocaleLowerCase('ja-JP');
  const offset = Math.max(0, query.offset ?? 0);
  const limit = Math.max(0, query.limit ?? 50);

  return index.entries
    .filter((entry) => !query.types?.length || query.types.includes(entry.type))
    .filter(
      (entry) =>
        !query.states?.length || query.states.includes(entry.publicationState),
    )
    .filter((entry) => {
      if (!text) return true;
      return `${entry.title}\n${entry.slug ?? ''}`
        .toLocaleLowerCase('ja-JP')
        .includes(text);
    })
    .sort(
      (left, right) =>
        right.updatedAt.localeCompare(left.updatedAt) ||
        left.id.localeCompare(right.id),
    )
    .slice(offset, offset + limit);
}
