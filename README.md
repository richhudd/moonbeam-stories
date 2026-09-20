# Moonbeam Stories V250.47

## V250.47 — reliable login restoration

- Retries initial Supabase session restoration before deciding that no login exists.
- Does not turn a temporary session-check or network error into a false logout.
- Clears the signed-in interface only after Supabase emits an actual `SIGNED_OUT` event or repeated checks confirm there is no stored session.
- Preserves the existing account state if the Account page encounters a temporary authentication error.
- Stops hiding authentication errors behind an empty access token.
- Retains the V250.45 refresh-and-retry path and the V250.46 illustration prefetch buffer.
- No Supabase migration is required.

## V250.46 — two-page illustration prefetch buffer

- Starts the opening page and the following two illustrations while the cover is being viewed.
- Keeps the next two pages queued whenever a story page is displayed.
- Preserves the existing continuity order while starting each dependent generation at the earliest possible moment.
- Fixes the previous prefetch helper, whose `ahead` argument was accepted but ignored.
- Does not add or change any creative illustration-prompt instructions.
- No Supabase migration is required.

## V250.45 — resilient session refresh during illustration generation

- If an illustration request is rejected with HTTP 401, the browser explicitly refreshes the Supabase session and retries the request once.
- Concurrent background illustration requests share one refresh operation, preventing competing refresh-token rotations.
- A genuine invalid session still asks the parent to sign in again.
- Temporary Supabase authentication-service failures are no longer misreported as an expired login.
- No Supabase migration is required.

## V250.44 — prompt cleanup and distinct page sources

- Removes the unsuccessful V250.43 numerical composition rules and consolidates visual direction into a short hierarchy.
- Stops the first story page borrowing the following page's illustration prompt, and stops the final page borrowing the preceding page's prompt.
- Removes previous-page prose from the current illustration request so the model is not asked to illustrate two consecutive events at once.
- Simplifies the cover to one coherent moment and forbids duplicated buildings, mixed interior/exterior viewpoints and cutaway composites.
- Keeps previous artwork only when adjacent story sources are sufficiently different; closely overlapping scenes rely on the written continuity bible instead of a composition-anchoring image.
- Requires each story page to advance to a new event without numerical shot quotas or formulaic staging requirements.
- Uses a new illustration cache version. No Supabase migration is required.

## V250.43 — distinct visual storytelling across pages

- Requires every page prompt to define a concrete, page-specific action, focal subject, viewpoint, character staging and visible area of the established setting.
- Neighbouring pages must differ in at least three of those storyboard dimensions while remaining faithful to the prose.
- The image generator compares against the previous artwork and rejects superficial variation such as a closer crop, reversed arrangement or minor pose change.
- Consecutive scenes in one location now reveal a genuinely different part, scale or perspective without redesigning recurring buildings, machinery or objects.
- Uses a new illustration cache version so artwork generated under the earlier composition rules is not reused.
- No Supabase migration is required.

## V250.42 — recurring world and object continuity

- Sends the immediately preceding page artwork to the next illustration request as an authoritative continuity reference.
- Keeps recurring locations, buildings, machines and plot-important objects stable while still allowing a new camera angle and composition.
- Expands story planning with a fixed World Model Sheet covering count, architecture, proportions, materials, layout and distinctive parts.
- Prevents cases such as one lighthouse becoming two or the same wheel changing design on every page.
- Uses a new illustration cache version so old inconsistent artwork is not silently reused for newly generated stories.
- No Supabase migration is required.

## V250.41 — reliable developer-only Instagram end-page action

- Repairs the developer-only **Post to Instagram** control on the owner’s final **The End** page.
- The end page now completes a fresh, non-cached server verification and mounts the button immediately after developer access is confirmed, even when authentication and story restoration finish in a different order.
- Temporary network or server failures no longer become a permanent false “not developer” result for the session; the check can recover when the end page is reached.
- Explicit unauthorised responses remain denied, shared stories never receive the control, and ordinary accounts retain exactly the existing Save Story, Share Story and New Story actions.
- Instagram credentials remain server-side. Publishing still requires the same `MOONBEAM_DEVELOPER_EMAIL` verification and the existing cover-preview approval step.
- No Supabase migration is required.

# Moonbeam Stories V250.25

## V250.20 — desktop homepage cleanup

- Removes the redundant **Sign in** button from the desktop homepage title bar.
- The existing **Create their story** button remains the single homepage entry point: signed-out users continue into authentication, while signed-in users continue directly into story setup.
- Mobile behaviour is unchanged.
- No Supabase schema change or SQL is required.


## V250.19 — mobile shared End page + Cast selector fit
- Built directly from V250.18 Save Reliability.
- Shared books on mobile portrait now keep the white Previous-page control in its existing fixed reader position while the “Create my story” CTA remains inside the normal vertically scrollable End-page content.
- The shared mobile portrait End composition is tightened: “The End” is moderately reduced and the stars, flourish, conversion copy and CTA are shifted upward so the CTA is clear of the fixed Previous control at the initial scroll position.
- Mobile Cast role selectors are constrained and centred within their panels in both orientations; the two-column layout is retained, cards/photos/selection circles are slightly reduced where needed, and long labels cannot force the grid beyond the viewport.
- Desktop reader/setup, mobile non-shared End pages, save reliability, persistent saved-art cache, story generation, illustrations, credits, sharing, legal pages and database schema are unchanged.
- No Supabase SQL required.

# Moonbeam Stories V250.18

## V250.18 — save reliability / interrupted-save recovery
- Built directly from V250.17 Saved-Art Persistent Cache.
- Keeps the existing translated “Please don’t close or leave this page until saving is complete.” wording, but makes the active save warning large, fixed, high-contrast and gently pulsing on desktop and mobile for the full save operation. The existing end-page warning is strengthened too.
- Adds a local pending-save marker immediately after the `saved_stories` row is created and before artwork upload begins.
- If the browser is refreshed, closed or navigated away while artwork is uploading, the normal V201 story draft and generated-image IndexedDB cache remain intact. On the next restoration of that same story/account, Moonbeam automatically resumes the existing saved-story upload instead of creating a second saved-story row.
- Pressing Save again on a matching interrupted draft also resumes the same save.
- Resume verifies that the pending database row still belongs to the signed-in account, re-uploads/repairs the complete cover/page set, verifies `saved_assets`, then marks the book saved and clears the draft/pending marker.
- If resume itself cannot complete, the pending marker is retained so another retry remains possible. Supabase remains authoritative; no schema change is required.
- Existing `beforeunload` protection, Moonbeam navigation blocking, V250.17 saved-art cache, story generation, illustration generation, Cast, credits, sharing, reader, narration, payments and legal pages are otherwise unchanged.
- No Supabase SQL required.

# Moonbeam Stories V250.17

## V250.17 — persistent saved-art cache
- Built directly from V250.16 Generation Freedom.
- Saved-book covers and page illustrations now check a dedicated IndexedDB cache before downloading from the private Supabase `saved-story-art` bucket.
- On a cache miss, the existing Supabase download remains the fallback; a successful download is cached locally for later visits. Cache failure never blocks the Supabase path.
- Shared-link artwork is deliberately unchanged and continues through the existing authenticated share API.
- Saved-art cache keys are scoped to the signed-in user and exact Storage path, preventing cross-account or cross-book collisions.
- Deleting a cloud story also removes its local saved-art cache entries and revokes any in-memory library-cover URL.
- The existing generated-illustration cache and legacy `recoverMissingSavedStoryArt()` migration path are unchanged; saved cloud artwork uses a separate IndexedDB object store so it cannot evict generation/recovery entries.
- No Supabase schema/SQL, API, story generation, illustration generation, Cast, credits, reader layout, sharing, legal or localization changes.

## Moonbeam Stories V250.16

## V250.16 — generation freedom / bias cleanup
- Built directly from V250.15.
- Removes repeated creative wording that over-emphasised surprise, impossibility, wonder and extraordinary events, which could bias blank generations toward ordinary modern settings disrupted by strange physical phenomena. No anti-weather rule, genre lottery or replacement story formula is added.
- Clarifies that selected Cast have fixed supplied identities but are not locked to fixed fictional roles or everyday contemporary circumstances. When the parent has not specified otherwise, period, story world, social context, clothing, role, status, abilities and story-required fictional transformations may arise naturally from the story.
- Narrows the legacy V196 name lock: supplied personal names remain exact and the generator still cannot invent surnames, middle names, nicknames, pet names or other personal names, while fictional titles, ranks, roles and forms of address are now permitted when natural to the story.
- Keeps supplied reference photos authoritative for underlying recognisable physical identity while allowing story-world costume, role, abilities and fictional characteristics without treating those as a conflicting identity.
- Applies the narrowed name/identity rules to the JSON repair path so repair cannot restore the old restriction.
- Story safety, age suitability, Cast membership/limits, Story Idea authority, language/output contract, illustration rendering system, UI/layout, auth, Supabase, credits, saving, sharing, reader, narration, payments and legal documents are unchanged. No SQL required.

# Moonbeam Stories V250.15

## V250.15 — illustration expression, scene clarity + recurring visual continuity
- Built directly from the deployed V250.13 creative-story-cleanup baseline. V250.14 is not used.
- Keeps the current Moonbeam illustration rendering style and existing Cast/photo identity-reference architecture unchanged.
- Reference-photo expressions are no longer treated as fixed poses. Expressions may follow the story, but the illustrator must not invent unseen personal facial information: a closed-mouth reference must not acquire invented visible teeth/open-mouth smile; an observed toothy smile may be used when appropriate but is not compulsory.
- Illustrations now treat page text as context rather than a checklist: choose one strong coherent illustrative moment and, where useful, one or two distinctive supporting details instead of cramming every described item or action into the image.
- Distinctive recurring objects, vehicles, machines, buildings, creatures and important environments now keep their established defining visual characteristics across the book while still allowing genuine story-driven changes and different viewpoints.
- Story generation, current rendering style, Cast limits, UI/layout, auth, Supabase, credits, saving, sharing, reader, narration, payments and legal documents are unchanged. No SQL required.

# Moonbeam Stories V250.13

## V250.13 — creative story-engine cleanup
- Built directly from V250.12.
- Stage 1 changes story generation only. Illustration generation is deliberately unchanged for the separate Stage 2 reintegration.
- Removes the V191-era random story-family blueprint system, including strict-realism/magic classifications, fixed settings and plot engines, generated companion types, special objects, impossible-rule limits, naming modes, prescribed twists and ending types.
- Replaces that machinery with a compact creative brief: fantasy, magic, absurdity, realism, science fiction and other possibilities are all available, but none is compulsory. Blank Story Ideas are invented freely rather than assembled from fixed ingredient pools.
- Removes behavioural choreography that treated supporting adults as characters who should stand back while child heroes solve the central challenge. Hero/Supporting Cast now describe narrative prominence only; behaviour and agency arise naturally from the story.
- Preserves the authoritative closed Cast, exact names, maximum-two-Cast server validation, parent Story Idea authority, age suitability, language guidance, output/page contract, character/photo identity continuity and illustration-prompt contract.
- Simplifies narrative/visual progression instructions so the story must develop but is not forced through camera-driven or predetermined beats. The JSON repair path uses the same cleaned creative assumptions and cannot reinstate the deleted blueprint.
- No illustration-style changes, UI/layout changes, auth, Supabase, credits, saving, sharing, reader, narration, payment or database changes. No SQL required.

# Moonbeam Stories V250.12

## V250.12 — Desktop text labels removed + saved-book loading wording

Built directly from V250.11. On desktop, the in-page story labels such as ‘THE BEGINNING’ and ‘PAGE 1’ are hidden; the bottom reader page counter remains. Saved books now show ‘Loading your book…’ (localized across all nine supported languages) while their existing cover asset loads, rather than wording that implies the cover is being generated. Mobile text-page labels and new-book cover-generation wording are unchanged. No Supabase schema change.

---

# Moonbeam Stories V250.11

## V250.11 — Desktop in-page numbers removed

