const {logUsage,estimateGBP}=require('../_usage');
const {verifyMoonbeamUser,reserveStoryCredit,refundReservedStoryCredit,createGenerationRun}=require('../_credits');
const {randomInt}=require('crypto');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });

  let reservedUserId=null, reservedBatchId=null, creditReserved=false;
  const supportStartedAt=Date.now();
  let supportUserId=null;
  let supportLogged=false;
  const logSupportAttempt=async(status,extra={})=>{
    if(supportLogged)return;
    supportLogged=true;
    try{
      await logUsage({
        event_type:'generation_attempt',
        estimated_cost_gbp:0,
        metadata:{
          user_id:supportUserId||reservedUserId||null,
          status,
          credit_deducted:!!extra.credit_deducted,
          credit_refunded:!!extra.credit_refunded,
          generation_run_id:extra.generation_run_id||null,
          error_code:extra.error_code||null,
          images_generated:Number(extra.images_generated||0),
          duration_ms:Date.now()-supportStartedAt
        }
      });
    }catch(e){console.error('support generation log failed',e)}
  };
  const refundOuterReservation=async()=>{if(!creditReserved||!reservedUserId)return;creditReserved=false;try{await refundReservedStoryCredit(reservedUserId,reservedBatchId)}catch(refundError){console.error('credit refund error',refundError)}};
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const child = body.child || {};
    const cast = Array.isArray(child.cast) ? child.cast.filter(m=>m&&m.name&&m.role) : [];
    const heroes = cast.filter(m=>m.role==='hero'&&m.kind==='child');
    if (!heroes.length && (!child.name || !Number.isFinite(Number(child.age)))) return res.status(400).json({ error: 'Please choose at least one child as a hero.' });
    const age = heroes.length ? Math.min(...heroes.map(h=>Number(h.age)).filter(Number.isFinite)) : Number(child.age);
    if(!Number.isFinite(age)) return res.status(400).json({error:'Please provide a valid hero age.'});
    const length = 'standard';

    // V50: every new Moonbeam story has the same predictable length and cost.
    const moonbeamUser = await verifyMoonbeamUser(req);
    supportUserId=moonbeamUser.id;
    let creditsRemaining;
    try {
      const reservation = await reserveStoryCredit(moonbeamUser.id);
      creditsRemaining = reservation.remaining; reservedBatchId = reservation.batchId; reservedUserId=moonbeamUser.id;
    } catch (e) {
      return res.status(e.status || 500).json({ error: e.message, code: e.code || 'CREDIT_ERROR', batchId: e.batchId || null });
    }
    creditReserved = true;
    const refundReservedCredit = async () => {
      if (!creditReserved) return;
      creditReserved = false;
      await refundReservedStoryCredit(moonbeamUser.id,reservedBatchId);
    };
    const language = child.language || 'en-GB';
    const languageGuide = {
      'en-GB': 'Write in natural British English.',
      'en-US': 'Write in natural American English.',
      'es-ES': 'Escribe en español natural de España.',
      'es-419': 'Escribe en español latinoamericano neutro y natural.',
      'fr-FR': 'Écris en français naturel de France.',
      'de-DE': 'Schreibe in natürlichem Deutsch aus Deutschland.',
      'it-IT': 'Scrivi in italiano naturale d’Italia.',
      'pt-BR': 'Escreva em português brasileiro natural.',
      'pl-PL': 'Pisz naturalnym, współczesnym językiem polskim.'
    }[language] || 'Write in natural British English.';

    // V253 creative reset: page count is a book-format constraint only. Text length is not prescribed.
    const pageCount = 4;
    const storyIdea = String(child.storyIdea || '').trim();

    const castLines = cast.length ? cast.map(m=>{
      const detail=m.kind==='child'?`child, age ${m.age}`:m.kind==='adult'?`adult${m.relationship?`, relationship/context: ${m.relationship}`:''}`:`${m.animal_type||'pet'}${m.breed?`, breed: ${m.breed}`:''}`;
      const role=m.role==='hero'?'HERO':'AVAILABLE CAST';
      return `- ${m.name} — ${detail} — ${role}`;
    }).join('\n') : `- ${child.name} — child, age ${age} — HERO`;

    const inspiration = storyIdea
      ? `The family supplied this optional inspiration:\n${storyIdea}\nUse it as creative material. Respect anything clearly intended as a factual requirement, but do not assume a few ingredients are already a complete plot. Find the most imaginative story they can naturally inspire.`
      : `The family supplied no story idea. You have complete freedom to invent one.`;

    const prompt = `You are a gifted, exceptionally imaginative children's storyteller.

Create an original story especially for the child hero or co-heroes below. First imagine a story genuinely worth telling; think beyond the obvious first idea. Then tell it beautifully. Aim for the kind of story a child might remember and ask to hear again, not merely one that is coherent.

Let THIS story decide its own structure, length, tone, pace, humour, degree of fantasy or realism, use of repetition, rhythm, rhyme, dialogue and ending. Rhyme or musical language is welcome when it genuinely makes the story more delightful to read aloud, but it is never compulsory. Do not follow a standard plot formula and do not add events merely to fill space.

The only creative hard constraint is age suitability: this story is for a child aged ${age}. Use your judgement about the language, complexity, emotional intensity and amount of text that are right for that age and for this particular story.

STORY PEOPLE AND PETS
${castLines}

The HERO or HEROES tell you whose story this fundamentally is. The other selected Cast are simply familiar people or pets available to the story if they are naturally useful. They do not have to appear, help, supervise, speak, or receive equal attention. Let the story itself determine who is present and important at any moment. Do not invent family relationships that have not been supplied. Use supplied names exactly as given.

${inspiration}
${child.dislikes ? `\nThe family specifically asked to avoid: ${child.dislikes}` : ''}

${languageGuide}

The story will become an illustrated book. Moonbeam's reader requires an opening, ${pageCount} middle text pages and a closing, but these are containers for the story rather than prescribed story beats. Divide the finished story naturally across them. Text pages may differ greatly in length and may scroll. Do not pad or compress the story to make the sections equal.

For each middle page, provide a concise illustration_prompt describing the moment from that page that would make the best illustration. Include only characters actually present in that moment. Do not force Cast members into pictures merely because they are available.

Also provide a concise character_bible solely for visual continuity of recurring characters. For a selected Cast member whose reference photo is supplied by the app, do not invent a conflicting physical identity; record only their name/role and any story-specific clothing or continuity details. For recurring characters without a photo, give enough stable visual detail for the illustrator to depict the same character consistently. Do not redesign recurring characters between pages.

Return VALID JSON ONLY with exactly this shape:
{"title":"string","opening":"string","character_bible":"string","pages":[{"text":"string","illustration_prompt":"string"}],"closing":"string"}
The pages array must contain exactly ${pageCount} objects because the book has ${pageCount} middle illustration pages.

Do not imitate, reproduce or closely transform the wording, characters or plot of an existing book or author. Invent this story yourself.`;

    async function callStoryModel(input, maxOutputTokens = 5000) {
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-5.6-luna', input, max_output_tokens: maxOutputTokens })
      });
      const raw = await r.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = {}; }
      if (!r.ok) {
        const e = data && data.error;
        const message = typeof e === 'string' ? e : (e && (e.message || e.code || e.type)) || `OpenAI returned HTTP ${r.status}`;
        const error = new Error(String(message));
        error.openaiStatus = r.status;
        throw error;
      }
      let output = typeof data.output_text === 'string' ? data.output_text : '';
      if (!output && Array.isArray(data.output)) {
        for (const item of data.output) {
          if (!Array.isArray(item.content)) continue;
          for (const part of item.content) {
            if (typeof part.text === 'string') output += part.text;
            else if (typeof part.output_text === 'string') output += part.output_text;
          }
        }
      }
      return String(output || '').trim();
    }

    function candidateJsonStrings(text) {
      const clean = String(text || '').trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '');
      const candidates = [];
      if (clean) candidates.push(clean);

      // Extract the first balanced JSON object even if the model surrounded it with prose.
      let start = -1, depth = 0, inString = false, escaped = false;
      for (let i = 0; i < clean.length; i++) {
        const ch = clean[i];
        if (inString) {
          if (escaped) escaped = false;
          else if (ch === '\\') escaped = true;
          else if (ch === '"') inString = false;
          continue;
        }
        if (ch === '"') { inString = true; continue; }
        if (ch === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (ch === '}' && depth > 0) {
          depth--;
          if (depth === 0 && start >= 0) {
            candidates.push(clean.slice(start, i + 1));
            break;
          }
        }
      }
      return [...new Set(candidates.filter(Boolean))];
    }

    function parseStoryOutput(text) {
      for (const candidate of candidateJsonStrings(text)) {
        for (const version of [candidate, candidate.replace(/,\s*([}\]])/g, '$1')]) {
          try {
            const parsed = JSON.parse(version);
            const story = parsed && parsed.story && typeof parsed.story === 'object' ? parsed.story : parsed;
            if (story && typeof story === 'object') return story;
          } catch {}
        }
      }
      return null;
    }

    function normaliseStory(story) {
      if (!story || typeof story !== 'object') return null;
      const pages = Array.isArray(story.pages) ? story.pages.map(p => ({
        text: typeof p?.text === 'string' ? p.text.trim() : '',
        illustration_prompt: typeof p?.illustration_prompt === 'string' && p.illustration_prompt.trim()
          ? p.illustration_prompt.trim()
          : 'A charming children’s storybook illustration matching this part of the adventure.'
      })).filter(p => p.text) : [];
      const normal = {
        title: typeof story.title === 'string' ? story.title.trim() : '',
        opening: typeof story.opening === 'string' ? story.opening.trim() : '',
        character_bible: typeof story.character_bible === 'string' && story.character_bible.trim()
          ? story.character_bible.trim()
          : `Keep ${String(child.name)} visually consistent throughout the book, age ${age}, with the same hair, facial features and clothing unless the story explicitly changes clothing.`,
        pages,
        closing: typeof story.closing === 'string' ? story.closing.trim() : ''
      };
      if (!normal.title || !normal.opening || !normal.closing || normal.pages.length !== pageCount) return null;
      return normal;
    }

    let firstOutput = '';
    let story = null;
    try {
      firstOutput = await callStoryModel(prompt);
      story = normaliseStory(parseStoryOutput(firstOutput));
    } catch (e) {
      if (e.openaiStatus) { await refundReservedCredit(); return res.status(502).json({ error: e.message, openai_status: e.openaiStatus }); }
      throw e;
    }

    // If the model produced almost-JSON, ask it to repair its own output once rather than
    // showing the reader a formatting error. This also catches missing required fields.
    if (!story) {
      const repairInput = `Repair the following Moonbeam Stories response into VALID JSON ONLY. Do not add markdown, commentary or code fences. Preserve the story itself rather than rewriting it. The story must remain suitable for a child aged ${age}.

Required top-level shape:
{"title":"string","opening":"string","character_bible":"string","pages":[{"text":"string","illustration_prompt":"string"}],"closing":"string"}
The pages array must contain exactly ${pageCount} objects. Every page needs non-empty text and illustration_prompt. Keep supplied Cast names exactly as supplied. If JSON truncation left material incomplete, complete only what is necessary to make the existing story valid and complete. Do not impose a plot formula, word count, equal page length, moral, or additional Cast participation.

RESPONSE TO REPAIR:
${firstOutput.slice(0, 26000)}`;
      try {
        const repairedOutput = await callStoryModel(repairInput, 5000);
        story = normaliseStory(parseStoryOutput(repairedOutput));
      } catch (e) {
        if (e.openaiStatus) { await refundReservedCredit(); return res.status(502).json({ error: e.message, openai_status: e.openaiStatus }); }
        throw e;
      }
    }

    if (!story) {
      await refundReservedCredit();
      return res.status(502).json({ error: 'Moonbeam could not finish this story correctly. Please tap Make Tonight’s Story again.' });
    }

    // V253: no creative word-count policing or equal-page reflow.
    if (!Array.isArray(story.pages)) story.pages = [];
    const originalPageCount = story.pages.length;
    while (story.pages.length < pageCount) {
      story.pages.push({ text: '', illustration_prompt: 'Illustrate this moment from the story naturally.' });
    }
    if (story.pages.length > pageCount) story.pages = story.pages.slice(0, pageCount);
    const wordCount = value => String(value || '').trim().split(/\s+/).filter(Boolean).length;
    const textScreens = [story.opening, ...story.pages.map(p => p && p.text), story.closing];
    const counts = textScreens.map(wordCount);

    const generationRunId = await createGenerationRun(moonbeamUser.id);
    await logUsage({event_type:'story',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-5.6-luna',user_id:moonbeamUser.id,generation_run_id:generationRunId}});
    await logSupportAttempt('success',{credit_deducted:true,credit_refunded:false,generation_run_id:generationRunId});
    creditReserved = false;
    return res.status(200).json({
      creditsRemaining,
      generationRunId,
      story,
      image: null,
      layout: {
        requestedLength: length,
        storyPages: pageCount,
        displayedTextPages: pageCount + 2,
        pageWordCounts: counts,
        automaticallyReflowed: false,
        originalStoryPages: originalPageCount
      }
    });
  } catch (e) {
    console.error('generate error', e);
    const hadReservedCredit=creditReserved;
    await refundOuterReservation();
    await logSupportAttempt('failed',{
      credit_deducted:hadReservedCredit,
      credit_refunded:hadReservedCredit,
      error_code:e?.code||e?.status||'GENERATION_ERROR'
    });
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
