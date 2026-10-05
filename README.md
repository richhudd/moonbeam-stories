## V252.242 — second wife-library image now uses a random erotic solo nude pose
- The second private Wife Library image is no longer a neutral full-body nude reference pose.
- It is now generated as a **full-body solo nude image in a random strongly erotic pose**, while still preserving the wife’s identity from the canonical portrait.
- It remains **one person only**, library-only, and **excluded from book production**.
- The two-image gallery/lightbox behaviour from V252.241 is unchanged.

## V252.241 — second private wife-library image and swipeable gallery
- Each newly generated Asunder wife now gets **two stored images**:
  1. the normal clothed canonical portrait, and
  2. a second **full-body nude** gallery image generated from the canonical portrait to preserve identity.
- The second image is stored only on the wife record inside `profile_data.nude_portrait_path`; **no Supabase schema change** is required.
- The Wife Library grid still shows **only the clothed canonical image**.
- Clicking the image now opens a **gallery lightbox** with desktop arrows and mobile horizontal swipe.
- The new nude image is **not used in book production**; it exists only in the Wife Library gallery.

## V252.240 — ethnicity is now a dropdown in Wife Library generation
- The Wife Library **Ethnicity** field is now a dropdown menu rather than a free-text box.
- Options include: White European, Black African, Black Caribbean, East Asian, South Asian, Southeast Asian, Middle Eastern / North African, Latina / Hispanic, Mixed-race, and Mediterranean.
- Leaving it on **No preference** keeps ethnicity unconstrained.
- No backend or Supabase changes were needed because the selected dropdown value is still passed through as the same `ethnicity_background` preference string.

## V252.239 — hard variety for Asunder wife portrait clothing and settings
- Added a deterministic portrait-variety layer for Wife Library generation so consecutive wives cannot keep collapsing into the same kitchen/background and similar top/trouser combinations.
- Each generated wife is assigned a rotating **outfit category** and **setting category** before Luna designs the detailed canonical profile.
- The new wife must also avoid reusing the setting type or clothing silhouette of the most recent four library wives.
- Explicit anti-repeat language now blocks recurring **kitchen / fruit-bowl / counter** compositions and recurring **camisole/tank/short-sleeved top + dark trousers** looks when they appeared recently.
- The favourite natural realistic partner-taken phone-photo prompt is unchanged.
- The slim/slender default, optional Age/Ethnicity/Breast size/Hair/Eyes controls, and one-person-only safeguard are unchanged.

## V252.238 — fix Wife Library image enlargement
- Replaced the delegated click handler with a direct click handler on each Wife Library portrait and full-profile portrait.
- Clicking a portrait now opens a fresh full-screen lightbox above the Fiction Studio UI.
- The lightbox uses the maximum browser z-index and removes itself cleanly when closed.
- Close by clicking outside the image, pressing ×, or pressing Escape.
- Added a visible `Click to enlarge` title on portrait images.

## V252.237 — add breast size back to Asunder wife generation
- The Wife Library generation controls now include **Breast size** again alongside **Age**, **Ethnicity**, **Hair colour**, and **Eye colour**.
- A selected breast size is passed through as a hard generation preference and set directly on the wife’s canonical appearance before portrait generation.
- Supplied hair colour and eye colour now replace conflicting generated values rather than being appended alongside them.
- The broad slim/slender default remains in force.
- The favourite natural realistic partner-taken portrait prompt remains the default, with the one-person-only safeguard intact.

## V252.236 — restore the favourite Asunder wife portrait prompt
- The default Wife Library portrait route has been restored to the **natural realistic husband/partner-taken phone-photo prompt** that generated wives such as Amanda Souza, Ebba Lindberg, Lauren Kim and Tuva Söderberg.
- Wife generation now again accepts only four optional controls: **Age**, **Ethnicity**, **Hair colour**, and **Eye colour**.
- Supplied values for those four controls now **replace** conflicting generated values instead of being appended alongside them.
- Ethnicity is treated as a **broad ethnicity/background cue**, not a country requirement.
- The restored portrait prompt keeps the later safety fix that enforces **exactly one visible human being** in the image, so no background people should appear.

## V252.234 — click-to-enlarge Wife Library portraits
- Wife Library portrait thumbnails are now clickable.
- Clicking a portrait opens a large lightbox view using the full available browser viewport.
- The same click-to-enlarge behaviour also works on the full canonical wife profile page and during wife selection/casting.
- Click outside the enlarged image, press ×, or press Escape to close it.
- No Supabase SQL changes required.

## V252.233 — exact height in centimetres
- Replaced the vague Height dropdown with a numeric **Height (cm)** field.
- Blank still means no preference.
- A supplied height is stored as exact canonical height (for example `168 cm`) and passed to the wife profile/portrait pipeline as a hard requirement.
- Height remains independent from weight, body type and bust size.

## V252.232 — stronger beauty requirement for Asunder wives
- Asunder wife profile portraits are now explicitly required to be **stunningly attractive / exceptionally attractive** while still remaining recognisably real and individual.
- The main Venice portrait prompt, the alternate portrait prompt, the fallback portrait prompt and the reference-image portrait prompt now all state that attractiveness must be preserved **within the woman’s own ethnicity/background, age, body type and canonical traits**.
- This strengthens the old weaker wording (such as merely “naturally attractive”) which could undershoot and produce wives who looked too ordinary.
- The realism bans remain in place: no plastic skin, no generic AI glamour face, no airbrushed doll-like finish.

## V252.231 — optional canonical weight control for Asunder wives
- Adds **Weight (kg)** to the Wife Library generation controls.
- Weight is optional; blank means the engine chooses freely.
- A supplied weight is stored in the wife’s canonical `appearance_spec` and is passed separately to portrait generation alongside height, body type and bust size.
- Image prompts state that a supplied numeric weight is hard canon and that visible body mass/proportions must be consistent with the combined weight, height and body-type constraints.

## V252.230 — height and clothing wife-generation controls
- Adds optional **Height** and **Clothing** controls to the Asunder Wife Library generation menu.
- Height choices: Very short, Short, Average height, Tall, Very tall.
- Clothing choices include cosy knitwear, smart workwear, formal/elegant, refined casualwear, casualwear, soft eveningwear, seductive but non-explicit, bikini, sarong/beachwear, and holiday/resort wear.
- Blank still means no preference. Any selected value is hard canon for the generated wife and portrait.
- Height is now passed separately from body type into the portrait prompt, and clothing is passed as canonical portrait outfit; neither can be silently dropped or substituted.

## V252.229 — all wife trait fields enforced in portrait generation
- The main Asunder portrait-generation path now treats every supplied visible wife trait as mandatory image canon.
- `bust_size` is now passed into the safe portrait payload and explicitly enforced in the Venice, reference-image and fallback portrait prompts.
- If a breast-size choice is supplied (for example **E-cup or fuller**), the prompt now states that it must be visibly reflected and must not be flattened, hidden or downplayed by clothing, framing or pose.
- The main Venice portrait prompts no longer include the ambiguous line about “the four women” and now carry the one-person-only composition rule directly.
- Main portrait prompts now describe the setting as private or visibly empty so they do not invite background people.

## V252.228 — add "Very slender" wife body-type option
- The Asunder Wife Library generation form now includes **Very slender** as an explicit body-type choice.
- This behaves like the other optional trait filters: if selected, it is passed through as a hard wife-generation preference; if left blank, the engine chooses freely.
- No other Wife Library behaviour has changed.

## V252.227 — Wife Library four-column desktop grid
- The Asunder Wife Library now displays **four wife cards per row on desktop**.
- Portraits and card padding are reduced so more of the library is visible at once without oversized images.
- Responsive fallbacks use 3 columns on narrower desktop/tablet widths, 2 columns on tablets, and 1 column on small phones.
- Wife profile detail pages and casting behaviour are unchanged.

## V252.226 — optional per-wife intimacy direction at volume setup
- The Asunder casting page now shows an **Intimacy direction (optional)** text box beneath each of the four selected wives.
- The text is stored with that wife’s locked volume-cast entry and passed into Sol’s ten-beat vignette planner.
- A blank box explicitly means **no developer constraint**: Sol keeps the normal high-intensity Asunder erotic contract, chooses the escalation freely, and Aion invents the explicit material for its assigned beats.
- Blank therefore never means tame, reduced-intensity, or sex-free.
- Any supplied direction is vignette-specific and does not alter the wife’s permanent Wife Library canon.

## V252.225 — visible Sol/Aion ten-beat writer map
- The live Asunder book-generation page now exposes Sol's saved 10-beat plan for every vignette as soon as that vignette has been planned.
- Every beat shows its **beat number, assigned writer (Sol or Aion), working label/purpose, and live status** (Planned / Writing / Saved).
- Each vignette summary also lists the Aion-assigned beat numbers at a glance.
- Completed vignette maps are read from the persisted beat-history archive, so their original assignments remain visible after lock.
- Future vignettes display **Not planned yet** until Sol has actually created their beat map; no assignments are guessed in advance.
- This is display-only: it does not alter the V252.224 hybrid drafting, checkpointing, editorial, or recovery logic.

## V252.224 — sexually charged Sol buildup without premature explicit sex
- Resolves the remaining conflict between the new 10-beat Sol/Aion pipeline and older Asunder “early/frequent sex” instructions.
- The hard Asunder contract now distinguishes **early erotic charge** from **early graphic sex**: attraction and anticipation should begin early, but explicit action starts when the relationship/story has earned it.
- Sol beats are no longer allowed to become sexless connective tissue. They should carry strong anticipatory charge through attraction, bodily awareness, clothing, glances, fantasy, messages, jealousy, nervousness, embarrassment, curiosity, power, expectation, charged proximity and aftermath where appropriate.
- Beats 1–2 remain Sol-written and non-explicit, but are instructed to be erotically alive rather than neutral exposition.
- The code-enforced seed contract no longer pressures the pipeline to rush graphic sex merely to avoid “sex-neutral setup”.

## V252.223 — Sol-written standalone prologue for every Asunder volume
- Every newly generated Asunder volume now gets a short **Sol-written Prologue before Vignette 1**.
- The first movement briefly explains what the fictional Asunder private-members app/community is and why consenting married adults might use it, so any volume can be read as a standalone entry point.
- The second movement gives a **volume-specific spoiler-free teaser of the four selected wives in vignette order**, using their saved canonical profiles and approved story premises.
- The prologue is deliberately non-explicit and compact; it is orientation and anticipation, not a fifth vignette.
- It is stored at book level in `generation_state.asunder_prologue`, leaving the four-vignette numbering, continuity ledger, cover/profile mapping and word-count machinery unchanged.
- It is generated once, checkpointed before Vignette 1 begins, and reused thereafter rather than regenerated on every reader open.
- Desktop and mobile readers now place the prologue after the cover and before the first wife/profile page.
- Complete review exports include `first-draft/prologue.txt`, and the prologue is prepended to `first-draft/full-manuscript.txt`.

## V252.222 — Asunder ten-beat hybrid Sol/Aion vignette drafting
- Replaces the normal new-vignette five-chunk all-Aion drafting pattern with a **ten-beat hybrid pipeline**.
- **Sol always creates the ten-beat map**, regardless of which model was used for high-level Book Development. Every saved beat carries an explicit `writer` assignment: `sol` or `aion`.
- Beats **1 and 2 must be Sol-written and non-explicit**, establishing real marriage texture and the couple's route into Asunder before pornographic action begins. The planning brief explicitly asks for how the couple met / what drew them together, ordinary marital dynamics, who first raised Asunder, why they signed up, what each thinks the other wants, and private hopes/fears.
- Sol writes the relationship, psychological, social, anticipatory, connective and aftermath beats. Aion is called only for beats Sol marks as requiring **sustained explicit prose**.
- The plan must contain at least two Aion beats, but their positions are not fixed; the pipeline explicitly forbids a universal 'first X Sol / last Y Aion' formula beyond the required opening relationship runway.
- The Asunder erotic drafting overlay no longer pressures the story to activate explicit sex within the first 10% or reach a major encounter by 25–30%. It now prioritises earned buildup first, then sustained/direct explicit delivery once the vignette crosses that threshold.
- Every one of the ten beats is checkpointed independently with the writer/model that produced it, preserving crash recovery, duplicate-request locks and resume behaviour.
- The UI now shows the current **beat number and next writer (Sol or Aion)** rather than assuming Aion is writing 5/5 chunks.
- Sol's post-assembly continuity/anti-AI gate now reviews the ten-beat hybrid draft. Exact-text repair remains protected by the existing erotic shield, so Aion-authored explicit passages cannot be sanitised during cleanup.
- Backward compatibility: if an older in-progress vignette already contains saved prose in the legacy five-chunk format, it finishes that existing paid checkpoint safely rather than discarding it. New vignette plans use ten beats.
- Existing stitch/pattern-repair locators now accept beat numbers up to 10. No Supabase schema change is required.

## V252.221 — portrait-verified distinguishing marks in Asunder prose
- Asunder manuscript generation no longer treats pre-image `distinguishing_features` as authoritative for small visible identifiers such as freckles, moles/beauty marks, scars, birthmarks, tattoos or piercings.
- Before drafting with a wife whose portrait has not yet been checked, Luna performs a conservative vision pass over the saved canonical portrait and stores `photo_verified_distinguishing_features` in the existing appearance JSON.
- If a mark is not clearly visible in the finished portrait, the verified value becomes `none visible` and the story writer is explicitly forbidden from mentioning or implying it, even if the earlier profile-generation notes contained it.
- For manuscript context, the photo-verified feature list replaces the original distinguishing-mark text. The saved portrait therefore wins whenever text and image disagree.
- Existing wives are covered automatically the next time they are used; no regeneration of their portraits and no SQL migration is required.

## V252.220 — optional wife-library trait controls
- The Asunder Wife Library generation panel now includes optional controls for **age, ethnicity/background, breast size, hair colour, eye colour, and body type**.
- None of these fields is required. You can set just one trait (for example blonde hair) and leave everything else blank.
- The selected traits apply only to the **next generated wife or batch**.
- On the server side, any supplied trait is treated as a **hard generation requirement** while all unspecified traits remain free for the engine to choose.
- These trait controls feed both the canonical profile generation and the portrait-generation path, so chosen traits are saved into the wife’s canon rather than being a temporary cosmetic hint.

## V252.219 — Asunder wardrobe variety for wife profile photos
- Keeps the existing **husband/partner-taken photo feel** and **warm smiling expression** guidance for Asunder wife profile portraits.
- Expands the prompt guidance so clothing is deliberately varied and wife-specific instead of drifting back to repetitive lycra vests.
- Profile-photo wardrobe can now range across cosy knitwear, smart workwear, elegant dresses, refined casualwear, holiday outfits, subtly seductive looks, bikinis, sarongs, and other character-appropriate clothing.
- The stronger wardrobe-variety guidance has been added to the main canonical profile rules, the standard Venice portrait path, the hotter alternate portrait path, the partner/selfie variant prompts, and the reference-image portrait path.
- Repetitive defaults such as the same lycra vest, the same simple dress, or the same hotel-bar look are now explicitly discouraged.


## V252.218 — Asunder profile portraits: hard single-person rule
- All Asunder wife profile portrait prompts now enforce **exactly one visible human being**: the wife herself.
- The prohibition explicitly covers background people, crowds, passers-by, partial bodies or stray limbs, silhouettes, reflections/mirrors containing another person, a visible photographer/partner, and faces in framed photos, posters or screens.
- The rule is applied consistently to the normal Venice portrait path, the OpenAI fallback path and the reference-image portrait path.
- Profile settings must be visually unoccupied apart from the wife; husband/partner-taken framing may describe the photographic feel but must never result in the partner appearing in frame.

## V252.210 — self-healing Asunder automatic runner

- Fixes the observed failure where an Aion chunk was successfully saved but the browser orchestrator never sent the next chunk.
- Production no longer waits for the live usage/cost panel after a chunk save. Usage refresh is fire-and-forget and has a 12-second ceiling, so a cosmetic UI request cannot stall manuscript production.
- Automatic jobs now carry a heartbeat. A watchdog checks active Asunder drafting every 30 seconds.
- If the browser job goes silent for 90 seconds **and the server shows no active chunk lock**, the watchdog marks the dead local orchestrator stale and restarts from the durable server checkpoint.
- The watchdog will **not** duplicate an active Aion request: the persisted server `in_flight` chunk lock remains authoritative.
- `novel-status` now exposes current chunk `in_flight`, `last_saved_at`, and `last_error` metadata so recovery can distinguish a genuinely running provider request from a dead browser loop.
- Automatic-pipeline intent is now also checkpointed in Supabase (`generation_state.asunder_auto_pipeline`) instead of existing only in browser memory/localStorage. Reloading/reopening the book can therefore rehydrate and resume an active unpaused Asunder pipeline.
- Book/series navigation re-arms the watchdog automatically for active Asunder volumes.
- Pause, hard-error pause and successful completion are persisted to the server as well as locally.
- Existing chunk checkpoints, duplicate-generation locking, one-Aion-revision editorial limits and erotic-prose protection remain unchanged.

## V252.209 — finished-volume Asunder vignette replacement / image-led recasting

- Finished Asunder volumes now show **Replace vignette** for each of the four wives.
- A replacement can be guided by a short wife/story brief, an optional pasted/dropped/uploaded fictional reference image, or both.
- Reference images are analysed only for visible non-sensitive appearance features; nationality/ethnicity and other canon come from the explicit story brief/series plan, not image inference.
- New character names still come from the deterministic backstage demographic naming engine; Sol plans identities/roles but does not choose names.
- If a reference image is supplied, it becomes the visual source of truth for a new photorealistic husband/partner-taken canonical Asunder portrait. The source image itself is not used as the finished profile picture.
- The replacement is prepared non-destructively first. Only after the new plan, names, profile record and canonical portrait are safely saved is the selected old vignette detached.
- The old vignette plan, manuscript and profile snapshot are archived in the book generation state; the other three vignettes remain untouched.
- Only the selected vignette is removed from the lock/chunk/execution-memory ledger, so the existing automatic pipeline regenerates exactly that vignette in five chunks, runs the normal Aion → Sol gate, then rebuilds the final report/preflight/cover.
- Old editorial runs belonging to a replaced vignette are retained for audit but hidden from the active book workflow.
- Replacing Vignette 1 invalidates the old cover; all replacements invalidate the old whole-volume final report/preflight so the finished volume is recompiled from the accepted four-vignette set.
- Removed the replacement path's dependence on the old `petite=true` assumption: a reference-led wife may be short, tall, fuller, broader, athletic or otherwise distinct.

## V252.208 — deterministic anti-AI cleanup + immutable erotic prose

- Asunder Sol reviews now receive a deterministic **per-vignette** pattern scan, not the whole-volume pattern rate.
- High-density em dashes, `not X … but Y` framing, triplet rhythm and repeated stock phrases are supplied to Sol with chunk-number locators and concrete occurrence excerpts.
- After Aion's single revision, any pattern still above the Asunder intervention threshold automatically forces the final Sol targeted-repair path; Sol cannot simply approve past the remaining deterministic defect.
- Sol's final fallback receives those deterministic targets explicitly and is required to clean the remaining non-erotic AI fingerprints before the vignette locks.
- The erotic shield is stronger: if a Sol fallback patch touches a paragraph containing protected explicit sexual vocabulary, the **entire word-token sequence of that paragraph is immutable**. Sol may alter punctuation/spacing there, which lets her reduce em-dash abuse without rewriting or sanitising Aion's erotic wording.
- Any attempted word-level change inside a protected erotic paragraph is rejected server-side and logged rather than applied.
- No additional AI review is added: after Sol's targeted fallback repair, the vignette still locks automatically.

## V252.207 — simplified failsafe Asunder vignette pipeline

- Each vignette now has exactly one editorial cycle: **Aion first draft → Sol first review → one Aion revision (only if needed) → one Sol final verification**.
- If Sol confirms her original findings were repaired, the vignette locks immediately and the next vignette begins.
- If Aion did not repair the original findings, Sol performs exactly one final targeted fallback repair herself; the existing server-side erotic-content shield remains active, and the vignette then locks with **no further review**.
- The previous second Aion repair / second Sol verification loop has been removed.
- Recoverable provider failures during Asunder editorial work (including empty Aion responses, timeouts and transient 4xx/5xx provider failures) now retry automatically with capped backoff instead of pausing after three attempts.
- Review labels now match the simplified flow: **Sol first review → Sol final verification → Sol final targeted repair (only if needed)**.

## V252.206 — Asunder live pipeline clarity + per-vignette Sol length logic

- Replaces generic chapter/revision status language on Asunder Book screens with the actual hierarchy: **Volume → Vignette → Chunk**.
- The top status now reports how many of the four vignettes are locked, which vignette is active, whether it is drafting/reviewing/repairing/verifying, and—during drafting—how many of its five chunks are safely saved.
- Removes the old V252.93 whole-novel assumption from Asunder, so starting an editorial pass no longer falsely makes the UI claim all four first-draft chapters are saved.
- Asunder editorial jobs preserve meaningful activity labels such as `Aion Vignette 3 targeted repair` and `Sol Vignette 3 verification` instead of collapsing back to generic `Revision · 1 chapter saved`.
- The old `Second draft / Final gate: Human` footer is replaced for Asunder with the real automatic pipeline description.
- Sol reviews are grouped by **Vignette 1–4**, with initial review, verification passes and final Sol micro-patch shown under the correct vignette.
- Per-vignette Sol gates now calculate word count against that vignette's own five-chunk target. The 40–50k target is reserved for the completed volume and no longer creates false short-book warnings during each vignette review.

## V252.205 — self-healing Asunder generation locks

- Fixes the `Story N mini-chapter N is already being generated` deadlock.
- An active mini-chapter lock is now a **WAIT** state, not a fatal/pause state. The browser automatically waits, polls the saved checkpoint, and continues as soon as the existing request saves or the 15-minute lock becomes stale and can be reclaimed.
- `chunk_claim_lost` is handled the same way, so racing browser requests cannot pause a volume.
- Recoverable Asunder Fiction Studio X draft failures (408/409/425/429/5xx) no longer stop after three attempts; they retry automatically with capped backoff while preserving every saved mini-chapter checkpoint.
- The duplicate-generation lock remains in place, so this does not deliberately start a second Aion request for a mini-chapter already owned by another request.
- Non-retryable/corrupt-state failures still fail closed rather than risking duplicate or destructive generation.

## V252.204 — Sol filth shield in Asunder fallback repairs

- Sol's final Asunder micro-patch remains exact-patch-only, but now has a server-side erotic-content shield as well as the prompt instruction.
- During `[SOL_ASUNDER_EDITORIAL_FALLBACK]`, any patch that touches an explicit sexual span is automatically blocked unless it preserves the protected erotic vocabulary and avoids material compression of that span.
- Blocked fallback patches are dropped rather than applied, so Sol cannot silently sanitise, euphemise or tone down Aion's explicit prose while still being allowed to fix non-erotic continuity/style defects.
- The run metadata records any blocked fallback patches for inspection.

# V252.184

- Asunder five-part chunk planning now uses the model selected for Book Development (Luna, Sol or Astra), not hard-coded Luna.
- The same selected planning model performs the lightweight post-story continuity extraction. Aion remains the Fiction Studio X prose writer for each saved mini-chapter.
- Book Development and generation are now one-click: **Develop & Generate Book** runs the normal checkpointed Book Development flow and automatically enters the production pipeline when planning completes. Resume continues from the latest saved planning or drafting checkpoint.


## V252.183
- Restores durable Asunder drafting chunking in Fiction Studio X.
- Luna splits each approved Asunder story into exactly five invisible mini-chapters before prose generation.
- Aion drafts one mini-chapter per request; every completed mini-chapter is saved immediately in the book generation checkpoint.
- Resume continues from the first missing mini-chapter rather than regenerating the whole story.
- After mini-chapter 5, Moonbeam assembles the five saved chunks into the single visible anthology story and Luna extracts the story continuity delta.
- Progress UI reports the current mini-chapter and saved checkpoint count; retry wording no longer implies content-safety rewriting.
## V252.175

Fiction Studio X restored to the proven normal Fiction Studio architecture. Sol/Astra planning, structured development, review/reporting, seeding, resume and human-gate workflow are shared with normal Fiction Studio. Aion replaces Luna only for prose drafting and writer-side rewrite stages. Asunder deterministic four-wife, chunking, portrait and cover rules remain intact.

## V252.173 — Fiction Studio X one-click book production

- **Develop Book is now the single launch action for Fiction Studio X.** After Aion finishes resumable Book Development, the client immediately continues into the existing Aion production pipeline instead of stopping for another manual click.
- The automatic chain is: **Aion Book Plan → any Asunder cast/profile/portrait gates → Aion Draft 1 → Aion Draft 2 → final product assembly / required Venice visuals → Awaiting human review**.
- The pipeline still stops at the human final gate. Human approval or a targeted Aion rewrite remains deliberate and manual.
- Existing checkpoint/resume behaviour is preserved. If a request fails or the browser session is interrupted, completed planning, draft and revision checkpoints remain saved and the Book screen can resume safely.
- The legacy non-X Fiction Studio workflow is unchanged.

## V252.170 — Aion Series Bible contract + stale-draft repair

- Aion Series Development now uses an explicit machine-JSON output contract and requests JSON-object mode from OpenRouter.
- New-character `[[CHAR:...]]` markers are only valid when backed by a `characters[]` naming profile; orphan markers are neutralised before naming.
- If orphan markers somehow survive character naming, the pipeline repairs them deterministically instead of dead-ending with a naming invariant failure.
- Manually saving a Series Bible now supersedes any stale in-progress Series Development job, so an old Aion draft cannot overwrite or keep warning against a pasted replacement bible.
- Existing Asunder identity, exactly-four-wife architecture, Aion invisible production sections, Venice portraits/covers and V252.169 Aion-only routing are unchanged.


## V252.169 — Fiction Studio X is Aion-only

- Removed Luna/Sol/Astra selectors and labels from Fiction Studio X series and book development.
- Fiction Studio X series creation, series development/refinement and series extension now use Aion.
- Book Development in Fiction Studio X goes directly to Aion; legacy automatic book-seeding calls are disabled there.
- Existing Asunder identity, fixed four-wife architecture, invisible Aion production sections, Venice portraits/cover generation and human final gate are unchanged.
- Legacy model history is masked in Fiction Studio X accounting/provenance so the active workspace presents the current Aion/Venice architecture only.
- Normal Fiction Studio remains unchanged.
## V252.168 — Fiction Studio accounting helper repair

- Restores the missing `fictionMoney25241` front-end formatter used by Fiction Studio series/book cost displays.
- Restores the missing `fictionDuration25241` formatter used by production-accounting duration displays.
- Prevents the `Can't find variable: fictionMoney25241` runtime failure when opening/creating Fiction Studio series.
- Retains the complete V252.167 Asunder harder-bible compatibility patch unchanged, including the permanent `asunder_fixed_four_story_identity_v1` trigger, fixed four-wife architecture, Aion invisible-section drafting, wife portraits and final-cover machinery.

## V252.167 — Asunder harder-bible compatibility

- Keeps the permanent `asunder_fixed_four_story_identity_v1` marker and all existing Asunder-specific four-wife, profile/portrait, cover, continuity and Aion chunking machinery unchanged.
- Removes the obsolete deterministic seed ceiling that forced BDSM to remain optional and group encounters to remain exceptional. The code-enforced seed now defers to the approved Series Bible for the intensity and recurrence of power-exchange and multi-partner material.
- Prevents the deterministic Asunder contract from automatically converting a willing submissive wife's arc into empowerment, reclaimed control or later dominance.
- Keeps adult consent and health safeguards as underlying canon without forcing repetitive procedural reassurance, compulsory aftercare or administrative exposition.
- Bumps the deterministic seed marker to `ASUNDER_DETERMINISTIC_SEED_CONTRACT_V252_151` and strips V252.150/V252.149 markers when refreshing, ensuring an already-saved seed picks up the new contract.

## V252.166 — Fiction Studio X Aion production architecture

- Normal Fiction Studio remains on its existing Luna/Sol/Astra pipeline; the new creative architecture is gated to `fiction_x` only.
- Fiction Studio X now uses Aion as the creative architect and sole prose writer: Aion plans each book from the approved Series Bible + series memory, creates new book-specific characters through Moonbeam's existing data-driven naming system, divides reader-visible chapters/stories into invisible production sections with word budgets, and writes them sequentially with saved checkpoints.
- Moonbeam deterministically stitches Aion's sections, carries continuity state between calls, and saves each section so long chapters no longer depend on one serverless request surviving for 9–12k words.
- Aion performs Draft 2 section-by-section. Every revised section and completed chapter must preserve or increase its Draft 1 word count; shorter revisions are rejected rather than silently accepted.
- Human-directed Fiction Studio X rewrites also run through Aion section-by-section and preserve material outside the requested change. Sol and Luna are not used in the Fiction Studio X creative pipeline.
- Asunder-format Fiction X books design all four principal women together before portrait generation. A hard set-level distinctiveness gate requires each pair to differ across at least five major visual axes before any portrait is generated. Canonical appearance is then locked.
- Fiction X Asunder portraits are generated by Venice as image-only photoreal luxury-editorial assets. Moonbeam owns the fixed profile layout and all profile text. Portrait prompts favour realistic skin, human asymmetry, distinctive faces and unmistakable cross-cast variation while retaining glamorous adult presentation.
- Finished Fiction X Asunder books generate the final cover with Venice imagery before human review; Moonbeam composes the final branded cover and profile/title pages.
- The obsolete Asunder Venice audition mirror UI has been removed and mirror creation is retired. The existing Asunder · Venice mirror record was deleted from Supabase with its cascaded child records.
- No schema migration is required for V252.166.

## V252.165 — Aion self-expanding length gate

- Keeps the complete Raquel / Story 1 target at 9,000–12,000 words.
- After the selected OpenRouter writer finishes its first draft, Moonbeam counts the actual words deterministically.
- If the draft is below 9,000 words, the **same model** receives its own manuscript for up to three expansion passes; Sol, Astra and Luna never add the missing prose.
- Expansion is deliberately non-destructive: the model must return insertion blocks anchored after exact, unique paragraphs from its existing draft. Moonbeam inserts those blocks without deleting, paraphrasing, reordering or replacing any accepted prose.
- Expansion instructions forbid new subplots, extra encounters added merely for length, ending padding and repeated explanation of the existing choice/ownership/architecture themes.
- Each pass is re-counted. The saved test records initial word count, final word count, pass-by-pass added words, length status and usage metadata.
- Maximum expansion attempts: 3. If the story is still below 9,000 words after that, it is saved as `under_target` rather than looping indefinitely.
- Provider errors during an expansion pass are recorded and consume that pass; they do not destroy the existing draft.
- No Supabase migration required.

## V252.164 — Aion full Raquel story test

- Converts the OpenRouter bake-off from a contained scene into the decisive long-form test: the selected model now writes the complete Story 1 / Raquel story in one call.
- Targets approximately 9,000–12,000 finished words, covering the full planned arc: setup, progression, central encounter, aftermath and consequence.
- Keeps the Series Bible and Story 1 plan authoritative and explicitly prevents synopsis-like compression, skipped central material, generic character flattening, over-explanation and late-story rushing.
- Raises the context-safe output ceiling from 12,000 to 20,000 tokens, while still respecting the provider completion limit and reserving prompt/context safety margin.
- Stores long-form results separately in `generation_state.openrouter_story_tests`, preserving all earlier OpenRouter scene samples for comparison.
- The test still does not mutate the production manuscript or Fiction Studio accounting.
- No Supabase migration required.

## V252.162 — OpenRouter full model output allowance

- Removes Moonbeam's fixed 5,000-token cap from the OpenRouter scene bake-off.
- Uses each selected model's advertised maximum completion tokens when OpenRouter reports one. If OpenRouter does not report a ceiling, Moonbeam omits `max_tokens` instead of inventing a limit.
- Removes the 1,800–2,500-word instruction from the shared test prompt. The model can use as much of its available completion space as the contained scene genuinely needs.
- The OpenRouter output textarea has no character limit.
- Still exactly one API call per button press: no automatic retry and no continuation loop.
- No Supabase migration required.

## V252.161 — OpenRouter model bake-off
- Added an OpenRouter one-call comparison inside the existing Asunder Venice mirror.
- Uses server-side `OPENROUTER_API_KEY`; the key is never exposed to the browser.
- Loads the current OpenRouter model catalogue live and offers only the candidate creative-writing models that are actually available: Aion 3.0, Cydonia 24B v4.1, Magnum v4 72B, and Valkyrie 49B when present.
- Every model receives the same copied Series Bible, Book architecture, Story 1 plan and contained 1,800–2,500-word Raquel scene brief.
- Exactly one API call per press: no retry, no continuation loop, no manuscript mutation and no Fiction Studio accounting.
- Each model result is stored separately in the mirror book generation state for side-by-side comparison.
- No Supabase migration required.

## V252.160 — fix Venice Gemma model ID
- Corrected the Venice Gemma 4 31B model identifier from the invalid `e2ee-gemma-4-31b` to Venice's returned valid ID `google-gemma-4-31b-it`.
- The small one-call Story 1 scene test is otherwise unchanged: no retries, no continuation loop, no manuscript mutation, and Venice's extra system prompt remains disabled.

# Moonbeam Stories

