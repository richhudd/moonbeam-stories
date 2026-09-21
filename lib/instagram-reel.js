const crypto=require('crypto');
const fs=require('fs/promises');
const os=require('os');
const path=require('path');
const {spawn}=require('child_process');
const sharp=require('sharp');
const {SUPABASE_URL:ADMIN_SUPABASE_URL,adminHeaders,logUsage,estimateGBP}=require('../api/_usage');

const SUPABASE_URL=String(process.env.SUPABASE_URL||'https://quwjfjojeibaxnnpykaf.supabase.co').trim();
const PUBLISHABLE_KEY=String(process.env.SUPABASE_PUBLISHABLE_KEY||'sb_publishable_fF-Pc61g82cwksFta61dow_lRpWuX4q').trim();
const SITE_URL=String(process.env.MOONBEAM_SITE_URL||'https://www.moonbeamstories.co.uk').replace(/\/$/,'');
const REEL_MARKER='instagram-reel-preview@moonbeamstories.co.uk';
const GALLERY_MARKER='instagram@moonbeamstories.co.uk';
const GRAPH_VERSION='v26.0';
const REEL_BUCKET='instagram-reels';

function parseBody(req){return typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{})}
function tokenHash(token){return crypto.createHash('sha256').update(String(token||'')).digest('hex')}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function collapse(value){return String(value||'').replace(/\s+/g,' ').trim()}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
async function decodeReelJpegDataUrl(value,label,width,height,maxBytes=900000){
  const match=String(value||'').match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);if(!match)throw new Error(`${label} was not captured as a JPEG.`);
  const bytes=Buffer.from(match[1],'base64');if(bytes.length<4000||bytes.length>maxBytes)throw new Error(`${label} has an unexpected file size.`);
  const meta=await sharp(bytes).metadata();if(meta.format!=='jpeg'||meta.width!==width||meta.height!==height)throw new Error(`${label} has the wrong dimensions.`);return bytes;
}

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
async function adminJson(url,options={}){
  const r=await fetch(url,options);const text=await r.text();let data=null;
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error(data?.message||data?.error||`Moonbeam data request failed (${r.status}).`);
  return data;
}
function instagramRateLimitError(data,status=0){
  const error=data?.error||{};
  const message=collapse(error?.message||'');
  const code=Number(error?.code||0);
  const subcode=Number(error?.error_subcode||0);
  const rateLimited=status===429||[4,17,32,613].includes(code)||/application request limit|request limit reached|rate limit|too many requests/i.test(message);
  if(!rateLimited)return null;
  const e=new Error('Instagram is temporarily rate-limiting Moonbeam. Please wait a while before trying to post again.');
  e.code='INSTAGRAM_RATE_LIMIT';e.instagramCode=code||null;e.instagramSubcode=subcode||null;e.httpStatus=status||null;
  return e;
}
async function instagramJson(url,options={}){
  const r=await fetch(url,options);const text=await r.text();let data={};
  try{data=text?JSON.parse(text):{}}catch{data={error:{message:text||`Instagram request failed (${r.status}).`}}}
  if(!r.ok||data?.error){
    const limited=instagramRateLimitError(data,r.status);if(limited)throw limited;
    throw new Error(data?.error?.message||`Instagram request failed (${r.status}).`);
  }
  return data;
}
async function waitForInstagramContainer(id,accessToken,label='Instagram Reel'){
  const deadline=Date.now()+180000,delays=[8000,12000,16000,20000,25000];let last='',attempt=0;
  // Give Instagram time to begin processing before the first status request.
  await sleep(5000);
  while(Date.now()<deadline){
    const status=await instagramJson(`https://graph.instagram.com/${GRAPH_VERSION}/${encodeURIComponent(id)}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`,{headers:{Accept:'application/json'}});
    last=String(status?.status_code||status?.status||'').toUpperCase();
    if(last==='FINISHED'||last==='PUBLISHED')return status;
    if(last==='ERROR'||last==='EXPIRED')throw new Error(`${label} could not be prepared (${last.toLowerCase()}).`);
    const wait=delays[Math.min(attempt,delays.length-1)];attempt+=1;
    if(Date.now()+wait>=deadline)break;
    await sleep(wait);
  }
  throw new Error(`${label} is still being prepared${last?` (${last.toLowerCase()})`:''}. Please try again.`);
}
async function uploadSavedStoryArt(objectPath,bytes,contentType){
  const r=await fetch(`${ADMIN_SUPABASE_URL}/storage/v1/object/saved-story-art/${objectPath.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:adminHeaders({'Content-Type':contentType,'x-upsert':'true'}),body:bytes});
  if(!r.ok)throw new Error(`Could not store ${objectPath}.`);
}
async function deleteSavedStoryArt(objectPath){
  if(!objectPath)return;
  try{await fetch(`${ADMIN_SUPABASE_URL}/storage/v1/object/saved-story-art/${objectPath.split('/').map(encodeURIComponent).join('/')}`,{method:'DELETE',headers:adminHeaders()})}catch{}
}
async function uploadReelVideo(objectPath,bytes){
  const encoded=String(objectPath).split('/').map(encodeURIComponent).join('/');
  const r=await fetch(`${ADMIN_SUPABASE_URL}/storage/v1/object/${REEL_BUCKET}/${encoded}`,{method:'POST',headers:adminHeaders({'Content-Type':'video/mp4','x-upsert':'true'}),body:bytes});
  if(!r.ok){let detail='';try{detail=collapse(await r.text())}catch{}throw new Error(`Could not store Reel video${detail?`: ${detail}`:'.'}`)}
}
async function deleteReelVideo(objectPath){
  if(!objectPath)return;
  const encoded=String(objectPath).split('/').map(encodeURIComponent).join('/');
  try{await fetch(`${ADMIN_SUPABASE_URL}/storage/v1/object/${REEL_BUCKET}/${encoded}`,{method:'DELETE',headers:adminHeaders()})}catch{}
}
async function fetchSavedStoryArt(objectPath){
  const r=await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/saved-story-art/${String(objectPath).split('/').map(encodeURIComponent).join('/')}`,{headers:adminHeaders()});
  if(!r.ok)throw new Error(`Could not load ${objectPath}.`);
  return Buffer.from(await r.arrayBuffer());
}

