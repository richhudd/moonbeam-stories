const crypto = require('crypto');
const { rpc } = require('./_credits');

const STRIPE_SECRET_KEY = String(process.env.STRIPE_SECRET_KEY || '').trim();
const STRIPE_WEBHOOK_SECRET = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim();

const PACKS = Object.freeze({
  '10': { credits: 10, amount: 999, label: '10 Moonbeam story credits' },
  '25': { credits: 25, amount: 1999, label: '25 Moonbeam story credits' },
  '50': { credits: 50, amount: 3499, label: '50 Moonbeam story credits' }
});

function requireStripe() {
  if (!STRIPE_SECRET_KEY) {
    const e = new Error('Moonbeam payments are not configured yet.');
    e.status = 503;
    throw e;
  }
}

async function stripeRequest(path, options = {}) {
  requireStripe();
  const headers = {
    Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    ...(options.headers || {})
  };
  const r = await fetch(`https://api.stripe.com${path}`, { ...options, headers });
  const raw = await r.text();
  let data = null;
  try { data = JSON.parse(raw); } catch {}
  if (!r.ok) {
    const e = new Error(data?.error?.message || raw || `Stripe request failed (${r.status})`);
    e.status = r.status >= 400 && r.status < 500 ? 400 : 502;
    throw e;
  }
  return data;
}

function packForCredits(value) {
  return PACKS[String(Number(value))] || null;
}

function packFromSession(session) {
  const credits = Number(session?.metadata?.moonbeam_credits || 0);
  const pack = packForCredits(credits);
  if (!pack) return null;
  if (String(session?.currency || '').toLowerCase() !== 'gbp') return null;
  if (Number(session?.amount_total) !== pack.amount) return null;
  return pack;
}

async function fulfillPaidSession(session, eventId = '') {
  if (!session || session.object !== 'checkout.session') throw new Error('Invalid Stripe Checkout Session.');
  if (session.mode !== 'payment' || session.payment_status !== 'paid') {
    return { granted: false, reason: 'not_paid' };
  }
  const userId = String(session.client_reference_id || session.metadata?.moonbeam_user_id || '').trim();
  const pack = packFromSession(session);
  if (!userId || !pack) throw new Error('Stripe payment metadata did not match a Moonbeam credit pack.');
  return rpc('fulfill_story_credit_purchase', {
    p_user_id: userId,
    p_session_id: String(session.id),
    p_payment_intent_id: String(session.payment_intent || ''),
    p_credits: pack.credits,
    p_amount_total: Number(session.amount_total),
    p_currency: String(session.currency || '').toLowerCase(),
    p_event_id: String(eventId || '')
  });
}


async function applyRefundedCharge(charge, eventId = '') {
  if (!charge || charge.object !== 'charge') throw new Error('Invalid Stripe Charge.');
  const paymentIntentId = String(charge.payment_intent || '').trim();
  const amountRefunded = Number(charge.amount_refunded);
  const currency = String(charge.currency || '').toLowerCase();
  if (!paymentIntentId || !Number.isInteger(amountRefunded) || amountRefunded < 0 || !currency) {
    throw new Error('Stripe refund metadata was incomplete.');
  }
  return rpc('apply_story_credit_refund', {
    p_payment_intent_id: paymentIntentId,
    p_amount_refunded: amountRefunded,
    p_currency: currency,
    p_event_id: String(eventId || '')
  });
}

function verifyStripeSignature(rawBody, signatureHeader, toleranceSeconds = 300) {
  if (!STRIPE_WEBHOOK_SECRET) throw new Error('Stripe webhook secret is not configured.');
  const parts = String(signatureHeader || '').split(',').map(x => x.trim());
  const timestampPart = parts.find(x => x.startsWith('t='));
  const signatures = parts.filter(x => x.startsWith('v1=')).map(x => x.slice(3));
  const timestamp = Number(timestampPart?.slice(2));
  if (!Number.isFinite(timestamp) || !signatures.length) throw new Error('Invalid Stripe signature header.');
  if (Math.abs(Math.floor(Date.now()/1000) - timestamp) > toleranceSeconds) throw new Error('Stripe webhook timestamp is outside the allowed tolerance.');
  const expected = crypto.createHmac('sha256', STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const valid = signatures.some(sig => {
    try {
      const actual = Buffer.from(sig, 'hex');
      return actual.length === expectedBuf.length && crypto.timingSafeEqual(actual, expectedBuf);
    } catch { return false; }
  });
  if (!valid) throw new Error('Stripe webhook signature verification failed.');
  return true;
}

async function readRawBody(req) {
  // Do not touch Vercel's req.body helper here: it is a lazy JSON parser. Reading
  // the IncomingMessage stream directly preserves the exact bytes Stripe signed.
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

module.exports = {
  PACKS, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
  stripeRequest, packForCredits, packFromSession,
  fulfillPaidSession, applyRefundedCharge, verifyStripeSignature, readRawBody
};
