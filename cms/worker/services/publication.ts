import { ContentDraftRepository, DraftConflict, DraftNotFound, type Database } from '../repositories/content-drafts';
import { prepareEventPublication, type EventPublication, type PublicationIssue } from '../event-publication';
import { tags } from '../routes/tags';

export class PublicationInvalid extends Error {
  constructor(readonly issues: PublicationIssue[]) { super('invalid_publication'); }
}
export class PublicationConflict extends Error {}
type Input = { actor: string; operationId: string; contentId: string; expectedVersion: number; expectedPublicationVersion: number };
type Operation = {
  id: string; actor_id: string; operation_id: string; fingerprint: string; content_id: string;
  draft_version: number; expected_publication_version: number; payload: string | null;
  content_hash: string; state: 'ready' | 'delivering' | 'unknown' | 'failed' | 'succeeded' | 'noop';
  attempt: number; revision_id: string | null; receipt: string | null; completed_at: string | null;
};
export type Delivery = { operationId: string; attempt: number; contentId: string; hash: string; payload: EventPublication };
export type DeliveryResult = { status: 'unknown' } | {
  status: 'succeeded' | 'failed'; operationId: string; attempt: number; hash: string; receipt: string;
};
// A confirmed failure means that attempt has stopped and cannot activate later.
// inspect must identify the exact attempt; it must never dispatch another deploy.
export interface PublicationDelivery {
  deploy(delivery: Delivery): Promise<DeliveryResult>;
  inspect(delivery: Delivery): Promise<DeliveryResult>;
}
async function hash(value: unknown) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Internal service only. Provider, release manifest, URL ownership and API wiring remain separate. */
export class PublicationService {
  constructor(private db: Database) {}
  async get(id: string) {
    const row = await this.db.prepare('SELECT * FROM publication_operations WHERE id = ?').bind(id).first<Operation>();
    if (!row) throw new DraftNotFound();
    return row;
  }
  async current(contentId: string) {
    return this.db.prepare('SELECT * FROM publication_state WHERE content_id = ?').bind(contentId)
      .first<{ content_id: string; version: number; revision_id: string; content_hash: string }>();
  }
  async history(contentId: string) {
    return (await this.db.prepare('SELECT * FROM publication_revisions WHERE content_id = ? ORDER BY version DESC').bind(contentId)
      .all<{ id: string; version: number; payload: string; published_at: string; published_by: string }>()).results;
  }
  async prepare(input: Input): Promise<Operation> {
    const fingerprint = await hash([input.contentId, input.expectedVersion, input.expectedPublicationVersion]);
    const replay = async () => {
      const prior = await this.db.prepare('SELECT * FROM publication_operations WHERE actor_id = ? AND operation_id = ?')
        .bind(input.actor, input.operationId).first<Operation>();
      if (prior && prior.fingerprint !== fingerprint) throw new PublicationConflict('operation_id_reused');
      return prior;
    };
    const prior = await replay();
    if (prior) return prior;
    const draft = await new ContentDraftRepository(this.db).get(input.contentId);
    if (!draft) throw new DraftNotFound();
    if (draft.version !== input.expectedVersion) throw new DraftConflict();
    const current = await this.current(input.contentId);
    if ((current?.version ?? 0) !== input.expectedPublicationVersion) throw new PublicationConflict('publication_version_conflict');
    const available = await tags(this.db);
    const candidate = prepareEventPublication(draft.payload, { contentId: draft.id,
      filmTagIds: new Set(available.filmTags.map(tag => tag.id)), eventTagIds: new Set(available.eventTags.map(tag => tag.id)) });
    if (!candidate.ok) throw new PublicationInvalid(candidate.issues);
    const contentHash = await hash(candidate.payload);
    const noop = current?.content_hash === contentHash;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    try {
      await this.db.prepare(`INSERT INTO publication_operations
        (id, actor_id, operation_id, fingerprint, content_id, draft_version, expected_publication_version,
         payload, draft_snapshot, content_hash, state, revision_id, created_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        id, input.actor, input.operationId, fingerprint, draft.id, draft.version, input.expectedPublicationVersion,
        noop ? null : JSON.stringify(candidate.payload), noop ? null : JSON.stringify(draft.payload), contentHash,
        noop ? 'noop' : 'ready', noop ? current.revision_id : null, now, noop ? now : null,
      ).run();
    } catch (error) {
      const prior = await replay();
      if (prior) return prior;
      throw error;
    }
    return this.get(id);
  }
  private delivery(operation: Operation): Delivery {
    return { operationId: operation.id, attempt: operation.attempt, contentId: operation.content_id,
      hash: operation.content_hash, payload: JSON.parse(operation.payload!) };
  }
  private async settle(operation: Operation, result: DeliveryResult) {
    if (result.status !== 'unknown' && (result.operationId !== operation.id || result.attempt !== operation.attempt ||
      result.hash !== operation.content_hash || !result.receipt)) throw new PublicationConflict('confirmation_mismatch');
    const success = result.status === 'succeeded';
    await this.db.prepare(`UPDATE publication_operations SET state = ?, receipt = ?, revision_id = ?, completed_at = ?,
        payload = CASE WHEN ? THEN NULL ELSE payload END, draft_snapshot = CASE WHEN ? THEN NULL ELSE draft_snapshot END
      WHERE id = ? AND attempt = ? AND state IN ('delivering', 'unknown')`).bind(
      result.status, result.status === 'unknown' ? null : result.receipt, success ? crypto.randomUUID() : null,
      result.status === 'unknown' ? null : new Date().toISOString(), success, success, operation.id, operation.attempt,
    ).run();
    return this.get(operation.id);
  }
  async deliver(id: string, adapter: PublicationDelivery) {
    // Atomic claim prevents two callers dispatching the same attempt.
    const operation = await this.db.prepare(`UPDATE publication_operations SET state = 'delivering', attempt = attempt + 1
      WHERE id = ? AND state = 'ready' RETURNING *`).bind(id).first<Operation>();
    if (!operation) return this.get(id);
    let result: DeliveryResult;
    try { result = await adapter.deploy(this.delivery(operation)); }
    catch { result = { status: 'unknown' }; }
    // Do not catch DB finalization errors as deployment failures.
    return this.settle(operation, result);
  }
  async reconcile(id: string, adapter: PublicationDelivery) {
    const operation = await this.get(id);
    if (operation.state !== 'unknown' && operation.state !== 'delivering') return operation;
    let result: DeliveryResult;
    try { result = await adapter.inspect(this.delivery(operation)); }
    catch { result = { status: 'unknown' }; }
    return this.settle(operation, result);
  }
  async retry(id: string) {
    // A known terminal failure may retry its fixed snapshot only while its base is still current.
    await this.db.prepare(`UPDATE publication_operations SET state = 'ready', receipt = NULL, completed_at = NULL
      WHERE id = ? AND state = 'failed' AND expected_publication_version =
        COALESCE((SELECT version FROM publication_state WHERE content_id = publication_operations.content_id), 0)`).bind(id).run();
    return this.get(id);
  }
}
