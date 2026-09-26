const {logUsage,estimateGBP,SUPABASE_URL,SECRET_KEY,adminHeaders}=require('../_usage');
const {verifyMoonbeamUser,reserveStoryCredit,refundReservedStoryCredit,createGenerationRun}=require('../_credits');
function candidateJsonStrings(text) {
  const clean = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const candidates = [];
  if (clean) candidates.push(clean);
  let start = -1, depth = 0, inString = false, escaped = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') { if (depth === 0) start = i; depth++; }
    else if (ch === '}' && depth > 0) { depth--; if (depth === 0 && start >= 0) { candidates.push(clean.slice(start, i + 1)); break; } }
  }
  return [...new Set(candidates.filter(Boolean))];
}
function parseStoryOutput(text) {
  for (const candidate of candidateJsonStrings(text)) {
    for (const version of [candidate, candidate.replace(/,\s*([}\]])/g, '$1')]) {
      try { const parsed = JSON.parse(version); const story = parsed && parsed.story && typeof parsed.story === 'object' ? parsed.story : parsed; if (story && typeof story === 'object') return story; } catch {}
    }
  }
  return null;
}
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
      const developerEmail = String(process.env.MOONBEAM_DEVELOPER_EMAIL || '').trim().toLowerCase();
      const developerDiagnostic = !!developerEmail && String(moonbeamUser.email || '').trim().toLowerCase() === developerEmail;
      const child = body.child || {};
      const images = Array.isArray(body.images) ? body.images.filter(x=>/^data:image\/(?:jpeg|png|webp);base64,/i.test(String(x||''))).slice(0,6) : [];
      if (images.length !== 6) return res.status(400).json({error:'The finished illustration set is incomplete.'});
      const age = Number(child.age)||7;
      const language = String(child.language||'en-GB');
      const languageGuide = {'en-GB':'natural contemporary British English with British spelling','en-US':'natural contemporary American English','es-ES':'natural Spanish from Spain','es-419':'natural neutral Latin American Spanish','fr-FR':'natural French from France','de-DE':'natural German from Germany','it-IT':'natural Italian from Italy','pt-BR':'natural Brazilian Portuguese','pl-PL':'natural contemporary Polish'}[language]||'natural British English';
      const finalAgeBand=age<=4?'3-4':age<=7?'5-7':age<=10?'8-10':'11-12';
      const finalAgeGuide={
        '3-4':{prose:'Use very short clear sentences, familiar concrete words and simple syntax suitable for a three- or four-year-old being read to aloud.',total:'about 360-460 words',spread:'55-75 words',closing:'50-70 words'},
        '5-7':{prose:'Use lively accessible prose and natural dialogue suitable for a five- to seven-year-old.',total:'about 560-680 words',spread:'90-115 words',closing:'80-105 words'},
        '8-10':{prose:'Use richer vocabulary and varied natural sentences suitable for an eight- to ten-year-old; trust the reader to infer straightforward things.',total:'about 650-760 words',spread:'105-128 words',closing:'90-115 words'},
        '11-12':{prose:'Use genuinely sophisticated but natural fiction suitable for an eleven- or twelve-year-old; do not talk down to the reader.',total:'about 720-850 words',spread:'118-145 words',closing:'100-125 words'}
      }[finalAgeBand];
      const cast=Array.isArray(child.cast)?child.cast.filter(m=>m&&m.name):[];
      const castLines=cast.length?cast.map(m=>`- ${m.name}${m.kind==='child'&&m.age?` — child, age ${m.age}`:m.kind==='adult'?' — adult':m.kind==='pet'?` — ${m.animal_type||'pet'}${m.breed?`, ${m.breed}`:''}`:''}`).join('\n'):`- ${String(child.name||'the child')} — child, age ${age}`;
      const finalPrompt = `You are the author of a Moonbeam children's book. The SIX attached images, in the order supplied, are the finished illustrations for an unwritten book.

Study all six images together before deciding what the story is.

CAST:
${castLines}

The six pictures are your only creative source. There is no story, premise, storyboard, illustration brief or intended explanation for you to reconstruct.

Look carefully at what is actually depicted, including unusual details, changes between pictures, characters' expressions and interactions, and things that could have more than one explanation.

Find the cleverest and funniest interpretation of these six images that allows them to belong to one coherent story. Then write that story.

Treat the pictures as evidence, not captions. You may invent what happened before, after and between the illustrated moments, and invent dialogue, motivations, causes, consequences, relationships and explanations. Do not contradict anything clearly depicted. Where something is visually ambiguous, interpret it freely. An unusual but plausible visual detail may become useful story material rather than being ignored.

Do not merely describe the illustrations. Write naturally and imaginatively.

TECHNICAL REQUIREMENTS:
- Write for age ${age} in ${languageGuide}. ${finalAgeGuide.prose}
- Preserve the exact supplied Cast names. Do not invent surnames or family relationships the parent did not supply.
- Keep the content age-appropriate and non-graphic.
- Respect copyright: do not copy protected wording, characters, distinctive scenes, event sequences, dialogue or resolutions from protected works. Public-domain source material may be used when explicitly requested, without importing protected additions from later adaptations.
- Produce one continuous coherent story of ${finalAgeGuide.total} across exactly SIX balanced reading spreads.
- Spread 1 about ${finalAgeGuide.spread}; spreads 2-5 about ${finalAgeGuide.spread} each; spread 6 about ${finalAgeGuide.closing}.
- No headings inside the prose.

Return JSON ONLY in exactly this shape:
{"title":"string","opening":"spread 1 prose","pages":[{"text":"spread 2 prose"},{"text":"spread 3 prose"},{"text":"spread 4 prose"},{"text":"spread 5 prose"}],"closing":"spread 6 prose"}`;
      const content=[{type:'input_text',text:finalPrompt},...images.map(image_url=>({type:'input_image',image_url,detail:'low'}))];
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.6-luna',input:[{role:'user',content}],max_output_tokens:5000,text:{format:{type:'json_schema',name:'moonbeam_final_story',strict:true,schema:{type:'object',additionalProperties:false,required:['title','opening','pages','closing'],properties:{title:{type:'string'},opening:{type:'string'},pages:{type:'array',minItems:4,maxItems:4,items:{type:'object',additionalProperties:false,required:['text'],properties:{text:{type:'string'}}}},closing:{type:'string'}}}}}})});
      const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{};
      const usage=data?.usage||{};
      const finalDiagnostic=developerDiagnostic?{stage:'Story B from images',model:'gpt-5.6-luna',http_status:r.status,response_status:data?.status||null,incomplete_reason:data?.incomplete_details?.reason||null,input_tokens:Number(usage.input_tokens||0)||null,output_tokens:Number(usage.output_tokens||0)||null,total_tokens:Number(usage.total_tokens||0)||null,max_output_tokens:5000,raw_response_chars:raw.length}:null;
      if(!r.ok){const e=data?.error;const payload={error:typeof e==='string'?e:(e?.message||`OpenAI returned HTTP ${r.status}`)};if(finalDiagnostic)payload.developer_diagnostic=finalDiagnostic;return res.status(502).json(payload)}
      let output=typeof data.output_text==='string'?data.output_text:'';if(!output&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')output+=part.text;
      if(finalDiagnostic)finalDiagnostic.output_chars=output.length;
      const parsed=parseStoryOutput(output);
      const issues=[];
      if(!parsed)issues.push('JSON could not be parsed');
      else{
        if(typeof parsed.title!=='string'||!parsed.title.trim())issues.push('missing title');
        if(typeof parsed.opening!=='string'||!parsed.opening.trim())issues.push('missing opening');
        if(!Array.isArray(parsed.pages))issues.push('pages is not an array');
        else{if(parsed.pages.length!==4)issues.push(`expected 4 middle pages, received ${parsed.pages.length}`);parsed.pages.forEach((pg,i)=>{if(typeof pg?.text!=='string'||!pg.text.trim())issues.push(`page ${i+2} text is empty`)})}
        if(typeof parsed.closing!=='string'||!parsed.closing.trim())issues.push('missing closing');
      }
      if(issues.length){const payload={error:'Moonbeam could not write the finished illustrated story.'};if(finalDiagnostic){finalDiagnostic.parse_valid=!!parsed;finalDiagnostic.validation_issues=issues;finalDiagnostic.output_head=output.slice(0,500);finalDiagnostic.output_tail=output.slice(-1000);payload.developer_diagnostic=finalDiagnostic}return res.status(502).json(payload)}
      const story={title:String(parsed.title).trim(),opening:String(parsed.opening).trim(),pages:parsed.pages.map(pg=>({text:String(pg?.text||'').trim()})),closing:String(parsed.closing).trim()};
      await logUsage({event_type:'story_finalize',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-5.6-luna',user_id:moonbeamUser.id,generation_run_id:String(body.generationRunId||'')}});
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
    const isDeveloperAccount=!!(developerEmail&&String(moonbeamUser.email||'').trim().toLowerCase()===developerEmail);
    const developerDemo=demoRequested&&isDeveloperAccount;
    const developerTextDiagnostics=[];
    async function callStoryModel(input, maxOutputTokens = 5000, diagnosticStage = 'story text') {
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-5.6-luna', input, max_output_tokens: maxOutputTokens })
      });
      const raw = await r.text();
      let data; try { data = JSON.parse(raw); } catch { data = {}; }
      if (developerDemo) {
        const usage=data?.usage||{};
        developerTextDiagnostics.push({stage:diagnosticStage,model:'gpt-5.6-luna',http_status:r.status,response_status:data?.status||null,incomplete_reason:data?.incomplete_details?.reason||null,input_tokens:Number(usage.input_tokens||0)||null,output_tokens:Number(usage.output_tokens||0)||null,total_tokens:Number(usage.total_tokens||0)||null,max_output_tokens:maxOutputTokens,raw_response_chars:raw.length});
      }
      if (!r.ok) {
        const e = data && data.error;
        const message = typeof e === 'string' ? e : (e && (e.message || e.code || e.type)) || `OpenAI returned HTTP ${r.status}`;
        const error = new Error(String(message)); error.openaiStatus = r.status; throw error;
      }
      let output = typeof data.output_text === 'string' ? data.output_text : '';
      if (!output && Array.isArray(data.output)) for (const item of data.output) for (const part of (item.content || [])) {
        if (typeof part.text === 'string') output += part.text;
        else if (typeof part.output_text === 'string') output += part.output_text;
      }
      return String(output || '').trim();
    }
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
    // V251.42: prose density and narrative sophistication now scale across the full 3–12 range.
    const ageBand = age <= 4 ? '3-4' : age <= 7 ? '5-7' : age <= 10 ? '8-10' : '11-12';
    const ageProfiles = {
      '3-4': {totalWords:'about 360-460 words',perScreen:'55-75 words',closingWords:'50-70 words'},
      '5-7': {totalWords:'about 560-680 words',perScreen:'90-115 words',closingWords:'80-105 words'},
      '8-10': {totalWords:'about 650-760 words',perScreen:'105-128 words',closingWords:'90-115 words'},
      '11-12': {totalWords:'about 720-850 words',perScreen:'118-145 words',closingWords:'100-125 words'}
    };
    const ageProfile = ageProfiles[ageBand];
    const lengthConfig = { pages: 4, totalScreens: 6, totalWords: ageProfile.totalWords };
    const pageCount = 4;
    const lengthGuide = lengthConfig.totalWords;
    const targetPerScreen = ageProfile.perScreen;

    // V250.13: creative cleanup. A blank Story Idea no longer receives a genre/reality/magic/
    // companion/object/twist blueprint. The storyteller chooses the premise freely within the
    // age-safety, Cast and technical output constraints below.
    const storyIdea = String(child.storyIdea || '').trim();

    const ideaGuide = storyIdea
      ? `PARENT STORY IDEA — AUTHORITATIVE\n${storyIdea}\nUse this as the premise for Story A. Do not replace it with a different premise.`
      : `NO PARENT STORY IDEA\nInvent the premise freely.`;

    const castLines = cast.length ? cast.map(m=>{const detail=m.kind==='child'?`child, age ${m.age}${m.gender?`, ${m.gender}`:''}`:m.kind==='adult'?`adult${m.gender?`, ${m.gender}`:''}`:`${m.animal_type||'pet'}${m.breed?`, breed: ${m.breed}`:''}`;return `- ${m.name} — ${detail} — ${String(m.role).toUpperCase()}`}).join('\n') : `- ${child.name} — child, age ${age}${child.gender?`, ${child.gender}`:''} — HERO`;
    const visualIdentityRules = `Use every selected Cast member's supplied personal name exactly as given. Preserve supplied identity, age, gender where present, species/breed and reference-photo likeness. Do not invent surnames or family relationships. When a structured Story Cast is supplied, do not invent additional named recurring principal characters unless the Parent Story Idea explicitly requires them. Unnamed incidental background characters may appear when the setting naturally requires them.`;

    // V251.62: Story A is deliberately disposable creative scaffolding. It exists only to
    // generate six narratively meaningful illustrations. It is never returned to the browser
    // and can therefore never leak into the final image-reading author call.
    const storyAPrompt = `Write an original children's story from the parent's idea. This is Story A: a private seed story that will be illustrated and then discarded.

STORY CAST
${castLines}

${ideaGuide}
Things to avoid: ${child.dislikes || 'nothing specific'}
Youngest hero age: ${age}
Language: ${languageGuide}

Make the story clever and funny. Write naturally rather than following a prescribed plot formula.

The story must occupy exactly SIX balanced reading spreads. Each spread will receive one illustration, so each should contain a concrete moment that can genuinely be pictured. Preserve the exact supplied Cast names and details. Keep the content age-appropriate and non-graphic. Do not copy protected wording, characters, distinctive scenes, event sequences, dialogue or resolutions from protected works.

Return JSON ONLY in exactly this shape:
{"title":"working title","spreads":["spread 1","spread 2","spread 3","spread 4","spread 5","spread 6"]}`;
    let storyAOutput='';let storyA=null;
    try{
      storyAOutput=await callStoryModel(storyAPrompt,4200,'private Story A');
      for(const candidate of candidateJsonStrings(storyAOutput)){for(const version of [candidate,candidate.replace(/,\s*([}\]])/g,'$1')]){try{const x=JSON.parse(version);if(x&&Array.isArray(x.spreads)&&x.spreads.length===6){storyA=x;break}}catch{}}if(storyA)break}
    }catch(e){if(e.openaiStatus){await refundReservedCredit();return res.status(502).json({error:e.message,openai_status:e.openaiStatus})}throw e}
    if(!storyA){await refundReservedCredit();return res.status(502).json({error:'Moonbeam could not create the private seed story correctly. Please try again.'})}
    storyA.title=String(storyA.title||'').trim();
    storyA.spreads=storyA.spreads.slice(0,6).map(x=>String(x||'').trim());
    if(storyA.spreads.some(x=>!x)){await refundReservedCredit();return res.status(502).json({error:'Moonbeam produced an incomplete private seed story. Please try again.'})}

    const planningPrompt = `You are illustrating a COMPLETE children's story that has already been written. Create exactly SIX finished illustration briefs: one faithful illustration for each of its six spreads.

STORY CAST
${castLines}

VISUAL IDENTITY
${visualIdentityRules}

PRIVATE STORY A — ILLUSTRATE THIS STORY FAITHFULLY
TITLE: ${storyA.title||'(untitled)'}
${storyA.spreads.map((x,i)=>`SPREAD ${i+1}:\n${x}`).join('\n\n')}

Do not invent a replacement story and do not try to leave room for a later writer. Your only creative job is to turn the six already-written story moments into strong finished pictures.

The six illustrations must be mutually compatible and preserve recurring identities, clothing, creatures, important objects, vehicles and locations. Every scene must be physically and spatially coherent: characters, creatures, objects and surroundings must occupy plausible three-dimensional space and interact correctly with solid surfaces and one another. Nothing should intersect, merge, duplicate or occupy physically impossible positions.

The character_bible is a visual production model sheet only. For photographed Cast, the supplied reference remains the identity authority; use the bible for story-world clothing and visual continuity. For recurring non-photo characters, creatures, vehicles, rooms, buildings, machines and important objects, record only stable visible characteristics needed for consistent illustration.

Each visual_moment must describe only the concrete visible content of that spread's illustration. Each continuity field records only concrete visual facts subsequent illustrations need to preserve. Do not include narration, dialogue, prose, morals or explanations in the illustration briefs.

Return JSON ONLY in exactly this shape:
{"character_bible":"fixed visual continuity description","scenes":[{"scene":1,"visual_moment":"one concrete visible scene","continuity":"brief concrete visual facts"},{"scene":2,"visual_moment":"...","continuity":"..."},{"scene":3,"visual_moment":"...","continuity":"..."},{"scene":4,"visual_moment":"...","continuity":"..."},{"scene":5,"visual_moment":"...","continuity":"..."},{"scene":6,"visual_moment":"...","continuity":"..."}]}`;
    let planOutput='';let plan=null;
    try{
      planOutput=await callStoryModel(planningPrompt,3600,'visual storyboard planning');
      for(const candidate of candidateJsonStrings(planOutput)){for(const version of [candidate,candidate.replace(/,\s*([}\]])/g,'$1')]){try{const x=JSON.parse(version);if(x&&Array.isArray(x.scenes)&&x.scenes.length===6){plan=x;break}}catch{}}if(plan)break}
    }catch(e){if(e.openaiStatus){await refundReservedCredit();return res.status(502).json({error:e.message,openai_status:e.openaiStatus})}throw e}
    if(!plan){await refundReservedCredit();return res.status(502).json({error:'Moonbeam could not create the visual storyboard correctly. Please try again.'})}
    plan.character_bible=String(plan.character_bible||'').trim();
    plan.scenes=plan.scenes.slice(0,6).map((x,i)=>({scene:i+1,visual_moment:String(x?.visual_moment||'').trim(),continuity:String(x?.continuity||'').trim()}));
    if(!plan.character_bible||plan.scenes.some(x=>!x.visual_moment)){await refundReservedCredit();return res.status(502).json({error:'Moonbeam produced an incomplete visual storyboard. Please try again.'})}
    const generationRunId=await createGenerationRun(moonbeamUser.id);
    await logUsage({event_type:'story_plan',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-5.6-luna',user_id:moonbeamUser.id,generation_run_id:generationRunId}});
    await logSupportAttempt('success',{credit_deducted:!developerDemo,credit_refunded:false,generation_run_id:generationRunId});
    creditReserved=false;
    return res.status(200).json({creditsRemaining,generationRunId,storyCreditBatchId:developerDemo?'':reservedBatchId,plan,image:null,layout:{requestedLength:length,storyPages:4,displayedTextPages:6,storyboardFirst:true},...(isDeveloperAccount?{developer_story_a:storyA}:{}) ,...(developerDemo?{developer_diagnostics:developerTextDiagnostics}:{})});
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
