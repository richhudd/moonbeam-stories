const crypto=require('crypto');
const {Resend}=require('resend');
const {verifyMoonbeamUser}=require('../_credits');
const {SUPABASE_URL,SECRET_KEY,adminHeaders}=require('../_usage');
const {tokenHash,getShareByToken,getSavedStory,jsonFetch}=require('../_shares');

const RESEND_API_KEY=String(process.env.RESEND_API_KEY||'').trim();
const SHARE_FROM=String(process.env.RESEND_SHARE_FROM||'Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>').trim();
const SITE_URL=String(process.env.MOONBEAM_SITE_URL||'https://www.moonbeamstories.co.uk').replace(/\/$/,'');
const emailOk=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||'').trim());
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const parseBody=req=>typeof req.body==='string'?JSON.parse(req.body):req.body||{};

const SHARE_EMAIL={
 'en-GB':{subject:n=>`${n} sent you a special story ✨`,heading:n=>`${n} sent you a special story ✨`,intro:(n,t)=>`${n} thought you might enjoy <strong>${esc(t)}</strong>.`,button:'Read the Story →',note:'This private link was sent only so you can enjoy this story. You do not need a Moonbeam account to read or listen to it.'},
 'en-US':{subject:n=>`${n} sent you a special story ✨`,heading:n=>`${n} sent you a special story ✨`,intro:(n,t)=>`${n} thought you might enjoy <strong>${esc(t)}</strong>.`,button:'Read the Story →',note:'This private link was sent only so you can enjoy this story. You do not need a Moonbeam account to read or listen to it.'},
 'es-ES':{subject:n=>`${n} te ha enviado una historia especial ✨`,heading:n=>`${n} te ha enviado una historia especial ✨`,intro:(n,t)=>`${n} ha pensado que te gustaría <strong>${esc(t)}</strong>.`,button:'Leer la historia →',note:'Este enlace privado se ha enviado únicamente para que disfrutes de esta historia. No necesitas una cuenta de Moonbeam para leerla o escucharla.'},
 'es-419':{subject:n=>`${n} te envió una historia especial ✨`,heading:n=>`${n} te envió una historia especial ✨`,intro:(n,t)=>`${n} pensó que te gustaría <strong>${esc(t)}</strong>.`,button:'Leer la historia →',note:'Este enlace privado se envió únicamente para que disfrutes de esta historia. No necesitas una cuenta de Moonbeam para leerla o escucharla.'},
 'fr-FR':{subject:n=>`${n} vous a envoyé une histoire spéciale ✨`,heading:n=>`${n} vous a envoyé une histoire spéciale ✨`,intro:(n,t)=>`${n} a pensé que <strong>${esc(t)}</strong> vous plairait.`,button:"Lire l’histoire →",note:"Ce lien privé vous a été envoyé uniquement pour vous permettre de profiter de cette histoire. Vous n’avez pas besoin d’un compte Moonbeam pour la lire ou l’écouter."},
 'de-DE':{subject:n=>`${n} hat dir eine besondere Geschichte geschickt ✨`,heading:n=>`${n} hat dir eine besondere Geschichte geschickt ✨`,intro:(n,t)=>`${n} dachte, dass dir <strong>${esc(t)}</strong> gefallen könnte.`,button:'Geschichte lesen →',note:'Dieser private Link wurde nur gesendet, damit du diese Geschichte genießen kannst. Du brauchst kein Moonbeam-Konto, um sie zu lesen oder anzuhören.'},
 'it-IT':{subject:n=>`${n} ti ha inviato una storia speciale ✨`,heading:n=>`${n} ti ha inviato una storia speciale ✨`,intro:(n,t)=>`${n} ha pensato che ti sarebbe piaciuta <strong>${esc(t)}</strong>.`,button:'Leggi la storia →',note:'Questo link privato è stato inviato solo per permetterti di goderti questa storia. Non serve un account Moonbeam per leggerla o ascoltarla.'},
 'pt-BR':{subject:n=>`${n} enviou uma história especial para você ✨`,heading:n=>`${n} enviou uma história especial para você ✨`,intro:(n,t)=>`${n} achou que você gostaria de <strong>${esc(t)}</strong>.`,button:'Ler a história →',note:'Este link privado foi enviado somente para que você aproveite esta história. Você não precisa de uma conta Moonbeam para ler ou ouvir.'},
 'pl-PL':{subject:n=>`${n} wysłał(a) Ci wyjątkową historię ✨`,heading:n=>`${n} wysłał(a) Ci wyjątkową historię ✨`,intro:(n,t)=>`${n} pomyślał(a), że spodoba Ci się <strong>${esc(t)}</strong>.`,button:'Przeczytaj historię →',note:'Ten prywatny link został wysłany wyłącznie po to, aby umożliwić Ci przeczytanie tej historii. Nie potrzebujesz konta Moonbeam, aby ją przeczytać lub odsłuchać.'}
};
const shareEmail=lang=>SHARE_EMAIL[lang]||SHARE_EMAIL['en-GB'];

