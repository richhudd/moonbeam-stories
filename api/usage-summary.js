const { SUPABASE_URL, SECRET_KEY, adminHeaders } = require('../_usage');

const PUBLISHABLE_KEY =
  String(process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();

const DEFAULT_BASELINE_UTC = '2026-09-14T21:25:06Z';

function unixSeconds(iso) {
  const ms = Date.parse(String(iso || ''));
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

async function verifyDeveloper(req) {
  if (!SECRET_KEY) {
    return { error: [503, 'Set SUPABASE_SERVICE_ROLE_KEY in Vercel.'] };
  }

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return { error: [401, 'Sign in required.'] };

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`
    }
  });

  if (!userResponse.ok) {
    return { error: [401, 'Invalid or expired Moonbeam session.'] };
  }

  const user = await userResponse.json();
  const allowed = String(process.env.MOONBEAM_DEVELOPER_EMAIL || '').trim().toLowerCase();
  if (!allowed || String(user.email || '').toLowerCase() !== allowed) {
    return { error: [403, 'Developer access only.'] };
  }

  return { user };
}

async function fetchOpenAICostUSD(startTime, endTime) {
  const adminKey = String(process.env.OPENAI_ADMIN_KEY || '').trim();
  if (!adminKey) {
    return {
      available: false,
      totalUSD: null,
      currency: 'usd',
      error: 'OPENAI_ADMIN_KEY is not configured in Vercel.'
    };
  }

  const projectId = String(process.env.OPENAI_PROJECT_ID || '').trim();
  let totalUSD = 0;
  let page = '';
  let safety = 0;

  do {
    const qs = new URLSearchParams({
      start_time: String(startTime),
      end_time: String(endTime),
      bucket_width: '1d',
      limit: '180'
    });
    if (projectId) qs.append('project_ids', projectId);
    if (page) qs.set('page', page);

    const r = await fetch(`https://api.openai.com/v1/organization/costs?${qs.toString()}`, {
      headers: {
        Authorization: `Bearer ${adminKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('OpenAI cost query failed', r.status, detail);
      return {
        available: false,
        totalUSD: null,
        currency: 'usd',
        error: `OpenAI cost query failed (${r.status}).`
      };
    }

    const payload = await r.json();
    for (const bucket of Array.isArray(payload.data) ? payload.data : []) {
      for (const result of Array.isArray(bucket.results) ? bucket.results : []) {
        const currency = String(result?.amount?.currency || 'usd').toLowerCase();
        if (currency !== 'usd') continue;
        const value = Number(result?.amount?.value);
        if (Number.isFinite(value)) totalUSD += value;
      }
    }

    page = payload.has_more ? String(payload.next_page || '') : '';
    safety += 1;
  } while (page && safety < 50);

  return {
    available: true,
    totalUSD,
    currency: 'usd',
    projectFiltered: !!projectId
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' });
  }

  const verified = await verifyDeveloper(req);
  if (verified.error) {
    return res.status(verified.error[0]).json({ error: verified.error[1] });
  }

  const baselineUTC =
    String(process.env.MOONBEAM_USAGE_BASELINE_UTC || DEFAULT_BASELINE_UTC).trim();
  const baselineSeconds = unixSeconds(baselineUTC);

  if (!baselineSeconds) {
    return res.status(500).json({ error: 'MOONBEAM_USAGE_BASELINE_UTC is invalid.' });
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  const eventsResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/api_usage_events?select=event_type,created_at&order=created_at.asc`,
    { headers: adminHeaders() }
  );

  if (!eventsResponse.ok) {
    const detail = await eventsResponse.text();
    console.error('usage summary events failed', eventsResponse.status, detail);
    return res.status(500).json({ error: 'Could not read Moonbeam usage events.' });
  }

  const events = await eventsResponse.json();

  const accountsResponse = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`,
    { headers: adminHeaders() }
  );

  let registeredUsers = null;
  if (accountsResponse.ok) {
    const payload = await accountsResponse.json();
    registeredUsers = Array.isArray(payload.users) ? payload.users.length : null;
  } else {
    console.error('usage summary users failed', accountsResponse.status, await accountsResponse.text());
  }

  const countType = (list, type) => list.filter(x => x.event_type === type).length;
  const sinceEvents = events.filter(x => {
    const t = Date.parse(String(x.created_at || ''));
    return Number.isFinite(t) && t >= baselineSeconds * 1000;
  });

  const allTime = {
    registeredUsers,
    stories: countType(events, 'story'),
    images: countType(events, 'image'),
    narrations: countType(events, 'narration')
  };

  const sinceBaseline = {
    stories: countType(sinceEvents, 'story'),
    images: countType(sinceEvents, 'image'),
    narrations: countType(sinceEvents, 'narration')
  };

  const openai = await fetchOpenAICostUSD(baselineSeconds, nowSeconds);

  sinceBaseline.openAICostUSD = openai.totalUSD;
  sinceBaseline.averageStoryCostUSD =
    openai.available && sinceBaseline.stories > 0
      ? openai.totalUSD / sinceBaseline.stories
      : null;

  return res.status(200).json({
    baselineUTC,
    allTime,
    sinceBaseline,
    openai: {
      available: openai.available,
      currency: openai.currency,
      projectFiltered: !!openai.projectFiltered,
      error: openai.error || null
    }
  });
};
