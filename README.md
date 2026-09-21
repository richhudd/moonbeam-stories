# Moonbeam Stories V250.70

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
