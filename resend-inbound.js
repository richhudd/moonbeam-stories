const { Resend } = require('resend');

const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const RESEND_WEBHOOK_SECRET = String(process.env.RESEND_WEBHOOK_SECRET || '').trim();
const SUPPORT_FORWARD_TO = String(process.env.SUPPORT_FORWARD_TO || '').trim();
const PRIVACY_FORWARD_TO = String(process.env.PRIVACY_FORWARD_TO || SUPPORT_FORWARD_TO || '').trim();
const FORWARD_FROM = String(
  process.env.RESEND_FORWARD_FROM || 'Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>'
).trim();

const ALLOWED_RECIPIENTS = Object.freeze({
  'support@moonbeamstories.co.uk': () => SUPPORT_FORWARD_TO,
  'privacy@moonbeamstories.co.uk': () => PRIVACY_FORWARD_TO,
});

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function normaliseAddress(value) {
  return String(value || '').trim().toLowerCase();
}

function destinationFor(event) {
  const recipients = Array.isArray(event?.data?.to) ? event.data.to : [];
  for (const raw of recipients) {
    const address = normaliseAddress(raw);
    const resolver = ALLOWED_RECIPIENTS[address];
    if (resolver) return { inbound: address, forwardTo: String(resolver() || '').trim() };
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).send('POST only');

  if (!RESEND_API_KEY || !RESEND_WEBHOOK_SECRET) {
    console.error('resend-inbound: missing RESEND_API_KEY or RESEND_WEBHOOK_SECRET');
    return res.status(503).send('Inbound email is not configured.');
  }

  try {
    const payload = await rawBody(req);
    const resend = new Resend(RESEND_API_KEY);

    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers['svix-id'],
        timestamp: req.headers['svix-timestamp'],
        signature: req.headers['svix-signature'],
      },
      webhookSecret: RESEND_WEBHOOK_SECRET,
    });

    if (event?.type !== 'email.received') {
      return res.status(200).json({ received: true, ignored: true });
    }

    const route = destinationFor(event);
    if (!route) {
      // Resend accepts any local-part for a receiving domain. Moonbeam deliberately
      // forwards only its two published customer-contact addresses.
      return res.status(200).json({ received: true, ignored: true });
    }

    if (!route.forwardTo) {
      console.error(`resend-inbound: no forwarding destination configured for ${route.inbound}`);
      return res.status(503).send('Forwarding destination is not configured.');
    }

    const emailId = String(event?.data?.email_id || '').trim();
    if (!emailId) return res.status(400).send('Missing received email id.');

    const { data, error } = await resend.emails.receiving.forward({
      emailId,
      to: route.forwardTo,
      from: FORWARD_FROM,
    });

    if (error) {
      console.error('resend-inbound forward error', error);
      return res.status(502).send(error.message || 'Could not forward received email.');
    }

    return res.status(200).json({ received: true, forwarded: true, id: data?.id || null });
  } catch (error) {
    console.error('resend-inbound', error);
    return res.status(400).send(error?.message || 'Webhook error');
  }
};
