const { verifyMoonbeamUser } = require('../_credits');
const { stripeRequest, fulfillPaidSession } = require('../_stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if (req.method !== 'GET') return res.status(405).json({error:'GET only'});
  try {
    const user = await verifyMoonbeamUser(req);
    const sessionId = String(req.query?.session_id || '').trim();
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return res.status(400).json({error:'Invalid checkout session.'});
    const session = await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {method:'GET'});
    const owner = String(session.client_reference_id || session.metadata?.moonbeam_user_id || '');
    if (owner !== user.id) return res.status(403).json({error:'This payment belongs to another account.'});
    let fulfillment = {granted:false,reason:'not_paid'};
    if (session.payment_status === 'paid') fulfillment = await fulfillPaidSession(session, 'checkout-status');
    return res.status(200).json({
      paid: session.payment_status === 'paid',
      status: session.status,
      credits: Number(session.metadata?.moonbeam_credits || 0),
      balance: Number.isFinite(Number(fulfillment?.balance)) ? Number(fulfillment.balance) : null,
      fulfillment
    });
  } catch (e) {
    console.error('checkout-status', e);
    return res.status(e.status || 500).json({error:e.message || 'Could not confirm payment.'});
  }
};
