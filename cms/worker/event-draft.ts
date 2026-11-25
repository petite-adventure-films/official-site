import { eventTextFields, validEventText } from '../../packages/content-schema/event-text';
import type { EventDraft } from '../src/features/events/draft';
import eventTextSchema from '../../packages/content-schema/schemas/content/event-text.schema.json';
import Ajv from 'ajv/dist/2020';
import schema from '../../packages/content-schema/schemas/content/event-draft.schema.json';
const validate = new Ajv({ allErrors: true }).addSchema(eventTextSchema).compile(schema);

export function validateDraft(value: unknown): value is EventDraft {
  function bounded(v: unknown, depth = 0): boolean {
    return depth <= 80 && (!v || typeof v !== 'object' || Object.values(v).every(child => bounded(child, depth + 1)));
  }
  return bounded(value) && Boolean(validate(value)) && eventTextFields.every(field => validEventText((value as EventDraft)[field]));
}
