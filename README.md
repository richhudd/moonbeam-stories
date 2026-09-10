# Moonbeam Stories V35

Adds optional audiobook narration while retaining normal parent/child reading.

## V35 changes
- Cover now offers **Read it myself** and **Read to me**.
- Read-it-myself keeps the existing silent swipe reader.
- Read-to-me uses OpenAI `gpt-4o-mini-tts` through `/api/narrate`.
- Illustration and story words remain visible while narration plays.
- Current sentence receives gentle approximate highlighting during playback.
- Narrated mode automatically advances to the next illustrated spread when a page finishes.
- A small floating play/pause control sits over the illustration instead of consuming layout space.
- Manual swiping still works; narration follows the newly selected page.
- The next page's narration is prefetched in narrated mode to reduce waiting.
- Existing V34 mobile illustration+text spread and all prior features are retained.

Deploy the contents of this folder to Vercel. It uses the existing `OPENAI_API_KEY` environment variable.

## V36
- Fixes the V35 portrait-iPhone regression that could render story spreads blank.
- Repairs malformed escaped-newline CSS introduced around the V34 mobile spread rules.
- Keeps illustration + matching text visible together on each mobile swipe page.
- Makes both cover choices (Read it myself / Read to me) fixed inside the iPhone safe viewport.
- Desktop/tablet audiobook behaviour is unchanged.