Built directly from V250.10. On desktop only, the redundant page numbers printed inside the book pages are hidden; the existing bottom page counter remains unchanged. Mobile portrait and landscape reader behaviour is unchanged. No Supabase schema change.

# Moonbeam Stories V250.10

## V250.10 — Desktop photo drag-and-drop restored + Cast selection note removed

Built directly from V250.9. Restores desktop drag-and-drop to the current Add photo / Change photo Cast editor: dropping a JPG, PNG or WebP onto the existing photo area uses the same resize/save path as choosing a file. Mobile photo-picker behaviour is unchanged. Removes the ‘Selected for the current story’ note from child Cast profile cards. No Supabase schema change.

# Moonbeam Stories V250.9

## V250.9 — Two-Hero Cover Dedication

Built directly from V250.8.

- Cover dedication uses all selected Heroes (up to two).
- One-Hero covers remain unchanged.
- Two Hero names are joined naturally in all nine supported languages.
- Supporting Cast is never included.
- Older saved books fall back safely to their original primary child name.
- No Supabase schema change.

# Moonbeam Stories V250.8

## V250.8 — Adult relationship field removed

Built directly from working V250.7.

- Removed the Relationship field from adult Cast add/edit UI.
- Adult Cast cards and story-role selection no longer display stored relationship text.
- New/edited adult profiles no longer write relationship data; the existing Supabase column is retained for schema compatibility, so no migration is required.
- Story generation no longer receives or relies on adult Cast relationship metadata. If a relationship matters to a story, it can still be stated naturally in the Story Idea.
- All V250.7 functionality is otherwise preserved.

Built directly from the working V250.6.

- Replaced the grey story-idea examples in all nine languages so they describe adventure ideas only, do not mention family relationships, and do not suggest more than two story characters.
- Added a clear Edit profile action to every Cast member menu, including children. Editing updates the existing `cast_members` record in place, so the same profile ID, photo and stored identity remain attached to that Cast member.
- Existing saved stories are not rewritten when a Cast member is renamed.
- All V250.6 behaviour is otherwise preserved.
- No Supabase schema change.

# Moonbeam Stories V250.6

## V250.6 — Mobile landscape end-page vertical scrolling

- Extends the proven V250.5 End-page vertical scrolling behaviour to coarse-pointer mobile/tablet landscape readers.
- Desktop reader behaviour is unchanged.
- Portrait mobile behaviour from V250.5 is preserved.
- No API, Supabase, story, image, Cast, account, credit, sharing or generation changes.

## V250.5 — Mobile end-page vertical scrolling

Built directly from the working V250.4. On portrait mobile only, The End page can now scroll vertically whenever its content is taller than the available viewport. The existing V250.4 two-Cast limit and V250.3 rebuilt shared-story mobile Create my story button are preserved. Desktop reader behaviour is unchanged. No Supabase schema change.

---

# Moonbeam Stories V250.4

## V250.4 — two-Cast story limit

Built directly from V250.3. The story-role selector has been rebuilt around one rule: each story may use a maximum of two selected Cast members, with at least one Hero. Valid selections are one Hero, two Heroes, or one Hero plus one Supporting Cast member. The rule is stated explicitly on the page in all nine supported locales. Once the permitted selection is full, remaining choices are disabled rather than allowing an invalid combination. The generation API also rejects more than two Cast members as a server-side safeguard. Cast-library size is unchanged: users may still store any number of children, adults and pets and choose up to two for a particular story. No Supabase schema change is required.

# Moonbeam Stories V250.3

## V250.3 — Mobile shared-story button replacement

Built directly from V250.2. Desktop shared-story behaviour is unchanged. On mobile only, the end-page “Create my story” control inside the swipe-controlled reader is hidden and replaced by a new fixed native button mounted directly under `document.body`, above and outside the reader interaction layer. The button navigates directly to the existing Moonbeam create-story destination. No story generation, image generation, Cast, account, credit, Supabase, sharing-data, or desktop reader logic is changed. No SQL required.

# Moonbeam Stories V250.2

## V250.2 — mobile shared-story end-page interaction fix

Built directly from V250.1. Public functionality is unchanged except for the mobile shared-story end page. The mobile reader swipe handler now stands down completely on The End and ignores touches that begin on interactive controls. This lets the existing native “Create my story” link receive the same ordinary browser interaction it already receives on desktop. No story generation, image generation, Cast, accounts, credits, Supabase, reader content, sharing data, or API behaviour has been changed. No Supabase schema change is required.

# Moonbeam Stories V250.1

## V250.1 — mobile shared-story “Create my story” link fix
- Built directly from the clean V250 package.
- Removes only the JavaScript click interception on the shared-story end-page “Create my story” link.
- The link now follows its existing native `href`, avoiding the mobile navigation failure while preserving the same destination.
- Desktop shared-story behaviour, story/image generation, accounts, Cast, credits, reader, sharing, Supabase and all other functionality are unchanged.
- No Supabase schema change required.

# Moonbeam Stories V250

## V250 — authoritative Cast identity + closed principal cast
- Built directly from V249.
- Makes every supplied Cast photo an authoritative named identity reference, with equal identity strength for children, adults and pets. A photographed adult must not be replaced by an invented lookalike or reused later as a different extra person.
- Strengthens illustration continuity so photo identity overrides conflicting invented character descriptions while preserving the fixed Moonbeam house style.
- Makes the selected Heroes + Supporting Cast the complete principal story cast. The story generator must not invent extra named, recurring, familial, companion, friend, helper, rival or plot-significant characters.
- Setting-appropriate anonymous background people remain allowed, but must stay incidental and cannot become a new family unit or take over a selected Cast member's story function.
- Applies the same closed-cast and photo-identity constraints to the JSON repair path.
- No Supabase schema change required.

# Moonbeam Stories V249

## V249 — multi-reference illustration request fix
- Built directly from the 44-file V248 Complete Final package.
- Fixes the reproducible OpenAI image-edit failure `Duplicate parameter: image` when more than one Cast member has a reference photo.
- Multiple Cast reference photos are now submitted using the API array field `image[]` rather than repeated singular `image` fields.
- No story-generation, Cast selection, Supabase schema, reader, save, auth, homepage, localisation or illustration-style changes.
- No new Supabase migration is required.

# Moonbeam Stories V246

## V245 — localised legal documents
- Built directly from the confirmed-good V244.
- Rewrites Privacy, Terms and Refunds with clearer separation and parent-friendly photo ownership language.
- All three legal documents are fully localised for the same nine Moonbeam locales.
- Legal footers use four distinct links: Privacy, Terms, Refunds and Contact.
- Preserves V243 mobile legal-page scrolling.
- No app, auth, setup, generation, credits, Saved Stories, reader or Supabase schema changes.

# Moonbeam Stories V244

## V244 — scrollable explanatory homepage
- Built directly from V243.
- Preserves the existing hero and makes only the public homepage vertically scrollable.
- Adds How it works, photo personalisation, family/privacy trust and final CTA sections.
- New homepage copy is localised across all nine Moonbeam locales.
- No legal, setup, Cast, auth or generation changes.

# Moonbeam Stories V243

## V243 — mobile legal-page scrolling
- Built directly from V242.
- Restores native vertical scrolling on Privacy, Terms and Refunds in phone portrait.
- The fix is isolated to standalone legal pages and does not alter the app setup or reader.
- No Supabase schema change.

# Moonbeam Stories V242

## V242 — fixed Moonbeam all-time cost start
- Built directly from V241.
- Defines Moonbeam “All-time” as 8 September 2026 00:00 BST (7 September 2026 23:00 UTC) through now.
- All-time stories, images and narrations now use that same fixed start.
- All-time OpenAI cost queries the Costs API over that same fixed period.
- All-time cost/story is therefore cost and successful story count over the same fixed period.
- Keeps Since baseline, This month, Today and Last 7 days.
- Keeps Users and generation support log.
- No Supabase schema change.
- Leaves parked desktop Account logout and mobile child-strip issues untouched.

# Moonbeam Stories V241

## V241 — verifiable OpenAI cost windows
- Built directly from V240.
- Adds “This month” between Since baseline and Today.
- “This month” queries OpenAI Costs from the start of the current UTC month to now, so September can be compared directly with OpenAI Platform's September spend.
- Removes the misleading All-time OpenAI cost and cost/story values; all-time Moonbeam activity remains visible, but those two cost cells show “—”.
- Keeps Since baseline, Today and Last 7 days as explicit reporting windows.
- Keeps the V240 Users table and V239 generation support log.
- No Supabase schema change.
- Leaves the parked desktop Account logout and mobile child-strip issues untouched.

# Moonbeam Stories V240

## V240 — visible usage tables + registered users table
- Built directly from V239.
- Fixes the V239 display bug where table body text inherited a very light global text colour and became invisible on white table cells.
- Explicitly sets readable dark text on the economics, support and users tables.
- Adds a private developer-only Users section to `/usage.html`.
- Users table shows: account email, joined date/time, last sign-in, successful stories generated, and last generation time.
- Story counts are derived from existing `story` usage events matched by `metadata.user_id`.
- Does not expose passwords, story text or user prompts.
- Keeps the economics table with columns: All-time, Since baseline, Today, Last 7 days.
- Keeps the baseline at 14 September 2026 21:25:06 UTC / 22:25:06 BST.
- Keeps the generation support trail introduced in V239.
- No Supabase schema change required.
- Leaves the parked desktop Account logout and mobile child-strip issues untouched.

# Moonbeam Stories V239

## V239 — economics table + generation support trail
- Built from V238, which itself was built from clean V231.
- Leaves the parked desktop Account logout and mobile child-strip issues untouched.
- Replaces the usage summary cards with a separate economics table.
- Economics columns: All-time, Since baseline, Today, Last 7 days. “Since baseline” is immediately next to All-time.
- Rows: stories, images, narrations, actual OpenAI cost, actual cost/story.
- Uses the same OpenAI Costs API connection introduced in V238.
- Adds a developer-only generation support log for new generation attempts from V239 onward.
- Support log records: account email (resolved server-side from user ID), timestamp, success/failure, whether a credit was deducted/refunded, generation run ID internally, error code, image count field and duration.
- Does NOT store story text or user prompts in the support log.
- Uses the existing api_usage_events table; no Supabase schema change required.
- Historical story/image/narration usage remains intact.
- Baseline remains 14 September 2026 21:25:06 UTC / 22:25:06 BST.
- No reader, save, child-strip, Account UI, story content, illustration style or narration behaviour changed.

# Moonbeam Stories V238

## V238 — live OpenAI cost-per-story dashboard, built from clean V231
- Built directly from the clean V231 baseline. None of the abandoned V232–V237 logout experiments are included.
- Leaves the two parked issues untouched: desktop Account logout and mobile child-strip swiping.
- Preserves all historical Moonbeam usage counts.
- Adds a separate “Cost tracking — since baseline” section to `/usage.html`.
- Baseline is 14 September 2026 at 21:25:06 UTC (22:25:06 BST), with optional override via `MOONBEAM_USAGE_BASELINE_UTC`.
- Since-baseline counters start independently from the historical totals and count stories, images and narrations from Supabase usage events.
- Connects the developer-only usage endpoint to OpenAI’s organisation Costs API.
- Shows live OpenAI cost in USD and calculates actual cost/story using the same baseline period.
- Requires a Vercel environment variable `OPENAI_ADMIN_KEY` containing an OpenAI Admin API key.
- Optional: set `OPENAI_PROJECT_ID` to restrict cost reporting to the Moonbeam OpenAI project. Without it, the dashboard reports organisation-wide OpenAI cost since the baseline.
- If `OPENAI_ADMIN_KEY` is missing or rejected, the dashboard shows a clear “not connected yet” message instead of a fake `$0.0000`.
- No Supabase schema change required.
- No story-generation, illustration, narration, reader, credits, save, auth or child-strip logic changed.

# Moonbeam Stories V231

