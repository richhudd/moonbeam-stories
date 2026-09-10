# Moonbeam Stories V38

V38 prevents repeated consecutive illustrations.

- Every illustration prompt is now anchored to that page's actual story text and scene number.
- Previous-page text is supplied only as continuity context with an explicit instruction not to re-illustrate it.
- Prompts require a fresh composition, camera angle/action and scene-specific visual details on every page.
- Illustration cache keys now include a V38 version and prompt hash, so older cached duplicates are not reused after deployment.
- If the image service ever returns an exactly identical image for two consecutive pages, Moonbeam automatically regenerates the latter once with a stronger anti-duplicate instruction.
- All V37 mobile cover/narration fixes are retained.


## V41
- Moves the portrait-phone page counter out of the illustration and into a reserved strip below the text.
- Mobile text fitting now reserves space for the counter so it cannot cover the final line.


## V41
- On portrait phones, the narration play/pause control is moved out of the illustration and into the reserved lower reader strip beside the page counter.
- Illustrations are now kept completely free of reader controls and counters.


## V41
- Narration now follows the selected regional language: UK English uses a British accent, US English an American accent, Spain Spanish a Peninsular Spanish accent, Latin American Spanish a neutral Latin American accent, and equivalent regional guidance is used for French, German, Italian and European Portuguese.
