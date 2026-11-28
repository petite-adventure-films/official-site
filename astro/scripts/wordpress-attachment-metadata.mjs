// Parse PHP's scalar/array serialization only. Never instantiate objects or resolve references.
export function parseAttachmentMetadata(serialized) {
  if (
    typeof serialized !== 'string' ||
    Buffer.byteLength(serialized) > 2_000_000
  )
    throw Error('invalid_metadata');
  const bytes = Buffer.from(serialized),
    decoder = new TextDecoder('utf-8', { fatal: true });
  let offset = 0,
    nodes = 0;
  const take = (token) => {
    if (bytes.subarray(offset, offset + token.length).toString() !== token)
      throw Error('invalid_metadata');
    offset += token.length;
  };
  const numberUntil = (delimiter) => {
    const end = bytes.indexOf(delimiter, offset);
    if (end < 0) throw Error('invalid_metadata');
    const value = bytes.subarray(offset, end).toString();
    offset = end + delimiter.length;
    return value;
  };
  const integer = (text) => {
    if (!/^-?(0|[1-9]\d*)$/.test(text) || !Number.isSafeInteger(Number(text)))
      throw Error('invalid_metadata');
    return Number(text);
  };
  function parse(depth = 0) {
    if (depth > 30 || ++nodes > 100000) throw Error('metadata_limit');
    const type = String.fromCharCode(bytes[offset++]);
    if (type === 'N') {
      take(';');
      return null;
    }
    take(':');
    if (type === 'i') return integer(numberUntil(';'));
    if (type === 'b') {
      const v = numberUntil(';');
      if (!['0', '1'].includes(v)) throw Error('invalid_metadata');
      return v === '1';
    }
    if (type === 'd') {
      const v = numberUntil(';');
      if (
        !/^-?\d+(?:\.\d+)?(?:[Ee][+-]?\d+)?$/.test(v) ||
        !Number.isFinite(Number(v))
      )
        throw Error('invalid_metadata');
      return Number(v);
    }
    if (type === 's') {
      const size = integer(numberUntil(':'));
      if (size < 0 || offset + size + 3 > bytes.length)
        throw Error('invalid_metadata');
      take('"');
      const value = decoder.decode(bytes.subarray(offset, offset + size));
      offset += size;
      take('";');
      return value;
    }
    if (type === 'a') {
      const size = integer(numberUntil(':'));
      if (size < 0 || size > 50000) throw Error('metadata_limit');
      take('{');
      const result = Object.create(null);
      for (let i = 0; i < size; i++) {
        const key = parse(depth + 1);
        if (
          !['string', 'number'].includes(typeof key) ||
          Object.hasOwn(result, key)
        )
          throw Error('invalid_metadata_key');
        result[key] = parse(depth + 1);
      }
      take('}');
      return result;
    }
    throw Error('unsupported_metadata_type');
  }
  const value = parse();
  if (offset !== bytes.length) throw Error('metadata_trailing_bytes');
  return value;
}