## V231 — Account is no longer signed-in-only
- Built directly from the clean V230 branch.
- Decouples Account from the setup-page login flow and from the signed-in-only navigation state.
- Account is now always reachable from both desktop and mobile navigation.
- Opening Account while signed out shows the Account login form directly.
- Opening Account while signed in shows the normal account details, credits, password and sign-out controls.
- Signing out while on Account keeps the user on Account and switches the same page to the login form.
- Account no longer depends on having first authenticated through the setup page.
- Existing setup-page login remains available and unchanged.
- V227 child-profile swipe work and all story-generation, reader, save, API and Supabase schema logic remain unchanged.

# Moonbeam Stories V230

## V230 — desktop Account uses a valid-session test, not a merely truthy user object
- Built directly from the clean V229 branch.
- Fixes the desktop Account state shown in the screenshot: Parent account badge, blank email, 0 credits and a Sign out button even though there is no usable signed-in account.
- Account now treats a session as signed in only when the Supabase user has both a real user ID and email address.
- Any incomplete/stale in-memory user object is treated as signed out, so the email/password login panel is shown instead of the signed-in controls.
- The same valid-session test is used when deciding whether to persist the Account section and when re-checking Supabase on Account open.
- Mobile Account login behaviour remains unchanged.
- V227 child-profile swipe work and all story-generation/reader/save/API logic remain unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V229

## V229 — desktop Account session-state correction
- Built directly from the clean V228 branch.
- Fixes desktop Account remaining in the stale signed-in layout after sign-out while mobile correctly showed the login form.
- Every time Account is opened, Moonbeam now asks Supabase for the actual current session and renders the Account panel from that source of truth.
- If there is no session, Account immediately shows the signed-out email/password login form and clears stale credit display.
- If a valid session exists, Account keeps the signed-in controls and refreshes visible credit data when needed.
- Sign-out now clears the in-memory user and credit state immediately before any asynchronous cleanup, so desktop cannot remain on the old signed-in layout.
- V228 null-credit correction, V227 mobile child swipe and V226 Account login form remain intact.
- No story-generation, reader, save, API or Supabase schema logic changed.

# Moonbeam Stories V228

## V228 — Account sign-out reliably becomes sign-in
- Built directly from the clean V227 branch.
- Fixes the stale Account state shown after signing out: blank email, 0 credits and a lingering Sign out button.
- After Supabase sign-out succeeds, Moonbeam now immediately reconciles local auth state and keeps the user on Account, where the signed-out email/password login panel is shown.
- Signed-out Account rendering happens before nonessential child-photo cleanup, so an unrelated cleanup failure cannot leave signed-in Account controls visible.
- Fixes a separate null-credit rendering bug where `null` was being converted to numeric `0`; signed-out/unknown credit state now remains null rather than falsely showing “0 credits remaining”.
- V227 mobile child-strip swipe handling and V226 Account login form remain intact.
- No story-generation, reader, save, API or Supabase schema logic changed.

# Moonbeam Stories V227

## V227 — reliable mobile child-strip swipe
- Built directly from the clean V226 branch.
- Keeps the full-width isolated child-profile viewport introduced in the clean V225 rebuild.
- Adds touch handling to that viewport itself, not to the child-card track and not to the setup page.
- A clearly horizontal finger drag moves only the child strip.
- A vertical drag, including one that starts over a child card, is left untouched so the surrounding setup page can continue to scroll vertically.
- The strip position follows the finger directly and continues to use the existing desktop overflow/arrow-state logic.
- No authentication, story-generation, credits, save, reader, API or Supabase schema logic changed.
- V226 Account sign-in/sign-out improvements remain intact.

# Moonbeam Stories V226

## V226 — sign back in from Account
- Built directly from the clean V225-from-V224 branch.
- Account remains accessible after signing out instead of redirecting the user to the Create Story setup screen.
- Signed-out Account now shows its own email/password sign-in form.
- Pressing Enter in the password field also signs in.
- Forgot password works directly from the signed-out Account view using the entered email address.
- After successful sign-in the same Account page switches back to the normal signed-in account details, credits, password and session controls.
- All new Account login labels/messages are translated across all nine supported locales.
- No story-generation, credit, reader, save, API or Supabase schema logic changed.
- The clean V225 mobile child-strip and setup scrolling work is preserved.
- No Supabase SQL/schema change required.

# Moonbeam Stories V225

## V225 — clean rebuild from V224: mobile setup swiping only
- Built directly from V224. No code from the interrupted/later V225–V230 branch has been carried forward.
- Adds a structurally isolated child-profile horizontal scroller.
- The child row uses a dedicated full-width viewport; extra child cards extend inside that viewport rather than overflowing the setup page.
- On mobile portrait, users swipe the child strip directly left/right. Desktop retains its existing arrow controls, now targeting the same isolated viewport.
- The setup page remains independently vertically scrollable.
- Phone-landscape setup explicitly remains a mobile vertical scroll container using Moonbeam's existing `phone-landscape` classification.
- The child strip remains horizontally scrollable inside that vertically scrollable landscape setup page.
- No authentication, session-refresh, story-generation, API, credit, save, reader, or Supabase logic has been changed.
- No Supabase SQL/schema change required.

# Moonbeam Stories V224

## V224 — Account scroll now matches mobile setup
- Removes V222's clickable up/down Account scroll buttons completely.
- The mobile Account view is now its own native vertical touch-scroll container, matching the mobile setup pages.
- Users scroll Account naturally by swiping up/down anywhere in the Account content.
- Adds only the passive flashing double-down-chevron cue at the bottom of the visible Account area when more content remains below.
- The cue is non-clickable, disappears automatically at the bottom, and uses the same animation, sizing and scroll-state logic as the established setup-page cue.
- V223 child-profile horizontal swipe/carousel work is preserved.
- V220 refresh restoration, email-change functionality and reader behaviour are unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V223

## V223 — mobile child-profile sideways scrolling
- Enables deliberate horizontal navigation for the saved-child profile selector on phones.
- The child row can now be swiped left/right with touch.
- Reuses the existing profile-carousel chevrons: the right chevron appears when more children are off-screen, and the left chevron appears after scrolling across.
- Tapping either chevron smoothly moves the child row using the existing carousel handlers.
- Chevron visibility continues to update from the row's real scroll position.
- Desktop child-profile carousel behaviour is unchanged.
- Account scrolling/chevrons, refresh restoration, email-change functionality and reader behaviour are unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V222

## V222 — mobile Account scroll chevrons
- Adds mobile up/down scroll chevrons to Account so its scrollability is visually obvious, matching the cue already used on the setup experience.
- The down chevron appears only while there is more Account content below; the up chevron appears after the user has scrolled down.
- Tapping a chevron smoothly moves the Account page in the indicated direction.
- Chevrons update on scrolling, resizing and Account content changes.
- Desktop Account is unchanged.
- V221 mobile Account scrolling, V220 refresh restoration and all established reader behaviour are preserved.
- No Supabase SQL/schema change required.

# Moonbeam Stories V221

## V221 — mobile Account scrolling
- Fixes the mobile Account page being clipped below the viewport with no way to reach the lower Account controls.
- When Account is the active mobile section, the app/body can scroll vertically and the Account view is allowed to grow to its full content height.
- Adds bottom safe-area/toolbar breathing room so the final controls can be scrolled above mobile browser chrome.
- The rule is scoped specifically to the visible Account view; story readers and their established portrait/landscape scrolling behaviour are untouched.
- V220 refresh restoration and all prior Account/email functionality are unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V220

## V220 — correctly restore Account/Saved Stories after refresh
- Fixes the V219 reload bug where the remembered Account/Saved Stories section was restored internally but the public homepage shell remained visible.
- On full page reload, Moonbeam now explicitly re-enters the signed-in application shell before restoring the remembered Account or Saved Stories section.
- Refresh on Account returns to Account.
- Refresh on Saved Stories returns to Saved Stories.
- The remembered section remains user-scoped and session-scoped, and is cleared by Create Story or Sign out exactly as in V219.
- V215 tab-focus persistence, V218 email verification guidance, mobile demo motion and reader behaviour are unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V219

## V219 — preserve Account/Saved Stories across page refresh
- Remembers whether the signed-in user is on Account or Saved Stories for the lifetime of the current browser tab.
- Refreshing/reloading the page now returns to that same section instead of falling back to Create Story/setup.
- The remembered section is user-scoped, so it cannot carry across to a different signed-in account.
- Choosing Create Story clears the remembered Account/Saved state so normal setup-draft restoration continues to work.
- Signing out clears the remembered section.
- V215's tab-focus persistence fix remains in place; this V219 change specifically covers full page refresh/reload.
- V218 email-change guidance and all earlier Account, reader and mobile-demo behaviour are unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V218

## V218 — pending email verification guidance
- Adds a clear instruction inside the pending-email box telling the user to check their email for the verification message(s) needed to complete the change.
- Wording deliberately supports both one-address and two-address Supabase verification configurations.
- The new guidance is translated across all nine supported locales.
- V217's empty-pending-state fix is preserved.
- Email-change functionality, Account/Saved Stories persistence, mobile demo motion and reader architecture are otherwise unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V217

## V217 — hide empty pending-email state
- Fixes the V216 Account-page CSS specificity regression that displayed “Pending email change —” even when no email change had been requested.
- The pending-email row now remains completely hidden unless the Account code has a real pending email address to show.
- Email-change functionality itself is unchanged.
- V216 translations, V215 view persistence/mobile demo motion, and V212 reader architecture are unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V216

## V216 — change email address
- Adds a functional Change email address control to Account.
- Uses Supabase Auth `updateUser` on the existing signed-in user rather than creating a new account, so the user's Moonbeam user ID is preserved.
- Credits, saved stories and child profiles therefore remain attached to the same account when the email address changes.
- Handles both immediate email changes and confirmation-required changes.
- Shows a pending email address while confirmation is outstanding.
- Provides translated validation, progress, success, pending-confirmation and reassurance copy across all nine supported locales.
- Keeps the V215 Account/Saved Stories tab-focus persistence fix.
- Keeps the V215 mobile homepage demo motion and V212 reader architecture unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V215

## V215 — Account/Saved view persistence + account email colour + mobile demo motion
- Fixes the Account email value appearing white/pale on the cream Account page by explicitly applying the normal dark Moonbeam account text colour.
- Fixes Account and Saved Stories snapping back to Create Story/setup when the browser tab loses and regains focus.
- Root cause: Supabase can emit repeated auth/session events for the already-signed-in user; the app was rerunning setup-draft restoration on those events.
- Auth/session refreshes for the same signed-in user now refresh cloud/profile/story/credit data without changing the active app section.
- Initial sign-in/session restoration still restores story/setup drafts exactly as before.
- Adds the same gentle hero-demo float animation used on desktop to the mobile homepage.
- Mobile demo motion respects the device's prefers-reduced-motion setting.
- V212 reader architecture and V214 homepage/startup fix are unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V214

## V214 — restore homepage → setup navigation
- Fixes a V213 startup regression that prevented the homepage Create Story / sign-in routes from being bound.
- Root cause: V213 called the new Account renderer during the first localisation pass before the credit-balance variable had been initialised, causing JavaScript startup to stop early.
- The premature Account render call is removed.
- Account still refreshes when opened and whenever the credit balance is loaded or changed.
- No Account functionality has been removed.
- V212/V213 reader layouts and mobile portrait behaviour are unchanged.
- No demo-image animation change is included in this repair build.
- No Supabase SQL/schema change required.

# Moonbeam Stories V213

## V213 — functional Account section
- Adds Account to the desktop title bar beside Saved Stories.
- Adds Account to the existing mobile hamburger menu.
- Removes Sign out from the permanent desktop header; Sign out now lives inside Account.
- Account shows the signed-in email and live story-credit balance.
- Change password is fully wired to Supabase Auth using the existing signed-in session.
- Buy story credits opens the existing Stripe credit shop.
- Sign out uses the existing Supabase sign-out flow.
- All new Account UI, password validation/success copy, Home label, and navigation labels are translated across all nine supported locales.
- The Moonbeam brand remains the Home route and now has a clearer desktop hover/focus treatment plus a translated Home tooltip/accessibility label.
- V212 portrait and landscape reader CSS is unchanged.
- No Supabase SQL/schema change required.

# Moonbeam Stories V212

