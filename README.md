# Moonbeam Stories V61

V61 is a small UX release on top of V60. If a user presses **Make Tonight's Story** while the required first-use purchased-credit consent box is still unticked, Moonbeam now scrolls/focuses to the consent line, flashes it red, outlines the checkbox, and shows **“Please tick this box to continue.”** The warning clears immediately when the box is ticked. No credit is consumed and no story generation starts until consent is recorded.

**Deployment:** replace the current site files with the contents of this `moonbeam-v61` folder and let Vercel deploy. **No Supabase SQL changes, no new environment variables, and no Stripe changes are required.**

---

# Moonbeam Stories V57

V60 keeps checkout simple and moves the immediate-digital-supply acknowledgement to the first story created from each newly purchased credit pack.

## Deploy in this order

1. **Supabase first:** run the whole `SUPABASE_V57_REFUNDS.sql` file once in the Supabase SQL Editor. Do not run the old V56 migration separately.
2. Upload/deploy the contents of this `moonbeam-v57` folder to GitHub/Vercel. No new Vercel environment variables are required.
3. In Stripe Workbench → Webhooks → Moonbeam Stories Payments, keep `checkout.session.completed` and add `charge.refunded`. Keep the existing webhook URL and signing secret.
4. For the already-refunded £9.99 test payment, replay its `charge.refunded` event after V57 is deployed if Stripe permits it; otherwise adjust that old test purchase separately.

### V57 legal/purchase changes

- Removes the voluntary promise to refund unused credits just because a customer changes their mind.
- Preserves statutory cancellation/refund rights.
- States that a successful story is not normally refundable merely for subjective creative preference.
- Makes automatic credit restoration the normal remedy for failed generation.
- Adds an unticked acknowledgement box before checkout.
- Server rejects checkout unless that acknowledgement was explicitly supplied.
- Stores acknowledgement/version in Stripe Checkout and PaymentIntent metadata.

# Moonbeam Stories V56 — automatic Stripe refund credit reversal

V56 adds refund reconciliation to the live Stripe credit system. A successful Stripe refund now revokes the corresponding Moonbeam credits through the signed Stripe webhook. Full refunds target the whole credit pack; partial refunds revoke credits proportionally. The visible credit balance is never allowed below zero, and the purchase ledger records both the intended revocation and how many credits could actually be removed if some were already spent.

## DEPLOYMENT ORDER — IMPORTANT

### 1. Supabase FIRST
Run the entire `SUPABASE_V56_REFUNDS.sql` file once in Supabase SQL Editor. It is additive and does not reset existing balances, trial claims, saved stories, or purchases.

### 2. Deploy V56
Upload/deploy the complete V56 project to GitHub/Vercel. No new Vercel environment variables are required.

### 3. Add one Stripe webhook event
In Stripe Workbench → Webhooks → `Moonbeam Stories Payments`, edit the event destination and keep the existing `checkout.session.completed` event. Add:

- `charge.refunded`

If `checkout.session.async_payment_succeeded` is already enabled, keep it; otherwise it is optional for the card-only flow currently in use. Do not replace or roll the signing secret.

### Refund behaviour
- Full refund: all credits from that pack are targeted for revocation.
- Partial refund: credits are targeted proportionally to the cumulative refunded amount.
- Duplicate/retried Stripe events are idempotent because Stripe's cumulative `amount_refunded` is compared with the purchase ledger.
- Out-of-order stale events cannot restore credits.
- Moonbeam never makes the visible balance negative. If refunded credits have already been spent, the ledger records the unrecoverable amount rather than taking unrelated future credits below zero.

### Existing test refund
The £9.99 refund performed before V56 was deployed will not be processed automatically unless its `charge.refunded` event is replayed/sent to the Moonbeam webhook after V56 is live. If Stripe allows that event to be resent from Workbench, replay it after deployment; otherwise make one fresh live test purchase/refund or adjust the test balance manually in Supabase.

---

# Moonbeam Stories V54

V54 launch/legal release. Adds Privacy Policy, Terms of Service and Refund Policy pages; persistent legal links; purchase-dialog legal acknowledgement; and Stripe Checkout acknowledgement text. No Supabase SQL changes are required for V54.

# Moonbeam Stories V53 — Stripe prepaid story credits

V53 builds directly on the working V52 release. It keeps the 3-credit verified introductory trial and adds secure prepaid Stripe Checkout packs:

- 10 story credits — £9.99
- 25 story credits — £19.99
- 50 story credits — £34.99
- one credit = one newly generated story
- saved stories remain free to reopen
- credits do not expire in Moonbeam

## DEPLOYMENT ORDER — IMPORTANT

