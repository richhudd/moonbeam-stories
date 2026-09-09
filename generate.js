module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^['"]|['"]$/g,'');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured for this Vercel deployment.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const child = body.child || {};
    if (!child.name || !Number.isFinite(Number(child.age))) return res.status(400).json({error:'Please provide a name and age.'});
    const prompt = `Write an original bedtime story for a child. Child nickname: ${child.name}. Age: ${child.age}. Interests: ${child.interests||'imagination'}. Avoid: ${child.dislikes||'nothing specific'}. Length: ${child.length||'medium'}. Tone: ${child.tone||'cosy and funny'}. Story values: ${(child.values||['Kindness','Curiosity']).join(', ')}. Keep it warm, age-appropriate and non-preachy. No politics, religion, sexual content, graphic violence, horror, dangerous instructions or adult themes. Return ONLY valid JSON with keys title, opening, pages, closing. pages must be an array of 4 objects, each with text and illustration_prompt.`;
    const r = await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.6-luna',input:prompt})});
    const text = await r.text();
    let data; try{data=JSON.parse(text);}catch{data={};}
    if(!r.ok) return res.status(502).json({error:data.error?.message||`OpenAI returned HTTP ${r.status}.`});
    let output=String(data.output_text||'').trim().replace(/^```json\s*/i,'').replace(/\s*```$/,'');
    let story; try{story=JSON.parse(output);}catch{return res.status(502).json({error:'OpenAI returned an invalid story format. Please try again.'});}
    return res.status(200).json({story,image:null});
  } catch(e) { console.error(e); return res.status(500).json({error:e.message||'Story generation failed.'}); }
};