function wrapWords(text,maxChars){
  const words=collapse(text).split(' ').filter(Boolean);const lines=[];let line='';
  for(const word of words){const next=line?`${line} ${word}`:word;if(!line||next.length<=maxChars){line=next;continue}lines.push(line);line=word}
  if(line)lines.push(line);return lines;
}
function reelTextLayout(text){
  const clean=collapse(text);let size=38;
  while(size>=18){
    const chars=Math.max(28,Math.floor(830/(size*.54))),lines=wrapWords(clean,chars),lineHeight=Math.round(size*1.34);
    if(lines.length*lineHeight<=525)return {size,lineHeight,lines};
    size-=1;
  }
  const lines=wrapWords(clean,Math.max(40,Math.floor(830/(18*.54))));
  return {size:18,lineHeight:24,lines};
}
function titleLayout(title,maxChars=22){
  const clean=collapse(title);let lines=wrapWords(clean,maxChars);while(lines.length>3){lines[lines.length-2]+=' '+lines.pop()}return lines;
}
function snippetFromText(text){
  const clean=collapse(text);if(!clean)return '';
  const sentences=(clean.match(/[^.!?…]+(?:[.!?…]+|$)/g)||[clean]).map(s=>collapse(s)).filter(Boolean);
  let snippet=sentences[0]||clean;
  if(snippet.length<70&&sentences[1]&&`${snippet} ${sentences[1]}`.length<=180)snippet=`${snippet} ${sentences[1]}`;
  if(snippet.length>190){snippet=snippet.slice(0,187).replace(/\s+\S*$/,'').trim()+'…'}
  return snippet;
}
function heroCopy(assets={}){
  const names=Array.isArray(assets.heroNames)?assets.heroNames.map(n=>collapse(n)).filter(Boolean).slice(0,2):[];
  if(!names.length)return 'your child';
  if(names.length===1)return names[0];
  return `${names[0]} and ${names[1]}`;
}
function instagramStoryCaption(story){
  const title=collapse(story?.title)||'A Moonbeam Story',hero=heroCopy(story?.saved_assets||{});
  return `${title} ✨\n\nA personalised Moonbeam story starring ${hero}.\n\nWatch the adventure begin, then read the full story via the link in our bio.\n\nCreate personalised, illustrated stories starring your own child at moonbeamstories.co.uk\n\n#MoonbeamStories #PersonalisedStories #ChildrensBooks #BedtimeStories #Parenting`;
}

