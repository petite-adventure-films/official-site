import { checkBotId } from 'botid/server';
import Stripe from 'stripe';

import { parseCheckoutPayload } from '../../src/lib/checkout.js';

function jsonResponse(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const verification = await checkBotId({
      advancedOptions: { checkLevel: 'basic' },
    });
    if (verification.isBot) {
      return jsonResponse({ error: 'Access denied' }, 403);
    }

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }

    const parsed = parseCheckoutPayload(requestBody);
    if ('error' in parsed) {
      return jsonResponse({ error: parsed.error }, 400);
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return jsonResponse({ error: 'Payment service is not configured' }, 500);
    }

    try {
      const stripe = new Stripe(apiKey);
      const { requestId, items, shipping } = parsed.data;
      const customer = await stripe.customers.create(
        {},
        { idempotencyKey: `checkout-customer-${requestId}` },
      );
      const origin = new URL(request.url).origin;
      const session = await stripe.checkout.sessions.create(
        {
          customer: customer.id,
          billing_address_collection: 'required',
          shipping_address_collection: { allowed_countries: ['JP'] },
          shipping_options: [
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: shipping, currency: 'jpy' },
                display_name: 'クリックポスト等',
              },
            },
          ],
          line_items: items.map((item) => ({
            quantity: item.quantity,
            price_data: {
              currency: 'jpy',
              product_data: {
                name: item.title,
                description: `${item.type} ${item.disc}`,
              },
              unit_amount: item.unitAmount,
            },
          })),
          mode: 'payment',
          payment_method_types: ['card', 'customer_balance'],
          payment_method_options: {
            customer_balance: {
              funding_type: 'bank_transfer',
              bank_transfer: { type: 'jp_bank_transfer' },
            },
          },
          success_url: new URL('/pafshop/thanks/', origin).toString(),
          cancel_url: new URL('/pafshop/cancel/', origin).toString(),
        },
        { idempotencyKey: `checkout-session-${requestId}` },
      );

      if (!session.url) {
        throw new Error('Stripe Checkout did not return a URL');
      }
      return jsonResponse({ url: session.url }, 200);
    } catch (error) {
      console.error('Stripe Checkout session creation failed', error);
      return jsonResponse({ error: 'Payment session creation failed' }, 502);
    }
  },
};
