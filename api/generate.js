const {logUsage,estimateGBP,getUsageBaselineUTC,SUPABASE_URL,SECRET_KEY,adminHeaders}=require('../_usage');
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
        const usageBaselineUTC=await getUsageBaselineUTC();
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

    if (String(body.action || '').trim() === 'rewrite-illustration-commission') {
      const user=await verifyMoonbeamUser(req);
      const plan=body.plan||{},sceneIndex=Math.max(0,Number(body.sceneIndex)||0),accepted=Array.isArray(body.acceptedImages)?body.acceptedImages.slice(0,10):[],candidate=String(body.candidateImage||''),diagnosis=String(body.diagnosis||'').slice(0,7000),checklist=Array.isArray(body.checklist)?body.checklist.slice(0,24):[];
      if(!/^data:image\/(?:jpeg|png|webp);base64,/i.test(candidate))return res.status(400).json({error:'Rejected candidate illustration is required.'});
      const scene=Array.isArray(plan.scenes)?(plan.scenes[sceneIndex]||{}):{};
      const content=[{type:'input_text',text:`You are Astra acting as the corrective art director, not as a critic. A Sunburst illustration has FAILED Moonbeam's forensic gate. Your job is to REWRITE THE COMPLETE PAINTING COMMISSION for one corrective repaint. Do not merely repeat the diagnosis or say "fix X". Resolve the failure into explicit drawable instructions while preserving everything that was already correct.

LOCKED STORY EVENT: ${String(scene.event||'').slice(0,5000)}
ORIGINAL VISUAL MOMENT: ${String(scene.visual_moment||'').slice(0,5000)}
CONTINUITY NOTE: ${String(scene.continuity||'').slice(0,3000)}
FORENSIC FAILURE: ${diagnosis}
FORENSIC CHECKLIST: ${JSON.stringify(checklist).slice(0,10000)}

Write a self-contained replacement commission. Explicitly account for the physical arrangement that caused the failure: for anatomy, state where every relevant limb/body part is and how it connects or is legitimately occluded; for paired objects, specify matching construction/proportions; for recurring architecture/objects/wardrobe/geography, tell the painter to reproduce the actual established appearance from the relevant accepted reference rather than reinterpret it. Preserve the locked narrative event, camera/composition and all successful aspects of the rejected candidate unless changing one is necessary to repair the defect. Never solve continuity by hiding an established feature merely to avoid drawing it. Do not add new story events.

Choose up to four accepted reference images that most directly establish the facts needed for the correction. reference_indexes are 1-based. The REJECTED CANDIDATE will also be supplied to Sunburst, but it is not canon and its defects must not be copied.`}];
      accepted.forEach((img,i)=>{if(/^data:image\/(?:jpeg|png|webp);base64,/i.test(img)){content.push({type:'input_text',text:`ACCEPTED CANON ${i+1}`});content.push({type:'input_image',image_url:img,detail:'high'})}});
      content.push({type:'input_text',text:'REJECTED CANDIDATE — use only to preserve explicitly correct composition/details; repair every diagnosed defect.'});content.push({type:'input_image',image_url:candidate,detail:'high'});
      const schema={type:'object',additionalProperties:false,required:['commission','reference_indexes'],properties:{commission:{type:'string'},reference_indexes:{type:'array',maxItems:4,items:{type:'integer',minimum:1,maximum:10}}}};
      const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:[{role:'user',content}],max_output_tokens:2200,text:{format:{type:'json_schema',name:'moonbeam_corrective_art_direction',strict:true,schema}}})});
      const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}if(!rr.ok){const e=data?.error;return res.status(502).json({error:typeof e==='string'?e:(e?.message||`Corrective art direction returned HTTP ${rr.status}`)})}
      let out=typeof data.output_text==='string'?data.output_text:'';if(!out&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')out+=part.text;
      let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned invalid corrective art direction.'})}
      await logUsage({event_type:'visual_correction_direction',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:user.id,generation_run_id:String(body.generationRunId||''),scene_index:sceneIndex}});
      return res.status(200).json({commission:String(parsed.commission||'').slice(0,12000),reference_indexes:Array.isArray(parsed.reference_indexes)?parsed.reference_indexes.slice(0,4):[]});
    }

    if (String(body.action || '').trim() === 'visual-continuity-review') {
      const user=await verifyMoonbeamUser(req);
      const plan=body.plan||{},sceneIndex=Math.max(0,Number(body.sceneIndex)||0),accepted=Array.isArray(body.acceptedImages)?body.acceptedImages.slice(0,10):[],candidate=String(body.candidateImage||''),reviewMode=String(body.reviewMode||'continuity').trim();
      if(!/^data:image\/(?:jpeg|png|webp);base64,/i.test(candidate))return res.status(400).json({error:'Candidate illustration is required.'});
      const scene=Array.isArray(plan.scenes)?(plan.scenes[sceneIndex]||{}):{};
      const physical=reviewMode==='physical';
      const task=physical?`FORENSIC PASS A — INTERNAL PHYSICAL INTEGRITY ONLY.
Inspect the candidate systematically, not impressionistically. Account for every visible or expected body part of every person/animal: head, torso, left/right arms, left/right hands where visible, left/right legs, left/right feet; trace each limb back to a plausible joint/body connection and distinguish genuine occlusion from a missing/disconnected limb. Check fingers/hands when conspicuous, impossible intersections, duplicated anatomy, malformed joints, impossible seating/standing poses and body/object penetrations. Then inventory paired or repeated objects inside THIS image (boots, shoes, gloves, wheels, chair legs, doors, etc.) and verify that matching pairs have compatible size, construction and proportions unless the scene explicitly explains a difference. Check object construction and basic physical geometry. Do not pass because the overall image looks attractive. A single conspicuous defect means FAIL.`:`FORENSIC PASS B — CROSS-IMAGE CONTINUITY ONLY.
Compare the candidate feature-by-feature against the earlier accepted visual canon. First inventory every candidate element that appeared before: each character, garment, shoe/boot, animal, prop, furniture item, doorway/window, wall, room, building, vehicle, landscape structure and fixed geographic feature. For EACH repeated element compare shape, dimensions/proportions, count, construction, markings, trim, wear/damage and distinctive fine details. For masonry, compare individual visible blocks/stones, courses, mortar joints, coping stones and openings wherever the same surface is visible. For environments compare topology explicitly: number of walls, wall junctions, bridge geometry, road/path connections, river position/direction, doors/windows and fixed landmarks. Camera angle, pose, lighting and legitimate occlusion may change; established physical facts may not. The earliest clear accepted depiction is authoritative if references conflict. Do not merely judge whether the pictures have the same style or 'feel like' the same place. A conspicuous unexplained redesign means FAIL.`;
      const content=[{type:'input_text',text:`You are Moonbeam's forensic illustration inspector. This is a mandatory gate before a children's-book image can become canon. ${task}

CURRENT SCENE ${sceneIndex+1}: ${String(scene.visual_moment||scene.event||'').slice(0,5000)}
CONTINUITY NOTE: ${String(scene.continuity||'').slice(0,3000)}

You MUST complete the checklist explicitly. status is PASS, FAIL, NOT_VISIBLE or NOT_APPLICABLE. overall_pass may be true only when no material FAIL exists. findings must name concrete defects, not vague concerns. reference_indexes are 1-based indexes of up to four earlier accepted images that best prove a continuity defect; use [] for the physical pass or when no earlier proof is needed.`}];
      if(!physical)accepted.forEach((img,i)=>{if(/^data:image\/(?:jpeg|png|webp);base64,/i.test(img)){content.push({type:'input_text',text:`EARLIER ACCEPTED ILLUSTRATION ${i+1} — authoritative visual canon. Inspect fine details, not just overall style.`});content.push({type:'input_image',image_url:img,detail:'high'})}});
      content.push({type:'input_text',text:'CANDIDATE ILLUSTRATION — inspect forensicly; it is NOT canon unless this pass succeeds.'});content.push({type:'input_image',image_url:candidate,detail:'high'});
      const item={type:'object',additionalProperties:false,required:['check','status','finding'],properties:{check:{type:'string'},status:{type:'string',enum:['PASS','FAIL','NOT_VISIBLE','NOT_APPLICABLE']},finding:{type:'string'}}};
      const schema={type:'object',additionalProperties:false,required:['overall_pass','checklist','findings','reference_indexes'],properties:{overall_pass:{type:'boolean'},checklist:{type:'array',minItems:physical?8:6,maxItems:24,items:item},findings:{type:'array',maxItems:12,items:{type:'string'}},reference_indexes:{type:'array',maxItems:4,items:{type:'integer',minimum:1,maximum:10}}}};
      const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:[{role:'user',content}],max_output_tokens:1800,text:{format:{type:'json_schema',name:`moonbeam_visual_${physical?'physical':'continuity'}_review`,strict:true,schema}}})});
      const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}if(!rr.ok){const e=data?.error;return res.status(502).json({error:typeof e==='string'?e:(e?.message||`Visual review returned HTTP ${rr.status}`)})}
      let out=typeof data.output_text==='string'?data.output_text:'';if(!out&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')out+=part.text;
      let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned an invalid forensic visual review.'})}
      const failed=(Array.isArray(parsed.checklist)?parsed.checklist:[]).filter(x=>x?.status==='FAIL');const pass=parsed.overall_pass===true&&failed.length===0;
      const findings=[...(Array.isArray(parsed.findings)?parsed.findings:[]),...failed.map(x=>`${x.check}: ${x.finding}`)].filter(Boolean).slice(0,12);
      await logUsage({event_type:'visual_continuity_review',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:user.id,generation_run_id:String(body.generationRunId||''),scene_index:sceneIndex,review_mode:physical?'physical':'continuity',pass}});
      return res.status(200).json({pass,diagnosis:findings.join(' | '),checklist:Array.isArray(parsed.checklist)?parsed.checklist:[],reference_indexes:physical?[]:(Array.isArray(parsed.reference_indexes)?parsed.reference_indexes.slice(0,4):[])});
    }

    // V252.29 — Fiction Studio (“Back Room”). This branch is intentionally isolated
    // from Moonbeam story generation. It has its own developer gate, persistence and Astra prompt.
    if (String(body.action || '').trim() === 'developer-fiction-studio') {
      const user=await verifyMoonbeamUser(req);
      const developerEmail=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();
      if(!developerEmail||String(user.email||'').trim().toLowerCase()!==developerEmail)return res.status(403).json({error:'Developer access only.'});
      if(!SECRET_KEY)return res.status(500).json({error:'Fiction Studio storage is unavailable.'});
      const mode=String(body.mode||'').trim();
      const rest=async(path,options={})=>{const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...options,headers:adminHeaders({'Content-Type':'application/json',...(options.headers||{})})});const raw=await r.text();let data=null;try{data=raw?JSON.parse(raw):null}catch{}if(!r.ok)throw Object.assign(new Error(data?.message||data?.error||`Fiction Studio storage returned HTTP ${r.status}`),{status:r.status});return data};
      if(mode==='list'){
        const rows=await rest(`developer_fiction_series?select=*&parent_id=eq.${encodeURIComponent(user.id)}&order=updated_at.desc`);
        return res.status(200).json({series:Array.isArray(rows)?rows:[]});
      }
      if(mode==='create'){
        const penName=String(body.pen_name||'').trim(),seriesName=String(body.series_name||'').trim(),genre=String(body.genre||'').trim(),idea=String(body.idea||'').trim(),heatLevel=String(body.heat_level||'').trim(),targetLength=Math.max(30000,Math.min(150000,Number(body.target_length)||80000));
        if(!penName||!seriesName||!genre)return res.status(400).json({error:'Pen name, series name and genre are required.'});
        const rows=await rest('developer_fiction_series',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({parent_id:user.id,pen_name:penName,series_name:seriesName,genre,idea,heat_level:heatLevel||'Astra to recommend',target_length:targetLength,status:'development'})});
        return res.status(200).json({series:rows?.[0]||null});
      }
      const id=String(body.id||'').trim();if(!id)return res.status(400).json({error:'Fiction series id is required.'});
      const found=await rest(`developer_fiction_series?select=*&id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`),series=found?.[0];
      if(!series)return res.status(404).json({error:'Fiction series not found.'});
      if(mode==='save-bible'){
        const bible=body.series_bible&&typeof body.series_bible==='object'?body.series_bible:null;if(!bible)return res.status(400).json({error:'A structured Series Bible is required.'});
        const rows=await rest(`developer_fiction_series?id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({series_bible:bible,status:'bible_approved',updated_at:new Date().toISOString()})});
        return res.status(200).json({series:rows?.[0]||null});
      }
      // V252.31 — full-length Book Development remains inside the isolated Back Room branch.
      if(mode==='list-books'){
        const rows=await rest(`developer_fiction_books?select=*&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&order=position.asc`);
        return res.status(200).json({books:Array.isArray(rows)?rows:[]});
      }
      // V252.33 — persistent Fiction Studio library management and resumable jobs.
      if(mode==='update-series'){
        const patch={updated_at:new Date().toISOString()};
        if(body.series_name!==undefined){const v=String(body.series_name||'').trim();if(!v)return res.status(400).json({error:'Series name cannot be empty.'});patch.series_name=v}
        if(body.pen_name!==undefined){const v=String(body.pen_name||'').trim();if(!v)return res.status(400).json({error:'Pen name cannot be empty.'});patch.pen_name=v}
        if(body.genre!==undefined){const v=String(body.genre||'').trim();if(!v)return res.status(400).json({error:'Genre cannot be empty.'});patch.genre=v}
        if(body.heat_level!==undefined)patch.heat_level=String(body.heat_level||'').trim();
        if(body.target_length!==undefined)patch.target_length=Math.max(30000,Math.min(150000,Number(body.target_length)||80000));
        const rows=await rest(`developer_fiction_series?id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(patch)});
        return res.status(200).json({series:rows?.[0]||null});
      }
      if(mode==='delete-series'){
        await rest(`developer_fiction_series?id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'DELETE'});
        return res.status(200).json({ok:true});
      }
      if(mode==='update-book'||mode==='delete-book'){
        const bookId=String(body.book_id||'').trim();if(!bookId)return res.status(400).json({error:'Book id is required.'});
        const books=await rest(`developer_fiction_books?select=*&id=eq.${encodeURIComponent(bookId)}&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`);if(!books?.[0])return res.status(404).json({error:'Fiction book not found.'});
        if(mode==='delete-book'){await rest(`developer_fiction_books?id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'DELETE'});return res.status(200).json({ok:true})}
        const title=String(body.working_title||'').trim();if(!title)return res.status(400).json({error:'Novel title cannot be empty.'});
        const rows=await rest(`developer_fiction_books?id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({working_title:title,updated_at:new Date().toISOString()})});
        return res.status(200).json({book:rows?.[0]||null});
      }
      if(mode==='start-book-development'||mode==='continue-book-development'){
        const proposed=Array.isArray(series.series_bible?.proposed_books)?series.series_bible.proposed_books:[];
        const sourceIndex=Math.max(0,Number(body.source_index)||0),source=proposed[sourceIndex]||{};
        let book=null;
        if(body.book_id){const br=await rest(`developer_fiction_books?select=*&id=eq.${encodeURIComponent(String(body.book_id))}&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`);book=br?.[0]||null}
        if(!book){
          // V252.34: adopt an existing book at this immutable series position before inserting.
          // This makes Start Book Development idempotent across upgrades, retries and lost responses.
          const position=sourceIndex+1;
          const existing=await rest(`developer_fiction_books?select=*&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&position=eq.${position}&limit=1`);
          book=existing?.[0]||null;
          if(book){
            const priorState=(book.development_state&&typeof book.development_state==='object')?book.development_state:{};
            const hasArchitecture=book.book_plan&&typeof book.book_plan==='object'&&Object.keys(book.book_plan).length>0;
            const hasChapters=Array.isArray(book.book_plan?.chapters)&&book.book_plan.chapters.length>0;
            const chapterCount=Math.max(0,Number(book.book_plan?.chapter_count)||0);
            // Repair legacy malformed batches deterministically: retain the first valid occurrence
            // of each numbered chapter, discard duplicates/out-of-range planning commentary.
            let repairedPlan=book.book_plan||{};
            if(hasChapters&&chapterCount){
              const seen=new Set(),clean=[];
              for(const c of book.book_plan.chapters){
                const n=Number(c?.number);
                if(Number.isInteger(n)&&n>=1&&n<=chapterCount&&!seen.has(n)){seen.add(n);clean.push({...c,number:n})}
              }
              clean.sort((a,b)=>a.number-b.number);repairedPlan={...book.book_plan,chapters:clean};
            }
            const validNumbers=new Set((repairedPlan.chapters||[]).map(c=>Number(c.number)));
            const complete=chapterCount>0&&validNumbers.size===chapterCount&&Array.from({length:chapterCount},(_,i)=>i+1).every(n=>validNumbers.has(n));
            let firstMissing=1;while(firstMissing<=chapterCount&&validNumbers.has(firstMissing))firstMissing++;
            const inferredPhase=complete?'complete':hasArchitecture?'chapters':'architecture';
            const adoptedState={phase:complete?'complete':(priorState.phase==='architecture'?'architecture':inferredPhase),next_batch_start:complete?chapterCount+1:firstMissing,direction:String(priorState.direction||body.message||'')};
            const rows=await rest(`developer_fiction_books?id=eq.${encodeURIComponent(book.id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({book_plan:repairedPlan,development_state:adoptedState,status:complete?'planned':book.status,updated_at:new Date().toISOString()})});
            book=rows?.[0]||{...book,development_state:adoptedState};
          }else{
            const workingTitle=String(body.working_title||source.working_title||`Book ${position}`).trim(),premise=String(body.premise||source.premise||'').trim();if(!premise)return res.status(400).json({error:'A proposed book premise is required.'});
            const rows=await rest('developer_fiction_books',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({parent_id:user.id,series_id:id,position,working_title:workingTitle,premise,book_plan:{},status:'planning',development_state:{phase:'architecture',next_batch_start:1,direction:String(body.message||'')}})});book=rows?.[0]
          }
        }
        const state=book.development_state||{},phase=state.phase||'architecture',direction=String(state.direction||body.message||'');
        if(phase==='complete')return res.status(200).json({book,complete:true});
        if(phase==='architecture'){
          const prompt=`You are Astra, principal novelist and book editor in a private adult commercial-fiction studio. Build the NOVEL-LEVEL ARCHITECTURE only; do not write chapter plans or manuscript. Current database values are authoritative.\nPEN NAME: ${series.pen_name}\nSERIES: ${series.series_name}\nGENRE: ${series.genre}\nHEAT: ${series.heat_level}\nSERIES BIBLE: ${JSON.stringify(series.series_bible||{})}\nNOVEL TITLE: ${book.working_title}\nPREMISE: ${book.premise}\nTARGET WORDS: ${series.target_length||80000}\nDEVELOPER DIRECTION: ${direction||'Develop the strongest publishable architecture.'}\nReturn rigorous full-length architecture including positioning, core promise, POV strategy, character arcs, relationship arc, external plot, heat progression, major turning points, continuity watchlist, ending, and the ideal chapter_count from 20–50. All romantic/sexual characters are adults.`;
          const schema={type:'object',additionalProperties:false,required:['positioning','core_promise','pov_strategy','character_arcs','relationship_arc','external_plot','heat_progression','major_turning_points','continuity_watchlist','ending','chapter_count'],properties:{positioning:{type:'string'},core_promise:{type:'string'},pov_strategy:{type:'string'},character_arcs:{type:'string'},relationship_arc:{type:'string'},external_plot:{type:'string'},heat_progression:{type:'string'},major_turning_points:{type:'string'},continuity_watchlist:{type:'string'},ending:{type:'string'},chapter_count:{type:'integer',minimum:20,maximum:50}}};
          const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,max_output_tokens:5000,text:{format:{type:'json_schema',name:'fiction_book_architecture',strict:true,schema}}})});const raw=await rr.text();let d={};try{d=JSON.parse(raw)}catch{}if(!rr.ok)return res.status(502).json({error:d?.error?.message||`Astra returned HTTP ${rr.status}`});let out=d.output_text||'';if(!out&&Array.isArray(d.output))for(const it of d.output)for(const p of(it.content||[]))if(typeof p.text==='string')out+=p.text;let arch;try{arch=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned invalid novel architecture.'})}
          const plan={title:book.working_title,target_words:series.target_length||80000,...arch,chapters:[]};const rows=await rest(`developer_fiction_books?id=eq.${encodeURIComponent(book.id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({book_plan:plan,status:'planning',development_state:{...state,phase:'chapters',next_batch_start:1,direction},updated_at:new Date().toISOString()})});return res.status(200).json({book:rows?.[0],complete:false,progress:`Novel architecture saved. Building chapter plan…`});
        }
        const plan=book.book_plan||{},count=Math.max(20,Math.min(50,Number(plan.chapter_count)||30)),start=Math.max(1,Number(state.next_batch_start)||1),end=Math.min(count,start+7);
        const prompt=`You are Astra building the chapter architecture for an adult commercial novel. Current database values are authoritative.\nSERIES: ${series.series_name}\nSERIES BIBLE: ${JSON.stringify(series.series_bible||{})}\nNOVEL: ${book.working_title}\nNOVEL ARCHITECTURE: ${JSON.stringify({...plan,chapters:undefined})}\nEXISTING CHAPTER PLAN: ${JSON.stringify(plan.chapters||[])}\nNow plan chapters ${start} through ${end} of ${count}. Preserve causality and pacing across the whole novel. Each chapter must materially change situation, relationship, knowledge, stakes or decision. Do not draft manuscript.`;
        const chapter={type:'object',additionalProperties:false,required:['number','title','pov','purpose','events','relationship_shift','continuity'],properties:{number:{type:'integer'},title:{type:'string'},pov:{type:'string'},purpose:{type:'string'},events:{type:'string'},relationship_shift:{type:'string'},continuity:{type:'string'}}};const schema={type:'object',additionalProperties:false,required:['chapters'],properties:{chapters:{type:'array',minItems:1,maxItems:8,items:chapter}}};
        const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,max_output_tokens:5000,text:{format:{type:'json_schema',name:'fiction_chapter_plan_batch',strict:true,schema}}})});const raw=await rr.text();let d={};try{d=JSON.parse(raw)}catch{}if(!rr.ok)return res.status(502).json({error:d?.error?.message||`Astra returned HTTP ${rr.status}`});let out=d.output_text||'';if(!out&&Array.isArray(d.output))for(const it of d.output)for(const p of(it.content||[]))if(typeof p.text==='string')out+=p.text;let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned invalid chapter-plan batch.'})}
        // V252.35: never trust batch numbering blindly. Accept exactly one chapter for every
        // requested number and nothing outside the requested range. Invalid Astra output is
        // rejected without advancing the persisted checkpoint, so Resume safely retries it.
        const batch=Array.isArray(parsed.chapters)?parsed.chapters:[];
        const byNumber=new Map();
        for(const c of batch){
          const n=Number(c?.number);
          if(Number.isInteger(n)&&n>=start&&n<=end&&!byNumber.has(n))byNumber.set(n,{...c,number:n});
        }
        const missing=[];for(let n=start;n<=end;n++)if(!byNumber.has(n))missing.push(n);
        if(missing.length)return res.status(502).json({error:`Astra returned an invalid chapter-plan batch. Expected chapters ${start}–${end}; missing ${missing.join(', ')}. Nothing from this batch was saved. Resume Book Development to retry.`});
        const accepted=[];for(let n=start;n<=end;n++)accepted.push(byNumber.get(n));
        const before=(plan.chapters||[]).filter(c=>Number(c.number)<start);
        const after=(plan.chapters||[]).filter(c=>Number(c.number)>end&&Number(c.number)<=count);
        const merged=[...before,...accepted,...after].sort((a,b)=>Number(a.number)-Number(b.number));
        const unique=new Set(merged.map(c=>Number(c.number)));
        const done=end>=count&&unique.size===count&&Array.from({length:count},(_,i)=>i+1).every(n=>unique.has(n));
        const nextState={...state,phase:done?'complete':'chapters',next_batch_start:end+1,direction};
        const rows=await rest(`developer_fiction_books?id=eq.${encodeURIComponent(book.id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({book_plan:{...plan,chapters:merged},status:done?'planned':'planning',development_state:nextState,updated_at:new Date().toISOString()})});
        return res.status(200).json({book:rows?.[0],complete:done,progress:done?`Book Plan complete (${count} validated chapters).`:`Chapters ${start}–${end} validated and saved.`});
      }
      if(mode==='develop-book'){
        const proposed=Array.isArray(series.series_bible?.proposed_books)?series.series_bible.proposed_books:[];
        const sourceIndex=Math.max(0,Number(body.source_index)||0),source=proposed[sourceIndex]||{};
        const workingTitle=String(body.working_title||source.working_title||`Book ${sourceIndex+1}`).trim();
        const premise=String(body.premise||source.premise||'').trim();
        if(!workingTitle||!premise)return res.status(400).json({error:'A proposed book title and premise are required.'});
        const developerDirection=String(body.message||'').trim();
        const prompt=`You are Astra, principal novelist and book editor in a private adult commercial-fiction studio. This is BOOK DEVELOPMENT for a full-length novel, not children's fiction and not manuscript drafting. The authoritative Series Bible is supplied below. Plan one complete novel at approximately ${series.target_length||80000} words.\n\nPEN NAME: ${series.pen_name}\nSERIES: ${series.series_name}\nGENRE / SUBGENRE: ${series.genre}\nHEAT LEVEL: ${series.heat_level||'Astra to recommend'}\nAUTHORITATIVE SERIES BIBLE: ${JSON.stringify(series.series_bible||{})}\nBOOK TO DEVELOP: ${workingTitle}\nBOOK PREMISE: ${premise}\nDEVELOPER DIRECTION: ${developerDirection||'Develop the strongest publishable version consistent with the Series Bible.'}\n\nBuild a rigorous novel blueprint with a genuine full-length narrative arc, not a stretched short story. Define the emotional and external plot, POV strategy, relationship progression, major turning points, escalation, climax and resolution. Then produce a chapter-by-chapter plan detailed enough to guide later manuscript generation while still leaving room for scene-level invention. Each chapter must materially change the situation, relationship, knowledge, stakes or decision. Track continuity and setup/payoff. Avoid repetitive negotiation, circular conflict, filler, implausibly prolonged misunderstandings and generic beat-sheet language. All romantic/sexual characters are adults. Respect the stated heat level, but this planning response should describe intimate beats rather than draft explicit scenes. Do not produce illustrations, art direction, page layouts, children's-story structures or finished prose chapters.`;
        const chapter={type:'object',additionalProperties:false,required:['number','title','pov','purpose','events','relationship_shift','continuity'],properties:{number:{type:'integer'},title:{type:'string'},pov:{type:'string'},purpose:{type:'string'},events:{type:'string'},relationship_shift:{type:'string'},continuity:{type:'string'}}};
        const planSchema={type:'object',additionalProperties:false,required:['title','target_words','positioning','core_promise','pov_strategy','character_arcs','relationship_arc','external_plot','heat_progression','major_turning_points','continuity_watchlist','ending','chapters'],properties:{title:{type:'string'},target_words:{type:'integer'},positioning:{type:'string'},core_promise:{type:'string'},pov_strategy:{type:'string'},character_arcs:{type:'string'},relationship_arc:{type:'string'},external_plot:{type:'string'},heat_progression:{type:'string'},major_turning_points:{type:'string'},continuity_watchlist:{type:'string'},ending:{type:'string'},chapters:{type:'array',minItems:20,maxItems:50,items:chapter}}};
        const schema={type:'object',additionalProperties:false,required:['reply','book_plan'],properties:{reply:{type:'string'},book_plan:planSchema}};
        const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,max_output_tokens:12000,text:{format:{type:'json_schema',name:'fiction_studio_book_development',strict:true,schema}}})});
        const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}if(!rr.ok){const e=data?.error;return res.status(502).json({error:typeof e==='string'?e:(e?.message||`Astra returned HTTP ${rr.status}`)})}let out=typeof data.output_text==='string'?data.output_text:'';if(!out&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')out+=part.text;let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned an invalid Book Development response.'})}
        const existing=await rest(`developer_fiction_books?select=id&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&position=eq.${sourceIndex+1}&limit=1`);
        let rows;if(existing?.[0]?.id)rows=await rest(`developer_fiction_books?id=eq.${encodeURIComponent(existing[0].id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({working_title:parsed.book_plan.title||workingTitle,premise,book_plan:parsed.book_plan,status:'planned',updated_at:new Date().toISOString()})});
        else rows=await rest('developer_fiction_books',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({parent_id:user.id,series_id:id,position:sourceIndex+1,working_title:parsed.book_plan.title||workingTitle,premise,book_plan:parsed.book_plan,status:'planned'})});
        await logUsage({event_type:'developer_fiction_book_planning',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:user.id,series_id:id,position:sourceIndex+1}});
        return res.status(200).json({reply:parsed.reply,book_plan:parsed.book_plan,book:rows?.[0]||null});
      }
      if(mode==='save-book-plan'){
        const bookId=String(body.book_id||'').trim(),plan=body.book_plan&&typeof body.book_plan==='object'?body.book_plan:null;if(!bookId||!plan)return res.status(400).json({error:'Book id and structured Book Plan are required.'});
        const rows=await rest(`developer_fiction_books?id=eq.${encodeURIComponent(bookId)}&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({book_plan:plan,status:'plan_approved',updated_at:new Date().toISOString()})});
        if(!rows?.[0])return res.status(404).json({error:'Fiction book not found.'});
        return res.status(200).json({book:rows[0]});
      }
      // V252.32 — sequential manuscript drafting with authoritative live continuity.
      if(mode==='list-chapters'){
        const bookId=String(body.book_id||'').trim();if(!bookId)return res.status(400).json({error:'Book id is required.'});
        const books=await rest(`developer_fiction_books?select=*&id=eq.${encodeURIComponent(bookId)}&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`),book=books?.[0];if(!book)return res.status(404).json({error:'Fiction book not found.'});
        const chapters=await rest(`developer_fiction_chapters?select=*&book_id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}&order=chapter_number.asc`);
        const ledgers=await rest(`developer_fiction_continuity?select=*&book_id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`);
        return res.status(200).json({chapters:Array.isArray(chapters)?chapters:[],continuity:ledgers?.[0]||{ledger:{},through_chapter:0},total_chapters:Array.isArray(book.book_plan?.chapters)?book.book_plan.chapters.length:0});
      }
      if(mode==='novel-status'||mode==='export-novel'){
        const bookId=String(body.book_id||'').trim();if(!bookId)return res.status(400).json({error:'Book id is required.'});
        const books=await rest(`developer_fiction_books?select=*&id=eq.${encodeURIComponent(bookId)}&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`),book=books?.[0];if(!book)return res.status(404).json({error:'Fiction book not found.'});
        const chapters=await rest(`developer_fiction_chapters?select=*&book_id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}&order=chapter_number.asc`);
        const ledgers=await rest(`developer_fiction_continuity?select=*&book_id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`);
        return res.status(200).json({series,book,chapters:Array.isArray(chapters)?chapters:[],continuity:ledgers?.[0]||{ledger:{},through_chapter:0}});
      }
      if(mode==='generate-chapter'){
        const bookId=String(body.book_id||'').trim();if(!bookId)return res.status(400).json({error:'Book id is required.'});
        const books=await rest(`developer_fiction_books?select=*&id=eq.${encodeURIComponent(bookId)}&series_id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`),book=books?.[0];if(!book)return res.status(404).json({error:'Fiction book not found.'});
        const planChapters=Array.isArray(book.book_plan?.chapters)?book.book_plan.chapters:[];if(!planChapters.length)return res.status(400).json({error:'Save an approved Book Plan before drafting chapters.'});
        const existing=await rest(`developer_fiction_chapters?select=*&book_id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}&order=chapter_number.asc`);
        const nextNumber=(existing?.length||0)+1;if(nextNumber>planChapters.length)return res.status(400).json({error:'All planned chapters have already been generated.'});
        const target=planChapters[nextNumber-1],previous=(existing||[]).slice(-2);
        const ledgerRows=await rest(`developer_fiction_continuity?select=*&book_id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}&limit=1`),ledger=ledgerRows?.[0]?.ledger||{};
        const direction=String(body.direction||'').trim();
        const prompt=`You are Astra, the novelist drafting a full-length adult commercial novel inside a private developer-only Fiction Studio. Write ONE finished novel chapter in publishable prose. This is not children's fiction, not a picture book, and not an outline.\n\nAUTHOR/PEN NAME: ${series.pen_name}\nSERIES BIBLE: ${JSON.stringify(series.series_bible||{})}\nAUTHORITATIVE BOOK PLAN: ${JSON.stringify(book.book_plan||{})}\nLIVE CONTINUITY LEDGER (what has actually happened outranks the original plan): ${JSON.stringify(ledger)}\nRECENT CHAPTERS FOR VOICE AND IMMEDIATE CONTINUITY: ${JSON.stringify(previous.map(c=>({number:c.chapter_number,title:c.chapter_title,manuscript:c.manuscript})))}\nCHAPTER TO WRITE: ${JSON.stringify(target)}\nDEVELOPER DIRECTION: ${direction||'Follow the approved plan while writing the strongest chapter the novel needs.'}\n\nWrite immersive, specific commercial-fiction prose with distinct character voices, scene-level causality, subtext and forward movement. Do not summarize scenes that deserve dramatization. Do not explain the outline to the reader. Avoid repetitive recap and generic AI phrasing. Preserve established facts and character knowledge. The manuscript and live ledger outrank an older planned detail if they conflict. All romantic/sexual characters are adults. Follow the Series Bible's heat level and relationship boundaries. Return the complete chapter plus a structured continuity update containing ONLY facts newly established or materially changed by this chapter, unresolved threads, character-knowledge changes, relationship-state changes, chronology/location changes, and setups/payoffs. Do not create illustrations or art direction.`;
        const delta={type:'object',additionalProperties:false,required:['established_facts','unresolved_threads','character_knowledge','relationship_state','chronology_locations','setups_payoffs'],properties:{established_facts:{type:'array',items:{type:'string'}},unresolved_threads:{type:'array',items:{type:'string'}},character_knowledge:{type:'array',items:{type:'string'}},relationship_state:{type:'array',items:{type:'string'}},chronology_locations:{type:'array',items:{type:'string'}},setups_payoffs:{type:'array',items:{type:'string'}}}};
        const schema={type:'object',additionalProperties:false,required:['chapter_title','manuscript','continuity_delta'],properties:{chapter_title:{type:'string'},manuscript:{type:'string'},continuity_delta:delta}};
        const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,max_output_tokens:9000,text:{format:{type:'json_schema',name:'fiction_studio_chapter',strict:true,schema}}})});
        const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}if(!rr.ok){const e=data?.error;return res.status(502).json({error:typeof e==='string'?e:(e?.message||`Astra returned HTTP ${rr.status}`)})}let out=typeof data.output_text==='string'?data.output_text:'';if(!out&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')out+=part.text;let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned an invalid chapter response.'})}
        const rows=await rest('developer_fiction_chapters',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({parent_id:user.id,series_id:id,book_id:bookId,chapter_number:nextNumber,chapter_title:parsed.chapter_title||target.title||'',outline:JSON.stringify(target),manuscript:parsed.manuscript,continuity_delta:parsed.continuity_delta,status:'drafted'})});
        const nextLedger={...ledger};for(const key of ['established_facts','unresolved_threads','character_knowledge','relationship_state','chronology_locations','setups_payoffs'])nextLedger[key]=[...(Array.isArray(nextLedger[key])?nextLedger[key]:[]),...(Array.isArray(parsed.continuity_delta?.[key])?parsed.continuity_delta[key]:[])];
        if(ledgerRows?.[0])await rest(`developer_fiction_continuity?book_id=eq.${encodeURIComponent(bookId)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({ledger:nextLedger,through_chapter:nextNumber,updated_at:new Date().toISOString()})});
        else await rest('developer_fiction_continuity',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({book_id:bookId,parent_id:user.id,series_id:id,ledger:nextLedger,through_chapter:nextNumber})});
        await logUsage({event_type:'developer_fiction_chapter_generation',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:user.id,series_id:id,book_id:bookId,chapter_number:nextNumber}});
        return res.status(200).json({chapter:rows?.[0]||null,continuity:{ledger:nextLedger,through_chapter:nextNumber}});
      }
      if(mode==='develop'){
        const message=String(body.message||'').trim();
        const current=series.series_bible&&typeof series.series_bible==='object'?series.series_bible:{};
        const prompt=`You are Astra, principal novelist and series editor for a private commercial-fiction studio. You develop full-length adult fiction for publication. Your job here is SERIES DEVELOPMENT, not manuscript drafting. The developer makes the final decisions.\n\nPEN NAME: ${series.pen_name}\nSERIES: ${series.series_name}\nGENRE / SUBGENRE: ${series.genre}\nINITIAL IDEA: ${series.idea||'(open)'}\nTARGET NOVEL LENGTH: approximately ${series.target_length||80000} words per novel\nINTENDED HEAT LEVEL: ${series.heat_level||'Astra to recommend'}\nCURRENT SERIES BIBLE: ${JSON.stringify(current)}\nDEVELOPER INPUT: ${message||'Develop the strongest commercially coherent version of this series.'}\n\nDevelop this as full-length adult commercial fiction. Concentrate on character, conflict, emotional stakes, voice, pacing, reader expectations, series read-through and distinct book premises. Do not produce page-count structures, illustration directions, art prompts, picture-book layouts or finished chapters. Do not pad a weak concept merely to create a series. All romantic or sexual characters must be adults. Keep any intimacy appropriate to the stated heat level while prioritising character and story. Preserve good approved decisions unless the developer asks to change them. Return a concise conversational reply and a complete updated Series Bible. The Bible must be useful as authoritative continuity for later novel planning.`;
        const character={type:'object',additionalProperties:false,required:['name','role','description'],properties:{name:{type:'string'},role:{type:'string'},description:{type:'string'}}};
        const book={type:'object',additionalProperties:false,required:['working_title','premise'],properties:{working_title:{type:'string'},premise:{type:'string'}}};
        const bibleSchema={type:'object',additionalProperties:false,required:['premise','setting','tone','intended_readership','series_engine','recurring_world','characters','proposed_books'],properties:{premise:{type:'string'},setting:{type:'string'},tone:{type:'string'},intended_readership:{type:'string'},series_engine:{type:'string'},recurring_world:{type:'string'},characters:{type:'array',items:character},proposed_books:{type:'array',minItems:1,maxItems:10,items:book}}};
        const schema={type:'object',additionalProperties:false,required:['reply','series_bible'],properties:{reply:{type:'string'},series_bible:bibleSchema}};
        const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,max_output_tokens:6500,text:{format:{type:'json_schema',name:'fiction_studio_series_development',strict:true,schema}}})});
        const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}if(!rr.ok){const e=data?.error;return res.status(502).json({error:typeof e==='string'?e:(e?.message||`Astra returned HTTP ${rr.status}`)})}let out=typeof data.output_text==='string'?data.output_text:'';if(!out&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')out+=part.text;let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned an invalid Fiction Studio response.'})}
        const rows=await rest(`developer_fiction_series?id=eq.${encodeURIComponent(id)}&parent_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({series_bible:parsed.series_bible,status:'development',updated_at:new Date().toISOString()})});
        await logUsage({event_type:'developer_fiction_series_planning',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:user.id}});
        return res.status(200).json({reply:parsed.reply,series_bible:parsed.series_bible,series:rows?.[0]||series});
      }
      return res.status(400).json({error:'Unknown Fiction Studio mode.'});
    }

    if (String(body.action || '').trim() === 'developer-series-astra') {
      const user=await verifyMoonbeamUser(req);
      const developerEmail=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();
      if(!developerEmail||String(user.email||'').trim().toLowerCase()!==developerEmail)return res.status(403).json({error:'Developer access only.'});
      const mode=String(body.mode||'').trim(),series=body.series||{},lead=body.lead||{},supportingCast=Array.isArray(body.supportingCast)?body.supportingCast:[],current=body.current||{},message=String(body.message||'').trim(),target=Math.max(8,Math.min(16,Number(body.storyTarget)||12));
      const priorVolumes=Array.isArray(body.priorVolumes)?body.priorVolumes:[];
      const base=`You are Astra, creative director helping a publisher develop a children's book series. This is a planning conversation, not finished story writing. The developer makes the final decisions.\n\nSERIES: ${String(series.name||'')}\nLEAD CAST MEMBER: ${JSON.stringify(lead)}\nAVAILABLE SERIES-WORLD CAST: ${JSON.stringify(supportingCast)}\nCURRENT SERIES PLAN: ${JSON.stringify(series.series_plan||{})}\nCURRENT VOLUME PLAN: ${JSON.stringify(current)}\nPREVIOUS VOLUMES: ${JSON.stringify(priorVolumes)}\nDEVELOPER INPUT: ${message}\n\nHard constraints: age appropriate; supplied Cast facts are authoritative; never invent a surname; the AVAILABLE SERIES-WORLD CAST are optional characters who merely inhabit this series universe. Their presence in the Series Bible NEVER means they must appear in every story. Do not manufacture appearances just because they are listed. Normally use no more than ONE additional Series Cast character in any individual story unless the developer's premise genuinely requires otherwise. A supporting character may appear only briefly — even a single cameo — and does not need to appear on every page. The lead remains the central recurring character. Only characters actually present in a locked story event should later be commissioned into that event's illustration; avoid concepts/titles/branding that reproduce or are confusingly close to established children's characters, franchises or distinctive protected properties. Generic roles and public-domain material are not automatically forbidden. Do not impose a preferred genre, plot structure, moral, tone, obstacle, comedy style or ending. Do not turn audience observations into rigid story rules. Keep creative-series decisions separate from audience/publishing strategy so marketing considerations do not mechanically dictate every story.\n\nCOMMERCIAL PURPOSE: These books are intended for publication on Amazon primarily as a way to introduce parents to Moonbeam Stories and attract potential Moonbeam users. Use that purpose when it is relevant to series positioning, audience appeal, packaging and publishing strategy, but NEVER turn the fiction itself into advertising or force Moonbeam promotion into story content. The stories must work completely as stories in their own right.\n\nMOONBEAM BOOK ARCHITECTURE: A Series is the overall collection. A Volume is a publishing collection containing MULTIPLE separate standalone Moonbeam stories/books. For an automatically generated Volume, YOU decide the ideal published size from 8–16 stories according to the creative strength of the collection; then plan TWO additional equally strong editorial-candidate stories, so the generated candidate slate contains ideal size + 2 stories (10–18 total). Never make the two extras deliberately weaker or disposable. The developer may later delete any stories and may keep all candidates if they are strong. For EACH planned story independently, YOU choose 6, 7 or 8 story pages according to what best serves that story: use 6 for a compact idea, 7 when an additional beat materially improves it, and 8 when the premise genuinely needs more room. Never pad or compress merely to hit a uniform length. Developer-created loose stories use a separate 6–10-page control. Never use story/book and Volume interchangeably. All later publishing descriptions must treat the CURRENT surviving stories actually filed in the Volume as authoritative; never state a story count or mention a story merely because it appeared in an earlier plan if it has since been removed.`;
      let prompt='',schema,name='moonbeam_series_astra';
      if(mode==='develop-series'){
        prompt=base+`\n\nDiscuss and refine the overall series with the developer. Contribute useful creative and audience/publishing ideas where they genuinely improve the concept. Return a concise natural reply plus an updated series plan. The creative_brief is the authoritative creative identity inherited by future volumes. The audience_brief is separate guidance for positioning/packaging and must not become a formula for individual stories.`;
        schema={type:'object',additionalProperties:false,required:['reply','series_plan'],properties:{reply:{type:'string'},series_plan:{type:'object',additionalProperties:false,required:['creative_brief','audience_brief','intended_readership','volume_format'],properties:{creative_brief:{type:'string'},audience_brief:{type:'string'},intended_readership:{type:'string'},volume_format:{type:'string'}}}}};
      }else if(mode==='propose-world'){
        prompt=base+`\n\nThe Series identity, recurring lead and Series-world Cast are already established and MUST be inherited unchanged by this Volume. Do not invent a new incarnation, role or identity for the lead. Develop ONE clear creative direction for this Volume: the kinds of situations, emphasis, setting or connective flavour that can make this collection distinctive while remaining fully inside the approved Series Bible. If DEVELOPER INPUT supplies a theme or direction, respect it; otherwise exercise editorial judgement. This Volume direction is guidance for a collection of standalone books, not a requirement that every story use the same setting or gimmick. Be brief but concrete enough to guide story planning. When the developer supplies a revision or steering instruction, explicitly acknowledge what you understood and what you changed. Return a concise conversational reply plus a short title for the direction and the Volume creative brief. Do not change established character identities. Do not advance to story planning yet.`;
        schema={type:'object',additionalProperties:false,required:['reply','title','world'],properties:{reply:{type:'string'},title:{type:'string'},world:{type:'string'}}};
      }else if(mode==='plan-stories'){
        prompt=base+`

Decide the ideal published size for this Volume from 8–16 stories based on the strongest collection you can devise. Then plan TWO additional equally strong editorial candidates. Return ideal_story_count plus exactly ideal_story_count + 2 distinct story concepts (therefore 10–18 candidates total). Do not make the extra two weaker or disposable. Each concept needs a short title, a very brief summary of what happens, and story_page_count of 6, 7 or 8 chosen independently according to the needs of that story. Use 6 for a compact idea, 7 when another beat materially improves it, and 8 only when the premise genuinely needs the room. Do not write finished prose. Avoid near-duplicate mechanisms, situations or endings within the collection. Preserve the accepted Volume Bible.`;
        const item={type:'object',additionalProperties:false,required:['title','summary','story_page_count'],properties:{title:{type:'string'},summary:{type:'string'},story_page_count:{type:'integer',minimum:6,maximum:8}}};
        schema={type:'object',additionalProperties:false,required:['ideal_story_count','stories'],properties:{ideal_story_count:{type:'integer',minimum:8,maximum:16},stories:{type:'array',minItems:10,maxItems:18,items:item}}};
      }else if(mode==='volume-cover-direction'){
        prompt=base+`

The stories in this volume have now been completed. Design the overall VOLUME COVER artwork for the collection as a whole, not a cover for one individual story. Use the accepted Series Bible, Volume Bible and completed story slate in CURRENT VOLUME PLAN. The supplied finished-story visual references will separately establish the canonical appearance of the lead and world, so write a strong self-contained painting commission that represents the volume as a collection without making a collage of story scenes. Do not put any title, author name, lettering, logo, Moonbeam branding or other typography inside the generated artwork; Moonbeam renders volume-cover typography separately. Return only the painting commission.`;
        schema={type:'object',additionalProperties:false,required:['commission'],properties:{commission:{type:'string'}}};
      }else return res.status(400).json({error:'Unknown Astra series-planning mode.'});
      const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,max_output_tokens:mode==='plan-stories'?7000:3500,text:{format:{type:'json_schema',name,strict:true,schema}}})});
      const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}if(!rr.ok){const e=data?.error;return res.status(502).json({error:typeof e==='string'?e:(e?.message||`Astra returned HTTP ${rr.status}`)})}
      let out=typeof data.output_text==='string'?data.output_text:'';if(!out&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')out+=part.text;
      let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned an invalid series-planning response.'})}
      await logUsage({event_type:'developer_series_planning',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:user.id,mode}});
      return res.status(200).json(parsed);
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
    if (String(body.action || '').trim() === 'volume-publication-copy') {
      const user=await verifyMoonbeamUser(req);const developerEmail=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();if(!developerEmail||String(user.email||'').trim().toLowerCase()!==developerEmail)return res.status(403).json({error:'Developer access only.'});
      const series=String(body.series||'').trim(),volume=String(body.volume||'').trim(),author=String(body.author||'').trim(),stories=Array.isArray(body.stories)?body.stories:[];if(!series||!volume||!author||!stories.length)return res.status(400).json({error:'The current finished Volume is incomplete.'});
      const prompt=`You are Astra preparing Amazon/KDP metadata for a FINISHED children's story collection. The current story list below is authoritative and supersedes every earlier plan. Never mention deleted, rejected or merely planned stories.\n\nSERIES: ${series}\nVOLUME: ${volume}\nAUTHOR: ${author}\nCURRENT FINISHED STORIES (${stories.length}):\n${JSON.stringify(stories)}\n\nWrite specific sales copy for this exact finished collection. The description should be 120-180 words, enticing but not reveal endings. Use natural British English. Do not mention AI, generation, prompts or personalisation. Also supply exactly 7 useful KDP keyword phrases and a sensible reader age range. Return only the requested structured result.`;
      const schema={type:'object',additionalProperties:false,required:['description','keywords','age_range'],properties:{description:{type:'string'},keywords:{type:'array',minItems:7,maxItems:7,items:{type:'string'}},age_range:{type:'string'}}};
      const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:prompt,max_output_tokens:1200,text:{format:{type:'json_schema',name:'volume_publication_copy',strict:true,schema}}})});const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}if(!rr.ok){const e=data?.error;throw new Error(typeof e==='string'?e:(e?.message||`Astra returned HTTP ${rr.status}`))}let out=typeof data.output_text==='string'?data.output_text:'';if(!out&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')out+=part.text;let parsed;try{parsed=JSON.parse(out)}catch{throw new Error('Astra returned invalid Volume publication metadata.')}return res.status(200).json(parsed);
    }

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

    if (String(body.action || '').trim() === 'developer-story-workshop-chat') {
      const user=await verifyMoonbeamUser(req);const developerEmail=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();if(!developerEmail||String(user.email||'').trim().toLowerCase()!==developerEmail)return res.status(403).json({error:'Developer access only.'});
      const child=body.child||{},plan=body.plan||{},message=String(body.message||'').trim(),history=Array.isArray(body.history)?body.history.slice(-20):[];const pageCount=Math.max(6,Math.min(10,Number(child.storyPageCount)||6));if(!message||!Array.isArray(plan.scenes)||plan.scenes.length!==pageCount)return res.status(400).json({error:'The workshop needs a valid message and production plan.'});
      const cast=(Array.isArray(child.cast)?child.cast:[]).map(x=>({name:x.name,kind:x.kind,role:x.role,age:x.age||null,gender:x.gender||null,animal_type:x.animal_type||null,breed:x.breed||null}));
      const workshopPrompt=`You are Astra, the private story developer and art director inside the Moonbeam developer Story Workshop. You are speaking conversationally with Moonbeam's developer about ONE proposed children's book before production. This is not a general chatbot. Stay tightly focused on developing this book.\n\nORIGINAL STORY IDEA:\n${String(child.storyIdea||'').slice(0,4000)}\n\nCAST (authoritative; never invent surnames or contradict these facts):\n${JSON.stringify(cast)}\nYoungest hero age: ${Number(child.age)||9}. Required reading spreads: exactly ${pageCount}.\n\nCURRENT STRUCTURED PRODUCTION PLAN:\n${JSON.stringify(plan)}\n\nRECENT WORKSHOP CONVERSATION:\n${history.map(x=>`${x.role==='you'?'DEVELOPER':'ASTRA'}: ${String(x.text||'').slice(0,4000)}`).join('\n')}\n\nLATEST DEVELOPER MESSAGE:\n${message}\n\nRespond naturally and concisely to the developer. Treat their latest decisions as authoritative for this book. Revise the structured production plan whenever the conversation changes the story architecture, visual design, staging, ending, page allocation, recurring design, or other production decision. Preserve good existing decisions that were not changed. The plan must always retain exactly ${pageCount} coherent drawable scenes and a cover direction. Do not write the finished story prose yet.\n\nIf the developer asks to SEE, SHOW, PREVIEW or VISUALISE a creature, character, object, vehicle, location or other design, set preview_prompt to a complete standalone Sunburst painting commission for exactly that requested concept image. The preview is a design reference, not a book page, and should show the requested state clearly. Otherwise preview_prompt must be empty. Give preview_label a short useful label.\n\nIf the developer clearly says the most recently shown preview is approved, right, final, to keep, or should be used for the book, set approve_last_preview=true. Do not approve it merely because they discuss it. A later approved preview will be supplied to Sunburst as a production reference.\n\nHard constraints remain: age appropriate; no sexual content, graphic violence/gore, dangerous instructions, self-harm encouragement or adult horror; copyright/public-domain rules; supplied Cast identity/facts authoritative; no invented surnames. The developer may intentionally request a genuinely intimidating storybook monster for a nine-year-old: that is compatible with age appropriateness provided it does not become grotesque or adult horror.\n\nReturn the structured response only.`;
      const schema={type:'object',additionalProperties:false,required:['reply','plan','preview_prompt','preview_label','approve_last_preview'],properties:{reply:{type:'string'},plan:{type:'object',additionalProperties:false,required:['premise','story_arc','ending','character_bible','cover_direction','scenes'],properties:{premise:{type:'string'},story_arc:{type:'string'},ending:{type:'string'},character_bible:{type:'string'},cover_direction:{type:'string'},scenes:{type:'array',minItems:pageCount,maxItems:pageCount,items:{type:'object',additionalProperties:false,required:['scene','event','visual_moment','continuity'],properties:{scene:{type:'integer'},event:{type:'string'},visual_moment:{type:'string'},continuity:{type:'string'}}}}}},preview_prompt:{type:'string'},preview_label:{type:'string'},approve_last_preview:{type:'boolean'}}};
      const rr=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:workshopPrompt,max_output_tokens:12000,text:{format:{type:'json_schema',name:'moonbeam_developer_story_workshop',strict:true,schema}}})});const raw=await rr.text();let data={};try{data=JSON.parse(raw)}catch{}if(!rr.ok){const e=data?.error;return res.status(502).json({error:typeof e==='string'?e:(e?.message||`Astra returned HTTP ${rr.status}`)})}let out=typeof data.output_text==='string'?data.output_text:'';if(!out&&Array.isArray(data.output))for(const item of data.output)for(const part of(item.content||[]))if(typeof part.text==='string')out+=part.text;let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({error:'Astra returned an invalid workshop response.'})}if(!parsed?.plan||!Array.isArray(parsed.plan.scenes)||parsed.plan.scenes.length!==pageCount)return res.status(502).json({error:'Astra returned an incomplete workshop plan.'});await logUsage({event_type:'developer_story_workshop_chat',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:user.id}});return res.status(200).json(parsed);
    }

    if (String(body.action || '').trim() === 'developer-story-workshop-commit') {
      const user=await verifyMoonbeamUser(req);const developerEmail=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();if(!developerEmail||String(user.email||'').trim().toLowerCase()!==developerEmail)return res.status(403).json({error:'Developer access only.'});const child=body.child||{},plan=body.plan||{},pageCount=Math.max(6,Math.min(10,Number(child.storyPageCount)||6));if(!Array.isArray(plan.scenes)||plan.scenes.length!==pageCount||!plan.character_bible||!plan.cover_direction)return res.status(400).json({error:'The approved workshop plan is incomplete.'});let reservation;try{reservation=await reserveStoryCredit(user.id)}catch(e){return res.status(e.status||500).json({error:e.message,code:e.code||'CREDIT_ERROR'})}try{const generationRunId=await createGenerationRun(user.id);return res.status(200).json({creditsRemaining:reservation.remaining,generationRunId,storyCreditBatchId:reservation.batchId,plan})}catch(e){try{await refundReservedStoryCredit(user.id,reservation.batchId)}catch{}throw e}
    }

    // V251.85: after the first image-safety rejection, Astra redesigns the failed
    // illustration, every later illustration and the cover as one safety pass.
    if (String(body.action || '').trim() === 'safety-redesign-remaining') {
      const user=await verifyMoonbeamUser(req);const plan=body.plan||{},child=body.child||{},failedIndex=Math.max(0,Number(body.failedIndex)||0),diagnostic=body.diagnostic||{};
      const pageCount=Math.max(6,Math.min(10,Number(child.storyPageCount)||Number(plan.scenes?.length)||6));
      if(!Array.isArray(plan.scenes)||plan.scenes.length!==pageCount)return res.status(400).json({error:'The visual production plan is incomplete.'});
      const isCover=failedIndex>=pageCount;
      const prompt=`You are Astra performing an emergency SAFETY REDESIGN of the remaining artwork for a children's book after the image safety system rejected one commission. This is not a creative rewrite of the book. Preserve the story, Cast, identity, successful earlier artwork, established wardrobe/world continuity and narrative function.\n\nFAILED POSITION: ${isCover?'front cover':`illustration ${failedIndex+1} of ${pageCount}`}\nDIAGNOSTIC FROM THE FAILED IMAGE REQUEST:\n${JSON.stringify(diagnostic).slice(0,5000)}\n\nCURRENT COMPLETE PRODUCTION PLAN:\n${JSON.stringify(plan).slice(0,30000)}\n\nThe successful illustrations BEFORE the failed position are locked and must not be redesigned. Redesign the failed visual commission and EVERY visual commission after it, including the cover, to move the remaining book decisively into clearly benign, child-appropriate visual territory. Remove the underlying potentially sensitive visual idea throughout the remaining sequence rather than merely softening wording. If necessary choose a different moment, viewpoint, reaction, aftermath, environmental view or other unmistakably safe representation of the same narrative function. Avoid depicting children in danger, injury, falling, drowning, crushing, restraint, exposed bodies, threatening physical contact, weapons use, or other imagery likely to trigger image safety. Do not make the story bland: preserve its meaning and continuity, but reliable image-safety acceptance is now the overriding visual-production priority.\n\nDo not change finished earlier scenes. Do not change Cast facts or invent surnames. Return the complete production plan with exactly ${pageCount} scenes so downstream production can continue normally.`;
      const schema={type:'object',additionalProperties:false,required:['premise','story_arc','ending','character_bible','cover_direction','scenes'],properties:{premise:{type:'string'},story_arc:{type:'string'},ending:{type:'string'},character_bible:{type:'string'},cover_direction:{type:'string'},scenes:{type:'array',minItems:pageCount,maxItems:pageCount,items:{type:'object',additionalProperties:false,required:['scene','event','visual_moment','continuity'],properties:{scene:{type:'integer'},event:{type:'string'},visual_moment:{type:'string'},continuity:{type:'string'}}}}}};
      const redesigned=await callStoryModelStructured(prompt,'moonbeam_safety_redesign',schema,10000,'safety redesign');
      // Enforce the information barrier in code as well as prompt: already-painted scenes stay byte-for-byte from the old plan.
      if(!isCover)for(let i=0;i<failedIndex;i++)redesigned.scenes[i]=plan.scenes[i];
      redesigned.premise=plan.premise||redesigned.premise;redesigned.story_arc=plan.story_arc||redesigned.story_arc;redesigned.ending=plan.ending||redesigned.ending;
      if(Array.isArray(plan._moonbeam_failure_diagnostics))redesigned._moonbeam_failure_diagnostics=plan._moonbeam_failure_diagnostics;
      await logUsage({event_type:'story_safety_redesign',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-6-astra',user_id:user.id,generation_run_id:child.generationRunId||null,failed_index:failedIndex}});
      return res.status(200).json({plan:redesigned});
    }

    if (String(body.action || '').trim() === 'finalize-storyboard-story') {
      const moonbeamUser = await verifyMoonbeamUser(req);
      const developerEmail = String(process.env.MOONBEAM_DEVELOPER_EMAIL || '').trim().toLowerCase();
      const developerDiagnostic = !!developerEmail && String(moonbeamUser.email || '').trim().toLowerCase() === developerEmail;
      const plan = body.plan || {};

    const child = body.child || {};
      const finalizeIsDeveloper=!!developerEmail&&String(moonbeamUser.email||'').trim().toLowerCase()===developerEmail;
      const requestedCount=Number(child.storyPageCount)||Number(plan.scenes?.length)||6;
      const spreadCount=finalizeIsDeveloper?Math.max(6,Math.min(10,requestedCount)):6;
      const middleCount=spreadCount-2;
      const scenes = Array.isArray(plan.scenes) ? plan.scenes.slice(0,spreadCount) : [];
      if (scenes.length !== spreadCount) return res.status(400).json({error:'The story production plan is incomplete.'});
      const age = Number(child.age)||7;
      const language = String(child.language||'en-GB');
      const languageGuide = {'en-GB':'natural contemporary British English with British spelling','en-US':'natural contemporary American English','es-ES':'natural Spanish from Spain','es-419':'natural neutral Latin American Spanish','fr-FR':'natural French from France','de-DE':'natural German from Germany','it-IT':'natural Italian from Italy','pt-BR':'natural Brazilian Portuguese','pl-PL':'natural contemporary Polish'}[language]||'natural British English';
      const planText = JSON.stringify(plan,null,2);
      const failureDiagnostics=Array.isArray(body.failureDiagnostics)?body.failureDiagnostics.slice(-5):[];
      const recoveryNote=failureDiagnostics.length?`\nRECOVERY DIAGNOSTICS FROM AN EARLIER FAILED FINALISATION/PRODUCTION ATTEMPT:\n${JSON.stringify(failureDiagnostics).slice(0,6000)}\nUse these diagnostics only to avoid repeating a technical/output mistake. Do not rewrite the story merely because a network or infrastructure failure occurred.\n`:'';
      const finalPrompt = `You are the final author for a Moonbeam illustrated children's book. The story architecture and complete page-by-page art direction were created before illustration. The illustrations have now been painted from that plan, but you are NOT being shown the finished image pixels. Write the finished book from the shared authoritative production plan.${recoveryNote}

ORIGINAL STORY IDEA:
${String(child.storyIdea||'').trim()||'No parent story idea was supplied.'}

AUTHORITATIVE STORY ARCHITECTURE + PAGE ART DIRECTION:
${planText}

HARD REQUIREMENTS ONLY
- Write content and language appropriate for a child aged ${age}, in ${languageGuide}.
- You have complete literary autonomy. Choose prose, verse, rhyme, dialogue, repetition, mixed forms or any other form you believe makes the strongest story. Do not impose or avoid any particular plot structure, tone, genre, lesson, problem, climax or ending pattern.
- Preserve exact supplied Cast names and facts. Never invent surnames or sensitive personal facts.
- Treat each planned scene as a LOCKED SPREAD EVENT. The prose for spread N and the illustration for spread N must depict the same narrative event, characters, state changes and essential physical facts. Do not move an event to another spread, invent a contradictory event, or change what the art director commissioned.
- Each scene's event, visual_moment and continuity fields tell you what Sunburst was commissioned to paint. Use them as the common source of truth for page alignment. You are free to decide HOW to tell that event in words.
- Complement the illustration rather than captioning it. If the art direction already carries a visible action, transformation, scale, expression or setting, the prose may use dialogue, reaction, humour, suspense, thought, sound or other storytelling instead of redundantly describing every visible detail. Do not omit narrative information the reader needs merely because it is visual.
- Do not infer or reconcile accidental details from the finished image output: you have deliberately not been shown those pixels. The production plan, not incidental painter variation, is authoritative.
- Public-domain reproduction/adaptation is allowed when the underlying material is confidently public domain in the United Kingdom; do not import protected additions from later adaptations. Do not reproduce or closely imitate protected copyrighted expression.
- Return exactly ${spreadCount} reading spreads: opening, ${middleCount} middle spreads and closing, in the same order as scenes 1-${spreadCount}.
- There is no target or minimum word count. Pages do not need to be similar lengths. HARD CEILING: no individual spread may exceed 220 words. Keep deliberate line breaks only when they serve your chosen literary form; Moonbeam's fixed-layout KDP renderer must be able to fit every spread legibly.
- No headings inside the story text.

Return JSON ONLY with title, opening, pages, and closing. The pages array must contain exactly ${middleCount} middle spreads so the complete book contains ${spreadCount} reading spreads.`;
      const content=[{type:'input_text',text:finalPrompt}];
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-6-astra',input:[{role:'user',content}],max_output_tokens:8000,text:{format:{type:'json_schema',name:'moonbeam_final_story',strict:true,schema:{type:'object',additionalProperties:false,required:['title','opening','pages','closing'],properties:{title:{type:'string'},opening:{type:'string'},pages:{type:'array',minItems:middleCount,maxItems:middleCount,items:{type:'object',additionalProperties:false,required:['text'],properties:{text:{type:'string'}}}},closing:{type:'string'}}}}}})});
      const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{};
      const usage=data?.usage||{};
      const finalDiagnostic=developerDiagnostic?{stage:'final story writing',model:'gpt-6-astra',http_status:r.status,response_status:data?.status||null,incomplete_reason:data?.incomplete_details?.reason||null,input_tokens:Number(usage.input_tokens||0)||null,output_tokens:Number(usage.output_tokens||0)||null,total_tokens:Number(usage.total_tokens||0)||null,max_output_tokens:8000,raw_response_chars:raw.length}:null;
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
          if(parsed.pages.length!==middleCount)reconciliationIssues.push(`expected ${middleCount} middle pages, received ${parsed.pages.length}`);
          parsed.pages.forEach((pg,i)=>{if(typeof pg?.text!=='string'||!pg.text.trim())reconciliationIssues.push(`page ${i+2} text is empty`)})
        }
        if(typeof parsed.closing!=='string'||!parsed.closing.trim())reconciliationIssues.push('missing closing');
        const spreadTexts=[parsed.opening,...(Array.isArray(parsed.pages)?parsed.pages.map(p=>p?.text||''):[]),parsed.closing];
        spreadTexts.forEach((txt,i)=>{const wc=String(txt||'').trim().split(/\s+/).filter(Boolean).length;if(wc>220)reconciliationIssues.push(`spread ${i+1} exceeds the 220-word KDP ceiling (${wc} words)`) });
      }
      if(reconciliationIssues.length){
        const payload={error:'Moonbeam could not complete the final story from the production plan.'};
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
    const isDeveloper=!!developerEmail&&String(moonbeamUser.email||'').trim().toLowerCase()===developerEmail;
    const developerDemo=demoRequested&&isDeveloper;
    const developerTextDiagnostics=[];
    const requestedStoryPageCount=Number(child.storyPageCount)||6;
    const storyPageCount=isDeveloper?Math.max(6,Math.min(10,requestedStoryPageCount)):6;
    child.storyPageCount=storyPageCount;
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
    const pageCount = storyPageCount-2;
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
The finished book has exactly ${storyPageCount} reading spreads: opening, ${storyPageCount-2} middle spreads and closing. Each spread must correspond to one coherent illustratable moment. The ${storyPageCount} moments must form one coherent book, but no particular plot structure is required.
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
    // Developer generations intentionally ignore account story memory so repeated test runs are independent.
    // Enforce this server-side as well as in the client; normal users retain the anti-repetition memory.
    const recentStoriesRaw=isDeveloper?[]:(Array.isArray(body.recentStories)?body.recentStories.slice(0,10):[]);
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
Do not write finished story prose, dialogue or page text. Create the ${storyPageCount}-scene production plan for the concept below.

CHOSEN CONCEPT — AUTHORITATIVE
${JSON.stringify(concept,null,2)}

You have complete creative autonomy over how the concept becomes a story. Do not impose or avoid any particular narrative structure. Do not add creative requirements beyond the Parent Story Idea, age appropriateness, Cast facts, copyright/public-domain rule and ${storyPageCount}-spread product format.

Create exactly ${storyPageCount} coherent, drawable interior moments covering the complete book, including the ending. Also design the front cover in this same art-direction pass.

At this stage you have a SECOND ROLE: you are the ART DIRECTOR AND VISUAL CONTINUITY DESIGNER for the entire book: ${storyPageCount} interior illustrations plus the front cover. Sunburst is only the painter. Do not ask Sunburst to interpret the story, invent the staging, design recurring story elements, choose wardrobe, or repair visual logic for you. You must make those decisions before it paints.

First design the coherent visual world for YOUR story. Use character_bible as the production design bible: establish the wardrobe you choose for recurring Cast, and concretely design recurring story-created creatures, vehicles, machines, buildings, locations and plot-important objects so that the same thing can be reproduced throughout the book. Record distinctive construction, materials, shape, scale, colours and other stable visual facts only where they matter. Canonical Cast photographs remain the absolute authority for personal identity; direct the photographed person but never redesign their face/body identity or invent identity-defining accessories absent from the reference.

Then art-direct every scene precisely. EVENT states what actually happens. VISUAL_MOMENT is a direct commission to the painter for the exact single frame you have chosen. Specify the composition and physical geometry with enough precision that a skilled painter who has NOT read the story can stage it without making narrative decisions. Where relevant, state relative positions, distances, foreground/background placement, orientation, relative sizes, who or what is beside/behind/in front of/inside/on top of what, which objects are held and how, and the physical state of important objects. Direct character performance too: facial expression, head/body orientation, gaze target, gesture, pointing direction and interaction with other characters or objects whenever those details communicate the intended event. If a hand, gaze, gesture or spatial relationship matters, name its target unambiguously rather than leaving the painter to guess.

Maintain continuity across all ${storyPageCount} interior briefs and the cover yourself. Once you establish wardrobe, an object/creature/machine design, scale, location layout or physical state, preserve it in later scenes unless your planned story deliberately changes it; when it changes, describe the change and carry the new state forward. CONTINUITY records the concrete facts that later scenes must preserve. Do not add detail merely to satisfy a checklist: precision serves your particular composition and story. But never delegate a consequential staging, design or continuity decision to Sunburst. No field may contain polished story prose.

Design the COVER as a separate commission after you have designed the ${storyPageCount} interiors. It should be the strongest single cover composition for the story as a whole; it need not duplicate an interior scene. Make every consequential composition/staging decision yourself just as for the interiors, preserve the same wardrobe/world/recurring designs, and leave calm usable space in the central/upper area for Moonbeam's separate title typography. Do not include or request words, letters, captions, logos, signs or readable text in the painting. The cover commission will be painted only after all ${storyPageCount} interiors exist, so the painter will also receive those finished paintings as continuity references.

Do not invent surnames. Preserve supplied Cast facts exactly. Do not prescribe art style; Moonbeam controls rendering style separately.

Return JSON ONLY with premise, story_arc, ending, character_bible, cover_direction and scenes. The scenes array must contain exactly ${storyPageCount} objects, each with event, visual_moment and continuity.`;
    let plan=null;
    const storyboardSchema={type:'object',additionalProperties:false,required:['premise','story_arc','ending','character_bible','cover_direction','scenes'],properties:{premise:{type:'string'},story_arc:{type:'string'},ending:{type:'string'},character_bible:{type:'string'},cover_direction:{type:'string'},scenes:{type:'array',minItems:storyPageCount,maxItems:storyPageCount,items:{type:'object',additionalProperties:false,required:['event','visual_moment','continuity'],properties:{event:{type:'string'},visual_moment:{type:'string'},continuity:{type:'string'}}}}}};
    try{
      plan=await callStoryModelStructured(planningPrompt,'moonbeam_visual_storyboard',storyboardSchema,10000,'storyboard planning');
    }catch(e){if(e.openaiStatus){await refundReservedCredit();return res.status(502).json({error:e.message,openai_status:e.openaiStatus})}await refundReservedCredit();return res.status(502).json({error:e.message||'Moonbeam could not create the visual storyboard correctly. Please try again.'})}
    if(!plan){await refundReservedCredit();return res.status(502).json({error:'Moonbeam could not create the visual storyboard correctly. Please try again.'})}
    plan.concept=concept;plan.title_working=String(plan.title_working||'').trim();plan.premise=String(plan.premise||'').trim();plan.story_arc=String(plan.story_arc||'').trim();plan.ending=String(plan.ending||'').trim();plan.character_bible=String(plan.character_bible||'').trim();plan.cover_direction=String(plan.cover_direction||'').trim();
    plan.scenes=plan.scenes.slice(0,storyPageCount).map((x,i)=>({scene:i+1,event:String(x?.event||'').trim(),visual_moment:String(x?.visual_moment||'').trim(),continuity:String(x?.continuity||'').trim()}));
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