async function renderCoverFrame(source){
  const width=1080,height=1920;
  const bg=await sharp(source).resize(width,height,{fit:'cover'}).blur(24).modulate({brightness:.56,saturation:.92}).jpeg({quality:88}).toBuffer();
  const art=await sharp(source).resize(930,1163,{fit:'cover'}).jpeg({quality:93}).toBuffer();
  return sharp(bg).composite([{input:art,top:300,left:75}]).png().toBuffer();
}
async function renderStoryFrame(source,panel){
  const width=1080,height=1920;
  const bg=await sharp(source).resize(width,height,{fit:'cover'}).blur(24).modulate({brightness:.62,saturation:.9}).jpeg({quality:88}).toBuffer();
  const art=await sharp(source).resize(1000,1000,{fit:'cover'}).jpeg({quality:92}).toBuffer();
  const textPanel=await sharp(panel).resize(936,790,{fit:'fill'}).jpeg({quality:94}).toBuffer();
  return sharp(bg).composite([{input:art,top:58,left:40},{input:textPanel,top:1058,left:72}]).png().toBuffer();
}
async function renderCtaFrame(source,panel){
  const width=1080,height=1920;
  const bg=await sharp(source).resize(width,height,{fit:'cover'}).blur(26).modulate({brightness:.48,saturation:.88}).jpeg({quality:88}).toBuffer();
  const ctaPanel=await sharp(panel).resize(936,790,{fit:'fill'}).jpeg({quality:94}).toBuffer();
  return sharp(bg).composite([{input:ctaPanel,top:565,left:72}]).png().toBuffer();
}
const voiceProfiles={'en-GB':'fable','en-US':'marin','es-ES':'cedar','es-419':'coral','fr-FR':'shimmer','de-DE':'onyx','it-IT':'nova','pt-BR':'sage','pl-PL':'cedar'};
const narrationProfiles={
  'en-GB':'Speak in natural contemporary British English with a neutral educated British accent.',
  'en-US':'Speak in natural American English with a warm, neutral contemporary US accent.',
  'es-ES':'Speak in European Spanish from Spain with a natural neutral Peninsular Spanish accent.',
  'es-419':'Speak in natural Latin American Spanish with a warm, broadly neutral Latin American accent.',
  'fr-FR':'Speak in French from France with a natural, warm, neutral metropolitan French accent.',
  'de-DE':'Speak in German from Germany with a natural, warm, neutral Standard German accent.',
  'it-IT':'Speak in Italian from Italy with a natural, warm, neutral standard Italian accent.',
  'pt-BR':'Speak in Brazilian Portuguese with natural native Brazilian pronunciation and rhythm.',
  'pl-PL':'Speak in natural native Polish with authentic Polish pronunciation, rhythm and intonation.'
};
async function tts(text,language,userId,storyId){
  const apiKey=String(process.env.OPENAI_API_KEY||'').trim().replace(/^[\'"]|[\'"]$/g,'');
  if(!apiKey)throw new Error('OPENAI_API_KEY is not configured in Vercel.');
  const voice=voiceProfiles[language]||'marin';
  const instructions=`${narrationProfiles[language]||'Speak naturally in the language and regional variety of the text.'} Read as a warm children\'s audiobook narrator. Keep this teaser concise, natural and inviting. Do not imitate any real person.`;
  const r=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice,input:text,instructions,response_format:'mp3',speed:.98})});
  if(!r.ok){const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{}throw new Error(data?.error?.message||`Narration failed (${r.status}).`)}
  const bytes=Buffer.from(await r.arrayBuffer());
  await logUsage({event_type:'narration',estimated_cost_gbp:estimateGBP('narration'),metadata:{model:'gpt-4o-mini-tts',characters:text.length,user_id:userId||null,saved_story_id:storyId||null,instagram_reel:true}});
  return bytes;
}

