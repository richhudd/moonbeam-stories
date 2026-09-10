# Moonbeam Stories V26

V26 replaces the portrait-phone setup form with a five-page horizontal swipe deck. There is no vertical page scrolling on phone portrait. Story reading also becomes a fixed full-screen experience so the cover/book remains within the viewport. Desktop/tablet layout remains conventional.

# Moonbeam Stories V25

V25 adds optional child-photo character matching to the V24 build.

## New in V25
- A parent can choose a JPG, PNG or WebP photo in the child profile area.
- The photo is resized in the browser before use.
- The photo is stored only in IndexedDB on that device; it is not written to the `child_profiles` or `saved_stories` Supabase tables.
- The parent can toggle use of the photo on/off or remove it at any time.
- When enabled, the resized photo is sent with each illustration request as an identity reference.
- `/api/illustrate.js` automatically uses the Image Edit endpoint when a reference photo is supplied, and the normal Image Generation endpoint otherwise.
- The illustration prompt explicitly asks the model to preserve recognisable facial features, hair, approximate skin tone and age while translating the child into the existing Moonbeam storybook style.
- Cover and interior images both use the same child reference for continuity.
- Cached illustration keys include the reference-photo fingerprint so a photo change cannot accidentally reuse an older character image.
- Saved stories do not duplicate the child photo inside local/cloud story data. On the same device, Moonbeam reconnects the relevant profile photo when reopening a saved story.

## Privacy behaviour
The UI tells parents that the photo stays on the device and is sent only when an illustration is created. It is not stored in the Moonbeam Supabase cloud database by this build. The image is necessarily sent to the configured OpenAI image API when it is used to make an illustration.

## Existing V24 features retained
- Parent Supabase authentication and password recovery
- Child profiles and cloud saved stories
- Eight languages/localised UI
- Story values, length and tone controls
- Generated cover and page illustrations
- Illustration prefetching and persistent illustration cache
- Portrait-phone physical page turns and swipe navigation
- Footer collision protection and text fitting

## Deployment
Upload the contents of this folder to the GitHub repository used by the Vercel project. No `vercel.json` is required. Keep `OPENAI_API_KEY` configured in Vercel.
