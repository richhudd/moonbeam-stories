# Moonbeam Stories V38

V38 prevents repeated consecutive illustrations.

- Every illustration prompt is now anchored to that page's actual story text and scene number.
- Previous-page text is supplied only as continuity context with an explicit instruction not to re-illustrate it.
- Prompts require a fresh composition, camera angle/action and scene-specific visual details on every page.
- Illustration cache keys now include a V38 version and prompt hash, so older cached duplicates are not reused after deployment.
- If the image service ever returns an exactly identical image for two consecutive pages, Moonbeam automatically regenerates the latter once with a stronger anti-duplicate instruction.
- All V37 mobile cover/narration fixes are retained.


## V44
- Moves the portrait-phone page counter out of the illustration and into a reserved strip below the text.
- Mobile text fitting now reserves space for the counter so it cannot cover the final line.


## V44
- On portrait phones, the narration play/pause control is moved out of the illustration and into the reserved lower reader strip beside the page counter.
- Illustrations are now kept completely free of reader controls and counters.


## V44
- Narration now follows the selected regional language: UK English uses a British accent, US English an American accent, Spain Spanish a Peninsular Spanish accent, Latin American Spanish a neutral Latin American accent, and equivalent regional guidance is used for French, German, Italian and European Portuguese.


## V44
- Regional narration now changes the underlying OpenAI built-in voice as well as the accent instruction.
- UK English uses `fable` rather than the US-oriented `marin` used previously.
- Other language regions also have their own base voice selection.
- Narration still explicitly reinforces the selected regional pronunciation.

## V44
- Reworked the mobile cover rendering rather than adding another image repaint workaround.
- Portrait phones now paint the generated cover into a dedicated full-screen CSS background layer.
- The normal `<img>` cover remains available for desktop, but mobile no longer depends on Safari painting that element correctly on its first frame.
- The cover loading overlay is dismissed only after the background layer has had multiple paint frames.

## V44
- Restores and hardens child-photo identity references for cover and interior illustrations.
- When a photo is enabled, Moonbeam reloads it from local IndexedDB immediately before story generation if necessary.
- Reference-photo illustrations now use GPT-Image-2.5 Sunburst, which OpenAI positions for precise image editing, while non-photo generations remain on Flare for speed.
- New cache version prevents older non-photo illustrations being reused.
- The illustration endpoint confirms whether a reference photo was actually used; Moonbeam treats a dropped reference as an error instead of silently generating a generic child.
- Reworked mobile cover again: the generated base64 image is converted to a Blob URL and displayed through a real full-screen `<img>`, avoiding iPhone Safari's unreliable first paint of very large data URLs/CSS backgrounds.