function ffmpegPath(){
  if(process.env.FFMPEG_PATH)return process.env.FFMPEG_PATH;
  try{return require('ffmpeg-static')}catch{return 'ffmpeg'}
}
function runFfmpeg(args,{capture=false}={}){
  return new Promise((resolve,reject)=>{
    const p=spawn(ffmpegPath(),args,{stdio:capture?['ignore','pipe','pipe']:['ignore','ignore','pipe']});let stderr='';let stdout='';
    p.stderr.on('data',d=>stderr+=String(d));if(capture)p.stdout.on('data',d=>stdout+=String(d));
    p.on('error',reject);p.on('close',code=>code===0?resolve({stderr,stdout}):reject(new Error(`Video renderer failed (${code}). ${stderr.slice(-1200)}`)));
  });
}
async function audioDuration(file){
  try{const {stderr}=await runFfmpeg(['-hide_banner','-i',file,'-f','null','-'],{capture:true});const m=stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);if(m)return Number(m[1])*3600+Number(m[2])*60+Number(m[3])}catch{}
  return 3.2;
}
async function renderSilentSegment(frame,out,duration,options={}){
  const d=Math.max(1.8,Math.min(6.5,Number(duration)||2.6)),fadeOut=Math.max(.2,d-.24).toFixed(2);
  const skipFadeIn=!!options.skipFadeIn;
  const visualFilters=[
    "scale=1120:1992:force_original_aspect_ratio=increase",
    "crop=1120:1992",
    "zoompan=z='min(zoom+0.00018,1.03)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30"
  ];
  if(!skipFadeIn)visualFilters.push("fade=t=in:st=0:d=0.18");
  visualFilters.push(`fade=t=out:st=${fadeOut}:d=0.20`,'format=yuv420p');
  const filter=visualFilters.join(',');
  await runFfmpeg(['-y','-loop','1','-framerate','30','-i',frame,'-t',d.toFixed(2),'-vf',filter,'-an','-r','30','-c:v','libx264','-preset','ultrafast','-crf','24','-profile:v','high','-level','4.1','-movflags','+faststart',out]);
}
async function renderFlashSegment(frame,out,duration=0.10){
  const d=Math.max(0.03,Math.min(0.25,Number(duration)||0.10));
  const filter=[
    "scale=1120:1992:force_original_aspect_ratio=increase",
    "crop=1120:1992",
    "scale=1080:1920",
    "format=yuv420p"
  ].join(',');
  await runFfmpeg(['-y','-loop','1','-framerate','30','-i',frame,'-t',d.toFixed(2),'-vf',filter,'-an','-r','30','-c:v','libx264','-preset','ultrafast','-crf','24','-profile:v','high','-level','4.1','-movflags','+faststart',out]);
}
async function renderReel(story,userId,workDir,visuals){
  const assets=story.saved_assets||{};
  if(!assets.cover||!Array.isArray(assets.pages)||assets.pages.length<4)throw new Error('Save the complete illustrated story before creating a Reel.');
  if(!visuals?.cover||!Array.isArray(visuals?.panels)||visuals.panels.length!==4||!visuals?.cta||!visuals?.introFrame)throw new Error('Refresh Moonbeam and prepare the Reel again so its teaser assets can be captured correctly.');
  const texts=[collapse(story.opening||''),collapse(story.pages?.[0]?.text||''),collapse(story.pages?.[1]?.text||''),collapse(story.pages?.[2]?.text||'')];
  if(texts.some(t=>!t))throw new Error('This story needs at least four readable pages for the Reel teaser.');
  const pageArt=[];for(let i=0;i<4;i++)pageArt.push(await fetchSavedStoryArt(assets.pages[i]));
  const frameFiles=[],segments=[];
  const coverFlashFrame=path.join(workDir,'frame-0.png');await fs.writeFile(coverFlashFrame,await renderCoverFrame(visuals.cover));frameFiles.push(coverFlashFrame);
  const introFrame=path.join(workDir,'frame-1.jpg');await fs.writeFile(introFrame,visuals.introFrame);frameFiles.push(introFrame);
  for(let i=0;i<4;i++){const f=path.join(workDir,`frame-${i+2}.png`);await fs.writeFile(f,await renderStoryFrame(pageArt[i],visuals.panels[i]));frameFiles.push(f)}
  const ctaFrame=path.join(workDir,'frame-6.png');await fs.writeFile(ctaFrame,await renderCtaFrame(pageArt[3],visuals.cta));frameFiles.push(ctaFrame);
  await (async()=>{const out=path.join(workDir,'segment-0.mp4');await renderFlashSegment(frameFiles[0],out,0.10);segments.push(out)})();
  const durations=[2.8,2.35,2.35,2.35,2.35,2.8];
  for(let i=1;i<frameFiles.length;i++){
    const out=path.join(workDir,`segment-${i}.mp4`);await renderSilentSegment(frameFiles[i],out,durations[i-1]||2.4,{skipFadeIn:i===1});segments.push(out);
  }
  const list=segments.map(f=>`file '${String(f).replace(/'/g,"'\''")}'`).join('\n'),listFile=path.join(workDir,'segments.txt'),output=path.join(workDir,'reel.mp4');await fs.writeFile(listFile,list);
  await runFfmpeg(['-y','-f','concat','-safe','0','-i',listFile,'-c','copy','-movflags','+faststart',output]);
  const stat=await fs.stat(output);if(stat.size<100000||stat.size>250000000)throw new Error('The Reel video failed its final file-size check.');
  return {bytes:await fs.readFile(output)};
}

