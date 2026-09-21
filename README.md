# Moonbeam Stories V250.62

## V250.62 — Reels now add the full book to the Instagram gallery

This build starts from **V250.61** and changes only the Instagram publishing/gallery path. The story and illustration systems are untouched.

### Reel gallery behaviour fixed
- A successful **Post reel to Instagram** action now also ensures the complete saved book is present in the public Moonbeam Instagram gallery at `/instagram`, just like a carousel post.
- If that book is already in the gallery, the existing gallery entry is reused rather than creating a duplicate.
- If the Reel is posted before the carousel, Moonbeam creates the permanent gallery entry and a gallery cover from the already-saved cover artwork.
- If Reel publishing fails, a gallery entry created only for that failed attempt is rolled back.
- The temporary Reel preview/video is still cleaned up after a successful post.

### Carousel deduplication
- **Post carousel to Instagram** now also reuses an existing gallery entry for the same saved story.
- This means posting a Reel first and a carousel later (or vice versa) does not create duplicate copies of the same book in the Moonbeam Instagram gallery.

### Instagram controls and captions retained
- **Post carousel to Instagram** and **Post reel to Instagram** remain separate developer-only buttons.
- Reels are still generated only on demand after the Reel button is pressed.
- Both post types keep the same agreed caption and five hashtags:

[BOOK TITLE] ✨

A personalised Moonbeam story starring [CHILD NAME].

Swipe through to start the adventure, then read the full story via the link in our bio.

Create personalised, illustrated stories starring your own child at moonbeamstories.co.uk

#MoonbeamStories #PersonalisedStories #ChildrensBooks #BedtimeStories #Parenting

### API / illustration safety
- **12 callable API endpoints** remain. No API endpoint has been added.
- No SQL change is required.
- `api/generate.js` and `api/illustrate.js` remain unchanged from V250.59/V250.61.
- The restored illustration-generation behaviour and Optional Male/Female Cast field remain intact.
