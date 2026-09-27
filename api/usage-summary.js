const { SUPABASE_URL, SECRET_KEY, adminHeaders, getUsageBaselineUTC } = require('../_usage');

const PUBLISHABLE_KEY =
  String(process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();

const MOONBEAM_ALL_TIME_START_UTC = '2026-09-07T23:00:00Z'; // 8 Sep 2026 00:00 BST

function unixSeconds(v) {
  const ms=Date.parse(String(v||''));
  return Number.isFinite(ms)?Math.floor(ms/1000):null;
}
function startOfUtcDaySeconds(d=new Date()){
  return Math.floor(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())/1000);
}
function startOfUtcMonthSeconds(d=new Date()){
  return Math.floor(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1)/1000);
}

async function verifyDeveloper(req){
  if(!SECRET_KEY)return {error:[503,'Set SUPABASE_SERVICE_ROLE_KEY in Vercel.']};
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token)return {error:[401,'Sign in required.']};
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});
  if(!r.ok)return {error:[401,'Invalid or expired Moonbeam session.']};
  const user=await r.json();
  const allowed=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();
  if(!allowed||String(user.email||'').toLowerCase()!==allowed)return {error:[403,'Developer access only.']};
  return {user};
}

async function fetchOpenAICostUSD(startTime,endTime){
  const adminKey=String(process.env.OPENAI_ADMIN_KEY||'').trim();
  if(!adminKey)return {available:false,totalUSD:null,error:'OPENAI_ADMIN_KEY is not configured in Vercel.'};
  const projectId=String(process.env.OPENAI_PROJECT_ID||'').trim();
  let totalUSD=0,page='',safety=0;
  do{
    const qs=new URLSearchParams({start_time:String(startTime),end_time:String(endTime),bucket_width:'1d',limit:'180'});
    if(projectId)qs.append('project_ids',projectId);
    if(page)qs.set('page',page);
    const r=await fetch(`https://api.openai.com/v1/organization/costs?${qs}`,{
      headers:{Authorization:`Bearer ${adminKey}`,'Content-Type':'application/json'}
    });
    if(!r.ok){
      const detail=await r.text(); console.error('OpenAI cost query failed',r.status,detail);
      return {available:false,totalUSD:null,error:`OpenAI cost query failed (${r.status}).`};
    }
    const payload=await r.json();
    for(const bucket of Array.isArray(payload.data)?payload.data:[]){
      for(const result of Array.isArray(bucket.results)?bucket.results:[]){
        if(String(result?.amount?.currency||'usd').toLowerCase()!=='usd')continue;
        const n=Number(result?.amount?.value); if(Number.isFinite(n))totalUSD+=n;
      }
    }
    page=payload.has_more?String(payload.next_page||''):'';
    safety++;
  }while(page&&safety<50);
  return {available:true,totalUSD,projectFiltered:!!projectId};
}

function count(list,type){return list.filter(x=>x.event_type===type).length}
// V251.99: completed stories used to be logged as `story`; the current pipeline logs
// `story_finalize`. Treat both as completions, but deduplicate modern finalisation
// retries by generation_run_id so a resumed/retried book is counted only once.
function completedStoryEvents(list){
  const modernByRun=new Map();
  const legacy=[];
  for(const e of list){
    if(e.event_type==='story_finalize'){
      const run=String(e?.metadata?.generation_run_id||'').trim();
      if(run){
        const prior=modernByRun.get(run);
        if(!prior || Date.parse(e.created_at)>Date.parse(prior.created_at))modernByRun.set(run,e);
      }else modernByRun.set(`no-run:${e.created_at}:${modernByRun.size}`,e);
    }else if(e.event_type==='story') legacy.push(e);
  }
  const modernRuns=new Set([...modernByRun.keys()].filter(k=>!k.startsWith('no-run:')));
  for(const e of legacy){
    const run=String(e?.metadata?.generation_run_id||'').trim();
    if(!run || !modernRuns.has(run))modernByRun.set(`legacy:${run||e.created_at}:${modernByRun.size}`,e);
  }
  return [...modernByRun.values()];
}
function usageFor(events,startMs,endMs=null){
  const list=events.filter(x=>{const t=Date.parse(String(x.created_at||''));return (startMs==null||t>=startMs)&&(endMs==null||t<endMs)});
  const trackedCostGBP=list.reduce((sum,x)=>sum+(Number(x.estimated_cost_gbp)||0),0);
  return {stories:completedStoryEvents(list).length,images:count(list,'image'),narrations:count(list,'narration'),trackedCostGBP};
}

