export type itemInBasket = {
  name: string;
  title: string;
  type: string;
  amount: number;
  disc: string;
  unit: number;
};

export type itemsToCheckout = {
  quantity: number;
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description: string;
    };
    unit_amount: number;
  };
};