## V212 — true mobile landscape reader
- Built from V211.
- Mobile portrait CSS is untouched.
- Phone landscape no longer enters `desktop-story-mode`.
- Landscape now uses the same mobile reader architecture as portrait, rotated horizontally.
- Illustration is on the left; story text is on the right and scrolls independently.
- Illustration keeps mobile-style independent scrolling when the artwork is taller than its pane.
- Desktop Previous / Turn page pill is removed on phone landscape.
- Landscape uses the same visual language as portrait: circular previous/next arrows, centred page count, and floating close button.
- V207 rotation-state protection remains intact, so rotation stays on the same book and page.
- Setup architecture is unchanged.
- No API, story-generation, save, or illustration-recovery logic changed.
- No Supabase SQL/schema change required.

# Moonbeam Stories V211

## V211 — phone landscape scrolling text pane
- Built from V210.
- Mobile portrait reader is unchanged.
- Phone landscape keeps the 50:50 text/illustration spread.
- The left story pane now scrolls independently vertically at the existing readable type size.
- The illustration remains fixed in the right half.
- Extra top/bottom breathing room keeps text clear of Safari chrome and the floating reader controls.
- V210 fullscreen landscape shell and V207 rotation-state protection are preserved.
- No JavaScript, API, story-generation, save, illustration-recovery, or portrait-reader logic changed.
- No Supabase SQL/schema change required.

# Moonbeam Stories V210

## V210 — landscape reader rebuilt in-place from V207
- Rebuilt directly from the known-good V207 package.
- The existing V207 phone-landscape CSS block was edited in place instead of appending a new override block.
- Keeps V207's rotation state lock so rotating never leaves the current story/page.
- Phone landscape hides the app chrome and makes the live story fill the viewport.
- Text remains on the left, illustration on the right, with compact floating navigation.
- Portrait reader behaviour is unchanged.
- V206 interrupted-illustration recovery remains intact.
- No Supabase SQL/schema change required.

# Moonbeam Stories V207

## V207 — mobile reader rotation state lock
- Fixes the remaining iPhone/Safari regression where rotating an open reader could expose Saved Stories or Setup.
- Rotation now snapshots the exact active book/page before the viewport changes and explicitly restores that reader through Safari's multi-resize orientation sequence.
- Navigation-like taps/clicks (close reader, New Story, Create Story, Saved Stories) are briefly ignored during the orientation transition so a touch released after the layout moves cannot accidentally navigate.
- Portrait ↔ landscape remains a layout change only; the same book and page stay open.
- V206 interrupted-illustration recovery and all earlier behaviour are retained.
- No Supabase SQL/schema change required.

# Moonbeam Stories V206

## V206 — recover interrupted required illustrations

- Required story-page illustrations can now recover after the normal generation-run image allowance has been exhausted by interrupted/discarded requests, such as navigating away or Safari suspending the page during generation.
- Recovery is deliberately bounded server-side: no more than 9 recovery generations per story run and no more than 3 for any one required story image. The original anti-abuse allowance remains the primary budget.
- Recovery attempts are recorded in the existing `api_usage_events` table; no Supabase schema migration is required.
- The client marks only genuine story-page images as eligible for recovery. The optional dedicated cover enhancement does not receive recovery allowance.
- Recovered drafts and Save-time completion use the same required-image recovery path, while successfully cached illustrations continue to be reused rather than regenerated.
- When illustration generation has actually stopped, the reader now says “Picture not ready” (localized across all nine languages) instead of misleadingly continuing to say “Painting this page…”.
- V205 mobile orientation behaviour, V204 homepage CTA, V203 setup recovery, and V202 save behaviour are retained.
- No database schema, Supabase SQL, story generation, narration, or billing-credit changes.

## V205 — mobile landscape architecture and rotation persistence
- Phone landscape reader now uses the desktop-style spread: text left, illustration right.
- Rotating an open saved or newly generated book is treated purely as a layout change: the same book, page and reading mode remain active.
- Phone landscape setup deliberately remains the mobile two-step flow rather than merging Child + Story into the desktop two-panel workspace.
- Rotating during setup preserves the exact current setup step and entered state.
- No API, database, Supabase schema or story-generation changes.

## V204 — universal homepage story CTA

- Built from V203.
- The homepage CTA no longer assumes the visitor is creating their first story.
- English now reads **Create their story →**; all eight other locale variants have been updated equivalently.
- The logged-out acquisition line **1 story free · No card required** is unchanged.
- V203 setup-flow recovery, V202 save behaviour, and all existing reader/story-generation behaviour are unchanged.
- No API, database, Supabase schema, or story-generation changes.



## V203 — setup flow survives refresh

- Built from V202.
- Child and Story setup state is now stored locally while setup is in progress.
- Refreshing or reopening the site during setup restores the same setup page instead of returning to the public homepage.
- Entered child details, Story Idea, tone, selected values, photo-use choice and selected child profile are restored where applicable.
- The setup draft is scoped to the signed-in account.
- Deliberately returning Home clears the setup draft; a successfully generated story clears it as the V201+ story draft takes over.
- Works on mobile and desktop.
- No API, database, Supabase or story-generation changes.

## V202 — immediate save feedback and safe in-reader saving

- Built from V201.
- Save now reacts immediately: the control turns purple and reads the locale-specific “Saving…” while the illustrated book is being uploaded and verified.
- Users may continue turning story pages while saving; page turns do not interrupt the save.
- Actions that would destroy the active reader/story state (closing the reader or starting a new story) are blocked with a clear wait-for-save message while saving is active.
- Browser/tab unload during an active save triggers the browser’s leave-page warning where supported.
- “Saved” is shown only after the complete illustrated book has been uploaded and verified.
- V201 draft protection remains in place until permanent save succeeds.
- No API, database, Supabase schema or story-generation changes.

## V201 — automatic recovery of unsaved stories

- Built from V200.
- A newly generated story is now stored automatically as a local browser draft as soon as generation completes.
- The draft survives iPhone Safari tab eviction/reload, browser restarts, and desktop refreshes.
- On return/reload, Moonbeam automatically reopens the unfinished story for the same signed-in parent account.
- The current story page, reading mode and mobile text/illustration scroll positions are restored where possible.
- Existing illustration cache identity is preserved so already-created artwork can be reused after restoration.
- Pressing Save clears the temporary draft only after the permanent save succeeds.
- Starting a deliberate New Story clears the previous draft. Simply leaving the reader does not.
- Drafts are account-scoped and are never restored for a different signed-in account.
- No API, database, Supabase schema or story-generation changes.

## V200 — mobile double-tap fullscreen illustrations

- Built from V199.
- Portrait mobile only: double-tap a loaded illustration to open it fullscreen.
- Double-tap again, or tap ×, to return to the normal two-pane reader.
- The underlying reader is not re-rendered, preserving illustration and text scroll positions.
- Desktop reader behaviour is unchanged.
- No API, database, Supabase or story-generation changes.

## V199 — scrollable illustrations on portrait mobile

- Built cleanly from the proven V197 production baseline; the abandoned V198 Story Engine is not included.
- Portrait-mobile illustrations now have their own vertical touch-scroll area, matching the independently scrollable text pane.
- Artwork is shown at the full illustration-pane width with its natural aspect ratio, so users can scroll through parts that do not fit inside the fixed 60% artwork area instead of losing them to `object-fit: cover` cropping.
- Mobile artwork scrolling uses momentum scrolling, contained overscroll and hidden scrollbars.
- Desktop reader behavior is unchanged.
- No API, story-generation, database or Supabase changes.

## V197 — require narrative progression for visually varied books
- Keeps the V193 Moonbeam house illustration-style specification unchanged and keeps V194 recurring-character continuity unchanged.
- Keeps V196's exact-child-name lock and illustration-side composition variation.
- Adds a story-generation hard rule that every displayed spread must materially advance the narrative, rather than repeating variations of the same action in the same spot.
- Progression can come from changed action, objective, obstacle, interaction, discovery, position within the setting, visual circumstances or consequences.
- Does not force arbitrary location changes: a story may remain at one lake, stadium, spaceship, castle, etc., but the action and situation must genuinely progress within it.
- Requires opening + four middle pages + closing to form a visual narrative arc in the story text itself, so adjacent spreads naturally call for materially different pictures.
- Applies the same progression requirement to the JSON repair pass so repair cannot flatten the story back into repetitive beats.
- No Supabase SQL changes required.

## V195 — rebalance the mobile homepage vertically
- Mobile homepage only; desktop and product/story screens are untouched.
- Redistributes the existing single-screen height instead of shrinking the page or demo.
- Adds breathing room around the Moonbeam brand, language selector, headline and especially the Create Story CTA.
- Moves the demo lower so the previously wasted cream area beneath it is consumed, leaving only a small intentional finishing margin.
- Keeps the V193/V194 illustration style and V191/V192 story-generation architecture completely unchanged.
- No Supabase SQL changes required.

## V194 — lock recurring non-photo character continuity
- Keeps V193's Moonbeam house illustration style verbatim; the realism, painterly finish and homepage-mock-up target are unchanged.
- Fixes a real continuity-path bug: `app.js` was already sending the story `character_bible` with every illustration request, but `api/illustrate.js` was not reading that field. V194 now makes that bible authoritative for every cover/page request.
- Recurring non-photo humans now have an exact age (not an age range) plus fixed face, skin, eyes, hair, build, clothing and permanent identifying features. They must not age up/down, be redesigned or be substituted between scenes.
- The same fixed-model-sheet rule applies to recurring animals, robots and fantastical beings.
- Strengthens story-generation and repair instructions so new books create/reconstruct precise immutable character bibles and page prompts cannot redefine recurring characters.
- The photographed child's existing V193 identity-reference rules remain separate and unchanged. Story randomisation is unchanged. No Supabase SQL changes required.

## V193 — lock the Moonbeam house illustration style
- Keeps V192/V191 story generation unchanged.
- Replaces loose illustration-style wording with one immutable server-side Moonbeam house-style block used identically for every cover and interior page.
- Targets the homepage mock-up: naturalistic painterly realism (approximately 80% realism / 20% storybook idealisation), recognisably the real child, clearly illustrated rather than photographic.
- Makes consistency the highest-priority art-direction rule: the same realism level, facial treatment, anatomy and painterly finish must persist throughout a book.
- Explicitly blocks common drift toward oversized eyes, enlarged heads, doll-like/button-nose faces, anime/chibi, glossy 3D and animation-film/Pixar-like character design, while also blocking drift into photography.
- Removes competing cover/page style adjectives from the client prompts; scene prompts now control content/composition only and cannot override the server-side house style.
- Child-photo identity instructions remain separate and authoritative. No Supabase SQL changes required.

# Moonbeam Stories V192

# Moonbeam Stories V192

## V192 — restore the consistent Moonbeam illustration style
- Keeps V191's age-safe random story-blueprint architecture intact, including `storyIdea`, strict reality/magic constraints and blueprint-aware repair.
- Removes V190's variable visual-style catalogue and style selection from story generation, saved-story metadata, client illustration requests and cache identity.
- Restores `api/illustrate.js` exactly to the proven pre-V190 (V189) illustration generator, so every new book uses the established consistent Moonbeam hand-painted storybook treatment.
- Restores the pre-V190 cover art direction while using the current `storyIdea` field rather than the obsolete child `interests` concept.
- Existing saved artwork is left untouched. No database migration is required.

# Moonbeam Stories V191

## V191 — age-safe true-random story blueprints
- Replaced the V189/V190 blank-prompt architecture with a cryptographically random, age-gated blueprint generator.
- Blank Story Idea requests now select the premise in server code before the writing model runs: story family, reality rule, magic level, setting, plot engine, companion type, optional special object, naming mode, twist and ending type.
- Added hard age bands (3–5, 6–8, 9–12) controlling permitted stakes, prose complexity and excluded subject matter. Age safety overrides tone and creative choices.
- Removed the obsolete generation-path use of `child.interests`; the client now sends `child.storyIdea`. Existing profile-schema compatibility fields remain untouched.
- Removed generic house-prompt instructions that forced mysteries/secrets/quests/discoveries into unrelated stories.
- Strict-realism blueprints now explicitly forbid magic, supernatural beings, talking animals and enchanted objects. “Magical” tone becomes a sense of wonder rather than literal magic when realism is selected.
- Companion absence and special-object absence are hard constraints rather than suggestions.
- Repair-model calls now receive the same blueprint and age-safety constraints, closing the V190 repair-path loophole.
- Expanded the setting space substantially and removed the dedicated miniature-world/bakery architecture that was contributing to repetitive tiny-magical-creature stories.
- V190 story-matched illustration families remain intact and are now mapped to the new V191 story families.
- No Supabase SQL changes required.

