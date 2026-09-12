# V114 — persistent Read to Me for saved stories

V114 preserves the V113 mobile reader and reinstates Read to Me on saved stories.

Changes:
- saved stories now offer Read to Me from the cover
- narration already stored for a saved story/language/page is replayed without a new TTS request
- newly generated narration for an existing saved story is uploaded once and recorded in `saved_assets`
- narration generated before a new story is saved is persisted during the save
- the reading edition language drives narration independently of the interface language
- existing audio remains the master timeline for sentence highlighting and V112/V113 auto-scroll
- deleting a saved story also deletes its stored narration files
- V113 reader geometry, Safari scroll fix, chevrons and arrow navigation are unchanged

Deployment note: run `SUPABASE_V114_SAVED_NARRATION.sql` once so the existing private `saved-story-art` bucket accepts MP3 narration files.
