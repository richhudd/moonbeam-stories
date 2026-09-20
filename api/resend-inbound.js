const { Resend } = require('resend');
const crypto=require('crypto');
const {SUPABASE_URL:ADMIN_SUPABASE_URL,adminHeaders}=require('./_usage');

const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const RESEND_WEBHOOK_SECRET = String(process.env.RESEND_WEBHOOK_SECRET || '').trim();
const SUPPORT_FORWARD_TO = String(process.env.SUPPORT_FORWARD_TO || '').trim();
const PRIVACY_FORWARD_TO = String(process.env.PRIVACY_FORWARD_TO || SUPPORT_FORWARD_TO || '').trim();
const FORWARD_FROM = String(
  process.env.RESEND_FORWARD_FROM || 'Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>'
).trim();
const SUPABASE_URL = String(process.env.SUPABASE_URL || 'https://quwjfjojeibaxnnpykaf.supabase.co').trim();
const PUBLISHABLE_KEY = String(process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();

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
async function adminJson(url,options={}){
  const r=await fetch(url,options); const text=await r.text(); let data=null;
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error(data?.message||data?.error||`Moonbeam data request failed (${r.status}).`); return data;
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
  let shareId=null,coverPath=null;
  const uploadedPaths=[];
  try{
    const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/saved_stories?id=eq.${encodeURIComponent(storyId)}&parent_id=eq.${encodeURIComponent(verified.user.id)}&select=id,title,language,opening,pages,closing,saved_assets`,{headers:adminHeaders()});
    const story=Array.isArray(rows)?rows[0]:null; if(!story)return res.status(404).json({error:'That saved story is unavailable.'});
    const assets=story.saved_assets||{}; if(!assets.cover||!Array.isArray(assets.pages)||assets.pages.length<4)return res.status(409).json({error:'Save the complete illustrated story before posting it.'});
    const storyPages=[collapseWhitespace(story.opening||''), collapseWhitespace(story.pages?.[0]?.text||''), collapseWhitespace(story.pages?.[1]?.text||''), collapseWhitespace(story.pages?.[2]?.text||'')];
    if(storyPages.some(x=>!x))return res.status(409).json({error:'This story needs at least four readable pages before it can be posted to Instagram.'});
    const token=crypto.randomBytes(32).toString('base64url');
    const createdShare=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({owner_id:verified.user.id,saved_story_id:storyId,token_hash:shareTokenHash(token),sender_name:'Moonbeam Stories',recipient_name:token,recipient_email:'instagram@moonbeamstories.co.uk'})});
    shareId=createdShare?.[0]?.id; if(!shareId)throw new Error('Could not create the public story link.');
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
    const caption=`${String(story.title||'A Moonbeam Story').trim()} ✨\n\nRead the full illustrated story — link in bio.`;
    const carouselId=await createInstagramCarouselContainer(accountId,accessToken,childIds,caption);
    await waitForInstagramContainer(carouselId,accessToken,'Instagram carousel');
    const publishBody=new URLSearchParams({creation_id:carouselId,access_token:accessToken});
    const published=await instagramJson(`https://graph.instagram.com/v26.0/${encodeURIComponent(accountId)}/media_publish`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:publishBody.toString()});
    const mediaId=String(published?.id||'').trim(); if(!mediaId)throw new Error('Instagram did not return a published media ID.');
    return res.status(200).json({ok:true,mediaId,galleryUrl:`${origin}/instagram`,readerUrl:`${origin}/shared/${encodeURIComponent(token)}`});
  }catch(error){
    await deleteSavedStoryArt(uploadedPaths.reverse());
    if(shareId){try{await fetch(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(shareId)}`,{method:'DELETE',headers:adminHeaders({Prefer:'return=minimal'})})}catch{}}
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
  if(req.method==='POST' && action==='instagram-publish-test')return developerInstagramPublishTest(req,res);
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
