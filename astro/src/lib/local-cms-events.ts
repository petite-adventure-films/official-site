import { readFile } from 'node:fs/promises';
import legacy from '../../data/wordpress-export.json';
import { parseCmsEvents } from './cms-events';
export async function loadLocalCmsEvents(development: boolean, file?: string) {
  if (!file) return [];
  if (!development)
    throw new Error(
      'CMS_EVENT_SNAPSHOT is local-development only; remove it before building the public site.',
    );
  return parseCmsEvents(JSON.parse(await readFile(file, 'utf8')), legacy.content.events);
}
