# Moonbeam Stories V250.59

## V250.59 — V250.53 illustration behaviour restored + Optional Male/Female retained

This build deliberately restores the **V250.53 illustration and cover-generation architecture**.

### Restored exactly from the working V250.53 illustration flow
- No pre-generation of all six interior illustrations before the reader opens.
- No “cover generated last from all six pages” pipeline.
- No multi-image cover reference-board/request changes.
- No V250.56/V250.57 illustration display/preload changes.
- Cover and interior generation timing/caching are back to the V250.53 behaviour.
- The working Instagram carousel/gallery behaviour and repaired hourglass animation remain.

### Retained from the later Cast work
- Human Cast members have an **Optional** field with two choices: **Male** and **Female**.
- The radio controls use the corrected desktop/mobile alignment.
- The optional value is stored in `cast_members` and passed with the Cast data.
- A Cast member marked **Male** receives a narrow anti-hair-accessory instruction: do not invent decorative hair clips, bows, barrettes, star ornaments, tiaras or similar accessories unless clearly present in the uploaded reference photo or explicitly required by the story.

### Supabase
Run **SUPABASE_V250_CAST_OPTIONAL.sql** if the `gender` column has not already been added. The migration is idempotent.
