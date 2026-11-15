// Stripe webhook: Stripe calls this when a checkout finishes, so we hear about it even if the buyer closes the tab.
//   /api/stripe-webhook       live  -> signing secret in STRIPE_WEBHOOK_SECRET
//   /api/stripe-webhook-test  sandbox -> signing secret in STRIPE_TEST_WEBHOOK_SECRET
// For now it only verifies the signature and logs who paid (Netlify > Logs > Functions). Creating the account in the
// app and Keycloak is the next step and hooks in where marked below.

import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SECONDS = 300;

const reply = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

// Stripe-Signature looks like: t=1700000000,v1=<hex>,v1=<hex>. The signed text is `${t}.${rawBody}`.
function validSignature(rawBody, header, secret) {
  const parts = Object.fromEntries(
    (header ?? '').split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  );
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > TOLERANCE_SECONDS) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest();
  return (header ?? '')
    .split(',')
    .filter((p) => p.startsWith('v1='))
    .some((p) => {
      const got = Buffer.from(p.slice(3), 'hex');
      return got.length === expected.length && timingSafeEqual(got, expected);
    });
}

export default async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed.' });

  const test = new URL(req.url).pathname === '/api/stripe-webhook-test';
  const secret = process.env[test ? 'STRIPE_TEST_WEBHOOK_SECRET' : 'STRIPE_WEBHOOK_SECRET'];
  if (!secret) return reply(503, { error: 'Webhook is not set up on this site.' });

  const rawBody = await req.text(); // must be the exact bytes Stripe signed
  if (!validSignature(rawBody, req.headers.get('stripe-signature'), secret)) return reply(400, { error: 'Bad signature.' });

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return reply(400, { error: 'Bad payload.' });
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data?.object ?? {};
    const d = s.customer_details ?? {};
    // One plain string: some log viewers drop extra arguments.
    console.log(
      `stripe-webhook${test ? ' (test)' : ''}: checkout completed ` +
        JSON.stringify({
          session: s.id,
          paid: s.payment_status,
          email: d.email ?? null,
          name: d.individual_name ?? null,
          business: d.business_name ?? null,
          customer: s.customer ?? null,
          subscription: s.subscription ?? null,
        }),
    );
    // NEXT: create the organization and the Keycloak user in the app from these fields (must be idempotent on session id).
  }

  return reply(200, { received: true });
};

export const config = { path: ['/api/stripe-webhook', '/api/stripe-webhook-test'] };