## V252.159 — Gemma 4 31B one-scene test
- The Venice mirror small-quality test now targets Venice model `google-gemma-4-31b-it` explicitly rather than inheriting `venice-uncensored` or `VENICE_TEXT_MODEL`.
- Existing `venice-uncensored` sample output is preserved but ignored, giving a clean side-by-side model experiment.
- The task remains deliberately small: one Story 1 scene, approximately 1,800–2,500 words, exactly one API call, no retries and no continuation loop.
- Venice's additional system prompt remains disabled.
- Gemma is capped at 4,096 output tokens to match Venice's current hosted limit for this model.
- No manuscript chapter, completion state, image generation or accounting is created by the test.
- Still 12 Vercel API files; no Supabase migration required.

# V252.156

## V252.156 — Venice mirror as a sibling series

- `Create Venice mirror` now returns to the main Fiction Studio Series page instead of opening the mirror immediately.
- The Venice copy is displayed directly underneath its source series, regardless of database creation order.
- The mirror is visibly named `<source series> - Venice mirror` and carries a prominent `VENICE MIRROR` label plus `Venice first draft only`.
- Existing mirrors created by V252.155 are rendered with the new clear name without requiring a database migration.
- Newly created mirrors are stored with the same clear `- Venice mirror` name.
- The Venice mirror remains text-only and first-draft-only; no image or editorial pipeline changes in this build.

# V252.155

## V252.155 — Venice mirror first-draft pipeline

- Replaces the visible Venice Lab entry point with **Create Venice mirror** on a normal Fiction Studio/X series.
- The mirror is a durable separate Fiction Studio series, named `<source series> · Venice`, so it cannot overwrite or contaminate the OpenAI version.
- Copies the existing authoritative Series Bible and the existing completed Book 1 plan exactly into the mirror; it does not rerun Series Development or Book Development.
- The Venice mirror generates **text only**. No profile portraits, cover art or other illustration calls are made.
- One click on **Generate Venice first draft** writes the four existing Asunder story plans sequentially through Venice and checkpoints each completed story in the normal first-draft chapter table. If a call fails, **Resume Venice first draft** continues from the first missing story.
- There is only one Venice manuscript draft: no Sol review, Luna rewrite, second draft, editorial pass or automatic publication pipeline is run.
- The Venice API key remains server-side. `VENICE_TEXT_MODEL` can override the default `venice-uncensored`; otherwise the mirror uses `venice-uncensored`.
- Existing Fiction Studio reader and review-ZIP actions can read/export the saved Venice first draft.
- Still 12 Vercel API files: Venice uses the existing `api/fiction-studio.js` route.
- No Supabase migration required.

# V252.150

## V252.150 — bounded Asunder long-term continuity

- Asunder no longer grows its prompt context by forwarding old manuscripts, old illustrations, full historical Book Plans or the generic Fiction Studio Series Intelligence archive into later volumes.
- After each completed Asunder volume, Sol performs one compact extraction pass over that volume only and stores a deliberately small `asunder_compact` ledger in the existing `series_memory` JSONB field. No schema migration is required.
- The compact ledger stores only: (1) each previously used wife’s canonical physical identity, keyed to her persistent Asunder profile lookup key, and (2) one short record per story of the partners involved, broad sexual activities/configuration and a compact configuration summary. It stores no manuscript prose, no dialogue, no scene-by-scene recap and no image bytes/URLs.
- Book Development receives this compact ledger directly. It does not run an expanding retrieval pass over a generic full-series archive.
- Manuscript drafting is even narrower: Luna receives only the current wife’s canonical profile plus compact prior encounter records for that same woman. Other archived wives and old encounter history are not injected into each story-writing call.
- If a previously used woman is selected again, her `profile_lookup_key`/character key is used to retrieve the existing canonical Asunder profile and portrait from the dedicated profile store; the portrait itself is not forwarded through prompts.
- Sol’s Volume 2+ seed no longer receives the complete previous manuscript for Asunder. It receives the compact ledger only. Normal Fiction Studio series retain the existing full-intelligence behaviour.
- The old hard anti-repetition framing has been removed for Asunder. Familiar sexual activities, partner types and successful configurations may recur naturally across a long series. The system asks only for enough variation to avoid obvious carbon-copy stories, and explicitly forbids inventing bizarre/extreme practices merely to satisfy a novelty quota.
- `recent_patterns_to_avoid` / `underused_variation_opportunities` have been replaced by advisory `recent_patterns_to_note` / `natural_variation_options`. These are awareness cues, not bans or checklists.
- The deterministic Asunder seed marker is now `[ASUNDER_DETERMINISTIC_SEED_CONTRACT_V252_150]`; older V252.149 seeds are refreshed so they pick up the softer, long-series-safe variation rule while retaining the four-story and high-heat requirements.
- Series-extension planning for Asunder also uses the compact ledger and slim book-history metadata rather than historical Book Plans/development state.
- No Supabase migration required.

# V252.149

## V252.149 — deterministic Asunder seed enforcement

- Sol still authors the editorial seed, but Asunder no longer trusts Sol to preserve hard format/heat requirements through paraphrase.
- After Sol returns a seed, the server appends a deterministic `[ASUNDER_DETERMINISTIC_SEED_CONTRACT_V252_149]` block. It explicitly requires exactly four top-level stories, 40,000–50,000 words, very frequent graphic/high-heat erotic content, substantial page space for major encounters, character-appropriate direct/crude language, several meaningful erotic developments per story, no fade-to-black/coy summary, and no long sex-neutral stretches.
- The contract is keyed to `asunder_fixed_four_story_identity_v1`, so it remains attached to this series if the visible series title changes.
- For Volume 2+, Sol must additionally return structured `recent_patterns_to_avoid` and `underused_variation_opportunities`; these are inserted verbatim into the deterministic contract so variation is based on the actual completed prior volume rather than generic advice.
- The Book Development execution path re-applies the deterministic contract even to an older/cached seed or an already-stored direction, preventing stale soft wording from bypassing the rule.
- The UI detects pre-V252.149 Asunder seeds and regenerates them once so the developer prompt box shows the corrected seed before Book Development.
- No Supabase migration.

- Corrects the Asunder template packaging: the production profile reference is now a **clean blank shell only**. The previous instructional composite image has been removed entirely.
- `assets/asunder-profile-template-v1.png` contains no sample woman, no example values, no generation steps and no developer instructions. It preserves only the fixed visual architecture and structural labels.
- All instructions for creating a woman, generating her portrait, filling the profile, enforcing first-name-only privacy, checking continuity and reusing returning characters remain in `ASUNDER_PROFILE_TEMPLATE_V1.md` and server-side Fiction Studio logic. They are never part of the rendered story opener.
- No new Supabase migration. The V252.147 profile-table migration is still the only migration required for this feature if it has not already been run.

## V252.148 — canonical Asunder profile/title pages before drafting

- Every fixed-format Asunder volume now pauses after its four story plans are validated and, **before Luna can draft any prose**, builds or reuses one canonical female Asunder profile for each story.
- The profile/title-page architecture is permanently locked to `asunder_profile_page_v1`. The approved blank visual reference is shipped at `assets/asunder-profile-template-v1.png`; the machine-readable field/specification guide is `ASUNDER_PROFILE_TEMPLATE_V1.md`.
- Each new principal young woman receives a canonical pre-writing package: internal full name, first name, exact adult age, city/background/relationship/member metadata, full biography, concise public bio, member tags, detailed physical identity, portrait styling/setting and a generated canonical portrait.
- Public Asunder profiles display **first name only**. Surnames remain private internal canon and may be used in prose where appropriate, but never render on the Asunder profile page.
- All female leads are locked as exceptionally beautiful and petite while body proportions/bust size, ethnicity/background, face, colouring, hair, clothing, setting and overall presentation are deliberately varied. The portrait brief explicitly avoids the repeated cocktail-dress/hotel-bar default; yachts, beaches, villas, high-end homes, chic casualwear, resort/travel settings and other character-appropriate looks are permitted.
- Returning women are matched to their canonical Asunder record and reuse the **exact saved portrait and profile data** rather than being regenerated.
- The story opener is now the Asunder profile page itself: only the story number (for example `1.3`) appears above the profile screenshot. The woman's given-name subtitle remains planning/contents metadata only and is not repeated on the story opener.
- Manuscript drafting receives the canonical profile/appearance record as binding continuity. Luna is explicitly told not to contradict it and not to re-describe the profile/image as a catalogue; prose should reinforce only occasional relevant details and otherwise get on with the story.
- The Fiction Studio reader renders the canonical Asunder title/profile page before each story using the fixed coded template and stored portrait.
- Adds `developer_fiction_asunder_profiles` for persistent canonical profile records. Run `SUPABASE_V252_147_ASUNDER_PROFILES.sql` once before using the feature.

## V252.146 — Asunder Sol seed heat + cross-volume variation lock

- The persistent Asunder series identity now gives Sol a series-specific seed contract for Book 1 and every later numbered volume, even if the visible series name is changed later.
- Book 1 seed must explicitly restate very frequent, graphic/high-explicitness erotic content, substantial scene space, direct/crude language where character-appropriate, no long neutral stretches, and the fixed four-story structure.
- Book 2+ seeds must first audit the human-approved previous volume for relationship configuration, age gaps, husband role, third-party type, jealousy, voyeurism/exhibitionism, group/BDSM use, initiation/control, setting/travel, messaging, pacing, scene structure, explicit-language intensity and aftermath pattern.
- Sol must explicitly tell Book Development what recent combinations not to repeat and prefer underused axes / unused possibilities, while preserving the same high heat rather than using lower explicitness as "variation".
- The logic keys off the permanent `asunder_fixed_four_story_identity_v1` marker, not the current display name, so renaming the series does not remove it. Other Fiction Studio series are unaffected.
- No Supabase migration.

# Moonbeam Stories V252.143
- The fixed four-story anthology format is now durably attached to the specific series that is currently named **Asunder**. The one-time retrofit still identifies that series by its current Asunder identity, then stores `series_format_identity: asunder_fixed_four_story_identity_v1`; all ongoing behaviour keys off that persistent marker, so renaming the series later does not remove the four-story/numbered-volume architecture.
- Numbered volume titles follow the series' *current* visible name (`<current series name>: Volume N`). Renaming this specific series cascades deterministically to its proposed-book slate and existing book records while preserving IDs, plans, costs and manuscript history.
- Asunder story subtitles are now constrained to **only the principal younger wife's given name**: `1.1 — Raquel`, `1.2 — Julie`, etc. Husbands, third-party partners, group participants, surnames and invented literary titles are excluded from the subtitle.
- Saving or re-approving the Bible preserves the persistent Asunder format identity and these structural rules, preventing a later Bible edit or series rename from silently dropping them.
- No Supabase migration required.

## V252.142 — Asunder fixed four-story volume format
- Retrofits the existing **Asunder** series in place without deleting or regenerating the saved Bible: the Bible receives `series_format: fixed_four_story_anthology` plus a deterministic four-story format block, while every unrelated Bible field is preserved.
- Renames the existing Asunder slate and any existing book records deterministically to **Asunder: Volume 1**, **Volume 2**, etc.; any existing Book Plan content is preserved, with only its stored title normalised.
- Asunder Book Development is now structurally enforced as exactly **four substantial top-level stories** per volume, with a 40,000–50,000 word volume target. The generic Fiction Studio planner remains unchanged for every other series.
- Story labels are deterministic **N.1–N.4** and use the principal protagonist/couple/group names as subtitles rather than invented literary story titles.
- The server validates the four-story count and volume word range on plan save, so a 20–30 chapter novel architecture cannot accidentally be approved for Asunder.
- Drafting treats each top-level unit as a complete substantial anthology story and raises the output allowance only for this fixed format so roughly quarter-volume stories are practical.
- Existing Asunder Sol handoff text is preserved while known legacy volume titles inside stored seed directions are normalised to the new numbered titles.
- `Extend series` continues the deterministic numbering automatically; no Supabase migration is required.


## V252.141 — erotica drafting density + Sol density rating
- Adds a hard erotica-only drafting overlay to manuscript generation so high-explicitness Bibles are not softened into occasional tasteful open-door material.
- Converts the Bible's erotic promise into behavioural drafting guidance: early activation, repeated meaningful erotic beats, substantial scene space, direct character-specific language, and warnings against long neutral stretches.
- Preserves chapter function: the overlay does not force sex into genuine setup/aftermath chapters.
- If a Bible explicitly bans condoms, that ban is carried directly into the chapter drafting prompt.
- Sol's post-rewrite human advisory report now includes an **Erotic density /10** rating and short review for erotica; non-erotica books suppress the UI row.
- No extra model call and no Supabase migration.
## V252.140 — Book Development naming checkpoint repair

- Fixes `Cannot set properties of undefined (setting '<character_key>')` during Book Development demographic naming.
- `arch_naming_state.candidate_pools` is now reconstructed on every resume/checkpoint, with a safe `{}` fallback for already-saved V252.139 planning state.
- Existing saved Series Bible, architecture and completed planning checkpoints are preserved; no Supabase migration is required. Resume Book Development after deploying this build.

## V252.139 — canonical cast extraction for manual Series Bibles

- Fixes the mandatory cast/title checkpoint so a saved Bible using `core_characters` is recognised as having an established recurring cast; the older generated-schema `characters` array remains supported.
- Recognises `younger_female_member_pool.members` and `older_male_partner_pool.members` as selectable canonical cast reservoirs rather than reporting that no cast exists. Unnamed pool profiles remain unnamed until Book Development actually selects them.
- Book Development now receives explicit cast-reservoir instructions: prefer a suitable existing pool profile before inventing a near-duplicate character; if a selected canonical profile has `canonical_name: null`, preserve its profile facts and route it through the existing backstage demographic naming pipeline rather than letting the creative model invent a name.
- Book-level naming collision avoidance now includes names from `characters`, `core_characters`, and already-named canonical pool members. Profession discovery receives the same combined cast context.
- Backwards-compatible with already-saved Series Bibles: no re-save or Supabase migration is required. Reopen the cast/title checkpoint after deployment and the existing Asunder Bible is read correctly.

## V252.138 — model-free backstage collision renaming

- Removes the V252.137 Luna-based fictionalisation/renaming step entirely. Sol, Luna and Astra are no longer allowed to invent collision-replacement proper nouns.
- Character collision replacements now come only from the hidden demographic candidate pools already researched during backstage naming. The unused candidates are checkpointed privately and never exposed to the creative models.
- Business, institution, fictional-place and title/brand collisions use a model-free conservative backstage replacement pool; every replacement is immediately sent back through the live real-world validator and is accepted only if it clears validation.
- Up to three bounded replacement attempts remain. If no safe backstage candidate survives, the generated fiction is preserved and the developer receives an advisory warning rather than a destructive rerun.
- Book Development also carries its hidden backstage character candidate pools into collision checking, so the same rule applies to newly introduced book-specific characters.
- No Supabase migration is required for V252.138.

## V252.137 — advisory real-world name/organisation collision warnings

- Extends the V252.133 non-blocking validation approach from fictional character identity/name matches to fictional business, institution, organisation and title/brand name collisions during Series Development and Bible approval.
- A real-world naming collision no longer destroys a completed Series Development run. The Bible is saved normally and the existing cast/title review checkpoint shows the flagged name, reason/source and advice to rename before Book Development.
- These warnings remain advisory: the developer may rename the fictional entity or deliberately keep it and continue.
- High-confidence non-naming plausibility/geography problems remain blocking safeguards.
- No Supabase migration is required for V252.137.

## V252.135 — Fiction Studio X password lockout

- Adds persistent server-side brute-force protection to the discreet Fiction Studio X password gate.
- Each developer identity gets **5 consecutive incorrect password attempts**. The API reports the remaining attempts after each failure.
- The fifth failure locks Fiction Studio X for **15 minutes** and returns a server-enforced `Retry-After` interval; refreshing, redeploying or hitting a different serverless instance cannot bypass it.
- A successful unlock clears the failed-attempt counter. Once a 15-minute lock naturally expires, the next attempt starts a fresh five-attempt window.
- Lockout state is stored in a dedicated server-only Supabase table; no frontend code can reset or edit it.
- Requires running `SUPABASE_V252_135_FICTION_STUDIO_X_LOCKOUT.sql` once. The V252.134 Fiction Studio X namespace/password architecture is otherwise unchanged.


## V252.134 — password-gated Fiction Studio X

- Adds a discreet developer-only padlock in the top-right of Fiction Studio. The ordinary screen does not label or advertise the hidden library.
- The padlock opens a password prompt. A successful server-side check switches the shared Fiction Studio interface into **Fiction Studio X**. Closing the studio or refreshing the app clears the browser-held X access token, so it must be unlocked again.
- Fiction Studio X deliberately reuses the normal Fiction Studio UI, controls, series creation, model selectors, book architecture, drafting/review loop, exports, deletion, extension and accounting code. It is a namespace, not a duplicated second implementation, so future shared Fiction Studio improvements continue to apply to both.
- Series created while X is open are tagged `studio_section='fiction_x'`; ordinary series use `studio_section='fiction'`. Server-side list/create/load checks enforce the separation, so X series do not leak into the normal series list/dashboard.
- Set a Vercel environment variable named `FICTION_STUDIO_X_PASSWORD` to the password you want. The password is never stored in frontend code. Unlock returns a short-lived signed server token held only in page memory.
- Requires running `SUPABASE_V252_134_FICTION_STUDIO_X.sql` once before deploying this version. Existing series remain ordinary Fiction Studio series.

# V252.133 — advisory character identity warnings

- Series Development real-world identity checks no longer discard a completed Series Bible merely because a fictional character matches a prominent real person or triggers a character-name plausibility warning.
- Those character/person-name findings are preserved as advisory warnings and production continues to the existing mandatory cast/title checkpoint.
- The cast/title review now shows each flagged character, the validator reason/source, and advises the developer to rename before Book Development. The developer may rename or deliberately leave the name unchanged.
- Truly non-character collision failures (for example a problematic real business/institution/place/title collision) remain blocking safeguards.
- Rechecking the approved Series Bible refreshes the stored advisory warnings, so a successful manual rename clears the warning.
- No Supabase migration required.

## V252.132 — permanent Adult Novel Studio usage accounting
- Fixed the developer Usage page accounting bug where deleting a Fiction Studio book or series also deleted its `developer_fiction_usage_events` rows.
- Fiction usage events are now treated as immutable spend history and survive book/series deletion.
- Legacy orphan cleanup no longer classifies historical usage rows as deletable orphans.
- Developer Usage fetches the summary with an explicit cache-buster/no-store request so a manual refresh always reads the latest ledger.
- No Supabase migration required.

## V252.131 — Sol report after every Luna rewrite
- Moves Sol’s advisory appraisal to the human-review loop: after Luna’s automatic second draft, Sol immediately reads that exact manuscript and reports before the developer decides whether to finish or rewrite again.
- The report includes deterministic word count, Content rating /10, Anti-AI / Style rating /10, a brief content review, a brief style review, and an explicit assessment of how successful Luna’s latest rewrite was.
- Sol also supplies one optional ready-to-paste improvement prompt for Luna. It is advisory only and can never trigger a rewrite automatically; if Sol sees no worthwhile remaining rewrite, the suggested prompt is blank.
- Every later human-directed Luna rewrite automatically receives a fresh Sol report on the new manuscript before returning to Awaiting human review. The human/Luna/Sol-report loop can repeat indefinitely.
- The developer remains the only creative gate. **Finish & Save** locks the exact current manuscript; there is no additional post-approval Sol appraisal. Deterministic publication checks then run and Sol seeds the following book from the human-approved finished text.
- Sol’s report compares the latest rewrite with the relevant prior style brief / human instruction and previous advisory report where available, while separately checking for new content or style damage.
- Human-review reports are preserved as editorial records and separately labelled in the production-cost ledger, but are not treated as senior quality gates.
- No Supabase migration and no new API route are required.

## V252.130 — simple style-first pipeline + human creative gate
- Replaces the Astra/Sol structural rewrite hierarchy with the deliberately simpler production flow: **selected Series Development model → Sol seed → Luna first draft → Sol style-only anti-AI review → Luna style-only second draft → human review**.
- Removes automatic post-draft structural critique/rewrite from the default fiction pipeline. Sol's first manuscript review is explicitly prohibited from requesting plot, scene-order, character-arc, clue, ending or series-architecture changes.
- After Luna's second draft the book is marked **Awaiting human review**. The developer can approve that exact version or give Luna a manual rewrite instruction; manual human/Luna rewrites can loop indefinitely and each version remains preserved.
- Human approval is the only creative sign-off. The approved manuscript is locked before Sol's final appraisal.
- Sol's final appraisal is advisory only and must report **Content Quality /10** and **Anti-AI Style /10** with reasons. It cannot trigger or request an automatic rewrite.
- After the advisory appraisal, deterministic publication checks run on the exact human-approved manuscript. Sol then seeds the following book from the full finished manuscript rather than only representative excerpts.
- Series-intelligence housekeeping after a finished book now uses Sol rather than Luna.
- Retains the V252.127 accounting redesign and the destructive-rewrite length safeguards for any human-directed full revision.

# V252.117 — fully checkpointed structural architecture

- Splits the remaining Book Development structural architecture into three independently saved calls: major turning points, continuity watchlist, and ending.
- Fixes the V252.116 failure mode where the combined structural response could still exhaust max_output_tokens even after the earlier architecture split.
- Each component is now concise, bounded, and persisted before the next request; resume starts at the unfinished component.
- Existing V252.115/V252.116 Book 2 jobs stuck at `architecture_structure` recover safely: Resume generates only the turning-points component first, then continuity, then ending.
- No new API route and no Supabase migration.

# V252.111
## V252.114 — resumable character naming iterator fix

- Fixed Series Development and Book Development naming checkpoints so they always process the first currently unresolved `[[CHAR:...]]` character after each saved checkpoint instead of reusing a stale cursor against a newly shortened unresolved-character list.
- Added a separate completed-character counter used only for progress reporting. Completion is now determined exclusively by there being no unresolved character placeholders left.
- This also recovers safely from V252.113 jobs already checkpointed with the old cursor value: resuming recalculates the unresolved set and continues with the next unresolved character rather than falsely declaring naming complete.
- Existing hard naming invariants remain in place, so unresolved internal character markers still cannot become canonical.


- Locale now supplies the default geographic home for NEW Fiction Studio series unless the developer explicitly overrides it: English (UK) → United Kingdom, English (US) → United States, Spanish (Spain) → Spain, Spanish (Latin America) → Latin America, with equivalent locale anchors for the other supported locale codes. Existing series keep their established setting and are never silently relocated.
- Removes the backstage instruction to prefer the most common/ordinary names. Demographic research now samples a natural spread of attested common, mid-frequency and less-common-but-unremarkable names instead of collapsing toward bland high-frequency Anglo defaults.
- Keeps the hard hidden AI-default/near-variant blacklist intact, so de-blanding the pool does not reopen synthetic Voss/Vale/Mara-style naming.
- Adds account-level recent-name memory entirely backstage. Before Series or Book Development assigns new names, it checkpoints name components recently used in up to 10 series and 40 book plans, asks the demographic selector not to recycle them, and filters repeated components from candidate pools when alternatives exist. This history is never shown to Astra/Luna as creative seed material.
- Anti-repetition is strong but non-blocking: if a culturally constrained pool genuinely offers no fresh candidate, Moonbeam may use a non-blacklisted attested candidate rather than deadlocking the pipeline.
- No new API route and no Supabase migration.

# V252.110

- Hardened backstage character naming after a Book Development surname-pool `max_output_tokens` failure.
- Name research now returns only the candidate list (no verbose source/notes payload), uses a 5,000-token ceiling for live web-backed selection, and requests a much smaller pool.
- Both Series Development and Book Development naming are now checkpointed through bounded fallbacks: normal live lookup → compact live lookup → conservative offline demographic fallback → single-candidate emergency fallback. Each fallback is a separate resumable request, so retries cannot recreate the old monolithic timeout problem.
- A `max_output_tokens` response no longer throws away the naming stage or leaves the book stuck on the same request. The next fallback mode is persisted in `autopilot_state` / `development_state`, and any live-research fallback is recorded as a warning.
- The hidden AI-default blacklist still applies to every candidate, including fallback candidates. No exemplar name lists were reintroduced.

# V252.107 — bomb-proof backstage research retries

- Raises the output allowance for backstage demographic-name, real-location and profession research so model reasoning/web-search overhead cannot starve the small structured payload.
- Profession research still checkpoints one role per request. A normal role lookup gets one saved compact retry if needed.
- If even the compact role lookup still returns incomplete because of `max_output_tokens`, the pipeline no longer deadlocks: it saves an explicit research warning for that role, applies a conservative “do not invent professional powers/procedures” constraint, and continues. No fabricated professional facts are inserted.
- The warning remains in the stored profession pack so later review can see that grounding was unavailable rather than silently pretending research succeeded.
- No new endpoint or database migration.

# V252.104 — de-biased validation + compact profession research

- Removes the experiment-derived title-template rejection list (including Fenland/probate/house-clearance/category terms). Title screening now uses only the hidden high-confidence anti-default/collision checks rather than our previous test concepts.
- Geography and profession research remain fully backstage. Creative models no longer receive complete fact packs: they receive only concise `must_respect` / `cannot_do` / workflow / correction constraints required to prevent factual errors. Supporting research notes, local colour and occupational trivia stay hidden so they cannot seed ideas.
- Rebuilds profession/practice research as one tiny role-discovery call followed by one tightly bounded live lookup per material role (maximum three), with a smaller per-role retry. This prevents one multi-role response from exhausting `max_output_tokens` and keeps unrelated occupational detail out of context.
- Makes the deterministic prose audit locale-aware. English lexical detectors (English stock phrases, `not X ... but Y`, English triplet conjunctions and English formulaic ending cues) run only for English-language books. Other languages still receive language-neutral rhythm, repetition, punctuation, chapter-shape and cross-book exact-phrase checks, while Sol's senior review remains in the selected language.
- Makes the cross-book structural regex audit locale-aware: English lexical beat/arc labels are no longer applied to non-English plans. Language-neutral structural information remains available without pretending English keywords are universal.
- Aligns Fiction Studio fallback locale to English (UK) in server and UI. Adds `SUPABASE_V252_103_FICTION_LANGUAGE_DEFAULT.sql` so the database default for future rows also becomes `en-GB`; existing series keep their stored locale.
- Keeps the explicit user-requested hard AI-name blacklist and backstage collision checks unchanged.
- Still 12 Vercel API routes. One Supabase default-only migration is included.

# V252.102 — zero-exemplar creative pipeline / backstage-only validation

- Removes the embedded place-exemplar/world-data module entirely. Astra/Luna are no longer shown lists of real towns, regional settlement samples, business-name templates, common surnames, baby-name cohorts or other example pools at any creative stage.
- Writing language is now explicitly language-only: it must not bias country, region, nationality, culture, profession, character names or setting. When the brief leaves setting open, Astra chooses anywhere freely on creative/commercial grounds.
- Character-name blacklists and demographic/cultural checks are now backstage. Creative prompts receive only abstract plausibility rules; the existing live web validator checks proposed names afterwards against authoritative cohort/cultural evidence where the material supplies enough context. It never returns alternative names or popularity lists.
- Place/business/institution/title anti-default blacklists remain server-side only. The creative models are told the principles but are not shown the banned examples, preventing the blacklist itself from becoming a source of priming.
- Live real-world validation is reactive only: it validates the people, organisations, fictional places and titles already proposed, and is forbidden to suggest alternatives, comparable businesses, nearby places or other creative ideas.
- Real-location research now researches only real places already named in the generated material. It may not list neighbouring towns/districts/attractions or alternative settings. Its fact pack is a hidden constraint layer for accuracy, not a place buffet.
- Profession/practice research remains reactive to roles already present in the fiction and is now explicitly forbidden to introduce or exemplify additional professions.
- Removes `_fiction_world_data.js`; the old V252.84/V252.86/V252.87 exemplar-seeding behaviour is superseded.
- No Supabase migration and no additional Vercel API route.

# V252.101 — bounded profession/practice research

- Profession/practice fact packs are now deliberately compact: fewer roles, fewer facts per section, and hard string/array bounds.
- If the first research response still reaches `max_output_tokens`, the existing Fiction Studio route automatically retries once with an ultra-compact schema before failing closed.
- Research quality rules remain intact: jurisdiction/era specificity, role boundaries, realistic access/workflow, authoritative sources, silent-use guidance, and non-actionable treatment of criminal roles.
- No Supabase migration and no additional Vercel API route.

## V252.99 — live profession/practice fact grounding

- Adds a live profession/practice fact pack after Series Development for central, recurring, technically specialised or legally constrained roles.
- Research is jurisdiction- and era-specific and covers day-to-day practice, role limits, hierarchy/collaboration, systems and lawful access, workflow/timescales, terminology/documents, regulation/ethics, mundane realities and common fiction errors.
- Book Development adds a book-specific profession addendum when a particular case introduces specialist work beyond the series-level pack.
- Series and book profession packs are authoritative throughout chapter planning, drafting, Sol senior review, Luna Revision, Line/style and Proof.
- Professional research is explicitly silent-use: it exists to prevent mistakes, not to provoke explanatory dialogue, technical showmanship or occupational info-dumps.
- Criminal/illicit roles are restricted to high-level realism, consequences and investigative context; the research layer must not provide actionable methods, optimisation, evasion tactics or exploitable security weaknesses.
- Uses the existing Fiction Studio endpoint and hosted web search; no new Vercel API route and no Supabase migration.

## V252.98 — silent-use location grounding

- Real-location fact packs remain authoritative for geography, transport, institutions and local context.
- Added an explicit silent-use rule: location research exists to prevent mistakes, not to generate exposition.
- Astra/Luna must not mention roads, travel times, landmarks, industries, institutions or local facts merely to demonstrate knowledge.
- Researched detail should appear only when it naturally matters to scene, plot, character experience or atmosphere; otherwise prefer omission.
- Live location research now also treats its output as a constraint/reference layer rather than a checklist for prose.
- No new API route and no Supabase migration.

# Moonbeam Stories V252.94

## V252.97 — stronger Sol anti-AI review + live pipeline reporting

- Sol's automated senior-editor quality gate now has an explicit synthetic-writing remit beyond the deterministic audit: overly orderly plotting, symmetrical arcs, excessive thematic neatness, over-efficient dialogue, over-articulate psychology, generic emotional language, repetitive reasoning, purpose-built scene detail, synthetic rhetorical polish and other material machine-like patterns.
- Senior reviews now return a dedicated `synthetic_writing_findings` list. Luna receives those findings directly during Revision, alongside the quality gate, strengths to preserve and chapter-specific actions. Empty findings are valid when no material problem exists.
- Every open Book page now has a live pipeline-status card that updates in place at each saved checkpoint and stage transition: draft chapter progress, senior-review round, Luna revision, Line/style, Proof, pause and completion.
- Book cards on the Series screen update live from the same running job, so current progress is visible without leaving and re-entering the screen.
- A completed background automatic pipeline no longer forces navigation away from the Series screen; its status changes to COMPLETE in place.
- No new Vercel API route or Supabase migration.

## V252.94 — disable Resume while an editorial pass is actively running
- The Developmental/Revision/Line/style/Proof action button now distinguishes a durable paused/interrupted run from a live in-browser background job.
- While the matching editorial job is actively running, the primary action is disabled and labelled “<stage> in progress” instead of offering an actionable Resume button.
- If the page is refreshed or the live job disappears while Supabase still records the pass as running, Resume becomes available again so interrupted work can continue from its saved checkpoint.
- No generation, editorial, database or API behaviour changed; this is a UI/state-guard fix only.


## V252.92 — structural anti-template audit + anti-overcoherence
- Adds a deterministic cross-book structural-variation diagnostic to Book Development. It compares high-level architecture rather than prose style: chapter-count band, turning-point sequence, chapter-plan beat positions where available, ending openness/closure and whether the character/relationship arc resolves as a neat lesson or remains messier.
- The diagnostic is advisory, not a beat-sheet enforcer. It only surfaces when a candidate repeats several structural features of earlier books, and explicitly says not to distort a strong premise or replace one stock template with another.
- Earlier-book structure is only shown to the planning model when repetition is already visible across prior books; ordinary one-off structures are not presented as a menu to imitate.
- Completed and manually edited Book Plans persist the structural diagnostic in development state so later planning/resume keeps the same warning without a new model call.
- Adds one compact anti-overcoherence principle to planning and manuscript editing: not every object, scene, subplot or side character must reinforce the central theme or main plot. Incidental humour, atmosphere, social detail and ordinary human mess may remain when they add credibility or pleasure rather than padding.
- No new API route, web call, paid audit call or Supabase migration.


## V252.91 — prompt consolidation / creative-priority hierarchy
- Consolidates the overlapping series-register, human-depth, Luna-tic, anti-banter and anti-pithiness prose instructions into one compact creative hierarchy used by Draft, Developmental, Revision, Line/style and Proof.
- Establishes explicit priorities: Series Bible/register first; current canon/continuity next; stage-specific task next; anti-AI corrections last and only as selective interventions.
- Removes the old standalone prose/style helper layers from active prompts, so Luna is no longer told the same idea several different ways or given partially competing instructions about literary depth versus commercial pace.
- Planning stages now receive one compact planning priority rather than manuscript-editing constraints. Chapter planning still avoids mechanical rhythms and fixed formulas without being asked to imitate an editorial style guide.
- Thresholded V252.90 audit findings are folded into the same creative hierarchy. Normal-range categories remain invisible; only genuine outliers are surfaced, and absent categories are explicitly not suggestions.
- Keeps genre-preservation, naming/worldbuilding, collision-safety, continuity and publication safeguards separate because they govern different failure modes rather than prose taste.
- No new API route, model call, web call or Supabase migration.


