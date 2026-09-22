const { Resend } = require('resend');
const crypto=require('crypto');
const {SUPABASE_URL:ADMIN_SUPABASE_URL,adminHeaders,logUsage,estimateGBP}=require('./_usage');
const instagramReelHandler=require('../lib/instagram-reel');

const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const RESEND_WEBHOOK_SECRET = String(process.env.RESEND_WEBHOOK_SECRET || '').trim();
const SUPPORT_FORWARD_TO = String(process.env.SUPPORT_FORWARD_TO || '').trim();
const PRIVACY_FORWARD_TO = String(process.env.PRIVACY_FORWARD_TO || SUPPORT_FORWARD_TO || '').trim();
const FORWARD_FROM = String(
  process.env.RESEND_FORWARD_FROM || 'Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>'
).trim();
const SUPABASE_URL = String(process.env.SUPABASE_URL || 'https://quwjfjojeibaxnnpykaf.supabase.co').trim();
const PUBLISHABLE_KEY = String(process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();
const SITE_URL=String(process.env.MOONBEAM_SITE_URL||'https://www.moonbeamstories.co.uk').replace(/\/$/,'');

const ALLOWED_RECIPIENTS = Object.freeze({
  'support@moonbeamstories.co.uk': () => SUPPORT_FORWARD_TO,
  'privacy@moonbeamstories.co.uk': () => PRIVACY_FORWARD_TO,
  'richard@moonbeamstories.co.uk': () => SUPPORT_FORWARD_TO,
});

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
function normaliseAddress(value) { return String(value || '').trim().toLowerCase(); }
function addressOnly(value) {
  const s=String(value||'').trim();
  const m=s.match(/<([^<>]+)>/);
  return normaliseAddress(m?m[1]:s);
}
function destinationFor(event) {
  const recipients = Array.isArray(event?.data?.to) ? event.data.to : [];
  for (const raw of recipients) {
    const address = addressOnly(raw);
    const resolver = ALLOWED_RECIPIENTS[address];
    if (resolver) return { inbound: address, forwardTo: String(resolver() || '').trim() };
  }
  return null;
}
function inboundMailbox(message){
  const recipients=Array.isArray(message?.to)?message.to:[];
  for(const raw of recipients){
    const a=addressOnly(raw);
    if(ALLOWED_RECIPIENTS[a])return a;
  }
  return '';
}
function safeReplyAddress(value){
  const address=addressOnly(value);
  if(!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))return '';
  return address;
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function verifyDeveloper(req){
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token)return {error:[401,'Sign in required.']};
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});
  if(!r.ok)return {error:[401,'Invalid or expired Moonbeam session.']};
  const user=await r.json();
  const allowed=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();
  if(!allowed||String(user.email||'').toLowerCase()!==allowed)return {error:[403,'Developer access only.']};
  return {user};
}
async function resendJson(path,options={}){
  const r=await fetch(`https://api.resend.com${path}`,{
    ...options,
    headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json',...(options.headers||{})}
  });
  const text=await r.text(); let data={};
  try{data=text?JSON.parse(text):{}}catch{data={message:text||`Resend request failed (${r.status}).`}}
  if(!r.ok)throw new Error(data?.message||data?.error?.message||`Resend request failed (${r.status}).`);
  return data;
}
async function getReceivedEmail(id){
  const resend=new Resend(RESEND_API_KEY);
  const {data,error}=await resend.emails.receiving.get(id);
  if(error)throw new Error(error.message||'Could not retrieve received email.');
  if(!data)throw new Error('Resend returned no received email data.');
  return data;
}
function firstReplyAddress(message){
  const replyTo=message?.reply_to;
  if(Array.isArray(replyTo)){
    for(const value of replyTo){const a=safeReplyAddress(value);if(a)return a;}
  }else{
    const a=safeReplyAddress(replyTo); if(a)return a;
  }
  return safeReplyAddress(message?.from);
}
async function developerGet(req,res,action){
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  if(!RESEND_API_KEY)return res.status(503).json({error:'RESEND_API_KEY is not configured.'});
  try{
    if(action==='message'){
      const id=String(req.query?.id||'').trim(); if(!id)return res.status(400).json({error:'Missing email id.'});
      const message=await getReceivedEmail(id);
      let mailbox=inboundMailbox(message);
      let fallback=null;
      // The received-email list is the authoritative metadata source if a provider response omits a header field.
      if(!mailbox || !message.subject || !message.from || !message.created_at){
        const listed=await resendJson('/emails/receiving?limit=100');
        fallback=(Array.isArray(listed?.data)?listed.data:[]).find(x=>String(x?.id||'')===id)||null;
        if(!mailbox)mailbox=inboundMailbox(fallback);
      }
      if(!mailbox)return res.status(404).json({error:'This message is not addressed to a Moonbeam support mailbox.'});
      const from=message.from||fallback?.from||'';
      const to=(Array.isArray(message.to)&&message.to.length)?message.to:(fallback?.to||[]);
      const subject=message.subject||fallback?.subject||'(No subject)';
      const createdAt=message.created_at||fallback?.created_at||null;
      return res.status(200).json({message:{id:message.id||id,from,to,cc:message.cc||fallback?.cc||[],subject,createdAt,text:message.text||'',html:message.html||'',messageId:message.message_id||fallback?.message_id||'',mailbox,replyAddress:firstReplyAddress(message)||safeReplyAddress(from)}});
    }
    const payload=await resendJson('/emails/receiving?limit=100');
    const rows=(Array.isArray(payload?.data)?payload.data:[]).filter(x=>inboundMailbox(x)).map(x=>({id:x.id,from:x.from,to:x.to,subject:x.subject||'(No subject)',createdAt:x.created_at||null,mailbox:inboundMailbox(x)}));
    return res.status(200).json({messages:rows,hasMore:!!payload?.has_more});
  }catch(error){console.error('support inbox read',error);return res.status(502).json({error:error?.message||'Could not read support inbox.'});}
}

async function developerInstagramTest(req,res){
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  const accessToken=String(process.env.INSTAGRAM_ACCESS_TOKEN||'').trim();
  const accountId=String(process.env.INSTAGRAM_ACCOUNT_ID||'').trim();
  if(!accessToken||!accountId)return res.status(503).json({error:'Instagram is not configured in Vercel.'});
  try{
    const url=`https://graph.instagram.com/v26.0/${encodeURIComponent(accountId)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`;
    const r=await fetch(url,{headers:{Accept:'application/json'}});
    const text=await r.text(); let data={};
    try{data=text?JSON.parse(text):{}}catch{data={error:{message:text||`Instagram request failed (${r.status}).`}}}
    if(!r.ok){
      const message=data?.error?.message||`Instagram request failed (${r.status}).`;
      console.error('instagram connection test',r.status,message);
      return res.status(502).json({ok:false,error:message});
    }
    if(String(data?.id||'')!==accountId)return res.status(200).json({ok:false,mismatch:true,configuredAccountId:accountId,returnedAccountId:String(data?.id||''),username:data?.username||null,error:'Instagram returned a different account id.'});
    return res.status(200).json({ok:true,accountId:data.id,username:data.username||null});
  }catch(error){console.error('instagram connection test',error);return res.status(502).json({ok:false,error:error?.message||'Could not connect to Instagram.'});}
}

async function instagramJson(url, options={}){
  const r=await fetch(url,options);
  const text=await r.text(); let data={};
  try{data=text?JSON.parse(text):{}}catch{data={error:{message:text||`Instagram request failed (${r.status}).`}}}
  if(!r.ok||data?.error)throw new Error(data?.error?.message||`Instagram request failed (${r.status}).`);
  return data;
}

async function developerInstagramPublishTest(req,res){
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  const accessToken=String(process.env.INSTAGRAM_ACCESS_TOKEN||'').trim();
  const accountId=String(process.env.INSTAGRAM_ACCOUNT_ID||'').trim();
  if(!accessToken||!accountId)return res.status(503).json({error:'Instagram is not configured in Vercel.'});
  try{
    const origin='https://www.moonbeamstories.co.uk';
    const imageUrl=`${origin}/moonbeam-demo.png`;
    const caption='Moonbeam Stories Instagram publishing test ✨\n\nmoonbeamstories.co.uk';
    const createBody=new URLSearchParams({image_url:imageUrl,caption,access_token:accessToken});
    const created=await instagramJson(`https://graph.instagram.com/v26.0/${encodeURIComponent(accountId)}/media`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:createBody.toString()});
    const creationId=String(created?.id||'').trim();
    if(!creationId)throw new Error('Instagram did not return a media container ID.');
    const publishBody=new URLSearchParams({creation_id:creationId,access_token:accessToken});
    const published=await instagramJson(`https://graph.instagram.com/v26.0/${encodeURIComponent(accountId)}/media_publish`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:publishBody.toString()});
    const mediaId=String(published?.id||'').trim();
    if(!mediaId)throw new Error('Instagram did not return a published media ID.');
    return res.status(200).json({ok:true,mediaId});
  }catch(error){console.error('instagram publishing test',error);return res.status(502).json({ok:false,error:error?.message||'Could not publish the Instagram test post.'});}
}


async function developerInstagramAccess(req,res){
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  return res.status(200).json({ok:true});
}