async function ownedStory(userId,storyId){
 const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/saved_stories?id=eq.${encodeURIComponent(storyId)}&parent_id=eq.${encodeURIComponent(userId)}&select=id,title,language,saved_assets`,{headers:adminHeaders()});
 return Array.isArray(rows)&&rows.length===1?rows[0]:null;
}

async function ownerShares(req,res){
 const user=await verifyMoonbeamUser(req);
 if(req.method==='GET'){
  const storyId=String(req.query?.storyId||'').trim();
  if(!storyId)return res.status(400).json({error:'Story id is required.'});
  if(!await ownedStory(user.id,storyId))return res.status(404).json({error:'Story not found.'});
  const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares?owner_id=eq.${encodeURIComponent(user.id)}&saved_story_id=eq.${encodeURIComponent(storyId)}&select=id,recipient_name,recipient_email,created_at,opened_at,revoked_at&order=created_at.desc`,{headers:adminHeaders()});
  return res.status(200).json({shares:rows||[]});
 }
 if(req.method==='DELETE'){
  const id=String(parseBody(req).id||'').trim();
  if(!id)return res.status(400).json({error:'Share id is required.'});
  await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify({revoked_at:new Date().toISOString()})});
  return res.status(200).json({ok:true});
 }
 if(req.method!=='POST')return res.status(405).json({error:'GET, POST or DELETE only'});
 if(!RESEND_API_KEY)return res.status(503).json({error:'Story email delivery is not configured.'});
 const body=parseBody(req),storyId=String(body.storyId||'').trim(),senderName=String(body.senderName||'').trim().slice(0,80),recipients=Array.isArray(body.recipients)?body.recipients:[];
 if(!storyId||!senderName)return res.status(400).json({error:'Your name and story are required.'});
 if(!recipients.length||recipients.length>10)return res.status(400).json({error:'Add between 1 and 10 recipients.'});
 const story=await ownedStory(user.id,storyId);
 if(!story)return res.status(404).json({error:'That saved story is unavailable.'});
 const assets=story.saved_assets||{};
 if(!assets.cover||!Array.isArray(assets.pages)||!assets.pages.length)return res.status(409).json({error:'This story does not have a complete permanent illustrated copy to share.'});
 const resend=new Resend(RESEND_API_KEY),sent=[],failed=[];
 for(const raw of recipients){
  const email=String(raw?.email||'').trim().toLowerCase(),name=email.slice(0,80);
  if(!emailOk(email)){failed.push({email,error:'Enter a valid email address.'});continue}
  const token=crypto.randomBytes(32).toString('base64url'),hash=tokenHash(token);
  const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({owner_id:user.id,saved_story_id:storyId,token_hash:hash,sender_name:senderName,recipient_name:name,recipient_email:email})});
  const share=rows?.[0],link=`${SITE_URL}/shared/${encodeURIComponent(token)}`,copy=shareEmail(story.language),subject=copy.subject(senderName);
  const html=`<div lang="${esc(story.language||'en-GB')}" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2d2540"><div style="font-size:24px;font-weight:700;margin-bottom:24px">☾ Moonbeam Stories</div><h1 style="font-size:28px">${esc(copy.heading(senderName))}</h1><p style="font-size:17px;line-height:1.6">${copy.intro(esc(senderName),story.title)}</p><p style="margin:30px 0"><a href="${esc(link)}" style="background:#6b55a3;color:white;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700">${esc(copy.button)}</a></p><p style="font-size:13px;color:#777">${esc(copy.note)}</p></div>`;
  const result=await resend.emails.send({from:SHARE_FROM,to:[email],subject,html});
  if(result.error){
   failed.push({name,email,error:result.error.message||'Email could not be sent.'});
   if(share?.id)await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(share.id)}`,{method:'DELETE',headers:adminHeaders({Prefer:'return=minimal'})});
  }else sent.push({id:share.id,name,email});
 }
 return res.status(sent.length?200:502).json({sent,failed});
}


async function ownerLink(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 const user=await verifyMoonbeamUser(req),body=parseBody(req),storyId=String(body.storyId||'').trim(),senderName=String(body.senderName||'').trim().slice(0,80);
 if(!storyId||!senderName)return res.status(400).json({error:'Your name and story are required.'});
 const story=await ownedStory(user.id,storyId);if(!story)return res.status(404).json({error:'That saved story is unavailable.'});
 const assets=story.saved_assets||{};if(!assets.cover||!Array.isArray(assets.pages)||!assets.pages.length)return res.status(409).json({error:'This story does not have a complete permanent illustrated copy to share.'});
 const token=crypto.randomBytes(32).toString('base64url'),hash=tokenHash(token);
 const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({owner_id:user.id,saved_story_id:storyId,token_hash:hash,sender_name:senderName,recipient_name:'',recipient_email:''})});
 if(!rows?.[0])return res.status(500).json({error:'Private link could not be created.'});
 return res.status(200).json({id:rows[0].id,link:`${SITE_URL}/shared/${encodeURIComponent(token)}`});
}

async function publicStory(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'GET only'});
 const token=String(req.query?.token||'').trim(),share=await getShareByToken(token);
 if(!share)return res.status(404).json({error:'This story link is unavailable or has been revoked.'});
 const story=await getSavedStory(share.saved_story_id);
 if(!story)return res.status(404).json({error:'This story is unavailable.'});
 let child={name:'',age:7,interests:'',dislikes:''};
 if(story.child_id){
  const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/child_profiles?id=eq.${encodeURIComponent(story.child_id)}&select=name,age,interests,dislikes`,{headers:adminHeaders()});
  if(rows?.[0])child=rows[0];
 }
 if(!share.opened_at)fetch(`${SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(share.id)}`,{method:'PATCH',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify({opened_at:new Date().toISOString()})}).catch(()=>{});
 const pageCount=Array.isArray(story.saved_assets?.pages)?story.saved_assets.pages.length:0;
 return res.status(200).json({title:story.title,senderName:share.sender_name,language:story.language,child,story:{title:story.title,opening:story.opening||'',character_bible:story.character_bible||'',pages:Array.isArray(story.pages)?story.pages:[],closing:story.closing||''},savedAssets:{cover:'share:cover',pages:Array.from({length:pageCount},(_,i)=>`share:${i}`)}});
}

