# V104 — one extra mobile text line

V104 is a portrait-mobile-only reader adjustment based on V103.

- Reserves 28px (approximately one full story-text line) for prose on every mobile story page.
- Takes that space directly from illustration height.
- Keeps V103 slim Previous / page count / Turn Page controls.
- Does not change story length, typography, desktop reader, saved-story translation, or illustration generation/storage.


- Mobile portrait only: reduced the fixed Previous / page / Turn Page bar height, padding and gaps.
- Buttons are now 38px high and the bar uses 4px vertical padding.
- V101's geometry already measures the navigation bar's real top edge, so the recovered height is automatically returned to the book/text region.
- Story generation, story length, desktop reader, saved artwork and saved-story translation are unchanged.

# Moonbeam Stories V81

# Moonbeam Stories V70

V69 is a corrective navigation release on top of V68. It replaces the fragile desktop horizontal-scroll setup navigation with explicit single-page desktop rendering, forces the large edge arrows in critical inline CSS, cache-busts the V69 CSS/JS assets, and confirms Saved Stories is embedded beneath Make Tonight's Story rather than being a setup step.

## V69 deployment

Deploy the complete contents of the `moonbeam-v69` folder. There is **no new V69 SQL**. If `SUPABASE_V68_COMPLETE_SAVED_BOOKS.sql` has already been run for V68, do not run it again. No Stripe or Vercel environment-variable changes are required.

## V69 hard acceptance checks

- Desktop setup has exactly six pages; there is no Saved Stories setup page.
- Back/Next are large translucent controls fixed halfway down the left/right viewport edges.
- Back on the first setup page returns to the public homepage.
- Saved Stories is inside Story Preferences, directly below Make Tonight's Story.
- V69 references `/styles.css?v=69`, `/i18n.js?v=69`, and `/app.js?v=69` so a browser cannot silently keep the previous release assets.

---

## V61

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

## V68 — corrective reader/navigation release + complete cloud-saved books
- Supersedes the incomplete V66/V67 UI implementation while retaining V67 translation support.
- Makes desktop setup navigation unmistakable: large translucent edge controls on the far left/right, with Back from the first setup screen returning to the Moonbeam homepage.
- Uses an explicit desktop story-mode state so the reader takes over the full browser viewport rather than depending only on CSS relational selectors.
- Keeps Save Story / New Story for the closing spread and keeps narration controls out of Read it myself mode.
- Keeps Saved Stories beneath Make Tonight's Story and preserves portrait-phone swipe architecture.
- Reworks the desktop page turn into a longer 3D sweep with a lifted/curved outside corner, moving shadow and spine crossing.
- Retains the nine-locale dynamic story-credit balance patch introduced in V65.
- Saved-story replay is now hard-separated from generation: opening a cloud-saved story does not load the child reference photo and the saved-story illustration/cover loaders never call the illustration API.
- A newly cloud-saved story now uploads its exact finished cover plus all six finished story illustrations to the private `saved-story-art` Supabase Storage bucket. The database stores only private object paths in `saved_stories.saved_assets`.
- Complete saved books therefore reopen with the same artwork on another signed-in device and remain intact if the source child photo is later removed.
- Saved stories remain Read it myself only, so replay cannot call TTS. Translation remains the only optional AI action from the saved library; each translated language is stored and reused.
- Older saved stories created before V68 are not silently regenerated. If they have no cloud-saved artwork, Moonbeam reports the missing saved image instead of spending image-generation allowance.
- Run `SUPABASE_V68_COMPLETE_SAVED_BOOKS.sql` in Supabase before deploying V68. No Stripe or Vercel environment-variable changes are required.


## V69 — corrective setup navigation
- Replaces desktop scroll-position navigation with explicit one-setup-page-at-a-time rendering.
- Forces large translucent left/right viewport navigation in inline critical CSS.
- Removes any possibility of Saved Stories being a setup step; it remains inline beneath Make Tonight's Story.
- Back from the first setup page returns to the public homepage; desktop keyboard Back does the same.
- Corrects setup progress from seven pages to six.
- Cache-busts V69 CSS and JavaScript assets to prevent an older deployed interface being reused by the browser.
- No new SQL, Stripe, or environment-variable changes beyond the V68 requirements.


