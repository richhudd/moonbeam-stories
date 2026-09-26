const {logUsage,estimateGBP,SUPABASE_URL,SECRET_KEY,adminHeaders}=require('../_usage');
const {verifyMoonbeamUser,reserveStoryCredit,refundReservedStoryCredit,createGenerationRun}=require('../_credits');
const DEFAULT_USAGE_BASELINE_UTC='2026-09-26T13:38:25Z';
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
    if (String(body.action || '').trim() === 'average-story-build-time') {
      await verifyMoonbeamUser(req);
      if (!SECRET_KEY) return res.status(200).json({averageSeconds:null,sampleSize:0});
      try {
        const params=new URLSearchParams();
        params.set('select','event_type,metadata,created_at');
        params.set('event_type','in.(generation_attempt,story_finalize)');
        // V251.71: the hourglass average always uses the exact same baseline as
        // Usage & economics. Resetting MOONBEAM_USAGE_BASELINE_UTC therefore resets
        // both measurements together for every account after a generation change.
        const usageBaselineUTC=String(process.env.MOONBEAM_USAGE_BASELINE_UTC||DEFAULT_USAGE_BASELINE_UTC).trim();
        if(!Number.isFinite(Date.parse(usageBaselineUTC)))throw new Error('MOONBEAM_USAGE_BASELINE_UTC is invalid.');
        params.set('created_at',`gte.${new Date(usageBaselineUTC).toISOString()}`);
        params.set('order','created_at.asc');
        params.set('limit','5000');
        const r=await fetch(`${SUPABASE_URL}/rest/v1/api_usage_events?${params.toString()}`,{headers:adminHeaders()});
        if(!r.ok)throw new Error(`Usage history returned HTTP ${r.status}`);
        const rows=await r.json();
        const attempts=new Map(),finals=new Map();
        for(const row of Array.isArray(rows)?rows:[]){
          const meta=row?.metadata||{},run=String(meta.generation_run_id||'').trim();if(!run)continue;
          if(row.event_type==='generation_attempt'&&meta.status==='success')attempts.set(run,row);
          if(row.event_type==='story_finalize')finals.set(run,row);
        }
        const durations=[];
        for(const [run,finalRow] of finals){
          const attempt=attempts.get(run);if(!attempt)continue;
          const requestMs=Number(attempt?.metadata?.duration_ms||0);
          const attemptAt=Date.parse(attempt.created_at||''),finalAt=Date.parse(finalRow.created_at||'');
          if(!(requestMs>0)||!Number.isFinite(attemptAt)||!Number.isFinite(finalAt)||finalAt<attemptAt)continue;
          const totalMs=requestMs+(finalAt-attemptAt);
          if(totalMs>=1000&&totalMs<=30*60*1000)durations.push(totalMs);
        }
        if(!durations.length)return res.status(200).json({averageSeconds:null,sampleSize:0});
        const averageSeconds=Math.round(durations.reduce((a,b)=>a+b,0)/durations.length/1000);
        return res.status(200).json({averageSeconds,sampleSize:durations.length});
      } catch(e){
        console.error('average story build time failed',e);
        return res.status(200).json({averageSeconds:null,sampleSize:0});
      }
    }

    if (String(body.action || '').trim() === 'developer-continuity-text') {
      const user = await verifyMoonbeamUser(req);
      const developerEmail = String(process.env.MOONBEAM_DEVELOPER_EMAIL || '').trim().toLowerCase();
      if (!developerEmail || String(user.email || '').trim().toLowerCase() !== developerEmail) return res.status(403).json({ error: 'Developer access only.' });
      const story=body.story||{},pageIndex=Number(body.pageIndex),instruction=String(body.instruction||'').trim(),pages=Array.isArray(story.pages)?story.pages:[];
      const total=pages.length+2;if(!Number.isInteger(pageIndex)||pageIndex<0||pageIndex>=total||!instruction)return res.status(400).json({error:'A valid page and correction instruction are required.'});
      const target=pageIndex===0?String(story.opening||''):pageIndex===total-1?String(story.closing||''):String(pages[pageIndex-1]?.text||'');
      const full=[story.opening,...pages.map(p=>p?.text||''),story.closing].filter(Boolean).join('\n\n');
      const prompt=`You are editing one page of a finished children's story.\n\nFULL FINISHED STORY (authoritative context; only the target page may be changed):\n${full}\n\nTARGET PAGE TEXT:\n${target}\n\nDEVELOPER'S AUTHORITATIVE EDITING INSTRUCTION:\n${instruction}\n\nReturn ONLY the replacement text for the target page. Read the complete finished story before rewriting the target page so the replacement flows naturally from the preceding page and into the following page and remains coherent with facts established elsewhere in the book. The developer's instruction is authoritative about the scope and nature of the edit: if it requests a narrow correction, change only what is needed and preserve the existing literary form, voice, tense, rhythm, rhyme or lack of rhyme, dialogue style and formatting as closely as possible; if it explicitly requests a broader or complete rewrite, you may freely rewrite the target page to fulfil that request while leaving the surrounding pages as fixed context. Do not independently impose a preferred story structure, prose style or literary form. Do not add commentary or mention the editing process.`;
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,max_output_tokens:700})});
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
        body: JSON.stringify({ model: 'gpt-6-astra', input: kdpPrompt, max_output_tokens: 500 })
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
      const developerEmail = String(process.env.MOONBEAM_DEVELOPER_EMAIL || '').trim().toLowerCase();
      const developerDiagnostic = !!developerEmail && String(moonbeamUser.email || '').trim().toLowerCase() === developerEmail;
      const plan = body.plan || {};
      const child = body.child || {};
      const images = Array.isArray(body.images) ? body.images.filter(x=>/^data:image\/(?:jpeg|png|webp);base64,/i.test(String(x||''))).slice(0,6) : [];
      const scenes = Array.isArray(plan.scenes) ? plan.scenes.slice(0,6) : [];
      if (scenes.length !== 6 || images.length !== 6) return res.status(400).json({error:'The visual storyboard is incomplete.'});
      const age = Number(child.age)||7;
      const language = String(child.language||'en-GB');
      const languageGuide = {'en-GB':'natural contemporary British English with British spelling','en-US':'natural contemporary American English','es-ES':'natural Spanish from Spain','es-419':'natural neutral Latin American Spanish','fr-FR':'natural French from France','de-DE':'natural German from Germany','it-IT':'natural Italian from Italy','pt-BR':'natural Brazilian Portuguese','pl-PL':'natural contemporary Polish'}[language]||'natural British English';
      const planText = JSON.stringify(plan,null,2);
      const finalPrompt = `You are the final author for a Moonbeam illustrated children's book. Its six finished illustrations already exist. Write the finished book now.

ORIGINAL STORY IDEA:
${String(child.storyIdea||'').trim()||'No parent story idea was supplied.'}

PRODUCTION PLAN / STORYBOARD:
${planText}

HARD REQUIREMENTS ONLY
- Write content and language appropriate for a child aged ${age}, in ${languageGuide}.
- You have complete literary autonomy. Choose prose, verse, rhyme, dialogue, repetition, mixed forms or any other form you believe makes the strongest story. Do not impose or avoid any particular plot structure, tone, genre, lesson, problem, climax or ending pattern.
- Preserve exact supplied Cast names and facts. Never invent surnames or sensitive personal facts.
- The plan establishes the intended book and the six attached images are authoritative about clearly visible physical reality. Reconcile harmless visible details naturally without allowing accidental image details to replace the story.
- The pictures are selected moments, not captions. Write the story rather than merely describing the pictures.
- Public-domain reproduction/adaptation is allowed when the underlying material is confidently public domain in the United Kingdom; do not import protected additions from later adaptations. Do not reproduce or closely imitate protected copyrighted expression.
- Return exactly SIX reading spreads: opening, four middle spreads and closing.
- There is no target or minimum word count. Pages do not need to be similar lengths. HARD CEILING: no individual spread may exceed 220 words. Keep deliberate line breaks only when they serve your chosen literary form; Moonbeam's fixed-layout KDP renderer must be able to fit every spread legibly.
- No headings inside the story text.

Return JSON ONLY in exactly this shape:
{"title":"string","opening":"spread 1","pages":[{"text":"spread 2"},{"text":"spread 3"},{"text":"spread 4"},{"text":"spread 5"}],"closing":"spread 6"}`;
      const content=[{type:'input_text',text:finalPrompt},...images.map((image_url,i)=>({type:'input_image',image_url,detail:'low'}))];
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:[{role:'user',content}],max_output_tokens:5000,text:{format:{type:'json_schema',name:'moonbeam_final_story',strict:true,schema:{type:'object',additionalProperties:false,required:['title','opening','pages','closing'],properties:{title:{type:'string'},opening:{type:'string'},pages:{type:'array',minItems:4,maxItems:4,items:{type:'object',additionalProperties:false,required:['text'],properties:{text:{type:'string'}}}},closing:{type:'string'}}}}}})});
      const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{};
      const usage=data?.usage||{};
      const finalDiagnostic=developerDiagnostic?{stage:'final story reconciliation',model:'gpt-6-astra',http_status:r.status,response_status:data?.status||null,incomplete_reason:data?.incomplete_details?.reason||null,input_tokens:Number(usage.input_tokens||0)||null,output_tokens:Number(usage.output_tokens||0)||null,total_tokens:Number(usage.total_tokens||0)||null,max_output_tokens:5000,raw_response_chars:raw.length}:null;
      if(!r.ok){const e=data?.error;const payload={error:typeof e==='string'?e:(e?.message||`OpenAI returned HTTP ${r.status}`)};if(finalDiagnostic)payload.developer_diagnostic=finalDiagnostic;return res.status(502).json(payload)}
      let output=typeof data.output_text==='string'?data.output_text:'';if(!output&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')output+=part.text;
      if(finalDiagnostic)finalDiagnostic.output_chars=output.length;
      // V251.45: use the same tolerant JSON extraction already proven by the main story stages.
      // Responses may be wrapped in markdown/a `story` object or contain harmless trailing commas;
      // a completed, paid-for reconciliation must not be discarded merely because the wrapper is imperfect.
      const parsed=parseStoryOutput(output);
      const reconciliationIssues=[];
      if(!parsed)reconciliationIssues.push('JSON could not be parsed');
      else{
        if(typeof parsed.title!=='string'||!parsed.title.trim())reconciliationIssues.push('missing title');
        if(typeof parsed.opening!=='string'||!parsed.opening.trim())reconciliationIssues.push('missing opening');
        if(!Array.isArray(parsed.pages))reconciliationIssues.push('pages is not an array');
        else{
          if(parsed.pages.length!==4)reconciliationIssues.push(`expected 4 middle pages, received ${parsed.pages.length}`);
          parsed.pages.forEach((pg,i)=>{if(typeof pg?.text!=='string'||!pg.text.trim())reconciliationIssues.push(`page ${i+2} text is empty`)})
        }
        if(typeof parsed.closing!=='string'||!parsed.closing.trim())reconciliationIssues.push('missing closing');
        const spreadTexts=[parsed.opening,...(Array.isArray(parsed.pages)?parsed.pages.map(p=>p?.text||''):[]),parsed.closing];
        spreadTexts.forEach((txt,i)=>{const wc=String(txt||'').trim().split(/\s+/).filter(Boolean).length;if(wc>220)reconciliationIssues.push(`spread ${i+1} exceeds the 220-word KDP ceiling (${wc} words)`) });
      }
      if(reconciliationIssues.length){
        const payload={error:'Moonbeam could not reconcile the finished illustrations into the final story.'};
        if(finalDiagnostic){
          finalDiagnostic.parse_valid=!!parsed;
          finalDiagnostic.validation_issues=reconciliationIssues;
          finalDiagnostic.parsed_keys=parsed&&typeof parsed==='object'?Object.keys(parsed).slice(0,20):[];
          finalDiagnostic.parsed_page_count=Array.isArray(parsed?.pages)?parsed.pages.length:null;
          finalDiagnostic.output_head=output.slice(0,500);
          finalDiagnostic.output_tail=output.slice(-1000);
          payload.developer_diagnostic=finalDiagnostic;
        }
        return res.status(502).json(payload)
      }
      const story={title:String(parsed.title).trim(),opening:String(parsed.opening).trim(),character_bible:String(plan.character_bible||'').trim(),pages:parsed.pages.map((pg,i)=>({text:String(pg?.text||'').trim(),illustration_prompt:String(scenes[i+1]?.visual_moment||scenes[i+1]?.event||'').trim()})),closing:String(parsed.closing).trim()};
      if(story.pages.some(pg=>!pg.text))return res.status(502).json({error:'The finished story contained an empty page.'});
      await logUsage({event_type:'story_finalize',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:moonbeamUser.id,generation_run_id:String(body.generationRunId||'')}});
      return res.status(200).json({story,...(finalDiagnostic?{developer_diagnostic:finalDiagnostic}:{})});
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
    // V251.66 — Astra creative-autonomy experiment. Moonbeam supplies only hard product,
    // safety, Cast, copyright and technical constraints; Astra chooses the literary form.
    const ageBand = age <= 4 ? '3-4' : age <= 7 ? '5-7' : age <= 10 ? '8-10' : '11-12';
    const ageProfile = {
      '3-4': {label:'early-years', forbidden:'sexual content, graphic violence, dangerous instructions, self-harm encouragement, horror, abduction, realistic weapons, war, serious injury or death-focused plots'},
      '5-7': {label:'younger-reader', forbidden:'sexual content, graphic violence, dangerous instructions, self-harm encouragement, horror, abduction, realistic weapons or adult criminal menace'},
      '8-10': {label:'middle-childhood', forbidden:'sexual content, graphic violence, gore, torture, dangerous instructions, self-harm encouragement, true-crime treatment or adult horror'},
      '11-12': {label:'older-child', forbidden:'sexual content, graphic violence, gore, torture, dangerous instructions, self-harm encouragement, true-crime treatment or adult horror'}
    }[ageBand];
    const pageCount = 4;
    const storyIdea = String(child.storyIdea || '').trim();
    const ideaGuide = storyIdea
      ? `PARENT STORY IDEA — AUTHORITATIVE\n${storyIdea}\nUse this as the story brief. If it is unsafe/inappropriate for the child's age or requests protected copyrighted expression, flag it instead of silently replacing or reinterpreting it.`
      : `NO PARENT STORY IDEA\nCreate the story freely.`;

    const castLines = cast.length ? cast.map(m=>{const detail=m.kind==='child'?`child, age ${m.age}${m.gender?`, ${m.gender}`:''}`:m.kind==='adult'?`adult${m.gender?`, ${m.gender}`:''}`:`${m.animal_type||'pet'}${m.breed?`, breed: ${m.breed}`:''}`;return `- ${m.name} — ${detail} — ${String(m.role).toUpperCase()}`}).join('\n') : `- ${child.name} — child, age ${age}${child.gender?`, ${child.gender}`:''} — HERO`;
    const roleRules = `Roles describe narrative prominence only.
HERO means the story is principally about that character. With two heroes, both are genuine co-heroes.
Do not force every selected character into every scene.
CAST IS AUTHORITATIVE: the selected Heroes and Supporting Cast are the complete principal cast. Preserve supplied names, ages, sex markers, relationships, pet species/breed and other supplied facts. Never invent surnames. Do not invent additional named, recurring, familial, companion, friend, helper, rival or other plot-significant characters unless the Parent Story Idea explicitly establishes them. Unnamed incidental/background people may appear only when naturally required by the setting and must remain incidental.
Do not invent sensitive facts about a real child or Cast member, including medical conditions, religion, ethnicity or family circumstances. Where a human Cast member has an optional Male/Female marker, preserve it consistently. If a Cast member is marked male, do not invent decorative hair accessories unless they are clearly visible in the uploaded reference photo or explicitly required by the Parent Story Idea.`;
    const prompt = `You are the lead children's author for Moonbeam Stories.

Create the best age-appropriate children's story you can from the parent's premise and supplied Cast. You have complete creative autonomy. Choose whatever literary form, tone, structure, events and ending you believe make the strongest story. Moonbeam does not prefer prose, rhyme, verse, dialogue, comedy, adventure, problem-solving or any other form or narrative pattern.

LANGUAGE
${languageGuide}

${ideaGuide}

STORY CAST — AUTHORITATIVE
${castLines}
${roleRules}

AGE AND SAFETY — HARD CONSTRAINTS
The youngest hero is age ${age}; write content and language appropriate for that age. Do not follow a parent instruction that would make the story unsafe or inappropriate for that child.
Excluded content: ${ageProfile.forbidden}.
No politics or religious advocacy.

COPYRIGHT / PUBLIC DOMAIN — HARD CONSTRAINT
A parent may request reproduction or adaptation of material genuinely in the public domain in the United Kingdom. Public-domain characters, plots, settings and events may be used. Do not import protected additions from later copyrighted adaptations, translations, editions, illustrations, films, television, games or other derivative works.
Do not reproduce, continue, translate, closely imitate or disguise protected copyrighted characters, worlds, wording or recognisable protected expression. If the requested source's public-domain status is uncertain, treat it as protected.
If the Parent Story Idea requests unsafe/inappropriate content or impermissible use of protected copyrighted material, DO NOT reinterpret it into a different story. The concept stage must flag the input so Moonbeam can ask the parent for a new Story Idea.

FORMAT — HARD PRODUCT CONSTRAINT
The finished book has exactly SIX reading spreads: opening, four middle spreads and closing. Each spread must correspond to one coherent illustratable moment. The six moments must form one coherent book, but no particular plot structure is required.
There is no target or minimum word count and pages do not need to be similar lengths. KDP publishability is a hard ceiling: no individual finished reading spread may exceed 220 words. Use line breaks only when they are part of the chosen literary form; the final renderer will also enforce physical page fit.
Do not put headings inside the story text.

VISUAL CONTINUITY — HARD PRODUCTION CONSTRAINT
Once a recurring character, creature, vehicle, machine, location, clothing item or plot-important object is concretely established, keep its visual facts consistent unless the story itself changes them. Illustration plans must describe a single drawable moment and the physical facts needed to render it coherently; do not prescribe an art style.
For supplied Cast reference photos, the exact photo is authoritative for identity. Preserve recognisable identity and proportions. Story-world clothing may follow the story. Never invent glasses, jewellery, hats, hair accessories or other distinctive identity features that are absent from the reference unless the Story Idea requires them.

OUTPUT
Return JSON only in the exact schema requested by the current production stage.`;

    // V251.66: Astra handles all story text stages; creative constraints are intentionally minimal.
    // Final reconciliation, KDP copy and all image-generation machinery remain unchanged.
    const CREATIVE_STORY_MODEL = 'gpt-6-astra';
    async function callStoryModel(input, maxOutputTokens = 5000, diagnosticStage = 'story text') {
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: CREATIVE_STORY_MODEL, input, max_output_tokens: maxOutputTokens })
      });
      const raw = await r.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = {}; }
      if (developerDemo) {
        const usage=data?.usage||{};
        developerTextDiagnostics.push({stage:diagnosticStage,model:CREATIVE_STORY_MODEL,http_status:r.status,response_status:data?.status||null,incomplete_reason:data?.incomplete_details?.reason||null,input_tokens:Number(usage.input_tokens||0)||null,output_tokens:Number(usage.output_tokens||0)||null,total_tokens:Number(usage.total_tokens||0)||null,max_output_tokens:maxOutputTokens,raw_response_chars:raw.length});
      }
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


    async function callStoryModelStructured(input, schemaName, schema, maxOutputTokens = 6000, diagnosticStage = 'structured story output') {
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: CREATIVE_STORY_MODEL, input, max_output_tokens: maxOutputTokens, text:{format:{type:'json_schema',name:schemaName,strict:true,schema}} })
      });
      const raw = await r.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = {}; }
      if (developerDemo) {
        const usage=data?.usage||{};
        developerTextDiagnostics.push({stage:diagnosticStage,model:CREATIVE_STORY_MODEL,http_status:r.status,response_status:data?.status||null,incomplete_reason:data?.incomplete_details?.reason||null,input_tokens:Number(usage.input_tokens||0)||null,output_tokens:Number(usage.output_tokens||0)||null,total_tokens:Number(usage.total_tokens||0)||null,max_output_tokens:maxOutputTokens,raw_response_chars:raw.length});
      }
      if (!r.ok) {
        const e=data&&data.error;
        const message=typeof e==='string'?e:(e&&(e.message||e.code||e.type))||`OpenAI returned HTTP ${r.status}`;
        const error=new Error(String(message)); error.openaiStatus=r.status; throw error;
      }
      let output=typeof data.output_text==='string'?data.output_text:'';
      if(!output&&Array.isArray(data.output))for(const item of data.output){if(!Array.isArray(item.content))continue;for(const part of item.content){if(typeof part.text==='string')output+=part.text;else if(typeof part.output_text==='string')output+=part.output_text}}
      try{return JSON.parse(String(output||'').trim())}catch{throw new Error('Astra returned an invalid structured storyboard response.')}
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

