# Moonbeam Stories V250.54

## V250.54 — dedicated cover only + no invented hair clips

- Removes the temporary phone-portrait fallback that showed page 1 as the cover and then replaced it. Moonbeam now waits for the real dedicated cover instead of visibly switching covers.
- Keeps the normal saved-story cover loading path unchanged; this only affects newly generated unsaved stories.
- Strengthens the dedicated cover prompt so the child’s underlying identity must stay faithful to the reference photo and must not be ethnically reinterpreted to match the setting.
- Strengthens the illustration prompt so unsupported decorative accessories are not invented or canonised across the book.
- Explicitly forbids invented hair clips, bows, barrettes, star ornaments and similar decorative hair accessories unless they are visible in the reference photo or explicitly required by the story.
- Explicitly tells the engine not to preserve accidental hallucinated accessories from earlier illustrations.
- No Supabase migration is required.
