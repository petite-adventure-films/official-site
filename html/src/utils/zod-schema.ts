import type { TypedSchema } from 'vee-validate';
import type { ZodType, input, output } from 'zod';

// VeeValidate 4's published Zod adapter requires Zod 3. These forms use
// object/scalar schemas without defaults or transforms; preserve field errors
// while validating with the patched Zod 4 implementation.
export function toTypedSchema<T extends ZodType>(
  schema: T,
): TypedSchema<input<T>, output<T>> {
  return {
    __type: 'VVTypedSchema',
    async parse(value) {
      const result = await schema.safeParseAsync(value);
      if (result.success) return { value: result.data, errors: [] };
      const errors = new Map<string, string[]>();
      for (const issue of result.error.issues) {
        const path = issue.path.reduce<string>(
          (path, part) =>
            typeof part === 'number'
              ? `${path}[${part}]`
              : path
                ? `${path}.${String(part)}`
                : String(part),
          '',
        );
        errors.set(path, [...(errors.get(path) ?? []), issue.message]);
      }
      return {
        errors: [...errors].map(([path, errors]) => ({ path, errors })),
      };
    },
  };
}
