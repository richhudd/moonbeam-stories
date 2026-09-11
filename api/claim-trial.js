const crypto = require('crypto');
const net = require('net');
const { verifyMoonbeamUser, rpc } = require('../_credits');
const { SECRET_KEY } = require('../_usage');

function privateHash(kind, value) {
  const key = SECRET_KEY || 'moonbeam-v52-fallback';
  return crypto.createHmac('sha256', key).update(`${kind}:${String(value || '')}`).digest('hex');
}
function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.headers['x-real-ip'] || '').trim() || '';
}
function networkIdentity(ip) {
  if (!ip) return '';
  // IPv4 addresses normally represent the household/NAT egress address.
  if (net.isIP(ip) === 4) return ip;
  // IPv6 privacy addresses can vary per device; use the /64 network prefix.
  if (net.isIP(ip) === 6) {
    const parts = ip.toLowerCase().split(':');
    // Expand enough to derive the first four hextets reliably.
    const dbl = parts.indexOf('');
    let expanded;
    if (dbl >= 0) {
      const left = parts.slice(0, dbl).filter(Boolean);
      const right = parts.slice(dbl + 1).filter(Boolean);
      expanded = [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right];
    } else {
      expanded = parts;
    }
    return expanded.slice(0, 4).map(x => (x || '0').padStart(4, '0')).join(':') + '::/64';
  }
  return ip;
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});
  try {
    const user = await verifyMoonbeamUser(req);
    // Supabase exposes email_confirmed_at on the authenticated user object.
    if (!user.email_confirmed_at) return res.status(403).json({error:'Please verify your email before claiming your free stories.',code:'EMAIL_NOT_VERIFIED'});
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const deviceId = String(body.deviceId || '').trim();
    if (deviceId.length < 16 || deviceId.length > 200) return res.status(400).json({error:'This device could not be verified.'});
    const deviceHash = privateHash('device', deviceId);
    const ip = clientIp(req);
    const network = networkIdentity(ip);
    const networkHash = network ? privateHash('network', network) : '';
    const result = await rpc('claim_intro_trial',{p_user_id:user.id,p_device_hash:deviceHash,p_network_hash:networkHash});
    return res.status(200).json(result || {});
  } catch (e) {
    console.error('claim-trial',e);
    return res.status(e.status || 500).json({error:e.message || 'Trial service failed.'});
  }
};
