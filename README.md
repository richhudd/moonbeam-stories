# Moonbeam Stories V250.52

## V250.52 — Instagram carousel text slides captured in-browser

This build fixes the blank/garbled Instagram carousel text pages.

### What changed
- Instagram carousel text pages are now captured in the browser as finished 1080 × 1350 JPEGs before posting, using the same general approach already used for the composite cover capture.
- The ornate story-text pages are uploaded exactly from those browser-rendered captures instead of being re-rendered later on the server.
- The final “To be continued…” slide is also captured in-browser, while still respecting the saved story language.
- The full illustrated book is still added to the public gallery page exactly as before.

### Result
- Carousel slide 1 remains the captured cover.
- Slides 2, 4, 6 and 8 are now reliable text pages.
- Slides 3, 5, 7 and 9 remain illustration pages.
- Slide 10 remains the localized call-to-action page.

No Supabase SQL changes are required.
