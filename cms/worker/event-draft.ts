import Ajv from 'ajv/dist/2020';
import schema from '../../packages/content-schema/schemas/content/event-draft.schema.json';
export const validateDraft = new Ajv({ allErrors: true }).compile(schema);
