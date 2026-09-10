
const SUPABASE_URL = String(process.env.SUPABASE_URL || 'https://quwjfjojeibaxnnpykaf.supabase.co').replace(/\/$/,'');
const SECRET_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

function adminHeaders(extra={}) {
  if (!SECRET_KEY) return extra;
  // New Supabase sb_secret_ keys are API keys, not JWTs.
  // Legacy service_role JWTs can still be sent as Authorization Bearer.
  const h = { apikey: SECRET_KEY, ...extra };
  if (!SECRET_KEY.startsWith('sb_secret_')) {
    h.Authorization = `Bearer ${SECRET_KEY}`;
  }
  return h;
}

async function logUsage(event) {
  if (!SECRET_KEY) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/api_usage_events`, {
      method: 'POST',
      headers: adminHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      }),
      body: JSON.stringify(event)
    });
    if (!r.ok) {
      console.error('usage log failed', r.status, await r.text());
      return null;
    }
    const rows = await r.json();
    return rows?.[0]?.id ?? null;
  } catch (e) {
    console.error('usage log failed', e);
    return null;
  }
}

function estimateGBP(kind, meta={}) {
  if (kind === 'story') return Number(process.env.MOONBEAM_COST_STORY_GBP || 0);
  if (kind === 'image') {
    return Number(meta.reference
      ? process.env.MOONBEAM_COST_REFERENCE_IMAGE_GBP || 0
      : process.env.MOONBEAM_COST_IMAGE_GBP || 0);
  }
  if (kind === 'narration') return Number(process.env.MOONBEAM_COST_NARRATION_GBP || 0);
  return 0;
}

module.exports = { logUsage, estimateGBP, SUPABASE_URL, SECRET_KEY, adminHeaders };
