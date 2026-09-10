# Moonbeam Stories V29

V29 builds on V28 with two reliability/feedback improvements:

- Story generation now tolerates model output wrapped in extra text/code fences, extracts balanced JSON, normalises the story shape, and automatically asks the model to repair malformed/truncated output before showing an error.
- Tapping **Make Tonight's Story** now replaces the button with an animated hourglass panel and a clear “Preparing your story…” message until generation completes or fails. The loading copy is adapted for all supported language families.

All V28 mobile layout, full-screen swipe reader, Supabase profiles/saved stories, child-photo reference, and illustration-prefetch/cache behaviour remain in place.


V30: Fixes a mobile reader regression where the cover/title layer could remain above story text and illustrations. Cover visibility now uses both the hidden attribute and explicit high-specificity CSS, so the title exists only on the front cover.