## V70 — Vercel Hobby deployment repair

V70 keeps the V69 application/UI work but fixes the deployment architecture after Vercel rejected the recent releases for exceeding the Hobby-plan limit of 12 Serverless Functions. The three shared backend helper modules (`_credits.js`, `_stripe.js`, and `_usage.js`) live at the repository root, outside `/api`, where they remain reusable Node modules rather than deployable API endpoints. `/api` now contains exactly 12 serverless function files. No Supabase, Stripe, Resend, or environment-variable changes are required for this repair.

Deployment acceptance rule: after uploading to GitHub, confirm the Vercel deployment status is **Ready** before testing the website.


## V71 — single-screen homepage correction

- Fixed the public homepage rendering the hidden product/setup app underneath it on desktop.
- Added an explicit `.app-product.hidden` rule so the setup navigation cannot appear on the public homepage.
- Desktop public homepage is now a single non-scrolling hero screen; the lower marketing sections are suppressed there.
- Homepage therefore has no setup arrows; the Create their first story button remains the route into setup.
- Setup pages and their existing working previous/next arrows are unchanged.
- No Supabase/database changes.


## V72 — homepage-to-account navigation correction
- The homepage **Create their first story** button now always opens the Account / Sign in page first.
- The homepage secondary CTA follows the same account-first route.
- Back navigation remains Homepage ← Account ← Child profile in the expected order.
- V71 single-screen homepage fix is retained unchanged.
- No database migration is required.


## V73 — clear in-card setup navigation
- Removed the large translucent/watermark setup arrows completely.
- Added clear **Back** and **Enter** buttons inside each white setup card.
- The account page cannot be bypassed with Enter while signed out; the parent must sign in or create an account first.
- The final Story Preferences page keeps its existing story-generation controls and has no redundant Enter button.
- Story-reader page controls and mobile story navigation are unchanged.
- Retains the V71 single-homepage fix and V72 Homepage → Account routing.
- No Supabase migration is required for V73.


## V74 — hard authentication gate
- The Account/Login page is now a hard gate: signed-out users cannot navigate forward by Enter, setup dots, keyboard arrows, or mobile swipe.
- The Enter button is hidden while signed out and appears after authentication succeeds.
- Back navigation to the public homepage remains available.
- No Supabase schema changes are required.

## V75 — centred equal-size setup buttons
- Back and Enter are now exactly the same size on each setup page.
- The navigation pair is centred together at the bottom of the white setup card.
- On the signed-out Account page, the single Back button remains centred while Enter stays hidden behind the V74 authentication gate.
- No navigation logic, story-reader controls, authentication rules, or database schema were changed.

## V76 — homepage language gateway
- The globe language selector now appears only on the public homepage; the internal setup selector is hidden.
- Changing language on the homepage immediately translates the visible homepage interface, including Sign in, headline, supporting copy, CTA and free-trial message, while keeping the Moonbeam Stories brand unchanged.
- The selected locale is persisted and drives the login/setup/story interface as soon as the visitor enters the app.
- The existing homepage demonstration artwork is unchanged.
- No Supabase migration is required.


## V77 — homepage-only language selector
- Fixed the V76 selector leak caused by the later `.language-globe` display rule overriding the generic `.hidden` class.
- The homepage globe is now the only visible language selector in the application.
- The internal locale select remains hidden in the DOM so existing localisation/state logic continues to work without changing authentication, setup navigation, story generation, saved stories, payments, or legal behaviour.
- No Supabase migration is required.


## V78 — remove redundant signed-in Parent Account step
- The Account screen is now used only for sign-in, account creation, and password recovery.
- After successful authentication, Moonbeam proceeds directly to “Who’s tonight’s story for?” instead of showing a redundant signed-in Parent Account page.
- Visitors who are already signed in also go directly from the homepage into child selection.
- Sign out remains available as a small, unobtrusive control in the application header.
- The authentication gate remains intact for signed-out visitors.
- No Supabase migration is required.


