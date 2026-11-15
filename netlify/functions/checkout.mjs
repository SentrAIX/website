// Embedded Stripe Checkout for the Individual plan. One function, three jobs, all at /api/checkout:
//   GET  ?config=1            -> { publishableKey }                      (the page needs it to start Stripe.js)
//   POST                      -> { clientSecret }                        (creates the Checkout Session)
//   GET  ?session_id=cs_...   -> { status, customerEmail }               (the return page asks how it ended)
// The Stripe keys and the price come from the site's environment settings on Netlify, never from this repository:
//   STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_ID.
// It calls Stripe's REST API directly, so there is nothing to install.

const STRIPE = 'https://api.stripe.com/v1';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function stripe(secretKey, path, { method = 'GET', form } = {}) {
  const res = await fetch(`${STRIPE}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${secretKey}`,
      ...(form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Stripe answered ${res.status}`);
  return data;
}

export default async (req) => {
  const url = new URL(req.url);
  // /api/checkout-test is the unlinked sandbox twin used by /testsubscribe; it reads the STRIPE_TEST_* variables.
  const test = url.pathname === '/api/checkout-test';
  const pre = test ? 'STRIPE_TEST_' : 'STRIPE_';
  const STRIPE_SECRET_KEY = process.env[`${pre}SECRET_KEY`];
  const STRIPE_PUBLISHABLE_KEY = process.env[`${pre}PUBLISHABLE_KEY`];
  const STRIPE_PRICE_ID = process.env[`${pre}PRICE_ID`];
  if (!STRIPE_SECRET_KEY || !STRIPE_PUBLISHABLE_KEY || !STRIPE_PRICE_ID) return json({ error: 'Checkout is not set up on this site.' }, 503);

  try {
    if (req.method === 'GET' && url.searchParams.get('config')) return json({ publishableKey: STRIPE_PUBLISHABLE_KEY });

    if (req.method === 'GET') {
      const id = url.searchParams.get('session_id') ?? '';
      if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json({ error: 'Not a checkout session.' }, 400);
      const s = await stripe(STRIPE_SECRET_KEY, `/checkout/sessions/${id}`);
      return json({ status: s.status, customerEmail: s.customer_details?.email ?? null });
    }

    if (req.method === 'POST') {
      const s = await stripe(STRIPE_SECRET_KEY, '/checkout/sessions', {
        method: 'POST',
        form: {
          mode: 'subscription',
          ui_mode: 'embedded_page',
          'line_items[0][price]': STRIPE_PRICE_ID,
          'line_items[0][quantity]': '1',
          'managed_payments[enabled]': 'true',
          // same fields the hosted payment link asked for
          'name_collection[business][enabled]': 'true',
          'name_collection[business][optional]': 'false',
          'name_collection[individual][enabled]': 'true',
          'name_collection[individual][optional]': 'true',
          // {CHECKOUT_SESSION_ID} is filled in by Stripe
          return_url: `${url.origin}/${test ? 'testsubscribe' : 'subscribe'}-return?session_id={CHECKOUT_SESSION_ID}`,
        },
      });
      return json({ clientSecret: s.client_secret });
    }

    return json({ error: 'Method not allowed.' }, 405);
  } catch (e) {
    console.error('checkout:', e instanceof Error ? e.message : e);
    return json({ error: 'Checkout could not be started. Please try again, or contact us.' }, 502);
  }
};

export const config = { path: ['/api/checkout', '/api/checkout-test'] };