# Moonbeam Stories V190
## V190 — Story-matched illustration art direction
- Added ten controlled Moonbeam visual families: Classic Moonbeam, Cinematic Storybook, Painterly Fantasy, Watercolour & Gouache, Graphic Comedy, Naturalist Adventure, Retro Adventure, Cinematic Sci-Fi, Miniature Macro and Dreamlike Surreal.
- Blank random stories choose a visual family from a weighted shortlist compatible with the V189 story architecture.
- Parent-written story ideas are classified into the same approved visual catalogue; the model cannot invent arbitrary styles.
- The chosen visual family is locked across the cover and every interior illustration in that book.
- More naturalistic families can approach cinematic/photographic realism while remaining premium storybook illustration.
- Child-photo identity direction remains separate from rendering style so changing art treatment does not intentionally change the child.
- Existing/legacy stories without a style ID safely fall back to the established Classic Moonbeam look.
- The style ID is persisted inside the existing saved-story pages JSON, so no Supabase schema change is required.

## V189 — Genuine blank-story narrative variety
- Rebuilt the blank Story Idea randomiser around **story architecture first**, rather than independently mixing generic ingredients.
- Added ten distinct story modes including realistic everyday, family comedy, logical mystery, expedition, science fiction, historical-feeling, nature, full fantasy, miniature-world and surreal single-premise adventures.
- Each mode now draws only from compatible settings, companions, goals and special features.
- A companion is no longer compulsory; many seeds explicitly require no sidekick.
- Magic is no longer the default. Non-magical modes explicitly remain non-magical.
- Special objects are optional; some seeds explicitly require none.
- Added anti-repetition guidance against the recurring Pip / glowing blue ball / magical marble / generic luminous-object pattern and against replacing the selected architecture with a generic magical quest.
- Parent-entered Story Ideas remain authoritative and bypass the random architecture entirely.
- Server-side only; no Supabase SQL changes required.


V169 is a surgical mobile Step 1 correction. Saved-child selector tiles now resolve each profile's locally stored IndexedDB photo, with a compatibility fallback for older photo keys and automatic migration back to the current canonical key. No desktop layout, Step 2, reader, Saved Stories, API, database, Stripe, or Supabase changes.

# Moonbeam Stories V168

V168 redesigns mobile Step 1 (Child) only. It uses the existing visual child tiles, makes the child photo the visual focus, hides legacy Interests/Things to avoid on phones, and presents only Name/Age plus compact profile actions before the existing Story navigation. Desktop rules and Step 2 are unchanged. No SQL or environment changes.

# Moonbeam Stories V167

V167 is a deliberately tiny Story Idea copy update on top of V166. The Story Idea placeholder now tells parents they can provide an idea, theme or a few keywords, or leave the field blank for a completely random story. The new placeholder is localised across all nine supported locales. No generation logic, layout, database, credits, illustration, narration, saved-story or reader behaviour is changed in this release.

**Deployment:** replace the current site files with the complete contents of this folder and let Vercel deploy. No SQL, Stripe or environment-variable changes are required.

---

# Moonbeam Stories V164

V164 makes the zero-credit state clear before the user tries to generate. When the signed-in story-credit balance is 0, the main generation button is disabled and changes from “Make Tonight’s Story” to “No story credits — buy credits to continue” (localized in all supported languages). The existing credit panel and Buy story credits button remain unchanged, so the user has an obvious next action without relying on the tiny post-click error message.

V163’s Tone/Values redesign and generation-prompt improvements are retained unchanged. No database migration is required. V164 still contains exactly 12 `/api/*.js` Serverless Functions.

---

# Moonbeam Stories V163

V163 keeps the V162 Child layout and reader behaviour unchanged while polishing the existing functional desktop Story controls. Tone choices are still the real controls connected to `#tone`, but now use larger illustrated cards and clearer selected states. The existing Story Values buttons remain the real `selected`-set controls, with larger card styling, icons and clearer selected states.

Story generation is also strengthened in `api/generate.js`: the selected tone now receives explicit writing guidance so it noticeably affects mood, pacing, description and dialogue. Selected values are still woven naturally into character actions rather than stated as morals. If the parent selects no values, the API no longer silently restores Kindness and Curiosity; no specific value theme is imposed.

No database migration is required. V163 still contains exactly 12 `/api/*.js` Serverless Functions.

# Moonbeam Stories V133

V133 reapplies the V132 localization audit on the proven V131 baseline while removing the early `renderStoryCredits()` call that caused startup to abort before homepage/auth handlers were attached. Credit localization remains handled after credit state initialization.

V127
- Fixed shared-link startup visibility: `/shared/<token>` now makes `#productApp` visible and enables `product-active` before rendering the shared book.
- This prevents the mobile landing-page `display:flex!important` rule from overriding the shared mode and prevents the shared book from being rendered inside a hidden parent.
- V126 private canonical artwork delivery is retained.
- No database migration, API-function changes, story regeneration, reader-layout changes, or narration changes.

V126
- Fixed shared-story artwork delivery: the consolidated sharing API now reads permanent saved illustrations from the private saved-story-art bucket through Supabase Storage’s authenticated object route.
- No story or artwork regeneration; shared stories continue to use the canonical saved copy.
- No database migration and no API-function changes.

# Moonbeam Stories V125

## V125 — complete Share Story interface localisation

V125 preserves V124 (including its Supabase service-role permission migration) and fixes the incomplete language inheritance in Share Story. The sender dialog is now localised from the canonical current story language every time it opens, including recipient fields, validation/progress messages, existing-share status and revocation controls. This matters when switching between saved books in different languages during the same browser session. Recipient conversion text remains localised, and shared-story illustration/error UI now uses the inherited language where that language is known.

**Database:** if you have not already run `SUPABASE_V124_SHARE_SERVICE_PERMISSIONS.sql`, run it once before testing Share Story. V125 adds no new SQL migration.

**Vercel:** V125 still contains exactly 12 files under `/api`. No API files are renamed or retired in V125, so there are no new GitHub deletions required beyond the four obsolete files already removed (`shared-asset.js`, `shared-story.js`, `story-share.js`, `translate-story.js`).


## V124 sharing permission fix (retained)

Before testing **Share Story**, run `SUPABASE_V124_SHARE_SERVICE_PERMISSIONS.sql` once in the Supabase SQL Editor. It grants only the trusted `service_role` the table privileges required by the private sharing API (`saved_stories`, `child_profiles`, and `story_shares`). It does **not** make saved stories public and does not disable RLS.

V124 otherwise preserves V123, including the 12-function Vercel Hobby layout, language inheritance throughout the recipient journey, and the daytime/nighttime setting-bias correction.

V124 includes the V122 Vercel Hobby deployment fix plus end-to-end language inheritance for Private Share Story.

## V122 retained — 12-function Vercel limit
V120/V121 contained 14 files in `/api`, which exceeds the Vercel Hobby limit of 12 Serverless Functions. V122 consolidates the three new sharing entry points into one `/api/share.js` function without removing sharing behaviour:

- `action=owner` — authenticated create/send, list and revoke operations
- `action=story` — anonymous private shared-story loading after token validation
- `action=asset` — anonymous private artwork proxy after token/story validation

Shared narration remains in the existing `/api/narrate.js` function and still validates the share token and requested story text before generating audio.

The obsolete V120 entry-point files `story-share.js`, `shared-story.js`, and `shared-asset.js` are removed. V122 therefore contains exactly **12** `/api/*.js` Serverless Functions.

## V121 setting-bias correction retained
V122 retains all V121 changes removing the unintended night-time/bedtime setting bias from story, cover and illustration generation. Bedtime remains a reading occasion, not a forced fictional setting. Story generation varies setting and time of day naturally and illustrations follow the setting established by the story.

## Private Share Story
- Share Story appears on the owner's final The End page for newly generated and previously saved stories.
- Unsaved stories are permanently saved before sharing.
- Up to 10 recipients; each receives an individual Resend email and unique cryptographically random private link.
- `/shared/<token>` opens the existing Moonbeam reader in restricted shared mode without requiring an account.
- Shared readers can use Read It Myself and Read to Me, including highlighting and auto-scroll.
- Saved artwork remains private in Supabase and is served only after valid share-token authorization.
- Owners can see prior recipients/open status and revoke individual links.
- Shared The End page offers the public Create my story acquisition path.

## Required deployment step
If you have not already done so, run `SUPABASE_V120_STORY_SHARING.sql` once in the Supabase SQL editor before deploying V122. Do not run it again if it has already been applied successfully.

V122 uses the existing `RESEND_API_KEY`. Optional environment variables:
- `RESEND_SHARE_FROM` (defaults to `Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>`)
- `MOONBEAM_SITE_URL` (defaults to `https://www.moonbeamstories.co.uk`)

## API functions — exactly 12
- checkout-status.js
- claim-trial.js
- create-checkout.js
- generate.js
- health.js
- illustrate.js
- narrate.js
- resend-inbound.js
- share.js
- story-consent.js
- stripe-webhook.js
- usage-summary.js

## V124 change — shared-story language inheritance
The canonical saved story language now controls the recipient journey: outbound share email, shared reader interface, narration language, The End conversion CTA, and the public Moonbeam landing/signup journey after the recipient chooses to create a story. The CTA carries `?lang=...` and the app persists that language so signup/onboarding remains in the same language unless the recipient changes it. The story itself is never translated or regenerated.

V124 still contains exactly **12** `/api/*.js` Serverless Functions.


## V128 change — shared-link first-paint cleanup
Shared `/shared/<token>` links are now detected synchronously in the document head before the browser can paint the public landing page. The normal landing/product UI stays hidden behind a lightweight Moonbeam loading screen until the existing shared reader has successfully rendered. On success the boot screen is removed; on invalid/revoked/error links it is also removed before the existing shared-story error screen is shown. No reader, narration, generation, credit, sharing-token, or saved-art logic was changed.

V128 still contains exactly **12** `/api/*.js` Serverless Functions and requires no new Supabase migration.



## V130 change — explicit recipient email placeholder

The Share Story recipient field now explicitly says **Recipient email address** (localized in every supported language), so it cannot be confused with the sender's own email address. No sharing logic, reader behavior, API count, or database schema changed.

V130 still contains exactly **12** `/api/*.js` Serverless Functions and requires no new Supabase migration.

## V129 change — simpler Share Story form
The Share Story form now asks only for the sender's name and each recipient's email address. The sender placeholder is the localized equivalent of “Your name”; the redundant recipient-name field has been removed. Multiple-recipient sharing, unique private links, language inheritance, revocation and the V128 shared-link startup flow are unchanged. The existing `story_shares.recipient_name` database column is retained for migration compatibility and is populated server-side from the recipient email; it is no longer requested from or shown to the sender.

V129 still contains exactly **12** `/api/*.js` Serverless Functions and requires no new Supabase migration.
## V131 — shared-story conversion CTA fix
- The final **Create my story** CTA in a received shared story now has an explicit click action rather than relying only on default anchor navigation.
- The action stops any narration, exits shared-reader display state, and navigates to the public Moonbeam journey with the original story language preserved via `?lang=<language>&fromShare=1`.
- The real `href` remains in place as a fallback for accessibility and open-in-new-tab behaviour.
- No changes to sharing tokens, email delivery, saved artwork, story generation, credits, narration, or the proven reader layout.



