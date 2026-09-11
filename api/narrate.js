const {logUsage,estimateGBP}=require('../_usage');
const {verifyMoonbeamUser,consumeGenerationSlot,refundGenerationSlot}=require('../_credits');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^[\'"]|[\'"]$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const text = String(body.text || '').trim();
    const generationRunId = String(body.generationRunId || '').trim();
    const language = String(body.language || 'en-GB');
    if (!text) return res.status(400).json({ error: 'Narration text is required.' });
    if (!generationRunId) return res.status(400).json({ error: 'This saved story predates the secure narration allowance.' });
    const moonbeamUser=await verifyMoonbeamUser(req);
    try{await consumeGenerationSlot(moonbeamUser.id,generationRunId,'narration')}catch(e){return res.status(e.status||402).json({error:e.message,code:e.code||'GENERATION_LIMIT'})}
    let slotReserved=true;const refundSlot=async()=>{if(slotReserved){slotReserved=false;await refundGenerationSlot(moonbeamUser.id,generationRunId,'narration')}};
    if (text.length > 4096) return res.status(400).json({ error: 'This page is too long to narrate.' });
    const narrationProfiles = {
      'en-GB': 'Speak in natural contemporary British English with a neutral educated British accent. Use authentic British sentence rhythm, word stress, syllable stress and intonation. Avoid American pronunciation, exaggerated Received Pronunciation, sing-song delivery, misplaced emphasis, and unnatural pauses. Read punctuation naturally and keep names consistent.',
      'en-US': 'Speak in natural American English with a warm, neutral contemporary US accent. Use American pronunciation throughout.',
      'es-ES': 'Speak in European Spanish from Spain with a natural neutral Peninsular Spanish accent and pronunciation, including normal distinctions used in Spain where appropriate. Do not use a Latin American accent.',
      'es-419': 'Speak in natural Latin American Spanish with a warm, broadly neutral Latin American accent. Do not use a Peninsular Spanish accent.',
      'fr-FR': 'Speak in French from France with a natural, warm, neutral metropolitan French accent and pronunciation.',
      'de-DE': 'Speak in German from Germany with a natural, warm, neutral Standard German accent and pronunciation.',
      'it-IT': 'Speak in Italian from Italy with a natural, warm, neutral standard Italian accent and pronunciation.',
      'pt-BR': 'Speak in Brazilian Portuguese with natural native Brazilian pronunciation, rhythm, stress and intonation. Use a warm, broadly neutral Brazilian accent. Do not use European Portuguese pronunciation.',
      'pl-PL': 'Speak in natural native Polish with authentic Polish pronunciation, lexical stress, sentence rhythm and intonation. Avoid English-influenced vowels, consonants or stress. Read warmly and conversationally.'
    };
    const accentInstruction = narrationProfiles[language] || 'Speak naturally in the language and regional variety of the text.';

    // V42: don't rely on accent prompting alone. Start each locale from a
    // deliberately selected built-in voice, then reinforce the regional accent.
    const voiceProfiles = {
      'en-GB': 'fable',
      'en-US': 'marin',
      'es-ES': 'cedar',
      'es-419': 'coral',
      'fr-FR': 'shimmer',
      'de-DE': 'onyx',
      'it-IT': 'nova',
      'pt-BR': 'sage',
      'pl-PL': 'cedar'
    };
    const voice = voiceProfiles[language] || 'marin';
    const instructions = `${accentInstruction} Read as an experienced, warm children's audiobook narrator. Use natural native prosody, conversational phrasing, clear diction, and subtle character expression. Let punctuation guide breathing and pauses. Never sound theatrical, robotic, sing-song, or frightening. Keep the selected regional accent consistent for the entire page. Do not imitate any real person.`;
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice, input: text, instructions, response_format: 'mp3', speed: 0.96 })
    });
    if (!r.ok) {
      const raw = await r.text(); let data={}; try{data=JSON.parse(raw)}catch{}
      const e=data?.error; const message=typeof e==='string'?e:(e?.message||e?.code||`OpenAI returned HTTP ${r.status}`);
      await refundSlot();
      return res.status(502).json({ error:String(message), openai_status:r.status });
    }
    const bytes = Buffer.from(await r.arrayBuffer());
    await logUsage({event_type:'narration',estimated_cost_gbp:estimateGBP('narration'),metadata:{model:'gpt-4o-mini-tts',characters:text.length,user_id:moonbeamUser.id,generation_run_id:generationRunId}});
    slotReserved=false;
    return res.status(200).json({ audio:`data:audio/mpeg;base64,${bytes.toString('base64')}` });
  } catch (e) {
    console.error('narrate error', e);
    return res.status(500).json({ error: String(e?.message || e) });
  }
};
