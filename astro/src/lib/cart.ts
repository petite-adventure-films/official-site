export type BasketItem = {
  name: string;
  title: string;
  type: string;
  amount: number;
  disc: string;
  unit: number;
};

export const BASKET_STORAGE_KEY = 'basket';
export const BASKET_CHANGED_EVENT = 'paf:basket-changed';

function isBasketItem(value: unknown): value is BasketItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.name === 'string' &&
    typeof item.title === 'string' &&
    typeof item.type === 'string' &&
    typeof item.amount === 'number' &&
    Number.isFinite(item.amount) &&
    typeof item.disc === 'string' &&
    Number.isInteger(item.unit) &&
    (item.unit as number) > 0 &&
    (item.unit as number) <= 10
  );
}

export function parseBasket(value: string | null): BasketItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isBasketItem) : [];
  } catch {
    return [];
  }
}

export function mergeBasket(current: BasketItem[], additions: BasketItem[]): BasketItem[] {
  const next = [...current];
  for (const item of additions.filter((candidate) => candidate.unit > 0)) {
    const index = next.findIndex(
      (candidate) =>
        candidate.name === item.name &&
        candidate.type === item.type &&
        candidate.disc === item.disc,
    );
    if (index >= 0) next[index] = item;
    else next.push(item);
  }
  return next;
}

export function basketTotals(items: BasketItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.amount * item.unit, 0);
  return { subtotal, shipping: subtotal >= 3000 || subtotal === 0 ? 0 : 300 };
}

export function notifyBasketChanged() {
  window.dispatchEvent(new Event(BASKET_CHANGED_EVENT));
}
