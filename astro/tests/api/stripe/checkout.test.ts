import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  checkBotId: vi.fn(),
  customersCreate: vi.fn(),
  sessionsCreate: vi.fn(),
}));

vi.mock('botid/server', () => ({ checkBotId: mocks.checkBotId }));
vi.mock('stripe', () => ({
  default: class Stripe {
    customers = { create: mocks.customersCreate };
    checkout = { sessions: { create: mocks.sessionsCreate } };
  },
}));

import checkoutHandler from '../../../api/stripe/checkout.js';

const requestId = '5b1446b4-ae4d-4cb0-9677-c7fa80fa5656';
const validPayload = {
  requestId,
  items: [
    {
      name: 'dancing_zempukuji__apprentice_homeless',
      type: '一般',
      disc: 'DVD',
      quantity: 1,
      amount: 1,
    },
  ],
};

function checkoutRequest(body: unknown = validPayload) {
  return new Request('https://preview.example.com/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Stripe checkout function', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_example';
    mocks.checkBotId.mockResolvedValue({ isBot: false });
    mocks.customersCreate.mockResolvedValue({ id: 'cus_test' });
    mocks.sessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/test' });
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('POST以外を拒否する', async () => {
    const response = await checkoutHandler.fetch(
      new Request('https://preview.example.com/api/stripe/checkout'),
    );
    expect(response.status).toBe(405);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it('Bot判定されたリクエストを拒否する', async () => {
    mocks.checkBotId.mockResolvedValue({ isBot: true });
    const response = await checkoutHandler.fetch(checkoutRequest());
    expect(response.status).toBe(403);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it('不正な商品をStripeへ送らない', async () => {
    const response = await checkoutHandler.fetch(
      checkoutRequest({
        requestId,
        items: [{ name: 'unknown', type: '一般', disc: 'DVD', quantity: 1 }],
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it('商品マスターの価格でCheckout Sessionを作る', async () => {
    const response = await checkoutHandler.fetch(checkoutRequest());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ url: 'https://checkout.stripe.com/test' });

    expect(mocks.customersCreate).toHaveBeenCalledWith(
      {},
      { idempotencyKey: `checkout-customer-${requestId}` },
    );
    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_test',
        billing_address_collection: 'required',
        shipping_address_collection: { allowed_countries: ['JP'] },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 300, currency: 'jpy' },
              display_name: 'クリックポスト等',
            },
          },
        ],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'jpy',
              product_data: {
                name: '踊る善福寺 / ホームレスごっこ',
                description: '一般 DVD',
              },
              unit_amount: 1500,
            },
          },
        ],
        payment_method_types: ['card', 'customer_balance'],
        payment_method_options: {
          customer_balance: {
            funding_type: 'bank_transfer',
            bank_transfer: { type: 'jp_bank_transfer' },
          },
        },
        success_url: 'https://preview.example.com/pafshop/thanks/',
        cancel_url: 'https://preview.example.com/pafshop/cancel/',
      }),
      { idempotencyKey: `checkout-session-${requestId}` },
    );
  });

  it('秘密鍵がない場合はStripeへ接続しない', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const response = await checkoutHandler.fetch(checkoutRequest());
    expect(response.status).toBe(500);
    expect(mocks.customersCreate).not.toHaveBeenCalled();
  });

  it('Stripeの失敗内容をブラウザへ漏らさない', async () => {
    mocks.sessionsCreate.mockRejectedValue(new Error('sensitive Stripe detail'));
    const response = await checkoutHandler.fetch(checkoutRequest());
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: 'Payment session creation failed' });
  });
});