## V252.90 — thresholded anti-AI interventions
- Keeps the complete deterministic V252.89 manuscript audit for the developer and review ZIP, but no longer exposes normal-range counts or a full stylistic inventory to Luna/Astra.
- Editing models now receive only patterns that cross explicit editorial thresholds, phrased as concrete reduction/diversification interventions rather than as a menu of devices.
- A clear audit explicitly tells the model not to invent an anti-AI problem and not to introduce devices merely because an audit exists.
- Chapter-level Revision and Line/style receive only globally significant interventions relevant to that chapter.
- Adds thresholded checks for repetitive chapter-ending questions, habitual short punch endings and repeated formula lead-ins, while preserving deliberate stylistic choices.
- No new API route, web call, model call or Supabase migration.

## Deterministic whole-manuscript anti-AI pattern audit
- Adds a deterministic full-manuscript audit before every Developmental pass. It is explicitly an editorial diagnostic, not an AI detector.
- Measures sentence/paragraph/chapter-length variation, em-dash density, rhetorical-question density, contrastive “not X … but Y” framing, possible triplet/three-part constructions, one-sentence paragraphs, short punch sentences, recurring stock gestures/phrases, chapter-ending shapes and exact six-word phrases repeated across chapters.
- Compares long exact phrases with up to the three preceding books in the same series to flag possible recycled prose.
- Stores the complete audit inside the Developmental editorial plan and supplies a compact evidence brief to the Developmental editor.
- Revision receives the relevant chapter-specific findings and is told to fix only genuinely intrusive recurrence, never to chase numerical quotas or erase intentional voice.
- Line/style receives the same selective diagnostic; Proof remains copy-focused.
- Re-runs the deterministic audit on completed Revision, Line/style and Proof manuscripts so the book page can show before/after pattern metrics.
- Adds a visible Whole-manuscript pattern audit card to Fiction Studio and exports the complete audit JSON with review ZIPs.
- No new API route, no web call, no paid model call for the audit itself, and no Supabase migration.

# Moonbeam Stories V252.86

## V252.82 — Series-register preservation
- Series Development now infers the appropriate prose style, pacing, accessibility and narrative texture from the genre/readership/positioning already established by the developer or by Astra, without numeric style sliders or a universal literary target.
- Book Development, chapter planning, drafting, Developmental, Revision and Line/style now explicitly preserve the established series register.
- Luna's human-depth and anti-banter/anti-pithiness guidance is now corrective only: it removes known AI/Luna tics without automatically making every book more introspective, slower or more literary.
- No Supabase migration is required for this build.

- Fiction Studio now inserts a mandatory human **cast & proposed-book-title review checkpoint** after Series Development and before the first Book Development.
- Core character names and initial working book titles are presented in a clean review panel. The developer can approve them unchanged or edit them before downstream plans exist.
- Exact full-name/title references in the Series Bible are updated automatically; every short first-name/surname occurrence requires an explicit Change / Leave decision so unrelated uses are never silently altered.
- Book Development is locked server-side until the current Series Bible has completed this review. Existing established series are backfilled as already reviewed, so they are not disrupted.
- Refining a series before any Book Development resets the checkpoint; once books exist, later series edits keep the established review state and series-wide text tools remain the safe way to propagate identity changes.
- Supabase migration: `SUPABASE_V252_81_FICTION_BIBLE_NAME_REVIEW.sql`.

# Moonbeam Stories V252.80

## Fiction Studio series writing language / locale

- Added a persistent series-level **Writing language** selector with 65 text-only language/locale options.
- Fiction Studio controls remain in UK English regardless of the selected writing language.
- New series default to **English (UK)**. Existing series retain the previous **English (US)** behaviour.
- The chosen language is stored on `developer_fiction_series.language_locale` and inherited by Series Development, Book Development, chapter planning, first-draft generation, Developmental, Revision, Line/style, Proof, Series Intelligence and selective context retrieval.
- Language/locale is distinct from geographic setting: it supplies the default linguistic/cultural frame, while explicit settings keep authentic local dialogue, institutions and place-specific terminology.
- The language is fixed at series creation in the current UI, so different series may use different languages without affecting one another.
- Supabase migration: `SUPABASE_V252_80_FICTION_LANGUAGE_LOCALE.sql`.

# Moonbeam Stories V252.79

## V252.79 — Quiet deleted-fiction cleanup status

- When the retrospective deleted-fiction audit is clear, the large cleanup card is replaced by a small muted `Deleted-fiction cleanup: clear` line with a compact **Check again** control.
- If orphaned traces are detected, the full cleanup panel automatically returns with the purge action.
- After a successful purge the UI collapses back to the quiet clear state.
- No Supabase migration required.

V252.74

Series/book production dashboard cleanup: series cards now list every planned book with Finished/In progress/Ready/Not started status derived from live Fiction Studio records; book pages show the current production/editing stage rather than only first-draft completion.

## V252.73 — Retrospective deleted-fiction cleanup

- Adds a developer-only legacy orphan audit when Fiction Studio opens.
- Detects traces left by books/series deleted before V252.72: orphaned books, chapters, continuity, editorial runs/chapters/continuity and usage events.
- Adds **Purge legacy deleted traces** on the Fiction Studio library when leftovers are found.
- Purge is scoped to the authenticated developer account and the existing Fiction Studio table allowlist.
- Child/detail records are removed before parent rows, then the server rescans and fails closed if any orphan remains.
- Surviving series whose Series Intelligence may contain facts derived from a legacy-deleted book have Series Intelligence reset and cached selective context cleared; surviving manuscripts are not altered and memory can rebuild retrospectively from completed proofs.
- Browser resume/background state for orphaned book IDs is cleared after cleanup.
- No Supabase migration required.

## V252.72 — Thorough Fiction Studio purge

- Fiction Studio **Delete novel** now explicitly purges that novel's Book Plan, first-draft chapters, first-draft continuity, every editorial run, editorial chapters, editorial continuity, Proof history, and Fiction Studio usage events before deleting the book row.
- The server verifies that no matching records remain in any approved `developer_fiction_*` table before reporting success.
- Deleting a novel resets Series Intelligence and clears cached selective series context from surviving books, preventing derived archive/context from retaining facts extracted from the purged novel. Remaining proofed books can rebuild Series Intelligence retrospectively on the next development run.
- If later books exist, a complete novel purge requires purging that novel **and all later books**, because downstream manuscripts may already contain continuity derived from it. The UI names those later books before confirmation.
- Fiction Studio **Delete series** now explicitly purges all books, drafts, continuity, editorial branches, proofs, usage history, Series Intelligence and the Series Bible for that series, then verifies every series-scoped Fiction Studio table is empty.
- Browser-side Fiction Studio resume state, model-choice state, pause state, and in-tab background-job records are purged for every deleted book.
- Active in-tab generation/edit jobs block purge until they finish or are paused, reducing the risk of an in-flight request trying to write after deletion.
- Downloaded review ZIPs or other copies already saved outside Moonbeam are not affected.
- No Supabase migration required.


## V252.71 — Background Book Development

- Book Development/planning now runs as a locked Fiction Studio background job with its own series ID and book ID.
- Navigating to another series no longer redirects or pauses chapter-plan batching.
- Different books in different series can be in Book Development, manuscript generation, or editorial re-edit simultaneously.
- One active paid generation/edit job per book is still enforced.
- Completion only refreshes the book UI when that same book is still open; otherwise progress remains visible in Background jobs.
- No Supabase migration required.
# V252.69
- Adds **Re-edit from this version**. A completed Revision, Line/style or Proof manuscript can now be selected as the source for a fresh Developmental → Revision → Line/style → Proof branch; First Draft remains available as a source.
- The Fiction Studio reader now has a **Re-edit from this version** action that returns to the book with that exact manuscript version preselected.
- Re-edit Developmental analysis now reads the selected source manuscript and its matching continuity rather than always reading the untouched first draft.
- Revision correctly unwraps the Developmental planning pass and edits the exact manuscript version that Developmental analysed; branch ancestry remains preserved through `source_run_id`.
- Reader composition also follows Developmental source ancestry, so in-progress and completed branches based on an already edited version display the correct underlying manuscript.
- Existing versions are never overwritten. Every new branch remains independently selectable in history.
- Keeps V252.67 repeatable re-edit safeguards, V252.66 human-depth direction, global anti-banter/anti-pithiness rules, immutable chapter titles, word-count protection, Series Intelligence and background-job concurrency intact.
- No Supabase migration required.

# V252.67

- Fixes repeat **Re-edit from First Draft** runs. Completed re-edit browser state is now retired/cleared after Proof, so every later click creates a genuinely fresh Developmental → Revision → Line/style → Proof branch instead of reusing the previous branch IDs and jumping to Proof.
- Only unfinished re-edit branches are resumable. All completed historical branches remain preserved in Supabase and the version history.
- No Supabase migration required.

# Moonbeam Stories V252.66

- Fixes Re-edit from First Draft so a fresh branch automatically continues Developmental → Revision → Line/style → Proof, using exact source-run lineage and preserving all earlier versions.
- Detects an already-completed orphan Developmental re-edit and resumes from Revision instead of starting Developmental again.
- Re-edit controls now expose Luna/Sol/Astra separately for all four editorial stages.
- Adds a clean full-width optional Additional editorial direction box; the global editorial brief still applies automatically.
- Tidies the re-edit panel layout and shows visible branch progress / next stage.
- Keeps all V252.63 anti-banter, anti-pithiness, title-protection, word-count, Series Intelligence and publication safeguards.

# V252.63 — global anti-banter fiction rule

- Makes anti-banter a standing rule for **all adult-fiction genres**, not merely an editorial diagnosis or an erotica-specific safeguard.
- First-draft chapter generation now receives the same anti-banter / anti-pithiness rule used by Revision and Line/style. Luna must not use teasing, quips, witty repartee, playful one-upmanship, smug back-and-forth, verbal sparring or characters continually trying to land the last line as a generic way of creating chemistry or keeping scenes lively.
- Book/chapter architecture is also told not to plan habitual banter as a default source of scene energy.
- Banter is not prohibited outright: it may appear occasionally when genuinely demanded by the characters, relationship, genre and moment.
- The existing stronger erotica safeguard remains: during sexual scenes, banter should be especially rare unless specifically established and natural to the moment.
- Keeps V252.63 anti-pithiness, dialogue-naturalism, genre-preservation, immutable chapter-title, word-count protection, re-edit, publication-integrity and Series Intelligence safeguards intact.
- No Supabase migration required.

# V252.63 — explicit anti-banter dialogue safeguard

- Adds a genre-preservation overlay for fiction explicitly identified as erotica. Revision and Line/style must preserve the intended erotic intensity, explicitness, vocabulary, frequency and centrality rather than sanitising, romanticising or fading out sexual material in the name of sophistication.
- Erotica receives an additional sex-scene safeguard: sexual dialogue must not default to banter, jokes, clever one-liners or performative repartee. The editor should prefer whatever speech pattern is natural to the moment, including immediacy, desire, hesitation, interruption, incomplete speech and silence, while preserving established character voice.
- Improves erotic variety through motive, power, anticipation, physical detail, emotional texture, dialogue and scene dynamics instead of simply deleting erotic material as repetition.
- Strengthens the dialogue-naturalism rule into an explicit anti-banter safeguard across Developmental, Revision and Line/style. Banter means habitual teasing, quips, witty repartee, playful one-upmanship, smug or clipped back-and-forth, and characters constantly trying to land the last line. It may still appear when genuinely character- and situation-specific, but must not become the default conversational texture or a generic signal of chemistry.
- Encourages natural variation in dialogue length, interruption, hesitation, overlap, evasion, misunderstanding, incomplete thoughts and ordinary speech while preserving genuinely sharp dialogue where it belongs.
- Keeps V252.60 chapter-title protection, target-aware revision, restorative under-length recovery, re-edit-from-first-draft branching and publication checks unchanged.
- No Supabase migration required.

# V252.60 — Fiction Studio editorial-quality safeguards

- Protects Fiction Studio chapter titles as immutable publishing metadata after the first draft. Revision, Line/style and Proof no longer ask the model to return chapter titles; the canonical source title is copied forward deterministically. Accidental model-returned chapter headings are stripped from the manuscript body.
- Adds publication-readiness checks for missing/suspicious chapter titles, duplicate chapter numbers, suspiciously short chapters and severe final under-length. Review exports include the check result.
- Makes Revision target-aware. The approved Book Plan `target_words` and source manuscript length are supplied to the editor, with a normal ±8% whole-book target band and proportional chapter guidance.
- If a completed Revision is below 92% of the approved target, Moonbeam automatically performs bounded restorative passes on the most under-length chapters. The purpose is to recover character depth, scene dynamics, atmosphere, causality, emotional consequence and world specificity without padding or changing plot facts. Each chapter is attempted at most once, preventing an uncontrolled cost loop.
- Line/style and Proof are explicitly constrained against material compression.
- Generalises the Revision brief across genres: preserve the book's genre, pace, tone and narrative engine while deepening psychological specificity, subtext, contradiction, emotional complexity, social observation and sentence-level texture where appropriate. Literary ornamentation, introspection and slowness are not forced.
- Adds per-stage manuscript word counts against the approved target in the Fiction Studio book screen.
- Adds **Re-edit from First Draft** for already-completed books. It creates a fresh Developmental branch from the untouched first draft while preserving every earlier Developmental, Revision, Line/style and Proof run for comparison. Subsequent stages follow the new branch by exact `source_run_id` lineage.
- Revision now resolves the Developmental report from its own editorial ancestry rather than silently using the latest unrelated Developmental run.
- Keeps V252.59 Series Intelligence unchanged. No new Supabase migration is required.

## V252.57 — resilient Book Development batches + continuous mobile novel reader

- Fiction Studio Book Development now expands detailed chapter plans in **4-chapter batches** rather than 8, substantially reducing `max_output_tokens` failures on detailed Astra plans. Each successful batch is still checkpointed; Resume starts at the first missing chapter.
- The **Fiction Studio novel reader on mobile only** is now one continuous vertically scrollable manuscript, with chapter headings inline. Horizontal page-swiping and artificial mobile pagination are removed.
- Desktop Fiction Studio novel reading remains the measured two-page spread.
- The normal Moonbeam children's-story reader is unchanged.
- No Supabase migration required.

## Safe-base provenance

V252.47 is based on `Moonbeam_Stories_V252.46.4_VERIFIED.zip`. The V252.46.4 review-export behaviour is retained and extended; the failed/reduced V252.46.5/V252.46.6 packages are not used as a source.

# V252.46.4

- Fiction Studio review ZIP now exports all persisted series/book/manuscript/editorial/accounting material, including developmental reports and every preserved editorial manuscript version.
- Export explicitly records that V252.46 has no editorial-version continuity ledgers rather than inventing them.

# V252.42

Fiction Studio progress is now derived from one authoritative calculation: planned chapter numbers in the approved Book Plan versus distinct chapter numbers durably saved in Supabase. Saved count, next chapter, Resume/Generate state and Novel Complete all use that calculation. Generation resumes at the first missing planned chapter and Novel Complete is impossible until every planned chapter number exists. V252.41 per-book API cost/time metering is retained unchanged. No new Supabase migration.

# Moonbeam Stories V252.39

## V252.39 — Series Bible propagation
- Revised Series Bible proposed-book concepts now automatically update matching undeveloped saved-book placeholders.
- Starting an undeveloped book refreshes its title and premise from the current authoritative Series Bible before Astra plans it.
- Existing books with real planning work are preserved rather than silently overwritten.
- Updated stale Fiction Studio boundary copy.
- No database migration required.

# Moonbeam Stories V252.38

## V252.38 — Fiction Studio structured-response audit hardening
- Centralises Fiction Studio structured Astra parsing in one fail-closed handler.
- Applies it to Series Bible development/refinement, novel architecture, chapter-plan batches, the legacy one-shot Book Development path, and manuscript chapter generation.
- Explicitly distinguishes incomplete, refused, empty, and malformed structured responses before any stage is persisted or any resumable checkpoint advances.
- Keeps the existing strict JSON schemas, V252.35 chapter-number validation, and V252.37 output-token allowances unchanged.
- No database migration required.

# Moonbeam Stories V252.37

## V252.37 — Fiction Studio Book Development response fix
- Traced the novel-architecture failure to two resumable Book Development calls that still used the old local `d.output_text` parser and therefore bypassed the V252.36 structured-response extractor.
- Novel architecture and chapter-plan batches now use the same robust structured-output extractor as the Series Bible path.
- Detects incomplete Responses API results explicitly and preserves the resumable checkpoint instead of misreporting malformed JSON.
- Raises architecture output allowance from 5,000 to 8,000 tokens and chapter-plan batch allowance from 5,000 to 7,000 to reduce truncation risk.
- Strict schemas and V252.35 chapter-number validation remain unchanged.
- No database migration required.

# Moonbeam Stories V252.36

## V252.36 — Astra structured-response fix
- Fixes false `Astra returned an invalid Fiction Studio response` errors caused by assuming structured Responses API output always appears in one text field.
- Adds one robust server-side extractor for top-level output text, message content text/output_text, and parsed/json structured payloads.
- Keeps the existing strict Fiction Studio schemas; no Series Bible validation has been weakened.

# Moonbeam Stories V252.35

## V252.35 — Fiction chapter-plan validation
- Rejects malformed Astra planning batches unless every requested chapter number is present exactly once.
- Discards out-of-range chapter commentary rather than appending it to the Book Plan.
- A failed batch does not advance the checkpoint; Resume Book Development retries safely.
- Existing malformed plans are repaired on adoption by retaining one valid chapter per number and dropping duplicate/out-of-range entries.
- Completion now requires a contiguous validated 1..N chapter set.

# Moonbeam Stories V252.34

## V252.34 — Existing-novel adoption fix
- Fixes duplicate `developer_fiction_books_series_id_position_key` when an earlier Fiction Studio novel already occupies the Series position.
- Start Book Development now loads/adopts the existing immutable novel record before considering INSERT.
- Missing resumable `development_state` is inferred from the existing Book Plan and preserved content.
- Repeated clicks/retries/lost responses are idempotent at the Series+position boundary.
- No existing novel content is deleted or regenerated merely to migrate it.

# Moonbeam Stories V252.33

## V252.33 — Persistent Fiction Studio
- Resumable staged Book Development fixes the monolithic 20–50 chapter planning request that could 504.
- Generate Novel automatically writes sequential chapters, checkpointing every chapter and continuity update; Resume Novel continues from stored state.
- Persistent saved-novel library plus Series/Novel rename and cascading delete controls.
- Current database identity/state is authoritative for subsequent Astra requests.
- Novel and Series review ZIP exports, including partial manuscripts.
- Server-side export/context reconstruction avoids shuttling the accumulating manuscript through the browser.
- Developer-only Back Room isolation retained; 12 API-file ceiling unchanged.

# Moonbeam Stories V252.32

## V252.32 — Fiction Studio manuscript test
- Adds sequential adult-fiction chapter drafting after an approved Book Plan.
- Adds a persistent live continuity ledger updated after every generated chapter.
- Each new chapter receives the Series Bible, authoritative Book Plan, live ledger, and two most recent chapters for immediate prose/voice continuity.
- Actual manuscript/ledger facts explicitly outrank stale outline details.
- Developer-only server gate remains mandatory; no children's story or Sunburst route is shared.
- Adds dedicated `developer_fiction_chapters` and `developer_fiction_continuity` storage; browser roles remain revoked and service-role access only.
- This stage is intentionally a prose-quality experiment, not an automatic publication pipeline.

# Moonbeam Stories V252.31

- Fixed Fiction Studio opening with `permission denied for table developer_fiction_series`.
- The V252.29 table correctly revoked browser access, but the new table had not explicitly granted PostgreSQL table privileges to `service_role`. V252.30 grants only the server-side service role SELECT/INSERT/UPDATE/DELETE.
- Browser roles (`anon` and `authenticated`) remain revoked; Fiction Studio still reads/writes exclusively through the developer-authenticated server API. No children's story-generation code or prompts were changed.
- Live Supabase migration `v252_30_fiction_studio_server_permissions` applied successfully.

- Added the first-stage developer-only **Fiction Studio / Back Room** for experimenting with full-length adult commercial fiction.
- Back Room entry is mounted only after Moonbeam's existing server-verified developer access check succeeds. Every Fiction Studio API operation independently verifies the authenticated user against `MOONBEAM_DEVELOPER_EMAIL`; hiding the UI is not the security boundary.
- Fiction Studio data uses a new `developer_fiction_series` table. The migration enables RLS and explicitly revokes `anon` and `authenticated` table access; browser clients receive no policy. Reads/writes occur only through the server-side developer-gated API.
- Fiction Studio Astra has a separate full-length commercial-fiction series-development prompt and structured Series Bible. It does not call the children's story planner, final story writer, illustration pipeline, Sunburst, Cast, Saved Stories, or Publishing Library.
- Stage 1 supports: pen name, series name, Series Brief, selectable Series Development model, series development/refinement, direct Bible review/editing, and explicit Bible save.
- Stage 1 deliberately stops before novel outlining, chapter generation, cover generation, KDP export, or publication.
- No new Vercel function was added: the isolated Back Room action branches at the top of the existing authenticated `/api/generate` function, preserving Moonbeam's 12-function deployment limit while keeping the generation logic and prompts separate.
- Supabase migration required: `SUPABASE_V252_29_FICTION_STUDIO.sql`.

# Moonbeam Stories V252.28

- Fixed developer **Download review ZIP** image resolution.
- V252.27 incorrectly routed review-export images through `savedAssetUrl()`, which only resolves assets for the currently open saved book. A Volume export runs from the Publishing Library, so that guard returned no image even though every image was present in saved-story storage.
- Review export now reads the exact saved cover/page asset paths directly through Moonbeam's existing `savedArtBlob()` storage/cache path, the same underlying saved artwork used by the reader.
- The exporter remains strict: it does not silently omit an image that Moonbeam says is present.
- Works for both complete Volume review ZIPs and individual/Loose Story review ZIPs.
- No Supabase migration required.

# Moonbeam Stories V252.27

- Added developer-only **Download review ZIP** for every saved story, including Loose Stories.
- Added developer-only **Download review ZIP** for Volumes. Volume exports use the current live Volume membership and story order.
- Review ZIPs contain plain-text story content, JSON manifests, the saved cover, and all saved interior illustrations, organised into one folder per story.
- Review export is deliberately separate from KDP/EPUB publication packaging and requires no Supabase migration.

# Moonbeam Stories V252.26

- Fixed Edit Series Bible save/close crash caused by stale `closeSeriesPlanner25194` reference.
- Save now persists the Bible, refreshes the Publishing Library, and closes the editor using the live Series planner modal.
- Fixed the same stale close reference in Edit Series Cast.

- After a Series Bible is approved, the Publishing Library now shows **Edit Series Bible** instead of reopening **Develop with Astra**.
- Edit Series Bible opens Astra's current approved Bible directly in an editable text area; **Save Series Bible** replaces the canonical creative brief used for future Volume/story planning while preserving approved/setup state and all existing stories.
- Series setup wording no longer suggests an artificial one-extra-character limit; Series Cast are available when naturally required, including several established family members in the same story.
- No Supabase migration required.

# Moonbeam Stories V252.23

## V252.23 — editable Series-world Cast relationships

- Adds **Edit Series Cast** to every completed Series folder, so recurring Cast can be added or removed after initial Series setup without recreating the Series.
- Every selected Series-world Cast member now has required Series-specific relationship/role metadata (for example, “Sam’s older sister” or “Sam’s dog and sidekick”).
- Relationship metadata is stored inside the existing Series Plan JSON, so no Supabase migration is required.
- Astra receives the current Series-world Cast dynamically with `series_relationship` on all later Series/Volume planning calls.
- Automatic Volume story production carries the selected supporting character’s Series relationship into the normal Moonbeam story engine.
- Canonical Cast identity/visual references remain separate and authoritative; Series roles describe narrative relationships only.
- Existing approved Series Bibles and generated stories are not altered when Series Cast is edited.

## V252.20 — Series setup wizard ordering fix

- Fixes a later Publishing Library override that bypassed the mandatory New Series wizard and created a bare Series folder instead.
- `＋ Series folder` now always starts the ordered setup flow: series name → main character → Series-world Cast → audience → series idea → Astra development → review/approval.
- This guarantees supporting Cast are selected and persisted before Astra first develops the series premise, so canonical supporting Cast records such as Biscuit are available to Astra automatically.
- Incomplete Series folders now show only **Continue series setup** (plus rename/delete), preventing Volume generation or the legacy Develop Series route from bypassing required Cast setup.
- No database migration required.


- Astra now chooses the ideal published Volume size (8–16 stories) and automatically plans two additional full-quality editorial candidates (10–18 generated candidates total).
- Astra independently chooses 6, 7 or 8 story pages for every automatic Volume story; the former hard-coded six-page Volume override has been removed.
- The existing variable-length Moonbeam story engine is reused; loose developer stories remain independently configurable at 6–10 pages.
- Series-development architecture now explains these freedoms to Astra and tells later publishing work to treat the current surviving Volume contents as authoritative rather than stale planning counts or deleted concepts.
- No application-level character truncation has been reintroduced into Astra Series Development.
- No Supabase migration is required.

# Moonbeam Stories V252.18


## V252.18 — full Astra series context + explicit book/volume architecture

- Removed Moonbeam's silent application-level truncation from the Astra Series Development context. Developer input, Series Plan, Volume Plan, Series-world Cast and prior-volume context are now passed in full rather than sliced to arbitrary character limits.
- Removed the 20-character Series-world Cast cap and 40-prior-volume cap in the Astra planning request.
- Added permanent Astra publishing architecture: a Series contains Volumes; a Volume contains multiple separate Moonbeam stories/books; each individual Moonbeam book is a complete short illustrated read-aloud story of 6–8 story pages.
- The existing new-Series setup continues to support optional Series-world Cast, so characters such as Biscuit can be supplied canonically from the start.
- No Supabase migration required.

## V252.17 — remove automatic post-paint Astra replacement loop
- Builds directly on V252.16.
- Removes the mandatory Astra post-generation forensic review/repaint loop for interior illustrations.
- A successful Sunburst render is accepted by default instead of triggering an automatic paid replacement because a subsequent Astra review dislikes it.
- Astra remains the authoritative art director before painting: the complete production plan, scene commission, canonical Cast references and accumulated visual continuity still drive Sunburst's first render.
- Image-safety rejection recovery remains separate and unchanged; it only runs when the image service actually rejects a request.
- Manual developer illustration correction/editing remains available.
- V252.16 collapsible Series/Volume folders and V252.15 saved-story editing fix are retained.

# Moonbeam Stories V252.16

## V252.16 — collapsible Publishing Library folders

- Series folders can now be collapsed and expanded independently.
- Volume folders can now be collapsed and expanded independently, including Loose Volumes.
- Each Series/Volume open/closed state is remembered in this browser across library rerenders, navigation and refreshes.
- Folder action buttons remain inside the expanded content and do not interfere with the folder toggle.
- Built directly from V252.15; the saved-story illustration-edit fix and V252.14 flexible Publishing Library support are preserved.
- No additional Supabase migration is required for V252.16.
- Cache-busted browser assets to V252.16.


## V252.15 — saved-story illustration edit + Publishing Library diagnostics
- Fixed saved-story illustration editing crash: `requestIllustration()` now prepares `continuityThumb` before sending the correction request, including after a story has been saved and reopened.
- Preserves V252.14 flexible Publishing Library behaviour: Series and Volumes may be created independently, including Loose Volumes.
- Publishing Library now replaces the raw `series_id` / missing-table database error with a clear instruction when the required V252.14 Supabase migration has not yet been applied.
- New Series setup errors are surfaced instead of failing silently.
- Cache-busted browser assets to V252.15.
- The V252.14 database migration is still required once: `SUPABASE_V252_14_FLEXIBLE_LIBRARY.sql`.

---

# Moonbeam Stories V252.14

## V252.14 — flexible Series / Volume / Story library
- Series folders and Volume folders can now be created independently and may remain empty.
- Volumes may be Loose Volumes or moved into/out of any Series. Moving a Volume out of a Series returns it intact to Loose Volumes.
- Stories may be Loose Stories, filed into a Volume, or filed directly into a Series. Series are always top-level and cannot be placed inside Volumes.
- Deleting a Series folder detaches its Volumes to Loose Volumes and its direct Stories to Loose Stories; deleting a Volume folder returns its Stories to Loose Stories.
- Volume production automatically saves each completed story into its Volume. There is no post-generation accept/reject/replace workflow and no Replace Story action.
- Story-slate planning is now batch-oriented: edit planned concepts if desired, then generate; review/delete later in Saved Stories.
- Removes Volume-cover creation from Volume generation and Saved Stories. Volume-specific Kindle/print cover assets are deferred to the publishing stage.
- Existing story and illustration generation pipelines are otherwise unchanged.

### Required Supabase migration
Run `SUPABASE_V252_14_FLEXIBLE_LIBRARY.sql` once before using the new library controls.

---

# Moonbeam Stories V252.12

## V252.12 — legacy Volume-cover detection repair
- Fixes the retrospective Volume-cover control for already-generated Volumes such as **King Sam**.
- Saved Stories no longer relies only on the newer `plan.stage === "complete"` flag to decide whether a Volume is complete. It also recognises the persisted Volume status and, for older records, a fully produced story slate / complete Volume membership.
- A completed legacy Volume with no `volume_cover_path` now shows **Generate Volume Cover** without regenerating or modifying any story.
- Future automatic Volume-cover generation from V252.11 is unchanged.
- No Supabase migration and no new API endpoint.

---

# Moonbeam Stories V252.11

## V252.11 — Series Volume covers
- Adds a distinct developer-only Volume cover as the final production step after the last approved story in a Series Volume is generated and saved.
- Astra designs the cover for the collection as a whole from the Series Bible, Volume Bible and completed story slate; Sunburst receives the lead Cast reference plus selected finished story illustrations as visual canon.
- Volume-cover artwork contains no generated typography. Moonbeam renders the Series name and Volume title separately so publishing can flatten them later without contaminating the source artwork.
- The finished Volume cover is stored in the existing private `saved-story-art` bucket and its path is persisted in the Volume plan; no new table or bucket is required.
- Completed legacy Volumes with no cover (including King Sam) show **Generate Volume Cover** in Saved Stories. This creates only the missing Volume cover; existing stories and illustrations are untouched.
- Once present, the Volume cover is displayed as the visual identity for that Volume in the developer Saved Stories / Series Library.
- Future Volume production automatically creates the Volume cover immediately after the last story completes. If cover creation fails, all stories remain saved and the manual Generate Volume Cover action remains available.
- Reuses the existing `generate` and `illustrate` endpoints; callable API count remains 12. No Supabase migration.

---

# Moonbeam Stories V252.09

## V252.09 — simpler Volume curation; replacement production removed
- Removes the post-generation **Delete and replace** workflow and its automatic replacement-story production/resume UI.
- Deleting a finished story from a Volume now simply deletes it and removes the matching slot from the Volume production plan; the Volume count falls by one.
- Legacy interrupted replacement checkpoints already present in a Volume are shown as **Incomplete** with **Delete incomplete story**. Deleting one removes its partial artwork/checkpoint and removes that slot from the Volume plan. Nothing is regenerated.
- The intended workflow is now deliberately simple: generate more stories than the final book needs, keep the best, delete weaker stories, and optionally move a Loose story into a Volume manually.
- Removes the pre-production **Reject & replace** action too; Volume planning creates the requested 8–16 concepts once, after which you can accept/edit the slate and curate the finished books by deletion.
- V252.07 illustration-transfer optimisation is retained unchanged.
- No Supabase migration and no new API endpoint.

---

# Moonbeam Stories V252.08

## V252.08 — Series replacement resume UI repair
- Volume replacement partials are no longer surfaced through the generic unfinished-story modal; they stay in their Series/Volume slot with the compact Resume button.
- Pressing Resume now closes any stale generic modal and opens a self-contained visible progress overlay with explicit colours, hourglass and live status text.
- Resume no longer depends on the hidden Create Story screen for visible feedback.
- The hidden Generate button is now guarded so a missing setup control cannot abort a Saved Stories resume before the checkpoint is opened.
- Existing single-flight checkpoint lock and V252.07 transfer optimisation are retained.
- No database migration or new API endpoint.

---

# Moonbeam Stories V252.07

## V252.07 — lower illustration transfer + visible single-flight replacement resume
- Compresses accepted illustration continuity references to 640 px JPEG quality 0.84 before sending them to `/api/illustrate`; canonical full-resolution saved artwork is unchanged.
- Deduplicates the immediately previous illustration so it is not sent both as the dedicated continuity image and again in the automatic visual-reference set.
- Compresses rejected correction candidates before retransmission; Cast references remain unchanged.
- Replacement Resume now opens a visible progress overlay from the Series/Volume Saved Stories view, mirrors the real resume stages, and uses a per-checkpoint single-flight lock so repeated presses cannot launch duplicate resume jobs.
- Existing checkpoint/resume generation logic and image model/output quality are unchanged. No Supabase migration.

