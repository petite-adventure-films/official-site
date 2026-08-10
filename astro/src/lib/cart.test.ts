import { describe, expect, it } from 'vitest';
import { basketTotals, mergeBasket, parseBasket, type BasketItem } from './cart';

const item = (overrides: Partial<BasketItem> = {}): BasketItem => ({
  name: 'film',
  title: '映画',
  type: '一般',
  amount: 1500,
  disc: 'DVD',
  unit: 1,
  ...overrides,
});

describe('cart domain logic', () => {
  it('adds a selected product and ignores zero quantities', () => {
    expect(mergeBasket([], [item(), item({ type: '団体', unit: 0 })])).toEqual([item()]);
  });

  it('replaces the quantity of the same product variant', () => {
    expect(mergeBasket([item()], [item({ unit: 3 })])).toEqual([item({ unit: 3 })]);
  });

  it('charges shipping below 3000 yen and makes it free at the boundary', () => {
    expect(basketTotals([item()])).toEqual({ subtotal: 1500, shipping: 300 });
    expect(basketTotals([item({ unit: 2 })])).toEqual({ subtotal: 3000, shipping: 0 });
  });

  it('recovers from invalid session storage and rejects malformed items', () => {
    expect(parseBasket('{')).toEqual([]);
    expect(parseBasket(JSON.stringify([item(), item({ unit: 11 }), { title: '不正' }]))).toEqual([
      item(),
    ]);
  });
});