## V133 — comprehensive localisation repair
- Audited production UI for hard-coded English and connected missing setup, share, profile, saved-story and credit copy to the active locale.
- Share Story button now follows the canonical story/interface language.
- Credit status is re-rendered whenever the locale changes.
- Removed obsolete raw `3 stories free` fallback copy.
- Legal pages now localise their complete visible content, navigation and browser title for all supported Moonbeam locales.
- No database migration and no API-function changes.

## V141
- Language changes now immediately refresh visible credit/status/story UI without waiting for page navigation.
- The End page always shows equal-size Save Story, Share Story and New Story actions; saved stories show a disabled saved state.
- Share now offers WhatsApp, Email and Copy Link. WhatsApp/Copy Link create private tokenised story links; email retains recipient tracking and revocation.
- Buy credits is now a compact, prominent control; checkout/pricing logic is unchanged.


## V141
- When a signed-in account has exactly zero story credits, the compact Buy credits button turns green and gently pulses.
- The attention state is removed automatically as soon as the balance is above zero or unavailable.
- Respects prefers-reduced-motion by keeping the green emphasis without animation.
- No checkout, pricing, credit-balance, API, or database logic changed.


## V141 — Stage 1 desktop application header
- Replaces only the logged-in desktop application header.
- Uses the homepage ivory, aubergine and Moonbeam-purple palette.
- Adds real Create Story and Saved Stories navigation into the existing V140 setup flow.
- Adds a compact live credit balance and a Buy credits control wired to the existing checkout dialog.
- Keeps Sign out wired to the existing authentication function.
- Homepage, mobile shell, setup content, reader, saving, sharing, narration, APIs and legal footer are otherwise unchanged.


## V142
Stage 2 only: mobile application header matching the V141 desktop shell. Adds compact live credits, existing Buy Credits action, and a hamburger menu wired to the existing Create Story, Saved Stories, and Sign Out actions. No application content, reader, generation, saving, sharing, payment, legal, or API behaviour changed.

## V144 micro-update
- Removed the copyright line from the application footer so the four existing legal links have the available width.
- Tightened only the mobile application-header spacing so the live credit counter no longer crowds/overlays the Moonbeam branding.
- No application logic, API, payment, story, reader, save, share or legal-link destinations changed.

## V148 — Saved Stories relocation
- Moved Saved Stories out of Story setup into a dedicated view reached from the existing desktop header and mobile hamburger.
- Saved story cards now use the permanent saved cover artwork when available; older stories without a saved cover show a Moonbeam fallback.
- Replay/open and Delete remain wired to the same existing saved-story functions.
- No story generation, reader, narration, credit, checkout, share, database, or API changes.


## V147
Saved Stories repair only: dedicated library scrolls for any number of stories on desktop/mobile; mobile cover thumbnails have fixed non-shrinking geometry; saved-story reader close returns to Saved Stories and is visible on mobile. No API, database, generation, payment, narration, or sharing changes.


## V148 — Saved Stories visibility repair
- Fixes the setup shell remaining visible behind/above the dedicated Saved Stories view after V147.
- Explicitly preserves the hidden state for setup and Saved Stories despite responsive flex display rules.
- No changes to scrolling, covers, Replay/Delete, reader exit, APIs, payments, generation, or storage.


## V149
Mobile homepage composition only: separate brand/language rows, concise hero, larger demonstration image. Desktop homepage and product app unchanged.


## V150
- Desktop setup architecture only: authenticated desktop users now see Child and Story setup simultaneously in two side-by-side cards.
- Desktop 1-of-2/card navigation is hidden because both setup areas are present together.
- Signed-out authentication gate is preserved.
- Mobile setup remains the existing sequential Step 1 / Step 2 flow.
- No setup fields, story generation, Saved Stories, reader, payment, sharing, narration, legal or API behaviour changed.

V152 — Desktop child selector: visual saved-child tiles with real local profile photos, New child tile, and overflow scrolling. Mobile unchanged.

## V152 — desktop left card arrangement
- Desktop only: the proven child selector now spans the full left card.
- Existing photo, name and age controls are rearranged beneath it toward the approved desktop layout.
- Interests and Things to avoid are hidden on desktop only; their fields/data remain intact for existing logic and mobile.
- Existing photo choose/remove/use controls and Save child profile remain the same functional controls.
- Story card, mobile setup, Saved Stories, reader, payments and APIs are unchanged.

### V157 — Desktop story panel redesign
- Redesigned the signed-in desktop right-hand Story panel around a large story-idea field, visual tone choices, optional values, compact credit status and the existing Create Story action.
- Kept the existing `interests` field as the underlying story-generation value and synchronised the new desktop story-idea field to it, preserving the generation API contract.
- Kept the mobile setup flow unchanged.
- Included the confirmed Remove Child frontend fix so the delete confirmation works when `deleteProfile` is supplied as translated text rather than a function.
- No API functions, saved-story architecture, narration, sharing or database schema were changed.

### V158 — Compact desktop child panel
- Reduced desktop-only spacing, child tiles, photo area, fields and controls in the left Child panel.
- Child panel now fits within the desktop setup viewport without its own vertical scroll.
- Mobile layout and V157 Story panel remain unchanged.


### V159 — Balanced desktop child panel
- Restored the visible Remove child control beside Save child profile.
- Increased desktop child-photo, selector, field and control sizing from V158 while preserving the no-scroll target.
- Right-hand V157 Story panel and mobile layout remain unchanged.


### V160 — Taller child portrait + deletion cache refresh
- Desktop Child panel: increased only the portrait height, preserving the surrounding V159 control sizing.
- Retains the proven Remove child confirmation guard and bumps app.js to v160 so browsers cannot reuse the regressed cached script.
- Right-hand Story panel and mobile layout unchanged.


### V161 — Restore Remove child click handler
- Fixed the actual Remove child regression: the visible `#removeProfile` button had no click listener.
- Wired `#removeProfile` directly to the existing, proven `deleteChildProfile` function.
- Retains the V160 taller desktop portrait and all V157 Story-panel behaviour.
- No API, database, reader, narration, sharing or mobile-layout changes.


## V162
- Desktop Child panel: moved Save child profile / Remove child controls below the Age field.
- Retains V160/V161 320px portrait height.
- Retains the corrected child-profile deletion JavaScript and click handler.


### V165 — Desktop setup palette polish
- Brought the signed-in desktop setup canvas closer to the warm Moonbeam homepage palette with a deeper aubergine/plum background.
- Added a restrained warm lilac/ivory glow around the two setup cards.
- Shifted the card surfaces subtly toward warm ivory while preserving the established white-card clarity.
- No layout, controls, generation behaviour, mobile styling, reader behaviour, or API logic changed.


### V166 — Consistent Moonbeam wordmark
- Standardised the product/app header wordmark to the homepage Moonbeam Stories branding.
- Uses the same thin crescent treatment, purple, Georgia wordmark, weight and proportions.
- The app retains its ivory rounded navigation container; only the brand mark itself is standardised.
- No functional, API, generation, reader, payment or mobile-flow changes.


### V170 — Private cross-device child profile photos + shared navigation localisation
- Adds a private Supabase Storage bucket for saved child-profile reference photos.
- Existing local-only photos are migrated automatically from a device that already has them when no cloud copy exists.
- Signed-in devices securely retrieve and locally cache the saved profile photo, so child tiles and the main photo use the same reference across devices.
- Replacing/removing a photo updates/removes the private cloud copy; deleting a child profile removes its reference photo.
- Localises Choose a child, Create Story and Saved Stories across all nine supported locales on desktop and mobile.
- Updates child-photo privacy wording to describe private account storage accurately.
- Run SUPABASE_V170_CHILD_PROFILE_PHOTOS.sql before deploying V170.
- No API functions added; story reader, generation, credits and Saved Stories behaviour are unchanged.


## V171 — child photo loading state
- Shows an explicit loading spinner instead of the crescent/no-photo state while a saved child photo is being resolved from the local cache or private Supabase Storage.
- Saved-child selector tiles render immediately with loading avatars, then replace them with the saved photo (or the normal no-photo crescent) when retrieval finishes.
- Localises the main “Loading photo…” message in all nine supported locales.
- No database migration, desktop layout redesign, Story Step 2, reader, generation, narration, credits, or Saved Stories behaviour changes.


## V172 — authoritative cross-device profile photo refresh
- Treats the private Supabase copy as the authoritative saved child profile photo and IndexedDB as a local cache.
- Replacing a child photo now uploads a uniquely versioned Storage object, preventing a device or CDN cache from continuing to serve the previous image at the same path.
- Each profile-photo resolution compares lightweight cloud object metadata with the locally cached object version; if another device has selected a newer photo, Moonbeam downloads it and replaces the local cache automatically.
- Existing V170 `reference.jpg` photos remain compatible and are upgraded naturally the next time the photo is replaced.
- Older cloud photo versions are cleaned up after a successful replacement upload.
- No new Supabase migration is required; V170 Storage policies already permit the versioned files.
- No desktop/mobile layout, Step 2, reader, generation, narration, credits, or Saved Stories changes.


## V173 — mobile saved-child thumbnail crop refinement
- Adjusts only the small saved-child selector photographs on phones so portrait crops favour the upper part of the image and preserve headroom.
- The large child reference photo is unchanged.
- Desktop layout and thumbnails, Story Step 2, photo sync, reader, generation, narration, credits and Saved Stories are unchanged.
- No database migration is required.



## V174 — restore saved-child thumbnail crop
- Removes the V173 mobile-only `object-position: center 30%` override that caused the top of portrait thumbnails to be cropped incorrectly.
- Restores the proven centred `object-fit: cover` thumbnail behaviour from V172.
- The large profile photo, desktop layout, photo synchronisation, Story Step 2, reader, generation, narration, credits and Saved Stories are unchanged.
- No database migration is required.

## V175 — mobile saved-child thumbnails no longer crop the photo
- Fixes the remaining mobile child-selector thumbnail problem visible in V174.
- On phones only, saved-child avatar images now use `object-fit: contain` so the complete reference photograph fits inside the circular thumbnail instead of `cover` enlarging and cutting off the top/bottom.
- Keeps the thumbnail circle, tile dimensions, child names and New Child tile unchanged.
- Desktop thumbnails, the large profile photo, stored/cloud reference photos, photo synchronisation, Story Step 2, reader, generation, narration, credits and Saved Stories are unchanged.
- No database migration is required.


## V176 — circular mobile thumbnails with headroom
- Replaces the unsuccessful V175 `object-fit: contain` thumbnail treatment, which exposed rectangular photographs inside the circular avatar.
- Restores full-bleed `object-fit: cover` on phones so each saved-child photo fills the circular thumbnail.
- Anchors the mobile crop explicitly at `center top`, preserving the top of portrait photos rather than discarding hair/headroom during the square crop.
- Changes only the mobile saved-child thumbnail rendering; desktop thumbnails, stored photos, cloud sync, large profile photo, Story Step 2, reader, generation, narration, credits and Saved Stories are unchanged.
- No database migration is required.


## V177 — mobile thumbnail top-edge alignment
- Keeps saved-child photos full-bleed inside the existing circular mobile avatars with `object-fit: cover`.
- Aligns the source photo to `center top`, so the top edge of the photograph is at the top of the circle rather than vertically centred.
- Bumps the stylesheet cache key in `index.html` to V177 so phones cannot continue using the cached V174 thumbnail CSS.
- Changes no avatar dimensions, stored photos, cloud synchronisation, desktop thumbnails, large profile photo, Story Step 2, reader, generation, narration, credits or Saved Stories behaviour.
- No database migration is required.


## V178 — raise mobile child photos inside the avatar circles
- Keeps the existing circular, full-bleed mobile child thumbnails.
- Physically raises each saved-child photograph by 8px inside the circular mask instead of relying on `object-position`.
- Extends the image box by the same 8px so moving it upward cannot expose an empty gap at the bottom of the circle.
- Changes only the mobile saved-child thumbnail rendering; desktop thumbnails, stored photos, cloud sync, large profile photo, Story Step 2, reader, generation, narration, credits and Saved Stories are unchanged.
- Bumps the stylesheet cache key to V178. No database migration is required.

