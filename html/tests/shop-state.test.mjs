import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { beforeEach, test } from 'node:test';

// Resolve Nuxt's source alias while testing the real cart operations in Node.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('~/')) {
      return nextResolve(
        new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});
const { deleteItem, update } =
  await import('../src/composables/use-shop-state.ts');

beforeEach(() => {
  const values = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
});
const dvd = {
  name: 'goodbye_ur',
  title: 'さようならUR',
  type: '個人用',
  disc: 'DVD',
  amount: 2000,
  unit: 1,
};

test('deleting a missing item preserves all products and saved cart', () => {
  const basket = {
    value: [{ ...dvd }, { ...dvd, name: 'other', title: '別の商品' }],
  };
  const before = JSON.stringify(basket.value);
  sessionStorage.setItem('basket', before);
  deleteItem(basket)({ ...dvd, disc: '存在しないディスク' });
  assert.equal(JSON.stringify(basket.value), before);
  assert.equal(sessionStorage.getItem('basket'), before);
});

test('quantity updates preserve other variants and deletion removes only its target', () => {
  const basket = {
    value: [{ ...dvd }, { ...dvd, type: '団体用', amount: 10000 }],
  };
  update(basket)([{ ...dvd, unit: 3 }]);
  assert.deepEqual(
    basket.value.map(({ unit }) => unit),
    [3, 1],
  );
  deleteItem(basket)({ ...dvd });
  assert.deepEqual(basket.value, [{ ...dvd, type: '団体用', amount: 10000 }]);
  assert.deepEqual(JSON.parse(sessionStorage.getItem('basket')), basket.value);
});
