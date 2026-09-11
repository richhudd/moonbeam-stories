const { SUPABASE_URL, SECRET_KEY, adminHeaders } = require('./_usage');

const PUBLISHABLE_KEY =
  String(process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();

async function verifyMoonbeamUser(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    const e = new Error('Sign in to use Moonbeam story generation.'); e.status = 401; throw e;
  }
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }
  });
  if (!r.ok) {
    const e = new Error('Your Moonbeam session has expired. Please sign in again.'); e.status = 401; throw e;
  }
  return r.json();
}

async function rpc(name, payload) {
  if (!SECRET_KEY) { const e = new Error('Moonbeam billing controls are not configured.'); e.status = 503; throw e; }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: adminHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload)
  });
  const raw = await r.text(); let value = null;
  try { value = JSON.parse(raw); } catch {}
  if (!r.ok) {
    const e = new Error(String(value?.message || value?.error || raw || `Credit service failed (${r.status})`));
    e.status = r.status; throw e;
  }
  return value;
}

async function reserveStoryCredit(userId) {
  const result = await rpc('reserve_story_credit_v60', { p_user_id: userId });
  if (!result || result.ok !== true) {
    const code = String(result?.code || 'CREDIT_ERROR');
    const e = new Error(code === 'CONSENT_REQUIRED'
      ? 'Please confirm immediate digital supply before creating this paid story.'
      : 'You have used your free stories. Add more story credits to make another adventure.');
    e.status = code === 'CONSENT_REQUIRED' ? 409 : 402; e.code = code; e.batchId = result?.batch_id || null; throw e;
  }
  return { remaining: Number(result.balance), batchId: String(result.batch_id || '') };
}
async function refundReservedStoryCredit(userId,batchId) { try { return await rpc('refund_story_credit_v60',{p_user_id:userId,p_batch_id:batchId}); } catch(e){ console.error('credit refund failed',e); return null; } }
async function createGenerationRun(userId) { return String(await rpc('create_story_generation_run',{p_user_id:userId})); }
async function consumeGenerationSlot(userId, runId, kind) {
  const ok = await rpc('consume_generation_slot',{p_user_id:userId,p_run_id:runId,p_kind:kind});
  if (ok !== true) { const e=new Error(`This story has no ${kind} generation allowance remaining.`); e.status=402; e.code='GENERATION_LIMIT'; throw e; }
  return true;
}
async function refundGenerationSlot(userId, runId, kind) { try { return await rpc('refund_generation_slot',{p_user_id:userId,p_run_id:runId,p_kind:kind}); } catch(e){ console.error('slot refund failed',e); return null; } }
module.exports={verifyMoonbeamUser,rpc,reserveStoryCredit,refundReservedStoryCredit,createGenerationRun,consumeGenerationSlot,refundGenerationSlot};
