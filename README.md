# V117 — simplified Saved Stories

V117 removes post-save story translation completely and simplifies Saved Stories to canonical replay.

Changes:
- removed all saved-story language selectors, edition lists, translation panels and translation buttons
- removed the saved-story translation client workflow
- removed `/api/translate-story.js`
- removed the obsolete V67 saved-translation migration from this deployment package
- saved books now reopen only in the language in which they were originally generated
- each saved story has one clear Replay button plus Delete for signed-in cloud stories
- V114 persistent Read to Me remains available from the reopened saved-book cover
- existing stored narration, illustrations, V113 reader layout, Safari scrolling fix, chevrons and narration auto-scroll are unchanged

Database note: no new SQL migration is required for V117. Existing translation data/columns in an already-deployed database can remain unused; V117 does not read or write them.


## V117
- Adds the same contextual pulsing double-chevron scroll cue to mobile setup pages whenever more content remains below the fold.
- Cue disappears at the bottom and reappears after scrolling upward. Desktop and the V113/V115 story-reader cue are unchanged.


V117: Saved-story Read to Me now regenerates audio only from the already-saved text; saved story text and illustrations are never regenerated. Persistent saved narration is no longer used. Mobile setup scroll cues now use rendered viewport geometry plus overflow as a fallback so they reflect content genuinely below the visible Safari viewport.
