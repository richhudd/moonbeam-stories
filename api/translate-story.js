const {verifyMoonbeamUser}=require('../_credits');
const {SUPABASE_URL,SECRET_KEY,logUsage}=require('../_usage');
const PUBLISHABLE_KEY=String(process.env.SUPABASE_PUBLISHABLE_KEY||'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();
const supported=new Set(['en-GB','en-US','es-ES','es-419','fr-FR','de-DE','it-IT','pt-BR','pl-PL']);
const names={'en-GB':'British English','en-US':'American English','es-ES':'Spanish (Spain)','es-419':'Latin American Spanish','fr-FR':'French (France)','de-DE':'German (Germany)','it-IT':'Italian (Italy)','pt-BR':'Brazilian Portuguese','pl-PL':'Polish'};
function extractText(data){if(typeof data?.output_text==='string')return data.output_text;let out='';for(const item of data?.output||[])for(const part of item?.content||[])if(typeof part?.text==='string')out+=part.text;return out}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 try{
  const user=await verifyMoonbeamUser(req),body=typeof req.body==='string'?JSON.parse(req.body):req.body||{},storyId=String(body.storyId||''),target=String(body.targetLanguage||'');
  if(!storyId||!supported.has(target))return res.status(400).json({error:'Invalid saved story or language.'});
  if(!SECRET_KEY)return res.status(503).json({error:'Saved-story translation is not configured.'});
  // The bearer token above has already been verified by verifyMoonbeamUser(). Read the saved
  // story with the service role and explicitly constrain it to that verified parent. This avoids
  // browser-session/RLS differences inside the serverless translation function while preserving
  // ownership: another parent's story can never match both id and parent_id.
  const q=new URLSearchParams({id:`eq.${storyId}`,parent_id:`eq.${user.id}`,select:'id,title,language,opening,pages,closing,translations'});
  const serviceHeaders={apikey:SECRET_KEY,Authorization:`Bearer ${SECRET_KEY}`};
  const sr=await fetch(`${SUPABASE_URL}/rest/v1/saved_stories?${q}`,{headers:serviceHeaders});
  const rawRows=await sr.text();let rows=[];try{rows=JSON.parse(rawRows)}catch{}
  if(!sr.ok){console.error('saved story translation lookup failed',sr.status,rawRows);return res.status(502).json({error:'Moonbeam could not load that saved story for translation. Please try again.'})}
  if(!rows?.[0])return res.status(404).json({error:'This saved story is no longer available to this account.'});
  const row=rows[0],existing=row.translations?.[target];if(existing)return res.status(200).json({translation:existing,cached:true});
  if(target===row.language){const translation={title:row.title,opening:row.opening,pages:(row.pages||[]).map(p=>({text:p.text||''})),closing:row.closing};return res.status(200).json({translation,cached:true})}
  const apiKey=String(process.env.OPENAI_API_KEY||'').trim();if(!apiKey)return res.status(500).json({error:'Translation service is not configured.'});
  const source={title:row.title,opening:row.opening,pages:(row.pages||[]).map(p=>({text:p.text||''})),closing:row.closing};
  const prompt=`Translate this children's bedtime story faithfully into ${names[target]}. Preserve the meaning, warmth, character names, dialogue, age-appropriate tone, and EXACT page structure. Do not add, remove, summarise or rewrite scenes. Translate title, opening, each page text and closing. Return JSON only with exactly: {"title":"string","opening":"string","pages":[{"text":"string"}],"closing":"string"}. The pages array must contain exactly ${source.pages.length} items. Source story: ${JSON.stringify(source)}`;
  const or=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.6-luna',input:prompt,max_output_tokens:4500})});const od=await or.json();if(!or.ok)throw new Error(od?.error?.message||'Translation service failed.');let raw=extractText(od).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');let tr;try{tr=JSON.parse(raw)}catch{const a=raw.indexOf('{'),b=raw.lastIndexOf('}');tr=JSON.parse(raw.slice(a,b+1))}if(!tr?.title||!tr?.opening||!Array.isArray(tr.pages)||tr.pages.length!==source.pages.length||!tr?.closing)throw new Error('Translation returned an invalid page structure.');
  const translations={...(row.translations||{}),[target]:tr};
  const uq=new URLSearchParams({id:`eq.${storyId}`,parent_id:`eq.${user.id}`});
  const ur=await fetch(`${SUPABASE_URL}/rest/v1/saved_stories?${uq}`,{method:'PATCH',headers:{...serviceHeaders,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({translations})});
  if(!ur.ok){const detail=await ur.text();console.error('saved story translation update failed',ur.status,detail);throw new Error('The translation was created but Moonbeam could not save it to this story.')}
  logUsage({event_type:'story_translation',estimated_cost_gbp:0,metadata:{model:'gpt-5.6-luna',user_id:user.id,story_id:storyId,target_language:target}}).catch(()=>{});
  return res.status(200).json({translation:tr,cached:false});
 }catch(e){console.error(e);return res.status(e.status||500).json({error:e.message||'Translation failed.'})}
};
