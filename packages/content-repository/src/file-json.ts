import fs from 'node:fs/promises';
import path from 'node:path';

import {
  summaryFromContent,
  searchIndex,
  type ContentIndex,
} from './index-file';
import type {
  Content,
  ContentRecord,
  ContentRepository,
  ContentSummary,
  ContentType,
  Revision,
  SearchQuery,
} from './types';
import {
  assertContentAggregate,
  RepositoryValidationError,
} from './validation';

const EMPTY_INDEX: ContentIndex = {
  schemaVersion: 1,
  generatedAt: '',
  entries: [],
};

export type FileJsonRepositoryOptions = {
  rootDirectory: string;
  now?: () => Date;
};

/**
 * Portable filesystem adapter used by migration tooling, tests, and JSON
 * backups. Production CMS writes use a separate D1 adapter behind the same
 * ContentRepository interface.
 */
export class FileJsonContentRepository implements ContentRepository {
  readonly #root: string;
  readonly #now: () => Date;
  #writeQueue: Promise<void> = Promise.resolve();

  constructor(options: FileJsonRepositoryOptions) {
    this.#root = path.resolve(options.rootDirectory);
    this.#now = options.now ?? (() => new Date());
  }

  async findById(id: string): Promise<Content | null> {
    assertSafeSegment(id, 'content ID');
    const record = await readJsonIfExists<ContentRecord>(this.#recordPath(id));
    if (!record) return null;

    const workingRevision = await this.#requiredRevision(
      id,
      record.workingRevisionId,
    );
    const publishedRevision = record.publishedRevisionId
      ? await this.#requiredRevision(id, record.publishedRevisionId)
      : undefined;
    const content = {
      record,
      workingRevision,
      ...(publishedRevision ? { publishedRevision } : {}),
    };
    assertContentAggregate(content);
    return content;
  }

  async findBySlug(type: ContentType, slug: string): Promise<Content | null> {
    const index = await this.#readOrRebuildIndex();
    const entry = index.entries.find(
      (item) => item.type === type && item.slug === slug,
    );
    return entry ? this.findById(entry.id) : null;
  }

  async search(query: SearchQuery): Promise<ContentSummary[]> {
    return searchIndex(await this.#readOrRebuildIndex(), query);
  }

  async save(content: Content): Promise<void> {
    return this.#withWriteLock(async () => {
      assertContentAggregate(content);
      const index = await this.#readOrRebuildIndex();
      const summary = summaryFromContent(content);
      if (
        summary.slug &&
        index.entries.some(
          (entry) =>
            entry.id !== summary.id &&
            entry.type === summary.type &&
            entry.slug === summary.slug,
        )
      ) {
        throw new RepositoryValidationError(
          `duplicate slug for ${summary.type}: ${summary.slug}`,
        );
      }

      await fs.mkdir(this.#revisionDirectory(content.record.id), {
        recursive: true,
      });
      await atomicWriteJson(
        this.#revisionPath(
          content.record.id,
          content.workingRevision.revisionId,
        ),
        content.workingRevision,
      );
      if (content.publishedRevision) {
        await atomicWriteJson(
          this.#revisionPath(
            content.record.id,
            content.publishedRevision.revisionId,
          ),
          content.publishedRevision,
        );
      }
      await atomicWriteJson(
        this.#recordPath(content.record.id),
        content.record,
      );

      const nextEntries = index.entries.filter(
        (entry) => entry.id !== summary.id,
      );
      nextEntries.push(summary);
      await this.#writeIndex(nextEntries);
    });
  }

  async remove(id: string): Promise<void> {
    return this.#withWriteLock(async () => {
      assertSafeSegment(id, 'content ID');
      const index = await this.#readOrRebuildIndex();
      await fs.rm(this.#recordPath(id), { force: true });
      await fs.rm(this.#revisionDirectory(id), {
        recursive: true,
        force: true,
      });
      await this.#writeIndex(index.entries.filter((entry) => entry.id !== id));
    });
  }

  /** Recreates the derived listing index from canonical records and revisions. */
  async rebuildIndex(): Promise<ContentIndex> {
    return this.#withWriteLock(() => this.#rebuildIndexUnlocked());
  }

  async #rebuildIndexUnlocked(): Promise<ContentIndex> {
    const recordsDirectory = path.join(this.#root, 'records');
    await fs.mkdir(recordsDirectory, { recursive: true });
    const files = (await fs.readdir(recordsDirectory)).filter((file) =>
      file.endsWith('.json'),
    );
    const entries: ContentSummary[] = [];
    for (const file of files) {
      const id = file.slice(0, -'.json'.length);
      const content = await this.findById(id);
      if (content) entries.push(summaryFromContent(content));
    }
    return this.#writeIndex(entries);
  }

  async #readOrRebuildIndex(): Promise<ContentIndex> {
    const index = await readJsonIfExists<ContentIndex>(this.#indexPath());
    if (!index || index.schemaVersion !== 1 || !Array.isArray(index.entries)) {
      return this.#rebuildIndexUnlocked();
    }
    return index;
  }

  async #writeIndex(entries: ContentSummary[]): Promise<ContentIndex> {
    const index: ContentIndex = {
      ...EMPTY_INDEX,
      generatedAt: this.#now().toISOString(),
      entries: entries.sort((left, right) => left.id.localeCompare(right.id)),
    };
    await atomicWriteJson(this.#indexPath(), index);
    return index;
  }

  async #requiredRevision(
    contentId: string,
    revisionId: string,
  ): Promise<Revision> {
    const revision = await readJsonIfExists<Revision>(
      this.#revisionPath(contentId, revisionId),
    );
    if (!revision) {
      throw new RepositoryValidationError(
        `missing revision ${revisionId} referenced by content ${contentId}`,
      );
    }
    return revision;
  }

  #recordPath(id: string): string {
    return path.join(this.#root, 'records', `${id}.json`);
  }

  #revisionDirectory(contentId: string): string {
    return path.join(this.#root, 'revisions', contentId);
  }

  #revisionPath(contentId: string, revisionId: string): string {
    assertSafeSegment(revisionId, 'revision ID');
    return path.join(this.#revisionDirectory(contentId), `${revisionId}.json`);
  }

  #indexPath(): string {
    return path.join(this.#root, 'indexes', 'content.json');
  }

  #withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.#writeQueue.then(operation, operation);
    this.#writeQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}

function assertSafeSegment(value: string, label: string): void {
  if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(value)) {
    throw new RepositoryValidationError(`invalid ${label}: ${value}`);
  }
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function atomicWriteJson(
  filePath: string,
  value: unknown,
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(
    temporaryPath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8',
  );
  await fs.rename(temporaryPath, filePath);
}
