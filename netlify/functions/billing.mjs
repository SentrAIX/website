// /billing - "Manage billing" in the app sends the billing owner here. It forwards to Stripe's customer portal login
// page, where the customer confirms their email with a one-time code; no Stripe key is used, and nobody can open
// another customer's billing. The login link comes from Stripe > Settings > Billing > Customer portal and is set in
// the site's environment settings as STRIPE_PORTAL_LOGIN_URL (STRIPE_TEST_PORTAL_LOGIN_URL for /billing-test).
// Until it is set, people are sent to the contact page.

export default async (req) => {
  const url = new URL(req.url);
  const test = url.pathname === '/billing-test';
  const portal = process.env[test ? 'STRIPE_TEST_PORTAL_LOGIN_URL' : 'STRIPE_PORTAL_LOGIN_URL'];
  if (!portal) return Response.redirect(`${url.origin}/contact?interest=Billing`, 302);
  const target = new URL(portal);
  const email = url.searchParams.get('prefilled_email');
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) target.searchParams.set('prefilled_email', email);
  return Response.redirect(target.toString(), 302);
};

export const config = { path: ['/billing', '/billing-test'] };
