import { useEffect, useState } from 'react';
import { BASKET_CHANGED_EVENT, BASKET_STORAGE_KEY, parseBasket } from '@/lib/cart';

export default function BasketCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const items = parseBasket(sessionStorage.getItem(BASKET_STORAGE_KEY));
      setCount(items.reduce((total, item) => total + item.unit, 0));
    };
    update();
    window.addEventListener('pageshow', update);
    window.addEventListener('storage', update);
    window.addEventListener(BASKET_CHANGED_EVENT, update);
    return () => {
      window.removeEventListener('pageshow', update);
      window.removeEventListener('storage', update);
      window.removeEventListener(BASKET_CHANGED_EVENT, update);
    };
  }, []);

  return (
    <span className={count > 0 ? 'text-base font-bold text-purple-600' : 'text-xs'}>{count}</span>
  );
}
