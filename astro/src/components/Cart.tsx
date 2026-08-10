import { useEffect, useMemo, useState } from 'react';
import {
  BASKET_STORAGE_KEY,
  basketTotals,
  notifyBasketChanged,
  parseBasket,
  type BasketItem,
} from '@/lib/cart';

export default function Cart() {
  const [items, setItems] = useState<BasketItem[] | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const totals = useMemo(() => basketTotals(items ?? []), [items]);

  useEffect(() => {
    setItems(parseBasket(sessionStorage.getItem(BASKET_STORAGE_KEY)));
  }, []);

  const persist = (next: BasketItem[]) => {
    setItems(next);
    if (next.length > 0) sessionStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(BASKET_STORAGE_KEY);
    notifyBasketChanged();
  };

  const checkout = async () => {
    if (!items || items.length === 0 || purchasing) return;
    setPurchasing(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          items: items.map((item) => ({
            name: item.name,
            type: item.type,
            disc: item.disc,
            quantity: item.unit,
          })),
        }),
      });
      const body = (await response.json()) as { url?: string };
      if (!response.ok || !body.url) throw new Error('Checkout failed');
      window.location.href = body.url;
    } catch {
      window.location.href = '/pafshop/error/';
    }
  };

  if (items === null || purchasing) {
    return (
      <div className="flex h-32 items-center justify-center">
        お手続き中です。しばらくお待ちください。
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center">
        <div>
          <p>カートに商品がありません</p>
          <a href="/pafshop/" className="link-text mt-4 inline-flex">
            買い物を続ける
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={`${item.name}-${item.type}-${item.disc}`} className="border border-black p-3">
            <p className="font-bold">{item.title}</p>
            <p className="text-sm">
              {item.type} {item.disc}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span>¥{item.amount.toLocaleString()}</span>
              <select
                aria-label={`${item.title} ${item.type} ${item.disc}の数量`}
                value={item.unit}
                className="border border-black p-1"
                onChange={(event) => {
                  const unit = Number(event.target.value);
                  persist(
                    unit === 0
                      ? items.filter((_, i) => i !== index)
                      : items.map((candidate, i) =>
                          i === index ? { ...candidate, unit } : candidate,
                        ),
                  );
                }}
              >
                {Array.from({ length: 11 }, (_, unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-4">
        <div className="flex justify-between border-t px-2 py-1">
          <dt>商品合計</dt>
          <dd>￥{totals.subtotal.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between border-t px-2 py-1">
          <dt>送料</dt>
          <dd>￥{totals.shipping.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between border-y bg-gray-100 px-2 py-1 font-bold">
          <dt>合計</dt>
          <dd>￥{(totals.subtotal + totals.shipping).toLocaleString()}</dd>
        </div>
      </dl>
      <p className="mt-2 text-sm text-gray-500">
        ※価格には消費税が含まれています
        <br />
        ※1回のご注文ごとに送料300円が掛かります
        <br />
        <span className="text-purple-600">3,000円以上のお買い上げで送料無料！</span>
      </p>
      <button
        type="button"
        onClick={() => {
          void checkout();
        }}
        className="mt-8 border border-black bg-purple-600 px-6 py-4 text-purple-50 sm:hover:border-purple-600 sm:hover:bg-purple-100 sm:hover:text-purple-600"
      >
        注文する
      </button>
      <p className="mt-2 text-sm text-gray-500">※注文後、Stripe決済ページに移動します。</p>
      <a href="/pafshop/" className="link-text mt-4 inline-block">
        買い物を続ける
      </a>
    </div>
  );
}
