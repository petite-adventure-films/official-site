export interface Database {
  prepare(sql: string): Statement;
}
interface Statement {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}
export type Draft = {
  id: string; version: number; type: 'event'; payloadSchemaVersion: string;
  payload: Record<string, unknown>; createdAt: string; updatedAt: string;
  createdBy: string; updatedBy: string;
};
type Row = {
  id: string; version: number; type: 'event'; payload_schema_version: string;
  payload: string; created_at: string; updated_at: string; created_by: string; updated_by: string;
};
export class DraftConflict extends Error {}
export class DraftNotFound extends Error {}

// Canonical JSON makes object-key ordering irrelevant to a request retry.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
async function fingerprint(value: unknown) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value)));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export class ContentDraftRepository {
  constructor(private db: Database) {}

  async list(page: number, keyword: string) {
    const fields = ['title', 'timeDescription', 'venue', 'address', 'access', 'venueNotes', 'fee', 'organizer', 'notes'];
    const where = fields.map((field) => `instr(lower(COALESCE(json_extract(payload, '$.${field}'), '')), lower(?)) > 0`).join(' OR ');
    const params = fields.map(() => keyword);
    const count = await this.db.prepare(`SELECT count(*) AS count FROM content_drafts WHERE ${where}`).bind(...params).first<{ count: number }>();
    const total = await this.db.prepare('SELECT count(*) AS count FROM content_drafts').first<{ count: number }>();
    const rows = await this.db.prepare(`SELECT id FROM content_drafts WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET ?`)
      .bind(...params, (page - 1) * 20).all<{ id: string }>();
    const items = await Promise.all(rows.results.map((row) => this.get(row.id)));
    return { items, page, pageSize: 20, count: count!.count, total: total!.count };
  }

  async get(id: string): Promise<Draft | null> {
    const row = await this.db.prepare('SELECT * FROM content_drafts WHERE id = ?').bind(id).first<Row>();
    return row ? {
      id: row.id, version: row.version, type: row.type, payloadSchemaVersion: row.payload_schema_version,
      payload: JSON.parse(row.payload), createdAt: row.created_at, updatedAt: row.updated_at,
      createdBy: row.created_by, updatedBy: row.updated_by,
    } : null;
  }

  private async replay(actor: string, operationId: string, hash: string): Promise<Draft | null> {
    const operation = await this.db.prepare('SELECT fingerprint, response FROM draft_operations WHERE actor_id = ? AND operation_id = ?')
      .bind(actor, operationId).first<{ fingerprint: string; response: string }>();
    if (!operation) return null;
    if (operation.fingerprint !== hash) throw new DraftConflict('operation_id_reused');
    return JSON.parse(operation.response);
  }

  async save(input: {
    actor: string; operationId: string; payload: Record<string, unknown>;
    target?: { id: string; expectedVersion: number };
  }): Promise<Draft> {
    const { actor, operationId, payload, target } = input;
    const kind = target ? 'update' : 'create';
    const hash = await fingerprint({ kind, payload, target: target ?? null });
    const prior = await this.replay(actor, operationId, hash);
    if (prior) return prior;
    const current = target ? await this.get(target.id) : null;
    if (target && !current) throw new DraftNotFound();
    if (target && current!.version !== target.expectedVersion) throw new DraftConflict('draft_version_conflict');
    const now = new Date().toISOString();
    const response: Draft = {
      id: current?.id ?? crypto.randomUUID(), version: (current?.version ?? 0) + 1,
      type: 'event', payloadSchemaVersion: current?.payloadSchemaVersion ?? 'event-draft/v1',
      payload, createdAt: current?.createdAt ?? now, updatedAt: now,
      createdBy: current?.createdBy ?? actor, updatedBy: actor,
    };
    try {
      await this.db.prepare(`INSERT INTO draft_operations
        (actor_id, operation_id, fingerprint, kind, content_id, expected_version, response, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        actor, operationId, hash, kind, response.id, target?.expectedVersion ?? null, JSON.stringify(response), now,
      ).run();
      return response;
    } catch (error) {
      // A concurrent copy of the same request may have committed first.
      const replay = await this.replay(actor, operationId, hash);
      if (replay) return replay;
      if (target) {
        const latest = await this.get(target.id);
        if (!latest) throw new DraftNotFound();
        if (latest.version !== target.expectedVersion) throw new DraftConflict('draft_version_conflict');
      }
      throw error;
    }
  }
}
