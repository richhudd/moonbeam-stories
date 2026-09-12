const crypto=require('crypto');
const {SUPABASE_URL,SECRET_KEY,adminHeaders}=require('./_usage');
function tokenHash(token){return crypto.createHash('sha256').update(String(token||'')).digest('hex')}
async function jsonFetch(url,opts={}){const r=await fetch(url,opts);const raw=await r.text();let data=null;try{data=raw?JSON.parse(raw):null}catch{}if(!r.ok){const e=new Error(data?.message||data?.error||raw||`Share service failed (${r.status})`);e.status=r.status;throw e}return data}
async function getShareByToken(token){
 if(!SECRET_KEY)throw Object.assign(new Error('Sharing is not configured.'),{status:503});
 const hash=tokenHash(token);if(!token||hash.length!==64)return null;
 const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/story_shares?token_hash=eq.${hash}&revoked_at=is.null&select=*`,{headers:adminHeaders()});
 return Array.isArray(rows)&&rows.length===1?rows[0]:null;
}
async function getSavedStory(id){const rows=await jsonFetch(`${SUPABASE_URL}/rest/v1/saved_stories?id=eq.${encodeURIComponent(id)}&select=*`,{headers:adminHeaders()});return Array.isArray(rows)&&rows.length===1?rows[0]:null}
function storyTexts(story){return [story?.opening,...(Array.isArray(story?.pages)?story.pages.map(p=>p?.text):[]),story?.closing].map(x=>String(x||'').trim()).filter(Boolean)}
async function validateSharedText(token,text){const share=await getShareByToken(token);if(!share)return null;const story=await getSavedStory(share.saved_story_id);if(!story)return null;const wanted=String(text||'').trim();if(!storyTexts(story).includes(wanted))return null;return{share,story}}
module.exports={tokenHash,getShareByToken,getSavedStory,validateSharedText,jsonFetch};
