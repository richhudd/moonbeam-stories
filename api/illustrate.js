const {logUsage,countUsageEvents,estimateGBP}=require('../_usage');
const {verifyMoonbeamUser,consumeGenerationSlot,refundGenerationSlot,refundReservedStoryCredit}=require('../_credits');
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
    const continuityImage = /^data:image\/(?:jpeg|png|webp);base64,/i.test(body.continuityImage || '') ? body.continuityImage : '';
    const requiredStoryImage = body.requiredStoryImage === true;
    const storyImageIndex = Number.isInteger(body.storyImageIndex) ? body.storyImageIndex : null;
    const storyCreditBatchId = String(body.storyCreditBatchId || '').trim();
    // V194: the client already sends the story's character bible as `style`.
    // It was previously ignored here, so recurring non-photo characters were being
    // re-invented independently on every image request. Treat it only as immutable
    // character continuity data; it must never alter the V193 house rendering style.
    const characterContinuity = typeof body.style === 'string' ? body.style.trim() : '';
    if (!prompt) return res.status(400).json({ error: 'An illustration prompt is required.' });
    if (!generationRunId) return res.status(400).json({ error: 'This story does not have a valid generation allowance.' });
    const moonbeamUser = await verifyMoonbeamUser(req);
    const developerCorrectionRequested=body.developerCorrection===true;
    const developerEmail=String(process.env.MOONBEAM_DEVELOPER_EMAIL||'').trim().toLowerCase();
    const developerCorrection=developerCorrectionRequested&&developerEmail&&String(moonbeamUser.email||'').trim().toLowerCase()===developerEmail;
    if(developerCorrectionRequested&&!developerCorrection)return res.status(403).json({error:'Developer access only.'});
    let recoverySlot=false;
    try { if(!developerCorrection) await consumeGenerationSlot(moonbeamUser.id,generationRunId,'image'); }
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
    if(!recoverySlot&&!developerCorrection){slotReserved=true;reservedUserId=moonbeamUser.id;reservedRunId=generationRunId;}
    const refundSlot=async()=>{if(slotReserved){slotReserved=false;await refundGenerationSlot(reservedUserId,reservedRunId,'image')}};

    const refs=(Array.isArray(referenceImages)?referenceImages:[]).filter(r=>r&&/^data:image\/(jpeg|png|webp);base64,/i.test(r.image||''));if(!refs.length&&/^data:image\/(jpeg|png|webp);base64,/i.test(referenceImage||''))refs.push({name:'main hero',kind:'child',role:'hero',image:referenceImage});
    const hasReference = refs.length>0;
    const hasContinuityReference = Boolean(continuityImage);
    const hasAnyReference = hasReference || hasContinuityReference;
    const identityDirection = hasReference
      ? `\nIDENTITY REFERENCES — ABSOLUTE CAST IDENTITY LOCK\nThe attached photographs are NOT generic inspiration. Each photograph is the authoritative identity reference for exactly ONE selected Cast member, mapped in attachment order as follows: ${refs.map((r,i)=>`REFERENCE ${i+1} = ${r.name||'character'} | kind: ${r.kind||'character'} | role: ${r.role||'supporting'}${r.gender?` | marker: ${r.gender}`:''}`).join('; ')}.\nFor EVERY mapped Cast member, child, adult or pet, reproduce that specific individual whenever the named character appears. Adult identity references have exactly the same priority and force as child identity references. Do not invent an alternative face or appearance for a photographed adult and do not use the real photographed adult later as a different extra person. Preserve recognisable face shape, eyes, nose, mouth anatomy, hair colour/texture, approximate skin tone, apparent age and overall physical identity. The reference expression is NOT a pose that must be copied into every scene: let emotion follow the story naturally. You may safely reduce visible expression information — for example, a photographed toothy smile may become closed-mouth, neutral, serious, worried, surprised or thoughtful when the scene calls for it. But do NOT invent personal facial information that the reference does not reveal. In particular, if the reference does not show the person's teeth or an open-mouth smile, do not invent visible teeth or a broad open-mouth smile; convey happiness through a natural closed-mouth smile, cheeks, eyes and expression instead. If teeth/open-mouth smile are visible in the reference, that observed smile may be used when appropriate but is never compulsory. If a photographed human Cast member is marked male, do not invent hair clips, bows, barrettes, decorative stars, tiaras, ornamental headbands or similar decorative hair accessories unless the accessory is clearly visible in the uploaded reference photo or explicitly required by the story. An accidental accessory in earlier generated artwork is not authoritative and should not be preserved. For photographed pets preserve species/breed appearance, coat, body proportions and relative size. Translate each real identity naturally into the fixed Moonbeam painted style rather than making the result photographic. Reference background, clothing, gaze, head angle and pose are NOT identity requirements unless the scene calls for them. Never merge identities, swap faces, assign one reference to another named character, use a reference as a generic person, or create both an invented version and the real version of the same Cast member. One named Cast member = one stable visual identity across the whole book.`
      : '';
    const continuityDirection = hasContinuityReference
      ? `\nPREVIOUS ARTWORK — AUTHORITATIVE WORLD AND OBJECT CONTINUITY REFERENCE\nThe final attached image after any Cast photographs is the immediately preceding continuity artwork. For Scene 1 this may be the finished front cover; for later scenes it may be the preceding page artwork. Use it to preserve the established visual identity and physical state of recurring locations, buildings, rooms, vehicles, machines, props, clothing and other plot-important objects. Keep the same number, overall structure, proportions, materials, colours, weathering, layout, openings and placement/shape of distinctive parts. One established lighthouse remains one lighthouse; one established wheel, handle or control remains that exact same component. Do not create a duplicate merely because the camera now looks from another angle. Story-required changes may occur, but otherwise the established design is immutable. This reference controls continuity only: do NOT copy its composition, camera angle, crop, poses or staging. The current scene direction controls the new action and viewpoint. Do not treat people visible in this artwork as additional identity photographs or extra Cast members.`
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

    const correctionPrefix = developerCorrection ? `SURGICAL IMAGE EDIT MODE. The FIRST supplied reference image is the existing illustration being corrected and is the visual master. Preserve all unrelated visible details as closely as possible. Do NOT create a new composition. Change only the developer-identified error and the minimum dependent detail required for physical coherence. The usual instruction below to create a new composition does NOT apply to this correction request.\n\n` : '';
    const finalPrompt = `${correctionPrefix}Create a single full-page illustration for a premium children's storybook.

${MOONBEAM_HOUSE_STYLE}
${identityDirection}
${continuityDirection}

RECURRING CHARACTER CONTINUITY — IMMUTABLE ACROSS THE ENTIRE BOOK
${characterContinuity || 'Keep every recurring non-photo character exactly consistent across all scenes.'}
For every recurring non-photo character, treat the supplied description as a fixed model sheet. For every recurring PHOTO-REFERENCED character, the mapped photograph above is the primary fixed model sheet for identity and overrides any conflicting invented description. The same named or recurring character must remain the same person, animal, robot or creature in every illustration: preserve exact apparent age, sex where specified, facial structure, skin/fur/material colours, eye colour, hair/fur colour and texture, hairstyle, height/build, body proportions, distinctive features and established clothing/accessories. Never age a recurring character up or down. Never redesign, reinterpret or substitute them with a different-looking character. Unless the story explicitly changes clothing or appearance, preserve it exactly. If a recurring character is a child, they must remain visibly the stated age in every scene. Character continuity is higher priority than novelty of casting, but it must NOT change or override the fixed Moonbeam rendering style above.

VISUAL STORYTELLING — COMPOSITION
${developerCorrection ? 'This is a surgical correction: preserve the composition of the FIRST supplied reference image and change only the identified error.' : 'Illustrate WHAT IS HAPPENING, not merely where the protagonist is. Identify the principal action, discovery, interaction, emotional moment or consequence on this page and make that the visual subject. Keep recurring characters, locations and important objects consistent, but begin a new composition rather than copying the preceding picture.'} Use one physically possible scene from one camera position. Do not invent events or duplicate characters, buildings or objects.

ILLUSTRATE THE EVENT, NOT EVERY SENTENCE
Treat the supplied page text and scene direction as context for the illustration, not as a checklist of every object, action and description that must appear. Understand the whole passage and choose ONE strongest illustrative moment. If several details compete, prioritise the event that changes or advances the story rather than an easier incidental object, static portrait or generic view of the setting. Build one clear coherent scene around that event. Include only the characters, objects and environmental details needed for that unified moment. Select one or two distinctive supporting details from the text when useful to tie the picture unmistakably to this page, but omit secondary details when including them would crowd, confuse or fragment the composition. Prefer visual clarity, strong composition and one believable unified moment over exhaustive literal coverage of the prose.

PHYSICAL AND SPATIAL COHERENCE
Before composing the image, respect where the text and established continuity place each important character, object, vehicle component, doorway, window, control or piece of equipment. The depicted action must be physically possible from those positions. Do not silently move an exterior mechanism inside, change the geometry of a vehicle or room, or substitute a visually easier action for the page's actual consequential event. Preserve established clothing, important objects, vehicles, architecture and spatial relationships unless the story explicitly changes them.

SUCCESSIVE-PAGE VISUAL PROGRESSION
Successive illustrations should feel like successive moments in one continuous adventure rather than a collection of attractive portraits. When the story provides it, vary action, viewpoint, distance and composition so the visual narrative progresses. Visual variety must come from changing events in the story, never from arbitrarily redesigning established characters, environments, vehicles or objects.

RECURRING VISUAL ELEMENT CONTINUITY
When the story establishes a distinctive recurring object, vehicle, machine, building, creature or important environment, treat its defining visual characteristics as persistent identity features across the book. Preserve the established overall shape, proportions, materials, colours and the number and placement of major distinctive parts such as controls, pedals, wheels, handles, screens, doors, markings or architectural features. Different viewpoints are welcome, and story events may legitimately open, move, illuminate, dirty, damage or otherwise alter it when the text requires, but do not arbitrarily redesign it between illustrations. Apply this continuity rule to visually important recurring elements, not to ordinary incidental background objects.

SCENE CONTENT — CONTENT ONLY; IT MUST NOT OVERRIDE THE FIXED HOUSE STYLE ABOVE
${prompt}

IMPORTANT
- This is an illustration for children aged 3-12.
- Keep the mood warm, adventurous and reassuring. When a scene contains a drop, opening, water, traffic, moving vehicle, machinery or similar hazard, preserve the event and suspense but compose it so any child is visibly secure through sensible distance, positioning, barriers, handrails or camera viewpoint; do not depict injury or place the child directly in the hazard's path.
- Follow the scene's actual setting, weather and time of day. Do NOT infer nighttime, moonlight, stars, darkness, sleep, bedrooms, pyjamas or bedtime imagery merely because this is a children's story. Use night only when the supplied scene genuinely calls for it.
- No words, letters, captions, signs, logos or typography anywhere in the image.
- Preserve the fixed Moonbeam realism level above; do not drift toward either photography or cartoon/animation rendering.
- Compose the scene as a beautiful book illustration with clear focal characters and readable silhouettes.
- Keep character appearance consistent with the named Cast identity. When a reference photograph is supplied, that photograph is authoritative over any conflicting scene description, equally for children, adults and pets.
- MALE CAST ACCESSORY RULE: when a photographed human Cast member is marked male, do not add decorative hair clips, bows, barrettes, star ornaments, tiaras, ornamental headbands or similar decorative hair accessories unless clearly present in the uploaded reference photo or explicitly required by the story.
- CAST DISCIPLINE: do not promote incidental/background people into prominent companions, family members or recurring characters. Do not add an invented spouse, partner, child, relative or friend to a selected Cast member unless the scene explicitly requires that already-established person. Background crowds may exist naturally but should remain visually secondary.
- CHARACTER UNIQUENESS: never accidentally duplicate a named or recurring character. Each character should have only ONE PHYSICAL INSTANCE in the scene. A second visual depiction is allowed only when the story or scene explicitly requires it, such as a mirror reflection, photograph, portrait, video/screen image, shadow, dream/vision, or another clearly non-physical representation. Never create two physical copies, clones or repeated instances of the same person, child, adult, pet, robot or creature. A reference photo identifies one character, not an instruction to add another physical copy of them.
- ${developerCorrection ? 'CORRECTION EXCEPTION: this request edits an existing page. Keep its composition, pose, camera angle and background staging unless the developer correction specifically requires one of those details to change.' : 'Every page in a story must be a genuinely new illustration. If the scene prompt identifies a page/scene number or previous-page context, use that information to advance the visual action and avoid repeating the previous composition, pose, camera angle or background staging.'}
- ONE continuous scene only: never create a collage, contact sheet, comic strip, grid, split screen, diptych, triptych, multiple panels, inset pictures or multiple frames.
- The finished output must look like one uninterrupted full-page painting viewed through one camera/composition.
- Square composition suitable for the right-hand page of a children's book.`;

    const callImageModel=async(requestPrompt)=>{
      let response;
      if (hasAnyReference) {
        const form = new FormData();
        form.append('model', 'gpt-image-2.5-sunburst');
        form.append('prompt', requestPrompt);
        for(let i=0;i<refs.length;i++){const match=String(refs[i].image||'').match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);if(!match)continue;const mime=match[1].toLowerCase(),bytes=Buffer.from(match[2],'base64'),extension=mime.includes('png')?'png':mime.includes('webp')?'webp':'jpg';form.append('image[]',new Blob([bytes],{type:mime}),`cast-reference-${i+1}.${extension}`);}
        if(continuityImage){const match=continuityImage.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);if(match){const mime=match[1].toLowerCase(),bytes=Buffer.from(match[2],'base64'),extension=mime.includes('png')?'png':mime.includes('webp')?'webp':'jpg';form.append('image[]',new Blob([bytes],{type:mime}),`previous-page-continuity.${extension}`);}}
        form.append('size', '1024x1024');form.append('quality', 'low');form.append('output_format', 'webp');
        response=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`},body:form});
      } else {
        response=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-2.5-flare',prompt:requestPrompt,size:'1024x1024',quality:'low',output_format:'webp'})});
      }
      const responseRaw=await response.text();let responseData={};try{responseData=JSON.parse(responseRaw)}catch{}
      return {response,raw:responseRaw,data:responseData};
    };
    const safetyRejected=(result)=>{if(result?.response?.ok)return false;const e=result?.data?.error;const msg=String(typeof e==='string'?e:(e?.message||e?.code||e?.type||result?.raw||'')).toLowerCase();return msg.includes('safety')||msg.includes('moderation')||msg.includes('content policy')||msg.includes('policy violation')};
    let first=await callImageModel(finalPrompt),result=first,safetyRetryUsed=false;
    if(safetyRejected(first)&&requiredStoryImage&&!developerCorrection){
      safetyRetryUsed=true;
      const saferPrompt=`SAFETY RESTAGING REQUIRED — DO NOT REUSE THE REJECTED COMPOSITION. Preserve the same storyboard event, Cast identities, setting, continuity, narrative meaning and excitement, but choose a substantially different camera position and staging. Put every child on clearly stable, secure ground and create obvious physical separation from any drop, open shaft, deep or fast water, falling debris, traffic, moving vehicle, machinery or other hazard. Show the dangerous event at a distance, behind or beyond the child, beyond a barrier/handrail where natural, or from a viewpoint that keeps the hazard visible without placing the child in its immediate path. If the storyboard's literal VISUAL MOMENT describes the child on a narrow ledge, at an edge, beneath falling material or immediately beside a hazard, do NOT preserve that exact placement on this retry; preserve the narrative fact by restaging the same event from a secure position. Do not depict injury, blood, falling, drowning, crushing, frightening restraint, exposed bodies or ambiguous physical contact. Do not remove the danger from the story, add adult rescue, or invent a different plot event.\n\n${finalPrompt}`;
      result=await callImageModel(saferPrompt);
    }
    const r=result.response,raw=result.raw,data=result.data;
    if (!r.ok) {
      const e=data&&data.error,message=typeof e==='string'?e:(e&&(e.message||e.code||e.type))||`OpenAI returned HTTP ${r.status}`;
      const finalSafety=safetyRejected(result);
      await refundSlot();
      if(finalSafety&&requiredStoryImage&&!developerCorrection){
        let creditsRemaining=null,creditRefunded=false;
        if(storyCreditBatchId){
          try{
            const runMeta={user_id:moonbeamUser.id,generation_run_id:generationRunId};
            const already=await countUsageEvents('story_image_safety_refund',runMeta);
            if(already===0){const marker=await logUsage({event_type:'story_image_safety_refund',estimated_cost_gbp:0,metadata:{...runMeta,story_image_index:storyImageIndex}});if(marker){creditsRemaining=await refundReservedStoryCredit(moonbeamUser.id,storyCreditBatchId);creditRefunded=true}}
          }catch(refundError){console.error('story safety credit refund failed',refundError)}
        }
        const developerDiagnostic=developerEmail&&String(moonbeamUser.email||'').trim().toLowerCase()===developerEmail?{
          stage:`illustration ${Number.isInteger(storyImageIndex)?storyImageIndex+1:'unknown'}`,
          scene_prompt:prompt.slice(0,6000),character_continuity:characterContinuity.slice(0,3000),
          first_rejection:first.raw.slice(0,1800),retry_rejection:raw.slice(0,1800),automatic_retry_used:safetyRetryUsed
        }:undefined;
        return res.status(502).json({error:String(message),code:'IMAGE_SAFETY_REJECTION',openai_status:r.status,automatic_retry_used:safetyRetryUsed,credit_refunded:creditRefunded,creditsRemaining,...(developerDiagnostic?{developer_image_diagnostic:developerDiagnostic}:{})});
      }
      return res.status(502).json({error:String(message),openai_status:r.status});
    }

    const item = Array.isArray(data.data) ? data.data[0] : null;
    if (!item || typeof item.b64_json !== 'string') {
      await refundSlot();
      return res.status(502).json({ error: 'The image service returned no image.' });
    }

    await logUsage({event_type:'image',estimated_cost_gbp:estimateGBP('image',{reference:hasAnyReference}),metadata:{reference:hasReference,continuity_reference:hasContinuityReference,user_id:moonbeamUser.id,generation_run_id:generationRunId,required_story_image:requiredStoryImage===true,story_image_index:Number.isInteger(storyImageIndex)?storyImageIndex:null,recovery_slot:recoverySlot===true,developer_correction:developerCorrection===true}});
    slotReserved=false;
    return res.status(200).json({ image: `data:image/webp;base64,${item.b64_json}`, usedReferencePhoto: hasReference });
  } catch (e) {
    console.error('illustrate error', e);
    if(slotReserved&&reservedUserId&&reservedRunId){try{await refundGenerationSlot(reservedUserId,reservedRunId,'image');slotReserved=false}catch(refundError){console.error('illustration slot refund failed',refundError)}}
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
