import { describe, expect, it } from 'vitest';

import { parseCheckoutPayload } from './checkout';

const requestId = '5b1446b4-ae4d-4cb0-9677-c7fa80fa5656';

describe('parseCheckoutPayload', () => {
  it('商品マスターの名前と価格を使い、送料を計算する', () => {
    const result = parseCheckoutPayload({
      requestId,
      items: [
        {
          name: 'dancing_zempukuji__apprentice_homeless',
          type: '一般',
          disc: 'DVD',
          quantity: 1,
          title: '改ざんされた商品名',
          amount: 1,
        },
      ],
    });

    expect(result).toEqual({
      success: true,
      data: {
        requestId,
        items: [
          {
            name: 'dancing_zempukuji__apprentice_homeless',
            title: '踊る善福寺 / ホームレスごっこ',
            type: '一般',
            disc: 'DVD',
            quantity: 1,
            unitAmount: 1500,
          },
        ],
        subtotal: 1500,
        shipping: 300,
      },
    });
  });

  it('3,000円以上は送料無料にする', () => {
    const result = parseCheckoutPayload({
      requestId,
      items: [
        {
          name: 'dancing_zempukuji__apprentice_homeless',
          type: '一般',
          disc: 'DVD',
          quantity: 2,
        },
      ],
    });

    expect(result.success && result.data.shipping).toBe(0);
  });

  it.each([
    null,
    {},
    { requestId: 'invalid', items: [] },
    { requestId, items: [] },
    { requestId, items: [{ name: 'unknown', type: '一般', disc: 'DVD', quantity: 1 }] },
    {
      requestId,
      items: [{ name: 'my_indian_diary', type: '一般', disc: 'ブルーレイ', quantity: 1 }],
    },
    {
      requestId,
      items: [{ name: 'my_indian_diary', type: '一般', disc: 'DVD', quantity: 11 }],
    },
    {
      requestId,
      items: [
        { name: 'my_indian_diary', type: '一般', disc: 'DVD', quantity: 1 },
        { name: 'my_indian_diary', type: '一般', disc: 'DVD', quantity: 1 },
      ],
    },
  ])('不正な注文を拒否する', (payload) => {
    expect(parseCheckoutPayload(payload).success).toBe(false);
  });
});
