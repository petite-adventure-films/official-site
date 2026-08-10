import { useMemo, useState } from 'react';
import Modal from './Modal';
import { BASKET_STORAGE_KEY, mergeBasket, notifyBasketChanged, parseBasket } from '@/lib/cart';

type Price = { type: string; disc: string[]; amount: number };

interface Props {
  product: { name: string; title: string; prices: Price[]; showDisc: boolean };
}

export default function AddToCart({ product }: Props) {
  const baseItems = useMemo(
    () =>
      product.prices.flatMap((price) =>
        price.disc.map((disc) => ({
          name: product.name,
          title: product.title,
          type: price.type,
          amount: price.amount,
          disc,
          unit: 0,
        })),
      ),
    [product],
  );
  const [items, setItems] = useState(baseItems);
  const [open, setOpen] = useState(false);

  const add = () => {
    const current = parseBasket(sessionStorage.getItem(BASKET_STORAGE_KEY));
    const next = mergeBasket(current, items);
    sessionStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(next));
    notifyBasketChanged();
    setOpen(true);
  };

  return (
    <>
      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li key={`${item.type}-${item.disc}`} className="flex items-center gap-2">
            <span className="flex flex-1 flex-wrap gap-x-1">
              <span>{item.type}</span>
              {product.showDisc && <span>{item.disc}</span>}
            </span>
            <span>¥{item.amount.toLocaleString()}</span>
            <select
              aria-label={`${item.type} ${item.disc}の数量`}
              className="w-16 border border-black p-1"
              value={item.unit}
              onChange={(event) => {
                setItems((current) =>
                  current.map((candidate, candidateIndex) =>
                    candidateIndex === index
                      ? { ...candidate, unit: Number(event.target.value) }
                      : candidate,
                  ),
                );
              }}
            >
              <option value="0">数量</option>
              {Array.from({ length: 10 }, (_, unit) => (
                <option key={unit + 1} value={unit + 1}>
                  {unit + 1}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={add}
        disabled={!items.some((item) => item.unit > 0)}
        className="mt-4 w-full border border-black bg-purple-600 px-6 py-4 text-purple-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 sm:enabled:hover:border-purple-600 sm:enabled:hover:bg-purple-100 sm:enabled:hover:text-purple-600"
      >
        カートに入れる
      </button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        ariaLabel="カートへの追加完了"
      >
        <div className="flex w-56 flex-col gap-2">
          <a
            href="/pafshop/cart/"
            className="border border-black bg-purple-600 px-6 py-4 text-center text-purple-50 sm:hover:border-purple-600 sm:hover:bg-purple-100 sm:hover:text-purple-600"
          >
            カートを見る
          </a>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
            className="border border-purple-600 bg-white px-6 py-4 text-purple-600 sm:hover:bg-gray-100"
          >
            買い物を続ける
          </button>
        </div>
      </Modal>
    </>
  );
}
