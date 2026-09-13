const {logUsage,estimateGBP}=require('../_usage');
const {verifyMoonbeamUser,reserveStoryCredit,refundReservedStoryCredit,createGenerationRun}=require('../_credits');
const {
  createVarietySeed,
  makePlanningPrompt,
  makePlanValidationPrompt,
  makePlanRepairPrompt,
  makeWriterPrompt,
  makeStoryValidationPrompt,
  makeStoryRepairPrompt,
  deterministicStoryIssues,
  normalisePlanner,
  normaliseStory,
  wordCount
}=require('../_story-engine');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });

  let reservedUserId=null, reservedBatchId=null, creditReserved=false;
  const refundOuterReservation=async()=>{
    if(!creditReserved||!reservedUserId)return;
    creditReserved=false;
    try{await refundReservedStoryCredit(reservedUserId,reservedBatchId)}
    catch(refundError){console.error('credit refund error',refundError)}
  };

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const child = body.child || {};
    if (!child.name || !Number.isFinite(Number(child.age))) {
      return res.status(400).json({ error: 'Please provide a name and age.' });
    }

    const age = Number(child.age);
    const language = child.language || 'en-GB';
    const storyIdea = String(child.storyIdea || '').trim();
    const selectedTone = String(child.tone || 'cosy and funny');
    const selectedValues = Array.isArray(child.values) ? child.values.filter(v => String(v || '').trim()) : [];
    const writingMode = String(child.writingMode || 'prose').toLowerCase() === 'rhyme' ? 'rhyme' : 'prose';

    const languageGuide = {
      'en-GB': 'Write in natural British English. Use British spelling and vocabulary.',
      'en-US': 'Write in natural American English. Use American spelling and vocabulary.',
      'es-ES': 'Escribe en español natural de España, con vocabulario y expresiones habituales en España.',
      'es-419': 'Escribe en español latinoamericano neutro y natural, ampliamente comprensible en Latinoamérica.',
      'fr-FR': 'Écris en français naturel de France, avec le vocabulaire et les expressions courantes en France.',
      'de-DE': 'Schreibe in natürlichem Deutsch aus Deutschland mit idiomatischer Grammatik und Wortwahl.',
      'it-IT': 'Scrivi in italiano naturale d’Italia, con lessico ed espressioni idiomatiche.',
      'pt-BR': 'Escreva em português brasileiro natural, usando vocabulário e expressões comuns no Brasil.',
      'pl-PL': 'Pisz naturalnym, współczesnym językiem polskim odpowiednim dla dziecka.'
    }[language] || 'Write in natural British English.';

    const toneGuide = {
      'cosy and funny': 'Warm, playful and gently humorous, with amusing situations and reassuring stakes.',
      'magical': 'Create wonder and enchantment only where compatible with the approved plan and its reality rules.',
      'adventurous': 'Energetic and exciting, with age-appropriate tension, purposeful movement and discovery.',
      'calm and dreamy': 'Gentle and atmospheric, allowing quieter progression and a soothing emotional finish without forcing bedtime imagery.'
    }[selectedTone] || 'Let the selected tone shape diction, pacing, dialogue and atmosphere without changing the approved plot.';

    const ageBand = age <= 5 ? '3-5' : age <= 8 ? '6-8' : '9-12';
    const ageProfiles = {
      '3-5': {
        label:'early-years',
        writing:'Use short, clear sentences, concrete language, a small cast, simple cause-and-effect and frequent reassuring cues. Keep the central situation easy to understand. Excitement is welcome, but any separation, chase, storm, large creature or getting-lost moment must be brief, non-threatening and quickly reassuring.',
        stakes:'gentle and reassuring; no realistic danger, crime, horror, death-focused plots, abduction, weapons, war, serious injury or frightening villains',
        forbidden:'murder, true crime, kidnapping, abduction, realistic weapons, war, horror, gore, serious injury, death-focused plots, predatory threat, terrifying monsters, adult criminal behaviour'
      },
      '6-8': {
        label:'younger-reader',
        writing:'Use lively but accessible prose, clear motivations, a manageable cast, strong cause-and-effect, humour, clues and moderate suspense. Mild peril may occur but must remain clearly child-safe, non-graphic and recover into reassurance.',
        stakes:'exciting but child-safe; no murder/true crime, graphic violence, realistic weapon use, horror, abduction plots or adult criminal menace',
        forbidden:'murder, true crime, kidnapping, abduction, graphic injury, realistic weapon use, horror, gore, adult criminal menace'
      },
      '9-12': {
        label:'older-child',
        writing:'Use richer vocabulary, more layered motivations, stronger suspense, subtler humour and a more sophisticated plot while remaining clearly suitable for a child. Peril can feel meaningful but must not become graphic, horrific or adult in subject matter.',
        stakes:'meaningful adventure stakes without graphic violence, sexual content, true-crime treatment, torture, gore or adult horror',
        forbidden:'graphic violence, gore, torture, sexual content, true-crime treatment, sadistic threat, adult horror'
      }
    };
    const ageProfile = ageProfiles[ageBand];

    const moonbeamUser = await verifyMoonbeamUser(req);
    let creditsRemaining;
    try {
      const reservation = await reserveStoryCredit(moonbeamUser.id);
      creditsRemaining = reservation.remaining;
      reservedBatchId = reservation.batchId;
      reservedUserId = moonbeamUser.id;
      creditReserved = true;
    } catch (e) {
      return res.status(e.status || 500).json({ error: e.message, code: e.code || 'CREDIT_ERROR', batchId: e.batchId || null });
    }

    const ctx = {
      name:String(child.name),
      age,
      ageBand,
      ageLabel:ageProfile.label,
      ageWriting:ageProfile.writing,
      ageStakes:ageProfile.stakes,
      ageForbidden:ageProfile.forbidden,
      language,
      languageGuide,
      storyIdea,
      dislikes:String(child.dislikes || '').trim(),
      selectedTone,
      toneGuide,
      valuesText:selectedValues.length ? selectedValues.join(', ') : 'none specifically selected; do not impose a moral',
      totalWords:'650-750 words',
      writingMode,
      varietySeed:createVarietySeed()
    };

    let modelCalls = 0;
    async function callModel(input, maxOutputTokens=5000) {
      modelCalls++;
      const r = await fetch('https://api.openai.com/v1/responses', {
        method:'POST',
        headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
        body:JSON.stringify({model:'gpt-5.6-luna',input,max_output_tokens:maxOutputTokens})
      });
      const raw=await r.text();
      let data; try{data=JSON.parse(raw)}catch{data={}};
      if(!r.ok){
        const e=data&&data.error;
        const message=typeof e==='string'?e:(e&&(e.message||e.code||e.type))||`OpenAI returned HTTP ${r.status}`;
        const error=new Error(String(message)); error.openaiStatus=r.status; throw error;
      }
      let output=typeof data.output_text==='string'?data.output_text:'';
      if(!output&&Array.isArray(data.output)){
        for(const item of data.output){
          if(!Array.isArray(item.content))continue;
          for(const part of item.content){
            if(typeof part.text==='string')output+=part.text;
            else if(typeof part.output_text==='string')output+=part.output_text;
          }
        }
      }
      return String(output||'').trim();
    }

    function candidateJsonStrings(text) {
      const clean=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/i,'');
      const candidates=[]; if(clean)candidates.push(clean);
      let start=-1,depth=0,inString=false,escaped=false;
      for(let i=0;i<clean.length;i++){
        const ch=clean[i];
        if(inString){
          if(escaped)escaped=false;
          else if(ch==='\\')escaped=true;
          else if(ch==='"')inString=false;
          continue;
        }
        if(ch==='"'){inString=true;continue}
        if(ch==='{'){if(depth===0)start=i;depth++}
        else if(ch==='}'&&depth>0){
          depth--;
          if(depth===0&&start>=0){candidates.push(clean.slice(start,i+1));break}
        }
      }
      return [...new Set(candidates.filter(Boolean))];
    }

    function parseJson(text){
      for(const candidate of candidateJsonStrings(text)){
        for(const version of [candidate,candidate.replace(/,\s*([}\]])/g,'$1')]){
          try{return JSON.parse(version)}catch{}
        }
      }
      return null;
    }

    async function getApprovedPlan(extraFeedback=''){
      let planner=null, findings=null;
      for(let attempt=0;attempt<2;attempt++){
        const planningPrompt=makePlanningPrompt(ctx)+(extraFeedback||findings
          ? `\n\nPREVIOUS EDITOR FEEDBACK TO ADDRESS:\n${extraFeedback || JSON.stringify(findings)}`
          :'');
        planner=normalisePlanner(parseJson(await callModel(planningPrompt,5000)));
        if(!planner){findings={outcome:'REJECT',hard_failures:['Planner output was malformed.'],soft_failures:[],recommended_repairs:[],return_to:'PLAN'};continue}

        findings=parseJson(await callModel(makePlanValidationPrompt(ctx,planner),1800));
        if(findings&&findings.outcome==='PASS') return {planner,findings};

        if(findings&&findings.outcome==='REPAIR'){
          const repaired=normalisePlanner(parseJson(await callModel(makePlanRepairPrompt(ctx,planner,findings),5000)));
          if(repaired){
            const recheck=parseJson(await callModel(makePlanValidationPrompt(ctx,repaired),1800));
            if(recheck&&recheck.outcome==='PASS') return {planner:repaired,findings:recheck};
            findings=recheck||findings;
          }
        }
      }
      return null;
    }

    async function writeOnce(planner, extraDirection=''){
      const prompt=makeWriterPrompt(ctx,planner)+(extraDirection?`\n\nADDITIONAL EDITOR DIRECTION:\n${extraDirection}`:'');
      return normaliseStory(parseJson(await callModel(prompt,6500)),child,age);
    }

    async function validateStory(planner, story){
      const deterministic=deterministicStoryIssues(story,ctx);
      const semantic=parseJson(await callModel(makeStoryValidationPrompt(ctx,planner,story,deterministic),2200));
      return {deterministic,semantic};
    }

    async function writeApprovedStory(planner){
      let story=await writeOnce(planner);
      if(!story) return null;

      let result=await validateStory(planner,story);
      const outcome=result.semantic&&result.semantic.outcome;
      if(outcome==='PASS' && result.deterministic.length===0) return story;

      if(outcome==='REPAIR' || result.deterministic.length){
        const repairFindings={
          ...(result.semantic||{outcome:'REPAIR',hard_failures:[],soft_failures:[],repair_instructions:[]}),
          deterministic_issues:result.deterministic
        };
        const repaired=normaliseStory(parseJson(await callModel(makeStoryRepairPrompt(ctx,planner,story,repairFindings),6500)),child,age);
        if(repaired){
          const recheck=await validateStory(planner,repaired);
          if(recheck.semantic&&recheck.semantic.outcome==='PASS'&&recheck.deterministic.length===0) return repaired;
          result=recheck;
          story=repaired;
        }
      }

      if(result.semantic&&result.semantic.outcome==='REJECT'&&result.semantic.return_to==='WRITER'){
        const regenerated=await writeOnce(planner,`The previous prose failed final validation. Rewrite from the SAME approved plan and correct these failures without changing the plan: ${JSON.stringify(result.semantic)}`);
        if(regenerated){
          const recheck=await validateStory(planner,regenerated);
          if(recheck.semantic&&recheck.semantic.outcome==='PASS'&&recheck.deterministic.length===0) return regenerated;
        }
      }
      return null;
    }

    let approved=await getApprovedPlan();
    if(!approved){
      await refundOuterReservation();
      return res.status(502).json({error:'Moonbeam could not produce a story plan that passed its quality checks. Please try again.'});
    }

    let story=await writeApprovedStory(approved.planner);

    // If the finished story exposed a deeper planning failure, allow one fresh plan-and-write cycle.
    if(!story){
      const replanned=await getApprovedPlan('Create a fresh, stronger plan. The previous planned/written story failed final quality control; prioritise causal coherence, distinctiveness, meaningful personalisation and an earned ending.');
      if(replanned) {
        const replannedStory=await writeApprovedStory(replanned.planner);
        if(replannedStory){ approved=replanned; story=replannedStory; }
      }
    }

    if(!story){
      await refundOuterReservation();
      return res.status(502).json({error:'Moonbeam could not finish a story that passed its quality checks. Your story credit has been returned; please try again.'});
    }

    const counts=[story.opening,...story.pages.map(p=>p.text),story.closing].map(wordCount);
    const generationRunId=await createGenerationRun(moonbeamUser.id);
    await logUsage({
      event_type:'story',
      estimated_cost_gbp:estimateGBP('story'),
      metadata:{
        model:'gpt-5.6-luna',
        user_id:moonbeamUser.id,
        generation_run_id:generationRunId,
        story_engine:'v198-planner-validator',
        model_calls:modelCalls,
        writing_mode:writingMode,
        primary_architecture:approved.planner.plan.primary_architecture
      }
    });
    creditReserved=false;

    return res.status(200).json({
      creditsRemaining,
      generationRunId,
      story,
      image:null,
      layout:{
        requestedLength:'standard',
        storyPages:4,
        displayedTextPages:6,
        pageWordCounts:counts,
        automaticallyReflowed:false,
        storyEngine:'v198-planner-validator',
        writingMode
      }
    });
  } catch(e){
    console.error('generate error',e);
    await refundOuterReservation();
    if(e&&e.openaiStatus) return res.status(502).json({error:e.message,openai_status:e.openaiStatus});
    return res.status(500).json({error:String(e&&e.message?e.message:e)});
  }
};