function extractJsonObject(text){
  const clean=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(clean)}catch{}
  const start=clean.indexOf('{');if(start<0)return null;let depth=0,inString=false,escaped=false;
  for(let i=start;i<clean.length;i++){
    const ch=clean[i];
    if(inString){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')inString=false;continue}
    if(ch==='"'){inString=true;continue}if(ch==='{')depth++;else if(ch==='}'&&--depth===0){try{return JSON.parse(clean.slice(start,i+1))}catch{return null}}
  }
  return null;
}
function weightedPick(items){
  const list=Array.isArray(items)?items.filter(Boolean):[];let total=0;
  for(const item of list)total+=Math.max(0,Number(item?.weight)||0);
  if(!list.length)return null;if(total<=0)return list[list.length-1];
  let roll=(crypto.randomInt(0,1000000)/1000000)*total;
  for(const item of list){roll-=Math.max(0,Number(item?.weight)||0);if(roll<0)return item}
  return list[list.length-1];
}
function randomItem(items){return Array.isArray(items)&&items.length?items[crypto.randomInt(0,items.length)]:null}
function weightedValue(items,fallback=''){
  const picked=weightedPick(items);if(picked&&typeof picked==='object'&&typeof picked.value!=='undefined')return picked.value;
  return fallback;
}
async function developerInstagramAutoDemoProfile(req,res,body={}){
  const verified=await verifyDeveloper(req);if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  const apiKey=String(process.env.OPENAI_API_KEY||'').trim().replace(/^[\'\"]|[\'\"]$/g,'');
  if(!apiKey)return res.status(503).json({error:'OPENAI_API_KEY is not configured in Vercel.'});
  const existingNames=(Array.isArray(body?.existingNames)?body.existingNames:[]).map(x=>String(x||'').trim()).filter(Boolean).slice(0,80);
  const varietySeed=crypto.randomBytes(10).toString('hex');
  const age=crypto.randomInt(3,13);
  const gender=crypto.randomInt(0,2)?'female':'male';
  const broadCategory=weightedPick([
    {label:'White',weight:81.7,subprofiles:[
      {label:'White British fair',weight:48,skinTones:[{value:'fair skin',weight:45},{value:'light skin',weight:40},{value:'light skin with freckles',weight:15}],hairColours:[{value:'medium brown',weight:34},{value:'dark brown',weight:18},{value:'dark blonde',weight:16},{value:'blonde',weight:15},{value:'light brown',weight:9},{value:'black',weight:4},{value:'auburn',weight:2},{value:'red',weight:2}],eyeColours:[{value:'blue-grey',weight:48},{value:'brown or hazel',weight:27},{value:'green or intermediate',weight:25}],hairTextures:[{value:'straight',weight:52},{value:'wavy',weight:35},{value:'curly',weight:13}]},
      {label:'White British brown-haired',weight:34,skinTones:[{value:'fair skin',weight:25},{value:'light skin',weight:45},{value:'light-to-medium skin',weight:30}],hairColours:[{value:'medium brown',weight:42},{value:'dark brown',weight:27},{value:'light brown',weight:12},{value:'dark blonde',weight:8},{value:'black',weight:6},{value:'auburn',weight:3},{value:'red',weight:2}],eyeColours:[{value:'blue-grey',weight:41},{value:'brown or hazel',weight:34},{value:'green or intermediate',weight:25}],hairTextures:[{value:'straight',weight:48},{value:'wavy',weight:37},{value:'curly',weight:15}]},
      {label:'White other European',weight:18,skinTones:[{value:'fair skin',weight:15},{value:'light skin',weight:35},{value:'light-to-medium skin',weight:35},{value:'olive-toned skin',weight:15}],hairColours:[{value:'dark brown',weight:32},{value:'medium brown',weight:30},{value:'black',weight:12},{value:'light brown',weight:12},{value:'dark blonde',weight:9},{value:'blonde',weight:5}],eyeColours:[{value:'blue-grey',weight:30},{value:'brown or hazel',weight:43},{value:'green or intermediate',weight:27}],hairTextures:[{value:'straight',weight:42},{value:'wavy',weight:40},{value:'curly',weight:18}]}
    ]},
    {label:'Asian or Asian British',weight:9.3,subprofiles:[
      {label:'Indian heritage',weight:35,skinTones:[{value:'medium brown skin',weight:45},{value:'light brown skin',weight:30},{value:'golden-brown skin',weight:25}],hairColours:[{value:'black',weight:72},{value:'dark brown',weight:26},{value:'medium brown',weight:2}],eyeColours:[{value:'brown or hazel',weight:95},{value:'green or intermediate',weight:4},{value:'blue-grey',weight:1}],hairTextures:[{value:'straight',weight:44},{value:'wavy',weight:40},{value:'curly',weight:16}]},
      {label:'Pakistani heritage',weight:30,skinTones:[{value:'medium brown skin',weight:42},{value:'light brown skin',weight:28},{value:'golden-brown skin',weight:20},{value:'olive-toned skin',weight:10}],hairColours:[{value:'black',weight:76},{value:'dark brown',weight:22},{value:'medium brown',weight:2}],eyeColours:[{value:'brown or hazel',weight:96},{value:'green or intermediate',weight:3},{value:'blue-grey',weight:1}],hairTextures:[{value:'straight',weight:38},{value:'wavy',weight:44},{value:'curly',weight:18}]},
      {label:'Bangladeshi heritage',weight:10,skinTones:[{value:'medium brown skin',weight:40},{value:'golden-brown skin',weight:35},{value:'light brown skin',weight:25}],hairColours:[{value:'black',weight:80},{value:'dark brown',weight:18},{value:'medium brown',weight:2}],eyeColours:[{value:'brown or hazel',weight:97},{value:'green or intermediate',weight:2},{value:'blue-grey',weight:1}],hairTextures:[{value:'straight',weight:35},{value:'wavy',weight:45},{value:'curly',weight:20}]},
      {label:'East or Southeast Asian heritage',weight:25,skinTones:[{value:'light skin',weight:18},{value:'light-to-medium skin',weight:52},{value:'medium skin',weight:30}],hairColours:[{value:'black',weight:84},{value:'dark brown',weight:15},{value:'medium brown',weight:1}],eyeColours:[{value:'brown or hazel',weight:97},{value:'green or intermediate',weight:2},{value:'blue-grey',weight:1}],hairTextures:[{value:'straight',weight:76},{value:'wavy',weight:20},{value:'curly',weight:4}]}
    ]},
    {label:'Black, Black British, Caribbean or African',weight:4.0,subprofiles:[
      {label:'Black African heritage',weight:65,skinTones:[{value:'deep brown skin',weight:48},{value:'dark brown skin',weight:34},{value:'medium-deep brown skin',weight:18}],hairColours:[{value:'black',weight:90},{value:'dark brown',weight:10}],eyeColours:[{value:'brown or hazel',weight:98},{value:'green or intermediate',weight:2}],hairTextures:[{value:'coily',weight:58},{value:'tightly curled',weight:34},{value:'curly',weight:8}]},
      {label:'Black Caribbean heritage',weight:35,skinTones:[{value:'deep brown skin',weight:28},{value:'dark brown skin',weight:37},{value:'medium brown skin',weight:35}],hairColours:[{value:'black',weight:86},{value:'dark brown',weight:14}],eyeColours:[{value:'brown or hazel',weight:97},{value:'green or intermediate',weight:3}],hairTextures:[{value:'coily',weight:46},{value:'tightly curled',weight:34},{value:'curly',weight:20}]}
    ]},
    {label:'Mixed or Multiple ethnic groups',weight:2.9,subprofiles:[
      {label:'Mixed White and Black heritage',weight:45,skinTones:[{value:'medium brown skin',weight:28},{value:'light brown skin',weight:34},{value:'light-to-medium brown skin',weight:38}],hairColours:[{value:'dark brown',weight:36},{value:'black',weight:34},{value:'medium brown',weight:18},{value:'light brown',weight:8},{value:'dark blonde',weight:4}],eyeColours:[{value:'brown or hazel',weight:58},{value:'green or intermediate',weight:24},{value:'blue-grey',weight:18}],hairTextures:[{value:'curly',weight:38},{value:'coily',weight:18},{value:'wavy',weight:32},{value:'straight',weight:12}]},
      {label:'Mixed White and Asian heritage',weight:35,skinTones:[{value:'light-to-medium skin',weight:30},{value:'light brown skin',weight:34},{value:'medium skin',weight:36}],hairColours:[{value:'dark brown',weight:34},{value:'medium brown',weight:28},{value:'black',weight:16},{value:'light brown',weight:12},{value:'dark blonde',weight:7},{value:'blonde',weight:3}],eyeColours:[{value:'brown or hazel',weight:60},{value:'green or intermediate',weight:20},{value:'blue-grey',weight:20}],hairTextures:[{value:'straight',weight:38},{value:'wavy',weight:40},{value:'curly',weight:22}]},
      {label:'Other mixed heritage',weight:20,skinTones:[{value:'light-to-medium skin',weight:24},{value:'medium skin',weight:33},{value:'light brown skin',weight:23},{value:'medium brown skin',weight:20}],hairColours:[{value:'dark brown',weight:32},{value:'medium brown',weight:28},{value:'black',weight:20},{value:'light brown',weight:10},{value:'dark blonde',weight:6},{value:'blonde',weight:4}],eyeColours:[{value:'brown or hazel',weight:52},{value:'green or intermediate',weight:24},{value:'blue-grey',weight:24}],hairTextures:[{value:'straight',weight:28},{value:'wavy',weight:38},{value:'curly',weight:24},{value:'coily',weight:10}]}
    ]},
    {label:'Other ethnic group',weight:2.1,subprofiles:[
      {label:'Middle Eastern or North African heritage',weight:55,skinTones:[{value:'olive-toned skin',weight:36},{value:'light brown skin',weight:34},{value:'medium skin',weight:30}],hairColours:[{value:'black',weight:46},{value:'dark brown',weight:42},{value:'medium brown',weight:12}],eyeColours:[{value:'brown or hazel',weight:86},{value:'green or intermediate',weight:11},{value:'blue-grey',weight:3}],hairTextures:[{value:'straight',weight:34},{value:'wavy',weight:46},{value:'curly',weight:20}]},
      {label:'Latin American heritage',weight:25,skinTones:[{value:'light brown skin',weight:30},{value:'medium skin',weight:30},{value:'olive-toned skin',weight:22},{value:'light-to-medium skin',weight:18}],hairColours:[{value:'dark brown',weight:40},{value:'black',weight:30},{value:'medium brown',weight:20},{value:'light brown',weight:8},{value:'dark blonde',weight:2}],eyeColours:[{value:'brown or hazel',weight:73},{value:'green or intermediate',weight:17},{value:'blue-grey',weight:10}],hairTextures:[{value:'straight',weight:34},{value:'wavy',weight:44},{value:'curly',weight:22}]},
      {label:'Other non-white heritage',weight:20,skinTones:[{value:'medium skin',weight:35},{value:'light brown skin',weight:30},{value:'olive-toned skin',weight:20},{value:'medium brown skin',weight:15}],hairColours:[{value:'dark brown',weight:34},{value:'black',weight:28},{value:'medium brown',weight:22},{value:'light brown',weight:10},{value:'dark blonde',weight:6}],eyeColours:[{value:'brown or hazel',weight:68},{value:'green or intermediate',weight:20},{value:'blue-grey',weight:12}],hairTextures:[{value:'straight',weight:34},{value:'wavy',weight:38},{value:'curly',weight:20},{value:'coily',weight:8}]}
    ]}
  ])||{label:'White',subprofiles:[{label:'White British fair',skinTones:[{value:'fair skin',weight:1}],hairColours:[{value:'medium brown',weight:1}],eyeColours:[{value:'blue-grey',weight:1}],hairTextures:[{value:'straight',weight:1}]}]};
  const subProfile=weightedPick(broadCategory.subprofiles)||broadCategory.subprofiles[0];
  const skinTone=weightedValue(subProfile.skinTones,'light skin');
  const hairColour=weightedValue(subProfile.hairColours,'brown');
  const eyeColour=weightedValue(subProfile.eyeColours,'brown or hazel');
  const hairTexture=weightedValue(subProfile.hairTextures,'straight');
  const hairStyle=gender==='male'?randomItem(['short tidy hair','slightly messy short hair','neatly cropped hair','a softly tousled cut','a simple side-parted cut']):randomItem(['shoulder-length hair','a simple bob','hair tied back plainly','loose shoulder-length hair','a neat side-parted style']);
  const buildDescriptor=weightedValue([{value:'a slim build',weight:24},{value:'an average build',weight:44},{value:'a stockier build',weight:14},{value:'a heavier build',weight:18}],'an average build');
  const faceDescriptor=weightedValue([{value:'a very ordinary, believable face',weight:36},{value:'a plain, everyday face',weight:22},{value:'a cheerful but ordinary face',weight:20},{value:'a slightly awkward-looking but endearing face',weight:22}],'a very ordinary, believable face');
  const featureDescriptor=randomItem(['soft chubby cheeks','slightly prominent ears','a scattering of freckles','a faint birthmark','glasses','a slightly gap-toothed smile','unruly hair','']);
  const clothingDescriptor=randomItem(['a plain T-shirt','a simple striped top','a knit jumper','a casual hoodie','a lightweight jacket over a T-shirt','a simple long-sleeved top'])||'a plain T-shirt';
  const backgroundDescriptor=randomItem(['a leafy park path','a back garden with greenery','a quiet playground','a schoolyard edge','a brick terrace street','a seaside promenade','a local football pitch sideline','a softly blurred woodland path','a quiet urban courtyard','a front garden by a low wall'])||'a leafy park path';
  const storySeed=weightedValue([
    {value:'WILDCARD — choose any imaginative genre, setting, period or reality level. Surprise us and do not default to an ordinary modern setting.',weight:24},
    {value:'high fantasy — castles, impossible landscapes, magic, quests or strange kingdoms, without needing to begin in the ordinary world',weight:7},
    {value:'space or science fiction — planets, spacecraft, alien environments, future cities, strange technology or cosmic-scale adventure',weight:7},
    {value:'time travel — any historical, prehistoric or future period, with the adventure genuinely taking place there',weight:7},
    {value:'prehistoric adventure — dinosaurs, ancient seas, ice ages or deep prehistory, with the child immersed in that world',weight:5},
    {value:'underwater or oceanic world — deep sea, reefs, submarines, drowned cities or impossible marine environments',weight:5},
    {value:'surreal impossible world — dream logic, bizarre scale, upside-down places, impossible physics or an entirely invented reality',weight:6},
    {value:'absurd comedy — a genuinely funny, escalating, ridiculous predicament rather than a conventional magical mystery',weight:6},
    {value:'historical adventure — a vivid past era, not merely a present-day museum or old object leading to clues',weight:5},
    {value:'giant or miniature scale — the child becomes tiny, enormous, or enters a world at radically different scale',weight:5},
    {value:'machines and invention — extraordinary vehicles, robots, contraptions or engineering-driven adventure',weight:5},
    {value:'wild environment — Arctic, desert, jungle, mountain, volcanic, cave or other visually dramatic natural setting',weight:5},
    {value:'inside another medium — the child enters a painting, book, map, game, photograph, film or other represented world',weight:4},
    {value:'mystery or puzzle — a strong mystery structure, but avoid another generic trail of clues through an ordinary neighbourhood',weight:4},
    {value:'transformation — the child or the world changes form in a surprising way and the consequences drive the plot',weight:4},
    {value:'an ordinary place becomes impossible — use sparingly; a familiar setting can transform, but make the transformation visually bold and distinctive',weight:5}
  ],'WILDCARD — choose any imaginative genre, setting, period or reality level.');
  try{
    const conceptPrompt=`Invent ONE completely fictional demo child for Moonbeam Stories marketing. This is not a real customer and must not be based on any real child.\n\nVARIETY SEED: ${varietySeed}\nExisting Cast first names to avoid if practical: ${existingNames.length?existingNames.join(', '):'none'}.\n\nThe demographic and visual brief is FIXED. Use it exactly:\n- age: ${age}\n- gender: "${gender}"\n- broad UK demographic bucket: ${broadCategory.label}\n- more specific profile: ${subProfile.label}\n- skin tone: ${skinTone}\n- hair: ${hairColour} ${hairTexture} hair, with ${hairStyle}\n- eyes: ${eyeColour}\n- body type: ${buildDescriptor}\n- face: ${faceDescriptor}${featureDescriptor?`; extra detail: ${featureDescriptor}`:''}\n- clothing: ${clothingDescriptor}\n- portrait background: ${backgroundDescriptor}\n\nRequirements:\n- choose a plausible FIRST NAME ONLY (no surname), suitable in contemporary Britain and fitting this profile;\n- write a concise appearance description that stays faithful to the fixed brief;\n- the child should look real and ordinary, not idealised, glamorous, airbrushed or model-like;\n- create ONE concise, imaginative, age-appropriate Moonbeam story idea using this story seed as a rough direction: ${storySeed};\n- the story must star ONLY this child; no adults, no parents, no siblings, no pets, no sidekick animals, and no crowd of characters;\n- avoid repeatedly using bedtime, stars, moonlight, treasure hunts, hair accessories, or the same generic fantasy trope.\n\nReturn JSON only with exactly this shape:\n{"name":"string","age":${age},"gender":"${gender}","appearance":"string","storyIdea":"string"}`;
    const conceptResponse=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.6-luna',input:conceptPrompt,max_output_tokens:700})});
    const raw=await conceptResponse.text();let data={};try{data=JSON.parse(raw)}catch{}
    if(!conceptResponse.ok)throw new Error(data?.error?.message||`Demo-child invention failed (${conceptResponse.status}).`);
    let output=typeof data.output_text==='string'?data.output_text:'';
    if(!output&&Array.isArray(data.output))for(const item of data.output||[])for(const part of item?.content||[])if(typeof part?.text==='string')output+=part.text;
    const concept=extractJsonObject(output)||{};
    const fallbackNames={male:['Sam','Leo','Noah','Oscar','Theo','Max','Arlo','Elliot','Isaac','Reuben','Zayn','Jude'],female:['Emily','Maya','Ava','Sofia','Amelia','Mila','Ruby','Nina','Layla','Elsie','Aisha','Zara']};
    let fallbackPool=(fallbackNames[gender]||[]).filter(n=>!existingNames.some(x=>String(x).toLowerCase()===String(n).toLowerCase()));
    if(!fallbackPool.length)fallbackPool=fallbackNames[gender]||['Sam'];
    const fallbackName=fallbackPool[crypto.randomInt(0,fallbackPool.length)];
    const rawName=String(concept.name||fallbackName).trim().replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'’-]/g,'').slice(0,28)||fallbackName;
    const lowerExisting=new Set(existingNames.map(x=>String(x).toLowerCase()));
    const name=lowerExisting.has(rawName.toLowerCase())?fallbackName:rawName;
    const fallbackAppearance=`${gender==='male'?'boy':'girl'} with ${skinTone}, ${eyeColour} eyes, ${hairColour} ${hairTexture} hair worn as ${hairStyle}, ${buildDescriptor}, ${faceDescriptor}${featureDescriptor?`, ${featureDescriptor}`:''}, wearing ${clothingDescriptor}.`;
    const appearance=String(concept.appearance||fallbackAppearance).replace(/\s+/g,' ').trim().slice(0,700)||fallbackAppearance;
    const fallbackStoryIdeas=[
      'The child wakes aboard a city-sized spacecraft drifting through the rings of Saturn and must work out why every machine has gone silent.',
      'A railway run by dinosaurs crosses a prehistoric jungle, and the child has to get the last train through before a volcanic storm arrives.',
      'The child shrinks to the size of a beetle and discovers an enormous civilisation living beneath the garden grass.',
      'A submarine descends beneath an ordinary sea and finds a bright underwater city built inside the skeleton of a colossal whale.',
      'The child steps into a painting and finds a country where every road, mountain and river is still being painted into existence.',
      'A ridiculous machine begins swapping the size of everything it touches, turning a biscuit enormous and a bus pocket-sized.',
      'The child is accidentally sent to a medieval city on the morning its clock tower starts predicting events before they happen.',
      'A robot taxi in a future city refuses to take the child home until they help solve why gravity keeps changing street by street.',
      'The child climbs into a cloud and finds an entire weather factory where the seasons have become mixed up.',
      'A mysterious staircase appears in the middle of the desert and leads upward into a floating world built from enormous kites.'
    ];
    const storyIdea=String(concept.storyIdea||fallbackStoryIdeas[crypto.randomInt(0,fallbackStoryIdeas.length)]).replace(/\s+/g,' ').trim().slice(0,500);
    await logUsage({event_type:'instagram_demo_profile',estimated_cost_gbp:0,metadata:{model:'gpt-5.6-luna',user_id:verified.user.id,age,gender,broad_category:broadCategory.label,sub_profile:subProfile.label,hair_colour:hairColour,eye_colour:eyeColour,background:backgroundDescriptor}});

    const portraitPrompt=`Create a high-quality PHOTOREALISTIC head-and-shoulders portrait photograph of ONE completely fictional ${age}-year-old ${gender==='male'?'boy':'girl'} named ${name}. This person must be invented and must not resemble or be based on any real child or public figure.\n\nUse this appearance faithfully: ${appearance}\n\nHard requirements:\n- believable ${broadCategory.label.toLowerCase()} / ${subProfile.label} appearance\n- relaxed friendly expression\n- believable skin, hair and eye texture\n- natural contemporary child clothing\n- soft natural daylight\n- camera at the child's eye level\n- background should be ${backgroundDescriptor}, slightly blurred with shallow depth of field\n- the child should look ordinary and real rather than glamorised or model-perfect\n- the child may look slim, average, stockier or heavier as stated; do not slim them down\n- keep any freckles, glasses, birthmarks, gap-toothed smile or other ordinary features if mentioned\n\nThe result should look like a normal high-quality family portrait photograph, not a fashion shoot, school ID photo, passport photo, poster, illustration, cartoon, 3D render or painting. The background must not be a plain white, plain grey or studio backdrop. No text, captions, logos, borders, signs, watermarks, props held toward camera, costumes, other people or animals. ${gender==='male'?'Do not add hair clips, bows, barrettes, decorative stars, tiaras or ornamental headbands. ':''}Do not beautify the child into a generic AI-perfect face.`;
    const imageResponse=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-2.5-flare',prompt:portraitPrompt,size:'1024x1024',quality:'medium',output_format:'jpeg'})});
    const imageRaw=await imageResponse.text();let imageData={};try{imageData=JSON.parse(imageRaw)}catch{}
    if(!imageResponse.ok)throw new Error(imageData?.error?.message||`Demo portrait failed (${imageResponse.status}).`);
    const item=Array.isArray(imageData.data)?imageData.data[0]:null;if(!item||typeof item.b64_json!=='string')throw new Error('The demo portrait service returned no image.');
    await logUsage({event_type:'image',estimated_cost_gbp:estimateGBP('image',{reference:false}),metadata:{model:'gpt-image-2.5-flare',user_id:verified.user.id,instagram_demo_portrait:true,synthetic:true,broad_category:broadCategory.label,sub_profile:subProfile.label}});
    return res.status(200).json({ok:true,profile:{name,age,gender,storyIdea,portraitDataUrl:`data:image/jpeg;base64,${item.b64_json}`,synthetic:true}});
  }catch(error){console.error('instagram auto demo profile',error);return res.status(502).json({ok:false,error:error?.message||'Could not invent the demo child.'});}
}
async function adminJson(url,options={}){
  const r=await fetch(url,options); const text=await r.text(); let data=null;
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error(data?.message||data?.error||`Moonbeam data request failed (${r.status}).`); return data;
}
function safeScheduleRow(row){
  if(!row)return null;return {id:row.id||null,enabled:row.enabled===true,frequency_days:Number(row.frequency_days)||0,timezone:String(row.timezone||'Europe/London'),local_time:String(row.local_time||'').slice(0,5),next_run_at:row.next_run_at||null,last_run_at:row.last_run_at||null,last_status:row.last_status||null,last_message:row.last_message||null,last_media_id:row.last_media_id||null};
}
async function getInstagramAutoSchedule(ownerId){
  const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/instagram_auto_schedule?owner_id=eq.${encodeURIComponent(ownerId)}&select=id,enabled,frequency_days,timezone,local_time,next_run_at,last_run_at,last_status,last_message,last_media_id&limit=1`,{headers:adminHeaders()});
  return safeScheduleRow(Array.isArray(rows)?rows[0]:null);
}
async function developerInstagramAutoScheduleGet(req,res){
  const verified=await verifyDeveloper(req);if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  try{return res.status(200).json({ok:true,schedule:await getInstagramAutoSchedule(verified.user.id)})}catch(error){console.error('instagram schedule get',error);return res.status(502).json({error:error?.message||'Could not load the automatic posting schedule.'})}
}
async function developerInstagramAutoScheduleSave(req,res,body={}){
  const verified=await verifyDeveloper(req);if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  try{
    const frequencyDays=Math.max(0,Math.min(30,Math.round(Number(body.frequencyDays)||0)));
    const next=new Date(String(body.nextRunAt||''));if(!Number.isFinite(next.getTime())||next.getTime()<=Date.now()+30000)return res.status(400).json({error:'Choose a future date and time.'});
    const timezone=String(body.timezone||'Europe/London').trim().slice(0,80)||'Europe/London';
    const localTime=/^\d{2}:\d{2}$/.test(String(body.localTime||''))?String(body.localTime):new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:timezone}).format(next).replace('.',':');
    const payload={owner_id:verified.user.id,enabled:true,frequency_days:frequencyDays,timezone,local_time:localTime,next_run_at:next.toISOString(),locked_at:null,last_status:'scheduled',last_message:'Automatic Reel scheduled.',updated_at:new Date().toISOString()};
    await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/instagram_auto_schedule?on_conflict=owner_id`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(payload)});
    await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/rpc/ensure_instagram_auto_cron`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json'}),body:'{}'});
    return res.status(200).json({ok:true,schedule:await getInstagramAutoSchedule(verified.user.id)});
  }catch(error){console.error('instagram schedule save',error);return res.status(502).json({error:error?.message||'Could not save the automatic posting schedule.'})}
}
async function developerInstagramAutoScheduleStop(req,res){
  const verified=await verifyDeveloper(req);if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  try{
    await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/instagram_auto_schedule?owner_id=eq.${encodeURIComponent(verified.user.id)}`,{method:'PATCH',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify({enabled:false,next_run_at:null,locked_at:null,last_status:'stopped',last_message:'Automatic posting stopped.',updated_at:new Date().toISOString()})});
    return res.status(200).json({ok:true,schedule:await getInstagramAutoSchedule(verified.user.id)});
  }catch(error){console.error('instagram schedule stop',error);return res.status(502).json({error:error?.message||'Could not stop automatic posting.'})}
}
async function claimInstagramAutoSchedule(){
  const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/rpc/claim_due_instagram_auto_schedule`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json'}),body:'{}'});
  return Array.isArray(rows)?rows[0]:null;
}
async function finishInstagramAutoSchedule(id,success,message='',mediaId=''){
  if(!id)return;try{await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/rpc/finish_instagram_auto_schedule`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json'}),body:JSON.stringify({p_id:id,p_success:!!success,p_message:String(message||'').slice(0,1000),p_media_id:String(mediaId||'').slice(0,200)})})}catch(error){console.error('instagram schedule finish',error)}
}
async function generateDeveloperMagicLink(){
  const email=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();if(!email)throw new Error('MOONBEAM_DEVELOPER_EMAIL is not configured.');
  const data=await adminJson(`${ADMIN_SUPABASE_URL}/auth/v1/admin/generate_link`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json'}),body:JSON.stringify({type:'magiclink',email,redirect_to:`${SITE_URL}/?instagramAutoCloud=1`})});
  const actionLink=String(data?.action_link||data?.properties?.action_link||'').trim();if(!actionLink)throw new Error('Supabase did not return a developer sign-in link.');return actionLink;
}
function instagramAutoRunTokenHash(token){return crypto.createHash('sha256').update(String(token||'')).digest('hex')}
async function patchInstagramAutoSchedule(id,payload){
  if(!id)return;await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/instagram_auto_schedule?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify({...payload,updated_at:new Date().toISOString()})});
}
const INSTAGRAM_AUTO_SANDBOX_RUNNER=`import puppeteer from 'puppeteer';
const startUrl=process.env.MOONBEAM_AUTO_START_URL;
const callbackUrl=process.env.MOONBEAM_AUTO_CALLBACK_URL;
const scheduleId=process.env.MOONBEAM_AUTO_SCHEDULE_ID;
const runToken=process.env.MOONBEAM_AUTO_RUN_TOKEN;
const sandboxName=process.env.MOONBEAM_AUTO_SANDBOX_NAME;
async function callback(payload){
  const r=await fetch(callbackUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scheduleId,runToken,sandboxName,...payload})});
  if(!r.ok)throw new Error('Moonbeam completion callback failed ('+r.status+').');
}
let browser=null;
try{
  if(!startUrl||!callbackUrl||!scheduleId||!runToken)throw new Error('Automatic Reel runner configuration is incomplete.');
  browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:9*60*1000});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:1200,deviceScaleFactor:1});
  page.setDefaultTimeout(45000);page.setDefaultNavigationTimeout(45000);
  page.on('console',msg=>{const t=msg.type();if(t==='error'||t==='warning')console.log('moonbeam sandbox browser '+t+': '+msg.text())});
  await page.goto(startUrl,{waitUntil:'networkidle2',timeout:45000});
  await page.waitForFunction(()=>typeof generateAutomaticInstagramReel==='function'&&typeof currentUser!=='undefined'&&!!currentUser?.id,{timeout:45000});
  const result=await page.evaluate(async()=>await generateAutomaticInstagramReel());
  if(!result?.ok)throw new Error(result?.error||'The cloud browser did not complete the automatic Reel.');
  await callback({success:true,message:'Automatic Reel posted'+(result.childName?' for '+result.childName:'' )+'.',mediaId:result.mediaId||''});
}catch(error){
  console.error('moonbeam automatic Reel sandbox',error);
  try{await callback({success:false,message:error?.message||String(error),mediaId:''})}catch(callbackError){console.error('moonbeam automatic Reel callback',callbackError)}
}finally{
  if(browser)await browser.close().catch(()=>{});
}
`;
async function ensureInstagramAutoSandbox(){
  const {Sandbox}=await import('@vercel/sandbox');
  const cacheDir='/vercel/sandbox/.cache/puppeteer';
  const sandbox=await Sandbox.getOrCreate({
    name:'moonbeam-instagram-auto-v2',runtime:'node24',timeout:10*60*1000,
    onCreate:async(sbx)=>{
      await sbx.writeFiles([{path:'/vercel/sandbox/package.json',content:Buffer.from(JSON.stringify({private:true,type:'module',dependencies:{puppeteer:'25.11.0'}},null,2))}]);
      const install=await sbx.runCommand({cmd:'npm',args:['install','--no-audit','--no-fund'],cwd:'/vercel/sandbox',env:{PUPPETEER_CACHE_DIR:cacheDir}});
      if(install.exitCode!==0)throw new Error(`Could not prepare the Moonbeam cloud browser package: ${String(await install.stderr()).slice(0,700)}`);
      const deps=await sbx.runCommand({cmd:'npx',args:['puppeteer','browsers','install','chrome','--install-deps'],cwd:'/vercel/sandbox',sudo:true,env:{PUPPETEER_CACHE_DIR:cacheDir}});
      if(deps.exitCode!==0)throw new Error(`Could not install the Moonbeam cloud browser system libraries: ${String(await deps.stderr()).slice(0,900)}`);
    }
  });
  const preflightCode=`import puppeteer from 'puppeteer';let b;try{b=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],protocolTimeout:30000});console.log('MOONBEAM_BROWSER_READY')}finally{if(b)await b.close().catch(()=>{})}`;
  const preflight=await sandbox.runCommand({cmd:'node',args:['--input-type=module','-e',preflightCode],cwd:'/vercel/sandbox',env:{PUPPETEER_CACHE_DIR:cacheDir}});
  if(preflight.exitCode!==0)throw new Error(`Moonbeam cloud browser preflight failed: ${String(await preflight.stderr()).slice(0,900)}`);
  await sandbox.writeFiles([{path:'/vercel/sandbox/moonbeam-auto-runner.mjs',content:Buffer.from(INSTAGRAM_AUTO_SANDBOX_RUNNER)}]);
  return sandbox;
}
async function launchInstagramAutoSandbox(claimed){
  const runToken=crypto.randomBytes(32).toString('hex');
  const actionLink=await generateDeveloperMagicLink();
  const sandbox=await ensureInstagramAutoSandbox();
  await patchInstagramAutoSchedule(claimed.id,{run_token_hash:instagramAutoRunTokenHash(runToken),run_sandbox_name:sandbox.name,last_message:'Automatic Reel handed to the 10-minute cloud runner.'});
  const command=await sandbox.runCommand({
    cmd:'node',args:['moonbeam-auto-runner.mjs'],cwd:'/vercel/sandbox',detached:true,
    env:{PUPPETEER_CACHE_DIR:'/vercel/sandbox/.cache/puppeteer',MOONBEAM_AUTO_START_URL:actionLink,MOONBEAM_AUTO_CALLBACK_URL:`${SITE_URL}/api/resend-inbound?action=instagram-auto-job-finish`,MOONBEAM_AUTO_SCHEDULE_ID:String(claimed.id),MOONBEAM_AUTO_RUN_TOKEN:runToken,MOONBEAM_AUTO_SANDBOX_NAME:String(sandbox.name||'')}
  });
  if(command?.exitCode!=null&&command.exitCode!==0)throw new Error('The Moonbeam cloud runner could not be started.');
  return {sandboxName:sandbox.name};
}
async function stopInstagramAutoSandbox(name){
  if(!name)return;try{const {Sandbox}=await import('@vercel/sandbox');const sandbox=await Sandbox.get({name:String(name)});if(sandbox)await sandbox.stop()}catch(error){console.warn('Moonbeam sandbox stop',error?.message||error)}
}
async function developerInstagramAutoJobFinish(req,res,body={}){
  const scheduleId=String(body?.scheduleId||'').trim(),runToken=String(body?.runToken||'').trim();
  if(!scheduleId||!runToken)return res.status(400).json({error:'Missing automatic Reel completion token.'});
  try{
    const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/instagram_auto_schedule?id=eq.${encodeURIComponent(scheduleId)}&select=id,run_token_hash,run_sandbox_name,last_status&limit=1`,{headers:adminHeaders()});
    const row=Array.isArray(rows)?rows[0]:null;if(!row?.id||!row?.run_token_hash)return res.status(404).json({error:'This automatic Reel run is no longer active.'});
    const actual=instagramAutoRunTokenHash(runToken),expected=String(row.run_token_hash||'');
    const valid=actual.length===expected.length&&crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(expected));
    if(!valid)return res.status(403).json({error:'Invalid automatic Reel completion token.'});
    const success=body?.success===true,message=String(body?.message||'').slice(0,1000),mediaId=String(body?.mediaId||'').slice(0,200);
    await finishInstagramAutoSchedule(row.id,success,message,mediaId);
    res.status(200).json({ok:true});
    await stopInstagramAutoSandbox(row.run_sandbox_name||body?.sandboxName||'');
    return;
  }catch(error){console.error('instagram automatic sandbox finish',error);return res.status(502).json({error:error?.message||'Could not finish the automatic Instagram Reel job.'})}
}
async function developerInstagramAutoCron(req,res){
  let claimed=null;
  try{
    claimed=await claimInstagramAutoSchedule();if(!claimed)return res.status(200).json({ok:true,due:false});
    const launched=await launchInstagramAutoSandbox(claimed);
    return res.status(200).json({ok:true,due:true,started:true,sandbox:launched?.sandboxName||null});
  }catch(error){console.error('instagram automatic cloud launch',error);if(claimed?.id)await finishInstagramAutoSchedule(claimed.id,false,error?.message||String(error),'');return res.status(502).json({ok:false,due:!!claimed,error:error?.message||'Automatic Instagram Reel could not be started.'})}
}
function shareTokenHash(token){return crypto.createHash('sha256').update(String(token)).digest('hex')}
async function waitForInstagramContainer(creationId,accessToken,label='Instagram media'){
  const deadline=Date.now()+30000;
  let lastStatus='';
  while(Date.now()<deadline){
    const status=await instagramJson(`https://graph.instagram.com/v26.0/${encodeURIComponent(creationId)}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`,{headers:{Accept:'application/json'}});
    lastStatus=String(status?.status_code||status?.status||'').toUpperCase();
    if(lastStatus==='FINISHED'||lastStatus==='PUBLISHED')return status;
    if(lastStatus==='ERROR'||lastStatus==='EXPIRED')throw new Error(`${label} could not be prepared (${lastStatus.toLowerCase()}).`);
    await new Promise(resolve=>setTimeout(resolve,1500));
  }
  throw new Error(`${label} is still being prepared${lastStatus?` (${lastStatus.toLowerCase()})`:''}. Please try again.`);
}
function decodeInstagramJpegDataUrl(value,label='The approved Instagram image',maxBytes=2900000){
 const m=String(value||'').match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=\r\n]+)$/);if(!m)throw new Error(`${label} is missing or is not a JPEG.`);
 const bytes=Buffer.from(m[1].replace(/\s/g,''),'base64');if(!bytes.length||bytes.length>maxBytes)throw new Error(`${label} is too large.`);
 return bytes;
}
async function verifyInstagramJpegBytes(bytes,label='The approved Instagram image'){
 const sharp=require('sharp');const meta=await sharp(bytes,{failOn:'error'}).metadata();
 if(meta.format!=='jpeg'||Number(meta.width)!==1080||Number(meta.height)!==1350)throw new Error(`${label} failed the 1080 × 1350 JPEG check.`);
 return crypto.createHash('sha256').update(bytes).digest('hex');
}
function xmlEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function collapseWhitespace(value){return String(value||'').replace(/\s+/g,' ').trim();}
function instagramHeroCaptionName(assets={}){const names=Array.isArray(assets.heroNames)?assets.heroNames.map(n=>collapseWhitespace(n)).filter(Boolean).slice(0,2):[];if(!names.length)return 'your child';if(names.length===1)return names[0];return `${names[0]} and ${names[1]}`}
function instagramCarouselCaption(story){const title=collapseWhitespace(story?.title)||'A Moonbeam Story',hero=instagramHeroCaptionName(story?.saved_assets||{});return `${title} ✨\n\nA personalised Moonbeam story starring ${hero}.\n\nSwipe through to start the adventure, then read the full story via the link in our bio.\n\nCreate personalised, illustrated stories starring your own child at moonbeamstories.co.uk\n\n#MoonbeamStories #PersonalisedStories #ChildrensBooks #BedtimeStories #Parenting`}
function wrapWords(text,maxChars){
  const words=collapseWhitespace(text).split(' ').filter(Boolean); if(!words.length)return [''];
  const lines=[]; let line='';
  for(const word of words){
    const next=line?`${line} ${word}`:word;
    if(!line||next.length<=maxChars){line=next;continue}
    lines.push(line); line=word;
  }
  if(line)lines.push(line);
  return lines;
}
function textSlideLayout(text){
  const clean=collapseWhitespace(text);
  let fontSize=56;
  if(clean.length>360)fontSize=52;
  if(clean.length>500)fontSize=48;
  if(clean.length>660)fontSize=44;
  if(clean.length>820)fontSize=40;
  let lines=[];
  while(fontSize>=34){
    const maxChars=Math.max(22,Math.floor(780/(fontSize*0.56)));
    lines=wrapWords(clean,maxChars);
    const lineHeight=Math.round(fontSize*1.45);
    if(lines.length<=15 && lines.length*lineHeight<=760)return {fontSize,lineHeight,lines};
    fontSize-=2;
  }
  const maxChars=Math.max(24,Math.floor(780/(34*0.56)));
  lines=wrapWords(clean,maxChars);
  if(lines.length>15){
    const trimmed=[];
    for(let i=0;i<15;i++)trimmed.push(lines[i]||'');
    if(lines.length>15){const last=trimmed[14].replace(/[\s\u2026.]+$/,'');trimmed[14]=`${last}…`;}
    lines=trimmed;
  }
  return {fontSize:34,lineHeight:49,lines};
}
async function renderInstagramTextSlide(text,pageNumber){
  const sharp=require('sharp');
  const width=1080,height=1350;
  const {fontSize,lineHeight,lines}=textSlideLayout(text);
  const textStartY=265;
  const textSvg=lines.map((line,i)=>`<tspan x="540" y="${textStartY+i*lineHeight}">${xmlEscape(line)}</tspan>`).join('');
  const svg=`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#f7f0df"/>
    <rect x="42" y="42" width="996" height="1266" rx="28" fill="#fffaf2" stroke="#b6904d" stroke-width="4"/>
    <rect x="74" y="74" width="932" height="1202" rx="22" fill="none" stroke="#d9be86" stroke-width="2.5"/>
    <text x="540" y="126" text-anchor="middle" fill="#8d6b35" font-family="Georgia, Times New Roman, serif" font-size="34" font-weight="700">❦</text>
    <line x1="190" y1="118" x2="455" y2="118" stroke="#d9be86" stroke-width="2"/>
    <line x1="625" y1="118" x2="890" y2="118" stroke="#d9be86" stroke-width="2"/>
    <text x="110" y="170" fill="#c7a15a" font-family="Georgia, Times New Roman, serif" font-size="28">✦</text>
    <text x="970" y="170" text-anchor="end" fill="#c7a15a" font-family="Georgia, Times New Roman, serif" font-size="28">✦</text>
    <text x="540" y="210" text-anchor="middle" fill="#5c4a2b" font-family="Georgia, Times New Roman, serif" font-size="26" font-style="italic">Page ${Number(pageNumber)||1}</text>
    <text x="540" text-anchor="middle" fill="#2e2740" font-family="Georgia, Times New Roman, serif" font-size="${fontSize}" font-weight="500">${textSvg}</text>
    <line x1="190" y1="1194" x2="455" y2="1194" stroke="#d9be86" stroke-width="2"/>
    <line x1="625" y1="1194" x2="890" y2="1194" stroke="#d9be86" stroke-width="2"/>
    <text x="540" y="1206" text-anchor="middle" fill="#8d6b35" font-family="Georgia, Times New Roman, serif" font-size="34" font-weight="700">❦</text>
    <text x="540" y="1272" text-anchor="middle" fill="#7a6848" font-family="Georgia, Times New Roman, serif" font-size="24">${Number(pageNumber)||1}</text>
  </svg>`;
  return await sharp(Buffer.from(svg)).jpeg({quality:92}).toBuffer();
}
const INSTAGRAM_CTA_COPY={
  'en-GB':{continued:['To be','continued…'],read:'Read the whole story',bio:'at the link in our bio.'},
  'en-US':{continued:['To be','continued…'],read:'Read the whole story',bio:'at the link in our bio.'},
  'es-ES':{continued:['Continuará…'],read:'Lee la historia completa',bio:'en el enlace de nuestra bio.'},
  'es-419':{continued:['Continuará…'],read:'Lee la historia completa',bio:'en el enlace de nuestra bio.'},
  'fr-FR':{continued:['À suivre…'],read:'Lisez toute l’histoire',bio:'via le lien dans notre bio.'},
  'de-DE':{continued:['Fortsetzung folgt…'],read:'Lies die ganze Geschichte',bio:'über den Link in unserer Bio.'},
  'it-IT':{continued:['Continua…'],read:'Leggi tutta la storia',bio:'dal link nella nostra bio.'},
  'pt-BR':{continued:['Continua…'],read:'Leia a história completa',bio:'no link da nossa bio.'},
  'pl-PL':{continued:['Ciąg dalszy nastąpi…'],read:'Przeczytaj całą historię',bio:'pod linkiem w naszym bio.'}
};
async function renderInstagramCtaSlide(locale='en-GB'){
  const sharp=require('sharp');
  const width=1080,height=1350;
  const copy=INSTAGRAM_CTA_COPY[locale]||INSTAGRAM_CTA_COPY['en-GB'];
  const continuedLines=Array.isArray(copy.continued)?copy.continued:[String(copy.continued||'')];
  const continuedY=continuedLines.length>1?[490,575]:[540];
  const continuedSvg=continuedLines.map((line,i)=>`<text x="540" y="${continuedY[i]||540}" text-anchor="middle" fill="#2e2740" font-family="Georgia, Times New Roman, serif" font-size="${continuedLines.length>1?74:68}" font-weight="700">${xmlEscape(line)}</text>`).join('');
  const svg=`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#f7f0df"/>
    <rect x="42" y="42" width="996" height="1266" rx="28" fill="#fffaf2" stroke="#b6904d" stroke-width="4"/>
    <rect x="74" y="74" width="932" height="1202" rx="22" fill="none" stroke="#d9be86" stroke-width="2.5"/>
    <text x="540" y="200" text-anchor="middle" fill="#8d6b35" font-family="Georgia, Times New Roman, serif" font-size="36" font-weight="700">❦</text>
    ${continuedSvg}
    <text x="540" y="705" text-anchor="middle" fill="#5c4a2b" font-family="Georgia, Times New Roman, serif" font-size="38" font-style="italic">${xmlEscape(copy.read)}</text>
    <text x="540" y="765" text-anchor="middle" fill="#5c4a2b" font-family="Georgia, Times New Roman, serif" font-size="38" font-style="italic">${xmlEscape(copy.bio)}</text>
    <line x1="190" y1="960" x2="455" y2="960" stroke="#d9be86" stroke-width="2"/>
    <line x1="625" y1="960" x2="890" y2="960" stroke="#d9be86" stroke-width="2"/>
    <text x="540" y="972" text-anchor="middle" fill="#8d6b35" font-family="Georgia, Times New Roman, serif" font-size="36" font-weight="700">❦</text>
    <text x="540" y="1090" text-anchor="middle" fill="#7a6848" font-family="Georgia, Times New Roman, serif" font-size="30" font-style="italic">Moonbeam Stories</text>
  </svg>`;
  return await sharp(Buffer.from(svg)).jpeg({quality:92}).toBuffer();
}
async function renderInstagramIllustrationSlide(sourceBytes){
  const sharp=require('sharp');
  const width=1080,height=1350;
  const framed=await sharp(sourceBytes).resize({width:900,height:900,fit:'contain',background:{r:255,g:255,b:255,alpha:0}}).png().toBuffer();
  const matteSvg=`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#f6efe0"/>
    <rect x="88" y="152" width="904" height="904" rx="18" fill="#fffdf8"/>
    <rect x="88" y="152" width="904" height="904" rx="18" fill="none" stroke="#d9be86" stroke-width="3"/>
    <rect x="72" y="136" width="936" height="936" rx="24" fill="none" stroke="#b6904d" stroke-width="2" opacity="0.82"/>
  </svg>`;
  return await sharp(Buffer.from(matteSvg)).composite([{input:framed,top:154,left:90}]).jpeg({quality:92}).toBuffer();
}
async function uploadSavedStoryArt(path,bytes,contentType='image/jpeg'){
  const r=await fetch(`${ADMIN_SUPABASE_URL}/storage/v1/object/saved-story-art/${path.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:adminHeaders({'Content-Type':contentType,'x-upsert':'true'}),body:bytes});
  if(!r.ok)throw new Error(`Could not store ${path}.`);
}
async function deleteSavedStoryArt(paths=[]){
  for(const path of (paths||[])){
    if(!path)continue;
    try{await fetch(`${ADMIN_SUPABASE_URL}/storage/v1/object/saved-story-art/${String(path).split('/').map(encodeURIComponent).join('/')}`,{method:'DELETE',headers:adminHeaders()})}catch{}
  }
}
async function fetchSavedStoryArt(path){
  const r=await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/saved-story-art/${String(path).split('/').map(encodeURIComponent).join('/')}`,{headers:adminHeaders()});
  if(!r.ok)throw new Error(`Could not load ${path}.`);
  return Buffer.from(await r.arrayBuffer());
}
async function createInstagramImageContainer(accountId,accessToken,imageUrl){
  const createBody=new URLSearchParams({image_url:imageUrl,is_carousel_item:'true',access_token:accessToken});
  const created=await instagramJson(`https://graph.instagram.com/v26.0/${encodeURIComponent(accountId)}/media`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:createBody.toString()});
  const creationId=String(created?.id||'').trim();
  if(!creationId)throw new Error('Instagram did not return a media container ID.');
  return creationId;
}
async function createInstagramCarouselContainer(accountId,accessToken,children,caption){
  const createBody=new URLSearchParams({media_type:'CAROUSEL',children:children.join(','),caption,access_token:accessToken});
  const created=await instagramJson(`https://graph.instagram.com/v26.0/${encodeURIComponent(accountId)}/media`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:createBody.toString()});
  const creationId=String(created?.id||'').trim();
  if(!creationId)throw new Error('Instagram did not return a carousel container ID.');
  return creationId;
}