# Moonbeam Stories V252.06

- Volume replacement stories that stop part-way now remain visible in their exact Series → Volume slot as **Replacement incomplete**, with saved illustration progress and a **Resume** button.
- Resume continues the existing `partial_story_generations` checkpoint rather than starting the replacement again.
- When a resumed replacement finishes, Moonbeam saves it, files it back into the same Volume slot, updates `produced_story_ids`, and only then removes the partial checkpoint.
- New replacement checkpoints also persist their intended Volume position/title so the slot survives interruption.
- Existing V252.05 orphaned replacement checkpoints are recovered from their already-saved `seriesVolumeStory`, `volumeId`, and `volumeStoryIndex` metadata.
- No Supabase migration and no new API endpoint.

---

# Moonbeam Stories V252.05

- Adds permanent Delete to developer Series Library story cards.
- Loose saved stories can be deleted with confirmation.
- A saved story inside a Volume offers DELETE, REPLACE or CANCEL.
- REPLACE asks Astra for a genuinely new concept before deleting anything, shows that concept for approval, then permanently removes the old story and generates the replacement through the current Moonbeam production pipeline.
- Replacement preserves the same Volume slot/order and updates the Volume production record to the new saved-story ID.
- If Astra cannot create a replacement concept, the existing story is left untouched.
- If replacement generation later fails, the approved replacement concept remains in the Volume plan for recovery; completed unrelated stories are untouched.
- No new API endpoint or Supabase migration.

# Moonbeam Stories — V252.04

- Rejected illustrations are no longer retried with only an appended defect note. Astra now performs a dedicated corrective-art-direction pass and rewrites the complete painting commission before the single automatic repaint.
- The corrective pass receives the rejected candidate, forensic diagnosis/checklist and accepted visual canon, then specifies the repaired anatomy/geometry/object relationships explicitly and selects the strongest canonical references.
- Sunburst receives that rewritten commission plus the rejected candidate (non-canonical) and accepted references; the repaint must still pass both forensic QA gates before acceptance.
- No database migration. Vercel API count unchanged.

# Moonbeam Stories V252.03 — forensic two-pass illustration QA

- Builds directly on V252.02/V252.01.
- Replaces the single broad Astra art-director check with two mandatory independent forensic passes before an interior illustration can become canon.
- Pass A checks internal physical integrity systematically: expected limbs and connections, anatomy, occlusion, hands/feet where conspicuous, body/object intersections, paired objects such as boots, and object construction.
- Pass B separately checks cross-image continuity against earlier accepted paintings: characters, garments, objects, furniture, architecture, masonry, geography and topology. It explicitly checks individual visible stones/blocks, mortar joints and coping stones when the same surface reappears.
- Each pass must return an explicit structured checklist. A material FAIL blocks acceptance even if the model's overall boolean says pass.
- Candidate/reference review images are increased from 320px/72% JPEG to 512px/84% JPEG so fine masonry and object details remain inspectable while staying bounded for request size.
- Only after both passes succeed can an image enter the cumulative visual canon. A failed candidate receives the concrete forensic findings for one corrective repaint and the replacement must pass both gates again.
- Existing Needs assistance fail-closed behaviour remains after a failed correction.
- Retains V252.01 Usage & economics pagination repair. No SQL migration and no additional Vercel endpoint.

---

# Moonbeam Stories V252.02 — cumulative illustrator canon + mandatory visual QA

- Built directly on V252.01; retains the corrected paginated Usage & economics history reader.
- Every accepted interior illustration now becomes cumulative visual canon for later pages. Later Sunburst commissions receive selected accepted artwork as actual image references in addition to Cast identity references and the immediately preceding page.
- Continuity is defined at physical-object level, not merely style/category level: recurring masonry, mortar joints, walls, bridge geometry, waterways, doors, furniture, clothing, props, markings and other established construction must remain the same physical things when visible again.
- Adds a mandatory Astra art-director review after every generated interior and before it is checkpointed or allowed to become canon.
- The review compares the candidate with all earlier accepted illustrations (compact review copies) and separately checks internal physical integrity: missing/duplicated limbs, impossible anatomy/intersections, malformed paired objects and broken construction.
- A failed candidate receives exactly one automatic corrective repaint using Astra's concrete diagnosis and the strongest earlier references Astra identifies. The replacement is reviewed again.
- If the replacement still has a material continuity/anatomy defect, production stops in the existing Needs assistance recovery state rather than publishing the bad image or contaminating later pages with it.
- Failed candidates never enter the checkpoint/cumulative canon.
- No Supabase migration and no additional Vercel endpoint; the review multiplexes the existing generate endpoint. Existing image recovery limits continue to bound extra image spend.

---

# Moonbeam Stories V252.01

## Usage & economics pagination repair

- Fixes the actual cause of the apparently frozen Usage & economics dashboard and Generation support log.
- `api_usage_events` had grown beyond Supabase/PostgREST's 1,000-row response limit. The dashboard requested the table once in ascending date order, so it received only the oldest 1,000 events and silently omitted every newer event.
- The usage-summary endpoint now pages through the complete event history in 1,000-row ranges before calculating All-time, Since baseline, Developer/Other, This month, Today, Yesterday, Last 7 days, per-user generation totals and the support log.
- Retains V251.99's compatibility with both historical `story` completions and current `story_finalize` completions, including generation-run deduplication.
- This build is based on V251.99 and deliberately does not include the experimental V252.00 illustration-continuity changes.
- No Supabase migration and no new Vercel endpoint.

---

# Moonbeam Stories V251.99

## Usage & economics completed-story repair

- Repairs the developer Usage & economics page after the generation pipeline moved from the historical `story` completion event to `story_finalize`.
- Story totals, per-user Stories generated, Last generation, OpenAI cost/story and tracked attributable cost/story now recognise current successful finalisations while preserving historical `story` events.
- Modern completion events are deduplicated by `generation_run_id`, so a resumed/retried finalisation does not count the same story twice.
- Image, narration and raw attributable-cost event accounting is unchanged.
- No story-generation, Series/Volume production, Astra, Sunburst, credit, reader or publishing behaviour is changed.
- No Supabase migration is required.

---

## V251.98 — Automatic sequential volume production

Generate volume is now a single command: stories generate strictly in order, and each completed story is saved and filed before the next story starts automatically. If a story fails, the chain stops at that story; completed stories remain saved and Generate volume resumes from the first unfinished story.

# Moonbeam Stories V251.92

## V251.92 — consistent book-wide KDP text fitting
- Kindle export now measures every story text page before rasterising the EPUB.
- The longest page determines one shared font size for the whole book; every story text page uses that same size.
- Adds 33 px and 31 px safe fallback sizes below the previous 35 px floor so longer pages can fit without clipping.
- The existing 220-word hard ceiling and fixed 1080×1350 KDP page architecture remain unchanged.
- Reader typography, Astra story generation and illustrations are unchanged.
- No SQL or API endpoint changes.

---

# Moonbeam Stories V251.91

## V251.91
- Developer-account story generation no longer receives recent/saved-story anti-repetition memory, allowing repeated runs of the same test premise without earlier saved books influencing Astra.
- Applies to both Make Tonight's Story and Develop with Astra. The browser omits the memory and `/api/generate` independently enforces the developer bypass server-side.
- Normal users are unchanged and retain the compact memory of up to 10 recent saved stories for repetition avoidance.
- No database migration required.

- Fixes developer Story Workshop preparation crash: initializes `developerTextDiagnostics` before Astra diagnostic collection.
- No SQL changes.

- Final Astra story writing no longer receives the finished interior image pixels.
- Story architecture remains spread-by-spread and authoritative; each spread's event + art direction is the common source of truth for both Sunburst and final prose.
- Astra writes each final page from that locked spread event and page-specific art commission, preserving exact text/illustration alignment without captioning incidental image details.
- Finished interior thumbnails are still used by the cover pipeline so the cover can preserve whole-book visual continuity.
- Safety-redesigned production plans remain authoritative for final prose.
- No database migration required.

# V251.87

## V251.87 — developer story-length selector visibility fix

Built directly on V251.85.

- Fixes the developer-only 6–10 page/illustration selector being hidden by the legacy `.story-tone-select` CSS used to suppress the old Tone control.
- The selector now appears visibly immediately below the Story Idea box on the Create Story page for the developer account.
- Defaults to 6 pages + 6 illustrations and retains options 7, 8, 9 and 10.
- Both Make Tonight's Story and Develop with Astra continue to use the selected value through the existing V251.85 generation/workshop plumbing.
- Normal users remain hard-fixed at six and do not see this control.
- No Supabase SQL changes.

# V251.85

## V251.85 — paid-generation recovery and whole-book safety redesign

Built directly on deployed V251.84.

- Normal users can no longer discard partially generated stories. Their recovery choices are Resume or Save for later; developer-only discard/abort controls remain available to the developer account.
- Once a valid story has entered production and has a resumable checkpoint, later production failure does not refund the story credit. The credit remains attached to that generation and resuming it consumes no additional story credit. Pre-production rejection/failure before a resumable story exists retains the existing refund behaviour.
- Removes the old image-safety story-credit refund.
- Removes the old immediate second Sunburst safety retry inside `/api/illustrate`; a safety rejection now returns to the book-level recovery controller after one rejected image request.
- On the first image-safety rejection, Astra receives the diagnostic plus the complete remaining art plan and redesigns the failed illustration, every later illustration, and the cover as one safety-focused pass. Successful earlier illustrations remain locked.
- Moonbeam then makes exactly one automatic replacement attempt at the failed position. If that replacement is rejected, or any later image in the already safety-redesigned sequence is rejected, the story is frozen as **Needs assistance** rather than spending further automatic image attempts.
- Normal users see a plain-language **Contact Moonbeam** state for a Needs assistance story. Completed work and the consumed credit remain attached to that partial story; there is no automatic refund and no misleading Resume action.
- Developer account can open a Needs assistance story and explicitly authorise a developer-assisted recovery. Astra first redesigns the blocked remaining artwork again using the saved failure history before another image is attempted.
- Failure diagnostics are persisted inside the partial story's production plan (`_moonbeam_failure_diagnostics`). They record the failed stage/class and useful service details without exposing raw diagnostics to ordinary users.
- Resumed final-story generation supplies relevant saved diagnostics to Astra so it can avoid repeating an output/production mistake; infrastructure/transport diagnostics explicitly do not invite creative rewriting.
- Cover safety failures use the same one-redesign/one-replacement policy.
- Fixes the V251.84 Story Workshop action routing so developer workshop chat/commit actions are reachable independently of final-story generation.
- No new Supabase SQL is required for V251.85; diagnostics and recovery state use the existing V251.77 partial-generation record.

# V251.84

## V251.84 — consolidated developer publishing build

Built from V251.83, which itself contains the requested V251.82 and V251.83 changes, while V251.81 remains the user's last deployed baseline.

- Carries forward V251.82 developer Usage & economics **Reset baseline** control. Run `SUPABASE_V251_82_USAGE_BASELINE.sql` once before deploying this build if it has not already been run. The reset changes the persistent since-baseline point used by both usage/cost reporting and average story-build time; historical totals remain intact.
- Carries forward V251.83 developer-only **6–10 page + illustration selector**. Ordinary users remain fixed at six spreads.
- Carries forward V251.83 **4,000-character Story Idea** field.
- Adds a developer-only **Develop with Astra** route beside normal story creation. Normal Create Story remains unchanged and fully automatic.
- Develop with Astra performs Astra's concept/story architecture and whole-book art-direction pass, then pauses before any book illustrations are generated.
- The Story Workshop is conversational and developer-only. It can revise the structured production plan, discuss the book, and understand natural requests to show a visual preview.
- When the developer asks to see a design, Astra can commission a single Sunburst concept preview. The developer can discuss/revise it and approve it; approved previews are carried into production as art-direction references.
- Full production starts only after the explicit **Create this book** action. At that point the normal credit reservation, checkpoint/recovery, sequential interior illustration, final Astra writing and cover pipeline takes over.
- Workshop access is hard-gated to `MOONBEAM_DEVELOPER_EMAIL`; it is not exposed to normal accounts or any future Pro entitlement.
- No new Supabase migration is required for the Workshop itself.


- Developer account only: choose 6–10 reading pages/illustrations per generated story. Ordinary users remain fixed at 6.
- Story Idea limit increased from 2,000 to 4,000 characters.
- Storyboard planning, final Astra reconciliation, illustration loop, cover continuity references, and partial-generation resume now follow the selected developer page count.
- No new Supabase SQL required.

# V251.82

- Adds a developer-only **Reset baseline** control to the Usage & economics screen.
- Resetting stores the new baseline persistently in Supabase, so it survives deployments and no longer requires a new build.
- The same baseline drives both usage/cost **since baseline** figures and the average story-creation-time counter.
- Resetting does not delete historical usage events and does not alter All-time, This month, Today, Yesterday or Last 7 days.
- Run `SUPABASE_V251_82_USAGE_BASELINE.sql` once before using the reset button.

# V251.81

- Increased the Story Idea input limit from 500 to 2,000 characters. No story-generation, Astra, Sunburst, pricing, recovery, or other behaviour changed.

# V251.80

- Normal reference-based Moonbeam story illustrations and covers now use GPT-Image-2.5 Sunburst at **medium** quality instead of low.
- Developer image correction remains medium.
- No-reference GPT-Image-2.5 Flare generation remains low.
- No changes to Astra, art direction, prompts, resolution, continuity references, checkpoint/recovery behaviour, or story generation architecture.


## V251.79 — startup regression fix

- Fixes the blank Moonbeam shell introduced in V251.77/V251.78.
- Root cause: `applyInterfaceLocale()` renders the Saved Stories library during startup before the new `partialGenerations` `let` binding had been initialized, causing a JavaScript temporal-dead-zone `ReferenceError`.
- `partialGenerations` is now initialized with the other application state before any startup rendering can read it.
- Keeps the V251.77 checkpoint/resume system and V251.78 plain-English interrupted-generation recovery UI unchanged.
# Moonbeam Stories V251.79 — Preparing Story recovery guidance

## V251.79
- When automatic retries still cannot complete a generation, normal users now get a plain-language recovery state directly on the Preparing Story screen instead of a technical failure.
- If a checkpoint exists, Moonbeam explains that completed work is safe and offers **Resume story generation**, **Save for later**, or **Discard permanently** immediately.
- If the browser is offline, the screen says so in ordinary language, keeps Resume disabled until connectivity returns, then enables it without requiring a refresh.
- Developer diagnostics remain separate; ordinary users are not shown HTTP/OpenAI/Vercel terminology.
- The V251.77 Supabase checkpoint infrastructure is unchanged; no additional SQL is required beyond `SUPABASE_V251_77_PARTIAL_GENERATIONS.sql`.

# Moonbeam Stories V251.77 — resilient image retries + resumable partial generations

## V251.77
- Adds narrowly targeted automatic retries for transient OpenAI image transport failures such as `ECONNRESET` / terminated sockets, plus temporary 429/5xx image responses.
- Adds account-level generation checkpoints in Supabase. Astra's plan and every successfully completed interior illustration are persisted during generation.
- Interrupted stories can resume from the first unfinished illustration without consuming another story credit or regenerating completed artwork.
- On reconnect/sign-in, active interrupted generations offer **Resume generation**, **Save for later**, or **Discard permanently**.
- Saved-for-later work appears on Saved Stories in a separate **Partially generated stories** section; clicking it shows the same three choices.
- Temporary labels use child name + shortened original Story Idea, falling back to “Untitled story”.
- Developer Abort remains developer-only and now leaves the checkpoint available for recovery.
- Requires `SUPABASE_V251_77_PARTIAL_GENERATIONS.sql` once before deploying this version.

# Moonbeam Stories V251.76 — single-pass Astra art direction + parallel cover
## V251.76
- Astra now art-directs the front cover in the same planning pass as the six interior commissions.
- The cover commission is stored on the production plan; normal new-story generation no longer makes a second Astra cover-art-direction call.
- After all six interiors are finished, their compact continuity references are reused by two concurrent jobs: Astra writes the final story while Sunburst paints the already-planned cover.
- Moonbeam waits for both jobs, then opens the completed book with the prebuilt cover.
- Cover retry reuses Astra's stored cover commission rather than waking Astra again.
- The cover is a required story image (index 6) for the secure illustration allowance/recovery path.
- V251.74 developer Abort generation and ten-story anti-repetition memory are retained.


- Adds a developer-account-only **Abort generation** button to the hourglass generation state.
- Abort immediately stops the browser from starting any later Astra/Sunburst stages and cancels the active browser request where possible, so an abandoned test does not continue through the remaining six-image/final-writing pipeline. Work already submitted upstream may still finish and incur its own API cost.
- Ordinary user accounts never see the abort control.
- Reconnects the existing compact memory of up to 10 recent saved stories to Astra's story-architect/concept stage.
- That history is explicitly repetition-avoidance context only: it must not act as a creative template or constrain form, tone, structure or genre, and an explicit parent request may revisit a similar idea.
- No changes to Astra art direction, Sunburst model/quality, cover architecture, credits, or the shared usage/timing baseline.

---

# Moonbeam Stories V251.73 — Astra whole-book art director

- Astra now has two explicit pre-painting roles: story architect, then whole-book art director / visual continuity designer.
- Astra designs recurring story-created objects, creatures, vehicles, machines, locations and wardrobe, while canonical Cast photos remain authoritative for identity.
- Each of the six visual briefs now directs composition precisely where relevant: relative position/size, orientation, physical relationships, object state, facial expression, gaze, gesture and pointing targets.
- Astra is responsible for carrying those visual decisions and deliberate state changes consistently through all six scenes.
- Sunburst is explicitly treated as the painter: it renders Astra's commission rather than choosing or simplifying the staging. Image model and quality settings are unchanged.
- After Astra writes the final story, Astra returns to the art-director role to design the cover from the finished story plus the six actual interior paintings. Sunburst then paints that commissioned cover.
- The cover receives compact copies of the six finished interiors as visual-continuity evidence, in addition to canonical Cast references.
- No changes to story-writing autonomy, image quality, credits, shared usage baseline or generation-time baseline.

---

# Moonbeam Stories V251.72

## V251.72 — Astra art-directs the storyboard illustrations
- The storyboard stage now explicitly makes Astra the art director for all six interior illustrations.
- Each `visual_moment` is a direct composition brief to Sunburst: Astra specifies the exact intended instant and any story-critical positions, actions, physical relationships and object states needed for the scene to make sense.
- Sunburst is instructed to render Astra’s directed composition rather than independently choosing a different illustrative moment or simplifying it into a generic scene.
- No image model, image quality, house style, story-writing model, story structure, baseline, credit or account behaviour has changed.


## Shared generation/usage baseline

- The average story creation time beneath the generation hourglass now always uses the same `MOONBEAM_USAGE_BASELINE_UTC` baseline as the developer **Usage & economics** page.
- The current shared baseline remains **26 September 2026, 14:38:25 BST (13:38:25 UTC)**.
- Future baseline resets therefore reset both the usage/economics measurement and the all-account hourglass generation-time average together; there is no longer a separate hard-coded hourglass reset date.
- No story generation, Astra, illustration, KDP, credits, Cast or editing behaviour is changed.

---

# Moonbeam Stories V251.70

## Reset hourglass average story-generation time

- Resets the average story creation-time figure shown beneath the generation hourglass for all accounts at 26 September 2026, 15:10 BST (14:10 UTC).
- Historical generation timings before that point are excluded from the average.
- New successful story generations repopulate the average automatically using the existing calculation.
- No story-writing, Astra, illustration, pricing, credit, reader, Cast or developer-edit behaviour is changed.

---

# Moonbeam Stories V251.69

## V251.69 — usage economics account split + yesterday

- Keeps every existing Usage & economics period column.
- Renames the existing baseline column to **Overall since baseline** and adds **Developer since baseline** and **Other users since baseline**, all using the same V251.68 baseline timestamp.
- Adds **Yesterday** as an additional period column.
- Developer/other usage is split from the authenticated `user_id` already stored on usage events; no database migration is required.
- Keeps actual organisation-level OpenAI Costs API figures for periods where OpenAI can supply them. It does not fabricate an end-user split of that organisation bill.
- Adds Moonbeam's existing per-event tracked attributable cost and attributable cost/story rows in GBP, which can be separated by developer vs other users.
- No story generation, image generation, reader, KDP, Cast, credit or editing behaviour is changed.

---

# Moonbeam Stories V251.68

## V251.68 — Astra cost-comparison baseline reset

- Resets the developer **Usage & economics** `Since baseline` default to **26 Sep 2026 14:38:25 BST (13:38:25 UTC)** so subsequent usage and OpenAI cost can be compared after the Astra rollout.
- Historical **All-time**, **This month**, **Today**, and **Last 7 days** periods are unchanged.
- No story-generation, illustration, reader, KDP, Cast, account, or developer-correction behaviour is changed.

---

# Moonbeam Stories V251.67

## V251.67 — developer text editor context patch

- Changes only the developer-only AI text-correction prompt.
- The existing GPT-6 Astra corrector continues to receive the complete finished six-page story and now explicitly reads it as authoritative surrounding context before replacing the selected page.
- Narrow correction instructions preserve the existing literary form and voice as closely as possible; explicit broad/page-rewrite instructions may freely rewrite the selected page so it flows correctly between the unchanged surrounding pages.
- The developer instruction is authoritative. No other Moonbeam behaviour is changed.

---

# Moonbeam Stories V251.66

## V251.66 — Astra creative autonomy + KDP-safe page ceiling

- Removes accumulated creative/story-shape/prose prescriptions from concept, storyboard and final-writing stages. Astra chooses literary form, tone, structure, events and ending.
- Retains only hard age-safety, Cast integrity, copyright/public-domain, six-spread, visual-continuity and machine-output constraints.
- Never invents surnames. Public-domain reproduction/adaptation remains allowed; protected copyrighted expression is not.
- Unsafe/age-inappropriate or impermissibly copyrighted Story Idea inputs are flagged and returned to the parent for a new input rather than silently reinterpreted.
- Removes creative word-count targets and equal-page-length requirements. Each spread has only a 220-word absolute KDP ceiling.
- Kindle text rendering now chooses among the existing 47/43/39/35px sizes by actual wrapped line height rather than word-count bands, and refuses a page that cannot fit at the minimum safe size.
- Image generation, cover continuity, developer correction tools and API count are otherwise unchanged.

---

# Moonbeam Stories V251.65

- Experimental writer-model upgrade from the clean V251.60 baseline.
- The initial creative story concept and six-scene storyboard planning calls now use **GPT-6 Astra** instead of GPT-5.6 Luna.
- The prompts, story architecture and page structure are otherwise unchanged, so this isolates writer-model quality as the variable being tested.
- Final story reconciliation remains on GPT-5.6 Luna. KDP copy and other auxiliary text calls remain on GPT-5.6 Luna.
- Image generation is completely unchanged: normal reference-based Moonbeam artwork continues through GPT-Image-2.5 Sunburst at low quality; developer correction remains Sunburst medium; no-reference generation remains Flare low.
- No database migration and no API endpoint added.

---

# Moonbeam Stories V251.60

- Fixes the developer masked illustration corrector so recurring non-Cast characters, creatures, vehicles, machines and distinctive objects can be corrected from **actual visual references**, not a text-only reconstruction of their appearance.
- The current page remains image #1 and the sole edit master; the painted mask remains the hard editable boundary.
- Moonbeam reviews the compact other-book artwork against the developer's correction instruction, selects at most two images that actually show the implicated recurring entity, and attaches only those selected images to the image edit as **canonical identity references**.
- Canonical references control only what the entity looks like. The current page still controls pose, scale, orientation, expression, composition, camera, staging, background and lighting.
- Cast photographs remain authoritative identity references for Cast members. If no other book image genuinely contains the corrected entity, no book reference is attached.
- Removes the previous failure mode where the corrector reduced visual identity evidence to prose and then expected the image model to reconstruct the monster/machine/character from that prose.
- Developer-only correction workflow; ordinary story illustration generation is unchanged. No SQL migration and no new Vercel endpoint.

---

# Moonbeam Stories V251.59

- Replaces free-canvas developer illustration correction with a masked local-edit workflow.
- The developer paints only the region allowed to change; Moonbeam sends a same-size PNG mask to OpenAI `/v1/images/edits`.
- The current accepted page is converted to PNG and remains image #1/edit master; the mask applies to that image.
- Other book illustrations are reviewed separately for text-only visual continuity and are never attached to the edit call.
- Correction quality is raised to medium; ordinary story illustration generation remains low quality and unchanged.
- No new API endpoint and no SQL required.

---

# Moonbeam Stories V251.57

- Rebuilt developer illustration correction as a true edit-only path.
- Correction requests no longer send page prose, storyboard scene facts, event-selection instructions, composition-generation rules or the normal Moonbeam new-illustration prompt to the image editor.
- The existing page is the sole scene/composition master. Whole-book artwork is used only in the separate text continuity analysis and is not attached to the edit model.
- Cast photos remain identity references only.
- The image editor is instructed to make the smallest requested change and preserve crop, camera, staging, poses, positions, background, lighting, colours and rendering elsewhere.
- Normal story/cover illustration generation is unchanged. No SQL required. API endpoint count unchanged.

---

# Moonbeam Stories V251.56

- Replaces the V251.54/V251.55 multi-image correction architecture. Whole-book artwork is no longer attached to the image-edit model.
- Developer illustration correction now runs a separate vision continuity review over the other book images and converts that review into a text-only visual identity canon.
- The actual image edit receives only the current page as its edit master plus normal Cast photo references. This prevents other pages from contaminating composition, staging, poses or scene content.
- The page being corrected is excluded from the continuity analysis, so an already-drifted correction cannot define its own identity canon.
- When references disagree, the continuity review is instructed to prefer stable traits established in the earliest book references rather than averaging designs.
- No SQL changes. API endpoint count unchanged.

# Moonbeam Stories V251.56

- Fixes HTTP 413 failures in developer illustration correction introduced by whole-book continuity references.
- Keeps the current illustration at full quality as the surgical edit master.
- Downsamples the cover and other page illustrations to compact 448px JPEG continuity references before sending the correction request.
- The correction model can still review artwork across the whole book for faces, teeth, fur, clothing, props and world continuity without sending every page at publication resolution.
- Cast identity photographs remain separate identity references. Normal story generation is unchanged.
- No SQL required and no API endpoint added.

---

# Moonbeam Stories V251.56 — whole-book continuity for illustration corrections

- Developer **Correct illustration** now supplies the current page plus every available cover/page illustration from the same book to the image corrector, so it can compare recurring characters and objects across the complete illustrated story instead of seeing only the immediately preceding page.
- The current illustration remains the surgical edit master for composition and staging. Other book images are explicitly labelled continuity references and cannot be mistaken for extra Cast members.
- Cast photographs remain separate authoritative identity references.
- Correction prompting now tells the model to restore the established majority design when a corrected page has drifted in details such as face shape, teeth, horns, fur, clothing or recurring props.
- No change to normal story generation, manual text editing, Supabase schema, or API endpoint count.

---

# Moonbeam Stories V251.53

- Final reconciliation now uses a strict JSON schema that requires exactly four middle pages, so the model cannot return a seventh story spread while still staying inside the word/token budget.
- Final reconciliation now explicitly resolves harmless repeated secondary-character text/image identity mismatches in favour of the finished illustrations (for example, a consistently illustrated king should not remain a queen in the prose).
- No story-concept, storyboard, illustration, anti-repetition or credit logic changed in this build.

## V251.45 — robust final-story reconciliation

- Fixes a false final-reconciliation failure where OpenAI could return HTTP 200 with a completed story but Moonbeam discarded it because the final stage used a stricter one-off JSON parser than the rest of the story engine.
- Final reconciliation now reuses Moonbeam's tolerant JSON extraction, including fenced/wrapped JSON and harmless trailing-comma recovery, without making another OpenAI call.
- Developer diagnostics now identify the exact validation failure (parse failure, missing field, wrong page count or empty page), plus parsed keys/page count and bounded response head/tail.
- No story prompt, illustration prompt, retry policy, credit logic, API endpoint or database changes.


## V251.44 — Isla publishing identity + bounded image-safety recovery

- Completes **Isla Templeton** publishing support: **By Isla Templeton** cover byline, profile photo, fixed About the Author page, EPUB author metadata and Moonbeam link, matching Sam and Emily.
- Highlights Sam, Emily and Isla as **Published author** entries in the developer Cast list.
- For required story illustrations only, an OpenAI image-safety rejection now receives **one automatic child-safe reformulation retry**. There is no customer manual retry loop.
- If that single recovery attempt is also safety-rejected, normal users receive the friendly Moonbeam completion message. Their reserved story credit is refunded before the UI can say **You have not been charged for this attempt**.
- Developer failures retain the raw safety response and now show the exact storyboard scene prompt and continuity context Moonbeam was trying to depict, plus whether the automatic safety retry was used.
- No new API endpoint and no database migration.


## V251.43 — Isla Templeton EPUB author profile

- Adds **Isla Templeton** to the existing developer Kindle/EPUB publishing workflow alongside Sam Alderwick and Emily Alderwick.
- A single-hero Isla story now uses **By Isla Templeton** for the developer publishing byline.
- EPUB export uses Isla's existing Moonbeam child/profile photo for the final **About the Author** page and embeds her fixed reusable author biography plus the Moonbeam Stories link.
- EPUB metadata identifies the author as **Isla Templeton** and the series as **The Moonbeam Adventures of Isla Templeton**.
- No API endpoint, database or illustration-generation changes.

## V251.42
- Recalibrated story prose across ages 3–12: ages 3–4 now get substantially shorter, simpler read-aloud prose while preserving imaginative plots; ages 11–12 get more sophisticated language, inference, suspense, agency and consequences. Ages 5–10 remain close to the current successful middle range.
- Strengthened account-level anti-repetition so concept selection compares abstract story DNA — mechanism, journey/transformation, tension, escalation, climax and resolution — rather than accepting the same underlying story with different scenery or props.
- No illustration-engine, credit, database or API-endpoint changes.

## V251.41
- Added a live “You have been waiting…” elapsed-time counter beneath the average story creation time on the Preparing Story screen. It starts at generation, updates every second, and stops/resets when generation finishes or fails.
- No story-generation, illustration, credit, or database changes.

## V251.40
- Restores/protects the developer demo-child **Gender** and **Age (3–12)** selectors.
- The developer UI now self-heals those selectors if an older/stale HTML shell is paired with the current JavaScript.
- Bumps the main CSS/JS/i18n cache-busting version so browsers do not reuse an older developer-generator interface after deployment.
- Otherwise identical to V251.39; no story or illustration prompt changes.

## V251.39

- Consolidated the story-generation prompts without removing tonight's creative safeguards: anti-repetition, genuine child appeal, safe peril, situational comedy, coherent fantasy, anti-personification, and explicit protection against default maps/notes/keys/ribbons/rainbows remain.
- Raised the concept bar against thin procedural stories and repeated mechanisms: concepts must have room to develop materially across the book, and storyboards now preserve rather than re-specify that creative intent.
- Reduced duplicated creative instructions across base, concept and storyboard stages so each stage has a clearer job.
- Developer token diagnostics now remain visible on the cover only and hide when reading begins.

## V251.38
- Developer-only token report now remains visible after successful story generation, including concept/storyboard and final reconciliation usage.
- Increased child-facing excitement and situational comedy without reintroducing adult/double-entendre humour.

# Moonbeam Stories V251.37

## V251.37 — developer token diagnostics

Developer-only generation failures now report OpenAI token usage for concept generation, storyboard planning and final story reconciliation, including configured output ceilings and incomplete-response reasons where available. Normal-user error messages are unchanged.

## V251.36 — account anti-repetition + average build-time guidance

- Confirms and retains the existing account-level anti-repetition system: the concept builder receives compact creative memory from up to 10 recent saved stories in the signed-in account and avoids repeating their underlying premise, story shape, props, discoveries, complications, payoff or ending unless the parent explicitly asks for it.
- Adds an average story creation-time line beneath the Preparing your story hourglass.
- The average is calculated from successful historical generation runs already recorded in `api_usage_events`: the successful concept/storyboard request duration plus the elapsed time from that completion to the matching successful final-story event. Failed runs are excluded.
- The average endpoint reuses `/api/generate`; no new Serverless Function or Supabase schema is required.
- Keeps V251.35 story prompts, developer diagnostics and V251.34 simplified developer demo-child generation unchanged.

## V251.35 — remove dual-audience humour + restore developer diagnostics

- Removes the V251.33 dual-audience / second-layer humour instructions from both story planning and final writing.
- Keeps the V251.33 excitement and page-turn tension improvements.
- Restores detailed developer-account story-generation failures, including stage, HTTP status, browser network state and a bounded response preview when available.
- Retains the V251.34 simplified developer demo-child portrait generator.

## V251.34 — simplified developer demo-child portraits
- Built directly from V251.33.
- Developer-only Generate demo child now constrains only age and gender; all ethnicity, skin-tone, hair/eye-colour, build and facial-feature profiling has been removed.
- Portraits now ask for a natural, appealing, entirely fictional child photographed casually on a modern phone, with a realistic everyday background and gentle Portrait-mode blur rather than a studio look.
- Normal customer Cast/photo handling and story generation are unchanged.
- No Supabase schema change.

