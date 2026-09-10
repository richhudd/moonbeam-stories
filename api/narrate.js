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
    const narrationProfiles = {
      'en-GB': 'Speak in natural British English with a warm, neutral contemporary UK accent. Use British pronunciation throughout; do not drift into American pronunciation.',
      'en-US': 'Speak in natural American English with a warm, neutral contemporary US accent. Use American pronunciation throughout.',
      'es-ES': 'Speak in European Spanish from Spain with a natural neutral Peninsular Spanish accent and pronunciation, including normal distinctions used in Spain where appropriate. Do not use a Latin American accent.',
      'es-419': 'Speak in natural Latin American Spanish with a warm, broadly neutral Latin American accent. Do not use a Peninsular Spanish accent.',
      'fr-FR': 'Speak in French from France with a natural, warm, neutral metropolitan French accent and pronunciation.',
      'de-DE': 'Speak in German from Germany with a natural, warm, neutral Standard German accent and pronunciation.',
      'it-IT': 'Speak in Italian from Italy with a natural, warm, neutral standard Italian accent and pronunciation.',
      'pt-PT': 'Speak in European Portuguese from Portugal with a natural, warm, neutral Portuguese accent and pronunciation. Do not use Brazilian Portuguese pronunciation.'
    };
    const accentInstruction = narrationProfiles[language] || 'Speak naturally in the language and regional variety of the text.';
    const instructions = `${accentInstruction} Read as a warm, gentle, expressive children's storybook narrator. Natural bedtime pacing, clear diction and subtle character expression. Never theatrical or frightening. Keep the selected regional accent consistent for the entire page.`;
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
