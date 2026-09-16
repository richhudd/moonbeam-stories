const {logUsage,estimateGBP}=require('../_usage');
const {verifyMoonbeamUser,reserveStoryCredit,refundReservedStoryCredit,createGenerationRun}=require('../_credits');
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
    if (cast.length > 2 || (cast.length === 2 && heroes.length < 1)) return res.status(400).json({ error: 'A story can feature a maximum of two Cast members, with at least one hero.' });
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
      'en-GB': 'Write in natural British English. Use British spelling and vocabulary, such as colour, favourite, holiday, trousers, biscuit, torch and garden where natural.',
      'en-US': 'Write in natural American English. Use American spelling and vocabulary, such as color, favorite, vacation, pants, cookie, flashlight and yard where natural.',
      'es-ES': 'Escribe en español natural de España. Usa ortografía, vocabulario y expresiones habituales en España, sin latinoamericanismos innecesarios.',
      'es-419': 'Escribe en español latinoamericano neutro y natural. Evita localismos muy específicos de un solo país y usa vocabulario ampliamente comprensible en Latinoamérica.',
      'fr-FR': 'Écris en français naturel de France. Utilise l’orthographe, le vocabulaire et les expressions courantes en France.',
      'de-DE': 'Schreibe in natürlichem Deutsch aus Deutschland. Verwende deutsche Rechtschreibung sowie in Deutschland übliche Wörter und Ausdrücke.',
      'it-IT': 'Scrivi in italiano naturale d’Italia. Usa ortografia, vocabolario ed espressioni comuni in Italia.',
      'pt-BR': 'Escreva em português brasileiro natural, usando ortografia, vocabulário e expressões comuns no Brasil.',
      'pl-PL': 'Pisz naturalnym, współczesnym językiem polskim odpowiednim dla dziecka. Używaj idiomatycznej polszczyzny, naturalnych dialogów i poprawnej gramatyki.'
    }[language] || 'Write in natural British English.';
    // Standard Moonbeam format: opening + 4 story pages + closing = 6 reading spreads.
    const lengthConfig = { pages: 4, totalScreens: 6, totalWords: 'about 650-750 words' };
    const pageCount = 4;
    const lengthGuide = lengthConfig.totalWords;
    const targetPerScreen = '105-125 words';

    // V250.13: creative cleanup. A blank Story Idea no longer receives a genre/reality/magic/
    // companion/object/twist blueprint. The storyteller chooses the premise freely within the
    // age-safety, Cast and technical output constraints below.
    const storyIdea = String(child.storyIdea || '').trim();

    const ageBand = age <= 5 ? '3-5' : age <= 8 ? '6-8' : '9-12';
    const ageProfiles = {
      '3-5': {
        label:'early-years',
        writing:'Use short, clear sentences, concrete language, simple cause-and-effect and frequent reassuring cues. Keep the central situation easy to understand. Excitement, wonder, absurdity and fantasy are welcome, but frightening or threatening moments must be brief and quickly reassuring.',
        stakes:'gentle and reassuring; no realistic danger, crime, horror, death-focused plots, abduction, weapons, war, serious injury or frightening villains',
        forbidden:'murder, true crime, kidnapping, abduction, realistic weapons, war, horror, gore, serious injury, death-focused plots, predatory threat, terrifying monsters, adult criminal behaviour'
      },
      '6-8': {
        label:'younger-reader',
        writing:'Use lively but accessible prose, clear motivations, strong cause-and-effect, humour and moderate suspense where natural. Mild peril may occur but must remain clearly child-safe, non-graphic and recover into reassurance.',
        stakes:'exciting but child-safe; no murder/true crime, graphic violence, realistic weapon use, horror, abduction plots or adult criminal menace',
        forbidden:'murder, true crime, kidnapping, abduction, graphic injury, realistic weapon use, horror, gore, adult criminal menace'
      },
      '9-12': {
        label:'older-child',
        writing:'Use richer vocabulary, more layered motivations, stronger suspense, subtler humour and a more sophisticated story where natural, while remaining clearly suitable for a child. Peril can feel meaningful but must not become graphic, horrific or adult in subject matter.',
        stakes:'meaningful story stakes without graphic violence, sexual content, true-crime treatment, torture, gore or adult horror',
        forbidden:'graphic violence, gore, torture, sexual content, true-crime treatment, sadistic threat, adult horror'
      }
    };
    const ageProfile = ageProfiles[ageBand];

    const ideaGuide = storyIdea
      ? `PARENT STORY IDEA — AUTHORITATIVE\n${storyIdea}\nUse this idea as the creative brief. Develop it imaginatively without adding a competing premise. Age-safety rules still override any unsuitable detail.`
      : `NO PARENT STORY IDEA\nInvent the story freely. There is no prescribed genre, reality level, magic level, setting, companion, object, quest, twist, moral or ending type.`;

    const castLines = cast.length ? cast.map(m=>{const detail=m.kind==='child'?`child, age ${m.age}`:m.kind==='adult'?`adult`:`${m.animal_type||'pet'}${m.breed?`, breed: ${m.breed}`:''}`;return `- ${m.name} — ${detail} — ${String(m.role).toUpperCase()}`}).join('\n') : `- ${child.name} — child, age ${age} — HERO`;
    const roleRules = `Roles describe narrative prominence only, not authority, competence or who is allowed to act.
HERO means the story is principally about that character. With two heroes, both are genuine co-heroes.
SUPPORTING CAST means secondary narrative focus, not passive behaviour. Every selected Cast member may act, decide, help, fail, succeed, solve problems or change the course of events as the story naturally requires. Let behaviour arise from character and events rather than from age or role labels.
Do not force every selected character into every scene.
CAST IS AUTHORITATIVE: when a structured Story Cast is supplied, the selected Heroes and Supporting Cast are the complete principal cast for the story. Do not invent additional named, recurring, familial, companion, friend, helper, rival or other plot-significant characters. Unnamed incidental/background people may appear when naturally required by the setting, but they must remain incidental and must not acquire a subplot, family unit, recurring identity or central story function. Never invent a spouse, partner, child, parent, sibling, relative or friend for a selected Cast member unless the parent explicitly establishes that person in the Story Idea.`
    const prompt = `You are the lead children's author for Moonbeam Stories. Write a completely original children's story centred on the selected hero or co-heroes. The story may be read at bedtime, but bedtime is the reading occasion, NOT the fictional setting.

STORY CAST
${castLines}

CAST ROLES
${roleRules}

NAME AND IDENTITY LOCK
Use every selected character's supplied name exactly as given. Never invent or append surnames, middle names, nicknames, honorifics, pet names or alternative forms unless the parent establishes them in the Story Idea. Relationships and forms of address stated in the Story Idea should be respected. Do not invent additional family relationships. Where the parent has not defined a relationship or form of address, keep it neutral rather than guessing.
Youngest hero age for safety calibration: ${age}
${ideaGuide}
Things to avoid: ${child.dislikes || 'nothing specific'}
Standard Moonbeam length: ${lengthGuide}
Language: ${language}
Language guidance: ${languageGuide}

TONE, THEMES AND MORALS
Infer the tone, atmosphere, humour, emotional arc and any themes naturally from the Story Idea, the selected Cast, their ages and the events of the story. There is NO selected tone and there are NO selected values. Do not default to kindness, curiosity, courage or any other predetermined value. A Moonbeam story does not need to teach a lesson or contain a moral. Do not impose an educational message or moral; if a theme emerges naturally from what happens, let it remain implicit rather than announcing it.

MOONBEAM CREATIVE BRIEF
Write an original, polished children’s story in natural ${language}. Use clear, elegant prose, vivid but economical description, natural dialogue where useful, warmth, humour and emotional range as the particular story calls for.
Write with genuine imaginative freedom. Seek a strong, surprising central idea that makes this particular story worth telling. Reality may be ordinary, impossible, absurd, magical, fantastical, futuristic, dreamlike or something else entirely. Magic and fantasy are welcome but never compulsory; realism is equally welcome when the underlying idea is genuinely compelling. Do not treat an ordinary activity by itself as an imaginative adventure.
Do not assemble the story from compulsory children's-story ingredients. There is no required magical companion, special object, quest, mystery, hidden door, twist, lesson or fantasy device. Equally, do not avoid any of those things when they arise naturally from a strong original idea. Prefer a compelling central conception developed with confidence over a collection of generic ingredients.
The selected Cast are the principal characters. Wonder should come from the story itself rather than from automatically inventing a cute helper or stock fantasy sidekick. Let the Cast encounter, cause, react to and participate in extraordinary events as naturally as the story requires.
Surprise the reader without becoming random or incoherent. The finished story should feel authored rather than generated from a visible formula.

SETTING AND STORY SHAPE
${storyIdea ? 'Let the parent’s Story Idea establish whatever it establishes, and freely invent the unstated details needed to turn it into a complete, imaginative, age-appropriate story.' : 'Choose the premise, setting, story world and shape freely. Do not default to mundane everyday activity merely because it is safe or familiar.'}
Do not default to nighttime, moonlight, stars, sleep, bedrooms, pyjamas or bedtime imagery merely because the story may be read at bedtime.
The story should develop, change and reach a satisfying ending, but do not force a fixed sequence of attempts, setbacks, choices, revelations or other predetermined beats. Let its structure arise from its central idea.

NARRATIVE PROGRESSION
Avoid static repetition. Across the six displayed reading spreads, the situation should genuinely develop so that the illustrations have meaningfully different moments to depict. A single location is perfectly acceptable; do not force location changes or camera-driven events into the prose merely for illustration variety.

Do NOT imitate or reproduce the wording, characters, plots, or distinctive passages of any existing author or book. This must be an original Moonbeam story. Do not mention authors or literary styles in the story itself.

AGE-SUITABILITY — HARD CONSTRAINT
Child age: ${age}; band: ${ageBand} (${ageProfile.label}).
${ageProfile.writing}
Permitted stakes: ${ageProfile.stakes}.
Explicitly excluded for this age band: ${ageProfile.forbidden}.
Age suitability overrides any unsuitable parent detail or invented premise. Preserve the harmless imaginative core whenever possible rather than flattening it into mundane realism.

GENERAL SAFETY
No politics, religion, sexual content, graphic violence, dangerous instructions or adult themes. Keep the experience emotionally safe for the youngest hero age ${age}. Do not impose a moral or predetermined value theme. Avoid clichés, generic filler and repetitive phrasing.

OUTPUT
Return JSON only, with exactly this shape:
{"title":"string","opening":"string","character_bible":"string","pages":[...exactly ${pageCount} page objects...],"closing":"string"}

The opening, exactly ${pageCount} story pages and closing must together form one continuous story of the requested length. The page count is mandatory: exactly 4 story pages, plus the opening and closing, for 6 displayed reading spreads in total.

REAL-BOOK PAGE BALANCE — MANDATORY
The app displays ONE text page beside ONE equally sized illustration. Every displayed text page must therefore contain approximately the same amount of prose.
- Write the opening at approximately ${targetPerScreen}.
- Write EACH of the ${pageCount} page.text fields at approximately ${targetPerScreen}.
- Write the closing at approximately 90-115 words.
- Never make one page a few sentences while another is several long paragraphs.
- Keep each displayed page self-contained enough to turn naturally, but do not add headings inside the prose.
- Use exactly ${lengthConfig.totalScreens} displayed text pages in total.
- Aim for ${lengthGuide} overall.

Each pages array item MUST have exactly this shape: {"text":"string","illustration_prompt":"string"}.

VISUAL STORYBOARD
Write each illustration_prompt to depict the actual story moment on that spread. Across the book, choose meaningfully different moments and compositions where the story naturally provides them. Vary framing, viewpoint, pose and staging in the illustration prompts rather than bending the story itself around camera requirements. Preserve character and setting continuity. Illustration prompts must be concrete about what is happening and how the scene is staged, but must not specify or vary art style.

RECURRING CHARACTER BIBLE — MANDATORY
Create one concise but precise character_bible for every recurring character. This is a fixed visual model sheet for the illustration system, not prose for the reader. For EACH recurring non-photo character specify: name/role; exact age when human (never an age range); sex where relevant; apparent height/build relative to the child heroes; skin tone or fur/material colour; eye colour; face shape/distinctive facial features; exact hair/fur colour, length, texture and hairstyle; established clothing colours/items; and any permanent distinctive feature/accessory. For recurring animals, robots or fantastical beings give equally concrete fixed species/body/material/colour/size/features. For every dog, use the supplied breed when present to infer realistic adult/juvenile body proportions and RELATIVE SIZE beside the human characters; a Chihuahua must remain tiny, a Jack Russell small, a Labrador medium-large, an Irish Wolfhound very large/tall, etc. If breed is absent, infer approximate size from any supplied reference photo when possible; otherwise use a plausible medium size. Never arbitrarily rescale a dog between scenes. Do not leave recurring companions as vague phrases such as "a girl of similar age". Once defined, these details are immutable for the entire book unless the STORY itself explicitly requires a change.

For ANY selected Cast member with a supplied reference photo — child, adult or pet — identity comes authoritatively from that exact photo. Do not invent an alternative appearance, face, age, ethnicity, hair, body type, species/breed appearance or other conflicting physical characteristics for that Cast member. The bible should identify photographed Cast members by name, kind and role and may record only story clothing and continuity details that do not conflict with the reference. A photographed adult is just as identity-locked as a photographed child, and a photographed pet is just as identity-locked as a photographed human. Every illustration_prompt must use the SAME character names and must not redefine, age, recolour, restyle or change the clothing of recurring characters. Illustration prompts describe scene action/content only; they must not specify or vary the rendering/art style. Do not include text or lettering in illustrations.`;

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
      if (!normal.title || !normal.opening || !normal.closing || !normal.pages.length) return null;
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
      const repairInput = `Repair the following Moonbeam Stories response into VALID JSON ONLY. Do not add markdown, commentary or code fences. Preserve the story wording and plot as much as possible, BUT the creative brief and age rules below remain mandatory during repair.\n\n${storyIdea ? `PARENT STORY IDEA: ${storyIdea}` : 'NO PARENT STORY IDEA: preserve the generated story premise; do not impose a genre, reality level, magic rule, companion, object, quest, twist or moral during repair.'}\n\nAGE RULES: Child age ${age}, band ${ageBand}. ${ageProfile.writing} Forbidden: ${ageProfile.forbidden}.\n\nEnsure the result has exactly this top-level shape:\n{"title":"string","opening":"string","character_bible":"string","pages":[{"text":"string","illustration_prompt":"string"}],"closing":"string"}\nThe pages array should contain exactly ${pageCount} story page objects. Every page must have non-empty text and illustration_prompt. All selected Cast names must be reproduced exactly as supplied. Never invent or append a surname, middle name, nickname, honorific, pet name or alternative form. The selected Story Cast is the complete principal cast: do not invent additional named, recurring, familial, companion, friend, helper, rival or plot-significant characters. Unnamed setting-appropriate background people may appear only incidentally and must not become participants with their own subplot, family unit, recurring identity or central story function. Never invent relatives or friends for selected Cast members unless explicitly established in the Parent Story Idea. For every selected Cast member with a supplied reference photo, treat that photo as authoritative identity regardless of whether the member is a child, adult or pet; never reconstruct a conflicting alternative identity. Preserve or reconstruct a precise character_bible for every recurring non-photo character: exact human age (never an age range), stable face/skin/eyes/hair/build, fixed clothing colours/items and permanent distinctive features; for recurring animals, robots or fantastical beings, fixed species/body/material/colour/size/features. Do not age, redesign or visually redefine recurring characters between illustration prompts. Preserve genuine narrative progression without imposing a formula. Avoid static repetition. Each illustration_prompt should depict the actual story moment and, where natural, use a meaningfully different composition from neighbouring scenes. Do not rewrite the story merely to manufacture camera variety. If the response was truncated or cannot be repaired faithfully, recreate the missing material so the story is complete and coherent.\n\nRESPONSE TO REPAIR:\n${firstOutput.slice(0, 26000)}`;
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

    const wordCount = value => String(value || '').trim().split(/\s+/).filter(Boolean).length;

    // Models occasionally return one page too many/few even when the prompt is explicit.
    // Never expose that implementation detail to the reader. Reflow the story prose locally
    // into the exact requested number of pages while keeping sentence order and plot intact.
    function splitIntoSentences(text) {
      const clean = String(text || '').replace(/\s+/g, ' ').trim();
      if (!clean) return [];
      const matches = clean.match(/[^.!?…]+(?:[.!?…]+[\"'’”)]*|$)/g);
      return (matches || [clean]).map(x => x.trim()).filter(Boolean);
    }

    function rebalancePages(pages, wanted) {
      const source = Array.isArray(pages) ? pages.filter(Boolean) : [];
      const allText = source.map(p => String(p.text || '').trim()).filter(Boolean).join(' ');
      const sentences = splitIntoSentences(allText);
      if (!sentences.length) return source.slice(0, wanted);

      const totalWords = sentences.reduce((n, x) => n + wordCount(x), 0);
      const target = Math.max(1, Math.round(totalWords / wanted));
      const buckets = [];
      let si = 0;

      for (let pageIndex = 0; pageIndex < wanted; pageIndex++) {
        const remainingPages = wanted - pageIndex;
        const remainingSentences = sentences.length - si;
        const bucket = [];
        let words = 0;

        while (si < sentences.length) {
          const sentence = sentences[si];
          const sw = wordCount(sentence);
          // Leave at least one sentence for each remaining page where possible.
          if (bucket.length && words + sw > target && remainingSentences > remainingPages - 1) break;
          bucket.push(sentence);
          words += sw;
          si++;
          if (si >= sentences.length) break;
          if (words >= target && (sentences.length - si) >= (remainingPages - 1)) break;
        }

        // Last page receives anything left over.
        if (pageIndex === wanted - 1 && si < sentences.length) {
          bucket.push(...sentences.slice(si));
          si = sentences.length;
        }

        const sourceIndex = source.length
          ? Math.min(source.length - 1, Math.floor((pageIndex + 0.5) * source.length / wanted))
          : 0;
        const prompt = source[sourceIndex] && source[sourceIndex].illustration_prompt
          ? source[sourceIndex].illustration_prompt
          : 'A charming children’s storybook illustration matching this part of the adventure.';
        buckets.push({ text: bucket.join(' ').trim(), illustration_prompt: prompt });
      }
      return buckets;
    }

    if (!Array.isArray(story.pages)) story.pages = [];
    const originalPageCount = story.pages.length;
    const originalCounts = story.pages.map(p => wordCount(p && p.text));
    const needsReflow = story.pages.length !== pageCount || originalCounts.some(n => n < 75 || n > 145);
    if (needsReflow) story.pages = rebalancePages(story.pages, pageCount);

    // Defensive fallback for malformed model output: guarantee exactly the selected count.
    while (story.pages.length < pageCount) {
      story.pages.push({ text: '', illustration_prompt: 'A charming children’s storybook illustration matching this part of the adventure.' });
    }
    if (story.pages.length > pageCount) story.pages = story.pages.slice(0, pageCount);

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
        automaticallyReflowed: needsReflow,
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
