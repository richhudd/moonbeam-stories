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