## V79 — profile deletion moved into Saved profiles menu
- Removed the large Delete profile button from the child-selection card.
- When a saved child is selected, the Saved child profile dropdown now includes a separated “Delete profile [name]…” management option at the bottom.
- Choosing it asks for confirmation before deletion; saved stories remain untouched.
- No Supabase migration is required.


## V80 — desktop drag-and-drop child photo upload
- Desktop users can now drag a JPG, PNG or WebP directly onto the child-photo preview box, as well as using Choose photo.
- The drop zone highlights while a file is dragged over it and uses the existing validated resize, IndexedDB storage, profile association and illustration-reference pipeline.
- The drag-and-drop hint is localised across all nine supported locales and hidden on touch/mobile layouts.
- No Supabase migration is required.


## V81 — immersive desktop reader + cover-button repair
- Repairs the V80 cover regression by binding **Read it myself** and **Read it to me** directly to the reader transition, while retaining the existing delegated story controls as a fallback.
- Desktop cover now takes over the full viewport. The generated cover is enlarged with `object-fit: contain` so the complete artwork remains visible rather than being cropped.
- Desktop reading spreads fill the viewport; the illustration page uses its full half-screen and reader controls remain overlays rather than consuming book space.
- Read-it-myself still contains no narration control; Read-it-to-me retains the existing narration flow.
- Keeps the existing V68 physical 3D page-turn architecture (perspective, spine crossing, moving shadow and curved/lifted sheet) and ensures it operates over the full-screen book.
- Portrait-phone/mobile reader and photo-upload behaviour are unchanged.
- No Supabase SQL, Stripe, Vercel environment-variable or API changes are required.

## V81 complete package

This package includes the 12 existing V80 API functions unchanged. V81 requires no Supabase SQL, Stripe, API, or environment-variable changes.


## V82 — reader recovery and true fullscreen desktop cover
- Rebuilt the V81 desktop CSS using real stylesheet line breaks; the malformed literal escape block is removed.
- Desktop cover now occupies the viewport and preserves the complete portrait cover with `object-fit: contain`, with a painted backdrop behind unused side space.
- Read it myself and Read it to me use direct explicit click handlers and force the cover out/book into view before rendering page 1.
- Added a persistent top-left close/back control so the story reader can never trap the parent.
- Desktop spreads remain full viewport with overlaid edge navigation, page indicator, narration and end controls.
- Existing page-turn animation retained and checked against the fullscreen book geometry.
- Mobile rules and behaviour are unchanged.
- No Supabase migration required.

## V83 — explicit Back / Next story navigation
- Retires the desktop edge-arrow navigation in favour of clearly labelled **Back** and **Next / Turn page** buttons overlaid at the bottom of every open story spread.
- The first spread's Back button returns to the cover; later Back buttons return to the previous spread.
- The Next button advances through the story using the existing physical page-turn animation and disappears on the final spread, where the existing end-of-story actions remain available.
- Back and Next now have direct click handlers, so desktop page navigation no longer depends on invisible edge hit-zones or delegated click handling.
- The persistent top-left close control remains available as an escape route from the reader.
- Fullscreen cover/spread layout from V82 is retained. No Supabase, API, Stripe or environment-variable changes are required.


## V84 — definitive desktop page-navigation repair
- Fixes the root cause of the page-2 navigation deadlock: the old page-turn code rendered the next page halfway through the animation, which deleted the animation sheet before `animationend` and could leave the book permanently marked `turning`.
- Page changes now happen only after the turn has been fully cleaned up; a 950 ms fail-safe guarantees cleanup even if the browser does not fire `animationend`.
- Back and Next remain explicit desktop buttons with direct click handlers. Back on the first spread returns to the cover.
- Cover reading choices are compact; on wide desktop they move into the right-hand surround so they cannot cover the generated title/artwork.
- Mobile behaviour, APIs, Supabase, Stripe and environment variables are unchanged.


## V85 — reliable navigation, dedicated ending, desktop cover polish
- Removed the page-turn/swoosh animation system completely. Back and Next now render the adjacent page immediately, with no `turning` lock, animation event, or timeout dependency.
- Added a dedicated final **The End** page after the closing story page, with Save story and New story actions. Back returns to the closing story page.
- Narrated reading advances through the closing story page to The End, but The End itself is not narrated.
- Desktop cover keeps the complete portrait artwork uncropped at full viewport height, with the same artwork enlarged/blurred behind it to fill landscape side space.
- Desktop Read it myself / Read it to me controls are compact and live in the side area on wide screens so they do not obscure cover titles.
- The × escape control remains available and returns to the Moonbeam setup/home flow.
- No API or Supabase migration changes.