async function developerInstagramPublishStory(req,res,body){
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  const accessToken=String(process.env.INSTAGRAM_ACCESS_TOKEN||'').trim(), accountId=String(process.env.INSTAGRAM_ACCOUNT_ID||'').trim();
  if(!accessToken||!accountId)return res.status(503).json({error:'Instagram is not configured in Vercel.'});
  const storyId=String(body?.storyId||'').trim(); if(!storyId)return res.status(400).json({error:'Story id is required.'});
  let coverBytes,coverHash;try{coverBytes=decodeInstagramJpegDataUrl(body?.coverDataUrl,'The approved Instagram cover');coverHash=await verifyInstagramJpegBytes(coverBytes,'The approved Instagram cover')}catch(error){return res.status(400).json({error:error?.message||'The approved Instagram cover is invalid.'})}
  let textSlideBytes=null,ctaBytesFromClient=null;
  try{
    if(Array.isArray(body?.textSlideDataUrls)&&body.textSlideDataUrls.length===4){
      textSlideBytes=[];
      for(let i=0;i<4;i++){
        const bytes=decodeInstagramJpegDataUrl(body.textSlideDataUrls[i],`Instagram text slide ${i+1}`);
        await verifyInstagramJpegBytes(bytes,`Instagram text slide ${i+1}`);
        textSlideBytes.push(bytes);
      }
    }
    if(body?.ctaDataUrl){
      ctaBytesFromClient=decodeInstagramJpegDataUrl(body.ctaDataUrl,'The Instagram carousel ending slide');
      await verifyInstagramJpegBytes(ctaBytesFromClient,'The Instagram carousel ending slide');
    }
  }catch(error){return res.status(400).json({error:error?.message||'One or more Instagram carousel slides are invalid.'})}
  let shareId=null,coverPath=null,shareCreated=false;
  const uploadedPaths=[];
  try{
    const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/saved_stories?id=eq.${encodeURIComponent(storyId)}&parent_id=eq.${encodeURIComponent(verified.user.id)}&select=id,title,language,opening,pages,closing,saved_assets`,{headers:adminHeaders()});
    const story=Array.isArray(rows)?rows[0]:null; if(!story)return res.status(404).json({error:'That saved story is unavailable.'});
    const assets=story.saved_assets||{}; if(!assets.cover||!Array.isArray(assets.pages)||assets.pages.length<4)return res.status(409).json({error:'Save the complete illustrated story before posting it.'});
    const storyPages=[collapseWhitespace(story.opening||''), collapseWhitespace(story.pages?.[0]?.text||''), collapseWhitespace(story.pages?.[1]?.text||''), collapseWhitespace(story.pages?.[2]?.text||'')];
    if(storyPages.some(x=>!x))return res.status(409).json({error:'This story needs at least four readable pages before it can be posted to Instagram.'});
    const galleryMarker='instagram@moonbeamstories.co.uk';
    const existingShares=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?owner_id=eq.${encodeURIComponent(verified.user.id)}&saved_story_id=eq.${encodeURIComponent(storyId)}&recipient_email=eq.${encodeURIComponent(galleryMarker)}&revoked_at=is.null&select=id,recipient_name&order=created_at.desc&limit=1`,{headers:adminHeaders()});
    const existingShare=Array.isArray(existingShares)?existingShares[0]:null;
    let token='';
    if(existingShare?.id&&String(existingShare.recipient_name||'').trim()){
      shareId=existingShare.id;token=String(existingShare.recipient_name).trim();
    }else{
      token=crypto.randomBytes(32).toString('base64url');
      const createdShare=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({owner_id:verified.user.id,saved_story_id:storyId,token_hash:shareTokenHash(token),sender_name:'Moonbeam Stories',recipient_name:token,recipient_email:galleryMarker})});
      shareId=createdShare?.[0]?.id;shareCreated=true;if(!shareId)throw new Error('Could not create the public story link.');
    }
    coverPath=`instagram-covers/${shareId}.jpg`;
    await uploadSavedStoryArt(coverPath,coverBytes,'image/jpeg');
    uploadedPaths.push(coverPath);
    const origin='https://www.moonbeamstories.co.uk';
    const slideSpecs=[];
    const coverUrl=`${origin}/api/share?action=asset&token=${encodeURIComponent(token)}&kind=instagram-cover&v=25052&cb=${Date.now()}`;
    const publicCover=await fetch(coverUrl,{headers:{Accept:'image/jpeg'},cache:'no-store'}); if(!publicCover.ok)throw new Error('The finished cover could not be verified from Moonbeam’s public image URL.');
    const publicBytes=Buffer.from(await publicCover.arrayBuffer()), publicHash=crypto.createHash('sha256').update(publicBytes).digest('hex'); if(publicHash!==coverHash)throw new Error('The public Instagram cover does not exactly match the approved preview.');
    slideSpecs.push({label:'cover',url:coverUrl});
    for(let i=0;i<4;i++){
      const textBytes=(textSlideBytes&&textSlideBytes[i])?textSlideBytes[i]:await renderInstagramTextSlide(storyPages[i],i+1);
      const textPath=`instagram-carousel/${shareId}/slide-${(i*2)+1}.jpg`;
      await uploadSavedStoryArt(textPath,textBytes,'image/jpeg');
      uploadedPaths.push(textPath);
      const illustrationBytes=await fetchSavedStoryArt(assets.pages[i]);
      const illustrationSlideBytes=await renderInstagramIllustrationSlide(illustrationBytes);
      const illustrationPath=`instagram-carousel/${shareId}/slide-${(i*2)+2}.jpg`;
      await uploadSavedStoryArt(illustrationPath,illustrationSlideBytes,'image/jpeg');
      uploadedPaths.push(illustrationPath);
    }
    const ctaBytes=ctaBytesFromClient||await renderInstagramCtaSlide(story.language||'en-GB');
    const ctaPath=`instagram-carousel/${shareId}/slide-9.jpg`;
    await uploadSavedStoryArt(ctaPath,ctaBytes,'image/jpeg');
    uploadedPaths.push(ctaPath);
    for(let n=1;n<=9;n++){
      const url=`${origin}/api/share?action=asset&token=${encodeURIComponent(token)}&kind=instagram-slide-${n}&v=25052&cb=${Date.now()}-${n}`;
      const check=await fetch(url,{headers:{Accept:'image/jpeg'},cache:'no-store'});
      if(!check.ok)throw new Error(`Instagram slide ${n+1} could not be verified from Moonbeam’s public image URL.`);
      slideSpecs.push({label:`slide ${n+1}`,url});
    }
    const childIds=[];
    for(let i=0;i<slideSpecs.length;i++){
      const childId=await createInstagramImageContainer(accountId,accessToken,slideSpecs[i].url);
      await waitForInstagramContainer(childId,accessToken,`Instagram carousel ${slideSpecs[i].label}`);
      childIds.push(childId);
    }
    const caption=instagramCarouselCaption(story);
    const carouselId=await createInstagramCarouselContainer(accountId,accessToken,childIds,caption);
    await waitForInstagramContainer(carouselId,accessToken,'Instagram carousel');
    const publishBody=new URLSearchParams({creation_id:carouselId,access_token:accessToken});
    const published=await instagramJson(`https://graph.instagram.com/v26.0/${encodeURIComponent(accountId)}/media_publish`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:publishBody.toString()});
    const mediaId=String(published?.id||'').trim(); if(!mediaId)throw new Error('Instagram did not return a published media ID.');
    return res.status(200).json({ok:true,mediaId,galleryUrl:`${origin}/instagram`,readerUrl:`${origin}/shared/${encodeURIComponent(token)}`});
  }catch(error){
    if(shareCreated){
      await deleteSavedStoryArt(uploadedPaths.reverse());
      if(shareId){try{await fetch(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(shareId)}`,{method:'DELETE',headers:adminHeaders({Prefer:'return=minimal'})})}catch{}}
    }
    console.error('instagram story publish',error); return res.status(502).json({ok:false,error:error?.message||'Could not publish this story to Instagram.'});
  }
}

async function developerInstagramGalleryRemove(req,res,body){
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  const shareId=String(body?.shareId||'').trim(); if(!shareId)return res.status(400).json({error:'Gallery entry id is required.'});
  try{
    const marker='instagram@moonbeamstories.co.uk';
    const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(shareId)}&owner_id=eq.${encodeURIComponent(verified.user.id)}&recipient_email=eq.${encodeURIComponent(marker)}&revoked_at=is.null&select=id`,{headers:adminHeaders()});
    if(!Array.isArray(rows)||!rows.length)return res.status(404).json({error:'That gallery entry is unavailable.'});
    await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(shareId)}&owner_id=eq.${encodeURIComponent(verified.user.id)}`,{method:'PATCH',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify({revoked_at:new Date().toISOString()})});
    return res.status(200).json({ok:true});
  }catch(error){console.error('instagram gallery remove',error);return res.status(502).json({error:error?.message||'Could not remove this story from the gallery.'});}
}

async function developerReply(req,res,body){
  const verified=await verifyDeveloper(req); if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  if(!RESEND_API_KEY)return res.status(503).json({error:'RESEND_API_KEY is not configured.'});
  const sourceId=String(body?.sourceId||'').trim();
  const replyText=String(body?.text||'').trim();
  if(!sourceId||!replyText)return res.status(400).json({error:'Choose a message and enter a reply.'});
  try{
    const original=await getReceivedEmail(sourceId);
    const mailbox=inboundMailbox(original);
    if(!mailbox)return res.status(400).json({error:'The original message is not a Moonbeam support email.'});
    const to=firstReplyAddress(original);
    if(!to)return res.status(400).json({error:'The sender does not have a valid reply address.'});
    const subject=/^re:/i.test(String(original.subject||''))?String(original.subject):`Re: ${String(original.subject||'(No subject)')}`;
    const headers={};
    if(original.message_id){headers['In-Reply-To']=String(original.message_id);headers['References']=String(original.message_id);}
    const resend=new Resend(RESEND_API_KEY);
    const {data,error}=await resend.emails.send({
      from:'Richard — Moonbeam Stories <richard@moonbeamstories.co.uk>',to:[to],replyTo:'support@moonbeamstories.co.uk',subject,
      text:replyText,
      html:`<div style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.5">${escapeHtml(replyText)}</div>`,
      ...(Object.keys(headers).length?{headers}:{})
    });
    if(error)throw new Error(error.message||'Could not send reply.');
    return res.status(200).json({sent:true,id:data?.id||null,to,from:'richard@moonbeamstories.co.uk'});
  }catch(error){console.error('support inbox reply',error);return res.status(502).json({error:error?.message||'Could not send reply.'});}
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const action=String(req.query?.action||'').trim().toLowerCase();
  if(req.method==='GET' && (action==='list'||action==='message'))return developerGet(req,res,action);
  if(req.method==='GET' && action==='instagram-test')return developerInstagramTest(req,res);
  if(req.method==='GET' && action==='instagram-access')return developerInstagramAccess(req,res);
  if(req.method==='GET' && action==='instagram-auto-schedule')return developerInstagramAutoScheduleGet(req,res);
  if(req.method==='GET' && action==='instagram-auto-cron')return developerInstagramAutoCron(req,res);
  if(req.method==='POST' && action==='instagram-publish-test')return developerInstagramPublishTest(req,res);
  if(req.method==='POST' && action==='instagram-auto-schedule-save'){
    let body=req.body;if(!body||typeof body!=='object'){try{body=JSON.parse(await rawBody(req)||'{}')}catch{return res.status(400).json({error:'Invalid JSON.'})}}
    return developerInstagramAutoScheduleSave(req,res,body);
  }
  if(req.method==='POST' && action==='instagram-auto-schedule-stop')return developerInstagramAutoScheduleStop(req,res);
  if(req.method==='POST' && action==='instagram-auto-job-finish'){
    let body=req.body;if(!body||typeof body!=='object'){try{body=JSON.parse(await rawBody(req)||'{}')}catch{return res.status(400).json({error:'Invalid JSON.'})}}
    return developerInstagramAutoJobFinish(req,res,body);
  }
  if(req.method==='POST' && action==='instagram-auto-demo-profile'){
    let body=req.body;if(!body||typeof body!=='object'){try{body=JSON.parse(await rawBody(req)||'{}')}catch{return res.status(400).json({error:'Invalid JSON.'})}}
    return developerInstagramAutoDemoProfile(req,res,body);
  }
  if(req.method==='POST' && action.startsWith('instagram-reel-'))return instagramReelHandler(req,res);
  if(req.method==='POST' && action==='instagram-publish-story'){
    let body=req.body; if(!body||typeof body!=='object'){try{body=JSON.parse(await rawBody(req)||'{}')}catch{return res.status(400).json({error:'Invalid JSON.'})}}
    return developerInstagramPublishStory(req,res,body);
  }
  if(req.method==='POST' && action==='instagram-gallery-remove'){
    let body=req.body; if(!body||typeof body!=='object'){try{body=JSON.parse(await rawBody(req)||'{}')}catch{return res.status(400).json({error:'Invalid JSON.'})}}
    return developerInstagramGalleryRemove(req,res,body);
  }
  if(req.method==='POST' && action==='reply'){
    let body=req.body;
    if(!body||typeof body!=='object'){try{body=JSON.parse(await rawBody(req)||'{}')}catch{return res.status(400).json({error:'Invalid JSON.'})}}
    return developerReply(req,res,body);
  }
  if (req.method !== 'POST') return res.status(405).send('POST only');
  if (!RESEND_API_KEY || !RESEND_WEBHOOK_SECRET) {
    console.error('resend-inbound: missing RESEND_API_KEY or RESEND_WEBHOOK_SECRET');
    return res.status(503).send('Inbound email is not configured.');
  }
  try {
    const payload = await rawBody(req);
    const resend = new Resend(RESEND_API_KEY);
    const event = resend.webhooks.verify({
      payload,
      headers: {id:req.headers['svix-id'],timestamp:req.headers['svix-timestamp'],signature:req.headers['svix-signature']},
      webhookSecret: RESEND_WEBHOOK_SECRET,
    });
    if (event?.type !== 'email.received') return res.status(200).json({ received: true, ignored: true });
    const route = destinationFor(event);
    if (!route) return res.status(200).json({ received: true, ignored: true });
    if (!route.forwardTo) {
      console.error(`resend-inbound: no forwarding destination configured for ${route.inbound}`);
      return res.status(503).send('Forwarding destination is not configured.');
    }
    const emailId = String(event?.data?.email_id || '').trim();
    if (!emailId) return res.status(400).send('Missing received email id.');
    const { data, error } = await resend.emails.receiving.forward({emailId,to:route.forwardTo,from:FORWARD_FROM});
    if (error) {console.error('resend-inbound forward error', error);return res.status(502).send(error.message || 'Could not forward received email.');}
    return res.status(200).json({ received: true, forwarded: true, id: data?.id || null });
  } catch (error) {
    console.error('resend-inbound', error);
    return res.status(400).send(error?.message || 'Webhook error');
  }
};