### 1. Supabase FIRST
Open `SUPABASE_V53_PAYMENTS.sql`, copy the entire file into Supabase SQL Editor, and Run it once. It does **not** reset existing balances or V52 trial claims.

The SQL adds an idempotent purchase ledger and the server-only `fulfill_story_credit_purchase` RPC. A Stripe Checkout Session can therefore grant credits only once, even if Stripe retries a webhook or the success page checks the payment again. It also hardens `consume_story_credit` so a missing credit row starts at zero rather than accidentally recreating the introductory allowance.

### 2. Stripe test-mode secrets in Vercel
Add these Vercel environment variables for Production/Preview as appropriate:

- `STRIPE_SECRET_KEY` — Stripe secret API key (`sk_test_...` while testing)
- `STRIPE_WEBHOOK_SECRET` — webhook endpoint signing secret (`whsec_...`)
- `MOONBEAM_SITE_URL` — optional; defaults to `https://www.moonbeamstories.co.uk`

Never put either Stripe secret in `index.html`, `app.js`, GitHub source, or Supabase client settings.

### 3. Stripe webhook
In Stripe, create a webhook endpoint pointing to:

`https://www.moonbeamstories.co.uk/api/stripe-webhook`

Subscribe it to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Copy that endpoint's signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`.

### 4. Deploy V53
Upload/deploy the whole V53 project after the SQL and environment variables are in place. No `vercel.json` is required.

## Security model

Pricing is hard-coded server-side and validated again inside Postgres. The browser can request only one of the three fixed packs. Credits are added only after Stripe reports a Checkout Session as paid. Fulfilment uses the Stripe Checkout Session ID as a unique idempotency key, so refreshes, webhook retries, and duplicate callbacks cannot award the same purchase twice.

The checkout success page also asks the backend to retrieve the Checkout Session directly from Stripe. This makes the balance update promptly after return while the signed Stripe webhook remains the reliable server-to-server fulfilment route.

---

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

## V50 — standard story length + 3 free story credits

V50 removes the Short / Medium / Long selector. Every new story now uses one standard Moonbeam format: opening + 4 story pages + closing (6 reading spreads).

It also adds the first real server-enforced credit system:
- every account gets 3 free story credits;
- one successful new story consumes one credit;
- reopening saved stories consumes no credits;
- image generation and narration do not separately consume credits;
- the balance is stored in Supabase, not localStorage;
- `/api/generate` now requires a valid signed-in Moonbeam session and reserves the credit server-side before calling OpenAI;
- known OpenAI/story-format failures refund the reserved credit;
- no payment checkout is included yet. This is the free-credit foundation we can connect to Stripe next.

### Required before deploying V50
Run `SUPABASE_V50_CREDITS.sql` once in Supabase SQL Editor. It creates the credit table/functions, backfills existing accounts with 3 credits, and gives future accounts 3 credits automatically.

## V52 — stricter introductory-trial abuse protection
Before deploying V52, run `SUPABASE_V52_TRIAL_ABUSE.sql` once in Supabase SQL Editor.
New accounts now start with zero credits until a verified-email account claims the introductory trial. The server grants three free credits only once per browser/device installation, with a light network guard (maximum one introductory-trial claim from the same network hash in any rolling 30-day period). Existing accounts that already received V50 credits are unchanged. Device/network identifiers are HMAC-hashed server-side before storage; raw IP addresses and raw device IDs are not stored. This is designed to deter casual repeat-account abuse, not to provide perfect hardware identity.

## V55 — inbound support/privacy email forwarding

V55 adds `api/resend-inbound.js` for Resend's `email.received` webhook. It forwards only the two public Moonbeam addresses:

- `support@moonbeamstories.co.uk`
- `privacy@moonbeamstories.co.uk`