function eventsForUser(events,userId,mode='only'){
  const id=String(userId||'');
  return events.filter(e=>{const eventUser=String(e?.metadata?.user_id||'');return mode==='other'?!!eventUser&&eventUser!==id:eventUser===id});
}


module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'GET or POST only'});
  const verified=await verifyDeveloper(req);
  if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});

  if(req.method==='POST'){
    const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    if(String(body.action||'')!=='reset-baseline')return res.status(400).json({error:'Unknown action.'});
    const baselineUTC=new Date().toISOString();
    const r=await fetch(`${SUPABASE_URL}/rest/v1/moonbeam_admin_settings`,{
      method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=representation'}),
      body:JSON.stringify({key:'usage_baseline_utc',value:baselineUTC,updated_at:baselineUTC})
    });
    if(!r.ok){console.error('baseline reset failed',r.status,await r.text());return res.status(500).json({error:'Could not reset the baseline.'})}
    return res.status(200).json({ok:true,baselineUTC});
  }

  const baselineUTC=await getUsageBaselineUTC();
  const baselineSeconds=unixSeconds(baselineUTC);
  if(!baselineSeconds)return res.status(500).json({error:'Usage baseline is invalid.'});
  const now=Math.floor(Date.now()/1000);

  // V252.01: PostgREST applies the project's max-rows limit to a collection request.
  // The old single request therefore stopped at the oldest 1,000 usage rows; once
  // api_usage_events exceeded 1,000 rows the dashboard appeared to freeze in time.
  // Page explicitly until the final short page so all historical and current events
  // are available to every period, user summary and support-log calculation.
  const events=[];
  const usagePageSize=1000;
  for(let offset=0,safety=0;safety<100;safety++,offset+=usagePageSize){
    const end=offset+usagePageSize-1;
    const er=await fetch(`${SUPABASE_URL}/rest/v1/api_usage_events?select=event_type,estimated_cost_gbp,created_at,metadata&order=created_at.asc`,{
      headers:adminHeaders({Range:`${offset}-${end}`})
    });
    if(!er.ok){console.error('usage events failed',er.status,await er.text());return res.status(500).json({error:'Could not read Moonbeam usage events.'})}
    const page=await er.json();
    if(!Array.isArray(page)){console.error('usage events returned a non-array page');return res.status(500).json({error:'Could not read Moonbeam usage events.'})}
    events.push(...page);
    if(page.length<usagePageSize)break;
    if(safety===99){console.error('usage events pagination safety limit reached',events.length);return res.status(500).json({error:'Moonbeam usage history is too large to read safely.'})}
  }

  const ar=await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`,{headers:adminHeaders()});
  let users=[],registeredUsers=null;
  if(ar.ok){const x=await ar.json();users=Array.isArray(x.users)?x.users:[];registeredUsers=users.length}
  else console.error('usage users failed',ar.status,await ar.text());
  const emailById=new Map(users.map(u=>[String(u.id),String(u.email||'')]));

  const allTimeStart=unixSeconds(MOONBEAM_ALL_TIME_START_UTC);
  const today=startOfUtcDaySeconds();
  const thisMonth=startOfUtcMonthSeconds();
  const yesterday=today-86400;
  const sevenDays=today-(6*86400);

  const periods={
    allTime:usageFor(events,allTimeStart*1000),
    sinceBaseline:usageFor(events,baselineSeconds*1000),
    developerSinceBaseline:usageFor(eventsForUser(events,verified.user.id),baselineSeconds*1000),
    otherUsersSinceBaseline:usageFor(eventsForUser(events,verified.user.id,'other'),baselineSeconds*1000),
    thisMonth:usageFor(events,thisMonth*1000),
    today:usageFor(events,today*1000),
    yesterday:usageFor(events,yesterday*1000,today*1000),
    last7Days:usageFor(events,sevenDays*1000)
  };
  periods.allTime.registeredUsers=registeredUsers;

  const [allCost,monthCost,baseCost,todayCost,yesterdayCost,sevenCost]=await Promise.all([
    fetchOpenAICostUSD(allTimeStart,now),
    fetchOpenAICostUSD(thisMonth,now),
    fetchOpenAICostUSD(baselineSeconds,now),
    fetchOpenAICostUSD(today,now),
    fetchOpenAICostUSD(yesterday,today),
    fetchOpenAICostUSD(sevenDays,now)
  ]);
  const costs={
    allTime:allCost,
    sinceBaseline:baseCost,
    developerSinceBaseline:{available:false,totalUSD:null},
    otherUsersSinceBaseline:{available:false,totalUSD:null},
    thisMonth:monthCost,
    today:todayCost,
    yesterday:yesterdayCost,
    last7Days:sevenCost
  };
  for(const key of Object.keys(periods)){
    const c=costs[key];
    periods[key].openAICostUSD=c.totalUSD;
    periods[key].averageStoryCostUSD=c.available&&periods[key].stories>0?c.totalUSD/periods[key].stories:null;
    periods[key].trackedCostPerStoryGBP=periods[key].stories>0?periods[key].trackedCostGBP/periods[key].stories:null;
  }


  const storyEventsByUser=new Map();
  for(const e of completedStoryEvents(events)){
    const userId=String(e?.metadata?.user_id||'');
    if(!userId)continue;
    const list=storyEventsByUser.get(userId)||[];
    list.push(e);
    storyEventsByUser.set(userId,list);
  }

  const userSummaries=users
    .map(user=>{
      const userId=String(user.id||'');
      const storyEvents=storyEventsByUser.get(userId)||[];
      let lastGenerationAt=null;
      for(const e of storyEvents){
        if(!lastGenerationAt || Date.parse(e.created_at)>Date.parse(lastGenerationAt)){
          lastGenerationAt=e.created_at;
        }
      }
      return {
        id:userId,
        email:String(user.email||''),
        createdAt:user.created_at||null,
        lastSignInAt:user.last_sign_in_at||null,
        storiesGenerated:storyEvents.length,
        lastGenerationAt
      };
    })
    .sort((a,b)=>Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0));

  const supportAttempts=events
    .filter(x=>x.event_type==='generation_attempt')
    .slice(-100).reverse()
    .map(x=>{
      const m=x.metadata||{};
      return {
        createdAt:x.created_at,
        email:emailById.get(String(m.user_id||''))||'—',
        status:m.status||'—',
        creditDeducted:!!m.credit_deducted,
        creditRefunded:!!m.credit_refunded,
        generationRunId:m.generation_run_id||null,
        imagesGenerated:Number(m.images_generated||0),
        errorCode:m.error_code||null,
        durationMs:Number(m.duration_ms||0)
      };
    });

  return res.status(200).json({
    baselineUTC,
    allTimeStartUTC:MOONBEAM_ALL_TIME_START_UTC,
    periods,
    users:userSummaries,
    supportAttempts,
    openai:{
      available:baseCost.available,
      thisMonthAvailable:monthCost.available,
      thisMonthCostUSD:monthCost.totalUSD,
      projectFiltered:!!baseCost.projectFiltered,
      error:baseCost.error||monthCost.error||null
    }
  });
};