## V251.33 — stronger page-turn tension, comedy and parent-level wit
- Built directly from V251.32.
- Strengthens the concept builder so competitions and challenges cannot rely on winning or losing alone for tension; where appropriate they need a consequential surprise, reversal, escalating complication, comic disaster, safe near-miss or similarly compelling development.
- Strengthens storyboarding so comedy develops through consequences, reactions, reversals and misunderstandings, while adventure/mystery normally contains at least one genuine page-turn uncertainty.
- Adds a restrained dual-audience layer to the writing stage: occasional subtle humour for the adult reading aloud, while every line remains completely suitable and understandable for the child.
- Keeps the adult layer sparse (normally no more than two or three moments across six spreads), avoids crude/adult subject matter and lazy adult-signifier jokes, and scales subtlety with the child’s age.
- Preserves existing coherence, anti-whimsy/personification, anti-stock-map/notes/keys, account anti-repetition, age-safety, Cast and illustration systems. No illustration-prompt, UI, Supabase schema or API-function-count changes.

## V251.22
- Strengthens the storyboard and final writing stages without changing the concept builder.
- Requires the selected premise to be exploited and developed rather than merely demonstrated across interchangeable middle scenes.
- Adds a middle-story dependency test: if scenes can be swapped or removed without materially changing the story, the storyboard must be redesigned.
- Encourages organic escalation through curiosity, humour, discovery, suspense, surprise, scale, consequence or emotional development without imposing an obstacle/attempt/setback/solution formula.
- Prevents the story from ending just as the premise becomes interesting and asks the final third to exploit the central idea fully.
- Discourages manufactured storybook flourishes and clever-sounding but empty lines.

# Moonbeam Stories V251.16

V251.16 repairs the developer-only cover text editor. Title and author/dedication are now edited directly in the browser and saved exactly as typed, rather than calling the missing `developer-cover-text` API action. Saved-book edits persist to the existing saved story record and invalidate saved KDP description/keyword metadata. No database migration or new API function is required.

# Moonbeam Stories V251.14

V251.14 adds a positive creative target on top of V251.13's anti-whimsy cleanup. The story engine now treats plausibility as a constraint on imagination rather than a substitute for it: grounded stories should still contain genuinely compelling experiences, discoveries, problems, achievements, humour, surprise or other consequential events, with the child acting as a meaningful cause of what happens rather than merely following adult procedure. Technical detail is retained only when it improves narrative interest or consequence, and the engine applies a concise “It was the one where…” retelling test without imposing a fixed plot formula.

The visual-storyboard and illustration prompts are also strengthened. They now prioritise the event that advances the page rather than an easy portrait or incidental object, require physical/spatial coherence for characters and equipment, preserve recurring vehicles/environments/objects, and seek visual progression between pages through changing story events rather than arbitrary redesign. The JSON-repair route carries the same standards. No UI, credits, database schema or API-function-count changes.

---

# Moonbeam Stories V251.13

V251.13 tightens the story engine's creative direction. It removes prompt wording that could encourage arbitrary whimsy (including locale vocabulary examples such as “biscuit”, the early-years invitation to “absurdity”, and the “mundane realism” framing) and replaces the previous weak personification guidance with a concise reality/agency/prose discipline. Blank or realistic premises now favour grounded adventure, mystery, discovery, exploration, humour and coherent problem-solving; deliberate fantasy remains fully available when established by the premise. The writer is explicitly directed to create imagination through interesting events rather than faux-poetic personification, arbitrary impossible objects, stock cosy props or strained comparisons. The JSON-repair path carries the same creative standard. No UI, illustration, credit, database or API-function-count changes.

---

# Moonbeam Stories V251.07

## V251.07 — illustrated whole-book audit fix

- Fixes a concrete indexing bug in the developer continuity tools: story-page text was being paired with the wrong illustration. Page 1 story text was compared with the opening illustration, subsequent pages were shifted, and the closing spread was omitted.
- The whole-book audit now supplies all six finished reading spreads in their true order: opening → story pages → closing, with each text paired to its own illustration.
- The manual continuity investigation and canonical repair planner use the same corrected page/image mapping.
- The separate **Check text against illustrations** tool is fixed to use the same correct mapping.
- Adds explicit within-page action/timing-state auditing. The model must flag mixed moments such as Sam still walking towards the rocket while the flag is already shown repaired.
- Coherent prose is not rewritten merely to accommodate an erroneous illustration; the audit is told to identify the illustration as the conflicting source when appropriate.
- Repair page indexes now map directly to the real reading spreads, including opening and closing.
- No new API endpoint and no SQL migration.

---

## V251.06 — live cover overlay editing fix

- Fixes **Correct title** so it updates the actual separate HTML title overlay on the existing cover immediately.
- The underlying cover illustration is not regenerated or altered when only the title changes.
- After a successful title correction Moonbeam refreshes the visible cover text layer and returns to the cover, so the new title is visible at once.
- Keeps persistence through the existing `saved_stories.title` field for saved books.
- Fixes the same overlay path for developer **author/dedication** overrides: saved overrides are restored into the book object and are used by the visible cover subtitle layer.
- `buildBook` now preserves saved cover-text overrides instead of dropping them when reopening a saved story.
- All V251.05 database fixes, V251.04 legal wording and V251.03 continuity tools are retained.
- No image generation is used for title/byline-only changes.
- No new Vercel endpoint and no SQL migration.

---

## V251.05 — saved cover-text persistence fix

- Fixes the developer **Correct title** failure on already-saved books.
- Removes the invalid attempt to write a non-existent `story` column in `saved_stories`.
- Title corrections now update the existing `saved_stories.title` column.
- Cover author/dedication overrides are stored inside the existing `saved_assets` JSON metadata, so no database column or SQL migration is required.
- Saved-story loading restores those cover-text overrides from `saved_assets`.
- KDP description/keyword caches are still invalidated when cover metadata changes.
- All V251.04 legal wording and V251.03 developer continuity tools are retained.
- No new Vercel endpoint and no SQL migration.

---

## V251.04 — AI continuity wording in Terms and Refund Policy

- Strengthens the Terms' AI-generated-content wording to expressly cover occasional story/illustration and cross-page continuity inconsistencies.
- Gives concrete categories such as character appearance, clothing, surroundings, and object appearance, size, position and continuity.
- Clarifies that minor AI-generated errors, variations and continuity inconsistencies do not necessarily mean the requested story was not supplied.
- Strengthens the Refund Policy to state that a successfully generated story is not normally refundable merely for a disliked creative choice or a minor visual, narrative or continuity inconsistency.
- Explicitly preserves remedies that apply under consumer law for faulty, misdescribed or otherwise non-compliant digital content/services.
- Avoids an absolute exclusion of responsibility.
- Equivalent wording is included in all seven supported legal-document languages.
- Legal-document revision date updated to 23 September 2026.
- No application logic, credits, story generation, developer editing, API endpoints or database schema changed.

---

## V251.03 — complete developer continuity repair + full re-illustration

- Keeps **Correct this page** for small individual page fixes.
- Keeps the automatic **Check text against illustrations** review.
- Adds **Add continuity problem** inside the whole-book audit so the developer can report problems the automatic scan misses.
- Manually reported problems are investigated across the entire finished story and all illustrations.
- The developer chooses canon; repair plans now include complete minimally corrected replacement text where needed.
- Staged workflow: **Apply proposed text repairs → Approve corrected text → Re-illustrate book**.
- Re-illustration stays locked until corrected text is explicitly approved.
- Full re-illustration starts clean and rebuilds **cover → page 1 → page 2 → …**, without using the rejected old artwork as continuity references.
- Human-chosen canonical facts are carried through the new illustration sequence, and each new image seeds the next.
- Saved-book artwork is replaced in place and publishing metadata caches are invalidated.
- Entire workflow is developer-account-only; ordinary customer generation is unchanged.
- No new Vercel endpoint and no SQL migration.

---

## V251.02 — developer whole-book continuity audit

- Adds **Whole-book continuity audit** beside the existing developer correction/review tools.
- Audits the complete story and all finished page illustrations together, across page boundaries.
- Detects persistent-state conflicts such as an object being planted and later appearing in a pocket, changing identity/size, inconsistent equipment, location, damage, clothing or time-of-day state.
- It does **not** invent an explanation or decide which contradictory version is canon.
- For each conflict it presents the evidence and 2–4 supported canonical choices, plus **Enter different canon…**.
- Once the developer chooses canon, Moonbeam creates a page-by-page repair plan identifying text changes and illustrations that require regeneration.
- The chosen canon is explicitly authoritative in that repair plan.
- No repair is silently applied at the audit stage.
- Developer-only; ordinary customer generation is unchanged.
- Reuses the existing `generate` endpoint: no new Vercel function and no SQL migration.

---

## V251.01 — developer illustration/text continuity review

- Adds **Check text against illustrations** to the developer editing tools on finished books.
- The review sends each finished page illustration with its corresponding text plus the complete finished story to the existing generation endpoint.
- It reports only genuine correctable text/image contradictions; harmless omissions and composition differences are ignored.
- Established story facts outrank an illustration. The checker will not rewrite the plot merely to accommodate an erroneous image.
- For safe mismatches, it proposes a minimal replacement for that page's text.
- Every proposed change is shown to the developer with **Accept / Reject**. Nothing changes automatically.
- Accepted corrections use the existing saved-book text persistence path.
- This is developer-only and is not an extra generation stage for ordinary customer books.
- No new Vercel endpoint and no SQL migration.

---

## V251.00 — full developer cover correction

- **Correct cover** now exposes three independent correction targets: **Correct title**, **Correct author/dedication**, and **Correct cover artwork**.
- The developer still describes the required change in free text; that instruction is authoritative.
- Title correction changes the actual stored book title rather than painting text into the artwork.
- Author/dedication correction changes the stored cover text layer, not the image.
- Saved-book cover-text corrections are persisted and invalidate previously prepared KDP description/keywords so downstream publishing can use the corrected metadata.
- V250.99 surgical illustration correction remains intact.
- Reuses the existing `generate` and `illustrate` endpoints: no new Vercel function and no SQL migration.

---

# Moonbeam Stories V250.99

## V250.99 — surgical illustration correction

- **Correct illustration** now sends the actual existing illustration as the first and primary edit reference.
- The image service is instructed to preserve composition, framing, characters, likenesses, poses, clothing, expressions, lighting, colours, background, scale and style.
- Only the developer-described error should change, plus the minimum dependent detail needed for physical coherence.
- Normal Moonbeam instructions that demand a new composition are explicitly disabled during correction requests.
- Cast references remain secondary identity anchors; preceding artwork remains secondary continuity context.
- Saved-book correction and V250.98 cover correction remain intact.
- No new API endpoint and no SQL migration.

---

# Moonbeam Stories V250.98

## V250.98 — developer-only cover correction

- Adds **Correct cover** to the finished cover for the developer account only.
- The developer describes the exact inconsistency; that instruction is authoritative.
- Regenerates only the underlying cover artwork from the complete finished story and Cast references.
- Existing Moonbeam title/author/dedication typography remains separate and unchanged.
- Saved books have their saved cover artwork replaced in place.
- Retains V250.97 page-level Correct text / Correct illustration.
- No new API endpoint and no SQL migration.

---

# Moonbeam Stories V250.97

## V250.97 — developer-only continuity correction

- Adds **Correct this page** to every finished story spread on the developer account only.
- The developer types the exact inconsistency and chooses **Correct text** or **Correct illustration**.
- Text correction rewrites only the current page, using the complete finished story for context and the developer instruction as authoritative.
- Illustration correction regenerates only the current page image, using the current story facts, developer instruction, Cast reference photo where available, and preceding artwork for continuity.
- Saved-book corrections replace the saved text/artwork in place. A text or image correction invalidates any previously generated KDP description so the next Kindle preparation is based on the corrected story.
- Developer correction reuses the existing `generate` and `illustrate` endpoints; no additional Vercel function is added.
- Ordinary customer accounts and shared-story readers do not see or receive the correction controls.
- No SQL migration required.

---

## V250.96 — coverless KDP EPUB + author photo fix

- Kindle EPUB export no longer includes the Moonbeam book cover. The EPUB now begins with the first story text page; the KDP cover is supplied separately outside the EPUB.
- Fixes the **About the Author** portrait so Sam/Emily's existing Moonbeam Cast/profile photo is decoded from its saved image bytes before being drawn into the circular author portrait.
- The author biography, Moonbeam website link, story text/illustration sequence, saved KDP description and all non-Kindle Moonbeam behaviour are unchanged.
- No new API endpoint or SQL migration is added.

---

## V250.95 — Vercel Hobby function-count fix

- Moves the four shared server helper modules (`_credits.js`, `_shares.js`, `_stripe.js`, `_usage.js`) out of `/api`. Vercel treats every JavaScript file under `/api` as a Serverless Function, including underscore-prefixed helper files.
- `/api` now contains exactly 12 JavaScript entry files, matching the Hobby-plan limit.
- Existing API entry-point URLs are unchanged.
- Updates the `resend-inbound` helper import to the helpers' non-API location.
- KDP description generation remains folded into the existing `generate.js` endpoint; no KDP endpoint is added.


## V250.94 — keep KDP description inside the 12-function Vercel limit

- Removes the separate `api/kdp-description.js` serverless route introduced in V250.93.
- KDP description generation now uses a developer-only `action: "kdp-description"` branch of the existing `api/generate.js` function.
- The KDP branch runs before story-credit reservation, so exporting/publishing copy does not consume a Moonbeam story credit.
- The client now requests KDP copy through `/api/generate`; saved-book KDP description behaviour and EPUB contents are otherwise unchanged.
- Deployment returns to 12 public Vercel API functions; the four underscore-prefixed files in `api/` are shared helper modules, not public routes.


## V250.93 — saved KDP description on Kindle export

- The first developer-only **Download Kindle eBook** action for a saved Sam or Emily book now generates a separate 100–150 word Amazon KDP description from the completed story.
- The description is saved inside the existing `saved_assets` metadata for that saved story; no database migration is required.
- The description is never inserted into the EPUB or normal Moonbeam reader. It is shown only in the developer publishing controls, as selectable plain text with **Copy KDP Description**.
- Reopening the saved story restores the same description; later EPUB downloads reuse it rather than generating a new version.
- Description generation is developer-account-only and does not consume a Moonbeam story credit.


## V250.92 — developer Kindle eBook export

- Adds a developer-only **Download Kindle eBook** button to finished, saved single-child Sam or Emily books.
- Exports a KDP-ready fixed-layout EPUB directly in the browser; no story or illustration is regenerated and no additional AI usage is incurred.
- Reuses the proven Instagram browser-flattened cover capture so the artwork, title and **By Sam/Emily Alderwick** typography are baked into one cover image exactly as rendered.
- Story text and illustrations alternate on separate fixed-layout pages. Illustration pages use the maximum available page area without cropping or distorting the artwork.
- Text pages are browser-rasterised for deterministic Kindle typography and to avoid fixed-layout font substitution.
- Adds a final **About the Author** page using the child's existing Moonbeam profile photo and a fixed reusable Sam/Emily biography. The displayed `moonbeamstories.co.uk` address has a clickable hotspot on Kindle platforms that support external links.
- Includes Amazon fixed-layout metadata: pre-paginated layout, original 1080×1350 design resolution, portrait orientation, children's-book type, navigation document, cover-image declaration and series metadata.
- EPUB packaging is generated locally in the browser. No new API endpoint, dependency or SQL migration is required.

---

## V250.91 — cover-first whole-book illustration continuity

- The dedicated front cover now reads the complete finished story (opening, all story pages, scene directions and closing) before choosing its scene.
- The finished story is explicitly authoritative over generic title/genre/premise imagery, including location, time of day, weather, clothing, vehicles, machines, props, scale and other concrete visual facts.
- The cover is now generated before reading-page prefetch begins and acts as **image zero** for visual continuity.
- Scene 1 always receives the finished cover as its continuity artwork; subsequent scenes continue the existing previous-artwork continuity chain.
- The old mobile path that could generate Scene 1 independently before the dedicated cover has been removed, preventing the continuity chain from starting in two different places.
- Story-required changes still override previous artwork, so clothing, locations, objects and environments may change when the text actually changes them.
- No SQL required. API count unchanged.

---

## V250.90 — reduce stock atmospheric personification

- Tightens the story-generation creative brief to discourage habitual personification of settings and inanimate surroundings.
- Places, planets, moons, forests, jungles, seas, skies and landscapes should not routinely listen, watch, whisper, hum, sing, breathe or wait as sentient observers.
- Personification remains available when it has a genuine story purpose, such as a setting that is actually magical or alive.
- Prefers concrete, specific description over stock atmospheric personification.
- All other V250.89 behaviour is unchanged.

No SQL required. API count unchanged.

---

# Moonbeam Stories V250.89

## V250.89 — developer-only Sam/Emily cover author credits

This build starts from **V250.88** and makes one deliberately narrow cover-text change.

- On the existing authenticated Moonbeam developer account only, a story with exactly one hero named **Sam** shows **By Sam Alderwick** on the cover instead of the normal bedtime dedication.
- On that same developer account only, a story with exactly one hero named **Emily** shows **By Emily Alderwick** instead of the normal bedtime dedication.
- Stories about every other child on the developer account keep the existing bedtime dedication unchanged.
- Stories with multiple heroes keep the existing bedtime dedication unchanged, even if Sam or Emily is one of them.
- All ordinary Moonbeam accounts keep the existing bedtime dedication unchanged.
- The restriction reuses Moonbeam's existing server-verified developer-access check (`MOONBEAM_DEVELOPER_EMAIL`); no developer email address is exposed or duplicated in client code.

No SQL is required. Story generation, illustration generation, saved stories, payments, sharing and Instagram publishing are otherwise unchanged.

---

# Moonbeam Stories V250.88

## V250.88 — retire automatic Reel posting; keep demo-child generator

The unattended Instagram automation experiment has been removed.

- Removes the automatic posting schedule UI and all schedule controls from the Create Story page.
- Removes the Supabase cron/cloud-runner/Sandbox routes and the Vercel Sandbox dependency.
- The old **Generate automatic Instagram reel** developer button is replaced by **Generate demo child**.
- That button now does only two things: invents one completely fictional child with a photorealistic portrait, and saves that child/photo to **Your Cast**.
- It does **not** invent a story premise, generate a story, create illustrations, build a Reel or publish anything to Instagram.
- Manual story creation is unchanged. The existing end-of-book **Post reel to Instagram** and **Post carousel to Instagram** flows are retained unchanged.
- Adds `SUPABASE_V250_88_RETIRE_INSTAGRAM_AUTOMATION.sql`, which must be run once to unschedule the old once-per-minute cron wake-up and retire its schedule RPCs. The old schedule table is retained only as inert historical data.
- Restores `SUPABASE_V250_CAST_GENDER.sql` to the complete package after it was accidentally omitted from the later V250.85/V250.86 packaging.

No customer story-generation, illustration, reader, Cast editing, payments or normal Instagram Reel/carousel behaviour is changed.

---

# Moonbeam Stories V250.87

## V250.87 — Fix automatic Reel Sandbox Chrome preflight scope

V250.86 reached the cloud-browser preparation stage but failed before the Sandbox Chrome preflight could run with `executable is not defined`. The diagnostic command embedded a Sandbox-local variable inside the outer Vercel Function template literal, so Node tried to interpolate that variable in the wrong scope.

- Keeps `executable` entirely inside the Sandbox preflight process.
- Runs `ldd` directly with `execFileSync('ldd', [executable])` and filters its output for unresolved libraries, avoiding nested template interpolation and shell quoting.
- Preserves the existing Chrome launch/close preflight, persistent Sandbox, 10-minute runner, schedule controls and automatic Reel pipeline.
- Customer-facing story generation, illustration generation and Instagram publishing behaviour are otherwise unchanged.

No SQL is required. API count remains unchanged.

---


## V250.86 — Fix Vercel Sandbox Chrome dependency installation

V250.85 reached the scheduled cloud runner but the first-time dependency step used Puppeteer's `--install-deps` helper. That helper is Debian/Ubuntu-specific and the Sandbox environment did not complete it successfully, so the browser never reached its launch preflight.

- Replaces Puppeteer's OS dependency helper with explicit Vercel-Sandbox-aware installation.
- Detects the Sandbox package manager at runtime and supports both current Ubuntu/`apt` images and Amazon-Linux/`dnf` images.
- Installs Chrome's required NSS/NSPR, GTK, X11, audio, font and graphics libraries with root privileges.
- Uses a fresh persistent Sandbox name (`moonbeam-instagram-auto-v3`) so the failed V250.85 environment is not reused.
- Keeps the real Chrome launch preflight and now also reports unresolved `ldd` libraries if launch still fails.
- The automatic story/Reel pipeline, schedule controls, 10-minute Sandbox limit and customer-facing generation are otherwise unchanged.

No SQL is required. API count remains unchanged.

---

## V250.85 — Fix cloud Chrome shared-library failure

The first unattended scheduled Reel reached the Vercel Sandbox correctly but Chrome could not start because the Sandbox did not yet contain Puppeteer's required Linux shared libraries (`libnspr4` was the first missing library reported).

- New persistent Sandbox name forces a clean browser environment rather than reusing the incomplete V250.84 Sandbox.
- Puppeteer is installed into a fixed persistent cache under `/vercel/sandbox/.cache/puppeteer`.
- During first-time Sandbox setup, Puppeteer's own Debian/Ubuntu dependency installer now installs the Chrome system libraries with elevated Sandbox privileges.
- Every scheduled run performs a short real Chrome launch/close preflight before handing off the 10-minute Reel job, so a broken browser environment fails immediately with a useful error instead of spending minutes on story generation first.
- The actual automatic story/Reel pipeline, schedule controls, Reel formatting and 10-minute Sandbox limit are unchanged.

No SQL is required for this fix. API count remains unchanged.

---

## V250.84 — Hobby-safe 10-minute unattended cloud runner

V250.83 could not deploy on the current Vercel Hobby plan because a Vercel Function cannot set `maxDuration` above **300 seconds**. V250.84 fixes the architecture rather than forcing the whole 4–7 minute Reel pipeline to fit inside a five-minute Function.

- `api/resend-inbound.js` is back to the valid **300-second** Vercel Function ceiling.
- When a scheduled post becomes due, the short Vercel Function now **launches a detached Vercel Sandbox runner and returns immediately**.
- The Sandbox runs the existing browser-driven Moonbeam generation flow independently for up to **10 minutes**, so Safari and the Mac can remain switched off.
- Vercel documents that Hobby sandboxes can run for up to **45 minutes**, so the 10-minute Moonbeam limit is comfortably inside the plan limit.
- The runner uses a one-time signed completion token; when it finishes it reports success/failure back to Moonbeam, updates the schedule, and the sandbox is stopped.
- A persistent named sandbox retains its Puppeteer installation between runs, so only the first run needs to prepare the browser environment.
- No new callable API endpoint is added; the callback is another action on the existing `/api/resend-inbound` route.

The existing schedule UI and automatic story/portrait/Reel behaviour are unchanged.

---

## V250.83 — 10-minute automatic Reel ceiling

The unattended Instagram Reel job now has substantially more headroom:
- Vercel function maximum duration increased from **300 seconds to 600 seconds**;
- the cloud Chromium protocol timeout increased from **290 seconds to 590 seconds**;
- the Supabase `pg_net` request timeout increased from **300,000 ms to 600,000 ms**.

The live Supabase scheduling function has also been updated to use the 10-minute request timeout. No further SQL needs to be run manually.

---

## V250.82 — Scheduled cloud automatic Instagram Reels

This build extends the developer-only automatic Reel trial so it can run with Richard's browser and computer switched off.

### Developer scheduling control
- The Create Story page now shows an **Automatic posting schedule** directly underneath **Generate automatic Instagram reel**.
- Richard can choose **Once**, **Every day**, **Every 2 days**, **Every 3 days**, or **Every week**, plus a first-post date and local clock time.
- The control shows whether automatic posting is on, the next scheduled run, and the previous run result.
- **Stop automatic posts** disables the schedule immediately.

### Cloud execution
- The schedule is persisted in Supabase rather than in Safari/local storage.
- Supabase `pg_cron` wakes Moonbeam once per minute and only claims a job when its `next_run_at` is due.
- A cloud-side headless Chromium session signs into the developer account with a one-time Supabase admin magic link and runs the same proven browser-driven `generateAutomaticInstagramReel()` flow.
- This deliberately preserves browser-flattened Reel typography instead of going back to the broken server-side text rendering path.
- The database lock prevents another scheduled run being claimed while the current one is still running.
- On success the next occurrence is calculated in the saved timezone; one-off schedules switch themselves off. On failure the run is recorded as failed and recurring schedules move to their next occurrence.

### Story variety
- The automatic premise selector is broadened substantially: wildcard/unconstrained, fantasy, space/SF, time travel, prehistory, underwater, surreal, absurd comedy, historical, giant/miniature, machines, extreme environments, inside-art/book/game worlds, mystery, transformation and occasional ordinary-place-becomes-impossible stories.
- This removes the V250.81 bias toward repeated modern-setting magical anomalies.

### Infrastructure
- Uses the existing `resend-inbound` endpoint, so the deployment remains at **12 callable API endpoints**.
- Adds `puppeteer-core` and serverless Chromium as production dependencies for unattended browser rendering.
- Adds `SUPABASE_V250_82_INSTAGRAM_AUTO_SCHEDULE.sql`. The migration has already been applied to the connected Moonbeam Supabase project in this build session.

---

## V250.81 — Automatic demo-child realism weighting

This build tightens the **developer-only automatic Instagram Reel** child invention stage before Richard trials it.

Changes:
- sampled demo-child ethnicity now follows broad current-UK proportions:
  - White **81.7%**
  - Asian / Asian British **9.3%**
  - Black / Black British / Caribbean / African **4.0%**
  - Mixed / Multiple **2.9%**
  - Other ethnic group **2.1%**
- within each broad bucket, Moonbeam now samples from more specific sub-profiles so eye colour, hair colour and hair texture stay **plausible** rather than producing absurd combinations;
- eye colour and hair colour are now conditionally varied rather than defaulting to repetitive blonde/blue-eyed outputs;
- portrait backgrounds are now explicitly varied across realistic real-world settings and must **not** default to a plain white or studio background;
- the child is instructed to look **ordinary and believable**, allowing slimmer, average, stockier or heavier builds and less idealised facial variation rather than every portrait being polished or model-like;
- the invented story premise is now constrained to **one child only**, with **no adults, siblings, pets or sidekick animals** in the premise.

No SQL required. API count remains unchanged at **12 callable endpoints**.

---

## V250.80 — One-click automatic Instagram Reel trial

A new **developer-only** button appears at the bottom of the Create Story page: **Generate automatic Instagram reel**.

One click now trials the whole marketing pipeline while Richard is at the screen:
1. invent a completely fictional demo child aged 3–12, with first name and Male/Female marker;
2. generate a photorealistic synthetic portrait of that fictional child;
3. add the child and portrait to Richard's Moonbeam Cast (internally tagged with the existing hidden `relationship` field as `__moonbeam_demo__`; no schema change);
4. invent an age-appropriate story premise and generate the story through the existing Moonbeam story engine;
5. generate the existing stable dedicated cover and all story illustrations;
6. save and verify the complete book;
7. render the current Reel format in the browser, preserving the proven browser-flattened typography;
8. run the existing Reel preparation checks;
9. publish automatically to **@moonbeamstoriesuk**;
10. add the complete book to the existing `/instagram` gallery.

A blocking developer progress card reports each stage and shows the fictional child portrait. On any failure the pipeline stops and reports the error rather than continuing to post. A prepared temporary Reel is discarded if publication fails.

The developer trial uses a secure developer-only generation header so these marketing demo stories do **not** consume Richard's customer story credits, while still creating the normal bounded illustration generation run. Ordinary customer generation is unchanged.

No SQL is required and the deployment remains at the existing **12 callable API endpoints**. This is manual/on-demand only: no scheduler or autonomous daily trigger has been added yet.

---


## V250.79 — Longer Reel CTA

- Extended the final Reel CTA from **2.8 seconds to 4.0 seconds** so viewers have more time to read and digest it.
- The photo opener remains 4.0 seconds.
- Book-page timings and all transitions are unchanged.
- The CTA wording and larger typography from V250.78 are retained.

No SQL required. API count unchanged.

---


## V250.77 — Special photo-to-cover reveal

This build starts from **V250.76** and adds a dedicated reveal transition only between the **real-photo opener** and the **normal-length book cover**.

Reel order is now:
- ultra-brief cover flash
- 4.0s real-photo opener
- **0.65s special reveal transition into the cover**
- normal cover
- story pages
- CTA

All later book-page transitions remain as before. No SQL required. API count unchanged.

---


## V250.76 — Reel order changed

This build starts from **V250.75** and changes the developer Reel sequence to:
- **ultra-brief cover flash**
- **real-photo opener**
- **normal-length book cover**
- **story pages**
- **CTA**

Timing details:
- cover flash remains **0.10s**
- real-photo opener remains **4.0s**
- the full visible book cover is now restored for **2.2s** before page 1

No SQL required. No API count change.

---


## V250.75 — Longer photo opener

This build starts from **V250.74** and makes one Reel timing change:
- the real-photo **Meet [name]** opening scene now stays on screen for **4.0 seconds** instead of 2.8 seconds, giving viewers time to read and understand the three-line setup.
- the ultra-brief book-cover flash frame remains unchanged.

No story generation, illustration generation, Cast logic, Reel text layout, Instagram publishing, database schema, or API endpoints are changed.

---


## V250.74 — Cover-flash Reel thumbnail

- Reel videos now start with an ultra-brief book-cover flash frame purely to influence the Instagram grid thumbnail.
- The visible viewing experience then moves straight into the real-photo “Meet [name]” opener, so the wanted-poster frame remains the effective first scene for viewers.
- The flash is intentionally tiny (0.10s) so it should barely register during playback while still giving Instagram a better chance of using the cover on the profile grid.


This build starts from **V250.72** and makes one visual-only change to the developer Instagram Reel:
- the cream/white fill of each story text panel now uses the same rounded path as its gold border, so the corners match exactly.

No story generation, illustration generation, Reel sequencing, Cast logic, Instagram publishing, database schema, or API endpoints are changed.

---

## V250.72 — Clean Reel book text panels

This build starts from **V250.71** and simplifies the book-page portion of the silent Reel.

### Reel text-panel change
- Removed the old highlighted/narrated snippet from the top of each Reel text panel.
- Removed the extra divider/highlight treatment so the lower half of each Reel page now looks like a straightforward book text window beneath the illustration.
- The full page text uses the available panel space and automatically scales down only when necessary to fit.
- Text is still flattened in the browser before the Reel reaches Vercel, preserving the proven typography fix.
- The real-photo intro, silent format, subtle motion, cover, CTA, one/two-child handling and Male/Female wording are unchanged.
- No SQL is required and **12 callable API endpoints** remain.

---

## V250.71 — Browser-flattened Reel opening text

This build fixes the broken/gibberish text in the new photo-led Reel opening. V250.70 accidentally reintroduced server-side SVG text for that one new opening frame, which is the same rendering path that caused the earlier Reel text corruption.

### Fix
- The entire real-photo opening frame — photos, **Meet [name]** heading, all three promo lines and Moonbeam branding — is now rendered and flattened to a JPEG **in the browser** before it is sent to Vercel.
- The Reel server now treats that opener as a finished image and does not typeset any of its text.
- The already-proven browser-rendered book text panels and CTA remain unchanged.
- Silent Reel timing, subtle motion, one/two-child handling, Cast/gender logic and preview-before-publish remain unchanged.
- No SQL is required.
- **12 callable API endpoints** remain.

---

## V250.70 — Silent photo-led Instagram Reels

This build starts from **V250.69** and changes the developer-only Reel format so it feels more like a short social promo than a narrated book excerpt.

### Reel format changes
- Reels are now **silent**. Moonbeam no longer generates teaser narration audio for Instagram Reels.
- Every Reel now opens with the **real uploaded photo** of the hero child (or two hero children when there are two protagonists).
- The opener uses social-style copy such as **“Meet Sam”**, followed by short lines about loving stories and being in them.
- After the real-photo opener, the Reel moves into the Moonbeam cover, then the illustrated story pages, and finishes with the existing CTA panel.
- Subtle motion and fade transitions remain, but the first segment still avoids the old black fade-in problem.

### Hero-photo handling
- Reel preparation now collects the current hero-child photo(s) directly from the story cast.
- When a story is saved, Moonbeam now also stores lightweight hero-cast metadata inside `saved_assets`, so reopened saved stories can still prepare a Reel more reliably.
- Reel posting continues to ignore supporting adults and pets for the opener.

### Existing behaviour retained
- The Reel flow is still developer-only and still uses preview-before-publish.
- Carousel posting is unchanged.
- No new SQL is required.
- **12 callable API endpoints** remain. No API endpoint has been added.

---

## V250.64 — Browser-rendered Reel text

This build starts from **V250.63** and fixes the Reel preview text corruption shown in Safari. The Reel no longer asks the server/Sharp SVG renderer to typeset story text, snippets, titles or the CTA.

