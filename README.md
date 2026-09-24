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


## V251.29
- Keeps the V251.28 4,000-token concept-builder allowance.
- Strengthens concept, storyboard and final-author guidance for comedy, excitement, suspense and age-appropriate safe peril without changing the generation pipeline.
