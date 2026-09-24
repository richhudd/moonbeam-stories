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
    if (String(body.action || '').trim() === 'developer-continuity-text') {
      const user = await verifyMoonbeamUser(req);
      const developerEmail = String(process.env.MOONBEAM_DEVELOPER_EMAIL || '').trim().toLowerCase();
      if (!developerEmail || String(user.email || '').trim().toLowerCase() !== developerEmail) return res.status(403).json({ error: 'Developer access only.' });
      const story=body.story||{},pageIndex=Number(body.pageIndex),instruction=String(body.instruction||'').trim(),pages=Array.isArray(story.pages)?story.pages:[];
      const total=pages.length+2;if(!Number.isInteger(pageIndex)||pageIndex<0||pageIndex>=total||!instruction)return res.status(400).json({error:'A valid page and correction instruction are required.'});
      const target=pageIndex===0?String(story.opening||''):pageIndex===total-1?String(story.closing||''):String(pages[pageIndex-1]?.text||'');
      const full=[story.opening,...pages.map(p=>p?.text||''),story.closing].filter(Boolean).join('\n\n');
      const prompt=`You are making one tightly controlled editorial correction to a finished children's story.\n\nFULL FINISHED STORY:\n${full}\n\nTARGET PAGE TEXT:\n${target}\n\nDEVELOPER'S AUTHORITATIVE CORRECTION INSTRUCTION:\n${instruction}\n\nReturn ONLY the replacement text for the target page. Preserve the existing story, voice, tense, approximate length, plot, characterisation and surrounding continuity. Change only what is necessary to resolve the stated inconsistency. Do not rewrite unrelated details, do not add commentary, and do not mention the correction process. The replacement must fit naturally between the preceding and following pages and must be physically/logically possible given the finished story.`;
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.6-luna',input:prompt,max_output_tokens:700})});
      const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{}if(!r.ok){const e=data?.error;throw new Error(typeof e==='string'?e:(e?.message||`OpenAI returned HTTP ${r.status}`))}
      let text=typeof data.output_text==='string'?data.output_text:'';if(!text&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')text+=part.text;
      text=text.trim().replace(/^["']|["']$/g,'').trim();if(!text)throw new Error('The corrected page text came back empty.');
      return res.status(200).json({text});
    }

    // V250.94: reuse the existing generate function for developer-only KDP copy.
    // This branch runs before story-credit reservation and does not create a Moonbeam story.
    if (String(body.action || '').trim() === 'kdp-description') {
      const user = await verifyMoonbeamUser(req);
      const developerEmail = String(process.env.MOONBEAM_DEVELOPER_EMAIL || '').trim().toLowerCase();
      if (!developerEmail || String(user.email || '').trim().toLowerCase() !== developerEmail) {
        return res.status(403).json({ error: 'Developer access only.' });
      }
      const finishedStory = body.story || {};
      const author = String(body.author || '').trim();
      const series = String(body.series || '').trim();
      const parts = [finishedStory.opening, ...(Array.isArray(finishedStory.pages) ? finishedStory.pages.map(p => p?.text || '') : []), finishedStory.closing].filter(Boolean);
      const fullStory = parts.join('\n\n');
      if (!finishedStory.title || !fullStory) return res.status(400).json({ error: 'The finished story is incomplete.' });
      const kdpPrompt = `Write the Amazon KDP product description for this finished children's story.\n\nTITLE: ${finishedStory.title}\nAUTHOR: ${author}\nSERIES: ${series}\n\nFINISHED STORY:\n${fullStory}\n\nRequirements:\n- Return ONLY the description as plain text, with no heading, labels, markdown, HTML, bullet points or quotation marks.\n- Aim for 100-150 words.\n- This is enticing sales copy, not a full synopsis.\n- Describe only characters, settings and events that actually occur in the finished story. Never invent details or selling points.\n- Introduce the central adventure and its hook, but do not reveal the ending or resolution.\n- Natural British English.\n- Avoid generic AI/marketing phrases such as “embark on a magical journey”, “heartwarming tale”, “perfect for”, “young readers will love”, “packed with”, or “join X as”.\n- Do not mention AI, prompts, generation, personalisation, Moonbeam Stories, or how the book was made.\n- You may naturally identify it as part of ${series} if useful, but do not force the series name into the copy.\n- Keep the tone specific to this particular story rather than using a reusable template.`;
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-5.6-luna', input: kdpPrompt, max_output_tokens: 500 })
      });
      const raw = await r.text();
      let data = {};
      try { data = JSON.parse(raw); } catch {}
      if (!r.ok) {
        const e = data?.error;
        throw new Error(typeof e === 'string' ? e : (e?.message || `OpenAI returned HTTP ${r.status}`));
      }
      let description = typeof data.output_text === 'string' ? data.output_text : '';
      if (!description && Array.isArray(data.output)) {
        for (const item of data.output) for (const part of (item.content || [])) if (typeof part.text === 'string') description += part.text;
      }
      description = description.trim().replace(/^[\'"]|[\'"]$/g, '').trim();
      if (!description) throw new Error('The KDP description came back empty.');
      return res.status(200).json({ description });
    }
    if (String(body.action || '').trim() === 'finalize-storyboard-story') {
      const moonbeamUser = await verifyMoonbeamUser(req);
      const plan = body.plan || {};
      const child = body.child || {};
      const images = Array.isArray(body.images) ? body.images.filter(x=>/^data:image\/(?:jpeg|png|webp);base64,/i.test(String(x||''))).slice(0,6) : [];
      const scenes = Array.isArray(plan.scenes) ? plan.scenes.slice(0,6) : [];
      if (scenes.length !== 6 || images.length !== 6) return res.status(400).json({error:'The visual storyboard is incomplete.'});
      const age = Number(child.age)||7;
      const language = String(child.language||'en-GB');
      const languageGuide = {'en-GB':'natural contemporary British English with British spelling','en-US':'natural contemporary American English','es-ES':'natural Spanish from Spain','es-419':'natural neutral Latin American Spanish','fr-FR':'natural French from France','de-DE':'natural German from Germany','it-IT':'natural Italian from Italy','pt-BR':'natural Brazilian Portuguese','pl-PL':'natural contemporary Polish'}[language]||'natural British English';
      const planText = JSON.stringify(plan,null,2);
      const finalPrompt = `You are the final author for a Moonbeam illustrated children's book. The book has already been planned and its SIX finished page illustrations already exist. Write the polished story NOW, using BOTH the production plan and the actual finished illustrations as authoritative inputs.\n\nORIGINAL STORY IDEA:\n${String(child.storyIdea||'').trim()||'No parent story idea was supplied.'}\n\nPRODUCTION PLAN / STORYBOARD:\n${planText}\n\nRULES:\n- Write for age ${age} in ${languageGuide}.\n- The plan is authoritative about the central plot, causal sequence, character roles and intended ending.\n- The six attached images are presented in storyboard order, SCENE 1 through SCENE 6. They are authoritative about clearly visible reality: locations, positions, clothing, objects, colours, physical actions and other visible facts. Never write something that clearly contradicts an image.\n- Harmless visual details introduced by an image may be incorporated naturally, but accidental visual details must not hijack or change the central plot.\n- The illustrations are selected moments, NOT six captions. Do not merely describe what the reader can already see. Use prose for action before/after the pictured moment, dialogue, thought, motivation, cause and effect, anticipation, humour, transitions and consequences.\n- Fulfil the promise of the premise. Make what happens interesting; do not replace adventure with procedures, maintenance, checklists or technical exposition unless the premise specifically requires them.\n- Ordinary objects and natural phenomena have no consciousness or agency unless the plan deliberately establishes fantasy. Avoid decorative personification and strained faux-poetic comparisons.\n- Preserve exact supplied Cast names. Do not invent surnames, relatives, friends or recurring principal characters absent from the plan.\n- Produce one continuous coherent story of about 650-750 words across exactly SIX balanced reading spreads.\n- Spread 1 about 105-125 words; spreads 2-5 about 105-125 words each; spread 6 about 90-115 words.\n- No headings inside the prose.\n\nReturn JSON ONLY in exactly this shape:\n{"title":"string","opening":"spread 1 prose","pages":[{"text":"spread 2 prose"},{"text":"spread 3 prose"},{"text":"spread 4 prose"},{"text":"spread 5 prose"}],"closing":"spread 6 prose"}`;
      const content=[{type:'input_text',text:finalPrompt},...images.map((image_url,i)=>({type:'input_image',image_url,detail:'low'}))];
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.6-luna',input:[{role:'user',content}],max_output_tokens:5000})});
      const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{};
      if(!r.ok){const e=data?.error;return res.status(502).json({error:typeof e==='string'?e:(e?.message||`OpenAI returned HTTP ${r.status}`)})}
      let output=typeof data.output_text==='string'?data.output_text:'';if(!output&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')output+=part.text;
      const clean=String(output||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/i,'');let parsed=null;try{parsed=JSON.parse(clean)}catch{const a=clean.indexOf('{'),b=clean.lastIndexOf('}');if(a>=0&&b>a)try{parsed=JSON.parse(clean.slice(a,b+1))}catch{}}
      if(!parsed||!parsed.title||!parsed.opening||!parsed.closing||!Array.isArray(parsed.pages)||parsed.pages.length!==4)return res.status(502).json({error:'Moonbeam could not reconcile the finished illustrations into the final story.'});
      const story={title:String(parsed.title).trim(),opening:String(parsed.opening).trim(),character_bible:String(plan.character_bible||'').trim(),pages:parsed.pages.map((pg,i)=>({text:String(pg?.text||'').trim(),illustration_prompt:String(scenes[i+1]?.visual_moment||scenes[i+1]?.event||'').trim()})),closing:String(parsed.closing).trim()};
      if(story.pages.some(pg=>!pg.text))return res.status(502).json({error:'The finished story contained an empty page.'});
      await logUsage({event_type:'story_finalize',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-5.6-luna',user_id:moonbeamUser.id,generation_run_id:String(body.generationRunId||'')}});
      return res.status(200).json({story});
    }

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
    const demoRequested=String(req.headers['x-moonbeam-demo-generation']||'').trim()==='1';
    const developerEmail=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();
    const developerDemo=demoRequested&&developerEmail&&String(moonbeamUser.email||'').trim().toLowerCase()===developerEmail;
    if(demoRequested&&!developerDemo)return res.status(403).json({error:'Developer access only.'});
    let creditsRemaining=null;
    if(!developerDemo){
      try {
        const reservation = await reserveStoryCredit(moonbeamUser.id);
        creditsRemaining = reservation.remaining; reservedBatchId = reservation.batchId; reservedUserId=moonbeamUser.id;
      } catch (e) {
        return res.status(e.status || 500).json({ error: e.message, code: e.code || 'CREDIT_ERROR', batchId: e.batchId || null });
      }
      creditReserved = true;
    }
    const refundReservedCredit = async () => {
      if (!creditReserved) return;
      creditReserved = false;
      await refundReservedStoryCredit(moonbeamUser.id,reservedBatchId);
    };
    const language = child.language || 'en-GB';
    const languageGuide = {
      'en-GB': 'Write in natural contemporary British English, with British spelling and idiomatic British usage. Do not insert culturally British props, foods or expressions merely to signal the locale.',
      'en-US': 'Write in natural contemporary American English, with American spelling and idiomatic American usage. Do not insert culturally American props, foods or expressions merely to signal the locale.',
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
        writing:'Use short, clear sentences, concrete language, simple cause-and-effect and frequent reassuring cues. Keep the central situation easy to understand. Excitement, wonder and fantasy are welcome when they arise from the premise, but frightening or threatening moments must be brief and quickly reassuring.',
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

    // V251.19: developmental excitement guidance for the conception/planning stage.
    // These are broad creative signals, not subject lists or stereotypes. Explicit Story Ideas,
    // Cast details and stated interests/dislikes always outrank demographic tendencies.
    const excitementProfiles = {
      '3-5': 'For roughly ages 3-5, strong story appeal often comes from immediately understandable experiences, movement, anticipation, repetition-with-variation, playful surprise, animals, physical comedy, striking scale contrasts and emotionally clear situations. Keep the central fascination concrete and visually graspable.',
      '6-8': 'For roughly ages 6-8, strong story appeal often comes from exploration, secrets, surprising discoveries, unusual animals or machines, speed and scale, competition, mastery, mild peril, mischievous humour, being trusted with something important, going somewhere children normally cannot go, knowing or noticing something adults have missed, and an ordinary day becoming extraordinary.',
      '9-12': 'For roughly ages 9-12, strong story appeal often comes from mysteries, ingenious plans, exploration, rivalry, competence, secrets, unusual knowledge, bigger worlds, stronger suspense, twists, independence and more layered relationships and motivations.'
    };
    const excitementProfile = excitementProfiles[ageBand];

    const ideaGuide = storyIdea
      ? `PARENT STORY IDEA — AUTHORITATIVE\n${storyIdea}\nUse this idea as the creative brief. Develop it imaginatively without adding a competing premise. Age-safety rules still override any unsuitable detail.`
      : `NO PARENT STORY IDEA\nInvent the story freely. There is no prescribed genre, reality level, magic level, setting, companion, object, quest, twist, moral or ending type.`;

    const castLines = cast.length ? cast.map(m=>{const detail=m.kind==='child'?`child, age ${m.age}${m.gender?`, ${m.gender}`:''}`:m.kind==='adult'?`adult${m.gender?`, ${m.gender}`:''}`:`${m.animal_type||'pet'}${m.breed?`, breed: ${m.breed}`:''}`;return `- ${m.name} — ${detail} — ${String(m.role).toUpperCase()}`}).join('\n') : `- ${child.name} — child, age ${age}${child.gender?`, ${child.gender}`:''} — HERO`;
    const roleRules = `Roles describe narrative prominence only, not authority, competence or who is allowed to act.
HERO means the story is principally about that character. With two heroes, both are genuine co-heroes.
SUPPORTING CAST means secondary narrative focus, not passive behaviour. Every selected Cast member may act, decide, help, fail, succeed, solve problems or change the course of events as the story naturally requires. Let behaviour arise from character and events rather than from age or role labels.
Do not force every selected character into every scene.
CAST IS AUTHORITATIVE: when a structured Story Cast is supplied, the selected Heroes and Supporting Cast are the complete principal cast for the story. Do not invent additional named, recurring, familial, companion, friend, helper, rival or other plot-significant characters. Unnamed incidental/background people may appear when naturally required by the setting, but they must remain incidental and must not acquire a subplot, family unit, recurring identity or central story function. Never invent a spouse, partner, child, parent, sibling, relative or friend for a selected Cast member unless the parent explicitly establishes that person in the Story Idea. Where a human Cast member has an optional Male/Female marker, preserve it consistently. If a Cast member is marked male, do not invent decorative hair accessories for him unless they are clearly visible in the uploaded reference photo or explicitly required by the Parent Story Idea.`
    const prompt = `You are the lead children's author for Moonbeam Stories. Write a completely original children's story centred on the selected hero or co-heroes. The story may be read at bedtime, but bedtime is the reading occasion, NOT the fictional setting.

STORY CAST
${castLines}

CAST ROLES
${roleRules}

NAME AND IDENTITY LOCK
Use every selected Cast member's supplied personal name exactly as given. Never invent or append a surname, middle name, nickname, pet name or other personal name that the parent did not supply. Fictional titles, ranks, roles and forms of address that arise naturally from the story are permitted; they do not alter the Cast member's supplied identity. Relationships stated in the Story Idea should be respected. Do not invent additional family relationships. Where the parent has not defined a real-world relationship, keep it neutral rather than guessing.
Youngest hero age for safety calibration: ${age}
${ideaGuide}
Things to avoid: ${child.dislikes || 'nothing specific'}
Standard Moonbeam length: ${lengthGuide}
Language: ${language}
Language guidance: ${languageGuide}

TONE, THEMES AND MORALS
Infer the tone, atmosphere, humour, emotional arc and any themes naturally from the Story Idea, the selected Cast, their ages and the events of the story. There is NO selected tone and there are NO selected values. Do not default to kindness, curiosity, courage or any other predetermined value. A Moonbeam story does not need to teach a lesson or contain a moral. Do not impose an educational message or moral; if a theme emerges naturally from what happens, let it remain implicit rather than announcing it.

MOONBEAM CREATIVE BRIEF
Write an original, polished children’s story in natural ${language}. Use clear, intelligent prose, vivid but economical description, natural dialogue where useful, warmth, humour and emotional range as the particular story calls for.
Make the story imaginative by making WHAT HAPPENS interesting, not by making the prose or ordinary world artificially whimsical. Originality should come primarily from a strong premise, specific situation, discovery, mystery, exploration, character relationships, humour and surprising but coherent developments. One excellent idea developed properly is better than a pile of unrelated magical or cute ingredients.
Do not assemble the story from compulsory children's-story ingredients. There is no required magical companion, special object, quest, mystery, hidden door, twist, lesson or fantasy device. Equally, do not avoid any of those things when they genuinely belong to the central conception. Avoid recycled cosy children's-story props, snacks, treats, sparkles, arbitrary magical objects and similar details unless they arise naturally from this particular story. Do not use generic childhood or cultural props merely to make the story feel child-friendly or locally flavoured.
When the parent has not established a fantastical premise, favour grounded adventure, mystery, discovery, exploration, humour and unusual but plausible situations over arbitrary whimsy. Fantasy is fully welcome when it is the premise or a deliberately established part of the story world. Fantastical does not mean random: once the story establishes an exception to ordinary reality, keep its rules and cause-and-effect internally coherent.
The selected Cast are the principal characters. Their supplied real identities are fixed, but their fictional roles are not. Unless the parent specifies otherwise, let the story determine naturally who they are within its fictional world and where and when that world exists. Do not assume that their everyday real-world circumstances, clothing, occupation, social role, historical period or surroundings apply to every story. Fictional roles, status, abilities, circumstances and story-required transformations may arise naturally without changing who the Cast members fundamentally are.
The finished story should feel authored rather than generated from a visible formula.

IMAGINATION AND STORY INTEREST
Make the story interesting because of what happens, not because the language or surroundings are artificially whimsical. Find the strongest possibility inherent in the premise and develop it. Give the protagonist a distinctive experience worth having and remembering. Prefer one strong imaginative conception developed properly over several unrelated novelties.
Coherence must never become dullness. Plausibility is a constraint on imagination, not a substitute for imagination. A realistic story can contain extraordinary situations, discoveries, danger, mystery, humour and surprise. A fantasy story can go far beyond ordinary reality, but its extraordinary elements should belong to the premise or established world and remain internally consistent.
Do not equate child agency with fixing a problem, completing a task, rescuing something, repairing something or restoring a disrupted situation. The child may explore, experience, participate, wonder, interact, choose, play, discover or simply be caught up in remarkable events. Let the particular premise determine what kind of story this is.
Do not confuse factual or procedural detail with storytelling. Include technical, educational or realistic detail only when it genuinely enriches the particular experience; compress it when it merely documents a process.
Create genuine anticipation. At important points, the reader should have a reason to wonder what happens next. Before settling on the story, apply the retelling test: “It was the one where…” The answer should reveal a distinctive experience, event, discovery, relationship or situation—not merely an interesting setting or a minor problem that gets fixed.
Respect the child's intelligence. The story may be exciting, mysterious, funny, frightening-within-age-limits, emotionally affecting, fantastical or strange without becoming nonsensical, saccharine or artificially cute.

CHILD APPEAL — SOFT DEVELOPMENTAL GUIDANCE
${excitementProfile}
Treat age as a clue to the kinds of EXPERIENCES that may feel compelling, never as a list of compulsory subjects. Do not turn this guidance into recurring props or formulas. A child's explicit Story Idea, stated interests, dislikes and Cast context are stronger evidence than broad age tendencies.
Gender, where supplied, is only a weak optional signal and must never restrict the premise, activity, role, emotion, setting or genre. Do not assume that boys require vehicles, dinosaurs, sport or action, or that girls require princesses, animals, domestic stories or gentler stakes. If gender suggests a possibility, use it only when it also fits the individual Story Idea and character context.
Think especially in terms of child-centred fantasies of EXPERIENCE: discovering something nobody else has noticed; being the first to go somewhere; entering a place children normally cannot; encountering something enormous or astonishing; learning a secret; being unexpectedly capable; taking part in a huge event; meeting someone or something extraordinary; or having an ordinary day become remarkable. These are examples of the level of appeal to seek, NOT a checklist and NOT required plot ingredients. Invent freely beyond them.

SETTING AND STORY SHAPE
${storyIdea ? 'Let the parent’s Story Idea establish whatever it establishes, and freely invent the unstated details needed to turn it into a complete, imaginative, age-appropriate story.' : 'Choose the premise, setting, story world and shape freely. No period, type of world, social context or everyday setting is the default.'}
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
Age suitability overrides any unsuitable parent detail or invented premise. When adapting an unsafe detail, preserve the central premise, narrative interest and coherent cause-and-effect where possible; do not assume that realism is less imaginative than fantasy.

REALITY, AGENCY AND PROSE DISCIPLINE
Unless the premise explicitly establishes otherwise, ordinary reality applies. Inanimate objects, buildings, landscapes and natural phenomena have no consciousness, memory, emotions, intentions, sensory awareness or independent agency. Do not make an ordinary sea sing, a lighthouse listen, a house remember, the moon watch, a forest whisper, a rainbow become lost, or any equivalent construction merely for atmosphere, charm or literary effect. If an object, place or natural phenomenon is genuinely enchanted, alive or sentient, establish that as part of the fantasy premise rather than slipping personification into otherwise ordinary description.
Do not introduce arbitrary impossibilities merely to manufacture a children's-story problem. Ordinary objects and natural phenomena should obey plausible physical scale, material behaviour and cause-and-effect unless an established fantastical mechanism explains otherwise.
Write naturally, not "storybookishly". Never sacrifice sense for charm, rhythm, imagery or a clever-sounding line. Metaphors, similes, exaggerations and comparisons must communicate something intelligible about the actual scene. Reject strained faux-poetic comparisons, decorative whimsy and cute-sounding nonsense. Prefer a clear concrete sentence whenever an ornamental one says less.
Do not repeatedly reach for stock children's-fiction motifs, cosy props, snacks, treats or whimsical filler. Details earn their place by serving character, setting, action, humour, atmosphere, clue, consequence or payoff in THIS story.

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
Illustrate what is happening, not merely where the protagonist is. For each spread identify the principal action, discovery, interaction, emotional moment or consequence and make that the visual subject. If several details are present, prioritise the event that changes or advances the story rather than an easier incidental object or portrait.
Preserve established characters, clothing, important objects, vehicles, architecture, environments and spatial relationships unless the story itself changes them. The depicted action must be physically coherent: establish where characters and important objects are, and do not ask the illustration to show an action that could not occur from those positions.
Let successive illustration prompts feel like successive moments in one continuous adventure rather than a collection of attractive portraits. Seek meaningful variety in action, viewpoint, distance, composition and setting when the story provides it, while maintaining visual continuity. Visual variety must come from changing events, not from arbitrarily redesigning established facts or bending the story around camera requirements. Illustration prompts must be concrete about what is happening and how the scene is staged, but must not specify or vary art style.

RECURRING CHARACTER BIBLE — MANDATORY
Create one concise but precise character_bible for every recurring character. This is a fixed visual model sheet for the illustration system, not prose for the reader. For EACH recurring non-photo character specify: name/role; exact age when human (never an age range); sex where relevant; apparent height/build relative to the child heroes; skin tone or fur/material colour; eye colour; face shape/distinctive facial features; exact hair/fur colour, length, texture and hairstyle; established clothing colours/items; and any permanent distinctive feature/accessory. For recurring animals, robots or fantastical beings give equally concrete fixed species/body/material/colour/size/features. For every dog, use the supplied breed when present to infer realistic adult/juvenile body proportions and RELATIVE SIZE beside the human characters; a Chihuahua must remain tiny, a Jack Russell small, a Labrador medium-large, an Irish Wolfhound very large/tall, etc. If breed is absent, infer approximate size from any supplied reference photo when possible; otherwise use a plausible medium size. Never arbitrarily rescale a dog between scenes. Do not leave recurring companions as vague phrases such as "a girl of similar age". Once defined, these details are immutable for the entire book unless the STORY itself explicitly requires a change.

For ANY selected Cast member with a supplied reference photo — child, adult or pet — underlying physical identity comes authoritatively from that exact photo. Preserve the recognisable face, apparent age, hair, approximate skin tone, body proportions and other identifying physical characteristics shown by the reference; for pets preserve the recognisable species/breed appearance and proportions. Any optional Male/Female marker for a photographed human Cast member is authoritative and must be preserved consistently. Story-world clothing, costume, role, status, abilities and story-required fictional characteristics or transformations are free to follow the story and must not be mistaken for conflicting real-world identity. The bible should identify photographed Cast members by their supplied name, kind and narrative role and record only story-world appearance or continuity details needed for the book while keeping the underlying person or pet recognisable. Do not invent decorative hair accessories for a photographed Cast member marked male unless they are clearly visible in the reference photo or explicitly required by the Parent Story Idea. A photographed adult is just as identity-locked as a photographed child, and a photographed pet is just as identity-locked as a photographed human. Every illustration_prompt must use the SAME supplied Cast names and preserve established continuity unless the STORY itself explicitly requires a change. Illustration prompts describe scene action/content only; they must not specify or vary the rendering/art style. Do not include text or lettering in illustrations.`;

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

    // V251.21: choose a compelling, account-aware concept BEFORE storyboarding it; repair malformed concept JSON once before failing.
    // The concept call is deliberately not allowed to write scenes or prose. It sees a compact
    // account-wide memory of recent saved stories so a pack of credits produces genuinely varied books.
    const recentStoriesRaw=Array.isArray(body.recentStories)?body.recentStories.slice(0,10):[];
    const recentStories=recentStoriesRaw.map((x,i)=>({title:String(x?.title||`Recent story ${i+1}`).slice(0,120),summary:String(x?.summary||'').replace(/\s+/g,' ').trim().slice(0,900)})).filter(x=>x.title||x.summary);
    const recentMemory=recentStories.length?recentStories.map((x,i)=>`${i+1}. ${x.title}: ${x.summary}`).join('\n'):'No recent saved stories are available for this account.';
    const conceptBase = String(prompt).split('\nOUTPUT\n')[0].replace('Write a completely original children’s story centred on the selected hero or co-heroes.','Invent the strongest central concept for a completely original children’s story centred on the selected hero or co-heroes. Do not plan scenes or write story prose yet.').replace('Write an original, polished children’s story in natural ${language}.','Invent an original story concept suitable for later writing in natural ${language}.');
    const conceptPrompt=`${conceptBase}

CONCEPT-BUILDER OVERRIDE — THIS REPLACES ALL STORY/OUTPUT INSTRUCTIONS ABOVE FOR THIS CALL
Your ONLY job is to find a story worth telling. Do not write the story. Do not divide it into scenes. Do not write dialogue, narration, page text or illustration prompts.

A location, outing, journey, activity or attractive setting is NOT by itself a sufficient story concept. Find the particular thing that happens which makes THIS experience memorable. Ask silently: “What would this child be excited to tell somebody happened?” If the answer is merely that the child visited somewhere, saw scenery, played normally, learned something, helped with a minor everyday inconvenience or restored something to how it was before, reject that conception and find a stronger one.

Use the CHILD APPEAL guidance above as creative fuel, not a checklist. Seek an idea with genuine child-level fascination: excitement, discovery, comedy, mystery, awe, extraordinary access, achievement, suspense, surprise, relationship or another compelling experience appropriate to the premise. Do not manufacture interest through arbitrary whimsy or personification.

Do not default to the recurring safe pattern “something is lost/stuck/tangled/broken/blown away -> child notices -> child fixes/rescues/returns it -> everything is restored.” Such events are allowed only when the parent specifically calls for them or when they are incidental to a substantially more original central conception.

CONTEMPORARY AUTHENTICITY: Do not use stock children's-adventure shorthand merely to signal adventure. Maps, backpacks, torches, keys, notes, mysterious boxes, snacks, picnics, badges, ribbons and similar props should appear only when the particular premise gives them a genuine reason to exist. Contemporary children should behave plausibly for the setting unless the premise establishes otherwise.

ACCOUNT-LEVEL VARIETY — RECENT SAVED STORIES:
${recentMemory}
Treat these as creative memory for the whole Moonbeam account. Avoid repeating their underlying premise, story shape, central situation, distinctive props, discoveries, complications, payoff or ending merely with different nouns or scenery. A train replacing a boat, or a kite replacing a ribbon, does not make the underlying story different. This is an anti-repetition rule, not a ban: if the parent's new Story Idea explicitly requires something used before, honour the parent's request.

Silently consider several FUNDAMENTALLY DIFFERENT possible concepts before choosing one. Different means a different kind of experience and story, not five variants of the same mishap.

Return JSON ONLY:
{"central_premise":"1-2 plain factual sentences stating what actually happens","why_a_child_would_care":"one plain sentence identifying the compelling experience","direction":"one plain sentence defining the intended kind of story and reality level","ending_destination":"one plain factual sentence stating where the story ultimately arrives"}`;
    function parseConceptOutput(text){
      for(const candidate of candidateJsonStrings(text)){
        for(const version of [candidate,candidate.replace(/,\s*([}\]])/g,'$1')]){
          try{
            const parsed=JSON.parse(version);
            const x=parsed&&parsed.concept&&typeof parsed.concept==='object'?parsed.concept:parsed;
            if(!x||typeof x!=='object')continue;
            const central=String(x.central_premise||x.premise||'').trim();
            const appeal=String(x.why_a_child_would_care||x.why_it_is_compelling||x.child_appeal||'').trim();
            const ending=String(x.ending_destination||x.ending||x.destination||'').trim();
            if(central&&appeal&&ending)return {central_premise:central,why_a_child_would_care:appeal,direction:String(x.direction||'').trim(),ending_destination:ending};
          }catch{}
        }
      }
      return null;
    }
    let concept=null;let conceptOutput='';
    try{
      conceptOutput=await callStoryModel(conceptPrompt,1600);
      concept=parseConceptOutput(conceptOutput);
      if(!concept){
        const repairPrompt=`The previous concept-builder response could not be parsed. Return ONLY one valid JSON object with exactly these keys: central_premise, why_a_child_would_care, direction, ending_destination. Do not add markdown, commentary or story prose. Preserve the strongest concept you intended; this is a formatting repair, not a request to reject the user's idea.\n\nORIGINAL CONCEPT-BUILDER INSTRUCTIONS:\n${conceptPrompt}\n\nPREVIOUS RESPONSE:\n${conceptOutput}`;
        const repaired=await callStoryModel(repairPrompt,1600);
        concept=parseConceptOutput(repaired);
      }
    }catch(e){if(e.openaiStatus){await refundReservedCredit();return res.status(502).json({error:e.message,openai_status:e.openaiStatus})}throw e}
    if(!concept){await refundReservedCredit();return res.status(502).json({error:'Moonbeam had trouble preparing this story idea. Please try again.'})}

    // Plan the complete illustrated book only AFTER the concept has been selected.
    const planningBase = String(prompt).split('\nOUTPUT\n')[0].replace('Write a completely original children’s story centred on the selected hero or co-heroes.','Design a completely original children’s story centred on the selected hero or co-heroes, but do not write its finished prose yet.').replace('Write an original, polished children’s story in natural ${language}.','Design an original, polished children’s story suitable for later writing in natural ${language}.');
    const planningPrompt = `${planningBase}\n\nSTORYBOARD-FIRST OVERRIDE — THIS REPLACES THE OUTPUT INSTRUCTIONS ABOVE FOR THIS CALL
Do NOT write the finished story yet. Do NOT write narrative prose, dialogue, page text, literary description or polished storytelling. This stage is a production plan only.

CHOSEN STORY CONCEPT — AUTHORITATIVE:
CENTRAL PREMISE: ${concept.central_premise}
WHY IT IS COMPELLING: ${concept.why_a_child_would_care}
DIRECTION: ${concept.direction}
ENDING DESTINATION: ${concept.ending_destination}
Do not replace this with an easier, safer or more conventional story. The storyboard's job is to realise this concept visually and coherently.

Design the complete story from beginning to end, including the actual ending, so every illustration can know the entire arc before any picture is made. Fulfil the premise and make the six visual scenes a varied, intelligible sequence rather than six isolated portraits. Do not impose a problem-solution structure, a sequence of obstacles, attempts, setbacks or repairs, or any other predetermined plot pattern. Do not create visual variety by changing established facts.

Each scene must be brief and factual. EVENT says what actually happens in that part of the story. VISUAL_MOMENT identifies the single finished picture to draw. CONTINUITY records only concrete visual facts that later scenes must preserve. No field may contain finished story prose. The six events do not each need a problem, action, consequence, reversal or resolution; let the shape arise from the particular story.

The character_bible is a production model sheet, not prose. For every recurring non-photo character give stable age/species, build, face, hair/fur/material, colours, clothing and distinctive features. For photographed Cast, preserve the supplied identity and use the bible only for story-world clothing and continuity. Establish recurring vehicles, rooms, buildings, machines and plot-important objects clearly enough that all six images can preserve the same design.

Return JSON ONLY in exactly this shape:
{"title_working":"string","premise":"one plain sentence","story_arc":"2-4 plain factual sentences covering the complete plot and ending","ending":"one plain factual sentence","character_bible":"fixed visual continuity description","scenes":[{"scene":1,"event":"one plain sentence","visual_moment":"one concrete visual scene","continuity":"brief concrete visual facts"},{"scene":2,"event":"...","visual_moment":"...","continuity":"..."},{"scene":3,"event":"...","visual_moment":"...","continuity":"..."},{"scene":4,"event":"...","visual_moment":"...","continuity":"..."},{"scene":5,"event":"...","visual_moment":"...","continuity":"..."},{"scene":6,"event":"...","visual_moment":"...","continuity":"..."}]}

Before returning the plan, check silently that the six pictures together would make sense to someone who knows the premise, that later illustrations do not need to invent facts the plan failed to establish, and that the visual climax has not accidentally been spent on an earlier incidental moment.`;
    let planOutput='';let plan=null;
    try{
      planOutput=await callStoryModel(planningPrompt,4200);
      for(const candidate of candidateJsonStrings(planOutput)){try{const x=JSON.parse(candidate);if(x&&Array.isArray(x.scenes)&&x.scenes.length===6){plan=x;break}}catch{}}
    }catch(e){if(e.openaiStatus){await refundReservedCredit();return res.status(502).json({error:e.message,openai_status:e.openaiStatus})}throw e}
    if(!plan){await refundReservedCredit();return res.status(502).json({error:'Moonbeam could not create the visual storyboard correctly. Please try again.'})}
    plan.concept=concept;plan.title_working=String(plan.title_working||'').trim();plan.premise=String(plan.premise||'').trim();plan.story_arc=String(plan.story_arc||'').trim();plan.ending=String(plan.ending||'').trim();plan.character_bible=String(plan.character_bible||'').trim();
    plan.scenes=plan.scenes.slice(0,6).map((x,i)=>({scene:i+1,event:String(x?.event||'').trim(),visual_moment:String(x?.visual_moment||'').trim(),continuity:String(x?.continuity||'').trim()}));
    if(!plan.premise||!plan.story_arc||!plan.ending||!plan.character_bible||plan.scenes.some(x=>!x.event||!x.visual_moment)){await refundReservedCredit();return res.status(502).json({error:'Moonbeam produced an incomplete visual storyboard. Please try again.'})}
    const generationRunId=await createGenerationRun(moonbeamUser.id);
    await logUsage({event_type:'story_concept',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-5.6-luna',user_id:moonbeamUser.id,generation_run_id:generationRunId,recent_story_count:recentStories.length}});
    await logUsage({event_type:'story_plan',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-5.6-luna',user_id:moonbeamUser.id,generation_run_id:generationRunId}});
    await logSupportAttempt('success',{credit_deducted:!developerDemo,credit_refunded:false,generation_run_id:generationRunId});
    creditReserved=false;
    return res.status(200).json({creditsRemaining,generationRunId,plan,image:null,layout:{requestedLength:length,storyPages:4,displayedTextPages:6,storyboardFirst:true}});
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