### Reel text-rendering fix
- Reel text is now rasterised **in the browser**, using the same browser/canvas approach that fixed the Instagram carousel text slides in V250.52.
- The finished cover is captured in the browser and reused as the Reel cover frame, so its title typography is already flattened before it reaches Vercel.
- Each of the four Reel story text panels is captured as a finished JPEG in the browser, including the highlighted narrated snippet and the full page text.
- The final Reel CTA panel is also captured in the browser.
- Vercel/Sharp now only composites those already-finished image assets with the stored illustrations and renders the MP4; it no longer typesets Reel text server-side.
- The browser-captured assets are tightly compressed before upload so the Reel preparation request stays comfortably below Vercel request-size limits.
- If a Reel is the first Instagram post for a book, the exact browser-flattened cover is also used for the Moonbeam `/instagram` gallery entry.

### Existing behaviour retained
- Separate developer-only **Post carousel to Instagram** and **Post reel to Instagram** buttons remain.
- Reels are generated only after pressing the Reel button.
- Preview/approve-before-posting remains unchanged.
- Reels and carousels use the same agreed caption and five hashtags.
- Successful Reel posts still add the complete book to the Moonbeam Instagram gallery without duplicating an existing entry.
- The dedicated private `instagram-reels` video bucket introduced in V250.63 remains in use.
- **No new SQL is required for V250.64.**
- **12 callable API endpoints** remain. No API endpoint has been added.
- Story and illustration generation remain untouched. `api/generate.js` and `api/illustrate.js` are unchanged from V250.59.

---

# Moonbeam Stories V250.63

## V250.63 — Dedicated Instagram Reel video storage

This build starts from **V250.62** and fixes the Reel failure shown after the finished MP4 was rendered.

### Reel storage fix
- Rendered Reel MP4 files are no longer uploaded into the `saved-story-art` bucket.
- They now use a dedicated private Supabase Storage bucket named `instagram-reels`.
- The existing `saved-story-art` bucket remains image-only and is not loosened or repurposed.
- The public Moonbeam Reel URL still streams the video through the existing `/api/share` endpoint, including byte-range support required by browsers/Instagram.
- Temporary Reel videos are deleted from the new bucket after a successful post or when a preview is discarded.

### Required one-time Supabase migration
Run `SUPABASE_V250_63_INSTAGRAM_REELS_BUCKET.sql` once in the Supabase SQL editor before testing Reel posting. It creates/updates the private `instagram-reels` bucket with:
- MIME type: `video/mp4`
- maximum file size: 100 MB
- public access: off

The server-side Moonbeam functions access the bucket with the existing service credentials, so no additional public storage policy is required.

### Existing Instagram behaviour retained
- Separate developer-only **Post carousel to Instagram** and **Post reel to Instagram** buttons remain.
- Reel creation happens only on demand after pressing the Reel button.
- Successful Reel posts still ensure the complete book is present in the Moonbeam `/instagram` gallery without duplicating an existing gallery entry.
- Reels and carousels keep the same agreed caption and five hashtags:

[BOOK TITLE] ✨

A personalised Moonbeam story starring [CHILD NAME].

Swipe through to start the adventure, then read the full story via the link in our bio.

Create personalised, illustrated stories starring your own child at moonbeamstories.co.uk

#MoonbeamStories #PersonalisedStories #ChildrensBooks #BedtimeStories #Parenting

### API / illustration safety
- **12 callable API endpoints** remain. No API endpoint has been added.
- `api/generate.js` and `api/illustrate.js` are unchanged from V250.59.
- The restored illustration-generation behaviour and Optional Male/Female Cast field remain intact.

## V250.69
- Fixed Reel preparation so **Post reel to Instagram** no longer navigates back to the book cover.
- The finished cover is captured invisibly using the existing off-screen clone while the end page remains visible with **Preparing reel…** progress.
- Carousel behaviour is unchanged.


V250.69
- Reel captions now use reel-specific wording: “Watch the adventure begin...” rather than the carousel “Swipe through...” line.
- Reel rendering no longer fades in from black on the first segment, so the published Reel starts directly on the cover frame instead of a black thumbnail.


V250.69
- Carousel publishing now stays on the finished-book/end page; it no longer navigates back to the cover.
- Clicking **Post carousel to Instagram** is now the final approval: Moonbeam captures the cover/text assets off-screen and publishes directly without a second preview/permission step.
- Reel publishing is unchanged and still keeps its preview/approval workflow.


V250.69
- Reel publishing now uses progressive backoff while waiting for Instagram processing: 3s, 5s, 8s, 10s, then 12s between checks.
- This reduces Meta Graph API request pressure and the chance of hitting “Application request limit reached” without changing the final publish step.
- Reel preparation timeout is extended slightly to 150 seconds to accommodate the gentler polling cadence.


V250.69
- Reel publishing now waits five seconds before its first Instagram processing-status check.
- Subsequent status checks back off much more aggressively (8s, 12s, 16s, 20s, then 25s) to reduce Graph API request volume.
- Meta/Instagram application rate-limit responses are detected explicitly and shown as a clear temporary rate-limit message instead of the raw API error.
- No automatic retry is made when Meta is rate-limiting the app, so Moonbeam does not add more requests during the throttle window.


## V251.08 — human-directed continuity checks
- Removed the automatic whole-book continuity audit from the developer UI.
- Replaced it with a manual Continuity problems workflow.
- Added separate **Add text continuity problem** and **Add illustration continuity problem** controls.
- Text reports send story text only and direct the model to inspect textual continuity.
- Illustration reports send the finished illustrations and direct the model to inspect visual continuity, using prose only as factual/timing context.
- Human reports are investigated narrowly; Moonbeam is told not to launch an unrelated automatic audit.
- Existing canon selection, repair planning, text approval and re-illustration workflow is retained.
- No new API endpoint and no database/schema change.


## V251.09
Developer manual editing now accepts general text and illustration corrections/improvements, not only continuity reports. Medium-specific investigation remains human-directed. Illustration repair instructions explicitly preserve the existing illustration as the visual master and describe only the requested delta for surgical edits.

## V251.10
- Page illustration corrections are now non-destructive candidates: generate, preview, Accept / Try again / Keep original.
- Saved artwork is not overwritten until Accept.
- Accepted page/cover artwork refreshes the persistent saved-art cache as well as the object-URL cache, fixing stale original illustrations reappearing after replacement.
- AI page-text corrections are previewed before acceptance.
- Added direct manual page-text editing; Save text stores exactly what the developer typed without an AI rewrite.

## V251.11
- Illustration replacement previews keep the correction instruction editable.
- Before pressing Try again, the developer can refine or completely replace the instruction.
- Try again always uses the current instruction-box contents while preserving the untouched original illustration until Accept.

## V251.12
- Removed the whole-book continuity audit, text-vs-illustration book check, canonical conflict/repair workflow and whole-book reillustration controls.
- Developer editing is now deliberately page-local: one Edit this page control.
- Text editing retains AI suggestions, now with Accept / Suggest another / Keep original; the instruction can be refined or replaced before requesting another suggestion.
- Manual text override remains and saves exactly what is typed.
- Illustration editing remains non-destructive: describe the change, preview a draft, Accept / refine instruction and Try again / Keep original.
- No accepted content is replaced until the developer explicitly accepts it (manual text Save remains explicit).


## V251.16
- Fixed accepted developer illustration replacements reverting visually to the original image.
- Saved-book rendering now honours the exact accepted canonical in-memory illustration instead of immediately reloading the saved asset path.
- The accepted replacement is still persisted to Supabase storage and the local saved-art cache before the editor closes.


## V251.17
- Storyboard-first generation experiment: Moonbeam now plans the complete six-scene story arc without finished prose.
- All six page illustrations are generated from the complete plan before the final story is written.
- Every illustration sees the whole arc, including later scenes and the ending, while sequential generation preserves visual continuity.
- The final writer receives the original idea, complete plan and reduced copies of all six finished illustrations, then writes the six balanced reading spreads around that visual reality.
- Finished storyboard artwork is reused directly in the reader; it is not regenerated after the prose is written.
- No Supabase schema change required.


## V251.18
Removed residual problem-solution/beat forcing from the storyboard planner. Storyboard scenes now contain only event, visual moment and continuity; explicit WHY_IT_FOLLOWS and WHAT_CHANGES fields are gone. Creative guidance no longer foregrounds obstacles, consequences, problem-solving or child-as-fixer.


## V251.19
- Adds soft developmental child-appeal guidance to the story conception/storyboard stage.
- Focuses on compelling experiences rather than age/gender subject stereotypes.
- Explicit Story Ideas, interests, dislikes and Cast context outrank demographic tendencies.
- Gender is treated only as a weak optional signal and never as a restriction.
- No API or Supabase schema changes.


## V251.20 — Concept builder + account creative memory
- Adds a dedicated concept-builder pass before the six-scene storyboard. The concept pass cannot write story prose or scenes; it must first identify a genuinely compelling child-centred premise.
- Rejects outings/settings as sufficient stories on their own and explicitly checks what the child would be excited to tell somebody happened.
- Adds account-level anti-repetition using compact summaries of the 10 most recent saved stories. The concept builder is told not to recycle underlying plot shapes, distinctive props, discoveries or endings merely with different nouns/settings.
- Adds contemporary-authenticity guidance so stock adventure shorthand such as maps, backpacks, keys, ribbons and snacks appears only when naturally required.
- Keeps V251.17+ storyboard-first production: chosen concept -> storyboard -> six illustrations -> final prose written from the plan and finished pictures.
- No Supabase schema change and no new API endpoint.


## V251.21 — Robust concept-builder response handling
- Keeps the V251.20 concept-builder and account-level anti-repetition architecture unchanged.
- Parses concept JSON defensively, including harmless trailing commas and a nested `concept` object.
- Accepts a few semantically equivalent field names instead of rejecting an otherwise valid concept.
- If the first concept response is malformed, makes one formatting-repair attempt before failing.
- Replaces the misleading ‘could not find a strong story concept’ error with a neutral technical retry message.
- No Supabase schema change.

## V251.28
- Increased only the concept-builder and concept-format-repair `max_output_tokens` allowance from 1600 to 4000 after diagnostics confirmed both calls were ending `incomplete` with `reason: max_output_tokens` before producing visible output.
- Retains the V251.27 developer diagnostics. No story prompt, parser, illustration, reconciliation, API-count, or database changes.


## V251.30
- Keeps the V251.28 4,000-token concept-builder allowance.
- Strengthens concept, storyboard and final-author guidance for comedy, excitement, suspense and age-appropriate safe peril without changing the generation pipeline.


## V251.30
Strengthens the story concept architecture so adventure/mystery concepts require a genuine dramatic engine, adults do not neutralise the central adventure, safety shapes consequences rather than preventing events, and stock map/plan/note/key devices are not used as default navigation or discovery mechanisms. Retains the proven 4,000-token concept-builder limit.


## V251.31
- Adjusts the developer-only **Generate demo child** tool for publishing/marketing use.
- Removes the deliberate counter-beautification bias toward plain, awkward or heavier fictional children.
- Generated demo children are now naturally attractive, warm, expressive and visually appealing while remaining believable and individual rather than artificially perfect or model-like.
- Body type remains naturally varied but neutral; no deliberate uglification or caricature.
- Customer child profiles, story generation, illustration continuity and the 4,000-token concept limit are unchanged.


## V251.32
- Developer-only Generate demo child tool now lets the developer choose Boy, Girl or Random and age 3–12 or Random before generation.
- Random remains the default for both controls, preserving the previous one-click behaviour.
- Normal customer child creation and illustration behaviour are unchanged.

## V251.53
- Refines the V251.52 copyright/originality safeguard so it distinguishes protected works from original source material confidently in the UK public domain.
- Close adaptations of confidently public-domain originals are permitted when requested; the model does not rely on a hard-coded catalogue of public-domain titles.
- If public-domain status is uncertain, the source is treated as protected.
- Later protected adaptations, translations, illustrations, films, television versions, games and editions remain excluded even when the underlying original is public domain.
- Final story reconciliation preserves legitimate public-domain adaptations while retaining the protected-work safeguard.
- No Supabase schema change and no API endpoint added.

## V251.52
- Separates narrative/storyboard context from image-generation context for required story illustrations.
- Normal page illustration requests now send the already-planned current visual moment plus character/world continuity, rather than repeatedly exposing the image model to hazardous actions from all six scenes.
- Safety retries are rebuilt as genuinely fresh minimal prompts instead of prepending instructions to the rejected long prompt.
- Retry composition requires children to be visibly secure on stable ground with hazards separated by distance, structure, barrier or viewpoint.
- Story danger, suspense, six-scene planning, Cast identity, previous-art continuity and visual-variety architecture remain intact.
- No Supabase schema change and no API endpoint added.


## V251.59
- Fixes the developer masked-illustration editor so the complete image is bounded inside the correction dialog and the overlay canvas remains exactly aligned with it.
- Prevents the public homepage flashing during signed-in session restoration on refresh.
- Locks cover character rendering to the same naturalistic realism standard as interior illustrations.


## V251.76
- Astra's combined six-interior + cover art-direction stage now uses strict structured output with an exact six-scene schema and a larger output allowance.
- Removed the obsolete second Astra cover-art-direction API path; cover generation uses the commission already created with the interior storyboard.
- Developer-only Abort generation control is now compact.


## V251.87
- Fixed developer Story Workshop false-ready state after failed initial Astra planning.
- Send to Astra and Create this book now remain disabled until a valid initial production plan exists.
- Initial planning failures show the real diagnostic and a Retry initial development control.
- Removed silent no-op guards: impossible missing-plan states now surface visibly instead of making buttons appear broken.


## V251.91 — durable pre-illustration checkpoint
- Workshop production now MUST persist Astra's approved story architecture and complete art-direction plan before illustration 1 is requested.
- Approved Workshop concept references are included in that checkpoint, so a first-image failure can resume the same designed book rather than rerunning Astra planning.
- One-click generation now uses the same fail-closed rule: if its post-Astra checkpoint cannot be saved, Moonbeam stops before Sunburst rather than spending image calls without recoverable state.
- Workshop production failures now leave a persistent visible developer diagnostic instead of being cleared by the final cleanup block.
- No database migration is required.

# Moonbeam Stories V251.93

## V251.93 — developer Series Library, stage 1
- Developer account only: Saved Stories can now be organised as Series → Volume → Story.
- Create, rename and delete Series and Volume folders without deleting the saved stories inside them.
- Move saved stories between volumes or back to Loose stories; reorder stories within a volume.
- Rename individual saved stories from the library.
- Each Series now has editable persistent Series Instructions / Bible text, ready for Astra series-generation work in a later stage.
- Series data is stored in dedicated Supabase tables and is accessible only through the existing server-side developer-account gate; ordinary authenticated Moonbeam accounts have no direct table privileges.
- Ordinary users retain the existing flat Saved Stories interface unchanged.
- No story-generation, Astra, illustration, credit, reader or KDP-generation behaviour was changed in this stage.


## V251.94 — Develop Series with Astra (planning stage)
- Developer-only Series workspace now links a Series to a lead child from Your Cast.
- Develop Series with Astra separates the creative Series Bible from the audience/publishing brief and persists the approved plan.
- Generate new volume inherits the approved Series identity and Cast, lets Astra choose an 8–16 story ideal size plus two editorial candidates, and accepts optional developer direction without redefining the recurring lead.
- Character proposal → accept/retry → world interpretation → accept/revise/different interpretation → whole-volume story-outline planning.
- Each story concept can be accepted or individually replaced; at least 8 accepted concepts are required before the volume is considered ready for production. Rejected slots do not have to be replaced if at least 8 remain.
- Planning is durable in Supabase and can be resumed from the Series Library.
- Copyright/franchise collision avoidance is a hard planning guardrail, including manual character overrides.
- V251.94 deliberately stops before paid story/image production. The approved plan will be connected to the unchanged existing Moonbeam story-production pipeline in the next stage.


## V251.94.1 — Series Bible editing correction
- The Series Bible panel in the developer Series Library is now a real editable textarea with an explicit Save Bible action, rather than a read-only display panel.
- Manual Bible edits deliberately mark the Astra Series Plan unapproved so the developer reviews/approves the revised plan before starting a new volume.
- Removed the redundant legacy Edit instructions button from the Series card.
- Astra's series-development context now explicitly knows the commercial purpose: Amazon publishing is primarily intended to introduce parents to Moonbeam Stories and attract potential users, while promotion must remain outside the fiction itself.

## V251.95 — guided Series setup
- Developer-only New Series is now a mandatory step-by-step wizard: name → main Cast character → optional series-world Cast → audience → series concept → Astra development → review/approval.
- Incomplete series reopen at the first unfinished step and do not expose volume generation until setup is approved.
- Series-world Cast are explicitly optional: Astra is told not to force them into stories, normally to use at most one additional Series Cast member per story, and to allow brief cameo appearances.
- Astra receives the selected supporting Cast plus the standing Amazon/Moonbeam commercial purpose, while marketing remains separate from fiction.
- Existing volume planning and the current story-production pipeline are otherwise unchanged.


## V251.96 — guided volume planning
- Developer-only volume wizard: story target (8–16), Astra/manual character route, character approval, world interpretation, whole-volume story slate, individual accept/edit/reject-and-replace, and final approval.
- At least 8 accepted stories required; rejected/unaccepted slots may be omitted so the final volume can contain fewer stories than the original target.
- Planning persists in existing developer volume plan JSON and resumes at the current stage.
- This build deliberately stops at Ready for production and does not invoke the existing illustrated story-production pipeline.

## V251.98 — Series volume production
- Fixed Volume World revision flow: Astra now explicitly acknowledges developer steering, shows the revised Volume Bible, and remains on the world step until **Accept world** is pressed.
- Connected approved Series volume plans to the existing Moonbeam production pipeline without replacing the current Astra → art direction → Sunburst interiors → final prose → cover machinery.
- Volume production is resumable story-by-story. Each completed story is saved and filed into its Volume immediately before the next story is offered.
- Series-world supporting Cast remain optional. Production only adds a supporting Cast member when that approved story concept actually names them, and never adds more than one supporting Series Cast member automatically.
- Series-volume story covers suppress author credit and dedication.
- Series-volume saved covers are flattened to a single finished cover asset containing the generated artwork and rendered story title before storage; raw cover artwork is not treated as the finished publishing cover.
- Volume production progress is persisted in the existing Volume plan JSON; no new database migration is required.

---

# Moonbeam Stories V252.10

## V252.10 — contextual Series/Volume chapter covers
- Saved-story cover treatment is now derived from current developer Series/Volume membership, not from the protagonist, developer account, publishing status, or permanent mutation of standalone story metadata.
- Existing saved stories inside a Volume immediately render as chapter covers without the normal Moonbeam kicker/author/dedication overlay.
- Existing Series covers that were already saved as flattened artwork + title do not receive a second title overlay, so their saved title remains visible exactly once.
- A loose standalone story manually moved into a Volume receives a title-only cover overlay while viewed in that Volume; moving it back out restores the ordinary standalone cover treatment.
- Standalone saved stories and standalone publishing remain on the normal cover path and are unchanged.
- No image regeneration, resaving, OpenAI call or Supabase migration is required for existing King Sam stories.
- V252.07 transfer optimisation and V252.09 simplified no-replacement Series workflow are retained.


## V252.21
- Added a developer-only final Volume publication package after curation.
- Publication reads live Volume membership as authoritative, so deleted candidate stories cannot leak into cover/copy/export.
- Volume cover typography is composed at publication from Series name + Volume name + author; a folder named `Volume 1` therefore publishes as the Series title plus `Volume 1`.
- Added Astra-created collection cover direction, canonical Cast reference use, final cover persistence, KDP description, seven keyword phrases and reader age range.
- Added fixed-layout Volume EPUB export containing Volume cover, title page, contents, every surviving story (story cover + text + illustrations), navigation and About the Author page.
- No Supabase migration required; publication metadata is stored inside the existing Volume plan JSON.


## V252.22

- Removed the legacy per-Volume “Volume character / incarnation” stage from the generic Astra Volume workflow.
- Series identity, recurring lead and Series-world Cast now inherit automatically into every Volume.
- New Volume setup is four stages: Volume direction → Volume brief → Story slate → Review/generate.
- The first screen now offers “Let Astra decide” or an optional developer idea/direction for the Volume; this can steer themes, situations or settings but cannot redefine the established Series characters.
- Planned Series Volumes receive neutral sequential names (`Volume 1`, `Volume 2`, etc.) rather than being named after a temporary character concept.
- Astra's Volume-development prompt explicitly forbids inventing a new incarnation/role/identity for the recurring lead and treats the Series Bible and canonical Cast as inherited authority.
- Story production now labels the inherited context as the Volume creative brief rather than a Volume character.
- No Supabase migration required.


## V252.26 — Non-destructive story-cover illustration corrections
- Developer story-cover illustration corrections now use the same candidate-review workflow as ordinary page illustration corrections.
- Generating a corrected cover no longer overwrites the current cover immediately. The replacement is previewed while the original remains saved.
- **Accept replacement** persists the candidate cover; **Try again** can generate another candidate; **Keep original** discards the candidate without changing the book.
- Saved-story cover storage/cache persistence occurs only after explicit acceptance. No database migration or new API endpoint is required.

## V252.25 — Direct approved Series Bible editing
- Approved Series folders now expose Edit Series Bible and Save Series Bible directly; Astra redevelopment is not required for manual editorial corrections.


## V252.31 — Fiction Studio Stage 2
- Adds developer-only Book Development inside the isolated Back Room.
- Proposed Series Bible books can be expanded by Astra into a full-length 20–50 chapter novel blueprint with POV, character/relationship arcs, external plot, heat progression, turning points, continuity watchlist and ending.
- Book Plans persist separately in `developer_fiction_books`; browser roles remain revoked and only the server service role can access them.
- No manuscript chapters, children's-story generation or Sunburst illustration generation are called from this flow.
- Uses the existing `/api/generate` endpoint, preserving the 12-function Vercel limit.


## V252.40
- Fiction Studio now routes an approved Book Plan into the saved-novel workflow instead of the obsolete V252.32 manual chapter test.
- Generate Novel / Resume Novel writes sequential chapters automatically until completion.
- After a failed chapter request, the browser re-checks the authoritative database checkpoint before retrying, so a lost response does not blindly duplicate a saved chapter.
- Genuine transient chapter transport failures receive bounded retries.
- Continuity is self-repairing: before drafting the next chapter, a lagging ledger is rebuilt from saved chapter continuity deltas.
- Novel status polling transfers chapter numbers only instead of retransmitting the growing manuscript on every loop.


## V252.41 — exact isolated Fiction Studio book economics
- Each Fiction Studio book now persists its own Astra request ledger in `developer_fiction_books.usage`.
- Book Development architecture and chapter-plan batches are metered separately from manuscript chapter generation.
- Every metered response stores input, cached-input, cache-write (when reported), output and total tokens, API request duration, HTTP status, model and a frozen GPT-6 Astra USD price snapshot.
- Saved Novel shows Planning cost/time, Manuscript cost/time, total OpenAI cost/token counts and cumulative actual Astra API time. Idle pauses between Resume actions are excluded from actual API time.
- Review ZIP includes `generation-usage.json`.
- Historical pre-V252.41 activity is never backfilled with invented estimates; older books are explicitly marked as unmetered until new V252.41 calls occur.
- No new API function and no Supabase schema migration are required because the existing per-book `usage jsonb` column is used.

## V252.44 — Fiction Studio model laboratory + editorial pipeline
- Series Development, Book Development and Manuscript model selection: GPT-6 Astra / Sol / Luna. Each selection locks when its stage starts.
- Four versioned editorial sub-stages: developmental diagnosis, revision, line/style, proof. Each stage independently selects Astra / Sol / Luna and preserves the preceding manuscript.
- Exact request-level USD accounting in `developer_fiction_usage_events`, including model, stage/substage, response id, duration, input/cached/cache-write/output/reasoning tokens and historical price snapshot.
- Live book-generation accounting refreshes after each chapter response. Book totals show direct cost plus allocated Series Development share; series totals never double-count allocation.
- Saved novels show model provenance. Editorial versions are stored separately from the original manuscript.
- Requires `supabase/v252_43_fiction_models_editorial_usage.sql` before deploying this build.


V252.44 — Fiction Studio seed-first Series Development: removed Genre/Subgenre, Heat and Target Words creation controls and prompt influence; Series Development model now has creative discretion over form, genre, readership, explicitness, work count and work length. Saved novel status is derived from authoritative manuscript progress rather than stale plan_approved metadata.


V252.44 — Fiction Studio seed-first Series Development. New series creation now asks only for pen name, series name, Series Brief and Series Development model. Genre/subgenre, heat and target length controls no longer influence Series Development. The selected model has explicit discretion over form, genre, readership, explicitness, work count, work length and architecture, including single-work and open-ended outcomes. Work Development derives scale from the approved Bible instead of legacy series form fields. Saved novel badges are derived from authoritative manuscript progress so completed drafts no longer remain labelled PLAN_APPROVED.


V252.45 — Fiction Studio Series Development instruction simplified: the Series Brief is the brief. Removed the enumerated list of model “discretions” and special-case examples. The development model is instructed simply to deliver the best creative and commercial outcome that fully fulfils the supplied brief. Updated creation-page helper text to match.


V252.46 — Fiction Studio legacy-field cleanup. Completely removed the retired Series Creation genre/subgenre, heat and target-length plumbing: new-series API writes no longer send those fields, and the accompanying Supabase migration drops the obsolete developer_fiction_series columns. Book-level planning fields such as target_words and heat_progression remain model-authored Book Plan outputs.

## V252.46.1 — Fiction Studio book-path restoration
- Keeps each Series Bible Book 1/2/3/... card as the permanent entry point for that immutable book position.
- Reconciles those cards with existing `developer_fiction_books` records by `position`; no manuscript, plan or editorial data is moved or regenerated.
- Existing books open their saved Book workspace; undeveloped slots open Book Development.
- Card status is derived from authoritative saved plan/chapter/editorial state (including FIRST DRAFT COMPLETE and editorial-stage completion), not stale display status.
- Removes the duplicate Saved Novels presentation. The original manual Book Development → manuscript → editorial pathways remain unchanged.
- No Autopilot or automation added. No Supabase migration required.


## V252.46.2
Fiction Studio book-slot navigation compatibility repair. Numbered Series Bible book cards are permanent entry points for both legacy and newly created series. Each click re-reads authoritative developer_fiction_books state by immutable series position before opening an existing book or starting development for an undeveloped slot. Cards no longer depend on a background reconciliation request to become clickable. No automation or database migration.

## V252.46.3 — Fiction Studio manual-pathway repair
- Restores missing Series rename/delete handlers that were throwing during Series rendering and preventing later Book-card handlers from being attached.
- Keeps each numbered proposed-book card as the permanent entry point: existing position-matched books reopen; undeveloped slots enter Book Development.
- Re-renders immediately after Series Bible approval so newly created series expose their Book cards without requiring a reopen.
- Makes saved-book opening depend on the authoritative `novel-status` checkpoint; accounting/editorial display failures no longer erase manuscript progress state.
- Restores live accounting-card refresh during manuscript/editorial work.
- Makes an interrupted developmental-edit request safely resumable instead of leaving a running editorial row that cannot continue.
- No Autopilot and no database migration.
- Persistence remains server-side at every durable checkpoint: Series Bible save; work architecture; each validated Book Plan batch; each manuscript chapter; continuity ledger (with rebuild from saved chapter deltas after interruption); editorial run; and each edited chapter. Original draft chapters are never overwritten by editorial stages.


## V252.49 — resilient editorial resume and patching
- Line/style and Proof no longer abort an entire chapter because one model-supplied `find` excerpt differs only by harmless quote/whitespace transcription. Exact matching remains first choice; a tightly controlled normalized match is used only when it resolves to one unique source span.
- Any patch that still cannot be located uniquely, or overlaps another accepted patch, is skipped individually instead of throwing away the whole chapter. Successfully verified patches are applied and the chapter checkpoint is saved.
- Editorial prompts now ask for longer, distinctive verbatim source excerpts to reduce ambiguous patch matches.
- Resume progress no longer resets its visible chapter counter to 1. It reports the actual chapter saved/next chapter returned by the server.
- An already-running editorial stage now shows its locked model and disables the selector; the button says Resume instead of Run. This prevents the UI from implying that changing the dropdown can change a model already locked to the run.
- No Supabase migration required beyond the V252.47 editorial-continuity migration.


## V252.49
- Luna remains the initial default, but manual Sol/Astra editorial selections now persist and are sent exactly as selected.
- The server rejects missing/invalid editorial model values instead of silently falling back to Luna.
- Client and server both stop before chapter editing if the created run does not match the chosen model.
- Active editorial passes now have a visible reject control; saved chapters remain preserved in history.


## V252.50 — Fiction Studio novel reader

- Adds a developer-only **Read novel** control to saved Fiction Studio books.
- Desktop reader uses a clean two-page text spread with no illustrations, previous/next controls and arrow-key navigation.
- Mobile reader becomes a single-page horizontal swipe sequence with scroll snapping.
- Reader can switch between the first draft and preserved Revision, Line/style and Proof versions; in-progress editorial versions are assembled from the last completed source plus their saved edited chapters.
- Chapter headings and page counters are retained while prose is paginated into comfortable reading chunks.
- No Supabase migration and no additional Vercel endpoint are required; the reader reuses the developer Fiction Studio generate endpoint.


## V252.51 — repeatable revisions + editorial direction
- Every editorial pass now has an optional **Editorial direction for this pass** field. The instruction is persisted with that exact run and reused on resume.
- Revision is repeatable before Line/style. After a completed Revision, the workspace offers **Run another revision** from the latest completed Revision or **Run Line/style**.
- Each editorial run stores its exact `source_run_id`, so repeated revisions, continuity initialization, reader assembly and later stages use the intended source version rather than merely the latest run with the same stage name.
- Model, source version and direction lock when a pass starts. Rejecting a pass preserves its saved chapters/history without making it the active source.
- Requires `supabase/v252_51_multi_revision_direction.sql`. No new Vercel endpoint; API count remains 12.


## V252.54 — manual Fiction Studio Book Plan editor

- Adds **Edit Book Plan** after Book Development completes and before Chapter 1 is generated.
- The editor exposes the novel title, target length, architecture fields and every chapter's title, POV, events, purpose, relationship shift and continuity.
- Chapters can be added, removed and reordered; chapter numbers and `chapter_count` are recalculated deterministically on save.
- Saving makes the edited structured plan authoritative for manuscript generation and synchronises the saved novel title.
- Server-side validation prevents malformed/incomplete chapter plans and locks plan editing once manuscript generation has started, so an edited plan cannot silently conflict with already-written chapters.
- Fixes the Book Development batcher so it now honours the architecture model's chosen `chapter_count` (1–500) instead of silently forcing every plan to at least 20 chapters. This was the cause of plans whose metadata said 13 chapters while the chapter array contained 20.
- No AI call is used for manual editing and no Supabase migration is required.

## V252.53 — deterministic Fiction Studio character rename

- Adds **Rename character** to every saved Fiction Studio novel.
- This is a deterministic text/JSON operation, not an AI rewrite: it changes only whole-name matches and does not alter surrounding prose.
- Preview shows the exact number of matches and which saved records contain them before anything is changed.
- Default scope updates the current readable manuscript, its continuity, the Book Plan / book record, the latest Developmental report used by future editing, and optionally the Series Bible / future-book plans.
- An **Every saved draft/editorial version** scope is available when the author deliberately wants historical versions renamed too.
- A rename is blocked while any editorial pass is running, preventing an in-flight model from reintroducing the old name.
- Apply performs the replacements and then re-reads the selected scope; success is reported only when **zero whole-name occurrences of the old name remain**.
- Matching is Unicode-aware and case-insensitive while preserving common case forms (`Iker` → `Mateo`, `IKER` → `MATEO`, `iker` → `mateo`). Possessives such as `Iker's` are handled automatically without touching longer words such as `Ikerish`.
- No Supabase migration is required for V252.53.

## V252.55 — automatic per-book Fiction Studio pipeline

- Keeps Series Development, Series Bible review/editing, individual Book creation, Book Development and Book Plan review/editing manual.
- Pressing **Generate story** on an approved Book Plan starts automation for that book only: First draft → Developmental → one Revision → Line/style → Proof → Complete.
- Adds separate Luna/Sol/Astra selectors for First draft, Developmental, Revision, Line/style and Proof before generation starts; Luna remains the initial default.
- Locks each selected model when that stage starts and preserves the existing run/source provenance.
- Adds safe transient-connection recovery: after a failed draft/editorial request, Supabase checkpoints are checked before any retry so already-saved work is not deliberately regenerated.
- Retries an unsaved request at most three times, then pauses safely with all durable work preserved.
- Adds **Pause automatic pipeline** and resumable local pipeline state. A pause takes effect after any in-flight request has finished/saved.
- Automation never creates the next novel, never creates a new Book Plan, and never advances to another series book. Every book must still be deliberately started by the developer.
- Existing manual editorial controls remain available for books that were not started in automatic mode and for optional additional Revision passes after the automatic pipeline.
- No Supabase migration required.


## V252.58 — evolving series memory
- Added persistent Series Memory separate from the foundational Series Bible.
- Completed proofed books automatically update hard canon, character states, unresolved threads, planted details, world changes, open questions, non-binding future possibilities, and a compact voice reference.
- Later book development automatically reads Series Memory and may introduce new book-specific or future-recurring characters organically; the original Bible cast is no longer treated as exhaustive or compulsory.
- Future possibilities are explicitly non-binding so continuity becomes richer without imposing a formula.
- Prior proofed books are backfilled into Series Memory when a later book begins development, allowing older series to adopt the system.
- Requires supabase/v252_58_series_memory.sql.

