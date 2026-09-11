const { verifyMoonbeamUser } = require('../_credits');
const { stripeRequest, packForCredits } = require('../_stripe');

function siteOrigin(req) {
  const configured = String(process.env.MOONBEAM_SITE_URL || 'https://www.moonbeamstories.co.uk').replace(/\/$/,'');
  return configured;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});
  try {
    const user = await verifyMoonbeamUser(req);
    if (!user.email_confirmed_at) return res.status(403).json({error:'Please verify your email before buying story credits.'});
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const pack = packForCredits(body.credits);
    if (!pack) return res.status(400).json({error:'Choose a valid Moonbeam credit pack.'});

    const origin = siteOrigin(req);
    const form = new URLSearchParams();
    form.set('mode','payment');
    form.set('client_reference_id', user.id);
    form.set('customer_email', user.email || '');
    form.set('success_url', `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    form.set('cancel_url', `${origin}/?checkout=cancelled`);
    form.set('line_items[0][quantity]','1');
    form.set('line_items[0][price_data][currency]','gbp');
    form.set('line_items[0][price_data][unit_amount]', String(pack.amount));
    form.set('line_items[0][price_data][product_data][name]', pack.label);
    form.set('line_items[0][price_data][product_data][description]', 'Prepaid Moonbeam Stories credits. One credit creates one new story.');
    form.set('metadata[moonbeam_user_id]', user.id);
    form.set('metadata[moonbeam_credits]', String(pack.credits));
    form.set('payment_intent_data[metadata][moonbeam_user_id]', user.id);
    form.set('payment_intent_data[metadata][moonbeam_credits]', String(pack.credits));

    const session = await stripeRequest('/v1/checkout/sessions', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: form.toString()
    });
    if (!session?.url) throw new Error('Stripe did not return a Checkout URL.');
    return res.status(200).json({url:session.url});
  } catch (e) {
    console.error('create-checkout', e);
    return res.status(e.status || 500).json({error:e.message || 'Could not start checkout.'});
  }
};
