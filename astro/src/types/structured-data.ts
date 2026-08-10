export type JsonLdPrimitive = boolean | number | string | null;

export type JsonLdValue = JsonLdPrimitive | JsonLdObject | JsonLdValue[];

export interface JsonLdObject {
  [key: string]: JsonLdValue | undefined;
}
