module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const apiKey = String(process.env.OPENAI_API_KEY || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured in Vercel.'
    });
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : (req.body || {});

    const child = body.child || {};

    if (!child.name || !Number.isFinite(Number(child.age))) {
      return res.status(400).json({
        error: 'Please provide a name and age.'
      });
    }

    const prompt = `Write an original bedtime story for a child.

Child nickname: ${String(child.name)}
Age: ${Number(child.age)}
Interests: ${child.interests || 'imagination'}
Avoid: ${child.dislikes || 'nothing specific'}
Length: ${child.length || 'medium'}
Tone: ${child.tone || 'cosy and funny'}
Story values: ${(Array.isArray(child.values)
  ? child.values
  : ['Kindness', 'Curiosity']).join(', ')}

Keep it warm, age-appropriate and non-preachy.

No politics, religion, sexual content, graphic violence, horror,
dangerous instructions or adult themes.

Return JSON only with this exact shape:

{
  "title": "string",
  "opening": "string",
  "pages": [
    {"text": "string", "illustration_prompt": "string"},
    {"text": "string", "illustration_prompt": "string"},
    {"text": "string", "illustration_prompt": "string"},
    {"text": "string", "illustration_prompt": "string"}
  ],
  "closing": "string"
}`;

    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-5.6-luna',
          input: prompt,
          max_output_tokens: 2500
        })
      }
    );

    const raw = await response.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {};
    }

    if (!response.ok) {
      const e = data && data.error;

      const message =
        typeof e === 'string'
          ? e
          : (e && (e.message || e.code || e.type)) ||
            `OpenAI returned HTTP ${response.status}`;

      return res.status(502).json({
        error: String(message),
        openai_status: response.status
      });
    }

    let output =
      typeof data.output_text === 'string'
        ? data.output_text
        : '';

    if (!output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (Array.isArray(item.content)) {
          for (const part of item.content) {
            if (typeof part.text === 'string') {
              output += part.text;
            }
          }
        }
      }
    }

    output = output
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/, '');

    let story;

    try {
      story = JSON.parse(output);
    } catch {
      return res.status(502).json({
        error: 'OpenAI responded, but not in the required story format.',
        debug: output.slice(0, 500)
      });
    }

    return res.status(200).json({
      story,
      image: null
    });

  } catch (e) {
    console.error('generate error', e);

    return res.status(500).json({
      error: String(e && e.message ? e.message : e)
    });
  }
};
