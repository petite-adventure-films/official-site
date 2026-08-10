import { checkBotId } from 'botid/server';
import { Resend } from 'resend';

import { createContactEmailBody, parseContactPayload } from '../src/lib/contact.js';

const SUBJECT = '【プチ・アドベンチャー・フィルムズ】お問い合わせ受付のお知らせ';

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

    const parsed = parseContactPayload(requestBody);
    if ('error' in parsed) {
      return jsonResponse({ error: parsed.error }, 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    const to = process.env.CONTACT_TO_EMAIL;
    if (!apiKey || !from || !to) {
      console.error('Contact email environment variables are not configured');
      return jsonResponse({ error: 'Email service is not configured' }, 500);
    }

    const body = createContactEmailBody(parsed.data);
    const resend = new Resend(apiKey);
    const { error } = await resend.batch.send([
      {
        from,
        to: parsed.data.email,
        replyTo: to,
        subject: SUBJECT,
        text: body,
      },
      {
        from,
        to,
        replyTo: parsed.data.email,
        subject: SUBJECT,
        text: body,
      },
    ]);

    if (error) {
      console.error('Resend failed to send contact emails', error);
      return jsonResponse({ error: 'Email delivery failed' }, 502);
    }

    return jsonResponse({ success: true }, 200);
  },
};
