
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


async function countUsageEvents(eventType, metadataContains={}) {
  if (!SECRET_KEY) return null;
  try {
    const params = new URLSearchParams();
    params.set('select', 'id');
    params.set('event_type', `eq.${String(eventType||'')}`);
    if (metadataContains && Object.keys(metadataContains).length) params.set('metadata', `cs.${JSON.stringify(metadataContains)}`);
    params.set('limit', '200');
    const r = await fetch(`${SUPABASE_URL}/rest/v1/api_usage_events?${params.toString()}`, {
      headers: adminHeaders({ Prefer: 'count=exact' })
    });
    if (!r.ok) {
      console.error('usage count failed', r.status, await r.text());
      return null;
    }
    const range = String(r.headers.get('content-range') || '');
    const m = range.match(/\/(\d+)$/);
    if (m) return Number(m[1]) || 0;
    const rows = await r.json();
    return Array.isArray(rows) ? rows.length : 0;
  } catch (e) {
    console.error('usage count failed', e);
    return null;
  }
}


const DEFAULT_USAGE_BASELINE_UTC = '2026-09-26T13:38:25Z';
async function getUsageBaselineUTC() {
  if (SECRET_KEY) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/moonbeam_admin_settings?select=value&key=eq.usage_baseline_utc&limit=1`, { headers: adminHeaders() });
      if (r.ok) {
        const rows = await r.json();
        const value = String(rows?.[0]?.value || '').trim();
        if (Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
      } else console.error('baseline setting read failed', r.status, await r.text());
    } catch (e) { console.error('baseline setting read failed', e); }
  }
  const fallback = String(process.env.MOONBEAM_USAGE_BASELINE_UTC || DEFAULT_USAGE_BASELINE_UTC).trim();
  return Number.isFinite(Date.parse(fallback)) ? new Date(fallback).toISOString() : DEFAULT_USAGE_BASELINE_UTC;
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

module.exports = { logUsage, countUsageEvents, estimateGBP, getUsageBaselineUTC, SUPABASE_URL, SECRET_KEY, adminHeaders };