CONCEPT STAGE — CREATIVE AUTONOMY

RECENT STORIES FROM THIS ACCOUNT — REPETITION AVOIDANCE ONLY
${recentMemory}
Use this history only to avoid unnecessarily repeating substantially the same underlying story concept, distinctive mechanism or ending. It is not a creative template and must not constrain the kind, form, tone or structure of the new story. If the Parent Story Idea explicitly asks to revisit something similar, follow the parent.

Do not write scenes or finished story text yet. Decide what story you believe makes the best book from the Parent Story Idea, Cast and child's age. You have complete creative autonomy over form, tone, structure, events and ending. Do not apply a preferred story formula or anti-formula.

First assess the Parent Story Idea only for the hard safety/copyright constraints above. If it is inappropriate/unsafe for age ${age}, or requests impermissible protected copyrighted material, return a concise input_warning asking the parent to enter a different Story Idea. Do not silently reinterpret an inappropriate request. Public-domain reproduction/adaptation is allowed under the copyright rule above.

If acceptable, return the concept you actually want to make. Do not invent surnames or contradict supplied Cast facts.

Return JSON ONLY:
{"input_warning":"empty string if acceptable; otherwise concise parent-facing warning","central_premise":"plain factual description of the chosen concept","direction":"brief description of the chosen literary/story direction","ending_destination":"plain factual description of where the story ultimately arrives"}`;
    function parseConceptOutput(text){
      for(const candidate of candidateJsonStrings(text)){
        for(const version of [candidate,candidate.replace(/,\s*([}\]])/g,'$1')]){
          try{
            const parsed=JSON.parse(version);
            const x=parsed&&parsed.concept&&typeof parsed.concept==='object'?parsed.concept:parsed;
            if(!x||typeof x!=='object')continue;
            const warning=String(x.input_warning||'').trim();
            const central=String(x.central_premise||x.premise||'').trim();
            const ending=String(x.ending_destination||x.ending||x.destination||'').trim();
            if(warning)return {input_warning:warning,central_premise:'',direction:'',ending_destination:''};
            if(central&&ending)return {input_warning:'',central_premise:central,direction:String(x.direction||'').trim(),ending_destination:ending};
          }catch{}
        }
      }
      return null;
    }
    let concept=null;let conceptOutput='';
    try{
      conceptOutput=await callStoryModel(conceptPrompt,4000,'concept generation');
      concept=parseConceptOutput(conceptOutput);
      if(!concept){
        const repairPrompt=`The previous concept-builder response could not be parsed. Return ONLY one valid JSON object with exactly these keys: input_warning, central_premise, direction, ending_destination. Do not add markdown, commentary or story prose. Preserve the strongest concept you intended; this is a formatting repair, not a request to reject the user's idea.\n\nORIGINAL CONCEPT-BUILDER INSTRUCTIONS:\n${conceptPrompt}\n\nPREVIOUS RESPONSE:\n${conceptOutput}`;
        const repaired=await callStoryModel(repairPrompt,4000,'concept JSON repair');
        concept=parseConceptOutput(repaired);
      }
    }catch(e){if(e.openaiStatus){await refundReservedCredit();return res.status(502).json({error:e.message,openai_status:e.openaiStatus})}throw e}
    if(!concept){await refundReservedCredit();return res.status(502).json({error:'Moonbeam had trouble preparing this story idea. Please try again.'})}
    if(concept.input_warning){await refundReservedCredit();return res.status(400).json({error:concept.input_warning,storyIdeaRejected:true})}

    // Plan the complete illustrated book only AFTER the concept has been selected.
    const planningBase = String(prompt).split('\nOUTPUT\n')[0].replace('Write a completely original children’s story centred on the selected hero or co-heroes.','Design a completely original children’s story centred on the selected hero or co-heroes, but do not write its finished prose yet.').replace('Write an original, polished children’s story in natural ${language}.','Design an original, polished children’s story suitable for later writing in natural ${language}.');
    const planningPrompt = `${planningBase}

STORYBOARD STAGE — CREATIVE AUTONOMY
Do not write finished story prose, dialogue or page text. Create the six-scene production plan for the concept below.

CHOSEN CONCEPT — AUTHORITATIVE
${JSON.stringify(concept,null,2)}

You have complete creative autonomy over how the concept becomes a story. Do not impose or avoid any particular narrative structure. Do not add creative requirements beyond the Parent Story Idea, age appropriateness, Cast facts, copyright/public-domain rule and six-spread product format.

Create exactly six coherent, drawable interior moments covering the complete book, including the ending. Also design the front cover in this same art-direction pass.

At this stage you have a SECOND ROLE: you are the ART DIRECTOR AND VISUAL CONTINUITY DESIGNER for the entire book: six interior illustrations plus the front cover. Sunburst is only the painter. Do not ask Sunburst to interpret the story, invent the staging, design recurring story elements, choose wardrobe, or repair visual logic for you. You must make those decisions before it paints.

First design the coherent visual world for YOUR story. Use character_bible as the production design bible: establish the wardrobe you choose for recurring Cast, and concretely design recurring story-created creatures, vehicles, machines, buildings, locations and plot-important objects so that the same thing can be reproduced throughout the book. Record distinctive construction, materials, shape, scale, colours and other stable visual facts only where they matter. Canonical Cast photographs remain the absolute authority for personal identity; direct the photographed person but never redesign their face/body identity or invent identity-defining accessories absent from the reference.

Then art-direct every scene precisely. EVENT states what actually happens. VISUAL_MOMENT is a direct commission to the painter for the exact single frame you have chosen. Specify the composition and physical geometry with enough precision that a skilled painter who has NOT read the story can stage it without making narrative decisions. Where relevant, state relative positions, distances, foreground/background placement, orientation, relative sizes, who or what is beside/behind/in front of/inside/on top of what, which objects are held and how, and the physical state of important objects. Direct character performance too: facial expression, head/body orientation, gaze target, gesture, pointing direction and interaction with other characters or objects whenever those details communicate the intended event. If a hand, gaze, gesture or spatial relationship matters, name its target unambiguously rather than leaving the painter to guess.

Maintain continuity across all six interior briefs and the cover yourself. Once you establish wardrobe, an object/creature/machine design, scale, location layout or physical state, preserve it in later scenes unless your planned story deliberately changes it; when it changes, describe the change and carry the new state forward. CONTINUITY records the concrete facts that later scenes must preserve. Do not add detail merely to satisfy a checklist: precision serves your particular composition and story. But never delegate a consequential staging, design or continuity decision to Sunburst. No field may contain polished story prose.

Design the COVER as a separate commission after you have designed the six interiors. It should be the strongest single cover composition for the story as a whole; it need not duplicate an interior scene. Make every consequential composition/staging decision yourself just as for the interiors, preserve the same wardrobe/world/recurring designs, and leave calm usable space in the central/upper area for Moonbeam's separate title typography. Do not include or request words, letters, captions, logos, signs or readable text in the painting. The cover commission will be painted only after all six interiors exist, so the painter will also receive those finished paintings as continuity references.

Do not invent surnames. Preserve supplied Cast facts exactly. Do not prescribe art style; Moonbeam controls rendering style separately.

Return JSON ONLY in exactly this shape:
{"premise":"string","story_arc":"string","ending":"string","character_bible":"string","cover_direction":"one complete precise front-cover art-director brief","scenes":[{"event":"string","visual_moment":"string","continuity":"string"},{"event":"string","visual_moment":"string","continuity":"string"},{"event":"string","visual_moment":"string","continuity":"string"},{"event":"string","visual_moment":"string","continuity":"string"},{"event":"string","visual_moment":"string","continuity":"string"},{"event":"string","visual_moment":"string","continuity":"string"}]}`;
    let plan=null;
    const storyboardSchema={type:'object',additionalProperties:false,required:['premise','story_arc','ending','character_bible','cover_direction','scenes'],properties:{premise:{type:'string'},story_arc:{type:'string'},ending:{type:'string'},character_bible:{type:'string'},cover_direction:{type:'string'},scenes:{type:'array',minItems:6,maxItems:6,items:{type:'object',additionalProperties:false,required:['event','visual_moment','continuity'],properties:{event:{type:'string'},visual_moment:{type:'string'},continuity:{type:'string'}}}}}};
    try{
      plan=await callStoryModelStructured(planningPrompt,'moonbeam_visual_storyboard',storyboardSchema,6500,'storyboard planning');
    }catch(e){if(e.openaiStatus){await refundReservedCredit();return res.status(502).json({error:e.message,openai_status:e.openaiStatus})}await refundReservedCredit();return res.status(502).json({error:e.message||'Moonbeam could not create the visual storyboard correctly. Please try again.'})}
    if(!plan){await refundReservedCredit();return res.status(502).json({error:'Moonbeam could not create the visual storyboard correctly. Please try again.'})}
    plan.concept=concept;plan.title_working=String(plan.title_working||'').trim();plan.premise=String(plan.premise||'').trim();plan.story_arc=String(plan.story_arc||'').trim();plan.ending=String(plan.ending||'').trim();plan.character_bible=String(plan.character_bible||'').trim();plan.cover_direction=String(plan.cover_direction||'').trim();
    plan.scenes=plan.scenes.slice(0,6).map((x,i)=>({scene:i+1,event:String(x?.event||'').trim(),visual_moment:String(x?.visual_moment||'').trim(),continuity:String(x?.continuity||'').trim()}));
    if(!plan.premise||!plan.story_arc||!plan.ending||!plan.character_bible||!plan.cover_direction||plan.scenes.some(x=>!x.event||!x.visual_moment)){await refundReservedCredit();return res.status(502).json({error:'Moonbeam produced an incomplete visual storyboard. Please try again.'})}
    const generationRunId=await createGenerationRun(moonbeamUser.id);
    await logUsage({event_type:'story_concept',estimated_cost_gbp:estimateGBP('story'),metadata:{model:CREATIVE_STORY_MODEL,user_id:moonbeamUser.id,generation_run_id:generationRunId,recent_story_count:recentStories.length}});
    await logUsage({event_type:'story_plan',estimated_cost_gbp:estimateGBP('story'),metadata:{model:CREATIVE_STORY_MODEL,user_id:moonbeamUser.id,generation_run_id:generationRunId}});
    await logSupportAttempt('success',{credit_deducted:!developerDemo,credit_refunded:false,generation_run_id:generationRunId});
    creditReserved=false;
    return res.status(200).json({creditsRemaining,generationRunId,storyCreditBatchId:developerDemo?'':reservedBatchId,plan,image:null,layout:{requestedLength:length,storyPages:4,displayedTextPages:6,storyboardFirst:true},...(developerDemo?{developer_diagnostics:developerTextDiagnostics}:{})});
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
