const {logUsage,countUsageEvents,estimateGBP}=require('../_usage');
const {verifyMoonbeamUser,consumeGenerationSlot,refundGenerationSlot}=require('../_credits');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });

  let slotReserved=false;
  let reservedUserId=null;
  let reservedRunId=null;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const prompt = String(body.prompt || '').trim();
    const referenceImages = Array.isArray(body.referenceImages) ? body.referenceImages.slice(0,8) : [];
    const generationRunId = String(body.generationRunId || '').trim();
    const referenceImage = typeof body.referenceImage === 'string' ? body.referenceImage : '';
    const requiredStoryImage = body.requiredStoryImage === true;
    const storyImageIndex = Number.isInteger(body.storyImageIndex) ? body.storyImageIndex : null;
    // V194: the client already sends the story's character bible as `style`.
    // It was previously ignored here, so recurring non-photo characters were being
    // re-invented independently on every image request. Treat it only as immutable
    // character continuity data; it must never alter the V193 house rendering style.
    const characterContinuity = typeof body.style === 'string' ? body.style.trim() : '';
    if (!prompt) return res.status(400).json({ error: 'An illustration prompt is required.' });
    if (!generationRunId) return res.status(400).json({ error: 'This story does not have a valid generation allowance.' });
    const moonbeamUser = await verifyMoonbeamUser(req);
    let recoverySlot=false;
    try { await consumeGenerationSlot(moonbeamUser.id,generationRunId,'image'); }
    catch(e){
      // V206: the original nine image slots remain the primary anti-abuse budget.
      // If Safari/navigation discarded an otherwise legitimate required page request,
      // allow a tightly bounded recovery attempt for that missing story page instead
      // of permanently stranding the book without an illustration.
      const validRequiredIndex = requiredStoryImage && Number.isInteger(storyImageIndex) && storyImageIndex >= 0 && storyImageIndex < 12;
      if(!validRequiredIndex || e.code!=='GENERATION_LIMIT') return res.status(e.status||402).json({error:e.message,code:e.code||'GENERATION_LIMIT'});
      const runMeta={user_id:moonbeamUser.id,generation_run_id:generationRunId};
      const [runRecoveries,pageRecoveries]=await Promise.all([
        countUsageEvents('image_recovery_slot',runMeta),
        countUsageEvents('image_recovery_slot',{...runMeta,story_image_index:storyImageIndex})
      ]);
      // At most nine recovery generations per story run, and at most three for any
      // single required page. Total exposure therefore remains strictly bounded.
      if(runRecoveries===null || pageRecoveries===null) return res.status(503).json({error:'Moonbeam could not safely verify the illustration recovery allowance. Please try again.',code:'RECOVERY_CHECK_FAILED'});
      if(runRecoveries>=9 || pageRecoveries>=3) return res.status(402).json({error:'This story has no image generation allowance remaining.',code:'GENERATION_LIMIT'});
      const recoveryReservation=await logUsage({event_type:'image_recovery_slot',estimated_cost_gbp:0,metadata:{...runMeta,story_image_index:storyImageIndex,reason:'required_story_image_recovery'}});
      if(!recoveryReservation) return res.status(503).json({error:'Moonbeam could not reserve an illustration recovery attempt. Please try again.',code:'RECOVERY_CHECK_FAILED'});
      recoverySlot=true;
    }
    if(!recoverySlot){slotReserved=true;reservedUserId=moonbeamUser.id;reservedRunId=generationRunId;}
    const refundSlot=async()=>{if(slotReserved){slotReserved=false;await refundGenerationSlot(reservedUserId,reservedRunId,'image')}};

    const refs=(Array.isArray(referenceImages)?referenceImages:[]).filter(r=>r&&/^data:image\/(jpeg|png|webp);base64,/i.test(r.image||''));if(!refs.length&&/^data:image\/(jpeg|png|webp);base64,/i.test(referenceImage||''))refs.push({name:'main hero',kind:'child',role:'hero',image:referenceImage});
    const hasReference = refs.length>0;
    const identityDirection = hasReference
      ? `\nIDENTITY REFERENCES — ABSOLUTE CAST IDENTITY LOCK\nThe attached photographs are NOT generic inspiration. Each photograph is the authoritative identity reference for exactly ONE selected Cast member, mapped in attachment order as follows: ${refs.map((r,i)=>`REFERENCE ${i+1} = ${r.name||'character'} | kind: ${r.kind||'character'} | role: ${r.role||'supporting'}`).join('; ')}.\nFor EVERY mapped Cast member, child, adult or pet, reproduce that specific individual whenever the named character appears. Adult identity references have exactly the same priority and force as child identity references. Do not invent an alternative face or appearance for a photographed adult and do not use the real photographed adult later as a different extra person. Preserve recognisable face shape, eyes, nose, mouth structure, hair colour/texture, approximate skin tone, apparent age and overall physical identity. The reference photograph defines IDENTITY, not the character's temporary expression: do NOT copy or lock the reference photo's smile, whether teeth are visible, mouth position, gaze, head angle or body pose. Give each character the natural facial expression and body language required by THIS story moment — they may laugh with visible teeth, smile with a closed mouth, frown, gasp, look worried, puzzled, excited, surprised or show any other scene-appropriate expression while remaining recognisably the same individual. For photographed pets preserve species/breed appearance, coat, body proportions and relative size. Translate each real identity naturally into the fixed Moonbeam painted style rather than making the result photographic. Reference background, clothing and pose are NOT identity requirements unless the scene calls for them. Never merge identities, swap faces, assign one reference to another named character, use a reference as a generic person, or create both an invented version and the real version of the same Cast member. One named Cast member = one stable visual identity across the whole book.`
      : '';

    // V193: one literal, immutable Moonbeam house style for every cover and page.
    // Scene text may describe content, mood and action, but must never change this rendering treatment.
    const MOONBEAM_HOUSE_STYLE = `MOONBEAM HOUSE ILLUSTRATION STYLE — FIXED FOR THE ENTIRE BOOK
Create a sophisticated contemporary storybook painting with naturalistic human anatomy and facial proportions. Render people as believable real people translated into premium painted illustration — never as redesigned cartoon or animation characters.

REALISM TARGET
Aim for approximately 80% naturalistic realism and 20% gentle storybook idealisation. The result must be clearly illustrated rather than photographic, but sit close to the realistic end of children's-book art. Use normal-sized human eyes, natural eye spacing, believable nose and mouth shapes, realistic head-to-body proportions, anatomically plausible hands and limbs, detailed natural hair, softly modelled skin, convincing fabrics and richly observed environments. Use subtle painterly texture, warm cinematic natural light, atmospheric depth and rich but believable colour.

STYLE CONSISTENCY — HIGHEST PRIORITY
The exact same degree of realism, facial treatment, anatomy, painterly finish, lighting language and character-design approach must be maintained in every illustration in this book, including the cover. Do not make one scene more cartoon-like, more photographic, more stylised or more animation-like than another. When there is any tension between novelty and consistency, choose consistency.

PROHIBITED STYLE DRIFT
Do not use oversized or doll-like eyes, enlarged heads, button noses, chibi proportions, caricature, anime, comic-book outlines, flat cartoon rendering, glossy plastic 3D characters, Pixar/Disney-like animation character design, toy-like faces, or photorealistic photography. Do not allow humorous, magical, exciting or dramatic scene content to alter the fixed rendering style.`;

    const finalPrompt = `Create a single full-page illustration for a premium children's storybook.

${MOONBEAM_HOUSE_STYLE}
${identityDirection}

RECURRING CHARACTER CONTINUITY — IMMUTABLE ACROSS THE ENTIRE BOOK
${characterContinuity || 'Keep every recurring non-photo character exactly consistent across all scenes.'}
For every recurring non-photo character, treat the supplied description as a fixed model sheet. For every recurring PHOTO-REFERENCED character, the mapped photograph above is the primary fixed model sheet for identity and overrides any conflicting invented description. The same named or recurring character must remain the same person, animal, robot or creature in every illustration: preserve exact apparent age, sex where specified, facial structure, skin/fur/material colours, eye colour, hair/fur colour and texture, hairstyle, height/build, body proportions, distinctive features and established clothing/accessories. Never age a recurring character up or down. Never redesign, reinterpret or substitute them with a different-looking character. Unless the story explicitly changes clothing or appearance, preserve it exactly. If a recurring character is a child, they must remain visibly the stated age in every scene. Character continuity is higher priority than novelty of casting, but it must NOT change or override the fixed Moonbeam rendering style above.

VISUAL STORYTELLING — COMPOSITION MUST PROGRESS
Character identity and rendering style stay rigidly consistent, but composition must not. Treat the supplied scene direction as a distinct storyboard panel. Do not recycle the same camera position, crop, pose, staging or character/object arrangement used for another scene merely to preserve continuity. Use the action in THIS scene to create a materially different composition, varying camera distance, viewpoint, body pose, foreground/background emphasis and focal action as appropriate. Continuity means the same characters and world, not the same picture repeated. Do not invent new events solely for variety; vary the visual staging of the actual story beat.

SCENE CONTENT — CONTENT ONLY; IT MUST NOT OVERRIDE THE FIXED HOUSE STYLE ABOVE
${prompt}

IMPORTANT
- This is an illustration for children aged 3-12.
- Keep the mood warm, adventurous and reassuring.
- Follow the scene's actual setting, weather and time of day. Do NOT infer nighttime, moonlight, stars, darkness, sleep, bedrooms, pyjamas or bedtime imagery merely because this is a children's story. Use night only when the supplied scene genuinely calls for it.
- No words, letters, captions, signs, logos or typography anywhere in the image.
- Preserve the fixed Moonbeam realism level above; do not drift toward either photography or cartoon/animation rendering.
- Compose the scene as a beautiful book illustration with clear focal characters and readable silhouettes.
- Keep character appearance consistent with the named Cast identity. When a reference photograph is supplied, that photograph is authoritative over any conflicting scene description, equally for children, adults and pets.
- CAST DISCIPLINE: do not promote incidental/background people into prominent companions, family members or recurring characters. Do not add an invented spouse, partner, child, relative or friend to a selected Cast member unless the scene explicitly requires that already-established person. Background crowds may exist naturally but should remain visually secondary.
- CHARACTER UNIQUENESS: never accidentally duplicate a named or recurring character. Each character should have only ONE PHYSICAL INSTANCE in the scene. A second visual depiction is allowed only when the story or scene explicitly requires it, such as a mirror reflection, photograph, portrait, video/screen image, shadow, dream/vision, or another clearly non-physical representation. Never create two physical copies, clones or repeated instances of the same person, child, adult, pet, robot or creature. A reference photo identifies one character, not an instruction to add another physical copy of them.
- Every page in a story must be a genuinely new illustration. If the scene prompt identifies a page/scene number or previous-page context, use that information to advance the visual action and avoid repeating the previous composition, pose, camera angle or background staging.
- ONE continuous scene only: never create a collage, contact sheet, comic strip, grid, split screen, diptych, triptych, multiple panels, inset pictures or multiple frames.
- The finished output must look like one uninterrupted full-page painting viewed through one camera/composition.
- Square composition suitable for the right-hand page of a children's book.`;

    let r;
    if (hasReference) {
      const form = new FormData();
      form.append('model', 'gpt-image-2.5-sunburst');
      form.append('prompt', finalPrompt);
      for(let i=0;i<refs.length;i++){const match=String(refs[i].image||'').match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);if(!match)continue;const mime=match[1].toLowerCase(),bytes=Buffer.from(match[2],'base64'),extension=mime.includes('png')?'png':mime.includes('webp')?'webp':'jpg';form.append('image[]',new Blob([bytes],{type:mime}),`cast-reference-${i+1}.${extension}`);}
      form.append('size', '1024x1024');
      form.append('quality', 'low');
      form.append('output_format', 'webp');
      r = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form
      });
    } else {
      r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-image-2.5-flare',
          prompt: finalPrompt,
          size: '1024x1024',
          quality: 'low',
          output_format: 'webp'
        })
      });
    }

    const raw = await r.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = {}; }

    if (!r.ok) {
      const e = data && data.error;
      const message = typeof e === 'string' ? e : (e && (e.message || e.code || e.type)) || `OpenAI returned HTTP ${r.status}`;
      await refundSlot();
      return res.status(502).json({ error: String(message), openai_status: r.status });
    }

    const item = Array.isArray(data.data) ? data.data[0] : null;
    if (!item || typeof item.b64_json !== 'string') {
      await refundSlot();
      return res.status(502).json({ error: 'The image service returned no image.' });
    }

    await logUsage({event_type:'image',estimated_cost_gbp:estimateGBP('image',{reference:hasReference}),metadata:{reference:hasReference,user_id:moonbeamUser.id,generation_run_id:generationRunId,required_story_image:requiredStoryImage===true,story_image_index:Number.isInteger(storyImageIndex)?storyImageIndex:null,recovery_slot:recoverySlot===true}});
    slotReserved=false;
    return res.status(200).json({ image: `data:image/webp;base64,${item.b64_json}`, usedReferencePhoto: hasReference });
  } catch (e) {
    console.error('illustrate error', e);
    if(slotReserved&&reservedUserId&&reservedRunId){try{await refundGenerationSlot(reservedUserId,reservedRunId,'image');slotReserved=false}catch(refundError){console.error('illustration slot refund failed',refundError)}}
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
