# Moonbeam Stories V245

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


## V246 — Your Cast (profile management only)

Built from the confirmed-good V245 without changing the established setup routing architecture. The Account setup page remains page 0, the Child/Cast setup page remains page 1, and Story remains page 2; desktop keeps the existing Child + Story two-panel behavior and mobile keeps the existing sequential setup pages.

The Child profile area is presented as **Your Cast**, with children, trusted adults and pets. Children use name + age + optional photo; adults use name + relationship + optional photo; pets use name + animal type + optional photo. Cast controls are localized across all nine locales. Story generation remains on the existing single-child path in V246.

Run `SUPABASE_V246_CAST_MEMBERS.sql` once to enable adult/pet storage.
