const {SUPABASE_URL,adminHeaders}=require('../_usage');
const crypto=require('crypto');

const readJson=async(response)=>{
 const raw=await response.text();let data=null;
 try{data=raw?JSON.parse(raw):null}catch{}
 if(!response.ok)throw new Error(String(data?.error||data?.message||'HTTP '+response.status).slice(0,900));
 return data;
};
const supa=async(path,options={})=>readJson(await fetch(SUPABASE_URL+'/rest/v1/'+path,{
 ...options,headers:{...adminHeaders({'Content-Type':'application/json'}),...(options.headers||{})}
}));
const rpc=(name,data)=>supa('rpc/'+name,{method:'POST',body:JSON.stringify(data)});
const safeEqual=(a,b)=>{const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length>0&&x.length===y.length&&crypto.timingSafeEqual(x,y)};

module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 try{
  const config=(await supa('developer_fiction_worker_configuration?select=worker_secret&singleton=eq.true&limit=1'))?.[0];
  const presented=String(req.headers['x-moonbeam-worker-key']||'');
  if(!config||!safeEqual(config.worker_secret,presented))return res.status(403).json({error:'Unauthorized worker invocation.',header_present:!!req.headers['x-moonbeam-worker-key'],provided_chars:presented.length,expected_chars:String(config?.worker_secret||'').length});
  const work=async()=>{
   const job=(await rpc('fiction_background_claim_job',{}))?.[0];
   if(!job)return {idle:true};
   const baseUrl='https://moonbeamstories.co.uk';
   const api=async(mode,payload={})=>{
    const data=await readJson(await fetch(baseUrl+'/api/fiction-studio',{
     method:'POST',headers:{
      'Content-Type':'application/json',
      'x-moonbeam-worker-token':String(config.worker_secret),
      'x-moonbeam-worker-job':String(job.id),
      'x-moonbeam-worker-claim':String(job.claim_token)
     },
     body:JSON.stringify({mode,studio_section:'fiction_x',id:job.series_id,
      ...(job.kind==='volume'?{book_id:job.target_id}:{test_id:job.target_id}),...payload}),
     signal:AbortSignal.timeout(280000)
    }));
    return data;
   };
   let step='start',complete=false,lastError=null;
   try{
    if(job.kind==='volume'){
     const [pre,seq]=await Promise.all([api('asunder-aion-volume-preflight'),api('asunder-aion-volume-sequence')]);
     if(!pre.ready)throw new Error('Volume preflight failed: '+(pre.errors||[]).join('; '));
     const story=Number(seq.next_story);
     if(seq.completed){
      step='assemble volume';const finished=await api('asunder-aion-volume-assemble');
      complete=!!finished.complete;
     }else if(seq.next_step==='cast_brief'){
      step='vignette '+story+' cast brief';
      await api('asunder-aion-volume-cast-brief',{story_number:story});
     }else if(seq.next_step==='research'){
      step='vignette '+story+' naming research';
      const book=(await supa('developer_fiction_books?select=development_state&id=eq.'+encodeURIComponent(job.target_id)+'&limit=1'))?.[0];
      const wife=book?.development_state?.asunder_cast?.[story-1];
      if(!wife?.character_key||!wife?.intimacy_direction)throw new Error('Canonical wife or direction missing before naming research.');
      await api('asunder-aion-volume-research',{story_number:story});
     }else if(seq.next_step==='plan'){
      step='vignette '+story+' planning';
      await api('asunder-aion-volume-plan',{story_number:story});
     }else if(seq.next_step==='write'){
      const progress=await api('asunder-aion-volume-progress',{story_number:story});
      const beat=Number(progress.next_beat);
      if(!Number.isInteger(beat)||beat<1||beat>12)throw new Error('Checkpoint did not report a valid next beat.');
      step='vignette '+story+' beat '+beat;
      await api('asunder-aion-volume-write-beat',{story_number:story,beat_number:beat});
     }else if(seq.next_step==='stitch_and_lock'){
      step='vignette '+story+' lock';await api('asunder-aion-volume-lock-story',{story_number:story});
     }else throw new Error('Unrecognised volume checkpoint state: '+seq.next_step);
    }else{
     let test=(await api('asunder-vignette-test-get')).test;
     if(!test)throw new Error('Vignette tester checkpoint missing.');
     if(test.status==='complete'&&Array.isArray(test.beats)&&test.beats.length===12){
      complete=true;step='complete';
     }else if(!test.research){
      step='tester research';
      const result=await api('asunder-vignette-tester-research',{character_key:test.character_key,direction:test.direction});
      await api('asunder-vignette-test-save',{phase:'research',research:result.research,cost_usd:result.cost_usd,pricing_basis:result.pricing_basis});
     }else if(!test.plan){
      step='tester 12-beat planning';
      const result=await api('asunder-vignette-tester-plan',{character_key:test.character_key,direction:test.direction,research:test.research});
      await api('asunder-vignette-test-save',{phase:'plan',plan:result.plan,cost_usd:result.cost_usd,attempts:result.attempts});
     }else{
      const beats=Array.isArray(test.beats)?test.beats:[];
      const beat=beats.length+1;
      if(beat>12)throw new Error('Test checkpoint has twelve beats but no completion flag; inspect manually.');
      step='tester beat '+beat;
      const result=await api('asunder-vignette-tester-beat',{character_key:test.character_key,direction:test.direction,research:test.research,plan:test.plan,beat_number:beat,prior_text:beats.map(x=>x.text).join('\n\n')});
      await api('asunder-vignette-test-save',{phase:'beat',beat_number:beat,text:result.text,cost_usd:result.cost_usd});
      complete=beat===12;
     }
    }
   }catch(e){
    lastError=String(e?.message||e).slice(0,2000);
    // A network timeout can occur after fiction-studio has durably saved a
    // checkpoint. Reconcile against Supabase before scheduling a paid retry.
    if(job.kind==='volume'){
      try{
        const book=(await supa('developer_fiction_books?select=generation_state&id=eq.'+encodeURIComponent(job.target_id)+'&limit=1'))?.[0];
        const state=book?.generation_state||{};
        const castBrief=/^vignette (\d+) cast brief$/.exec(step);
        const naming=/^vignette (\d+) naming research$/.exec(step);
        const planned=/^vignette (\d+) planning$/.exec(step);
        const writing=/^vignette (\d+) beat (\d+)$/.exec(step);
        const verified=castBrief?!!state.aion_volume_cast_briefs?.[castBrief[1]]:naming?!!state.aion_volume_naming?.[naming[1]]:planned?!!state.aion_volume_plans?.[planned[1]]:writing?Array.isArray(state.aion_volume_beats?.[writing[1]])&&state.aion_volume_beats[writing[1]].length>=Number(writing[2]):false;
        if(verified){
          console.info('Aion step completed despite worker transport timeout; saved checkpoint verified',{kind:job.kind,target:job.target_id,step});
          lastError=null;
        }
      }catch(checkErr){console.error('Aion timeout checkpoint reconciliation unavailable',{step,error:String(checkErr?.message||checkErr).slice(0,200)});}
    }
    if(lastError)console.error('Asunder background step failed',{kind:job.kind,target:job.target_id,step,error:lastError});
   }
   const persisted=await rpc('fiction_background_finish_step',{p_id:job.id,p_token:job.claim_token,p_step:step,p_error:lastError,p_complete:complete});
   if(persisted!==true)throw new Error('Job result could not be durably acknowledged. Inspect before resuming.');
   return {kind:job.kind,job_id:job.id,step,status:lastError?'paused':complete?'complete':'queued',error:lastError};
  };
  // Two independent job claims permit one volume and one loose vignette to
  // advance in parallel. Each job has its own lease and persistent checkpoints.
  const settled=await Promise.allSettled([work(),work()]);
  return res.status(200).json({jobs:settled.map(x=>x.status==='fulfilled'?x.value:{error:String(x.reason?.message||x.reason)})});
 }catch(e){console.error('Asunder worker invocation rejected/failed',e);return res.status(500).json({error:'Background worker failed',detail:String(e?.message||e).slice(0,350)})}
};
