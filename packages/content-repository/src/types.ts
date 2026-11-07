export const CONTENT_TYPES = [
  'news',
  'blog',
  'event',
  'pressCoverage',
  'video',
  'film',
  'product',
  'faq',
  'category',
  'eventKind',
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type PublicationState = 'draft' | 'scheduled' | 'published' | 'archived';
export type RevisionState = 'working' | 'pending' | 'published' | 'superseded';

export type ContentPayload = {
  schemaVersion: number;
  type: ContentType;
  title?: string;
  slug?: string;
  label?: string;
  question?: string;
  [key: string]: unknown;
};

export type ContentRecord = {
  schemaVersion: number;
  id: string;
  type: ContentType;
  publication: {
    state: PublicationState;
    publishedAt?: string;
    scheduledFor?: string;
  };
  workingRevisionId: string;
  publishedRevisionId?: string;
  eventNumber?: number;
  createdAt: string;
  updatedAt: string;
};

export type Revision = {
  schemaVersion: number;
  revisionId: string;
  contentId: string;
  state: RevisionState;
  createdAt: string;
  createdBy: string;
  payload: ContentPayload;
};

/**
 * The repository aggregate returned to the CMS. Historical revisions remain in
 * storage, but only the revisions needed to render the current editing state
 * are loaded here.
 */
export type Content = {
  record: ContentRecord;
  workingRevision: Revision;
  publishedRevision?: Revision;
};

export type SearchQuery = {
  text?: string;
  types?: ContentType[];
  states?: PublicationState[];
  offset?: number;
  limit?: number;
};

export type ContentSummary = {
  id: string;
  type: ContentType;
  publicationState: PublicationState;
  title: string;
  slug?: string;
  updatedAt: string;
  workingRevisionId: string;
  publishedRevisionId?: string;
};

export interface ContentRepository {
  findById(id: string): Promise<Content | null>;
  findBySlug(type: ContentType, slug: string): Promise<Content | null>;
  search(query: SearchQuery): Promise<ContentSummary[]>;
  save(content: Content): Promise<void>;
  remove(id: string): Promise<void>;
}
