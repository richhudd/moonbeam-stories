const OpenAI = require('openai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
  try {
    const { child } = req.body || {};
    if (!child || !child.name || !child.age) return res.status(400).json({ error: 'Please provide a name and age.' });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const values = Array.isArray(child.values) ? child.values.join(', ') : '';
    const prompt = `Create an original, warm bedtime story for a child. Child nickname: ${child.name}. Age: ${child.age}. Interests: ${child.interests || 'anything imaginative'}. Avoid: ${child.dislikes || 'nothing specified'}. Length: ${child.length || 'short'}. Tone: ${child.tone || 'cosy and funny'}. Story values to weave naturally into the plot: ${values || 'kindness, courage, curiosity'}. Never preach. No politics, religion, sexual content, graphic violence, frightening horror, dangerous instructions, or adult themes. Use age-appropriate vocabulary. Return JSON only with keys: title (string), opening (string), pages (array of 4 objects each with text and illustration_prompt), closing (string). Each page should be 80-130 words for a medium story, adjusted sensibly for the requested length. Illustration prompts should describe the scene only and keep the child's appearance unspecified.`;
    const response = await client.responses.create({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna',
      input: prompt,
      text: { format: { type: 'json_object' } }
    });
    const story = JSON.parse(response.output_text);
    const imagePrompt = `Children's picture-book illustration for the bedtime story "${story.title}". ${story.pages?.[0]?.illustration_prompt || 'A magical cosy bedtime adventure'}. Beautiful, gentle, colourful storybook art, friendly expressions, soft evening atmosphere, no text, no lettering.`;
    let image = null;
    try {
      const imageResponse = await client.images.generate({
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
        prompt: imagePrompt,
        size: '1024x1024',
        quality: 'medium'
      });
      image = imageResponse.data?.[0]?.b64_json ? `data:image/png;base64,${imageResponse.data[0].b64_json}` : null;
    } catch (e) {
      console.error('Image generation failed:', e.message);
    }
    return res.status(200).json({ story, image });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Something went wrong.' });
  }
};