## V179 — mobile Story page matches the canonical desktop Story panel
- Replaces the simplified mobile Story Preferences presentation with a responsive version of the existing desktop right-hand Story panel.
- Mobile Page 2 now shows the same story-idea textarea and grey placeholder, the same four visual Story tone choices, and the same eight value choices with their existing selected states and handlers.
- Keeps the legacy `#tone` select and `#interests` field as hidden canonical state carriers because the existing generation code still reads them; no duplicate generation path or second Generate button is introduced.
- Keeps the existing credit status, Buy story credits, purchase-consent flow, `#generate` button, `generateStory()` function and `/api/generate` path unchanged.
- The desktop Story panel is unchanged. Mobile Page 1 and the V178 8px child-thumbnail lift are unchanged.
- Bumps the stylesheet cache key to V179. No database migration is required.


## V180 — Story idea is per-story, not child-profile state
- Fixes the old Story idea returning after it is deleted and the page is refreshed.
- Stops loading the legacy `child_profiles.interests` value into the Story idea box when a child profile is selected or restored.
- `#desktopStoryIdea` is now the canonical Story idea input used by `generateStory()`; the hidden legacy `#interests` field is no longer a source for the visible prompt.
- Saving a child profile or saving a generated story no longer writes that night's Story idea into `child_profiles.interests`; existing legacy values are left untouched but ignored by the Story interface.
- New child profiles initialise the legacy `interests` column as empty for database compatibility.
- V179 mobile Page 2 layout and V178 mobile child-thumbnail positioning are unchanged.
- Bumps the application JavaScript cache key to V180 so mobile and desktop receive the state fix. No database migration is required.

## V181 — localise Remove child
- Fixes the child-profile removal button remaining in English when Moonbeam is used in another language.
- Adds a dedicated `removeChild` UI translation in all nine supported locales and wires `#removeProfile` into the existing localisation refresh map.
- Spanish now shows “Eliminar niño/a”; equivalent native labels are supplied for French, German, Italian, Brazilian Portuguese and Polish, with English retained for both English locales.
- No layout, child-profile deletion logic, Story page, generation, credits, reader, photo handling or database behaviour is changed.
- Bumps the application and i18n cache keys to V181 so deployed clients receive the localisation patch. No database migration is required.


## V182 — restore mobile reader 60:40 split without losing text scrolling
- Restores the portrait-mobile live reader to an explicit 60% illustration / 40% text-panel split.
- Keeps the prose panel as its own `overflow-y:auto` scroll viewport with momentum scrolling, so long story text remains independently scrollable inside the 40% text area.
- Leaves story text at its existing size and flow; no font shrinking, clipping or page expansion is introduced.
- Desktop reader, story generation, mobile setup pages, child profiles/photos, localisation, credits, narration and Saved Stories are unchanged.
- Bumps stylesheet/application cache keys to V182 so mobile Safari cannot reuse the older reader CSS. No database migration is required.


## V183 — mobile end-page save acknowledgement and page-counter cleanup
- A successful **Save story** action now changes the end-page button to the completed translated “Story saved” state and gives it a filled purple treatment, so the save is visibly acknowledged. Already-saved stories render in that completed state immediately.
- The reader page counter is hidden on **The End** page only, preventing it from overlapping the **New story** button on mobile. It remains unchanged on all actual story pages.
- V182's mobile 60:40 illustration/text split and independently scrolling text panel are unchanged. No database migration is required.


## V184 — default to first saved child
- On a fresh/reloaded Create Story screen, if one or more saved child profiles exist, Moonbeam now automatically selects and loads the first saved child (the leftmost tile, using the existing `created_at` ascending order).
- **New child** remains the default only when there are no saved child profiles, and it can still be selected explicitly at any time.
- The selected child's existing profile fields and reference photo load through the same `selectCloudProfile()` path as a manual tile selection; no duplicate profile-loading logic is introduced.
- Child ordering, V178 mobile thumbnail positioning, V180 per-story Story idea behaviour, V179 mobile Story page, V182 reader scrolling/split and V183 end-page changes are unchanged.
- Bumps client cache keys to V184. No database migration is required.


## V185 — keep the page counter off The End page
- Fixes the mobile reader counter being restored after The End page renders. The cause was `applyMobileSide()` rewriting `#pageIndicator` after `renderBookPage()` had already hidden it.
- `applyMobileSide()` now explicitly detects the physical end page, clears the counter and keeps the existing `end-hidden` state there. On every actual story page it restores the normal page counter.
- This build deliberately does **not** change Save story behaviour, reader geometry, setup pages, story generation, profiles, photos or any other functionality.
- Bumps client cache keys to V185. No database migration is required.


## V186 — remove Forward navigation from The End on mobile

- The End remains a terminal page on mobile: Previous/back remains available, while the right/forward navigation button is hidden on The End only.
- Normal story pages retain Previous, page counter and Forward navigation unchanged.
- Preserves the V185 removal of the page counter on The End. No other reader, setup, save/share, generation or profile behaviour is changed.
- Bumps client cache keys to V186. No database migration is required.


## V187 — stabilise the mobile homepage demo image
- Fixes the intermittent blank mobile homepage demo while leaving the desktop homepage unchanged.
- The mobile demo image now uses its intrinsic 1312×1199 aspect ratio (`height:auto`) instead of `height:100%` against a flex-calculated parent height. This removes the fragile percentage-height dependency that could resolve incorrectly in mobile Safari.
- The existing mobile demo container, crop/overflow behaviour, homepage composition and all product/setup/reader functionality are unchanged.
- Bumps client cache keys to V187. No database migration is required.


## V188 — varied random stories for blank Story Idea
- A blank Story Idea now receives a private server-side creative seed assembled independently from controlled pools for story mode, setting, companion, goal, unusual element and twist.
- The AI does not choose the seed combination and is instructed to use every selected ingredient as a central part of the plot.
- A parent-entered Story Idea remains authoritative and bypasses random seeding entirely.
- The seed is never shown in the interface or returned as part of the story.
- No database migration is required. Client build/cache metadata is bumped to V188.

## V196 — exact child names and varied visual storyboarding
- Locks the protagonist name to the exact child name supplied by the parent. Moonbeam must not invent or append a surname, middle name, nickname, honorific or alternative form, including in the book title.
- Adds a mandatory visual-storyboard rule: every displayed illustration must depict a materially different story beat and composition, varying framing, viewpoint, pose, action and focal emphasis instead of repeating the same setup from slightly different angles.
- Adds the same composition-progression requirement to JSON repair and illustration generation, so repair cannot collapse the storyboard back into repeated scenes.
- Preserves V194 recurring-character continuity rules.
- Preserves the V193 Moonbeam house illustration style verbatim; realism, painterly treatment and stylistic preferences are unchanged.
- V191/V192 age-safe random story architecture and V195 mobile homepage spacing are unchanged. No database migration is required.


## V244 — scrollable public homepage (rebuilt cleanly from V243)
- Keeps the proven V243 application, setup, auth, reader, generation, credits and legal pages unchanged.
- Keeps the existing Moonbeam hero as the first homepage screen.
- Makes only the public homepage vertically scrollable on desktop and mobile.
- Adds concise How it works, photo-personalisation, family/privacy reassurance and final CTA sections.
- All new homepage copy is translated across the existing nine locales.
- Both Create Story CTAs continue to use the existing V243 `enterMoonbeamApp()` route; Sign in remains on the existing route.
- No Supabase schema change.


## V246 — unified Cast profiles (clean rebuild from approved V245)

- Replaces profile management with one `cast_members` source for children, trusted adults and pets.
- Children: name, age, optional photo. Adults: name, relationship, optional photo. Pets: name, animal type, optional photo.
- Preserves the proven V245 Account/login/setup/Story navigation shell; V248 remains the setup-layout redesign.
- Keeps only a hidden generation compatibility adapter for the currently selected child; there is no second profile CRUD path.
- Cast Save is transactional in the UI: Save → Saving… → database confirmation → Saved → close → refreshed Cast. Photo failure is reported separately after a successful profile save.
- Existing `child_profiles` rows are migrated idempotently with UUIDs preserved, but the legacy table and saved-story relationships are left untouched as a safety copy.
- Cast UI, validation, confirmations and save states are localized in all nine Moonbeam locales.
- `api/share.js`, generation APIs, reader, Saved Stories, credits, legal pages and dashboard are unchanged from V245.

## V246 — desktop Cast scroll fix
- Keeps the confirmed-working unified V246 architecture and all existing routing, Cast CRUD, photo handling, SQL and story behaviour unchanged.
- Makes only the signed-in desktop Your Cast panel explicitly vertically scrollable when its contents exceed the available panel height.
- Mobile behaviour is unchanged.

## V246 desktop stacking step
- Desktop only: the existing Story panel is placed immediately below Your Cast in the same white setup surface.
- Desktop now has one vertical scroll surface for Cast then Story; the separate right-hand Story card is removed visually.
- Mobile remains the existing V246 two-page Cast → Story setup.
- No JavaScript, Cast CRUD, photo, auth, routing, generation, API, or Supabase changes.


## V246 mobile stacking step
On mobile only, the existing Story setup page is rendered immediately below Your Cast inside the same vertically scrolling setup track. The old second-page presentation and setup navigation are hidden for signed-in Create Story. No JavaScript, API, database, Cast CRUD, photo, auth, generation, reader or Supabase changes.

### V246 mobile combined-page scroll restoration
- Restores vertical touch scrolling on the combined Cast + Story page on mobile.
- Removes the inherited `touch-action: pan-x` behaviour from the former two-page swipe deck by overriding the combined setup track to `touch-action: pan-y`.
- No JavaScript, routing, Cast CRUD, photo, generation, API, or Supabase changes.


### V246 mobile true-flow correction
- Replaces the remaining signed-in mobile fixed-height pager geometry with normal document flow.
- Cast now expands to its real content height; Story begins only after the Pets section, and the footer follows Story normally.
- Desktop layout and all JavaScript, Cast CRUD, photo, auth, generation, API and Supabase behaviour remain unchanged.


V246 mobile desktop-copy rebuild: signed-in mobile setup now uses the same Cast -> Story normal document flow as the proven desktop stacked layout. Legacy mobile pager geometry is overridden; functional JavaScript and Supabase code are unchanged.

### V246 simplified Story setup UI
- Removed the visible Story tone section.
- Removed the visible Values to include section.
- Removed the explanatory line beneath “What would you like the story to be about?”.
- Tone/value compatibility controls remain hidden in the DOM so generation/save behaviour is unchanged in this UI-only step.
- No Supabase/SQL changes.


### V246 micro-upgrade: save warning + illustration character uniqueness
- While an end-page story save is in progress, shows an explicit warning not to close or leave the page until saving completes; warning disappears when save completes or fails. Localised across all nine locales.
- Illustration prompt now forbids accidental physical duplication of the same named/recurring character within a single image, while allowing explicit non-physical depictions such as mirror reflections, photographs, portraits, screens, shadows or dreams when the scene requires them.
- Existing save mechanics, Cast, setup layout, auth, generation structure and Supabase schema are unchanged. No SQL required.


## V246 legal-page back micro-upgrade
- Added an obvious localized Back control to Privacy, Terms and Refunds.
- Back returns to the previous Moonbeam page when reached internally; direct/external arrivals fall back to the Moonbeam homepage.
- Logo still links to the homepage.
- No app, generation, save, Cast, API or Supabase changes.


## V248 — Mobile Saved Stories repair

Restores the dedicated Saved Stories view on mobile after the Create Story Cast/Story document-flow changes. The repair is CSS-only and scoped to the state where Saved Stories is visible. Desktop, story data/loading, Cast, generation, saving, legal Back navigation and Supabase logic are unchanged.


## V248 — Multi-character story universe
- Multiple child heroes/co-heroes plus optional supporting children, adults and pets.
- Structured narrative roles are sent to story generation and illustration continuity.
- Tone and Values are removed from generation; no default moral/value influence remains.
- Optional pet breed is stored for realistic dog scale; reference photos also inform pet proportions.
- Illustration requests can carry identity references for multiple selected Cast members.
- Run SUPABASE_V248_CAST_BREED.sql once before deploying V248.


