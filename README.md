# Moonbeam Stories V169

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