## V86 — simplified creation architecture
- Replaces the six sparse setup pages with authentication plus two substantial creation screens: **Your child** and **Tonight's story**.
- Combines saved child selection, name, age, interests, dislikes and optional child photo into the single Your child screen.
- Keeps tone, values, credits, consent, generation and Saved Stories together on Tonight's story.
- Removes setup dots, swipe paging, horizontal setup scrolling and keyboard-arrow setup navigation. Only visible buttons change creation screens.
- Signed-out visitors are still hard-gated at Account; signed-in visitors enter directly at Your child.
- Story generation now presents the existing preparation indicator as a dedicated full-viewport temporary state before the generated cover opens.
- Reader architecture from V85 is unchanged: simple Back/Next, no page-turn animation, and the dedicated The End page.
- No API, Supabase, Stripe or environment-variable changes are required.

## V87 — setup polish, saved-story library, narration teardown, Home route
- Tightens the desktop Story Preferences screen so the complete setup card fits the viewport without page scrolling.
- Redesigns Saved Stories as compact library cards. The read-only/no-credit explanation is shown once at library level, and each saved story has Read/Open, language/translation, and confirmed Delete controls.
- Hardens narration teardown: every book-page render stops and disposes any active narration audio first, invalidates pending narration starts, and prevents audio from a page that has been left continuing underneath the destination page.
- Makes the Moonbeam Stories setup header/logo a permanent route back to the public homepage without signing the parent out.
- No API, Supabase schema, Stripe, or environment-variable changes are required.


## V88 — saved-story translation ownership fix
- Saved-story translation now retrieves and updates the story using the signed-in parent’s own Supabase session and the same Row Level Security path used by the browser library.
- Removes the separate server-side `parent_id` filter that could incorrectly report an otherwise readable saved story as missing.
- Database lookup failures are now distinguished from a genuinely unavailable story instead of both being reported as “Saved story not found.”
- Translation ownership remains protected by Supabase RLS; users cannot translate or update another account’s saved stories.
- No Supabase migration is required.


## V89 — cover/book reader-state isolation
- Fixes the opening-page Back navigation so returning to the cover completely hides the rendered story spread instead of leaving page 1 visible underneath the cover.
- Cover and book are now explicit mutually exclusive reader states using class, hidden attribute, inline display protection, and a defensive CSS rule.
- Returning to the cover also tears down narration immediately and hides book navigation controls before revealing the cover.
- Starting from the cover cleanly restores the book and controls. No API, Supabase, Stripe, or environment-variable changes are required.


## V90 RC1
- Mobile landing page is a true one-screen layout: no scrolling and the primary CTA remains visible, including short phone viewports.
- Reader close (×) now returns to the public homepage without signing the parent out; New Story has a separate route back to child setup.
- Story-credit reservation is refunded from the outer generation failure path until generation has positively committed.
- Production health endpoint no longer exposes configuration details.
- Release-candidate hardening only; saved stories remain intentionally read-only/no re-narration.


## V91 — mobile homepage hero redesign
- Mobile-only homepage redesign; desktop homepage is unchanged.
- The transformation artwork now receives the flexible majority of the available mobile viewport instead of being capped at 22–29dvh.
- Mobile copy, spacing, and controls compress before the hero artwork does, keeping the CTA visible without scrolling.
- Extra-short phones hide the kicker and tighten copy/spacing while preserving the artwork as the dominant element.
- Retains all V90 RC1 hardening changes.

## V92 — mobile reader and deterministic illustration pipeline
- Mobile Story Preferences gives Tone the full available width and keeps Make Tonight's Story below Story Values without overlap.
- Mobile reader Previous/Next controls are visible as a safe-area-aware bottom overlay.
- Illustration prefetch is sequential: only the next physical illustration is prepared in the background while the current page is being read.
- Existing per-page in-flight/persistent caching prevents duplicate requests for the same page.
- Automatic duplicate-image regeneration was removed so Moonbeam never silently spends a second image slot for one physical page.
- Illustration prompts explicitly forbid collages, grids, split screens and multi-panel output.
- Unexpected illustration endpoint failures now refund a reserved image-generation slot.