## V248 final — Cast roles and natural story context
- Hero selection uses faded miniature Cast cards with an empty selector circle; selected cards become full-colour with a Moonbeam-blue border and blue checked circle. Tapping anywhere on a card toggles it. No hero is preselected.
- Only children are eligible as heroes. Remaining children, adults and pets can be selected as supporting characters. At least one hero is required.
- Adult Relationship is now optional free text. It is general context only; explicit relationships/forms of address in Story Idea take precedence, and the generator is told not to invent family relationships.
- Story Idea placeholder demonstrates relationship context. English uses Jack and Jill; each other locale uses natural example names and wording for that language.
- Tone and Values remain absent from generation; no default moral/value influence is imposed.
- Optional pet breed and multi-reference illustration identity/scale rules retained.
- V247 mobile Saved Stories repair and all earlier save/legal/reader fixes retained.


## V250.21 — Desktop homepage Create Story attention cue
- The main desktop homepage Create Story CTA now gently enlarges/brightens twice shortly after the homepage appears, then becomes completely still.
- The cue is desktop-homepage-only; mobile and in-app Create Story controls are unchanged.
- Respects reduced-motion preferences. No Supabase/SQL changes.

## V250.22 — private Moonbeam support inbox
- Adds a private Support inbox to the existing developer Usage page. It lists inbound Resend messages addressed to `support@moonbeamstories.co.uk` or `privacy@moonbeamstories.co.uk`, opens the full message, and lets the Moonbeam developer reply from the matching Moonbeam address without exposing the personal forwarding address.
- Access uses the same signed-in developer check and `MOONBEAM_DEVELOPER_EMAIL` restriction as the existing Usage dashboard.
- Reuses the existing `api/resend-inbound.js` Serverless Function for inbox list/read/reply actions, so the deployment remains at exactly 12 deployable `/api/*.js` functions. The existing Resend webhook forwarding behaviour is preserved.
- Replies use the existing `RESEND_API_KEY`; no new Vercel environment variables and no Supabase/SQL migration are required.
- Legal pages are unchanged.


## V250.23 — Support Inbox Message Detail Fix
- Retrieves selected inbound email content through the Resend Receiving SDK.
- Restores subject/body display with list-metadata fallback.
- Correctly handles Resend reply_to arrays and falls back to the sender address.
- Keeps the existing 12 deployable API-function limit; no Supabase schema change.


## V250.24 — Support Inbox Black Text
- Makes all text in both the left-hand Support Inbox message list and the right-hand opened-message/reply panel explicitly black against the white cards.
- Includes sender, subject, date/time, destination, opened-message metadata/body, reply labels, recipient/status text and reply textarea text.
- HTML-only email bodies are also forced to render black text inside the sandboxed message frame.
- No Support Inbox behaviour, Resend routing, Supabase schema, legal pages or other Moonbeam UI is changed.


## V250.25 — Richard Support Email
- Usage-page Support Inbox replies now send as `Richard — Moonbeam Stories <richard@moonbeamstories.co.uk>`.
- Usage-page replies set `Reply-To: support@moonbeamstories.co.uk`, so customer replies return to the public support mailbox.
- Adds `richard@moonbeamstories.co.uk` to the existing inbound routing and Support Inbox, forwarding it to the same `SUPPORT_FORWARD_TO` destination as support mail.
- Existing `support@` and `privacy@` receiving/forwarding behaviour is preserved.
- Reuses `api/resend-inbound.js`; no new API function, Vercel environment variable, Supabase/SQL migration, or legal-page change is required.

## V250.26 — Instagram Connection Test
- Adds a developer-only **Instagram connection** check to `usage.html`.
- The check uses the existing Moonbeam developer-session guard before any Instagram request is made.
- Reads `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_ACCOUNT_ID` only on the server from Vercel environment variables; the Instagram access token is never returned to the browser.
- Verifies the configured Instagram account through the Instagram Graph API and reports the returned username/account ID.
- Reuses `api/resend-inbound.js`, so the deployment remains at exactly 12 deployable API functions.
- Does not publish an Instagram post yet; this is the connection/authentication test before publishing is enabled.
- No Supabase/SQL migration or legal-page change is required.


## V250.29 — Instagram ID Diagnostic
- Extends the developer-only Instagram connection check so an account-ID mismatch safely reports the username, the ID returned by Meta, and the configured Vercel account ID.
- The Instagram access token remains server-side and is never returned to the browser.
- Reuses `api/resend-inbound.js`; no new API function, Supabase/SQL migration, legal-page change, or Vercel environment variable is required.


## V250.28 — Instagram Publishing Test
- Adds a developer-only live Instagram publishing test to the existing Usage page.
- Reuses `api/resend-inbound.js`; no additional deployable API function.
- Publishes `/moonbeam-demo.png` with a short test caption to the configured Instagram account after an explicit browser confirmation.
- Instagram access token remains server-side in Vercel and is never returned to the browser.
- No Supabase schema or legal-page changes.


## V250.29 — Instagram Story Gallery
- Developer-only **Post to Instagram** action appears on the owner story end page after server-side developer verification.
- Posting saves the complete story if needed, creates a public Moonbeam shared-reader link, publishes the genuine saved cover to @moonbeamstoriesuk, and registers the story in the Instagram gallery.
- `/instagram` is the permanent link-in-bio gallery. Each cover opens the existing shared reader, including its end-page **Create Your Own** conversion.
- Reuses existing `/api/resend-inbound` and `/api/share`; no additional Vercel API function.
- Saved WebP covers are converted to JPEG on demand for Instagram publishing.
- No Supabase schema change and no legal-page change.


## V250.30 — Usage Page Cleanup

- Removed the completed Instagram connection and test-publishing controls from the developer Usage page.
- Moved the Support inbox/email section to the top of the Usage page, above Usage & economics and the statistics tables.
- The working story-to-Instagram publishing feature and Instagram story gallery from V250.29 are unchanged.
- No Supabase schema or legal-page changes.


## V250.31 — Instagram Story Publishing Reliability

- Waits for Meta to finish preparing the real saved-story cover media container before publishing it, preventing the premature “Media ID is not available” failure.
- A successful story post changes the end-page Instagram button to **✓ Posted**, keeps it disabled, and turns it purple.
- A failed post restores the active **Post to Instagram** button so it can be retried.
- No new API function, Supabase/SQL migration, legal-page change, or Vercel environment variable is required.


## V250.32 — Instagram Titled Covers + Compact Gallery
- Instagram story posts now use the genuine saved cover artwork with the actual story title composited onto the posting image; the saved original artwork remains unchanged.
- The public Instagram gallery uses the same titled cover treatment.
- Gallery covers are compact Saved Stories-sized thumbnails in a dense responsive grid, with vertical scrolling for a growing library.
- Gallery order remains newest first (`created_at.desc`), matching Saved Stories chronology.
- Each gallery cover continues to open the existing complete shared-story reader and its end-page Create Your Own route.
- Existing successful posting reliability and purple ✓ Posted state are preserved.
- No Supabase schema or legal-page changes.


---

## V250.33 — Reliable Two-Hero Dedication + Instagram Bio Caption
- Two-Hero names are now persisted with the saved book artwork metadata, so reopening, sharing, or posting a saved two-Hero story retains both Heroes in the cover dedication.
- One Hero + Supporting Cast still dedicates the cover only to the Hero.
- Instagram story captions now say **Read the full illustrated story — link in bio.** and no longer print the non-clickable gallery URL.
- No Supabase schema change.


## V250.34 — Developer Gallery Removal
- Adds a developer-only **Remove from gallery** control to each `/instagram` story card.
- Removal revokes only the Instagram gallery share entry; it does not delete the saved Moonbeam story, artwork, credits, or any unrelated private share.
- Ordinary public visitors never see the removal controls.
- Existing newest-first compact gallery, titled covers, shared reader, Instagram publishing, and 12-function API architecture are preserved.
- No Supabase schema or legal-document changes.


## V250.36 — Rendered Titled Covers
- Rebuilt the Instagram/gallery cover compositor so the story title is baked into the image itself using explicit pixel positioning rather than percentage SVG positioning.
- Adds a small MOONBEAM STORIES kicker and stronger lower-cover shading so the published asset reads unmistakably as a book cover.
- Adds a cache-busting version to gallery and Instagram cover URLs so previously cached raw artwork cannot mask the corrected titled cover.
- Existing compact newest-first Instagram gallery, developer removal control, posting reliability, and all other V250.34 behaviour are preserved.
- No Supabase schema change.


## V250.36 — Exact Reader Cover Snapshot
- Instagram publishing now captures the existing rendered Moonbeam reader cover (artwork, kicker, exact title and dedication) as one JPEG instead of rebuilding title graphics server-side.
- That same captured cover is stored for and served by the public Instagram gallery.
- Existing publishing, newest-first gallery, developer removal and 12-API architecture are preserved.


## V250.37 — Server-Side Canonical Instagram Covers
- Removed the browser/canvas/foreignObject cover snapshot path that Safari could reject as insecure.
- Instagram posting now sends only the saved story id; the existing server function retrieves the authoritative saved cover artwork and renders the Moonbeam cover treatment server-side.
- The server uses the story's exact saved title, locale and saved Hero names (falling back to the saved child profile only when older saved data has no Hero-name metadata).
- The finished 4:5 JPEG is verified before it is stored, submitted to Meta, or exposed to the public gallery.
- The same stored finished JPEG is used by Instagram and the /instagram gallery. Existing saved stories can be posted without regenerating their story or illustrations.
- Publishing remains fail-safe: a failed render/publish removes the provisional gallery share and the client returns the Post to Instagram button to a retryable state.
- No new API function, Supabase schema change or legal-page change.


## V250.39 — Canonical Cover Font Fix
- Fixes the server-rendered Instagram/gallery cover text that appeared as tiny unreadable glyph boxes.
- Uses explicit server-available serif/sans-serif font families while preserving the reader cover's existing scaled typography, positions, title, kicker and dedication.
- The same verified finished JPEG continues to be used for Instagram and the public gallery; no browser canvas/snapshot path is used.
- Existing posting reliability, newest-first gallery, developer removal, 12-function API architecture and all unrelated behaviour are preserved.


## V250.39 — Single cover typography path
- Removed the SVG/DejaVu Instagram title renderer and its independent line-breaking algorithm.
- Instagram/gallery cover text now uses Sharp/Pango text rendering with the reader cover CSS proportions: 4:5 artwork, 12% copy margins, 6% bottom placement, serif title, italic serif dedication and uppercase kicker.
- The same saved title and the same saved Hero-name dedication data used by the reader are used for the flattened Instagram/gallery cover.
- Existing saved stories remain supported; no story or illustration regeneration is required.

## V250.40 — Developer-only verified Instagram cover capture
- Replaces the failed server-generated Instagram typography path with a browser-side capture of the real Moonbeam cover content.
- Developer account only: normal user accounts receive no Instagram UI and no change to generation, reader, save, sharing, credits, or account flows.
- Pressing **Post to Instagram** saves the story if needed, switches to the real cover, waits for the cover image and browser fonts, and builds a 1080×1350 JPEG using the browser-rendered cover text metrics and the local/blob cover artwork already loaded by Moonbeam.
- The developer sees the exact JPEG in a confirmation preview before anything is sent to Instagram. **Post this cover** sends those exact JPEG bytes; **Cancel** returns to the previous book page without publishing.
- The server no longer creates title, kicker, dedication, line wrapping, or fonts for Instagram. It only verifies the approved JPEG dimensions/type, stores the exact bytes, fetches the public Moonbeam image back, compares SHA-256 hashes, and only then submits that public URL to Meta.
- The Instagram gallery serves the same stored JPEG bytes. Preview = stored gallery cover = Meta source image.
- Failed publishing removes the temporary public share and cover asset.
- Core reader app and Instagram-cover cache-busting are advanced to V250.40.
- Existing developer access verification and Meta/Vercel environment variables are unchanged. No Supabase schema change.
- Exactly 12 deployable API functions remain.
