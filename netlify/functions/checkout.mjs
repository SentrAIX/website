// Embedded Stripe Checkout for the Individual plan. One function, three jobs, all at /api/checkout:
//   GET  ?config=1            -> { publishableKey }                      (the page needs it to start Stripe.js)
//   POST                      -> { clientSecret }                        (creates the Checkout Session)
//   GET  ?session_id=cs_...   -> { status, customerEmail }               (the return page asks how it ended)
// The Stripe keys and the price come from the site's environment settings on Netlify, never from this repository:
//   STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_ID (Individual), STRIPE_TEAM_PRICE_ID (Team, sold only as an
//   in-app upgrade), and STRIPE_CREDITS_PRICE_ID for execution packs (a one-off price whose metadata "executions" is the
//   pack size). The STRIPE_TEST_* twins serve /api/checkout-test.
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
      // Optional, from the page's URL when the purchase was started in the app (POST /api/account/checkout):
      //   ref   - the app's checkout intent; the provisioning API applies the purchase to that organization
      //   email - the signed-in user's email, prefilled
      //   kind  - 'credits' for a one-off execution pack (needs ref), otherwise the Individual subscription
      const body = await req.json().catch(() => ({}));
      const ref = typeof body.ref === 'string' && /^[0-9a-f-]{36}$/i.test(body.ref) ? body.ref : null;
      const email = typeof body.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ? body.email : null;
      const credits = body.kind === 'credits';
      const returnUrl = `${url.origin}/${test ? 'testsubscribe' : 'subscribe'}-return?session_id={CHECKOUT_SESSION_ID}${credits ? '&kind=credits' : ''}`;

      const form = {
        ui_mode: 'embedded_page',
        'line_items[0][quantity]': '1',
        'managed_payments[enabled]': 'true',
        // same fields the hosted payment link asked for
        'name_collection[business][enabled]': 'true',
        'name_collection[business][optional]': 'false',
        'name_collection[individual][enabled]': 'true',
        'name_collection[individual][optional]': 'false',
        // {CHECKOUT_SESSION_ID} is filled in by Stripe
        return_url: returnUrl,
        ...(ref ? { client_reference_id: ref } : {}),
        ...(email ? { customer_email: email } : {}),
      };

      if (credits) {
        // A pack is bought for an existing organization only. Its size is the price's metadata "executions",
        // copied onto the session so the provisioning API knows how many to add.
        const packPrice = process.env[`${pre}CREDITS_PRICE_ID`];
        if (!ref || !packPrice) return json({ error: 'Execution packs can only be bought from the app.' }, 400);
        const price = await stripe(STRIPE_SECRET_KEY, `/prices/${encodeURIComponent(packPrice)}`);
        const executions = parseInt(price?.metadata?.executions ?? '', 10);
        if (!(executions > 0)) return json({ error: 'Execution packs are not set up yet.' }, 503);
        Object.assign(form, {
          mode: 'payment',
          'line_items[0][price]': packPrice,
          'metadata[kind]': 'credits',
          'metadata[executions]': String(executions),
        });
      } else {
        // Team is never sold from the website's own pages ("contact sales"): only as an upgrade started in the app,
        // which is what the ref proves. Everything else is the Individual plan.
        const team = body.plan === 'team';
        const teamPrice = process.env[`${pre}TEAM_PRICE_ID`];
        if (team && (!ref || !teamPrice)) return json({ error: 'The Team plan is available from the app, or by contacting us.' }, 400);
        const plan = team ? 'team' : 'individual';
        Object.assign(form, {
          mode: 'subscription',
          'line_items[0][price]': team ? teamPrice : STRIPE_PRICE_ID,
          'metadata[plan]': plan,
          'subscription_data[metadata][plan]': plan,
        });
      }

      const s = await stripe(STRIPE_SECRET_KEY, '/checkout/sessions', { method: 'POST', form });
      return json({ clientSecret: s.client_secret });
    }

    return json({ error: 'Method not allowed.' }, 405);
  } catch (e) {
    console.error('checkout:', e instanceof Error ? e.message : e);
    // The sandbox twin says what Stripe answered, so a setup mistake can be seen without the function logs
    return json({ error: 'Checkout could not be started. Please try again, or contact us.', ...(test ? { detail: e instanceof Error ? e.message : String(e) } : {}) }, 502);
  }
};

export const config = { path: ['/api/checkout', '/api/checkout-test'] };
