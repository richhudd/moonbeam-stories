# Moonbeam Stories V49

## V48 desktop story-page fitting fix
- Desktop story text is now measured against the actual rendered page height after every page turn.
- If a page would clip its final line, the text is reduced in small increments until the complete page fits with a safety margin.
- The existing phone illustration+text layout and photo-linked illustration pipeline are unchanged.

# Moonbeam Stories V38

V38 prevents repeated consecutive illustrations.

- Every illustration prompt is now anchored to that page's actual story text and scene number.
- Previous-page text is supplied only as continuity context with an explicit instruction not to re-illustrate it.
- Prompts require a fresh composition, camera angle/action and scene-specific visual details on every page.
- Illustration cache keys now include a V38 version and prompt hash, so older cached duplicates are not reused after deployment.
- If the image service ever returns an exactly identical image for two consecutive pages, Moonbeam automatically regenerates the latter once with a stronger anti-duplicate instruction.
- All V37 mobile cover/narration fixes are retained.


## V47
- Moves the portrait-phone page counter out of the illustration and into a reserved strip below the text.
- Mobile text fitting now reserves space for the counter so it cannot cover the final line.


## V47
- On portrait phones, the narration play/pause control is moved out of the illustration and into the reserved lower reader strip beside the page counter.
- Illustrations are now kept completely free of reader controls and counters.


## V47
- Narration now follows the selected regional language: UK English uses a British accent, US English an American accent, Spain Spanish a Peninsular Spanish accent, Latin American Spanish a neutral Latin American accent, and equivalent regional guidance is used for French, German, Italian and European Portuguese.


## V47
- Regional narration now changes the underlying OpenAI built-in voice as well as the accent instruction.
- UK English uses `fable` rather than the US-oriented `marin` used previously.
- Other language regions also have their own base voice selection.
- Narration still explicitly reinforces the selected regional pronunciation.

## V47
- Reworked the mobile cover rendering rather than adding another image repaint workaround.
- Portrait phones now paint the generated cover into a dedicated full-screen CSS background layer.
- The normal `<img>` cover remains available for desktop, but mobile no longer depends on Safari painting that element correctly on its first frame.
- The cover loading overlay is dismissed only after the background layer has had multiple paint frames.

## V47
- Restores and hardens child-photo identity references for cover and interior illustrations.
- When a photo is enabled, Moonbeam reloads it from local IndexedDB immediately before story generation if necessary.
- Reference-photo illustrations now use GPT-Image-2.5 Sunburst, which OpenAI positions for precise image editing, while non-photo generations remain on Flare for speed.
- New cache version prevents older non-photo illustrations being reused.
- The illustration endpoint confirms whether a reference photo was actually used; Moonbeam treats a dropped reference as an error instead of silently generating a generic child.
- Reworked mobile cover again: the generated base64 image is converted to a Blob URL and displayed through a real full-screen `<img>`, avoiding iPhone Safari's unreliable first paint of very large data URLs/CSS backgrounds.

## V47
- Mobile cover architecture changed completely.
- Portrait phones now obtain their initial cover artwork from the exact same opening-page illustration pipeline that successfully creates the interior child-photo illustrations.
- The story title, Moonbeam kicker and child subtitle remain HTML overlays, so the opening artwork functions as a proper front cover immediately.
- A dedicated cover composition is still requested afterward and replaces the fallback if successful.
- If the dedicated cover request fails, the working illustrated fallback remains visible; mobile can no longer drop into a blank-cover state just because the separate cover request failed.
- Cover is explicitly fixed to the phone viewport with deterministic layer stacking.

## V47
Run SUPABASE_V47_USAGE.sql. Add SUPABASE_SERVICE_ROLE_KEY and MOONBEAM_DEVELOPER_EMAIL in Vercel. Optional GBP estimates: MOONBEAM_COST_STORY_GBP, MOONBEAM_COST_IMAGE_GBP, MOONBEAM_COST_REFERENCE_IMAGE_GBP, MOONBEAM_COST_NARRATION_GBP. Then visit /usage.html while signed in as developer.

## V47 — Supabase secret-key compatibility fix
V46 incorrectly treated Supabase's newer `sb_secret_...` key as a Bearer JWT.
V47 fixes this:
- `sb_secret_...` is sent as the `apikey` header only for server-side admin/REST calls.
- Legacy service-role JWTs remain supported.
- The signed-in Moonbeam user's own JWT is used only for `/auth/v1/user` verification.
- Usage logging and `/usage.html` should now work with Supabase's current secret-key format.

No new SQL is required if `SUPABASE_V46_USAGE.sql` was already run.
No new Vercel variables are required if `SUPABASE_SERVICE_ROLE_KEY` and
`MOONBEAM_DEVELOPER_EMAIL` are already set.


## V49 desktop text clipping fix
Desktop story text now checks the actual painted text bounds against the physical paper page with an 18px safety margin, shrinking only when necessary. This fixes final-line clipping caused by vertically centred flex layout/font metrics. No API, image, narration, mobile reader, or usage-tracking behaviour changed.
