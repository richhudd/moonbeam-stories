# Moonbeam Stories V250.56

## V250.56 — foolproof cover generation + optional Male/Female cast marker

This build changes the generation flow so the book does **not open** until all illustrations are finished.

### Generation flow
- Moonbeam now generates **all interior book illustrations first** (opening page, all story pages, and closing page).
- Only after all interior illustrations are complete does Moonbeam generate the **cover**.
- The cover is generated **last**, using:
  - the **full text of the whole book**
  - the uploaded Cast photo references
  - **all completed interior illustrations** as authoritative visual references
- The **Preparing your story** waiting screen and hourglass remain visible until the entire book, including the cover, has finished generating.
- The reader opens only once the full book is ready.

### Cover consistency
- The cover is no longer an early speculative image.
- It is now generated from the fully established visual world of the finished book, so style and likeness should match the interior much more closely.

### Cast optional marker
- Replaces the previous gender dropdown UI.
- Human Cast members now have an **Optional** field with two single-choice options: **Male** and **Female**.
- If a Cast member is marked **Male**, Moonbeam is instructed not to invent decorative hair accessories unless they are clearly present in the uploaded photo or explicitly required by the story.
- The marker remains optional and is not shown for pets.

### Supabase
- Includes an updated migration: **SUPABASE_V250_CAST_OPTIONAL.sql**
- This adds the `gender` column (used internally) and constrains values to `male` or `female`.
