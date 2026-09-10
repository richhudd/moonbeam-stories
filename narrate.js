module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^[\'"]|[\'"]$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const text = String(body.text || '').trim();
    const language = String(body.language || 'en-GB');
    if (!text) return res.status(400).json({ error: 'Narration text is required.' });
    if (text.length > 4096) return res.status(400).json({ error: 'This page is too long to narrate.' });
    const languageNames = {'en-GB':'British English','en-US':'American English','es-ES':'Spanish from Spain','es-419':'Latin American Spanish','fr-FR':'French from France','de-DE':'German','it-IT':'Italian','pt-PT':'European Portuguese'};
    const instructions = `Read this children's bedtime story page in ${languageNames[language] || 'the language of the text'}. Warm, gentle, expressive storybook narrator. Natural pacing, clear diction, subtle character expression, never theatrical or frightening. Suitable for a child listening at bedtime.`;
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'marin', input: text, instructions, response_format: 'mp3', speed: 0.96 })
    });
    if (!r.ok) {
      const raw = await r.text(); let data={}; try{data=JSON.parse(raw)}catch{}
      const e=data?.error; const message=typeof e==='string'?e:(e?.message||e?.code||`OpenAI returned HTTP ${r.status}`);
      return res.status(502).json({ error:String(message), openai_status:r.status });
    }
    const bytes = Buffer.from(await r.arrayBuffer());
    return res.status(200).json({ audio:`data:audio/mpeg;base64,${bytes.toString('base64')}` });
  } catch (e) {
    console.error('narrate error', e);
    return res.status(500).json({ error: String(e?.message || e) });
  }
};