## V252.59 — Series Intelligence
- Expands persistent Series Memory into a richer Series Intelligence archive while keeping the Series Bible as the stable creative foundation.
- Meaningful characters now carry lifecycle/relevance, life status, book appearances, last known location, current state, significant events, relationship history and continuity constraints. Dormant/transient characters remain remembered without being treated as active cast.
- Adds compact timeline, relationship-state, knowledge-state, secrets/reveal, institution-state and open-consequence records, alongside existing hard canon, unresolved threads, planted details, world changes, open questions and non-binding future possibilities.
- Adds a selective per-book context pass: later Book Development receives only core/active and genuinely relevant archived material instead of the full accumulated cast/history.
- Adds an explicit archive rule: prior existence is not a reason for present appearance. Dormant characters, memories, flashbacks, callbacks and reunions must not be manufactured merely because they exist in history; new characters are preferred when more natural to the current story and setting.
- Stores the selected cross-book context with the Book Development state so chapter planning and manuscript generation use the same bounded continuity context throughout that book.
- Adds an inspectable/editable **Series Intelligence** panel beside the Series Bible for developer correction of canon housekeeping when necessary.
- Existing proofed books can still be backfilled; older V252.58 memory is normalized into the V252.59 structure when used.
- Requires `supabase/v252_59_series_intelligence.sql` to update the JSON default for newly created series. The migration has been applied to the current Moonbeam Supabase project.

## V252.66 — independent Fiction Studio background jobs
- Fiction Studio automatic book generation and Re-edit-from-First-Draft jobs now lock their own `series_id` and `book_id` when they start. Navigating to another series no longer redirects later chapter/editorial requests to whichever series happens to be visible.
- Different books can run automatic generation/editing jobs simultaneously in the same open Moonbeam tab. Starting work on another series, editing a Bible, or developing another Book Plan no longer stops an already-running job.
- A book is protected from starting a second generation/editorial background job while one is already active for that book.
- Adds a **Background jobs** panel on the Fiction Studio library and series pages showing each active/session job, its locked series/book, current stage and saved progress. Clicking a job opens its book.
- Background jobs continue when navigating around Fiction Studio, but—as before—closing/reloading the browser tab stops browser-side orchestration after the current in-flight request; durable Supabase checkpoints remain resumable.
- Completion no longer forcibly navigates the UI back to a book if the developer is working in another series.
- No Supabase migration or additional Vercel endpoint is required.


## V252.66 — literary-depth refinement
- Adds a compact positive literary-depth directive to Fiction Studio drafting and editorial development: character-specific perception, subtext, contradiction, concrete social/physical observation, varied rhythm, and meaning carried by implication rather than explanation.
- Explicitly tells the model to write with confidence and freedom; these are creative opportunities rather than quotas, and the goal is richer, more human writing rather than cautious writing.
- Interiority should arise from the immediate scene rather than compulsory backstory or reminiscence.
- Revision should avoid restating emotions/themes once dramatized and should consider the layer beneath a scene's obvious plot function without forcing it into every scene.
- Line/style remains targeted: it favours natural human texture only where a local edit is genuinely needed, and must not polish unaffected prose merely for neatness.
- Existing global anti-banter/anti-pithiness, genre preservation, word-count protection, immutable chapter titles, re-edit branching, Series Intelligence and background-job concurrency remain intact.
- No Supabase migration required.


## V252.69 — Adult/children separation hardening
- Adult Fiction Studio moved out of `api/generate.js` into dedicated `api/fiction-studio.js`.
- Fiction Studio REST storage helper is allowlisted to the eight `developer_fiction_*` tables only.
- Normal Moonbeam generation rejects the legacy Fiction Studio action.
- Fiction Studio browser resume state is scoped to the authenticated developer user and active Fiction Studio state is cleared on account changes/sign-out.
- `/api/health` remains available via a rewrite to the lightweight GET health response in `api/generate.js`, keeping the deployment at 12 API functions.
- Existing `developer_fiction_*` data is unchanged and automatically uses the hardened access path; no migration required.


## V252.71 — Fiction Studio progress clarity
- Replaces the vague Background jobs presentation with a clear Generation status panel.
- Every in-tab job now shows a prominent RUNNING / PAUSED / COMPLETE badge, current stage, and latest saved checkpoint.
- Series book cards now prioritise an active re-edit/generation over an older completed Proof, so a book being re-edited no longer misleadingly looks simply FINAL.
- Editorial runs show the live stage and saved chapter count where available.
- First-draft and Book Development cards show saved progress even after navigation.
- No database migration required.


## V252.75
- Fixed stale status on the individual Fiction Studio book page. The header now uses the freshly fetched manuscript/editorial state before rendering, so completed or in-progress editorial stages override old Book Plan status.


## V252.76 — series-wide character rename
- Adds **Rename character across series** on the Fiction Studio series page.
- Deterministically updates the Series Bible, Series Intelligence, original series brief/future plans, every saved Book Plan, first draft, continuity record, and every saved Developmental/Revision/Line/Proof history for every book in the series.
- Preview shows the total occurrences plus per-book counts before anything changes.
- Blocks the rename while the series has active generation/edit work, preventing an in-flight request from reintroducing the old name.
- Applies whole-name replacement only, preserves normal casing behaviour, and verifies that zero old-name occurrences remain across the saved series before reporting success.
- No Supabase migration required.

## V252.77 — model-aware fiction style guidance

- Keeps the shared fiction-quality goals for Luna, Sol and Astra: preserve genre/voice, deepen character where useful, protect pacing and length, and avoid unnecessary flattening.
- Applies the strong anti-banter / anti-pithiness / anti-rhetorical-symmetry correction layer specifically to Luna, whose recurring style tendencies motivated those rules.
- Sol and Astra now receive a freedom-first version: they use their own best literary judgement and only correct banter, clipped repartee, slogan-like phrasing, symmetrical contrasts or “not X but Y” constructions when those tendencies are actually repetitive or intrusive in the manuscript.
- Developmental, Revision and Line/style passes are model-aware; first-draft generation and chapter planning are model-aware too.
- Genre-preservation overlays, chapter-title protection, word-count safeguards, branching/re-edit history, Series Intelligence, concurrency, purge and adult/children separation remain unchanged.
- No Supabase migration required.

## V252.78 — context-aware series text editing + cleaner series cards
- Replaces the series-level character-only rename control with a general **Find & replace across series** tool for names, vocabulary, spelling choices and exact recurring words/phrases.
- Scans the Series Bible, Series Intelligence, original brief/future plans, every Book Plan, first draft, continuity record and every saved Developmental/Revision/Line/Proof branch.
- Luna is used only as a conservative context classifier during preview; it never rewrites the prose. High-confidence intended substitutions are queued for automatic deterministic replacement.
- Every occurrence that is not auto-changed requires an explicit developer **Change** or **Leave unchanged** decision. Nothing uncertain or apparently unrelated is silently skipped.
- This allows changes such as `Mara` → `Jane` while preserving unrelated uses, or `ass` → `arse` while sending different senses/homonyms to review.
- Apply verifies that every preview occurrence received a final decision; if the series changed after preview, the operation fails closed and requires a new scan.
- Fiction Studio library cards now use a clear vertical hierarchy: model, series title, pen name, then book-progress summary. Titles and author names no longer compete on one crowded line.
- Series detail headers also use the simplified model / title / pen-name hierarchy rather than stale “Series Development” wording.
- No Supabase migration required.





## V252.85 — anti-AI places, institutions and titles
- Adds a shared anti-AI worldbuilding guard across Series Development, Book Development, chapter planning, Series Extension and manuscript generation.
- Contemporary realistic fiction now defaults to real geography when the scale makes that sensible. Major cities, metropolitan districts and substantial towns may be real; tiny communities involved in repeated serious fictional crime should normally be fictionalised inside a real county/region.
- Fictional settlements may no longer be invented by freely combining atmospheric English-looking fragments. When a small fictional place is needed, the model must derive it from the actual regional toponymic ecology and keep the result unshowy.
- Adds a fail-closed blacklist of recurring synthetic place constructions such as Greyhaven/Dunhaven/Bellwick/Ravenmere/Ashvale-style names and close stock constructions. Existing/user-supplied canon remains allowed.
- Institutions and local businesses must follow mundane real-world naming patterns for the setting; the model is told to reject a whole-world palette that becomes suspiciously coordinated, quaint, gothic or alliterative.
- Adds title anti-default rules. Series and book titles must emerge from the concept and market rather than stock AI constructions such as region+occupation+Mysteries/Cases or generic thriller phrases. A newly generated explicit SERIES TITLE matching a high-risk metadata-style template fails closed and must be regenerated.
- The guard is locale-aware: manuscript language does not override the naming logic of the actual country/culture.
- No Supabase migration or additional Vercel endpoint is required.

## V252.84 — Demographic/cultural fiction naming engine
- Adds a hard ban on recurring AI-fiction default names and close neighbours (including Mara/Maren/Mira, Elara/Elora, Voss/Vale/Vance, Mercer/Thorne/Hale and a much broader protected list). New Series Development, Book Development, chapter planning, Series Extension and manuscript generation are instructed never to create them.
- Adds server-side fail-closed validation at the stages that can create new fictional people. If a model nevertheless returns a newly introduced banned name, nothing from that stage is saved. Existing canonical names already present in supplied context remain readable so old series do not break.
- Names are now treated as demographic/cultural facts. The model estimates approximate birth year, uses the nearest reliable cohort evidence, and prefers ordinary names actually plausible for that character's country/region and generation rather than 'fictional-sounding' names.
- Family coherence is mandatory: siblings/parents/surnames and religious/ethnic/cultural naming traditions must make sense together unless mixed heritage, migration, adoption, remarriage, conversion or another explanation is actually established in the story. National popularity alone is not enough.
- Setting outranks writing language for names. A Hebrew-language novel set in Israel uses culturally plausible Israeli naming; a Hebrew-language novel about an English family in Manchester still uses plausible British names. Equivalent distinctions apply to Spain/Latin America, Portugal/Brazil, France/Quebec, etc.
- England/Wales receives embedded historical cohort anchors drawn from ONS/GRO-derived rankings (1954, 1964, 1974, 1984, 1994, 2004 and 2014) plus a broad ordinary UK surname pool. The rules use these as weighted realism anchors rather than forcing the same handful of names repeatedly.
- Locale source profiles tell the model to favour official/civil-registration evidence where available: ONS/NRS/NISRA/CSO (UK/Ireland), SSA (US), Statistics Canada, NSW BDM (Australia), INSEE (France), INE (Spain), ISTAT (Italy), Statistics Denmark, Statistics Norway, Statistics Sweden/official Swedish sources, Finnish official population/name data, Israel CBS, and equivalent national statistical/civil-registration sources for other settings. Where exact annual data is unavailable, the model must use the nearest reliable cohort and must not pretend to statistical precision.
- No Supabase migration required.

## V252.83 — Extend series
- Added the series-level **Extend series** button to the developer-only Fiction Studio after the initial Series Bible review is approved.
- Extension uses the series' already locked Series Development model and receives the authoritative Series Bible, persistent Series Intelligence, existing book records/plans, and the current proposed slate.
- It appends a fresh model-chosen batch (normally 3–6) without rewriting the existing Bible or previous books, and explicitly avoids mechanical repetition of earlier premises, twists, relationship arcs, settings, structures, or forced callbacks.
- No Supabase migration required.

## V252.86 — data-driven anti-AI world naming
- Replaces the V252.85 prompt-only place/institution guidance with an embedded evidence pack used automatically by Fiction Studio generation stages.
- UK regional detection injects real settlement exemplars from the relevant naming ecology (with OS Open Names / ONS geography as the source basis) before Astra/Luna names new places.
- Supported international locales inject real country-specific place exemplars and require the relevant national gazetteer/statistical authority as the naming reference model; language is not treated as nationality.
- Real geography remains the default where settlement scale makes it appropriate. Small communities can be fictionalised where serious crime/scandal would attach unfairly to a tiny real community, but the fictional name must be derived from real regional naming evidence rather than atmospheric free-combination.
- Businesses/institutions now use deterministic evidence-based methods: founder/family surnames, real locality/street names, functional descriptors, legal forms and historically attested institution types. Decorative adjective+noun naming is explicitly disallowed as a default.
- Existing AI-default place/institution/title rejection remains fail-closed and existing canon remains protected.
- No Supabase migration.


## V252.87
- Expanded Fiction Studio anti-AI world naming into an international data-driven geography and business/institution naming layer.
- All supported writing locales now have real settlement anchors rather than generic fallback geography.
- Added locale-specific organisation naming profiles, ordinary structural patterns and common legal/company forms, with culture/region constraints.
- No new Vercel API route and no database migration.

## V252.88 — live real-world collision safety
- Added a live web collision-checking layer to the existing developer-only Fiction Studio route; no additional Vercel API function is created.
- Series Development, Series Bible saves/approval, Extend Series, Book Development architecture, completed Book Plans and manually saved Book Plans are checked before canon is persisted.
- The checker uses OpenAI Responses web search with Luna to minimise cost and blocks only high-confidence harmful collisions. Ordinary shared names such as common UK first-name/surname combinations are explicitly not treated as collisions by themselves.
- Fictional people portrayed as serious wrongdoers are checked more strictly when a distinctive name plus location/profession/biographical details could identify a real person; famous/prominent real people may not be repurposed as fictional wrongdoers.
- Real companies/institutions may appear neutrally, but invented murder, fraud, corruption, abuse, dangerous negligence or other damaging conduct may not be attached to a real identifiable organisation. Fictional wrongdoing organisations are checked for exact/confusingly-close real-world trading-name collisions, especially in the same place/sector.
- Real major cities/districts remain usable as settings. Tiny real communities receive extra care where repeated fictional serious wrongdoing could attach to an identifiable community.
- Manuscript generation receives the same collision-safety rules and is told not to invent high-risk new entities outside the approved plan; live web checking remains concentrated at canon/planning boundaries rather than adding a web-search charge to every chapter.
- Live-check failures fail closed: the unsafe/unverified stage is not saved and can be retried.
- No Supabase migration.

## V252.93 — Book-page first-draft counter follows editorial state
- Fixes the top-of-book counter so a book already in Developmental/Revision/Line/Proof can no longer display `0 first-draft chapters saved` because of a stale `novel-status.saved_count`.
- Once durable editorial history or a live editorial job proves drafting has finished, the header treats the planned chapter count as the completed first-draft count.
- Keeps the change presentation-only: no manuscript, editorial history, Supabase schema or generation pipeline is altered.


## V252.95 — automated senior-editor quality gate

- Automatic adult-fiction pipeline now separates diagnosis from execution: Sol defaults to senior editor/quality gate; Luna defaults to manuscript drafting and revision.
- After the first draft, the senior editor reads the complete manuscript and returns a structured quality gate with critical/material/optional findings plus explicit strengths to preserve.
- Luna revises only from that concrete brief. The complete revision is then re-read by the senior editor. The review/revision loop repeats automatically while material defects remain, up to three Luna revisions by default.
- If the senior editor still requires revision at the safety cap, the pipeline pauses for human review instead of spending indefinitely or falsely declaring completion.
- Line/style and Proof start only after an explicit senior-editor approval.
- Re-reviews receive the previous senior report so resolved issues are checked rather than casually reopened.
- No new Vercel API route and no Supabase migration. Existing editorial run JSON stores the quality gate and preserved-strengths brief.

## V252.97 — real-location fact grounding
- Added a live researched location fact pack at Series Development using the existing `api/fiction-studio.js` route and OpenAI web search; no additional Vercel API route.
- Real settings are now researched for physical geography, waterways/coast/topography, transport and access, civic/public institutions, land use/local economy, relative geography and concrete local character.
- The fact pack explicitly records unsupported assumptions the novelist must not invent and flags contradictions between proposed fiction geography and researched reality.
- The researched Series location pack is saved inside the Series Bible so Book Development, drafting, Revision, Line/style and Proof all receive the same geographic canon.
- Each Book Development architecture also receives a live book-specific location addendum for new real locations introduced by that book.
- When a real-world detail is not supported, Astra/Luna are instructed to stay non-specific or clearly fictionalise it rather than guess.
- This is place-description grounding, separate from the existing place-name/business-name plausibility and collision checks.
- API route count remains unchanged; no Supabase migration required.

## V252.100 — visible senior-editor reports
- Book pages now show every completed senior-editor quality-gate report in collapsible round-by-round panels, including verdict, rationale, critical/material findings, synthetic-writing findings, strengths to preserve, priorities and chapter actions.
- Automatic pipelines update the open Book page as soon as each senior review completes; no page exit/re-entry is required to see the report.
- Series Book cards show a compact latest senior-review summary (approved/revision required plus critical, material and synthetic-writing counts).
- `list-books` now returns that compact latest senior-review summary from existing editorial-run data; no database migration or new API route is required.

## V252.104 — backstage first-name + surname selection
- New fictional character names are no longer chosen by Astra/Luna at the stages that establish canon.
- Series Development and Book Development now define a structured naming profile (birth cohort, country/region, explicit family/cultural context, family group and naming system) and use a temporary character marker instead of inventing a name.
- The backend researches real demographic naming data via live web search, builds hidden candidate pools, filters the AI-default blacklist/near-neighbours, and randomly selects the final name. Candidate pools are never shown to the creative model.
- Shared family surnames are selected once per surname group and reused for relatives. The selected surname is then supplied to the hidden given-name step so first name + surname are culturally coherent as a whole.
- Mixed families, marriage/divorce/adoption, patronymics and non-Western naming systems are supported through explicit naming-system metadata rather than forcing an English `first name + surname` pattern.
- The selector is expressly forbidden from inferring religion, ethnicity or migration history that the fiction has not established. If background is unspecified, it must use broadly ordinary local/cohort-plausible names rather than strongly community-specific combinations.
- This prevents demographic popularity from producing incoherent combinations such as assigning a strongly Muslim given name to a fictional family explicitly established as white English Christian merely because that given name is nationally common.
- Book architecture now has a `new_characters` list so important book-specific characters are named by the same hidden mechanism before chapter planning begins. Chapter planning is told not to invent extra canonical names outside that mechanism.
- Existing canonical names are preserved unless the developer explicitly changes them.
- No Supabase migration and no new Vercel API route.

### V252.105 — Structured-output schema hardening
- Fixed Series Development's strict JSON schema after V252.104 added `naming_profile`: strict Structured Outputs require every declared property to be listed in `required`.
- `naming_profile` is now required-but-nullable for Series Development, allowing established characters to return `null` while new `[[CHAR:...]]` characters return a complete profile.
- Added a recursive local strict-schema preflight. Any future schema with missing/extra `required` keys or missing `additionalProperties:false` fails locally before a model request is sent.
- Routed the remaining direct Responses API structured-output calls through the common preflight/retry wrapper so the check covers Series Development, Book architecture, chapter planning, series memory/context, naming research, geography/profession research, editorial stages and series extension.


## V252.106 — resumable Series Development backstage pipeline
Series Development now checkpoints Astra's creative Series Bible before any naming/geography/profession/collision work. Backstage enrichment runs as one persisted step per HTTP request in `developer_fiction_series.autopilot_state`, so refreshes, 504s and lost responses resume from the last completed step instead of rerunning or discarding Astra's work. Naming is one surname/given-name call at a time; geography is one call; profession discovery and each profession are separate calls; collision validation and finalization are separate checkpoints. No schema migration is required.

## V252.106 — bomb-proof resumable backstage research
- Series Development now saves Astra's creative core before any demographic naming, location research, profession research or collision validation begins.
- Every backstage unit runs as a separate HTTP request and checkpoints to `developer_fiction_series.autopilot_state`; refreshes, 504s, lost responses and redeploys resume from the last saved stage.
- Naming is granular: at most one surname-pool or one given-name call per request.
- Geography is one request; profession discovery is one request; each profession is one request; compact profession retry is its own request; collision validation and finalisation are separate checkpoints.
- Book Development architecture now uses the same staged pattern in `developer_fiction_books.development_state`: creative architecture, granular naming, location research, profession discovery/roles, collision validation, then chapter planning.
- Final Book Plan collision validation is now a separate checkpoint after all chapter-plan batches are saved.
- No new database columns or API routes are required; existing JSONB checkpoint fields are used.


## V252.108 — hard editorial length protection
- Line/style and Proof no longer rely on prompt wording to preserve manuscript length. The backend now measures every proposed edited chapter before saving it.
- Line/style rejects any chapter patch set whose net change exceeds the protected band; Proof uses a much tighter near-length-neutral band. Rejected patch sets are not saved: the exact source chapter is preserved instead, and the rejection is logged in the editorial run metadata.
- Whole-manuscript completion is mechanically guarded: Line/style must remain within ±3% of its source manuscript and Proof within ±1%. A stage outside that band cannot be marked complete.
- Revision cannot complete below 92% of the approved target. Existing restorative revision passes still run first; if they cannot recover the protected length, the pipeline pauses before Line/style rather than silently approving an under-length manuscript.
- These guards preserve the senior editor's ability to request substantive Revision changes while preventing later copy/style stages from stripping thousands of words from an approved manuscript.
- No Supabase migration or new API route is required.

## V252.109 — quality-led editorial completion

- Revision is no longer blocked, expanded, or repeated merely because it misses a numerical word-count floor. The planned target remains visible as diagnostic context only.
- Sol's senior-editor quality gate now explicitly judges substantive completeness, pacing, genre delivery, plot/character development and commercial readability rather than treating target length as a pass/fail criterion. Expansion is requested only when a concrete quality defect actually needs more narrative substance.
- Luna's Revision prompt now treats proportional chapter length as a planning reference, never a quota: no padding, recap or invented scenes simply to reach a number.
- Final publication checks no longer fail solely because a manuscript is more than 20% below its planned target; that condition is exported as a warning while structural publication faults remain blocking issues.
- Line/style and Proof retain mechanical anti-compression protection, with tighter per-chapter limits. Any destructive local patch is discarded and the exact source chapter is preserved.
- Whole-stage Line/style/Proof length bands are now advisory rather than blocking. Because destructive chapter edits are rejected before saving, aggregate drift can be recorded without stranding the book at an unfinished quality gate.
- Result: word count cannot trap the automated pipeline. Quality governs Revision; Line/style and Proof cannot quietly eat the manuscript; ordinary editorial completion continues without indefinite repair loops.
- No Supabase migration and no new Vercel API route.


## V252.112 — canonical character placeholder invariant
- Fixed a Series Development loophole where Astra could return a new `[[CHAR:key]]` character with `naming_profile: null`, causing the backstage resolver to skip it and expose an unnamed placeholder in the final Bible.
- Series Development now checkpoints a dedicated `naming_profile_repair` stage for any malformed placeholder, repairing one profile per request without choosing a name and without inventing ethnicity/religion/migration history merely for naming.
- Naming now scans every character placeholder, not only placeholders that already have a non-null profile.
- Hard invariants prevent any `[[CHAR:...]]` marker from passing naming, collision validation, or final Series Bible save.
- The Series Development prompt now states semantically that `naming_profile:null` is permitted only for already-named canonical characters.
- Book Development also asserts that every new-character placeholder has a profile and that no marker survives architecture validation.
- No database migration and no new API route.

## V252.113 — universal character-placeholder containment
- Extended the V252.112 naming invariant beyond Series/Book architecture so internal `[[CHAR:...]]` markers can never leak into chapter plans, draft manuscript, Revision, Line/style or Proof output.
- Series Development and Book Development remain the only stages allowed to create canonical character placeholders; important named characters must be resolved there by the demographic naming pipeline.
- Chapter planning and drafting are instructed never to emit placeholders. Truly incidental one-scene people may remain naturally unnamed by role.
- As a final deterministic safety net, any accidental downstream `[[CHAR:role]]` token is converted to a natural unnamed role (for example `[[CHAR:waiter]]` → `the waiter`) before saving, then a hard invariant verifies that no marker remains.
- Revision and later editorial output receive the same containment check, preventing an internal marker from being introduced during editing.
- Publication validation now also fails any manuscript chapter that somehow contains an unresolved internal character placeholder.

## V252.115 — checkpointed Book Architecture
- Replaces the single monolithic 8,000-token Astra novel-architecture call with three independently saved stages: core architecture, character/relationship architecture, and structural architecture.
- Each stage performs one bounded model call and persists its result before the next request, so a max_output_tokens failure cannot discard earlier architecture work.
- Backstage naming/research remains downstream and resumable; no schema or API-route changes.


## V252.116 — Sol next-book direction seed
- After a completed Proof, Sol automatically prepares a concise development-direction brief for the following proposed book.
- The seed is stored in the existing Series autopilot JSONB state and appears directly in the next book's Development direction box.
- Sol sees the completed book, final continuity/Series Intelligence, senior-review findings, representative final prose, and the next proposed premise. It is told to preserve strengths, flag repetition risks, and not pre-solve the next book.
- Human direction is never overwritten. If the following book already has user direction or substantive planning, seeding is skipped.
- Seeding is idempotent, safely retried after Proof, and recovered on opening the next undeveloped slot if a completion-time request was lost.
- No new API route or Supabase migration.


## V252.118
- Increased Luna Book Development architecture reasoning/output headroom now that architecture is split into checkpointed requests.
- Core architecture and character architecture: 16,000 token ceiling each.
- Turning points and ending architecture: 12,000 each.
- Continuity watchlist: 10,000.
- No workflow/schema/API-route change; this is a reliability change to prevent max_output_tokens failures during substantial planning work.


## V252.119 — visible Book Development checkpoint progress

- Long Book Development jobs now show the exact persisted stage instead of the generic ‘developing the novel architecture’ message.
- The status line accumulates completed checkpoints (core architecture, character architecture, turning points, continuity, ending, naming, location/profession grounding, validation) and names the stage currently running.
- During chapter planning it reports the saved chapter range and the exact next four-chapter batch, e.g. `✓ Chapters 1–4 saved · Luna is planning chapters 5–8 of 32…`.
- Progress is derived only from the saved `development_state`, so a refresh reconstructs truthful progress and does not pretend an unsaved stage completed.
- No API, schema or Supabase changes.


## V252.120 — serious manuscript-length planning without padding

- The approved Book Plan target is now fed to Luna during every first-draft chapter with live cumulative progress, remaining chapter count and an indicative remaining scale. It is a serious planning constraint, not a quota; padding, recap and manufactured scenes remain prohibited.
- Sol now performs an explicit length/completeness assessment whenever a manuscript is more than 15% below its approved target. He must diagnose whether the shortfall reflects missing dramatic, psychological, structural, relational or causal substance.
- A materially short manuscript may still be approved when it is genuinely complete and stronger at the shorter length, but Sol must record a substantive explicit justification. A missing/empty justification cannot silently approve the book.
- Senior-review UI and review ZIP now expose the length assessment, qualitative gaps and any shorter-length approval justification.
- No SQL or API-route changes.

## V252.121 — Astra senior editor + bounded Sol escalation

- Changes the default automatic adult-fiction editorial hierarchy to: Luna first draft → Astra whole-manuscript senior review → one Luna revision → Astra re-review → one Sol repair only if material findings remain → Astra final independent quality gate → Luna Line/style → Luna Proof.
- Removes the old repeated-Luna revision loop from the automatic pipeline. Luna gets one ordinary revision attempt; difficult cross-novel repair escalates to Sol rather than asking Luna to mutate the manuscript repeatedly.
- Keeps Astra as the independent judge before and after the Sol repair, so Sol does not simply mark its own work.
- The escalation is bounded: if Astra still finds material/critical defects after the Sol repair, the pipeline pauses for human review instead of cycling indefinitely.
- Adds an explicit Escalation repairer model selector; defaults remain Luna / Astra / Luna / Sol / Luna / Luna for draft / senior / revision / escalation / line / proof.
- Existing persisted editorial runs remain preserved; no Supabase migration or new API route is required.

## V252.122 — live draft-length control + bounded editorial escalation

- Rebuilds the automatic adult-fiction production hierarchy around bounded escalation rather than repeated Luna revision loops: **Luna first draft → Sol senior review → one Luna revision if required → Sol re-review → Astra escalation diagnosis only if Sol still rejects → one Sol surgical repair → Astra recheck → one Astra surgical final repair only if genuinely necessary → Astra narrow final verification → deterministic publication preflight**.
- From V252.128 onward, Sol is the normal terminal quality gate after Luna’s mandatory redraft/prose-naturalisation pass. Astra is escalation-only: she is called when Sol cannot sign off or when the finished book may require forward-series reconciliation.
- Removes automatic generative Line/style and Proof after final approval. Once Astra approves the actual manuscript, no model may rewrite it. The only downstream stage is a non-creative deterministic publication preflight.
- Astra's last-resort repair is a locked-manuscript surgical pass. It receives only the current unresolved chapter actions, copies unaffected chapters unchanged, returns exact find/replace patches rather than rewritten chapters, and is mechanically rejected if it attempts a broad edit footprint. Previously approved plot facts, clues, chronology, character knowledge, relationships, setting, professional facts, voice and ending are protected unless the unresolved finding explicitly requires that exact change.
- The final Astra verification is deliberately narrow: verify the named blockers were fixed, check for material regressions and copy integrity, and stop. It is not permission to reopen resolved stylistic preferences or invent fresh improvement work.
- Adds live first-draft word-count trajectory management so expensive Sol/Astra stages are not expected to manufacture tens of thousands of missing words. Every Luna chapter sees the approved target, words already saved, expected cumulative scale, remaining chapter count and the approximate remaining chapter scale needed to stay broadly on target.
- When the draft falls materially behind trajectory, Luna is told to recover through genuine dramatic, psychological, causal, atmospheric and relationship depth — never padding, recap or repetitive exposition.
- At saved 50%, 75% and 90% checkpoints, a materially under-length draft triggers a separate, checkpointed Luna `draft-rebalance` call. That call deepens the architecture of only the remaining chapters while preserving completed chapters, culprit/solution, ending, canon and continuity. The resulting chapter-specific depth directions are saved and fed back into later drafting.
- Draft-rebalance calls have a 20,000-token ceiling and normal chapter generation has a 16,000-token ceiling, giving Luna enough reasoning/output room to execute a full-length commercial novel rather than silently compressing it.
- The existing >15% shortfall assessment remains as a senior-editor diagnostic safeguard, but it is now the backstop rather than the primary length-control mechanism. A genuinely stronger shorter novel can still be approved; a large accidental drafting undershoot should be corrected while Luna is still drafting.
- Adds a deterministic publication preflight after final model approval. It checks structural publication faults, unresolved internal placeholders, suspicious duplicate long paragraphs/backstage artefacts and the existing deterministic whole-manuscript pattern audit without paraphrasing or stylistically editing approved prose.
- The final approved manuscript and preflight state are persisted in existing `generation_state` JSONB. Reader/export selection follows that approved manuscript. Sol's next-book direction seed now treats this final approval/preflight as completion rather than requiring a legacy Proof run.
- No Supabase migration and no new Vercel API route are required.

## V252.124 — Book 1 Sol seed respects the selected Series Development model

- Corrects V252.123's Astra assumption. **Series Development remains fully selectable at series creation** (Luna, Sol or Astra); the Book 1 handoff never changes or overrides that selection.
- After the selected Series Development model finishes and the developer approves the definitive Series Bible, **Sol reads that approved Bible and writes the Development direction for Book 1**.
- Sol is instructed to treat the approved Bible as authoritative without assuming which model authored it, and the seed records the actual Series Development model as provenance.
- The intended chain is therefore: **selected Series Development model → approved Series Bible → Sol Book 1 seed → Luna Book 1 Development → existing pipeline**.
- No Supabase migration and no new API route are required.

## V252.123 — Sol seeds Book 1 from the approved Series Bible

- Closes the Book 1 handoff gap in the adult-fiction pipeline. After the selected Series Development model completes Series Development and the developer approves the definitive Series Bible, **Sol reads the approved Bible and writes the Development direction for Book 1**.
- The Book 1 direction is stored in the same recoverable `next_book_direction_seeds` Series JSON state already used for later books, at position `1`; no new Supabase migration is required.
- Book 1 Development now opens with Sol's seed prefilled in the Development direction box for Luna, with clear UI provenance that it came from the approved Series Bible.
- Book 2+ behaviour is unchanged: after each completed book, Sol continues to seed the following proposed book from the finished manuscript, senior reviews, Series Intelligence and next-book premise.
- Adds recovery for pre-V252.123 or interrupted series. If an approved series reaches Book 1 without a stored seed, opening/starting Book 1 Development asks Sol to recreate the missing handoff before Luna begins.
- Human direction still outranks the automatic seed when deliberately supplied, and existing developed/planned Book 1 material is not overwritten.
- Uses the existing `/api/fiction-studio` route and existing JSONB state. API count remains 12.


## V252.126 — fix Book 1 seed helper initialization

- Fixed the Adult Novel Studio crash `Cannot access 'fictionNextBookSeeds252123' before initialization`.
- The shared next-book seed reader is now initialized before the legacy Book 2+ seed alias uses it.
- Book 1 Sol seed behaviour and later-book handoffs are otherwise unchanged.

## V252.125 — separate Moonbeam Stories / Adult Novel Studio usage accounting

