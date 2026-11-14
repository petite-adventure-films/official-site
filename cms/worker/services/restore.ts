import Ajv from 'ajv/dist/2020';
import publicationSchema from '../../../packages/content-schema/schemas/content/event-publication.schema.json';
import { emptyDraft, type EventDraft } from '../../src/features/events/draft';
import { validateDraft } from '../event-draft';
import type { EventPublication } from '../event-publication';
import { ContentDraftRepository, DraftConflict, DraftNotFound, type Database, type Draft } from '../repositories/content-drafts';

const validatePublication = new Ajv({ allErrors: true }).compile(publicationSchema);
export class RestoreInvalid extends Error {}
type SourceKind = 'publication' | 'protectedDraft';
type Input = { actor: string; actorName?: string; operationId: string; contentId: string; expectedVersion: number; sourceKind: SourceKind; sourceId: string };
export type HistoryItem = { kind: SourceKind; id: string; payloadSchemaVersion: string; payload: unknown; at: string; actor: string; actorName: string | null };

export function restorePayload(source: HistoryItem): EventDraft {
  if (source.kind === 'protectedDraft') {
    if (source.payloadSchemaVersion !== 'event-draft/v1' || !validateDraft(source.payload)) throw new RestoreInvalid('unsupported_snapshot');
    return source.payload as EventDraft;
  }
  if (source.payloadSchemaVersion !== 'event-publication/v1' || !validatePublication(source.payload)) throw new RestoreInvalid('unsupported_snapshot');
  const { type: _type, payloadSchemaVersion: _schema, ...published } = source.payload as EventPublication;
  // Only published fields are restored; hidden draft values were never in this history.
  const result = { ...emptyDraft(), ...published, multiDay: published.endDate !== undefined };
  if (!validateDraft(result)) throw new RestoreInvalid('unsupported_snapshot');
  return result;
}

/** Draft restoration shared by the authenticated history API; never dispatches a deployment. */
export class RestoreService {
  constructor(private db: Database) {}
  async history(contentId: string): Promise<HistoryItem[]> {
    if (!await new ContentDraftRepository(this.db).get(contentId)) throw new DraftNotFound();
    const rows = await this.db.prepare(`SELECT 'protectedDraft' AS kind, id, payload_schema_version AS schema,
        payload, protected_at AS at, protected_by AS actor, protected_name AS actor_name, 0 AS group_order, 0 AS version
      FROM protected_drafts WHERE content_id = ?
      UNION ALL SELECT 'publication', id, json_extract(payload, '$.payloadSchemaVersion'), payload,
        published_at, published_by, published_name, 1, version FROM publication_revisions WHERE content_id = ?
      ORDER BY group_order, version DESC`).bind(contentId, contentId)
      .all<{ kind: SourceKind; id: string; schema: string; payload: string; at: string; actor: string; actor_name: string | null }>();
    return rows.results.map(row => ({ kind: row.kind, id: row.id, payloadSchemaVersion: row.schema,
      payload: JSON.parse(row.payload), at: row.at, actor: row.actor, actorName: row.actor_name }));
  }
  async restore(input: Input): Promise<Draft> {
    const fingerprint = JSON.stringify(['restore', input.contentId, input.expectedVersion, input.sourceKind, input.sourceId]);
    const replay = async () => {
      const prior = await this.db.prepare('SELECT fingerprint, response FROM restore_operations WHERE actor_id = ? AND operation_id = ?')
        .bind(input.actor, input.operationId).first<{ fingerprint: string; response: string }>();
      if (prior && prior.fingerprint !== fingerprint) throw new DraftConflict('operation_id_reused');
      return prior ? JSON.parse(prior.response) as Draft : null;
    };
    const prior = await replay();
    if (prior) return prior;
    const repository = new ContentDraftRepository(this.db);
    const current = await repository.get(input.contentId);
    if (!current) throw new DraftNotFound();
    if (current.version !== input.expectedVersion) throw new DraftConflict('draft_version_conflict');
    if (current.payloadSchemaVersion !== 'event-draft/v1') throw new RestoreInvalid('unsupported_snapshot');
    const source = (await this.history(input.contentId)).find(item => item.kind === input.sourceKind && item.id === input.sourceId);
    if (!source) throw new DraftNotFound();
    const payload = restorePayload(source);
    const now = new Date().toISOString();
    const response: Draft = { ...current, payload, version: current.version + 1, updatedAt: now, updatedBy: input.actor };
    try {
      await this.db.prepare(`INSERT INTO restore_operations (actor_id, operation_id, fingerprint, content_id, expected_version,
        source_kind, source_id, protection_id, response, created_at, actor_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        input.actor, input.operationId, fingerprint, input.contentId, input.expectedVersion,
        input.sourceKind, input.sourceId, crypto.randomUUID(), JSON.stringify(response), now, input.actorName ?? null,
      ).run();
      return response;
    } catch (error) {
      const prior = await replay();
      if (prior) return prior;
      const latest = await repository.get(input.contentId);
      if (!latest) throw new DraftNotFound();
      if (latest.version !== input.expectedVersion) throw new DraftConflict('draft_version_conflict');
      if (!(await this.history(input.contentId)).some(item => item.kind === input.sourceKind && item.id === input.sourceId)) throw new DraftNotFound();
      throw error;
    }
  }
}
