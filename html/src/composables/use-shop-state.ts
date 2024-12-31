import { Stage } from '~/types/pafshop-stage';
import type { itemInBasket, itemsToCheckout } from '~/types/item-in-basket';
import type { Customer } from '~/types/pafshop-customer';
import type { PaymentMethod } from '~/types/pafshop-payment-method';

export const deteleAllItems = (basket: Ref<itemInBasket[]>) => () => {
  basket.value.length = 0;
  sessionStorage.removeItem('basket');
};

export const deleteItem =
  (basket: Ref<itemInBasket[]>) => (item: itemInBasket) => {
    const getTheItemIndex = (item: itemInBasket): number => {
      const itemInBaskets = basket.value;
      const index = itemInBaskets.findIndex(
        (_item) =>
          _item.title === item.title &&
          _item.type === item.type &&
          _item.disc === item.disc,
      );
      return index;
    };
    basket.value.splice(getTheItemIndex(item), 1);
    sessionStorage.setItem('basket', JSON.stringify(basket.value));
  };

export const update =
  (basket: Ref<itemInBasket[]>) => (items: itemInBasket[]) => {
    for (const item of items) {
      if (item.unit > 0) {
        const alreadyInBasket = basket.value.findIndex(
          (i) =>
            i.name === item.name &&
            i.type === item.type &&
            i.disc === item.disc,
        );
        if (alreadyInBasket > -1) {
          basket.value[alreadyInBasket].unit = item.unit;
        } else {
          basket.value.push(item);
        }
      }
    }
    sessionStorage.setItem('basket', JSON.stringify(basket.value));
  };

export const useBasketState = () => {
  const basket = useState<itemInBasket[]>('basket', () => []);
  const counterInBasket = useState('counterInBasket', () => 0);
  const subTotal = useState('subTotal', () => 0);
  const shippingFee = useState('shippingFee', () => 0);
  const itemsToCheckout = useState<itemsToCheckout[]>(
    'itemsToCheckout',
    () => [],
  );

  watch(
    basket.value,
    (newValue) => {
      counterInBasket.value = newValue.reduce(
        (acc, item) => acc + item.unit,
        0,
      );
      subTotal.value = newValue.reduce(
        (acc, item) => acc + item.unit * item.amount,
        0,
      );
      shippingFee.value = subTotal.value >= 3000 ? 0 : 300;
      itemsToCheckout.value = newValue.map((item) => ({
        quantity: item.unit,
        price_data: {
          currency: 'jpy',
          product_data: {
            name: item.title,
            description: `${item.type} ${item.disc}`,
          },
          unit_amount: item.amount,
        },
      }));
    },
    { deep: true },
  );

  return {
    basket: shallowReadonly(basket),
    itemsToCheckout: readonly(itemsToCheckout),
    counterInBasket: readonly(counterInBasket),
    subTotalInBasket: readonly(subTotal),
    shippingFee: readonly(shippingFee),
    updateBasket: update(basket),
    deleteFromBasket: deleteItem(basket),
    emptyBasket: deteleAllItems(basket),
  };
};

export const useCheckoutStage = () =>
  useState<Stage>('stage', () => Stage.CONFIRM);

export const usePaymentMethod = () =>
  useState<PaymentMethod>('paymentMethod', () => undefined);

export const useCustomerInfo = () => {
  const customer = useState<Customer>('customer', () => ({}) as Customer);
  return customer;
};
