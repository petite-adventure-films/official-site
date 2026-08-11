import fs from 'node:fs';
import path from 'node:path';

import type { AnySchema, ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve(import.meta.dirname, '../../..');
const schemaRoot = path.join(repositoryRoot, 'packages/content-schema');

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8'));
}

function jsonFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith('.json') ? [entryPath] : [];
  });
}

function createAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
  ajv.addFormat(
    'date-time',
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
  );
  ajv.addFormat('uri', (value: string) => {
    try {
      const url = new URL(value);
      return Boolean(url.protocol && url.host);
    } catch {
      return false;
    }
  });
  ajv.addFormat('uri-reference', (value: string) => !/[\s]/.test(value));

  for (const schemaFile of jsonFiles(path.join(schemaRoot, 'schemas'))) {
    ajv.addSchema(JSON.parse(fs.readFileSync(schemaFile, 'utf8')) as AnySchema);
  }
  return ajv;
}

function validator(ajv: Ajv2020, schemaId: string): ValidateFunction {
  const validate = ajv.getSchema(schemaId);
  if (!validate) throw new Error(`Schema not registered: ${schemaId}`);
  return validate;
}

function expectValid(validate: ValidateFunction, value: unknown, label: string) {
  expect(validate(value), `${label}: ${JSON.stringify(validate.errors)}`).toBe(true);
}

describe('CMS content payload schemas', () => {
  it('accepts one sample for every content type', () => {
    const ajv = createAjv();
    const validate = validator(ajv, 'https://www.petiteadventurefilms.com/schemas/content/v1');
    const sampleFiles = jsonFiles(path.join(schemaRoot, 'samples/content'));

    expect(sampleFiles).toHaveLength(10);
    for (const sampleFile of sampleFiles) {
      expectValid(
        validate,
        JSON.parse(fs.readFileSync(sampleFile, 'utf8')),
        path.basename(sampleFile),
      );
    }
  });

  it('stores Tiptap JSON and rejects legacy HTML fields', () => {
    const ajv = createAjv();
    const validate = validator(ajv, 'https://www.petiteadventurefilms.com/schemas/content/v1');
    const sample = readJson('packages/content-schema/samples/content/blog.json') as Record<
      string,
      unknown
    >;
    sample.bodyHtml = '<p>Legacy HTML must not become the CMS source of truth.</p>';

    expect(validate(sample)).toBe(false);
    expect(validate.errors?.map((error) => error.keyword)).toContain('unevaluatedProperties');
  });

  it('requires assetImage nodes to reference an asset ID instead of a URL', () => {
    const ajv = createAjv();
    const validate = validator(ajv, 'https://www.petiteadventurefilms.com/schemas/rich-text/v1');
    const invalidDocument = {
      schemaVersion: 1,
      doc: {
        type: 'doc',
        content: [
          {
            type: 'assetImage',
            attrs: { src: 'https://example.com/image.jpg', alt: 'Example', caption: null },
          },
        ],
      },
    };

    expect(validate(invalidDocument)).toBe(false);
  });

  it('does not carry WordPress-only or renderer-only fields in payloads', () => {
    const ajv = createAjv();
    const validateFilm = validator(
      ajv,
      'https://www.petiteadventurefilms.com/schemas/content/film/v1',
    );
    const validateProduct = validator(
      ajv,
      'https://www.petiteadventurefilms.com/schemas/content/product/v1',
    );
    const film = readJson('packages/content-schema/samples/content/film.json') as Record<
      string,
      unknown
    >;
    const product = readJson('packages/content-schema/samples/content/product.json') as Record<
      string,
      unknown
    >;
    film.legacyId = 1596;
    film.productId = 'product_goodbye_ur';
    product.articleTemplateId = 'shoparticle_goodbye_ur';

    expect(validateFilm(film)).toBe(false);
    expect(validateProduct(product)).toBe(false);
  });
});

describe('asset schema', () => {
  it('accepts image and document assets', () => {
    const ajv = createAjv();
    const validate = validator(ajv, 'https://www.petiteadventurefilms.com/schemas/asset/v1');

    for (const sampleFile of jsonFiles(path.join(schemaRoot, 'samples/assets'))) {
      expectValid(
        validate,
        JSON.parse(fs.readFileSync(sampleFile, 'utf8')),
        path.basename(sampleFile),
      );
    }
  });

  it('limits the initial display rendition to WebP at 960px or smaller', () => {
    const ajv = createAjv();
    const validate = validator(ajv, 'https://www.petiteadventurefilms.com/schemas/asset/v1');
    const sample = readJson('packages/content-schema/samples/assets/image.json') as {
      renditions: { format: string; width: number }[];
    };
    sample.renditions[0].format = 'avif';
    sample.renditions[0].width = 1600;

    expect(validate(sample)).toBe(false);
    expect(validate.errors?.map((error) => error.keyword)).toEqual(
      expect.arrayContaining(['const', 'maximum']),
    );
  });
});

