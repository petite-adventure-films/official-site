import type { EventPublication } from './event-publication';
export type CmsEventRecord = { id: string; publishedAt: string; payload: EventPublication };
export type CmsEventTag = { id: string; name: string };
export type CmsEventSnapshot = {
  schemaVersion: 'cms-events/v1';
  events: CmsEventRecord[];
  filmTags: CmsEventTag[];
  eventTags: CmsEventTag[];
};
