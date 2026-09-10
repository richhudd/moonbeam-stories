module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const prompt = String(body.prompt || '').trim();
    const style = String(body.style || '').trim();
    if (!prompt) return res.status(400).json({ error: 'An illustration prompt is required.' });

    const finalPrompt = `Create a single full-page illustration for a premium children's bedtime storybook.

ART DIRECTION
${style || 'Warm, charming, timeless British storybook illustration; painterly traditional feel, expressive characters, gentle lighting, rich but soft detail, magical without being frightening.'}

SCENE
${prompt}

IMPORTANT
- This is an illustration for children aged 3-12.
- Keep the mood warm, adventurous and reassuring.
- No words, letters, captions, signs, logos or typography anywhere in the image.
- Do not make it photorealistic, 3D-rendered or cartoonishly plastic.
- Compose the scene as a beautiful book illustration with clear focal characters and readable silhouettes.
- Keep character appearance consistent with the description in the scene.
- Square composition suitable for the right-hand page of a children's book.`;

    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-2.5-flare',
        prompt: finalPrompt,
        size: '1024x1024',
        quality: 'low',
        output_format: 'webp'
      })
    });

    const raw = await r.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = {}; }

    if (!r.ok) {
      const e = data && data.error;
      const message = typeof e === 'string' ? e : (e && (e.message || e.code || e.type)) || `OpenAI returned HTTP ${r.status}`;
      return res.status(502).json({ error: String(message), openai_status: r.status });
    }

    const item = Array.isArray(data.data) ? data.data[0] : null;
    if (!item || typeof item.b64_json !== 'string') {
      return res.status(502).json({ error: 'The image service returned no image.' });
    }

    return res.status(200).json({ image: `data:image/webp;base64,${item.b64_json}` });
  } catch (e) {
    console.error('illustrate error', e);
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
