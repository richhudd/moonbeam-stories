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
    const referenceImage = typeof body.referenceImage === 'string' ? body.referenceImage : '';
    if (!prompt) return res.status(400).json({ error: 'An illustration prompt is required.' });

    const hasReference = /^data:image\/(jpeg|png|webp);base64,/i.test(referenceImage);
    const identityDirection = hasReference
      ? `\nIDENTITY REFERENCE\nAn attached photograph shows the real child who is the main hero. Preserve the child's recognisable identity across the illustration: face shape, eyes, nose, smile, hair colour, hair texture, approximate skin tone and age. Translate the child naturally into the storybook painting style rather than making the result photographic. Do not copy the photograph's background, clothing or pose unless the scene calls for them. The child should clearly look like the same person in every illustration.`
      : '';

    const finalPrompt = `Create a single full-page illustration for a premium children's bedtime storybook.

ART DIRECTION
${style || 'Warm, charming, timeless British storybook illustration; painterly traditional feel, expressive characters, gentle lighting, rich but soft detail, magical without being frightening.'}
${identityDirection}

SCENE
${prompt}

IMPORTANT
- This is an illustration for children aged 3-12.
- Keep the mood warm, adventurous and reassuring.
- No words, letters, captions, signs, logos or typography anywhere in the image.
- Do not make it photorealistic, 3D-rendered or cartoonishly plastic.
- Compose the scene as a beautiful book illustration with clear focal characters and readable silhouettes.
- Keep character appearance consistent with the description in the scene and, when supplied, the attached identity reference.
- Every page in a story must be a genuinely new illustration. If the scene prompt identifies a page/scene number or previous-page context, use that information to advance the visual action and avoid repeating the previous composition, pose, camera angle or background staging.
- Square composition suitable for the right-hand page of a children's book.`;

    let r;
    if (hasReference) {
      const match = referenceImage.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);
      if (!match) return res.status(400).json({ error: 'The child photo could not be read.' });
      const mime = match[1].toLowerCase();
      const bytes = Buffer.from(match[2], 'base64');
      const extension = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
      const form = new FormData();
      form.append('model', 'gpt-image-2.5-flare');
      form.append('prompt', finalPrompt);
      form.append('image', new Blob([bytes], { type: mime }), `child-reference.${extension}`);
      form.append('size', '1024x1024');
      form.append('quality', 'low');
      form.append('output_format', 'webp');
      r = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form
      });
    } else {
      r = await fetch('https://api.openai.com/v1/images/generations', {
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
    }

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

    return res.status(200).json({ image: `data:image/webp;base64,${item.b64_json}`, usedReferencePhoto: hasReference });
  } catch (e) {
    console.error('illustrate error', e);
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
