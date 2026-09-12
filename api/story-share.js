const crypto=require('crypto');
const {Resend}=require('resend');
const {verifyMoonbeamUser}=require('../_credits');
const {SUPABASE_URL,SECRET_KEY,adminHeaders}=require('../_usage');
const {tokenHash,jsonFetch}=require('../_shares');
const RESEND_API_KEY=String(process.env.RESEND_API_KEY||'').trim();
const SHARE_FROM=String(process.env.RESEND_SHARE_FROM||'Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>').trim();
const SITE_URL=String(process.env.MOONBEAM_SITE_URL||'https://www.moonbeamstories.co.uk').replace(/\/$/,'');
const emailOk=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||'').trim());
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function ownedStory(userId,storyId){const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/saved_stories?id=eq.${encodeURIComponent(storyId)}&parent_id=eq.${encodeURIComponent(userId)}&select=id,title,saved_assets`,{headers:adminHeaders()});return Array.isArray(rows)&&rows.length===1?rows[0]:null}
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');if(!SECRET_KEY)return res.status(503).json({error:'Sharing is not configured.'});
 try{
  const user=await verifyMoonbeamUser(req);
  if(req.method==='GET'){
   const storyId=String(req.query?.storyId||'').trim();if(!storyId)return res.status(400).json({error:'Story id is required.'});if(!await ownedStory(user.id,storyId))return res.status(404).json({error:'Story not found.'});
   const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares?owner_id=eq.${encodeURIComponent(user.id)}&saved_story_id=eq.${encodeURIComponent(storyId)}&select=id,recipient_name,recipient_email,created_at,opened_at,revoked_at&order=created_at.desc`,{headers:adminHeaders()});return res.status(200).json({shares:rows||[]});
  }
  if(req.method==='DELETE'){
   const id=String((typeof req.body==='string'?JSON.parse(req.body):req.body||{}).id||'').trim();if(!id)return res.status(400).json({error:'Share id is required.'});
   await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify({revoked_at:new Date().toISOString()})});return res.status(200).json({ok:true});
  }
  if(req.method!=='POST')return res.status(405).json({error:'GET, POST or DELETE only'});
  if(!RESEND_API_KEY)return res.status(503).json({error:'Story email delivery is not configured.'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{},storyId=String(body.storyId||'').trim(),senderName=String(body.senderName||'').trim().slice(0,80),recipients=Array.isArray(body.recipients)?body.recipients:[];
  if(!storyId||!senderName)return res.status(400).json({error:'Your name and story are required.'});if(!recipients.length||recipients.length>10)return res.status(400).json({error:'Add between 1 and 10 recipients.'});
  const story=await ownedStory(user.id,storyId);if(!story)return res.status(404).json({error:'That saved story is unavailable.'});const assets=story.saved_assets||{};if(!assets.cover||!Array.isArray(assets.pages)||!assets.pages.length)return res.status(409).json({error:'This story does not have a complete permanent illustrated copy to share.'});
  const resend=new Resend(RESEND_API_KEY),sent=[],failed=[];
  for(const raw of recipients){const name=String(raw?.name||'').trim().slice(0,80),email=String(raw?.email||'').trim().toLowerCase();if(!name||!emailOk(email)){failed.push({name,email,error:'Enter a valid name and email address.'});continue}
   const token=crypto.randomBytes(32).toString('base64url'),hash=tokenHash(token),rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({owner_id:user.id,saved_story_id:storyId,token_hash:hash,sender_name:senderName,recipient_name:name,recipient_email:email})});const share=rows?.[0];
   const link=`${SITE_URL}/shared/${encodeURIComponent(token)}`;const subject=`${senderName} sent you a special story ✨`;const html=`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2d2540"><div style="font-size:24px;font-weight:700;margin-bottom:24px">☾ Moonbeam Stories</div><h1 style="font-size:28px">${esc(senderName)} sent you a special story ✨</h1><p style="font-size:17px;line-height:1.6">${esc(senderName)} thought you might enjoy <strong>${esc(story.title)}</strong>.</p><p style="margin:30px 0"><a href="${esc(link)}" style="background:#6b55a3;color:white;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700">Read the Story →</a></p><p style="font-size:13px;color:#777">This private link was sent only so you can enjoy this story. You do not need a Moonbeam account to read or listen to it.</p></div>`;
   const result=await resend.emails.send({from:SHARE_FROM,to:[email],subject,html});if(result.error){failed.push({name,email,error:result.error.message||'Email could not be sent.'});await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(share.id)}`,{method:'DELETE',headers:adminHeaders({Prefer:'return=minimal'})});}else sent.push({id:share.id,name,email});
  }
  return res.status(sent.length?200:502).json({sent,failed});
 }catch(e){console.error('story-share',e);return res.status(e.status||500).json({error:String(e.message||e)})}
};
