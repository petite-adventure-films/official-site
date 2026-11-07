import {
  CONTENT_TYPES,
  type Content,
  type ContentPayload,
  type Revision,
} from './types';

const ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const REVISION_ID_PATTERN = /^rev_[a-z0-9]+(?:_[a-z0-9]+)*$/;

export class RepositoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryValidationError';
  }
}

function assertIsoDate(value: string, field: string): void {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  ) {
    throw new RepositoryValidationError(
      `${field} must be an ISO 8601 date-time with timezone`,
    );
  }
  if (Number.isNaN(Date.parse(value))) {
    throw new RepositoryValidationError(`${field} is not a valid date-time`);
  }
}

function assertRevision(
  content: Content,
  revision: Revision,
  expectedId: string,
): void {
  if (revision.revisionId !== expectedId) {
    throw new RepositoryValidationError(
      `revision ${revision.revisionId} does not match ${expectedId}`,
    );
  }
  if (revision.contentId !== content.record.id) {
    throw new RepositoryValidationError(
      `revision ${revision.revisionId} belongs to another content record`,
    );
  }
  if (revision.payload.type !== content.record.type) {
    throw new RepositoryValidationError(
      `revision ${revision.revisionId} payload type does not match its record`,
    );
  }
  if (!REVISION_ID_PATTERN.test(revision.revisionId)) {
    throw new RepositoryValidationError(
      `invalid revision ID: ${revision.revisionId}`,
    );
  }
  assertIsoDate(
    revision.createdAt,
    `revision ${revision.revisionId}.createdAt`,
  );
}

export function contentTitle(payload: ContentPayload): string {
  const candidate = payload.title ?? payload.label ?? payload.question;
  return typeof candidate === 'string' && candidate.trim()
    ? candidate.trim()
    : payload.type;
}

export function assertContentAggregate(content: Content): void {
  const { record } = content;
  if (!ID_PATTERN.test(record.id)) {
    throw new RepositoryValidationError(`invalid content ID: ${record.id}`);
  }
  if (!CONTENT_TYPES.includes(record.type)) {
    throw new RepositoryValidationError(
      `unsupported content type: ${record.type}`,
    );
  }
  assertIsoDate(record.createdAt, 'record.createdAt');
  assertIsoDate(record.updatedAt, 'record.updatedAt');
  if (Date.parse(record.updatedAt) < Date.parse(record.createdAt)) {
    throw new RepositoryValidationError(
      'record.updatedAt must not precede record.createdAt',
    );
  }

  const { publication } = record;
  if (publication.state === 'scheduled') {
    if (!publication.scheduledFor) {
      throw new RepositoryValidationError(
        'scheduled content requires publication.scheduledFor',
      );
    }
    assertIsoDate(publication.scheduledFor, 'publication.scheduledFor');
  }
  if (publication.state === 'published' || publication.state === 'archived') {
    if (!publication.publishedAt || !record.publishedRevisionId) {
      throw new RepositoryValidationError(
        `${publication.state} content requires publishedAt and publishedRevisionId`,
      );
    }
    assertIsoDate(publication.publishedAt, 'publication.publishedAt');
  }
  if (
    record.type === 'event' &&
    ['published', 'archived'].includes(publication.state)
  ) {
    if (
      !Number.isInteger(record.eventNumber) ||
      (record.eventNumber ?? 0) < 1
    ) {
      throw new RepositoryValidationError(
        'published events require a positive eventNumber',
      );
    }
  } else if (record.type !== 'event' && record.eventNumber !== undefined) {
    throw new RepositoryValidationError(
      'eventNumber is only valid for event records',
    );
  }

  assertRevision(content, content.workingRevision, record.workingRevisionId);
  if (record.publishedRevisionId) {
    if (!content.publishedRevision) {
      throw new RepositoryValidationError(
        'publishedRevision is required by publishedRevisionId',
      );
    }
    assertRevision(
      content,
      content.publishedRevision,
      record.publishedRevisionId,
    );
  } else if (content.publishedRevision) {
    throw new RepositoryValidationError(
      'publishedRevision cannot exist without publishedRevisionId',
    );
  }
}