async function publicAsset(req,res){
 if(req.method!=='GET')return res.status(405).send('GET only');
 const token=String(req.query?.token||''),kind=String(req.query?.kind||''),share=await getShareByToken(token);
 if(!share)return res.status(404).send('Unavailable');
 const story=await getSavedStory(share.saved_story_id);
 if(!story)return res.status(404).send('Unavailable');
 let path;
 if(kind==='cover')path=story.saved_assets?.cover;
 else if(/^\d+$/.test(kind))path=story.saved_assets?.pages?.[Number(kind)];
 if(!path)return res.status(404).send('Image unavailable');
 const objectPath=String(path).split('/').map(encodeURIComponent).join('/');
 const r=await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/saved-story-art/${objectPath}`,{headers:adminHeaders()});
 if(!r.ok)return res.status(404).send('Image unavailable');
 const bytes=Buffer.from(await r.arrayBuffer());
 res.setHeader('Content-Type',r.headers.get('content-type')||'image/webp');
 res.setHeader('Cache-Control','private, max-age=3600');
 return res.status(200).send(bytes);
}

module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!SECRET_KEY)return res.status(503).json({error:'Sharing is not configured.'});
 const action=String(req.query?.action||'').trim().toLowerCase();
 try{
  if(action==='story')return await publicStory(req,res);
  if(action==='asset')return await publicAsset(req,res);
  if(action==='owner')return await ownerShares(req,res);
  if(action==='link')return await ownerLink(req,res);
  return res.status(400).json({error:'Unknown sharing action.'});
 }catch(e){
  console.error('share',action,e);
  if(action==='asset')return res.status(e.status||500).send('Image unavailable');
  return res.status(e.status||500).json({error:String(e.message||e)});
 }
};
