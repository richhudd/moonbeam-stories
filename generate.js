module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const rawApiKey = process.env.OPENAI_API_KEY || '';
  const apiKey = rawApiKey.trim().replace(/^[\"']|[\"']$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });

  try {
    const { child } = req.body || {};
    if (!child || !child.name || !child.age) {
      return res.status(400).json({ error: 'Please provide a name or nickname and an age.' });
    }

    const values = Array.isArray(child.values) ? child.values.join(', ') : 'kindness, curiosity';
    const prompt = `Create an original, warm bedtime story for a child.
Child nickname: ${child.name}
Age: ${child.age}
Interests: ${child.interests || 'anything imaginative'}
Avoid: ${child.dislikes || 'nothing specified'}
Length: ${child.length || 'short'}
Tone: ${child.tone || 'cosy and funny'}
Story values to weave naturally into the plot: ${values}

Never preach. No politics, religion, sexual content, graphic violence, frightening horror, dangerous instructions, or adult themes. Use age-appropriate vocabulary. Do not make the child the protagonist unless their name is explicitly requested as a character.

Return ONLY valid JSON, with exactly these keys:
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
}
Each page should be roughly 60-120 words. Illustration prompts should describe the scene only, with no text or lettering and without specifying the child's appearance.`;

    const textResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna',
        input: prompt
      })
    });

    const textData = await textResponse.json();
    if (!textResponse.ok) {
      console.error('OpenAI text error:', textData);
      return res.status(500).json({ error: textData?.error?.message || `OpenAI text request failed (${textResponse.status}).` });
    }

    let output = textData.output_text || '';
    output = output.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    let story;
    try {
      story = JSON.parse(output);
    } catch (parseError) {
      console.error('Story JSON parse error:', output);
      return res.status(500).json({ error: 'The story generator returned an invalid story format. Please try again.' });
    }

    let image = null;
    const firstPrompt = story.pages?.[0]?.illustration_prompt || 'A cosy magical bedtime adventure';
    const imagePrompt = `Children's picture-book illustration. ${firstPrompt}. Beautiful gentle colourful storybook art, friendly expressions, soft evening atmosphere, no text, no lettering.`;

    try {
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
          prompt: imagePrompt
        })
      });
      const imageData = await imageResponse.json();
      if (imageResponse.ok && imageData?.data?.[0]?.b64_json) {
        image = `data:image/png;base64,${imageData.data[0].b64_json}`;
      } else {
        console.error('Image generation error:', imageData);
      }
    } catch (imageError) {
      console.error('Image generation request failed:', imageError);
    }

    return res.status(200).json({ story, image });
  } catch (e) {
    console.error('Generate error:', e);
    return res.status(500).json({ error: e.message || 'Something went wrong.' });
  }
};
