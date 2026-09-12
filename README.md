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

## V140
- Language changes now immediately refresh visible credit/status/story UI without waiting for page navigation.
- The End page always shows equal-size Save Story, Share Story and New Story actions; saved stories show a disabled saved state.
- Share now offers WhatsApp, Email and Copy Link. WhatsApp/Copy Link create private tokenised story links; email retains recipient tracking and revocation.
- Buy credits is now a compact, prominent control; checkout/pricing logic is unchanged.


## V140
- When a signed-in account has exactly zero story credits, the compact Buy credits button turns green and gently pulses.
- The attention state is removed automatically as soon as the balance is above zero or unavailable.
- Respects prefers-reduced-motion by keeping the green emphasis without animation.
- No checkout, pricing, credit-balance, API, or database logic changed.
