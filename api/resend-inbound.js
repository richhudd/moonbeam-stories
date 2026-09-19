const { Resend } = require('resend');

const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const RESEND_WEBHOOK_SECRET = String(process.env.RESEND_WEBHOOK_SECRET || '').trim();
const SUPPORT_FORWARD_TO = String(process.env.SUPPORT_FORWARD_TO || '').trim();
const PRIVACY_FORWARD_TO = String(process.env.PRIVACY_FORWARD_TO || SUPPORT_FORWARD_TO || '').trim();
const FORWARD_FROM = String(
  process.env.RESEND_FORWARD_FROM || 'Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>'
).trim();
const SUPABASE_URL = String(process.env.SUPABASE_URL || 'https://quwjfjojeibaxnnpykaf.supabase.co').trim();
const PUBLISHABLE_KEY = String(process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();

const ALLOWED_RECIPIENTS = Object.freeze({
  'support@moonbeamstories.co.uk': () => SUPPORT_FORWARD_TO,
  'privacy@moonbeamstories.co.uk': () => PRIVACY_FORWARD_TO,
  'richard@moonbeamstories.co.uk': () => SUPPORT_FORWARD_TO,
});

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
function normaliseAddress(value) { return String(value || '').trim().toLowerCase(); }
function addressOnly(value) {
  const s=String(value||'').trim();
  const m=s.match(/<([^<>]+)>/);
  return normaliseAddress(m?m[1]:s);
}
function destinationFor(event) {
  const recipients = Array.isArray(event?.data?.to) ? event.data.to : [];
  for (const raw of recipients) {
    const address = addressOnly(raw);
    const resolver = ALLOWED_RECIPIENTS[address];
    if (resolver) return { inbound: address, forwardTo: String(resolver() || '').trim() };
  }
  return null;
}
function inboundMailbox(message){
  const recipients=Array.isArray(message?.to)?message.to:[];
  for(const raw of recipients){
    const a=addressOnly(raw);
    if(ALLOWED_RECIPIENTS[a])return a;
  }
  return '';
}
function safeReplyAddress(value){
  const address=addressOnly(value);
  if(!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))return '';
  return address;
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function verifyDeveloper(req){
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token)return {error:[401,'Sign in required.']};
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});
  if(!r.ok)return {error:[401,'Invalid or expired Moonbeam session.']};
  const user=await r.json();
  const allowed=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();
  if(!allowed||String(user.email||'').toLowerCase()!==allowed)return {error:[403,'Developer access only.']};
  return {user};
}
async function resendJson(path,options={}){
  const r=await fetch(`https://api.resend.com${path}`,{
    ...options,
    headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json',...(options.headers||{})}
  });
  const text=await r.text(); let data={};
  try{data=text?JSON.parse(text):{}}catch{data={message:text||`Resend request failed (${r.status}).`}}
  if(!r.ok)throw new Error(data?.message||data?.error?.message||`Resend request failed (${r.status}).`);
  return data;
}
async function getReceivedEmail(id){
  const resend=new Resend(RESEND_API_KEY);
  const {data,error}=await resend.emails.receiving.get(id);
  if(error)throw new Error(error.message||'Could not retrieve received email.');
  if(!data)throw new Error('Resend returned no received email data.');
  return data;
}
function firstReplyAddress(message){
  const replyTo=message?.reply_to;
  if(Array.isArray(replyTo)){
    for(const value of replyTo){const a=safeReplyAddress(value);if(a)return a;}
  }else{
    const a=safeReplyAddress(replyTo); if(a)return a;
  }
  return safeReplyAddress(message?.from);
}
async function developerGet(req,res,action){
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  if(!RESEND_API_KEY)return res.status(503).json({error:'RESEND_API_KEY is not configured.'});
  try{
    if(action==='message'){
      const id=String(req.query?.id||'').trim(); if(!id)return res.status(400).json({error:'Missing email id.'});
      const message=await getReceivedEmail(id);
      let mailbox=inboundMailbox(message);
      let fallback=null;
      // The received-email list is the authoritative metadata source if a provider response omits a header field.
      if(!mailbox || !message.subject || !message.from || !message.created_at){
        const listed=await resendJson('/emails/receiving?limit=100');
        fallback=(Array.isArray(listed?.data)?listed.data:[]).find(x=>String(x?.id||'')===id)||null;
        if(!mailbox)mailbox=inboundMailbox(fallback);
      }
      if(!mailbox)return res.status(404).json({error:'This message is not addressed to a Moonbeam support mailbox.'});
      const from=message.from||fallback?.from||'';
      const to=(Array.isArray(message.to)&&message.to.length)?message.to:(fallback?.to||[]);
      const subject=message.subject||fallback?.subject||'(No subject)';
      const createdAt=message.created_at||fallback?.created_at||null;
      return res.status(200).json({message:{id:message.id||id,from,to,cc:message.cc||fallback?.cc||[],subject,createdAt,text:message.text||'',html:message.html||'',messageId:message.message_id||fallback?.message_id||'',mailbox,replyAddress:firstReplyAddress(message)||safeReplyAddress(from)}});
    }
    const payload=await resendJson('/emails/receiving?limit=100');
    const rows=(Array.isArray(payload?.data)?payload.data:[]).filter(x=>inboundMailbox(x)).map(x=>({id:x.id,from:x.from,to:x.to,subject:x.subject||'(No subject)',createdAt:x.created_at||null,mailbox:inboundMailbox(x)}));
    return res.status(200).json({messages:rows,hasMore:!!payload?.has_more});
  }catch(error){console.error('support inbox read',error);return res.status(502).json({error:error?.message||'Could not read support inbox.'});}
}
async function developerReply(req,res,body){
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  if(!RESEND_API_KEY)return res.status(503).json({error:'RESEND_API_KEY is not configured.'});
  const sourceId=String(body?.sourceId||'').trim();
  const replyText=String(body?.text||'').trim();
  if(!sourceId||!replyText)return res.status(400).json({error:'Choose a message and enter a reply.'});
  try{
    const original=await getReceivedEmail(sourceId);
    const mailbox=inboundMailbox(original);
    if(!mailbox)return res.status(400).json({error:'The original message is not a Moonbeam support email.'});
    const to=firstReplyAddress(original);
    if(!to)return res.status(400).json({error:'The sender does not have a valid reply address.'});
    const subject=/^re:/i.test(String(original.subject||''))?String(original.subject):`Re: ${String(original.subject||'(No subject)')}`;
    const headers={};
    if(original.message_id){headers['In-Reply-To']=String(original.message_id);headers['References']=String(original.message_id);}
    const resend=new Resend(RESEND_API_KEY);
    const {data,error}=await resend.emails.send({
      from:'Richard — Moonbeam Stories <richard@moonbeamstories.co.uk>',to:[to],replyTo:'support@moonbeamstories.co.uk',subject,
      text:replyText,
      html:`<div style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.5">${escapeHtml(replyText)}</div>`,
      ...(Object.keys(headers).length?{headers}:{})
    });
    if(error)throw new Error(error.message||'Could not send reply.');
    return res.status(200).json({sent:true,id:data?.id||null,to,from:'richard@moonbeamstories.co.uk'});
  }catch(error){console.error('support inbox reply',error);return res.status(502).json({error:error?.message||'Could not send reply.'});}
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const action=String(req.query?.action||'').trim().toLowerCase();
  if(req.method==='GET' && (action==='list'||action==='message'))return developerGet(req,res,action);
  if(req.method==='POST' && action==='reply'){
    let body=req.body;
    if(!body||typeof body!=='object'){try{body=JSON.parse(await rawBody(req)||'{}')}catch{return res.status(400).json({error:'Invalid JSON.'})}}
    return developerReply(req,res,body);
  }
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
      headers: {id:req.headers['svix-id'],timestamp:req.headers['svix-timestamp'],signature:req.headers['svix-signature']},
      webhookSecret: RESEND_WEBHOOK_SECRET,
    });
    if (event?.type !== 'email.received') return res.status(200).json({ received: true, ignored: true });
    const route = destinationFor(event);
    if (!route) return res.status(200).json({ received: true, ignored: true });
    if (!route.forwardTo) {
      console.error(`resend-inbound: no forwarding destination configured for ${route.inbound}`);
      return res.status(503).send('Forwarding destination is not configured.');
    }
    const emailId = String(event?.data?.email_id || '').trim();
    if (!emailId) return res.status(400).send('Missing received email id.');
    const { data, error } = await resend.emails.receiving.forward({emailId,to:route.forwardTo,from:FORWARD_FROM});
    if (error) {console.error('resend-inbound forward error', error);return res.status(502).send(error.message || 'Could not forward received email.');}
    return res.status(200).json({ received: true, forwarded: true, id: data?.id || null });
  } catch (error) {
    console.error('resend-inbound', error);
    return res.status(400).send(error?.message || 'Webhook error');
  }
};
