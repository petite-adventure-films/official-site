// 決済時にブラウザから送られた価格を信用せず、サーバー側でも同じ商品マスターを参照する。
import { PRODUCTS_DVD } from '../constants/products_dvd.js';

export type CheckoutItem = {
  name: string;
  title: string;
  type: string;
  disc: 'DVD' | 'ブルーレイ';
  quantity: number;
  unitAmount: number;
};

export type CheckoutOrder = {
  requestId: string;
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
};

export type CheckoutPayloadResult =
  { success: true; data: CheckoutOrder } | { success: false; error: string };

const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseCheckoutPayload(value: unknown): CheckoutPayloadResult {
  if (!isRecord(value) || typeof value.requestId !== 'string') {
    return { success: false, error: 'Invalid checkout request' };
  }
  if (!REQUEST_ID_PATTERN.test(value.requestId)) {
    return { success: false, error: 'Invalid request ID' };
  }
  if (!Array.isArray(value.items) || value.items.length === 0 || value.items.length > 20) {
    return { success: false, error: 'Invalid checkout items' };
  }

  const items: CheckoutItem[] = [];
  const itemKeys = new Set<string>();

  for (const candidate of value.items) {
    if (
      !isRecord(candidate) ||
      typeof candidate.name !== 'string' ||
      typeof candidate.type !== 'string' ||
      (candidate.disc !== 'DVD' && candidate.disc !== 'ブルーレイ') ||
      !Number.isInteger(candidate.quantity) ||
      (candidate.quantity as number) < 1 ||
      (candidate.quantity as number) > 10
    ) {
      return { success: false, error: 'Invalid checkout item' };
    }

    const disc = candidate.disc;
    const product = PRODUCTS_DVD.find((entry) => entry.name === candidate.name);
    const price = product?.prices.find(
      (entry) => entry.type === candidate.type && entry.disc.includes(disc),
    );
    if (!product || !price) {
      return { success: false, error: 'Unknown checkout item' };
    }

    const key = `${candidate.name}\u0000${candidate.type}\u0000${disc}`;
    if (itemKeys.has(key)) {
      return { success: false, error: 'Duplicate checkout item' };
    }
    itemKeys.add(key);

    items.push({
      name: product.name,
      title: product.title,
      type: price.type,
      disc,
      quantity: candidate.quantity as number,
      unitAmount: price.amount,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  return {
    success: true,
    data: {
      requestId: value.requestId,
      items,
      subtotal,
      shipping: subtotal >= 3000 ? 0 : 300,
    },
  };
}
