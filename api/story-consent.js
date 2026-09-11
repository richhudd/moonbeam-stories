const { verifyMoonbeamUser, rpc } = require('./_credits');
const { Resend } = require('resend');

const CONSENT_VERSION = 'v60-2026-09-11';
const CONSENT_TEXT = 'Create my story now. I agree to immediate digital supply and understand I can no longer cancel this purchase once creation begins.';

async function sendConfirmation(email, result) {
  const key = String(process.env.RESEND_API_KEY || '').trim();
  if (!key || !email || result?.accepted_new !== true) return;
  const resend = new Resend(key);
  await resend.emails.send({
    from: String(process.env.RESEND_FORWARD_FROM || 'Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>'),
    to: email,
    subject: 'Your Moonbeam digital-content confirmation',
    text: `Thanks for using Moonbeam Stories.\n\nBefore creating your first story from this credit pack, you confirmed:\n\n“${CONSENT_TEXT}”\n\nThis confirmation applies to the ${Number(result.credits)||''} story-credit pack connected with that purchase. It does not affect any rights that cannot legally be excluded.\n\nMoonbeam Stories`
  });
}

module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({error:'GET or POST only'});
  try {
    const user = await verifyMoonbeamUser(req);
    if (req.method === 'GET') {
      const context = await rpc('get_story_credit_context',{p_user_id:user.id});
      return res.status(200).json(context || {has_credit:false,consent_required:false,balance:0});
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const batchId = String(body.batchId || '').trim();
    if (!batchId) return res.status(400).json({error:'Missing credit batch.'});
    const result = await rpc('accept_story_credit_consent',{
      p_user_id:user.id,p_batch_id:batchId,p_version:CONSENT_VERSION,p_text:CONSENT_TEXT
    });
    try { await sendConfirmation(user.email,result); }
    catch (mailError) { console.error('story-consent confirmation email',mailError); }
    return res.status(200).json({...result,consent_text:CONSENT_TEXT});
  } catch(e) {
    console.error('story-consent',e);
    return res.status(e.status||500).json({error:e.message||'Could not record confirmation.'});
  }
};
