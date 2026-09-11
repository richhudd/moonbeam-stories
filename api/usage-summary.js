
const { SUPABASE_URL, SECRET_KEY, adminHeaders } = require('../_usage');

const PUBLISHABLE_KEY =
  String(process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' });
  }
  if (!SECRET_KEY) {
    return res.status(503).json({ error: 'Set SUPABASE_SERVICE_ROLE_KEY in Vercel.' });
  }

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ error: 'Sign in required.' });
  }

  // Verify the currently signed-in Moonbeam user using their actual session JWT.
  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`
    }
  });
  if (!userResponse.ok) {
    return res.status(401).json({ error: 'Invalid or expired Moonbeam session.' });
  }

  const user = await userResponse.json();
  const allowed = String(process.env.MOONBEAM_DEVELOPER_EMAIL || '').trim().toLowerCase();
  if (!allowed || String(user.email || '').toLowerCase() !== allowed) {
    return res.status(403).json({ error: 'Developer access only.' });
  }

  const eventsResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/api_usage_events?select=event_type,estimated_cost_gbp,created_at&order=created_at.desc`,
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

  const count = type => events.filter(x => x.event_type === type).length;
  const stories = count('story');
  const total = events.reduce((sum, x) => sum + Number(x.estimated_cost_gbp || 0), 0);

  return res.status(200).json({
    registeredUsers,
    stories,
    images: count('image'),
    narrations: count('narration'),
    estimatedCostGBP: total,
    averageStoryCostGBP: stories ? total / stories : 0
  });
};