## V93 — mobile setup scrolling and reader controls
- Mobile setup screens now use normal vertical scrolling when their condensed form content exceeds the phone viewport; the homepage remains a fixed no-scroll hero.
- Story Preferences is a single continuous scroll, including Saved Stories, and its navigation no longer overlays form controls.
- Mobile Previous/Next reader buttons now explicitly reset legacy desktop edge-hit-zone positioning so the actual labelled controls remain visible and tappable above the safe area.
- Desktop layout and V92 illustration scheduling/allowance protections are unchanged.

## V95 — one free introductory story
- Reduces the introductory offer for new eligible trial claims from three free stories to one free story.
- Existing users keep their current balances; no credits are removed or reset.
- Updates the trial copy in every supported interface language and the device-used message.
- Run `SUPABASE_V94_ONE_FREE_STORY.sql` once in Supabase SQL Editor before deploying V95 so the server-side trial grant changes from 3 credits to 1.
- Paid packs remain unchanged: 10 for £9.99, 25 for £19.99, and 50 for £34.99.


## V95
- Fixed saved-story translation lookup/save to use the verified parent ID with the server service role, avoiding serverless RLS/session lookup failures while retaining ownership checks.
- Mobile Story Preferences now uses strict normal document flow: Story Values → Make Tonight's Story → Saved Stories → Back. The create and Back buttons cannot float over form content.
- No new database migration is required for V95.

## V96 — saved-story reliability
- Fixed saved-story translation authentication to use the shared Supabase `adminHeaders()` helper, including compatibility with modern `sb_secret_` keys.
- New saves snapshot the exact open book, retain finished artwork on the book object, upload every cover/page asset, and verify `saved_assets` was actually persisted before reporting success.
- Saved stories missing cloud artwork now attempt a zero-credit recovery from the browser's existing persistent illustration cache and, when all page images are found, repair the private Storage objects and `saved_assets` record automatically.
- No new SQL migration is required for V96.


## V97 — saved-book language editions
- Rebuilt Saved Stories around one canonical saved book, one permanent illustration set, and translations stored on demand in the existing `translations` JSON column.
- Reading and translating are now separate actions. `Read in` lists only editions that already exist; `Translate into another language` lists only missing editions.
- A successful translation is cached permanently on the same saved story and does not use a story credit.
- Opening a saved edition no longer changes Moonbeam's interface language. Story language and interface language are independent.
- Saved artwork remains attached to the canonical book and is reused unchanged by every language edition.
- No new SQL migration is required for V97; this uses the existing V67/V68 schema.


## V99 — mobile reader layout repair
- Portrait mobile story pages now maximise illustration size while preserving a small top inset.
- Removed the redundant in-page mobile page counter; the counter between Previous and Turn Page remains.
- Restored measured text fitting: typography compacts only as needed, then illustration height yields only as much as necessary.
- Added an internal text-scroll safety fallback so generated story text is never silently clipped.
- Desktop reader and Saved Stories translation code are unchanged from V97.


## V100 — mobile final-line clearance
- Keeps the V99 mobile-reader architecture intact.
- Adds a one-rendered-line safety margin to the mobile text-fit test so Safari cannot accept a page with a partially painted final line.
- Retains the single page counter in the fixed navigation bar and the prominent mobile illustration layout.
- Corrects the build metadata and cache references to V100.


## V101
Rebuilt the portrait-mobile live reader around measured physical boundaries: the book ends above the fixed navigation, with separate image and text regions. Removed guessed bottom padding from the active V101 layout; text fitting now measures only the dedicated text region and falls back to internal text scrolling rather than clipping. Desktop and saved-story translation behavior are unchanged.


## V102
Portrait-mobile reader: removed the chapter/page label (Page 1, Page 2, etc.) above story prose so the text begins immediately below the illustration. The fixed bottom navigation remains the sole page-position indicator. Desktop reader is unchanged.