describe('CMS records, revisions, and published snapshots', () => {
  it('validates the separated event record and revision', () => {
    const ajv = createAjv();
    const validateRecord = validator(
      ajv,
      'https://www.petiteadventurefilms.com/schemas/content-record/v1',
    );
    const validateRevision = validator(
      ajv,
      'https://www.petiteadventurefilms.com/schemas/revision/v1',
    );
    const record = readJson('packages/content-schema/samples/envelopes/event-record.json');
    const revision = readJson('packages/content-schema/samples/envelopes/event-revision.json') as {
      contentId: string;
      payload: { type: string };
    };

    expectValid(validateRecord, record, 'event-record.json');
    expectValid(validateRevision, revision, 'event-revision.json');
    expect(record).toEqual(
      expect.objectContaining({ id: revision.contentId, type: revision.payload.type }),
    );
  });

  it('requires a system-assigned event number only after publication', () => {
    const ajv = createAjv();
    const validate = validator(
      ajv,
      'https://www.petiteadventurefilms.com/schemas/content-record/v1',
    );
    const published = readJson(
      'packages/content-schema/samples/envelopes/event-record.json',
    ) as Record<string, unknown>;
    delete published.eventNumber;
    expect(validate(published)).toBe(false);

    const draft = structuredClone(published);
    draft.publication = { state: 'draft' };
    delete draft.publishedRevisionId;
    expectValid(validate, draft, 'unpublished event without an event number');
  });

  it('rejects event numbers on non-event records', () => {
    const ajv = createAjv();
    const validate = validator(
      ajv,
      'https://www.petiteadventurefilms.com/schemas/content-record/v1',
    );
    const record = readJson(
      'packages/content-schema/samples/envelopes/event-record.json',
    ) as Record<string, unknown>;
    record.type = 'blog';

    expect(validate(record)).toBe(false);
  });

  it('validates a published snapshot with event number and asset manifest', () => {
    const ajv = createAjv();
    const validate = validator(ajv, 'https://www.petiteadventurefilms.com/schemas/snapshot/v1');
    const revision = readJson('packages/content-schema/samples/envelopes/event-revision.json') as {
      revisionId: string;
      contentId: string;
      payload: unknown;
    };
    const asset = readJson('packages/content-schema/samples/assets/document.json');
    const snapshot = {
      schemaVersion: 1,
      snapshotId: 'snapshot_20260811_190000',
      createdAt: '2026-08-11T19:00:00+09:00',
      sourceRevisionIds: [revision.revisionId],
      records: [
        {
          id: revision.contentId,
          revisionId: revision.revisionId,
          publishedAt: '2026-04-01T00:00:00+09:00',
          eventNumber: 230,
          payload: revision.payload,
        },
      ],
      assets: [asset],
    };

    expectValid(validate, snapshot, 'published snapshot');
  });

  it('validates migration source references separately from content', () => {
    const ajv = createAjv();
    const validate = validator(
      ajv,
      'https://www.petiteadventurefilms.com/schemas/source-reference/v1',
    );
    expectValid(
      validate,
      readJson('packages/content-schema/samples/envelopes/source-reference.json'),
      'source-reference.json',
    );
  });
});

describe('WordPress film tag mapping', () => {
  it('maps every exported film tag exactly once to one of the nine film IDs', () => {
    const snapshot = readJson('astro/data/wordpress-export.json') as {
      taxonomies: { filmTags: { term_id: number; name: string }[] };
    };
    const mappingFile = readJson('packages/content-schema/mappings/wordpress-film-tags.json') as {
      mappings: { legacyTermId: number; legacyName: string; filmId: string }[];
    };
    const expectedFilmIds = new Set([
      'film_atarashikimura',
      'film_my_indian_diary',
      'film_four_years_on',
      'film_apprentice_homeless',
      'film_dancing_zempukuji',
      'film_a_woman_from_fukushima',
      'film_otome_house',
      'film_goodbye_ur',
      'film_brian_and_co',
    ]);

    expect(mappingFile.mappings).toHaveLength(9);
    expect(new Set(mappingFile.mappings.map((entry) => entry.legacyTermId)).size).toBe(9);
    expect(new Set(mappingFile.mappings.map((entry) => entry.filmId))).toEqual(expectedFilmIds);
    expect(
      mappingFile.mappings.map(({ legacyTermId, legacyName }) => ({
        term_id: legacyTermId,
        name: legacyName,
      })),
    ).toEqual(snapshot.taxonomies.filmTags.map(({ term_id, name }) => ({ term_id, name })));
  });
});