All other addresses received at the root domain are deliberately ignored by the webhook (they remain visible in Resend's Receiving dashboard according to Resend retention).

### Vercel environment variables required for V55

Add these to **Production** before redeploying:

- `RESEND_API_KEY` — a Resend API key with permission to read/forward received email and send via the verified `mail.moonbeamstories.co.uk` sending domain.
- `RESEND_WEBHOOK_SECRET` — the signing secret (`whsec_...`) for the Resend webhook pointing at `https://www.moonbeamstories.co.uk/api/resend-inbound` and listening to `email.received`.
- `SUPPORT_FORWARD_TO` — the existing mailbox that should receive forwarded support messages.
- `PRIVACY_FORWARD_TO` — optional. If omitted, privacy mail goes to `SUPPORT_FORWARD_TO` too.
- `RESEND_FORWARD_FROM` — optional. Defaults to `Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>`.

### Resend webhook

Create one webhook endpoint:

`https://www.moonbeamstories.co.uk/api/resend-inbound`

Select only the `email.received` event. Copy its signing secret into `RESEND_WEBHOOK_SECRET`, then redeploy Production so Vercel picks up the variables.

No Supabase SQL changes are required for V55.

## V58
- Makes the checkout consent wording clearer and less alarming while preserving the required immediate-supply acknowledgement.
- Adds a self-healing checkout UI safeguard so the consent checkbox is inserted if an older cached HTML shell is missing it.
- No Supabase SQL or Stripe configuration changes from V57.


## V59
Checkout consent wording shortened: no prominent reference to refunds, statutory rights or the 14-day period; express immediate-supply consent remains required. No database migration or Stripe configuration change.


## V60 — per-purchase first-use digital supply acknowledgement

- Removes the consent checkbox from the Stripe credit-purchase modal and restores the simple Terms / Refund Policy / Privacy Policy line.
- Tracks new trial and paid credits in server-side credit batches while preserving all existing balances as legacy credits.
- Shows the digital-supply acknowledgement only when a user first tries to create a story from a newly purchased credit pack.
- Records consent against that specific purchase; the rest of that pack can then be used without repeating the checkbox.
- A later purchase creates a new batch and requires one new acknowledgement on the next Create Story action; each purchased pack is acknowledged once.
- Free introductory credits do not require this acknowledgement.
- Sends a confirmation email after a new paid-pack acknowledgement is recorded.
- Refund reconciliation removes unused credits from the exact V60 purchase batch where possible.
- Run `SUPABASE_V60_PER_PURCHASE_CONSENT.sql` before deploying the V60 code.


## V62
- Paid-pack first-use consent is now shown quietly in grey as soon as it is required.
- If Create Story is pressed without ticking it, the existing red flash/focus warning appears.
- No SQL, Stripe, or environment-variable changes from V61.


## V63
Nine-locale localisation foundation, globe selector, Brazilian Portuguese, Polish, and improved locale-specific narration/prosody. No database migration required.

## V64
- Completes the Polish interface localisation that was falling back to English in parts of V63.
- Localises the “Signed in as …” account status in every supported locale.
- No SQL, Stripe, or environment-variable changes.

## V65 — homepage, stationary desktop navigation and animated book
- Adds a public Moonbeam Stories marketing homepage with a clear product introduction, three-step explanation, pricing, and the existing photo-to-story visual as the main demonstration asset.
- Keeps the marketing homepage scrollable, while the actual desktop application becomes a stationary viewport with discrete setup pages and Previous / Next navigation instead of a long scrolling form.
- Adds desktop left/right keyboard navigation when focus is not inside a form field.
- Adds a lightweight browser-only physical page-turn transition to the desktop storybook. It uses no additional OpenAI/API calls and respects `prefers-reduced-motion`.
- Preserves the existing portrait-phone swipe reader rather than forcing the desktop book metaphor onto mobile.
- Localises the dynamic story-credit balance copy in all nine supported locales, including “18 story credits remaining. One new story uses one credit.” and the zero/checking/free states.
- Includes the V62–V65 release history in README.
- No Supabase SQL, Stripe, or environment-variable changes.


## V66 — Navigation and full-screen book refinement
- Enlarged desktop setup navigation into obvious translucent edge arrows; the first Back arrow now returns to the public homepage.
- Moved Saved Stories beneath Make Tonight's Story with explicit no-extra-credit replay messaging.
- Desktop story reader now occupies the full browser viewport.
- Read-it-myself mode no longer shows narration controls.
- Save Story and New Story controls appear only on the closing spread.
- Replaced the V65 wobble transition with a 3D curved-corner page swoosh.
- Kept portrait-phone swipe architecture intact while sharing the Saved Stories placement change.

## V67 — saved-story translation and cost-safe replay
- Includes all V66 navigation, full-screen reader, saved-story placement and page-turn refinements.
- Saved stories now reopen in **Read it myself** mode only, preventing repeat TTS API charges from library replays.
- Adds one-off text translation of a cloud-saved story into any of Moonbeam's nine supported locales without using another story credit.
- Translations preserve the original page structure and reuse the original illustration prompts/cache identity, so translating does not deliberately regenerate or alter the artwork.
- Each translated text version is stored on the saved story and reused on subsequent opens; the AI translation call is therefore made only once per story/language combination.
- Adds `SUPABASE_V67_SAVED_TRANSLATIONS.sql`. Run this SQL before deploying the V67 code.
- No Stripe or Vercel environment-variable changes are required.