async function getOwnedStory(userId,storyId){
  const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/saved_stories?id=eq.${encodeURIComponent(storyId)}&parent_id=eq.${encodeURIComponent(userId)}&select=id,title,language,opening,pages,closing,saved_assets`,{headers:adminHeaders()});
  return Array.isArray(rows)?rows[0]:null;
}
async function createPreviewShare(userId,storyId){
  const token=crypto.randomBytes(32).toString('base64url');
  const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({owner_id:userId,saved_story_id:storyId,token_hash:tokenHash(token),sender_name:'Moonbeam Reel Preview',recipient_name:token,recipient_email:REEL_MARKER})});
  const share=rows?.[0];if(!share?.id)throw new Error('Could not create the Reel preview link.');return {share,token};
}
async function findPreviewShare(userId,token){
  const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?owner_id=eq.${encodeURIComponent(userId)}&token_hash=eq.${encodeURIComponent(tokenHash(token))}&recipient_email=eq.${encodeURIComponent(REEL_MARKER)}&revoked_at=is.null&select=id,saved_story_id,opened_at`,{headers:adminHeaders()});
  return Array.isArray(rows)?rows[0]:null;
}
async function findGalleryShare(userId,storyId){
  const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?owner_id=eq.${encodeURIComponent(userId)}&saved_story_id=eq.${encodeURIComponent(storyId)}&recipient_email=eq.${encodeURIComponent(GALLERY_MARKER)}&revoked_at=is.null&select=id,recipient_name&order=created_at.desc&limit=1`,{headers:adminHeaders()});
  const row=Array.isArray(rows)?rows[0]:null;
  if(!row?.id||!String(row.recipient_name||'').trim())return null;
  return {id:row.id,token:String(row.recipient_name).trim(),created:false};
}
async function renderGalleryCover(story){
  const source=await fetchSavedStoryArt(story.saved_assets?.cover);
  const art=await sharp(source).resize(1000,1000,{fit:'contain',background:{r:255,g:250,b:242,alpha:1}}).jpeg({quality:92}).toBuffer();
  const lines=titleLayout(story.title||'A Moonbeam Story',28),fontSize=lines.length>2?46:52,lineHeight=Math.round(fontSize*1.08),startY=1090;
  const tspans=lines.map((line,i)=>`<tspan x="540" y="${startY+i*lineHeight}">${esc(line)}</tspan>`).join('');
  const overlay=Buffer.from(`<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1350" fill="#f7f0df"/>
    <rect x="24" y="24" width="1032" height="1302" rx="28" fill="none" stroke="#b6904d" stroke-width="3"/>
    <rect x="40" y="40" width="1000" height="1000" rx="18" fill="#fffaf2"/>
    <rect x="56" y="1058" width="968" height="238" rx="22" fill="#fffaf2" stroke="#d9be86" stroke-width="2"/>
    <text x="540" text-anchor="middle" fill="#2e2740" font-family="Georgia, Times New Roman, serif" font-size="${fontSize}" font-weight="700">${tspans}</text>
    <text x="540" y="1270" text-anchor="middle" fill="#72583a" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" letter-spacing="2">MOONBEAM STORIES</text>
  </svg>`);
  return sharp(overlay).composite([{input:art,top:40,left:40}]).jpeg({quality:92}).toBuffer();
}
async function ensureGalleryShare(userId,story,approvedCoverBytes=null){
  const existing=await findGalleryShare(userId,story.id);if(existing)return existing;
  const token=crypto.randomBytes(32).toString('base64url');
  const rows=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares`,{method:'POST',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({owner_id:userId,saved_story_id:story.id,token_hash:tokenHash(token),sender_name:'Moonbeam Stories',recipient_name:token,recipient_email:GALLERY_MARKER})});
  const share=rows?.[0];if(!share?.id)throw new Error('Could not add the story to the Moonbeam Instagram gallery.');
  try{await uploadSavedStoryArt(`instagram-covers/${share.id}.jpg`,approvedCoverBytes||await renderGalleryCover(story),'image/jpeg')}
  catch(error){try{await fetch(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(share.id)}`,{method:'DELETE',headers:adminHeaders({Prefer:'return=minimal'})})}catch{};throw error}
  return {id:share.id,token,created:true};
}
async function rollbackGalleryShare(gallery){
  if(!gallery?.created||!gallery.id)return;
  await deleteSavedStoryArt(`instagram-covers/${gallery.id}.jpg`);
  try{await fetch(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(gallery.id)}`,{method:'DELETE',headers:adminHeaders({Prefer:'return=minimal'})})}catch{}
}
async function cleanupPreview(shareId){
  if(!shareId)return;await deleteReelVideo(`${shareId}.mp4`);await deleteSavedStoryArt(`instagram-reel-previews/${shareId}-cover.jpg`);
  try{await fetch(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(shareId)}`,{method:'DELETE',headers:adminHeaders({Prefer:'return=minimal'})})}catch{}
}

async function prepare(req,res,user,body){
  const storyId=String(body.storyId||'').trim();if(!storyId)return res.status(400).json({error:'Story id is required.'});
  const story=await getOwnedStory(user.id,storyId);if(!story)return res.status(404).json({error:'That saved story is unavailable.'});
  let visuals;try{
    const cover=await decodeReelJpegDataUrl(body.coverDataUrl,'The Reel cover',1080,1350,1100000);
    if(!Array.isArray(body.reelTextPanelDataUrls)||body.reelTextPanelDataUrls.length!==4)throw new Error('The Reel text panels are missing.');
    const panels=[];for(let i=0;i<4;i++)panels.push(await decodeReelJpegDataUrl(body.reelTextPanelDataUrls[i],`Reel text panel ${i+1}`,936,790,260000));
    const cta=await decodeReelJpegDataUrl(body.reelCtaPanelDataUrl,'The Reel ending panel',936,790,260000);
    const introFrame=await decodeReelJpegDataUrl(body.reelIntroFrameDataUrl,'The Reel opening',1080,1920,1100000);
    visuals={cover,panels,cta,introFrame};
  }catch(error){return res.status(400).json({ok:false,error:error?.message||'The Reel teaser could not be captured correctly.'})}
  let preview=null,workDir=null;
  try{
    preview=await createPreviewShare(user.id,storyId);workDir=await fs.mkdtemp(path.join(os.tmpdir(),'moonbeam-reel-'));
    const rendered=await renderReel(story,user.id,workDir,visuals),objectPath=`${preview.share.id}.mp4`;
    await uploadReelVideo(objectPath,rendered.bytes);await uploadSavedStoryArt(`instagram-reel-previews/${preview.share.id}-cover.jpg`,visuals.cover,'image/jpeg');
    const previewUrl=`${SITE_URL}/api/share?action=asset&token=${encodeURIComponent(preview.token)}&kind=instagram-reel&v=25074`;
    const check=await fetch(previewUrl,{headers:{Accept:'video/mp4'},cache:'no-store'});if(!check.ok)throw new Error('The finished Reel could not be verified from Moonbeam’s public video URL.');
    return res.status(200).json({ok:true,token:preview.token,previewUrl,durationStyle:'teaser'});
  }catch(error){if(preview?.share?.id)await cleanupPreview(preview.share.id);console.error('instagram reel prepare',error);return res.status(502).json({ok:false,error:error?.message||'Could not create the Instagram Reel.'})}
  finally{if(workDir)fs.rm(workDir,{recursive:true,force:true}).catch(()=>{})}
}

async function publish(req,res,user,body){
  const token=String(body.token||'').trim();if(!token)return res.status(400).json({error:'Reel preview token is required.'});
  const share=await findPreviewShare(user.id,token);if(!share)return res.status(404).json({error:'That Reel preview is no longer available.'});
  const lock=await adminJson(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(share.id)}&owner_id=eq.${encodeURIComponent(user.id)}&opened_at=is.null`,{method:'PATCH',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({opened_at:new Date().toISOString()})});
  if(!Array.isArray(lock)||!lock.length)return res.status(409).json({error:'This Reel is already being posted or has already been posted.'});
  let gallery=null;
  try{
    const story=await getOwnedStory(user.id,share.saved_story_id);if(!story)throw new Error('That saved story is unavailable.');
    const accessToken=String(process.env.INSTAGRAM_ACCESS_TOKEN||'').trim(),accountId=String(process.env.INSTAGRAM_ACCOUNT_ID||'').trim();
    if(!accessToken||!accountId)throw new Error('Instagram is not configured in Vercel.');
    let approvedCover=null;try{approvedCover=await fetchSavedStoryArt(`instagram-reel-previews/${share.id}-cover.jpg`)}catch{};gallery=await ensureGalleryShare(user.id,story,approvedCover);
    const videoUrl=`${SITE_URL}/api/share?action=asset&token=${encodeURIComponent(token)}&kind=instagram-reel&v=25074&cb=${Date.now()}`;
    const createBody=new URLSearchParams({media_type:'REELS',video_url:videoUrl,caption:instagramStoryCaption(story),share_to_feed:'true',access_token:accessToken});
    const created=await instagramJson(`https://graph.instagram.com/${GRAPH_VERSION}/${encodeURIComponent(accountId)}/media`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:createBody.toString()});
    const creationId=String(created?.id||'').trim();if(!creationId)throw new Error('Instagram did not return a Reel container ID.');
    await waitForInstagramContainer(creationId,accessToken,'Instagram Reel');
    const publishBody=new URLSearchParams({creation_id:creationId,access_token:accessToken});
    const published=await instagramJson(`https://graph.instagram.com/${GRAPH_VERSION}/${encodeURIComponent(accountId)}/media_publish`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:publishBody.toString()});
    const mediaId=String(published?.id||'').trim();if(!mediaId)throw new Error('Instagram did not return a published Reel ID.');
    await cleanupPreview(share.id);
    return res.status(200).json({ok:true,mediaId,galleryUrl:`${SITE_URL}/instagram`,readerUrl:`${SITE_URL}/shared/${encodeURIComponent(gallery.token)}`});
  }catch(error){
    await rollbackGalleryShare(gallery);
    try{await fetch(`${ADMIN_SUPABASE_URL}/rest/v1/story_shares?id=eq.${encodeURIComponent(share.id)}&owner_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:adminHeaders({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify({opened_at:null})})}catch{}
    console.error('instagram reel publish',error);return res.status(502).json({ok:false,error:error?.message||'Could not publish the Instagram Reel.'});
  }
}
async function discard(req,res,user,body){
  const token=String(body.token||'').trim();if(!token)return res.status(200).json({ok:true});
  const share=await findPreviewShare(user.id,token);if(share)await cleanupPreview(share.id);
  return res.status(200).json({ok:true});
}

module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  let body;try{body=parseBody(req)}catch{return res.status(400).json({error:'Invalid JSON.'})}
  const verified=await verifyDeveloper(req);if(verified.error)return res.status(verified.error[0]).json({error:verified.error[1]});
  const action=String(req.query?.action||'').trim().toLowerCase().replace(/^instagram-reel-/, '');
  if(action==='prepare')return prepare(req,res,verified.user,body);
  if(action==='publish')return publish(req,res,verified.user,body);
  if(action==='discard')return discard(req,res,verified.user,body);
  return res.status(400).json({error:'Unknown Reel action.'});
};

