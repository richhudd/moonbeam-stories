const { fulfillPaidSession, verifyStripeSignature, readRawBody } = require('./_stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return res.status(405).send('POST only');
  try {
    const raw = await readRawBody(req);
    verifyStripeSignature(raw, req.headers['stripe-signature']);
    const event = JSON.parse(raw);

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data?.object;
      if (session?.payment_status === 'paid') await fulfillPaidSession(session, event.id);
    }
    return res.status(200).json({received:true});
  } catch (e) {
    console.error('stripe-webhook', e);
    return res.status(400).send(e.message || 'Webhook error');
  }
};