- Splits the developer Usage page into independent **Moonbeam Stories** and **Adult Novel Studio** sections.
- Adult Novel Studio costs come from its dedicated token/cost ledger (`developer_fiction_usage_events`). Moonbeam Stories cost is shown as the configured OpenAI project cost less the metered Adult Novel Studio cost for the same period, so the two products are not double-counted.
- Removes the two **Tracked attributable cost** rows from the usage page.
- Adds an independent **Reset Moonbeam Stories** baseline and **Reset Adult Novel Studio** baseline. Resetting one does not alter the other and never deletes historical records.
- The Moonbeam Stories reset continues to control the existing average story-generation timing baseline; the Adult Novel Studio reset is usage-only.
- Uses the existing `moonbeam_admin_settings` table with a second setting key (`fiction_usage_baseline_utc`), so no Supabase migration or new API route is required.

## V252.127 — reconcilable Fiction Studio accounting
- Rebuilt each novel's live production accounting as an additive ledger: dynamically allocated shared series development/research, Sol handoff seed, Book Development, manuscript drafting, every editorial/revision pass, book-specific research/validation, any residual direct calls, Direct book production cost, and Fully allocated book cost.
- Shared series overhead now means every metered series-level call (including initial Series Development, naming, geography, professional-practice research, validation, and later Extend Series work). Its per-book allocation is recalculated against the current proposed-book count whenever the series grows.
- Sol next-book handoff costs are attributed to the book they prepare. Historical `next_book_seed` rows are re-attributed at reporting time from their `book-N` marker, so prior books no longer carry the following book's seed cost.
- The novel ledger lists editorial/revision passes dynamically in the order actually incurred, including model, request count, duration, and cost; books that need more gate/repair cycles therefore show more rows automatically.
- Direct model totals reconcile independently against Direct book production cost.
- The Series page now shows actual series cost to date beside the series title and each book's current fully allocated cost beside its title.
- No Supabase migration required; existing detailed usage-event rows are reused.


## V252.128 — closure-led editorial gates and Sol final authority
- Every Luna first draft now receives one mandatory conservative **redraft / prose-naturalisation pass** after Sol’s first senior review, even when the manuscript needs no structural rewrite. The pass explicitly targets recurrent Luna/AI-style habits while protecting strong prose, voice, canon and approved material.
- Sol’s first review now distinguishes structural approval from prose naturalisation. Sol is told not to treat “no structural rewrite required” as “no prose naturalisation required.”
- Sol’s second review is now a structured **closure audit** rather than a fresh review. It must mark every prior critical, material and synthetic-writing finding as resolved / partial / unresolved, then separately report any new regressions introduced by Luna.
- The second Sol review also checks whether the finished book substantially fulfils the approved Book Plan and the objectives/role established by the Series Bible. Beneficial deviations are allowed; literal plan obedience is not required.
- **Sol is now the normal final gate.** If Luna’s redraft resolves the earlier findings, introduces no material regressions, fulfils the book/series objectives and needs no forward-series reconciliation, Sol signs the book off without an Astra call.
- Astra is invoked only when Sol cannot approve or when Sol judges that the now-canonical finished book may require the forward series plan to change.
- Astra escalation/final reviews use the same structured closure + regression audit. After Astra-authorised repairs, every Astra finding must be explicitly checked as resolved before approval is possible.
- Astra’s final brief also checks the finished novel against the original Book Plan and the overall Series Bible. A good creative departure is allowed. If the finished book genuinely changes assumptions behind future books, Astra can mark a Series Bible update as required and provide narrowly targeted future-book adjustments.
- Those Astra-authorised future-plan adjustments are applied to the Series Bible before Sol seeds the following book. Standalone-case series can simply leave the forward plan unchanged when no downstream consequence exists.
- Senior-review cards and review ZIP reports now expose previous-finding resolution, new regressions, Book Plan/series-objective alignment and series-trajectory judgement.
- No Supabase migration and no new API file are required; the existing `/api/fiction-studio` route is reused.

## V252.129 — Astra-led editorial hierarchy + destructive-rewrite protection
- Rebuilds the automatic adult-fiction editorial pipeline as: **selected Series Development model / approved Bible → Sol Book 1 seed → Luna first draft → Astra structural review → Sol structural revision → Astra structural verification + dedicated anti-AI/style review → Sol prose-only style revision → Astra final creative sign-off → optional tightly bounded Astra self-repair if she rejects Sol's final work → deterministic publication preflight**.
- Luna is no longer used for whole-manuscript structural rewriting after the first draft. In the default automatic configuration Luna drafts, Astra judges, and Sol executes both structural and prose revision.
- Astra's post-structure review is explicitly two-phase: it first checks every previous structural finding and any new regression; only once structure is sound does it move on to prose/anti-AI style. If structural blockers remain, style editing does not begin.
- Allows one bounded second Sol structural correction if Astra finds a concrete unresolved structural blocker after the first Sol structural revision. If structure still cannot be closed, the pipeline stops safely with all checkpoints preserved rather than polishing an unstable manuscript.
- Sol's style pass is now a true prose-only stage after structure lock. It receives Astra's synthetic-writing findings, chapter-specific style actions and protected strengths, and uses exact targeted patches rather than whole-chapter rewrites.
- Astra owns final creative sign-off. Her final review must check every style finding, detect new structural/continuity/character regressions, verify Book Plan and Series Bible objectives, and decide whether the finished canon changes any future-series assumptions.
- If Astra rejects Sol's final style work, Astra gets one tightly bounded surgical self-repair followed by an Astra verification. The workflow never enters an open-ended self-approval loop.
- Adds a **hard destructive-revision guard**. Structural revision chapters cannot be radically compressed, and a complete revision manuscript must remain at least 90% of its source length (and no more than 125% without a separately redesigned workflow). A destructive pass is marked rejected before it can be promoted as the source for another stage; the prior manuscript remains authoritative.
- Line/style and proof whole-stage length guards are also hard rather than advisory. The existing exact-patch protections remain in force.
- The detailed live accounting now labels the new editorial rows by their real role (Astra structural review, Sol structural revision/correction, Astra style review, Sol anti-AI/style revision, Astra final sign-off/self-repair/verification) while preserving the V252.127 additive reconciliation.
- Series Development remains selectable at series creation, as established in V252.124. Selecting Astra there yields the full Astra-series-development path; the Book 1 Sol handoff still reads whichever approved Series Bible you chose to create.
- No Supabase migration and no new Vercel API route are required.


## V252.137 — self-healing real-world identity/reputational validation
- High-confidence collisions with real people, businesses, institutions, brands/titles or fictional place names are automatically fictionalised at the proper-noun level and revalidated.
- Up to three bounded repair attempts are allowed. The repairer may change only the conflicting identifying name; plot, role, background, relationships, geography and other canon must remain unchanged.
- Remaining collision risks after bounded retries become advisory warnings instead of discarding an expensive Series Development/Book Development stage.
- Genuine non-identity plausibility/factual failures can still block safely.
- Book Development now persists any automatic collision-name repairs made during architecture/final-plan validation.

## V252.144 — Fiction Studio X jobs can continue while working in normal Fiction Studio
- Running Fiction Studio X Book Development, manuscript generation, automatic pipeline and editorial jobs now capture and retain their own locked studio namespace and X access context when the job starts.
- Switching from Fiction Studio X back to normal Fiction Studio no longer blocks while an X job is running. The X job continues in the same browser tab while the normal Fiction Studio library can be used independently.
- Background requests no longer follow the currently visible studio namespace, preventing a running X job from accidentally sending later checkpoints to the normal Fiction Studio after a switch.
- The private X access token is retained only in browser memory while an X background job still needs it, and is released after the final X job finishes when X is not open.
- Returning to Fiction Studio X during the same session does not require another password while that retained access context remains valid.
- Leaving the Back Room UI for another Moonbeam page in the same tab also no longer kills an already-running X job. Closing/reloading the browser tab still stops browser-side orchestration; saved checkpoints remain resumable.
- No Supabase migration required.


## V252.146 — Fiction Studio X always requires password on re-entry
- Leaving the visible Fiction Studio X workspace immediately clears the interactive X access token, even if an X generation is still running in the background.
- Re-entering Fiction Studio X from normal Fiction Studio always opens the password gate and requires a fresh successful unlock.
- Background X jobs are not interrupted: each running job continues using the private X access context captured when that job started, independent of the now-locked visible workspace.
- Closing the Back Room also locks X immediately; returning later requires the password while any same-tab background X job may continue independently.
- No Supabase migration required.

## V252.151
- Asunder profile portraits now use a dedicated sanitised image-facing payload. The image endpoint no longer receives the full erotic character/profile canon, sexual-history data, or bust-size labels. It receives ordinary adult lifestyle-portrait facts only, with explicit no-nudity/no-sexual-activity instructions.
- Canonical prose continuity remains unchanged: the richer internal appearance/biography record is still stored and supplied to manuscript generation where relevant.
- New Asunder profile portraits are now also written to the immutable Fiction Studio usage ledger with `stage: illustrations` and attributed to the book and series that first created them.
- Book accounting now always includes an `Illustrations` row. Series pages also show the cumulative `Illustrations` total. Reusing an existing saved canonical profile creates no new illustration event/cost.
- Fiction image USD cost uses `FICTION_IMAGE_COST_USD` (or `MOONBEAM_COST_IMAGE_USD`) when configured; otherwise it converts the existing Moonbeam per-image GBP estimate using `MOONBEAM_GBP_PER_USD` (default 0.75).
- No Supabase schema migration required.

## V252.152 — guaranteed character-marker repair + final Asunder cover architecture

- Book Development no longer stops permanently when a `[[CHAR:...]]` placeholder survives an earlier naming checkpoint. Validation diverts into a self-healing backstage repair stage, resolves one marker at a time through the demographic naming system, replaces that marker everywhere in the saved Book Plan, rescans, and refuses to advance until the marker count is zero. Missing naming profiles are repaired first; creative models still do not invent replacement names.
- The persistent Asunder-format series now has a fixed final-cover architecture (`asunder_volume_cover_v1`) which remains attached to `asunder_fixed_four_story_identity_v1` even if the visible series name changes.
- Final cover generation is only available after human approval and deterministic publication preflight. It reads the four finished stories plus the four canonical female profile identities.
- Four new rear-panel images are generated from the four saved canonical profile portraits, with each panel grounded in that woman's actual finished story (setting, clothing context, mood and ordinary props). Generic yacht/hotel/bikini substitutions are explicitly forbidden when unsupported by the prose.
- Story N.1's woman receives a fifth, separate foreground image: the same recognisable woman, but in a different, more dominant story-consistent cover pose.
- The five image assets are composited deterministically into one fixed branded cover with four rear panels, a large N.1 foreground image, series wordmark, `VOLUME N`, and the current series pen name (Ana Rojas for Asunder). The image model never lays out the cover typography.
- The finished JPEG is stored privately, appears as the first page of the Fiction Studio reader, and has a separate **Download cover JPEG** action. It is treated as a separate publishing asset; the intended future Fiction Studio EPUB export must not embed it.
- Cover image calls are booked to the existing **Illustrations** accounting category for the book and series.
- No Supabase migration is required.


## V252.153
- Hardened Asunder profile portrait generation against image-safety false positives. The image endpoint now receives a one-way sanitised visual payload with erotic terminology stripped; the canonical character record is untouched.
- Added one automatic ultra-safe fully-clothed editorial portrait retry when the first portrait request is rejected specifically by the image safety system.
- Book Development remains resumable; successful portrait generation continues into the pre-draft profile gate.

## V252.154 — isolated Venice Lab
- Added a developer-only **Venice Lab** button to each Fiction Studio series.
- Uses `VENICE_API_KEY` only on the server; the key is never exposed to browser code.
- Reads the current saved Book Plan and canonical Asunder profile records for test prompts, but writes **nothing** back to Fiction Studio.
- Dynamically loads Venice text and image models from `/api/v1/models`.
- Text test calls Venice chat completions, defaults to `venice-uncensored` when available, supports up to 24,000 output tokens, and lets the developer download the result as a local `.txt` file.
- Image test calls Venice's OpenAI-compatible `/images/generations` endpoint with `moderation: low`, displays the result only in the Lab, and does not add it to the profile or illustration ledger.
- No Supabase migration required.

## V252.157
- Venice mirror accounting is intentionally hidden unless/until a reliable Venice cost source is integrated.
- Venice mirror series pages no longer request or display OpenAI-style series/book costs or illustration accounting.
- Venice mirror review ZIPs omit accounting files to avoid implying a cost calculation that is not authoritative.

## V252.158 — smaller Venice quality test
- Venice mirrors no longer launch the four-story auto-generation loop from the book page.
- The mirror now offers one deliberately small Story 1 scene test (about 1,800–2,500 words).
- Each button press makes exactly one Venice text request; there is no retry or continuation loop.
- Venice's additional system prompt is disabled for this test so the copied Series Bible, Book Plan and Moonbeam test brief govern the request.
- The sample is stored only in the mirror book generation state and does not become a manuscript chapter or mark the book complete.
- Earlier Venice draft chapters, if present from V252.155–157 testing, are ignored by the new sample test.


## V252.163 — OpenRouter context-safe bake-off
- Fixed Cydonia/OpenRouter test requests that could reserve the model's entire advertised completion allowance and exceed the total context window before generation started.
- OpenRouter scene tests now use a maximum of 12,000 output tokens, bounded by the provider's completion ceiling and by total context minus a conservative prompt estimate and 4,096-token safety margin.
- Saved test metadata now records context length, advertised completion ceiling, estimated input tokens, and the actual requested output-token cap.
- No Supabase migration required.


## V252.171
- Fixes Fiction Studio Series Development crash `Assignment to constant variable.` introduced in V252.170 when normalising Aion's generated Series Bible.
- No changes to Asunder identity, four-wife architecture, Aion sectioning, portraits, covers, or JSON/naming behaviour beyond this crash fix.


## V252.172
- Restores the proven Series Development contract used by the former Sol flow, with Aion as a drop-in replacement.
- Aion Series Development now uses a strict API-level JSON schema and a 6,500-token ceiling.
- Adds one narrow schema-constrained repair retry if the provider returns malformed structured output.
- Leaves deterministic naming, location/profession research, collision checks, Asunder four-wife rules, Aion production sections, portraits and covers unchanged.

## V252.174
- Fiction Studio X Book Development now uses strict API-level JSON schema output for the Aion Book Plan instead of a free-form JSON request.
- Book Plan output ceiling reduced to a focused 9,000 tokens with one schema-constrained retry on provider/formatting failure.
- Asunder four-woman cast design now also uses strict JSON schema output with one constrained retry.
- No changes to the four-wife format, invisible production-section architecture, naming/collision machinery, Venice portraits/covers, or one-click orchestration.

## V252.178
- Fiction Studio X now shares the normal Fiction Studio control flow wholesale for Series Development, Book Development, Sol seeding/reports, naming/research/validation, checkpoint/resume, human review, proofing and next-book seeding.
- The only model substitution is prose production: where normal Fiction Studio uses Luna to write/rewrite manuscript prose, Fiction Studio X uses Aion.
- Removed the abandoned Aion-only X planning/drafting/revision orchestration paths and their UI/status text.
- Asunder remains a bespoke layer keyed by `series_format_identity: asunder_fixed_four_story_identity_v1`.
- Asunder canonical wife portraits use Venice, retain the anti-airbrushed photorealism prompt, and again enforce the 9-characteristic variation gate (minimum 5/9 differences for every wife pair in a volume) before accepting the cast.

## V252.179
- Fixed Asunder canonical-wife portrait generation failing with `Invalid request parameters` at the Venice image stage. Venice's OpenAI-compatible image endpoint limits `prompt` to 1,500 characters; the prior helper allowed up to 4,500.
- Venice requests are now hard-capped at 1,500 characters.
- Reworked Asunder profile and cover prompts to be compact and canon-first so age/background/face/hair/eyes/complexion/figure/distinguishing features survive the provider limit, while retaining the real-skin / anti-airbrushed / anti-AI-doll direction and cast differentiation.
- No change to the normal Fiction Studio planning architecture, the 9-characteristic Asunder variation gate, or Aion's prose-only substitution in Fiction Studio X.


### V252.180
- Fixed Asunder canonical-name validation for international name order. The explicit `first_name` must match the story subtitle and occur in the canonical full name; family-name-first forms such as Japanese names no longer fail because the first whitespace token is a surname.


## V252.181
- Asunder international-script names now retain original script on the profile page with the standard Latin-script romanised form in brackets underneath.
- Asunder manuscript prose is locked to the Latin-script form for those characters.
- Existing non-Latin Asunder profiles missing the romanised fields are repaired on resume without changing the canonical character identity or portrait.


## V252.182
- Rebuilt Fiction Studio accounting for the shared normal/X pipeline.
- OpenRouter Aion prose calls now record provider-returned usage cost (published Aion 3.0 token pricing is the fallback).
- Venice Asunder profile/cover images now record the resolved Venice model and per-image USD price from Venice model metadata, with published-price fallback.
- Live book accounting and developer usage reports now reconcile costs by provider: OpenAI, OpenRouter and Venice.
- Corrected Fiction Studio X first-draft progress label to show Aion rather than stale Luna.

### V252.185
- Fiction Studio X Book Development model selector now includes **Aion (experimental)** alongside Luna, Sol and Astra.
- If Aion is selected, it owns the creative Book Development structured-planning calls and the five-part Asunder mini-chapter plan before Aion manuscript drafting.
- Backstage live web research and real-world validation remain on the established Luna web-tool helpers; selecting Aion does not remove those factual safeguards.
- Series Development model choices are unchanged.

## V252.186
- Restores an explicit Sol whole-story stitch/continuity audit after Asunder's five invisible Aion drafting chunks are assembled into each visible story.
- The stitch audit checks only chunk-boundary integrity: transitions, duplication, state continuity, viewpoint/tense, time/location continuity, repeated setup, progression resets and missing joins.
- If Sol finds a material seam defect, a Sol surgical-repair pass applies only the smallest necessary text patches; unaffected prose and story architecture are protected.
- The normal Sol style/anti-AI review then runs on the repaired manuscript (or directly on the first draft if the stitch audit passes cleanly).


## V252.187
- Makes Asunder canonical-profile writes idempotent using the existing `(parent_id, series_id, character_key)` unique key, so resumed/overlapping Book Development calls reuse/upsert the same profile instead of failing with a duplicate-key error.
- Fixes the Book Development screen to show **Develop & Generate Book** and actually continue directly into the automatic generation pipeline after planning completes.


## V252.189
- Asunder now preserves the full five-mini-chapter production map after each story is assembled, including labelled section plans and exact saved chunk text.
- Sol's stitch audit receives that labelled map and must identify exact mini-chapter numbers (and seam where relevant) for every repair.
- Stitch repairs are executed by Aion, not Sol, and are hard-limited to exact text originating in Sol-authorised mini-chapters; adjacent chunks are read-only context.
- The normal reader still sees one continuous story; mini-chapter boundaries remain internal production metadata only.

## V252.190

- Moves the Asunder five-part stitch/continuity gate from the end of the whole first draft to the end of EACH individual top-level story.
- Story N is now blocked from allowing Story N+1 to start until Sol has read the assembled five mini-chapters, approved the joins, or identified exact mini-chapter/seam defects for a targeted Aion repair.
- Aion stitch repair is limited to Sol-authorised mini-chapters; Sol then re-verifies the repaired story. Up to two targeted repair/verification cycles are allowed before the automatic pipeline pauses.
- Only after Sol approval is the verified story promoted as the canonical draft, its preserved mini-chapter map updated, and its continuity ledger rebuilt from the final repaired text. The next story therefore inherits continuity from the stable version rather than a pre-repair draft.
- Adds durable `asunder_stabilized_stories` checkpoints so resume cannot skip the per-story Sol gate after a connection loss.
- Removes the redundant end-of-volume stitch audit; the later whole-volume Sol pass remains style/anti-AI only.
- Aion remains available experimentally as the Book Development/chunk-planning model and now uses the OpenRouter structured-output route for the five-part split and continuity extraction instead of an OpenAI-only request path.

## V252.191

- Treats Asunder's four top-level stories as independent vignettes rather than novel chapters with narrative carry-over.
- Removes the intra-volume narrative continuity ledger from the Asunder five-part drafting path. Scene state, chronology, clothing, emotions, unresolved events and relationship state from Story N are not fed into Story N+1.
- After each vignette passes the per-story Sol stitch/continuity gate, Sol creates a compact **volume execution memory** describing how that finished vignette was actually executed: distinctive beats, scene shapes, initiation/control patterns, setting sequence, escalation shape and ending pattern.
- The compact execution memory is stored durably in `generation_state.asunder_volume_execution_memory` and supplied to both the selected Book Development/chunk-planning model and Aion for later vignettes in the same volume.
- The memory is explicitly anti-repetition context only. The approved Book Plan remains authoritative and always wins; later stories must not be redesigned merely to differ from earlier ones, and deliberate/relevant recurrence is allowed.
- Existing legacy Asunder book-level continuity ledgers are cleared when a vignette is assembled/stabilised so a resumed older run cannot accidentally leak narrative state into the next vignette.
- The five-part mini-chapter archive, Sol seam verification and targeted Aion repair remain unchanged.

## V252.192

- Simplifies the Asunder Fiction Studio X ending: after all four vignettes have passed their per-story Sol stitch gates, there is **no whole-volume Aion line/style rewrite, no AI proof rewrite and no human sign-off gate**.
- Sol now produces one compact final developer report on the finished four-story volume with deterministic word count, a brief summary, /10 ratings for overall quality, style/prose, erotic delivery, character distinctiveness, variation/anti-repetition, continuity/coherence and commercial/read-through potential, plus genuine remaining concerns and a short final verdict.
- Sol's final report is stored as developer metadata and is never inserted into the book reader.
- After the final report, Moonbeam runs the deterministic publication preflight automatically, locks the four verified draft stories as the final manuscript, generates the final Asunder cover automatically, and presents the completed reader with the cover, canonical illustrated wife-profile pages and the four stories.
- The reader uses the locked canonical draft directly; Asunder no longer needs a synthetic Line/style or Proof manuscript version merely to qualify as finished.
- Normal Fiction Studio's existing editorial/human-review workflow is unchanged.

## V252.193 — Asunder Venice visual audition
- Adds a developer-only **Audition hotter Venice visuals** action for existing Asunder volumes.
- Reuses the existing four canonical wife profiles and existing Book 1 manuscript; it does not rerun Book Development or rewrite prose.
- Sends Venice a stronger Asunder-specific profile brief: elite wife-sharing profile, deliberately hotter/sexually charged than mainstream dating/fashion imagery, provocative premium styling and pose, while remaining photorealistic and non-explicit.
- Generates four draft wife portraits plus a Venice-only draft cover when four manuscript stories are available.
- Draft assets are stored separately and do not replace canonical art until **Accept new visuals** is pressed.
- Comparison overlay shows current vs new portraits and current vs draft cover, with Accept, Regenerate again, and Keep old visuals actions.


## V252.194
- Asunder per-vignette Sol gate now combines five-part stitch/continuity review with targeted anti-AI/style review before each vignette is locked.
- Aion repairs only Sol-authorised mini-chapters for continuity and/or concrete style findings, then Sol verifies both before the next vignette starts.
- Deterministic Asunder house style converts drafting-model Markdown italics into clean canonical prose plus structured italic-span metadata, so the reader displays italics without raw asterisks. Spoken dialogue punctuation is preserved.


V252.195
- Added an Asunder series-page visual-set browser beside the Books panel.
- It shows three boxes per saved book: Originals, Regen 1 and Regen 2.
- Each box displays the full set of four profile portraits plus the matching cover.
- The browser reads saved Venice audition assets without altering canonical artwork.


V252.196
- Added a developer-only "Generate Prompt 3 profiles" action for Asunder books.
- Prompt 3 regenerates profile portraits only, with no cover generation and no manuscript changes.
- The Asunder series-page visual comparison panel now shows four boxes per book: Originals, Regen 1, Regen 2, and Prompt 3.
- Prompt 3 is designed to preserve natural, non-airbrushed realism while making the wives more vulnerable and sexy through styling, context and expression rather than generic AI glamour.


V252.197
- Fixed the Venice visual-set browser error caused by querying `storage.objects` through PostgREST. Storage object listing now uses the Supabase Storage API directly.
- Prompt 3 images now save into a dedicated private `fiction-studio/asunder-chat-review/.../prompt3/...` folder.
- Each Prompt 3 manifest stores exact storage paths plus 7-day signed review URLs in the book generation state, allowing the images to be retrieved for review in ChatGPT without making the storage bucket public.
- Added a backend mode to refresh the signed review links without regenerating or changing the images.
- The series-page Prompt 3 box reads from the saved manifest rather than scanning the storage schema.


V252.198
- Added an isolated Asunder “Prompt 4” portrait experiment; manuscript and cover are untouched.
- Prompt 4 returns to the original natural, dressed photographic direction. Natural non-airbrushed realism is the highest-priority instruction.
- The four portraits deliberately vary source and setting: two partner/husband-taken phone portraits (more dressed, relaxed and preferably smiling) and two wife-taken selfies (more playful/flirtatious and somewhat more provocative, but non-explicit and not nude).
- Backgrounds are deliberately varied across outdoor/daylight, everyday/travel and private selfie contexts rather than a matching hotel/interior campaign.
- Prompt 4 images save to the private asunder-chat-review/prompt4 folder with seven-day signed review links.
- The Asunder series page now displays a fifth comparison box labelled Prompt 4.


V252.199
- Added isolated Asunder Prompt 5 portrait experiment.
- Prompt 5 removes selfies, pouting and kiss-blowing entirely.
- All four portraits are husband/partner-taken casual phone photographs with natural smiles: toothy, laughing, shy or warm/open.
- Natural non-airbrushed realism remains the highest-priority visual instruction.
- Backgrounds remain deliberately varied across indoor, outdoor, everyday and travel-like settings.
- Prompt 5 touches neither manuscript nor cover and saves to the private asunder-chat-review/prompt5 folder with signed review links.
- The Asunder series visual browser now shows a Prompt 5 comparison box.


V252.200
- Fixed broken Prompt 5 thumbnails in the Asunder series visual-set browser.
- Prompt 5 now renders through the same authenticated server-side Storage download -> data URL path already used successfully by Prompt 3 and Prompt 4.
- Signed Prompt 5 review links are still retained in the saved manifest for external/chat-review use, but are no longer used directly as browser <img> sources.
- No images are regenerated and no manuscript or cover data is changed.


## V252.201
- Prompt 5 is now the canonical/default Asunder profile-image generation direction.
- Standard Asunder profile creation now uses the natural husband/partner-taken smiling portrait brief automatically, with non-airbrushed realism, varied believable backgrounds and no pouting/selfie glamour logic.
- Removed the temporary experimental Asunder image UI from the series and book pages (no more Prompt 3/4/5 experiment controls or visual-set comparison panel in the normal workflow).
- Existing experimental backend manifests remain harmlessly readable, but routine production now uses the locked-in Prompt 5 architecture by default.


## V252.202
- Replaced the old four-panel Asunder final cover with the definitive single-wife aftermath architecture.
- Every volume cover now uses the wife from Story N.1 only, avoiding ambiguity over which character is being illustrated.
- Her saved canonical Asunder portrait is passed as the binding image-generation reference so the cover woman remains the same person as her profile image.
- Luna extracts the cover moment from the finished Story 1 manuscript and treats concrete story facts as binding, including clothing colour/type, shoes, jewellery, location and departure context.
- The cover scene is explicitly after the encounter and on the way home: leaving the venue/hotel, travelling after departure, being dropped off, or approaching home, according to the actual story. It is never a sex scene or immediate bedroom aftermath.
- Non-explicit aftermath cues may include mussed hair, smudged makeup, flushed skin, rumpled/displaced clothing, heels in hand and an emotionally affected expression, while explicit nudity, sexual activity and bodily fluids are prohibited in the cover art.
- Image composition reserves a calm top 22% title-safe zone and bottom 12% author-safe zone; the wife's face must remain entirely outside the title zone and fully visible.
- Moonbeam deterministically overlays ASUNDER, VOLUME N and ANA ROJAS using Georgia / Times New Roman serif typography.
- Final cover metadata records the Story 1 wife, canonical portrait path, story number and extracted art-direction brief.


## V252.203
- Asunder per-story gates can no longer deadlock after two targeted Aion repairs.
- If Sol still reports only local continuity/assembly or concentrated anti-AI/style defects after both Aion repair passes, Sol now performs one final **continuity-only surgical micro-patch** against its own latest findings.
- The Sol fallback uses the existing exact-text patch machinery and preserved mini-chapter locators; surrounding prose is read-only and explicit/erotic content is specifically protected from broad rewriting, softening, euphemising, shortening or sanitising.
- A successful Sol fallback locks the vignette immediately **without another subjective style-review loop**, then the automatic pipeline proceeds to the next story.
- The existing hard stop remains for genuine technical failures (missing manuscript/chunk, unsafe patch mismatch, corrupt state, model/API failure, etc.).
- Existing paused Asunder books migrate naturally: pressing Resume reuses the saved two Aion repair/verification checkpoints, enters the Sol fallback, locks the repaired story and continues instead of repeating the same pause.


## V252.211

- Added **manual wife insertion at Book Development** for Asunder volumes.
- You can now optionally seed **Vignettes 1–4** with a brief and a pasted/dropped/uploaded image.
- Moonbeam now uses a **two-step image path** for these manual wife seeds:
  1. source image → clean canonical wife image
  2. canonical wife image → final Asunder profile photo
- Manual wife anchors are persisted into the resumable Book Development pipeline and are applied both to story planning and to canonical profile creation.
- Reference-image handling remains opt-in and is intended for fictional/synthetic images or references you have permission to use.


## V252.212 — Aion drafts, Sol repairs

- Simplified the Asunder vignette pipeline: **Aion now writes the five first-draft chunks only. Sol owns all post-draft continuity and anti-AI repair.**
- Removed the full-vignette Aion revision pass. Sol now applies narrow **exact-text surgical patches** against the assembled vignette.
- Sol receives the whole vignette and preserved five-chunk map for continuity awareness, but may edit only the chunk locations authorised by her review.
- The erotic-content shield now protects **both** Sol's primary surgical edit and any final cleanup, not merely the old fallback pass.
- Protected erotic paragraphs reject unsafe word-level rewrites; punctuation/spacing cleanup remains allowed. This is specifically intended to preserve Aion's explicit sexual substance while allowing Sol to remove em-dash excess, repeated “not X / but Y” constructions, triplet rhythm, stock phrasing and bad chunk joins.
- New flow: **Aion 5-chunk draft → Sol review → Sol protected surgical edit if needed → Sol verification → one protected Sol cleanup only if objective findings remain → lock.**
- If Sol's first review approves the vignette and the deterministic scan is below thresholds, the vignette locks without any repair pass.
- No whole-vignette rewrite is performed after Aion's draft.


## V252.213

- Fixed Book Development crash when a manual wife reference image is supplied.
- The shared Asunder reference-image helpers are now initialized before the Book Development route can call them, removing the JavaScript temporal-dead-zone error: `Cannot access 'fictionAsunderReferenceImage252209' before initialization`.
- No database migration required. Existing planning checkpoints remain valid.


## V252.214

- Book Development no longer dies when a prohibited AI-default name slips through.
- Banned names such as `Cross` are converted to an internal character marker, checkpointed, and passed through the existing backstage demographic naming engine for automatic replacement.
- No database migration required.


## V252.215

- Removed the obsolete fatal `petite: true` gate from Asunder profile generation.
- Harmonised Asunder planning and profile instructions: automatically generated wives must be slim/slender/lean/fine-boned, but may be short, average-height or tall.
- `petite` is now descriptive metadata only, not a pass/fail requirement.
- Manual wife briefs/reference images still override the automatic-wife body-build default for that one slot.
- Added a deterministic profile-stage normaliser: if a creative model nevertheless returns a broad/stocky/heavy/strong build for an automatic wife, only the build field is normalised to a slim-family description instead of killing Book Development.
- Removed conflicting replacement-vignette language that previously encouraged broader/stronger automatic body types for visual variation.
- Updated image/cover prompts to preserve canonical proportions rather than forcing petite proportions.
- Updated Asunder wording from “younger/young wife” to “adult wife” so older manual wives do not conflict with the fixed-format instructions.


## V252.216 — Permanent Asunder Wife Library
- Added a permanent Wife Library to the Asunder series page.
- Generate one or four canonical wives at any time with deterministic backstage naming, canonical details and a profile portrait.
- Wife generation is independent of books; unused wives remain available for future volumes.
- Library cards show volume/vignette appearance history and a compact summary.
- New Asunder volumes begin by selecting exactly four Wife Library records in vignette order; Wife 1 is also the cover wife.
- Book Development receives those four wives as immutable cast input and may not invent/recast them.
- Removed the active per-book manual-wife UI and hid finished-volume replacement; cast commitment now happens at the start.
- Existing canonical profiles automatically populate the library.
- Automatic wife generation uses slim/slender/lean/fine-boned builds with variable height; petite is descriptive only.

## V252.217
- Fixed Asunder Wife Library portraits not loading. Supabase Storage signed URLs are now resolved against `/storage/v1`, including already-existing wife portraits and other Asunder signed-image review surfaces.
