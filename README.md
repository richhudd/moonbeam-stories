# V252.110

- Hardened backstage character naming after a Book Development surname-pool `max_output_tokens` failure.
- Name research now returns only the candidate list (no verbose source/notes payload), uses a 5,000-token ceiling for live web-backed selection, and requests a much smaller pool.
- Both Series Development and Book Development naming are now checkpointed through bounded fallbacks: normal live lookup → compact live lookup → conservative offline demographic fallback → single-candidate emergency fallback. Each fallback is a separate resumable request, so retries cannot recreate the old monolithic timeout problem.
- A `max_output_tokens` response no longer throws away the naming stage or leaves the book stuck on the same request. The next fallback mode is persisted in `autopilot_state` / `development_state`, and any live-research fallback is recorded as a warning.
- The hidden AI-default blacklist still applies to every candidate, including fallback candidates. No exemplar name lists were reintroduced.

# V252.107 — bomb-proof backstage research retries

- Raises the output allowance for backstage demographic-name, real-location and profession research so model reasoning/web-search overhead cannot starve the small structured payload.
- Profession research still checkpoints one role per request. A normal role lookup gets one saved compact retry if needed.
- If even the compact role lookup still returns incomplete because of `max_output_tokens`, the pipeline no longer deadlocks: it saves an explicit research warning for that role, applies a conservative “do not invent professional powers/procedures” constraint, and continues. No fabricated professional facts are inserted.
- The warning remains in the stored profession pack so later review can see that grounding was unavailable rather than silently pretending research succeeded.
- No new endpoint or database migration.

# V252.104 — de-biased validation + compact profession research

- Removes the experiment-derived title-template rejection list (including Fenland/probate/house-clearance/category terms). Title screening now uses only the hidden high-confidence anti-default/collision checks rather than our previous test concepts.
- Geography and profession research remain fully backstage. Creative models no longer receive complete fact packs: they receive only concise `must_respect` / `cannot_do` / workflow / correction constraints required to prevent factual errors. Supporting research notes, local colour and occupational trivia stay hidden so they cannot seed ideas.
- Rebuilds profession/practice research as one tiny role-discovery call followed by one tightly bounded live lookup per material role (maximum three), with a smaller per-role retry. This prevents one multi-role response from exhausting `max_output_tokens` and keeps unrelated occupational detail out of context.
- Makes the deterministic prose audit locale-aware. English lexical detectors (English stock phrases, `not X ... but Y`, English triplet conjunctions and English formulaic ending cues) run only for English-language books. Other languages still receive language-neutral rhythm, repetition, punctuation, chapter-shape and cross-book exact-phrase checks, while Sol's senior review remains in the selected language.
- Makes the cross-book structural regex audit locale-aware: English lexical beat/arc labels are no longer applied to non-English plans. Language-neutral structural information remains available without pretending English keywords are universal.
- Aligns Fiction Studio fallback locale to English (UK) in server and UI. Adds `SUPABASE_V252_103_FICTION_LANGUAGE_DEFAULT.sql` so the database default for future rows also becomes `en-GB`; existing series keep their stored locale.
- Keeps the explicit user-requested hard AI-name blacklist and backstage collision checks unchanged.
- Still 12 Vercel API routes. One Supabase default-only migration is included.

# V252.102 — zero-exemplar creative pipeline / backstage-only validation

- Removes the embedded place-exemplar/world-data module entirely. Astra/Luna are no longer shown lists of real towns, regional settlement samples, business-name templates, common surnames, baby-name cohorts or other example pools at any creative stage.
- Writing language is now explicitly language-only: it must not bias country, region, nationality, culture, profession, character names or setting. When the brief leaves setting open, Astra chooses anywhere freely on creative/commercial grounds.
- Character-name blacklists and demographic/cultural checks are now backstage. Creative prompts receive only abstract plausibility rules; the existing live web validator checks proposed names afterwards against authoritative cohort/cultural evidence where the material supplies enough context. It never returns alternative names or popularity lists.
- Place/business/institution/title anti-default blacklists remain server-side only. The creative models are told the principles but are not shown the banned examples, preventing the blacklist itself from becoming a source of priming.
- Live real-world validation is reactive only: it validates the people, organisations, fictional places and titles already proposed, and is forbidden to suggest alternatives, comparable businesses, nearby places or other creative ideas.
- Real-location research now researches only real places already named in the generated material. It may not list neighbouring towns/districts/attractions or alternative settings. Its fact pack is a hidden constraint layer for accuracy, not a place buffet.
- Profession/practice research remains reactive to roles already present in the fiction and is now explicitly forbidden to introduce or exemplify additional professions.
- Removes `_fiction_world_data.js`; the old V252.84/V252.86/V252.87 exemplar-seeding behaviour is superseded.
- No Supabase migration and no additional Vercel API route.

# V252.101 — bounded profession/practice research

- Profession/practice fact packs are now deliberately compact: fewer roles, fewer facts per section, and hard string/array bounds.
- If the first research response still reaches `max_output_tokens`, the existing Fiction Studio route automatically retries once with an ultra-compact schema before failing closed.
- Research quality rules remain intact: jurisdiction/era specificity, role boundaries, realistic access/workflow, authoritative sources, silent-use guidance, and non-actionable treatment of criminal roles.
- No Supabase migration and no additional Vercel API route.

## V252.99 — live profession/practice fact grounding

- Adds a live profession/practice fact pack after Series Development for central, recurring, technically specialised or legally constrained roles.
- Research is jurisdiction- and era-specific and covers day-to-day practice, role limits, hierarchy/collaboration, systems and lawful access, workflow/timescales, terminology/documents, regulation/ethics, mundane realities and common fiction errors.
- Book Development adds a book-specific profession addendum when a particular case introduces specialist work beyond the series-level pack.
- Series and book profession packs are authoritative throughout chapter planning, drafting, Sol senior review, Luna Revision, Line/style and Proof.
- Professional research is explicitly silent-use: it exists to prevent mistakes, not to provoke explanatory dialogue, technical showmanship or occupational info-dumps.
- Criminal/illicit roles are restricted to high-level realism, consequences and investigative context; the research layer must not provide actionable methods, optimisation, evasion tactics or exploitable security weaknesses.
- Uses the existing Fiction Studio endpoint and hosted web search; no new Vercel API route and no Supabase migration.

## V252.98 — silent-use location grounding

- Real-location fact packs remain authoritative for geography, transport, institutions and local context.
- Added an explicit silent-use rule: location research exists to prevent mistakes, not to generate exposition.
- Astra/Luna must not mention roads, travel times, landmarks, industries, institutions or local facts merely to demonstrate knowledge.
- Researched detail should appear only when it naturally matters to scene, plot, character experience or atmosphere; otherwise prefer omission.
- Live location research now also treats its output as a constraint/reference layer rather than a checklist for prose.
- No new API route and no Supabase migration.

# Moonbeam Stories V252.94

## V252.97 — stronger Sol anti-AI review + live pipeline reporting

- Sol's automated senior-editor quality gate now has an explicit synthetic-writing remit beyond the deterministic audit: overly orderly plotting, symmetrical arcs, excessive thematic neatness, over-efficient dialogue, over-articulate psychology, generic emotional language, repetitive reasoning, purpose-built scene detail, synthetic rhetorical polish and other material machine-like patterns.
- Senior reviews now return a dedicated `synthetic_writing_findings` list. Luna receives those findings directly during Revision, alongside the quality gate, strengths to preserve and chapter-specific actions. Empty findings are valid when no material problem exists.
- Every open Book page now has a live pipeline-status card that updates in place at each saved checkpoint and stage transition: draft chapter progress, senior-review round, Luna revision, Line/style, Proof, pause and completion.
- Book cards on the Series screen update live from the same running job, so current progress is visible without leaving and re-entering the screen.
- A completed background automatic pipeline no longer forces navigation away from the Series screen; its status changes to COMPLETE in place.
- No new Vercel API route or Supabase migration.

## V252.94 — disable Resume while an editorial pass is actively running
- The Developmental/Revision/Line/style/Proof action button now distinguishes a durable paused/interrupted run from a live in-browser background job.
- While the matching editorial job is actively running, the primary action is disabled and labelled “<stage> in progress” instead of offering an actionable Resume button.
- If the page is refreshed or the live job disappears while Supabase still records the pass as running, Resume becomes available again so interrupted work can continue from its saved checkpoint.
- No generation, editorial, database or API behaviour changed; this is a UI/state-guard fix only.


## V252.92 — structural anti-template audit + anti-overcoherence
- Adds a deterministic cross-book structural-variation diagnostic to Book Development. It compares high-level architecture rather than prose style: chapter-count band, turning-point sequence, chapter-plan beat positions where available, ending openness/closure and whether the character/relationship arc resolves as a neat lesson or remains messier.
- The diagnostic is advisory, not a beat-sheet enforcer. It only surfaces when a candidate repeats several structural features of earlier books, and explicitly says not to distort a strong premise or replace one stock template with another.
- Earlier-book structure is only shown to the planning model when repetition is already visible across prior books; ordinary one-off structures are not presented as a menu to imitate.
- Completed and manually edited Book Plans persist the structural diagnostic in development state so later planning/resume keeps the same warning without a new model call.
- Adds one compact anti-overcoherence principle to planning and manuscript editing: not every object, scene, subplot or side character must reinforce the central theme or main plot. Incidental humour, atmosphere, social detail and ordinary human mess may remain when they add credibility or pleasure rather than padding.
- No new API route, web call, paid audit call or Supabase migration.


## V252.91 — prompt consolidation / creative-priority hierarchy
- Consolidates the overlapping series-register, human-depth, Luna-tic, anti-banter and anti-pithiness prose instructions into one compact creative hierarchy used by Draft, Developmental, Revision, Line/style and Proof.
- Establishes explicit priorities: Series Bible/register first; current canon/continuity next; stage-specific task next; anti-AI corrections last and only as selective interventions.
- Removes the old standalone prose/style helper layers from active prompts, so Luna is no longer told the same idea several different ways or given partially competing instructions about literary depth versus commercial pace.
- Planning stages now receive one compact planning priority rather than manuscript-editing constraints. Chapter planning still avoids mechanical rhythms and fixed formulas without being asked to imitate an editorial style guide.
- Thresholded V252.90 audit findings are folded into the same creative hierarchy. Normal-range categories remain invisible; only genuine outliers are surfaced, and absent categories are explicitly not suggestions.
- Keeps genre-preservation, naming/worldbuilding, collision-safety, continuity and publication safeguards separate because they govern different failure modes rather than prose taste.
- No new API route, model call, web call or Supabase migration.


## V252.90 — thresholded anti-AI interventions
- Keeps the complete deterministic V252.89 manuscript audit for the developer and review ZIP, but no longer exposes normal-range counts or a full stylistic inventory to Luna/Astra.
- Editing models now receive only patterns that cross explicit editorial thresholds, phrased as concrete reduction/diversification interventions rather than as a menu of devices.
- A clear audit explicitly tells the model not to invent an anti-AI problem and not to introduce devices merely because an audit exists.
- Chapter-level Revision and Line/style receive only globally significant interventions relevant to that chapter.
- Adds thresholded checks for repetitive chapter-ending questions, habitual short punch endings and repeated formula lead-ins, while preserving deliberate stylistic choices.
- No new API route, web call, model call or Supabase migration.

## Deterministic whole-manuscript anti-AI pattern audit
- Adds a deterministic full-manuscript audit before every Developmental pass. It is explicitly an editorial diagnostic, not an AI detector.
- Measures sentence/paragraph/chapter-length variation, em-dash density, rhetorical-question density, contrastive “not X … but Y” framing, possible triplet/three-part constructions, one-sentence paragraphs, short punch sentences, recurring stock gestures/phrases, chapter-ending shapes and exact six-word phrases repeated across chapters.
- Compares long exact phrases with up to the three preceding books in the same series to flag possible recycled prose.
- Stores the complete audit inside the Developmental editorial plan and supplies a compact evidence brief to the Developmental editor.
- Revision receives the relevant chapter-specific findings and is told to fix only genuinely intrusive recurrence, never to chase numerical quotas or erase intentional voice.
- Line/style receives the same selective diagnostic; Proof remains copy-focused.
- Re-runs the deterministic audit on completed Revision, Line/style and Proof manuscripts so the book page can show before/after pattern metrics.
- Adds a visible Whole-manuscript pattern audit card to Fiction Studio and exports the complete audit JSON with review ZIPs.
- No new API route, no web call, no paid model call for the audit itself, and no Supabase migration.

# Moonbeam Stories V252.86

## V252.82 — Series-register preservation
- Series Development now infers the appropriate prose style, pacing, accessibility and narrative texture from the genre/readership/positioning already established by the developer or by Astra, without numeric style sliders or a universal literary target.
- Book Development, chapter planning, drafting, Developmental, Revision and Line/style now explicitly preserve the established series register.
- Luna's human-depth and anti-banter/anti-pithiness guidance is now corrective only: it removes known AI/Luna tics without automatically making every book more introspective, slower or more literary.
- No Supabase migration is required for this build.

- Fiction Studio now inserts a mandatory human **cast & proposed-book-title review checkpoint** after Series Development and before the first Book Development.
- Core character names and initial working book titles are presented in a clean review panel. The developer can approve them unchanged or edit them before downstream plans exist.
- Exact full-name/title references in the Series Bible are updated automatically; every short first-name/surname occurrence requires an explicit Change / Leave decision so unrelated uses are never silently altered.
- Book Development is locked server-side until the current Series Bible has completed this review. Existing established series are backfilled as already reviewed, so they are not disrupted.
- Refining a series before any Book Development resets the checkpoint; once books exist, later series edits keep the established review state and series-wide text tools remain the safe way to propagate identity changes.
- Supabase migration: `SUPABASE_V252_81_FICTION_BIBLE_NAME_REVIEW.sql`.

# Moonbeam Stories V252.80

## Fiction Studio series writing language / locale

- Added a persistent series-level **Writing language** selector with 65 text-only language/locale options.
- Fiction Studio controls remain in UK English regardless of the selected writing language.
- New series default to **English (UK)**. Existing series retain the previous **English (US)** behaviour.
- The chosen language is stored on `developer_fiction_series.language_locale` and inherited by Series Development, Book Development, chapter planning, first-draft generation, Developmental, Revision, Line/style, Proof, Series Intelligence and selective context retrieval.
- Language/locale is distinct from geographic setting: it supplies the default linguistic/cultural frame, while explicit settings keep authentic local dialogue, institutions and place-specific terminology.
- The language is fixed at series creation in the current UI, so different series may use different languages without affecting one another.
- Supabase migration: `SUPABASE_V252_80_FICTION_LANGUAGE_LOCALE.sql`.

# Moonbeam Stories V252.79

## V252.79 — Quiet deleted-fiction cleanup status

- When the retrospective deleted-fiction audit is clear, the large cleanup card is replaced by a small muted `Deleted-fiction cleanup: clear` line with a compact **Check again** control.
- If orphaned traces are detected, the full cleanup panel automatically returns with the purge action.
- After a successful purge the UI collapses back to the quiet clear state.
- No Supabase migration required.

V252.74

Series/book production dashboard cleanup: series cards now list every planned book with Finished/In progress/Ready/Not started status derived from live Fiction Studio records; book pages show the current production/editing stage rather than only first-draft completion.

## V252.73 — Retrospective deleted-fiction cleanup

- Adds a developer-only legacy orphan audit when Fiction Studio opens.
- Detects traces left by books/series deleted before V252.72: orphaned books, chapters, continuity, editorial runs/chapters/continuity and usage events.
- Adds **Purge legacy deleted traces** on the Fiction Studio library when leftovers are found.
- Purge is scoped to the authenticated developer account and the existing Fiction Studio table allowlist.
- Child/detail records are removed before parent rows, then the server rescans and fails closed if any orphan remains.
- Surviving series whose Series Intelligence may contain facts derived from a legacy-deleted book have Series Intelligence reset and cached selective context cleared; surviving manuscripts are not altered and memory can rebuild retrospectively from completed proofs.
- Browser resume/background state for orphaned book IDs is cleared after cleanup.
- No Supabase migration required.

## V252.72 — Thorough Fiction Studio purge

- Fiction Studio **Delete novel** now explicitly purges that novel's Book Plan, first-draft chapters, first-draft continuity, every editorial run, editorial chapters, editorial continuity, Proof history, and Fiction Studio usage events before deleting the book row.
- The server verifies that no matching records remain in any approved `developer_fiction_*` table before reporting success.
- Deleting a novel resets Series Intelligence and clears cached selective series context from surviving books, preventing derived archive/context from retaining facts extracted from the purged novel. Remaining proofed books can rebuild Series Intelligence retrospectively on the next development run.
- If later books exist, a complete novel purge requires purging that novel **and all later books**, because downstream manuscripts may already contain continuity derived from it. The UI names those later books before confirmation.
- Fiction Studio **Delete series** now explicitly purges all books, drafts, continuity, editorial branches, proofs, usage history, Series Intelligence and the Series Bible for that series, then verifies every series-scoped Fiction Studio table is empty.
- Browser-side Fiction Studio resume state, model-choice state, pause state, and in-tab background-job records are purged for every deleted book.
- Active in-tab generation/edit jobs block purge until they finish or are paused, reducing the risk of an in-flight request trying to write after deletion.
- Downloaded review ZIPs or other copies already saved outside Moonbeam are not affected.
- No Supabase migration required.


## V252.71 — Background Book Development

- Book Development/planning now runs as a locked Fiction Studio background job with its own series ID and book ID.
- Navigating to another series no longer redirects or pauses chapter-plan batching.
- Different books in different series can be in Book Development, manuscript generation, or editorial re-edit simultaneously.
- One active paid generation/edit job per book is still enforced.
- Completion only refreshes the book UI when that same book is still open; otherwise progress remains visible in Background jobs.
- No Supabase migration required.
# V252.69
- Adds **Re-edit from this version**. A completed Revision, Line/style or Proof manuscript can now be selected as the source for a fresh Developmental → Revision → Line/style → Proof branch; First Draft remains available as a source.
- The Fiction Studio reader now has a **Re-edit from this version** action that returns to the book with that exact manuscript version preselected.
- Re-edit Developmental analysis now reads the selected source manuscript and its matching continuity rather than always reading the untouched first draft.
- Revision correctly unwraps the Developmental planning pass and edits the exact manuscript version that Developmental analysed; branch ancestry remains preserved through `source_run_id`.
- Reader composition also follows Developmental source ancestry, so in-progress and completed branches based on an already edited version display the correct underlying manuscript.
- Existing versions are never overwritten. Every new branch remains independently selectable in history.
- Keeps V252.67 repeatable re-edit safeguards, V252.66 human-depth direction, global anti-banter/anti-pithiness rules, immutable chapter titles, word-count protection, Series Intelligence and background-job concurrency intact.
- No Supabase migration required.

# V252.67

- Fixes repeat **Re-edit from First Draft** runs. Completed re-edit browser state is now retired/cleared after Proof, so every later click creates a genuinely fresh Developmental → Revision → Line/style → Proof branch instead of reusing the previous branch IDs and jumping to Proof.
- Only unfinished re-edit branches are resumable. All completed historical branches remain preserved in Supabase and the version history.
- No Supabase migration required.

# Moonbeam Stories V252.66

- Fixes Re-edit from First Draft so a fresh branch automatically continues Developmental → Revision → Line/style → Proof, using exact source-run lineage and preserving all earlier versions.
- Detects an already-completed orphan Developmental re-edit and resumes from Revision instead of starting Developmental again.
- Re-edit controls now expose Luna/Sol/Astra separately for all four editorial stages.
- Adds a clean full-width optional Additional editorial direction box; the global editorial brief still applies automatically.
- Tidies the re-edit panel layout and shows visible branch progress / next stage.
- Keeps all V252.63 anti-banter, anti-pithiness, title-protection, word-count, Series Intelligence and publication safeguards.

# V252.63 — global anti-banter fiction rule

- Makes anti-banter a standing rule for **all adult-fiction genres**, not merely an editorial diagnosis or an erotica-specific safeguard.
- First-draft chapter generation now receives the same anti-banter / anti-pithiness rule used by Revision and Line/style. Luna must not use teasing, quips, witty repartee, playful one-upmanship, smug back-and-forth, verbal sparring or characters continually trying to land the last line as a generic way of creating chemistry or keeping scenes lively.
- Book/chapter architecture is also told not to plan habitual banter as a default source of scene energy.
- Banter is not prohibited outright: it may appear occasionally when genuinely demanded by the characters, relationship, genre and moment.
- The existing stronger erotica safeguard remains: during sexual scenes, banter should be especially rare unless specifically established and natural to the moment.
- Keeps V252.63 anti-pithiness, dialogue-naturalism, genre-preservation, immutable chapter-title, word-count protection, re-edit, publication-integrity and Series Intelligence safeguards intact.
- No Supabase migration required.

# V252.63 — explicit anti-banter dialogue safeguard

- Adds a genre-preservation overlay for fiction explicitly identified as erotica. Revision and Line/style must preserve the intended erotic intensity, explicitness, vocabulary, frequency and centrality rather than sanitising, romanticising or fading out sexual material in the name of sophistication.
- Erotica receives an additional sex-scene safeguard: sexual dialogue must not default to banter, jokes, clever one-liners or performative repartee. The editor should prefer whatever speech pattern is natural to the moment, including immediacy, desire, hesitation, interruption, incomplete speech and silence, while preserving established character voice.
- Improves erotic variety through motive, power, anticipation, physical detail, emotional texture, dialogue and scene dynamics instead of simply deleting erotic material as repetition.
- Strengthens the dialogue-naturalism rule into an explicit anti-banter safeguard across Developmental, Revision and Line/style. Banter means habitual teasing, quips, witty repartee, playful one-upmanship, smug or clipped back-and-forth, and characters constantly trying to land the last line. It may still appear when genuinely character- and situation-specific, but must not become the default conversational texture or a generic signal of chemistry.
- Encourages natural variation in dialogue length, interruption, hesitation, overlap, evasion, misunderstanding, incomplete thoughts and ordinary speech while preserving genuinely sharp dialogue where it belongs.
- Keeps V252.60 chapter-title protection, target-aware revision, restorative under-length recovery, re-edit-from-first-draft branching and publication checks unchanged.
- No Supabase migration required.

# V252.60 — Fiction Studio editorial-quality safeguards

- Protects Fiction Studio chapter titles as immutable publishing metadata after the first draft. Revision, Line/style and Proof no longer ask the model to return chapter titles; the canonical source title is copied forward deterministically. Accidental model-returned chapter headings are stripped from the manuscript body.
- Adds publication-readiness checks for missing/suspicious chapter titles, duplicate chapter numbers, suspiciously short chapters and severe final under-length. Review exports include the check result.
- Makes Revision target-aware. The approved Book Plan `target_words` and source manuscript length are supplied to the editor, with a normal ±8% whole-book target band and proportional chapter guidance.
- If a completed Revision is below 92% of the approved target, Moonbeam automatically performs bounded restorative passes on the most under-length chapters. The purpose is to recover character depth, scene dynamics, atmosphere, causality, emotional consequence and world specificity without padding or changing plot facts. Each chapter is attempted at most once, preventing an uncontrolled cost loop.
- Line/style and Proof are explicitly constrained against material compression.
- Generalises the Revision brief across genres: preserve the book's genre, pace, tone and narrative engine while deepening psychological specificity, subtext, contradiction, emotional complexity, social observation and sentence-level texture where appropriate. Literary ornamentation, introspection and slowness are not forced.
- Adds per-stage manuscript word counts against the approved target in the Fiction Studio book screen.
- Adds **Re-edit from First Draft** for already-completed books. It creates a fresh Developmental branch from the untouched first draft while preserving every earlier Developmental, Revision, Line/style and Proof run for comparison. Subsequent stages follow the new branch by exact `source_run_id` lineage.
- Revision now resolves the Developmental report from its own editorial ancestry rather than silently using the latest unrelated Developmental run.
- Keeps V252.59 Series Intelligence unchanged. No new Supabase migration is required.

## V252.57 — resilient Book Development batches + continuous mobile novel reader

- Fiction Studio Book Development now expands detailed chapter plans in **4-chapter batches** rather than 8, substantially reducing `max_output_tokens` failures on detailed Astra plans. Each successful batch is still checkpointed; Resume starts at the first missing chapter.
- The **Fiction Studio novel reader on mobile only** is now one continuous vertically scrollable manuscript, with chapter headings inline. Horizontal page-swiping and artificial mobile pagination are removed.
- Desktop Fiction Studio novel reading remains the measured two-page spread.
- The normal Moonbeam children's-story reader is unchanged.
- No Supabase migration required.

## Safe-base provenance

V252.47 is based on `Moonbeam_Stories_V252.46.4_VERIFIED.zip`. The V252.46.4 review-export behaviour is retained and extended; the failed/reduced V252.46.5/V252.46.6 packages are not used as a source.

# V252.46.4

- Fiction Studio review ZIP now exports all persisted series/book/manuscript/editorial/accounting material, including developmental reports and every preserved editorial manuscript version.
- Export explicitly records that V252.46 has no editorial-version continuity ledgers rather than inventing them.

# V252.42

Fiction Studio progress is now derived from one authoritative calculation: planned chapter numbers in the approved Book Plan versus distinct chapter numbers durably saved in Supabase. Saved count, next chapter, Resume/Generate state and Novel Complete all use that calculation. Generation resumes at the first missing planned chapter and Novel Complete is impossible until every planned chapter number exists. V252.41 per-book API cost/time metering is retained unchanged. No new Supabase migration.

# Moonbeam Stories V252.39

## V252.39 — Series Bible propagation
- Revised Series Bible proposed-book concepts now automatically update matching undeveloped saved-book placeholders.
- Starting an undeveloped book refreshes its title and premise from the current authoritative Series Bible before Astra plans it.
- Existing books with real planning work are preserved rather than silently overwritten.
- Updated stale Fiction Studio boundary copy.
- No database migration required.

# Moonbeam Stories V252.38

## V252.38 — Fiction Studio structured-response audit hardening
- Centralises Fiction Studio structured Astra parsing in one fail-closed handler.
- Applies it to Series Bible development/refinement, novel architecture, chapter-plan batches, the legacy one-shot Book Development path, and manuscript chapter generation.
- Explicitly distinguishes incomplete, refused, empty, and malformed structured responses before any stage is persisted or any resumable checkpoint advances.
- Keeps the existing strict JSON schemas, V252.35 chapter-number validation, and V252.37 output-token allowances unchanged.
- No database migration required.

# Moonbeam Stories V252.37

## V252.37 — Fiction Studio Book Development response fix
- Traced the novel-architecture failure to two resumable Book Development calls that still used the old local `d.output_text` parser and therefore bypassed the V252.36 structured-response extractor.
- Novel architecture and chapter-plan batches now use the same robust structured-output extractor as the Series Bible path.
- Detects incomplete Responses API results explicitly and preserves the resumable checkpoint instead of misreporting malformed JSON.
- Raises architecture output allowance from 5,000 to 8,000 tokens and chapter-plan batch allowance from 5,000 to 7,000 to reduce truncation risk.
- Strict schemas and V252.35 chapter-number validation remain unchanged.
- No database migration required.

# Moonbeam Stories V252.36

## V252.36 — Astra structured-response fix
- Fixes false `Astra returned an invalid Fiction Studio response` errors caused by assuming structured Responses API output always appears in one text field.
- Adds one robust server-side extractor for top-level output text, message content text/output_text, and parsed/json structured payloads.
- Keeps the existing strict Fiction Studio schemas; no Series Bible validation has been weakened.

# Moonbeam Stories V252.35

## V252.35 — Fiction chapter-plan validation
- Rejects malformed Astra planning batches unless every requested chapter number is present exactly once.
- Discards out-of-range chapter commentary rather than appending it to the Book Plan.
- A failed batch does not advance the checkpoint; Resume Book Development retries safely.
- Existing malformed plans are repaired on adoption by retaining one valid chapter per number and dropping duplicate/out-of-range entries.
- Completion now requires a contiguous validated 1..N chapter set.

# Moonbeam Stories V252.34

## V252.34 — Existing-novel adoption fix
- Fixes duplicate `developer_fiction_books_series_id_position_key` when an earlier Fiction Studio novel already occupies the Series position.
- Start Book Development now loads/adopts the existing immutable novel record before considering INSERT.
- Missing resumable `development_state` is inferred from the existing Book Plan and preserved content.
- Repeated clicks/retries/lost responses are idempotent at the Series+position boundary.
- No existing novel content is deleted or regenerated merely to migrate it.

# Moonbeam Stories V252.33

## V252.33 — Persistent Fiction Studio
- Resumable staged Book Development fixes the monolithic 20–50 chapter planning request that could 504.
- Generate Novel automatically writes sequential chapters, checkpointing every chapter and continuity update; Resume Novel continues from stored state.
- Persistent saved-novel library plus Series/Novel rename and cascading delete controls.
- Current database identity/state is authoritative for subsequent Astra requests.
- Novel and Series review ZIP exports, including partial manuscripts.
- Server-side export/context reconstruction avoids shuttling the accumulating manuscript through the browser.
- Developer-only Back Room isolation retained; 12 API-file ceiling unchanged.

# Moonbeam Stories V252.32

## V252.32 — Fiction Studio manuscript test
- Adds sequential adult-fiction chapter drafting after an approved Book Plan.
- Adds a persistent live continuity ledger updated after every generated chapter.
- Each new chapter receives the Series Bible, authoritative Book Plan, live ledger, and two most recent chapters for immediate prose/voice continuity.
- Actual manuscript/ledger facts explicitly outrank stale outline details.
- Developer-only server gate remains mandatory; no children's story or Sunburst route is shared.
- Adds dedicated `developer_fiction_chapters` and `developer_fiction_continuity` storage; browser roles remain revoked and service-role access only.
- This stage is intentionally a prose-quality experiment, not an automatic publication pipeline.

# Moonbeam Stories V252.31

- Fixed Fiction Studio opening with `permission denied for table developer_fiction_series`.
- The V252.29 table correctly revoked browser access, but the new table had not explicitly granted PostgreSQL table privileges to `service_role`. V252.30 grants only the server-side service role SELECT/INSERT/UPDATE/DELETE.
- Browser roles (`anon` and `authenticated`) remain revoked; Fiction Studio still reads/writes exclusively through the developer-authenticated server API. No children's story-generation code or prompts were changed.
- Live Supabase migration `v252_30_fiction_studio_server_permissions` applied successfully.

- Added the first-stage developer-only **Fiction Studio / Back Room** for experimenting with full-length adult commercial fiction.
- Back Room entry is mounted only after Moonbeam's existing server-verified developer access check succeeds. Every Fiction Studio API operation independently verifies the authenticated user against `MOONBEAM_DEVELOPER_EMAIL`; hiding the UI is not the security boundary.
- Fiction Studio data uses a new `developer_fiction_series` table. The migration enables RLS and explicitly revokes `anon` and `authenticated` table access; browser clients receive no policy. Reads/writes occur only through the server-side developer-gated API.
- Fiction Studio Astra has a separate full-length commercial-fiction series-development prompt and structured Series Bible. It does not call the children's story planner, final story writer, illustration pipeline, Sunburst, Cast, Saved Stories, or Publishing Library.
- Stage 1 supports: pen name, series name, Series Brief, selectable Series Development model, series development/refinement, direct Bible review/editing, and explicit Bible save.
- Stage 1 deliberately stops before novel outlining, chapter generation, cover generation, KDP export, or publication.
- No new Vercel function was added: the isolated Back Room action branches at the top of the existing authenticated `/api/generate` function, preserving Moonbeam's 12-function deployment limit while keeping the generation logic and prompts separate.
- Supabase migration required: `SUPABASE_V252_29_FICTION_STUDIO.sql`.

# Moonbeam Stories V252.28

- Fixed developer **Download review ZIP** image resolution.
- V252.27 incorrectly routed review-export images through `savedAssetUrl()`, which only resolves assets for the currently open saved book. A Volume export runs from the Publishing Library, so that guard returned no image even though every image was present in saved-story storage.
- Review export now reads the exact saved cover/page asset paths directly through Moonbeam's existing `savedArtBlob()` storage/cache path, the same underlying saved artwork used by the reader.
- The exporter remains strict: it does not silently omit an image that Moonbeam says is present.
- Works for both complete Volume review ZIPs and individual/Loose Story review ZIPs.
- No Supabase migration required.

# Moonbeam Stories V252.27

- Added developer-only **Download review ZIP** for every saved story, including Loose Stories.
- Added developer-only **Download review ZIP** for Volumes. Volume exports use the current live Volume membership and story order.
- Review ZIPs contain plain-text story content, JSON manifests, the saved cover, and all saved interior illustrations, organised into one folder per story.
- Review export is deliberately separate from KDP/EPUB publication packaging and requires no Supabase migration.

# Moonbeam Stories V252.26

- Fixed Edit Series Bible save/close crash caused by stale `closeSeriesPlanner25194` reference.
- Save now persists the Bible, refreshes the Publishing Library, and closes the editor using the live Series planner modal.
- Fixed the same stale close reference in Edit Series Cast.

- After a Series Bible is approved, the Publishing Library now shows **Edit Series Bible** instead of reopening **Develop with Astra**.
- Edit Series Bible opens Astra's current approved Bible directly in an editable text area; **Save Series Bible** replaces the canonical creative brief used for future Volume/story planning while preserving approved/setup state and all existing stories.
- Series setup wording no longer suggests an artificial one-extra-character limit; Series Cast are available when naturally required, including several established family members in the same story.
- No Supabase migration required.

# Moonbeam Stories V252.23

## V252.23 — editable Series-world Cast relationships

- Adds **Edit Series Cast** to every completed Series folder, so recurring Cast can be added or removed after initial Series setup without recreating the Series.
- Every selected Series-world Cast member now has required Series-specific relationship/role metadata (for example, “Sam’s older sister” or “Sam’s dog and sidekick”).
- Relationship metadata is stored inside the existing Series Plan JSON, so no Supabase migration is required.
- Astra receives the current Series-world Cast dynamically with `series_relationship` on all later Series/Volume planning calls.
- Automatic Volume story production carries the selected supporting character’s Series relationship into the normal Moonbeam story engine.
- Canonical Cast identity/visual references remain separate and authoritative; Series roles describe narrative relationships only.
- Existing approved Series Bibles and generated stories are not altered when Series Cast is edited.

## V252.20 — Series setup wizard ordering fix

- Fixes a later Publishing Library override that bypassed the mandatory New Series wizard and created a bare Series folder instead.
- `＋ Series folder` now always starts the ordered setup flow: series name → main character → Series-world Cast → audience → series idea → Astra development → review/approval.
- This guarantees supporting Cast are selected and persisted before Astra first develops the series premise, so canonical supporting Cast records such as Biscuit are available to Astra automatically.
- Incomplete Series folders now show only **Continue series setup** (plus rename/delete), preventing Volume generation or the legacy Develop Series route from bypassing required Cast setup.
- No database migration required.


- Astra now chooses the ideal published Volume size (8–16 stories) and automatically plans two additional full-quality editorial candidates (10–18 generated candidates total).
- Astra independently chooses 6, 7 or 8 story pages for every automatic Volume story; the former hard-coded six-page Volume override has been removed.
- The existing variable-length Moonbeam story engine is reused; loose developer stories remain independently configurable at 6–10 pages.
- Series-development architecture now explains these freedoms to Astra and tells later publishing work to treat the current surviving Volume contents as authoritative rather than stale planning counts or deleted concepts.
- No application-level character truncation has been reintroduced into Astra Series Development.
- No Supabase migration is required.

# Moonbeam Stories V252.18


## V252.18 — full Astra series context + explicit book/volume architecture

- Removed Moonbeam's silent application-level truncation from the Astra Series Development context. Developer input, Series Plan, Volume Plan, Series-world Cast and prior-volume context are now passed in full rather than sliced to arbitrary character limits.
- Removed the 20-character Series-world Cast cap and 40-prior-volume cap in the Astra planning request.
- Added permanent Astra publishing architecture: a Series contains Volumes; a Volume contains multiple separate Moonbeam stories/books; each individual Moonbeam book is a complete short illustrated read-aloud story of 6–8 story pages.
- The existing new-Series setup continues to support optional Series-world Cast, so characters such as Biscuit can be supplied canonically from the start.
- No Supabase migration required.

## V252.17 — remove automatic post-paint Astra replacement loop
- Builds directly on V252.16.
- Removes the mandatory Astra post-generation forensic review/repaint loop for interior illustrations.
- A successful Sunburst render is accepted by default instead of triggering an automatic paid replacement because a subsequent Astra review dislikes it.
- Astra remains the authoritative art director before painting: the complete production plan, scene commission, canonical Cast references and accumulated visual continuity still drive Sunburst's first render.
- Image-safety rejection recovery remains separate and unchanged; it only runs when the image service actually rejects a request.
- Manual developer illustration correction/editing remains available.
- V252.16 collapsible Series/Volume folders and V252.15 saved-story editing fix are retained.

# Moonbeam Stories V252.16

## V252.16 — collapsible Publishing Library folders

- Series folders can now be collapsed and expanded independently.
- Volume folders can now be collapsed and expanded independently, including Loose Volumes.
- Each Series/Volume open/closed state is remembered in this browser across library rerenders, navigation and refreshes.
- Folder action buttons remain inside the expanded content and do not interfere with the folder toggle.
- Built directly from V252.15; the saved-story illustration-edit fix and V252.14 flexible Publishing Library support are preserved.
- No additional Supabase migration is required for V252.16.
- Cache-busted browser assets to V252.16.


## V252.15 — saved-story illustration edit + Publishing Library diagnostics
- Fixed saved-story illustration editing crash: `requestIllustration()` now prepares `continuityThumb` before sending the correction request, including after a story has been saved and reopened.
- Preserves V252.14 flexible Publishing Library behaviour: Series and Volumes may be created independently, including Loose Volumes.
- Publishing Library now replaces the raw `series_id` / missing-table database error with a clear instruction when the required V252.14 Supabase migration has not yet been applied.
- New Series setup errors are surfaced instead of failing silently.
- Cache-busted browser assets to V252.15.
- The V252.14 database migration is still required once: `SUPABASE_V252_14_FLEXIBLE_LIBRARY.sql`.

---

# Moonbeam Stories V252.14

## V252.14 — flexible Series / Volume / Story library
- Series folders and Volume folders can now be created independently and may remain empty.
- Volumes may be Loose Volumes or moved into/out of any Series. Moving a Volume out of a Series returns it intact to Loose Volumes.
- Stories may be Loose Stories, filed into a Volume, or filed directly into a Series. Series are always top-level and cannot be placed inside Volumes.
- Deleting a Series folder detaches its Volumes to Loose Volumes and its direct Stories to Loose Stories; deleting a Volume folder returns its Stories to Loose Stories.
- Volume production automatically saves each completed story into its Volume. There is no post-generation accept/reject/replace workflow and no Replace Story action.
- Story-slate planning is now batch-oriented: edit planned concepts if desired, then generate; review/delete later in Saved Stories.
- Removes Volume-cover creation from Volume generation and Saved Stories. Volume-specific Kindle/print cover assets are deferred to the publishing stage.
- Existing story and illustration generation pipelines are otherwise unchanged.

### Required Supabase migration
Run `SUPABASE_V252_14_FLEXIBLE_LIBRARY.sql` once before using the new library controls.

---

# Moonbeam Stories V252.12

## V252.12 — legacy Volume-cover detection repair
- Fixes the retrospective Volume-cover control for already-generated Volumes such as **King Sam**.
- Saved Stories no longer relies only on the newer `plan.stage === "complete"` flag to decide whether a Volume is complete. It also recognises the persisted Volume status and, for older records, a fully produced story slate / complete Volume membership.
- A completed legacy Volume with no `volume_cover_path` now shows **Generate Volume Cover** without regenerating or modifying any story.
- Future automatic Volume-cover generation from V252.11 is unchanged.
- No Supabase migration and no new API endpoint.

---

# Moonbeam Stories V252.11

## V252.11 — Series Volume covers
- Adds a distinct developer-only Volume cover as the final production step after the last approved story in a Series Volume is generated and saved.
- Astra designs the cover for the collection as a whole from the Series Bible, Volume Bible and completed story slate; Sunburst receives the lead Cast reference plus selected finished story illustrations as visual canon.
- Volume-cover artwork contains no generated typography. Moonbeam renders the Series name and Volume title separately so publishing can flatten them later without contaminating the source artwork.
- The finished Volume cover is stored in the existing private `saved-story-art` bucket and its path is persisted in the Volume plan; no new table or bucket is required.
- Completed legacy Volumes with no cover (including King Sam) show **Generate Volume Cover** in Saved Stories. This creates only the missing Volume cover; existing stories and illustrations are untouched.
- Once present, the Volume cover is displayed as the visual identity for that Volume in the developer Saved Stories / Series Library.
- Future Volume production automatically creates the Volume cover immediately after the last story completes. If cover creation fails, all stories remain saved and the manual Generate Volume Cover action remains available.
- Reuses the existing `generate` and `illustrate` endpoints; callable API count remains 12. No Supabase migration.

---

# Moonbeam Stories V252.09

## V252.09 — simpler Volume curation; replacement production removed
- Removes the post-generation **Delete and replace** workflow and its automatic replacement-story production/resume UI.
- Deleting a finished story from a Volume now simply deletes it and removes the matching slot from the Volume production plan; the Volume count falls by one.
- Legacy interrupted replacement checkpoints already present in a Volume are shown as **Incomplete** with **Delete incomplete story**. Deleting one removes its partial artwork/checkpoint and removes that slot from the Volume plan. Nothing is regenerated.
- The intended workflow is now deliberately simple: generate more stories than the final book needs, keep the best, delete weaker stories, and optionally move a Loose story into a Volume manually.
- Removes the pre-production **Reject & replace** action too; Volume planning creates the requested 8–16 concepts once, after which you can accept/edit the slate and curate the finished books by deletion.
- V252.07 illustration-transfer optimisation is retained unchanged.
- No Supabase migration and no new API endpoint.

---

# Moonbeam Stories V252.08

## V252.08 — Series replacement resume UI repair
- Volume replacement partials are no longer surfaced through the generic unfinished-story modal; they stay in their Series/Volume slot with the compact Resume button.
- Pressing Resume now closes any stale generic modal and opens a self-contained visible progress overlay with explicit colours, hourglass and live status text.
- Resume no longer depends on the hidden Create Story screen for visible feedback.
- The hidden Generate button is now guarded so a missing setup control cannot abort a Saved Stories resume before the checkpoint is opened.
- Existing single-flight checkpoint lock and V252.07 transfer optimisation are retained.
- No database migration or new API endpoint.

---

# Moonbeam Stories V252.07

## V252.07 — lower illustration transfer + visible single-flight replacement resume
- Compresses accepted illustration continuity references to 640 px JPEG quality 0.84 before sending them to `/api/illustrate`; canonical full-resolution saved artwork is unchanged.
- Deduplicates the immediately previous illustration so it is not sent both as the dedicated continuity image and again in the automatic visual-reference set.
- Compresses rejected correction candidates before retransmission; Cast references remain unchanged.
- Replacement Resume now opens a visible progress overlay from the Series/Volume Saved Stories view, mirrors the real resume stages, and uses a per-checkpoint single-flight lock so repeated presses cannot launch duplicate resume jobs.
- Existing checkpoint/resume generation logic and image model/output quality are unchanged. No Supabase migration.

# Moonbeam Stories V252.06

- Volume replacement stories that stop part-way now remain visible in their exact Series → Volume slot as **Replacement incomplete**, with saved illustration progress and a **Resume** button.
- Resume continues the existing `partial_story_generations` checkpoint rather than starting the replacement again.
- When a resumed replacement finishes, Moonbeam saves it, files it back into the same Volume slot, updates `produced_story_ids`, and only then removes the partial checkpoint.
- New replacement checkpoints also persist their intended Volume position/title so the slot survives interruption.
- Existing V252.05 orphaned replacement checkpoints are recovered from their already-saved `seriesVolumeStory`, `volumeId`, and `volumeStoryIndex` metadata.
- No Supabase migration and no new API endpoint.

---

# Moonbeam Stories V252.05

- Adds permanent Delete to developer Series Library story cards.
- Loose saved stories can be deleted with confirmation.
- A saved story inside a Volume offers DELETE, REPLACE or CANCEL.
- REPLACE asks Astra for a genuinely new concept before deleting anything, shows that concept for approval, then permanently removes the old story and generates the replacement through the current Moonbeam production pipeline.
- Replacement preserves the same Volume slot/order and updates the Volume production record to the new saved-story ID.
- If Astra cannot create a replacement concept, the existing story is left untouched.
- If replacement generation later fails, the approved replacement concept remains in the Volume plan for recovery; completed unrelated stories are untouched.
- No new API endpoint or Supabase migration.

# Moonbeam Stories — V252.04

- Rejected illustrations are no longer retried with only an appended defect note. Astra now performs a dedicated corrective-art-direction pass and rewrites the complete painting commission before the single automatic repaint.
- The corrective pass receives the rejected candidate, forensic diagnosis/checklist and accepted visual canon, then specifies the repaired anatomy/geometry/object relationships explicitly and selects the strongest canonical references.
- Sunburst receives that rewritten commission plus the rejected candidate (non-canonical) and accepted references; the repaint must still pass both forensic QA gates before acceptance.
- No database migration. Vercel API count unchanged.

# Moonbeam Stories V252.03 — forensic two-pass illustration QA

- Builds directly on V252.02/V252.01.
- Replaces the single broad Astra art-director check with two mandatory independent forensic passes before an interior illustration can become canon.
- Pass A checks internal physical integrity systematically: expected limbs and connections, anatomy, occlusion, hands/feet where conspicuous, body/object intersections, paired objects such as boots, and object construction.
- Pass B separately checks cross-image continuity against earlier accepted paintings: characters, garments, objects, furniture, architecture, masonry, geography and topology. It explicitly checks individual visible stones/blocks, mortar joints and coping stones when the same surface reappears.
- Each pass must return an explicit structured checklist. A material FAIL blocks acceptance even if the model's overall boolean says pass.
- Candidate/reference review images are increased from 320px/72% JPEG to 512px/84% JPEG so fine masonry and object details remain inspectable while staying bounded for request size.
- Only after both passes succeed can an image enter the cumulative visual canon. A failed candidate receives the concrete forensic findings for one corrective repaint and the replacement must pass both gates again.
- Existing Needs assistance fail-closed behaviour remains after a failed correction.
- Retains V252.01 Usage & economics pagination repair. No SQL migration and no additional Vercel endpoint.

---

# Moonbeam Stories V252.02 — cumulative illustrator canon + mandatory visual QA

- Built directly on V252.01; retains the corrected paginated Usage & economics history reader.
- Every accepted interior illustration now becomes cumulative visual canon for later pages. Later Sunburst commissions receive selected accepted artwork as actual image references in addition to Cast identity references and the immediately preceding page.
- Continuity is defined at physical-object level, not merely style/category level: recurring masonry, mortar joints, walls, bridge geometry, waterways, doors, furniture, clothing, props, markings and other established construction must remain the same physical things when visible again.
- Adds a mandatory Astra art-director review after every generated interior and before it is checkpointed or allowed to become canon.
- The review compares the candidate with all earlier accepted illustrations (compact review copies) and separately checks internal physical integrity: missing/duplicated limbs, impossible anatomy/intersections, malformed paired objects and broken construction.
- A failed candidate receives exactly one automatic corrective repaint using Astra's concrete diagnosis and the strongest earlier references Astra identifies. The replacement is reviewed again.
- If the replacement still has a material continuity/anatomy defect, production stops in the existing Needs assistance recovery state rather than publishing the bad image or contaminating later pages with it.
- Failed candidates never enter the checkpoint/cumulative canon.
- No Supabase migration and no additional Vercel endpoint; the review multiplexes the existing generate endpoint. Existing image recovery limits continue to bound extra image spend.

---

# Moonbeam Stories V252.01

## Usage & economics pagination repair

- Fixes the actual cause of the apparently frozen Usage & economics dashboard and Generation support log.
- `api_usage_events` had grown beyond Supabase/PostgREST's 1,000-row response limit. The dashboard requested the table once in ascending date order, so it received only the oldest 1,000 events and silently omitted every newer event.
- The usage-summary endpoint now pages through the complete event history in 1,000-row ranges before calculating All-time, Since baseline, Developer/Other, This month, Today, Yesterday, Last 7 days, per-user generation totals and the support log.
- Retains V251.99's compatibility with both historical `story` completions and current `story_finalize` completions, including generation-run deduplication.
- This build is based on V251.99 and deliberately does not include the experimental V252.00 illustration-continuity changes.
- No Supabase migration and no new Vercel endpoint.

---

# Moonbeam Stories V251.99

## Usage & economics completed-story repair

- Repairs the developer Usage & economics page after the generation pipeline moved from the historical `story` completion event to `story_finalize`.
- Story totals, per-user Stories generated, Last generation, OpenAI cost/story and tracked attributable cost/story now recognise current successful finalisations while preserving historical `story` events.
- Modern completion events are deduplicated by `generation_run_id`, so a resumed/retried finalisation does not count the same story twice.
- Image, narration and raw attributable-cost event accounting is unchanged.
- No story-generation, Series/Volume production, Astra, Sunburst, credit, reader or publishing behaviour is changed.
- No Supabase migration is required.

---

## V251.98 — Automatic sequential volume production

Generate volume is now a single command: stories generate strictly in order, and each completed story is saved and filed before the next story starts automatically. If a story fails, the chain stops at that story; completed stories remain saved and Generate volume resumes from the first unfinished story.

# Moonbeam Stories V251.92

## V251.92 — consistent book-wide KDP text fitting
- Kindle export now measures every story text page before rasterising the EPUB.
- The longest page determines one shared font size for the whole book; every story text page uses that same size.
- Adds 33 px and 31 px safe fallback sizes below the previous 35 px floor so longer pages can fit without clipping.
- The existing 220-word hard ceiling and fixed 1080×1350 KDP page architecture remain unchanged.
- Reader typography, Astra story generation and illustrations are unchanged.
- No SQL or API endpoint changes.

---

# Moonbeam Stories V251.91

## V251.91
- Developer-account story generation no longer receives recent/saved-story anti-repetition memory, allowing repeated runs of the same test premise without earlier saved books influencing Astra.
- Applies to both Make Tonight's Story and Develop with Astra. The browser omits the memory and `/api/generate` independently enforces the developer bypass server-side.
- Normal users are unchanged and retain the compact memory of up to 10 recent saved stories for repetition avoidance.
- No database migration required.

- Fixes developer Story Workshop preparation crash: initializes `developerTextDiagnostics` before Astra diagnostic collection.
- No SQL changes.

- Final Astra story writing no longer receives the finished interior image pixels.
- Story architecture remains spread-by-spread and authoritative; each spread's event + art direction is the common source of truth for both Sunburst and final prose.
- Astra writes each final page from that locked spread event and page-specific art commission, preserving exact text/illustration alignment without captioning incidental image details.
- Finished interior thumbnails are still used by the cover pipeline so the cover can preserve whole-book visual continuity.
- Safety-redesigned production plans remain authoritative for final prose.
- No database migration required.

# V251.87

## V251.87 — developer story-length selector visibility fix

Built directly on V251.85.

- Fixes the developer-only 6–10 page/illustration selector being hidden by the legacy `.story-tone-select` CSS used to suppress the old Tone control.
- The selector now appears visibly immediately below the Story Idea box on the Create Story page for the developer account.
- Defaults to 6 pages + 6 illustrations and retains options 7, 8, 9 and 10.
- Both Make Tonight's Story and Develop with Astra continue to use the selected value through the existing V251.85 generation/workshop plumbing.
- Normal users remain hard-fixed at six and do not see this control.
- No Supabase SQL changes.

# V251.85

## V251.85 — paid-generation recovery and whole-book safety redesign

Built directly on deployed V251.84.

- Normal users can no longer discard partially generated stories. Their recovery choices are Resume or Save for later; developer-only discard/abort controls remain available to the developer account.
- Once a valid story has entered production and has a resumable checkpoint, later production failure does not refund the story credit. The credit remains attached to that generation and resuming it consumes no additional story credit. Pre-production rejection/failure before a resumable story exists retains the existing refund behaviour.
- Removes the old image-safety story-credit refund.
- Removes the old immediate second Sunburst safety retry inside `/api/illustrate`; a safety rejection now returns to the book-level recovery controller after one rejected image request.
- On the first image-safety rejection, Astra receives the diagnostic plus the complete remaining art plan and redesigns the failed illustration, every later illustration, and the cover as one safety-focused pass. Successful earlier illustrations remain locked.
- Moonbeam then makes exactly one automatic replacement attempt at the failed position. If that replacement is rejected, or any later image in the already safety-redesigned sequence is rejected, the story is frozen as **Needs assistance** rather than spending further automatic image attempts.
- Normal users see a plain-language **Contact Moonbeam** state for a Needs assistance story. Completed work and the consumed credit remain attached to that partial story; there is no automatic refund and no misleading Resume action.
- Developer account can open a Needs assistance story and explicitly authorise a developer-assisted recovery. Astra first redesigns the blocked remaining artwork again using the saved failure history before another image is attempted.
- Failure diagnostics are persisted inside the partial story's production plan (`_moonbeam_failure_diagnostics`). They record the failed stage/class and useful service details without exposing raw diagnostics to ordinary users.
- Resumed final-story generation supplies relevant saved diagnostics to Astra so it can avoid repeating an output/production mistake; infrastructure/transport diagnostics explicitly do not invite creative rewriting.
- Cover safety failures use the same one-redesign/one-replacement policy.
- Fixes the V251.84 Story Workshop action routing so developer workshop chat/commit actions are reachable independently of final-story generation.
- No new Supabase SQL is required for V251.85; diagnostics and recovery state use the existing V251.77 partial-generation record.

# V251.84

## V251.84 — consolidated developer publishing build

Built from V251.83, which itself contains the requested V251.82 and V251.83 changes, while V251.81 remains the user's last deployed baseline.

- Carries forward V251.82 developer Usage & economics **Reset baseline** control. Run `SUPABASE_V251_82_USAGE_BASELINE.sql` once before deploying this build if it has not already been run. The reset changes the persistent since-baseline point used by both usage/cost reporting and average story-build time; historical totals remain intact.
- Carries forward V251.83 developer-only **6–10 page + illustration selector**. Ordinary users remain fixed at six spreads.
- Carries forward V251.83 **4,000-character Story Idea** field.
- Adds a developer-only **Develop with Astra** route beside normal story creation. Normal Create Story remains unchanged and fully automatic.
- Develop with Astra performs Astra's concept/story architecture and whole-book art-direction pass, then pauses before any book illustrations are generated.
- The Story Workshop is conversational and developer-only. It can revise the structured production plan, discuss the book, and understand natural requests to show a visual preview.
- When the developer asks to see a design, Astra can commission a single Sunburst concept preview. The developer can discuss/revise it and approve it; approved previews are carried into production as art-direction references.
- Full production starts only after the explicit **Create this book** action. At that point the normal credit reservation, checkpoint/recovery, sequential interior illustration, final Astra writing and cover pipeline takes over.
- Workshop access is hard-gated to `MOONBEAM_DEVELOPER_EMAIL`; it is not exposed to normal accounts or any future Pro entitlement.
- No new Supabase migration is required for the Workshop itself.


- Developer account only: choose 6–10 reading pages/illustrations per generated story. Ordinary users remain fixed at 6.
- Story Idea limit increased from 2,000 to 4,000 characters.
- Storyboard planning, final Astra reconciliation, illustration loop, cover continuity references, and partial-generation resume now follow the selected developer page count.
- No new Supabase SQL required.

# V251.82

- Adds a developer-only **Reset baseline** control to the Usage & economics screen.
- Resetting stores the new baseline persistently in Supabase, so it survives deployments and no longer requires a new build.
- The same baseline drives both usage/cost **since baseline** figures and the average story-creation-time counter.
- Resetting does not delete historical usage events and does not alter All-time, This month, Today, Yesterday or Last 7 days.
- Run `SUPABASE_V251_82_USAGE_BASELINE.sql` once before using the reset button.

# V251.81

- Increased the Story Idea input limit from 500 to 2,000 characters. No story-generation, Astra, Sunburst, pricing, recovery, or other behaviour changed.

# V251.80

- Normal reference-based Moonbeam story illustrations and covers now use GPT-Image-2.5 Sunburst at **medium** quality instead of low.
- Developer image correction remains medium.
- No-reference GPT-Image-2.5 Flare generation remains low.
- No changes to Astra, art direction, prompts, resolution, continuity references, checkpoint/recovery behaviour, or story generation architecture.


## V251.79 — startup regression fix

- Fixes the blank Moonbeam shell introduced in V251.77/V251.78.
- Root cause: `applyInterfaceLocale()` renders the Saved Stories library during startup before the new `partialGenerations` `let` binding had been initialized, causing a JavaScript temporal-dead-zone `ReferenceError`.
- `partialGenerations` is now initialized with the other application state before any startup rendering can read it.
- Keeps the V251.77 checkpoint/resume system and V251.78 plain-English interrupted-generation recovery UI unchanged.
# Moonbeam Stories V251.79 — Preparing Story recovery guidance

## V251.79
- When automatic retries still cannot complete a generation, normal users now get a plain-language recovery state directly on the Preparing Story screen instead of a technical failure.
- If a checkpoint exists, Moonbeam explains that completed work is safe and offers **Resume story generation**, **Save for later**, or **Discard permanently** immediately.
- If the browser is offline, the screen says so in ordinary language, keeps Resume disabled until connectivity returns, then enables it without requiring a refresh.
- Developer diagnostics remain separate; ordinary users are not shown HTTP/OpenAI/Vercel terminology.
- The V251.77 Supabase checkpoint infrastructure is unchanged; no additional SQL is required beyond `SUPABASE_V251_77_PARTIAL_GENERATIONS.sql`.

# Moonbeam Stories V251.77 — resilient image retries + resumable partial generations

## V251.77
- Adds narrowly targeted automatic retries for transient OpenAI image transport failures such as `ECONNRESET` / terminated sockets, plus temporary 429/5xx image responses.
- Adds account-level generation checkpoints in Supabase. Astra's plan and every successfully completed interior illustration are persisted during generation.
- Interrupted stories can resume from the first unfinished illustration without consuming another story credit or regenerating completed artwork.
- On reconnect/sign-in, active interrupted generations offer **Resume generation**, **Save for later**, or **Discard permanently**.
- Saved-for-later work appears on Saved Stories in a separate **Partially generated stories** section; clicking it shows the same three choices.
- Temporary labels use child name + shortened original Story Idea, falling back to “Untitled story”.
- Developer Abort remains developer-only and now leaves the checkpoint available for recovery.
- Requires `SUPABASE_V251_77_PARTIAL_GENERATIONS.sql` once before deploying this version.

# Moonbeam Stories V251.76 — single-pass Astra art direction + parallel cover
## V251.76
- Astra now art-directs the front cover in the same planning pass as the six interior commissions.
- The cover commission is stored on the production plan; normal new-story generation no longer makes a second Astra cover-art-direction call.
- After all six interiors are finished, their compact continuity references are reused by two concurrent jobs: Astra writes the final story while Sunburst paints the already-planned cover.
- Moonbeam waits for both jobs, then opens the completed book with the prebuilt cover.
- Cover retry reuses Astra's stored cover commission rather than waking Astra again.
- The cover is a required story image (index 6) for the secure illustration allowance/recovery path.
- V251.74 developer Abort generation and ten-story anti-repetition memory are retained.


- Adds a developer-account-only **Abort generation** button to the hourglass generation state.
- Abort immediately stops the browser from starting any later Astra/Sunburst stages and cancels the active browser request where possible, so an abandoned test does not continue through the remaining six-image/final-writing pipeline. Work already submitted upstream may still finish and incur its own API cost.
- Ordinary user accounts never see the abort control.
- Reconnects the existing compact memory of up to 10 recent saved stories to Astra's story-architect/concept stage.
- That history is explicitly repetition-avoidance context only: it must not act as a creative template or constrain form, tone, structure or genre, and an explicit parent request may revisit a similar idea.
- No changes to Astra art direction, Sunburst model/quality, cover architecture, credits, or the shared usage/timing baseline.

---

# Moonbeam Stories V251.73 — Astra whole-book art director

- Astra now has two explicit pre-painting roles: story architect, then whole-book art director / visual continuity designer.
- Astra designs recurring story-created objects, creatures, vehicles, machines, locations and wardrobe, while canonical Cast photos remain authoritative for identity.
- Each of the six visual briefs now directs composition precisely where relevant: relative position/size, orientation, physical relationships, object state, facial expression, gaze, gesture and pointing targets.
- Astra is responsible for carrying those visual decisions and deliberate state changes consistently through all six scenes.
- Sunburst is explicitly treated as the painter: it renders Astra's commission rather than choosing or simplifying the staging. Image model and quality settings are unchanged.
- After Astra writes the final story, Astra returns to the art-director role to design the cover from the finished story plus the six actual interior paintings. Sunburst then paints that commissioned cover.
- The cover receives compact copies of the six finished interiors as visual-continuity evidence, in addition to canonical Cast references.
- No changes to story-writing autonomy, image quality, credits, shared usage baseline or generation-time baseline.

---

# Moonbeam Stories V251.72

## V251.72 — Astra art-directs the storyboard illustrations
- The storyboard stage now explicitly makes Astra the art director for all six interior illustrations.
- Each `visual_moment` is a direct composition brief to Sunburst: Astra specifies the exact intended instant and any story-critical positions, actions, physical relationships and object states needed for the scene to make sense.
- Sunburst is instructed to render Astra’s directed composition rather than independently choosing a different illustrative moment or simplifying it into a generic scene.
- No image model, image quality, house style, story-writing model, story structure, baseline, credit or account behaviour has changed.


## Shared generation/usage baseline

- The average story creation time beneath the generation hourglass now always uses the same `MOONBEAM_USAGE_BASELINE_UTC` baseline as the developer **Usage & economics** page.
- The current shared baseline remains **26 September 2026, 14:38:25 BST (13:38:25 UTC)**.
- Future baseline resets therefore reset both the usage/economics measurement and the all-account hourglass generation-time average together; there is no longer a separate hard-coded hourglass reset date.
- No story generation, Astra, illustration, KDP, credits, Cast or editing behaviour is changed.

---

# Moonbeam Stories V251.70

## Reset hourglass average story-generation time

- Resets the average story creation-time figure shown beneath the generation hourglass for all accounts at 26 September 2026, 15:10 BST (14:10 UTC).
- Historical generation timings before that point are excluded from the average.
- New successful story generations repopulate the average automatically using the existing calculation.
- No story-writing, Astra, illustration, pricing, credit, reader, Cast or developer-edit behaviour is changed.

---

# Moonbeam Stories V251.69

## V251.69 — usage economics account split + yesterday

- Keeps every existing Usage & economics period column.
- Renames the existing baseline column to **Overall since baseline** and adds **Developer since baseline** and **Other users since baseline**, all using the same V251.68 baseline timestamp.
- Adds **Yesterday** as an additional period column.
- Developer/other usage is split from the authenticated `user_id` already stored on usage events; no database migration is required.
- Keeps actual organisation-level OpenAI Costs API figures for periods where OpenAI can supply them. It does not fabricate an end-user split of that organisation bill.
- Adds Moonbeam's existing per-event tracked attributable cost and attributable cost/story rows in GBP, which can be separated by developer vs other users.
- No story generation, image generation, reader, KDP, Cast, credit or editing behaviour is changed.

---

# Moonbeam Stories V251.68

## V251.68 — Astra cost-comparison baseline reset

- Resets the developer **Usage & economics** `Since baseline` default to **26 Sep 2026 14:38:25 BST (13:38:25 UTC)** so subsequent usage and OpenAI cost can be compared after the Astra rollout.
- Historical **All-time**, **This month**, **Today**, and **Last 7 days** periods are unchanged.
- No story-generation, illustration, reader, KDP, Cast, account, or developer-correction behaviour is changed.

---

# Moonbeam Stories V251.67

## V251.67 — developer text editor context patch

- Changes only the developer-only AI text-correction prompt.
- The existing GPT-6 Astra corrector continues to receive the complete finished six-page story and now explicitly reads it as authoritative surrounding context before replacing the selected page.
- Narrow correction instructions preserve the existing literary form and voice as closely as possible; explicit broad/page-rewrite instructions may freely rewrite the selected page so it flows correctly between the unchanged surrounding pages.
- The developer instruction is authoritative. No other Moonbeam behaviour is changed.

---

# Moonbeam Stories V251.66

## V251.66 — Astra creative autonomy + KDP-safe page ceiling

- Removes accumulated creative/story-shape/prose prescriptions from concept, storyboard and final-writing stages. Astra chooses literary form, tone, structure, events and ending.
- Retains only hard age-safety, Cast integrity, copyright/public-domain, six-spread, visual-continuity and machine-output constraints.
- Never invents surnames. Public-domain reproduction/adaptation remains allowed; protected copyrighted expression is not.
- Unsafe/age-inappropriate or impermissibly copyrighted Story Idea inputs are flagged and returned to the parent for a new input rather than silently reinterpreted.
- Removes creative word-count targets and equal-page-length requirements. Each spread has only a 220-word absolute KDP ceiling.
- Kindle text rendering now chooses among the existing 47/43/39/35px sizes by actual wrapped line height rather than word-count bands, and refuses a page that cannot fit at the minimum safe size.
- Image generation, cover continuity, developer correction tools and API count are otherwise unchanged.

---

# Moonbeam Stories V251.65

- Experimental writer-model upgrade from the clean V251.60 baseline.
- The initial creative story concept and six-scene storyboard planning calls now use **GPT-6 Astra** instead of GPT-5.6 Luna.
- The prompts, story architecture and page structure are otherwise unchanged, so this isolates writer-model quality as the variable being tested.
- Final story reconciliation remains on GPT-5.6 Luna. KDP copy and other auxiliary text calls remain on GPT-5.6 Luna.
- Image generation is completely unchanged: normal reference-based Moonbeam artwork continues through GPT-Image-2.5 Sunburst at low quality; developer correction remains Sunburst medium; no-reference generation remains Flare low.
- No database migration and no API endpoint added.

---

# Moonbeam Stories V251.60

- Fixes the developer masked illustration corrector so recurring non-Cast characters, creatures, vehicles, machines and distinctive objects can be corrected from **actual visual references**, not a text-only reconstruction of their appearance.
- The current page remains image #1 and the sole edit master; the painted mask remains the hard editable boundary.
- Moonbeam reviews the compact other-book artwork against the developer's correction instruction, selects at most two images that actually show the implicated recurring entity, and attaches only those selected images to the image edit as **canonical identity references**.
- Canonical references control only what the entity looks like. The current page still controls pose, scale, orientation, expression, composition, camera, staging, background and lighting.
- Cast photographs remain authoritative identity references for Cast members. If no other book image genuinely contains the corrected entity, no book reference is attached.
- Removes the previous failure mode where the corrector reduced visual identity evidence to prose and then expected the image model to reconstruct the monster/machine/character from that prose.
- Developer-only correction workflow; ordinary story illustration generation is unchanged. No SQL migration and no new Vercel endpoint.

---

# Moonbeam Stories V251.59

- Replaces free-canvas developer illustration correction with a masked local-edit workflow.
- The developer paints only the region allowed to change; Moonbeam sends a same-size PNG mask to OpenAI `/v1/images/edits`.
- The current accepted page is converted to PNG and remains image #1/edit master; the mask applies to that image.
- Other book illustrations are reviewed separately for text-only visual continuity and are never attached to the edit call.
- Correction quality is raised to medium; ordinary story illustration generation remains low quality and unchanged.
- No new API endpoint and no SQL required.

---

# Moonbeam Stories V251.57

- Rebuilt developer illustration correction as a true edit-only path.
- Correction requests no longer send page prose, storyboard scene facts, event-selection instructions, composition-generation rules or the normal Moonbeam new-illustration prompt to the image editor.
- The existing page is the sole scene/composition master. Whole-book artwork is used only in the separate text continuity analysis and is not attached to the edit model.
- Cast photos remain identity references only.
- The image editor is instructed to make the smallest requested change and preserve crop, camera, staging, poses, positions, background, lighting, colours and rendering elsewhere.
- Normal story/cover illustration generation is unchanged. No SQL required. API endpoint count unchanged.

---

# Moonbeam Stories V251.56

- Replaces the V251.54/V251.55 multi-image correction architecture. Whole-book artwork is no longer attached to the image-edit model.
- Developer illustration correction now runs a separate vision continuity review over the other book images and converts that review into a text-only visual identity canon.
- The actual image edit receives only the current page as its edit master plus normal Cast photo references. This prevents other pages from contaminating composition, staging, poses or scene content.
- The page being corrected is excluded from the continuity analysis, so an already-drifted correction cannot define its own identity canon.
- When references disagree, the continuity review is instructed to prefer stable traits established in the earliest book references rather than averaging designs.
- No SQL changes. API endpoint count unchanged.

# Moonbeam Stories V251.56

- Fixes HTTP 413 failures in developer illustration correction introduced by whole-book continuity references.
- Keeps the current illustration at full quality as the surgical edit master.
- Downsamples the cover and other page illustrations to compact 448px JPEG continuity references before sending the correction request.
- The correction model can still review artwork across the whole book for faces, teeth, fur, clothing, props and world continuity without sending every page at publication resolution.
- Cast identity photographs remain separate identity references. Normal story generation is unchanged.
- No SQL required and no API endpoint added.

---

# Moonbeam Stories V251.56 — whole-book continuity for illustration corrections

- Developer **Correct illustration** now supplies the current page plus every available cover/page illustration from the same book to the image corrector, so it can compare recurring characters and objects across the complete illustrated story instead of seeing only the immediately preceding page.
- The current illustration remains the surgical edit master for composition and staging. Other book images are explicitly labelled continuity references and cannot be mistaken for extra Cast members.
- Cast photographs remain separate authoritative identity references.
- Correction prompting now tells the model to restore the established majority design when a corrected page has drifted in details such as face shape, teeth, horns, fur, clothing or recurring props.
- No change to normal story generation, manual text editing, Supabase schema, or API endpoint count.

---

# Moonbeam Stories V251.53

- Final reconciliation now uses a strict JSON schema that requires exactly four middle pages, so the model cannot return a seventh story spread while still staying inside the word/token budget.
- Final reconciliation now explicitly resolves harmless repeated secondary-character text/image identity mismatches in favour of the finished illustrations (for example, a consistently illustrated king should not remain a queen in the prose).
- No story-concept, storyboard, illustration, anti-repetition or credit logic changed in this build.

## V251.45 — robust final-story reconciliation

- Fixes a false final-reconciliation failure where OpenAI could return HTTP 200 with a completed story but Moonbeam discarded it because the final stage used a stricter one-off JSON parser than the rest of the story engine.
- Final reconciliation now reuses Moonbeam's tolerant JSON extraction, including fenced/wrapped JSON and harmless trailing-comma recovery, without making another OpenAI call.
- Developer diagnostics now identify the exact validation failure (parse failure, missing field, wrong page count or empty page), plus parsed keys/page count and bounded response head/tail.
- No story prompt, illustration prompt, retry policy, credit logic, API endpoint or database changes.


## V251.44 — Isla publishing identity + bounded image-safety recovery

- Completes **Isla Templeton** publishing support: **By Isla Templeton** cover byline, profile photo, fixed About the Author page, EPUB author metadata and Moonbeam link, matching Sam and Emily.
- Highlights Sam, Emily and Isla as **Published author** entries in the developer Cast list.
- For required story illustrations only, an OpenAI image-safety rejection now receives **one automatic child-safe reformulation retry**. There is no customer manual retry loop.
- If that single recovery attempt is also safety-rejected, normal users receive the friendly Moonbeam completion message. Their reserved story credit is refunded before the UI can say **You have not been charged for this attempt**.
- Developer failures retain the raw safety response and now show the exact storyboard scene prompt and continuity context Moonbeam was trying to depict, plus whether the automatic safety retry was used.
- No new API endpoint and no database migration.


## V251.43 — Isla Templeton EPUB author profile

- Adds **Isla Templeton** to the existing developer Kindle/EPUB publishing workflow alongside Sam Alderwick and Emily Alderwick.
- A single-hero Isla story now uses **By Isla Templeton** for the developer publishing byline.
- EPUB export uses Isla's existing Moonbeam child/profile photo for the final **About the Author** page and embeds her fixed reusable author biography plus the Moonbeam Stories link.
- EPUB metadata identifies the author as **Isla Templeton** and the series as **The Moonbeam Adventures of Isla Templeton**.
- No API endpoint, database or illustration-generation changes.

## V251.42
- Recalibrated story prose across ages 3–12: ages 3–4 now get substantially shorter, simpler read-aloud prose while preserving imaginative plots; ages 11–12 get more sophisticated language, inference, suspense, agency and consequences. Ages 5–10 remain close to the current successful middle range.
- Strengthened account-level anti-repetition so concept selection compares abstract story DNA — mechanism, journey/transformation, tension, escalation, climax and resolution — rather than accepting the same underlying story with different scenery or props.
- No illustration-engine, credit, database or API-endpoint changes.

## V251.41
- Added a live “You have been waiting…” elapsed-time counter beneath the average story creation time on the Preparing Story screen. It starts at generation, updates every second, and stops/resets when generation finishes or fails.
- No story-generation, illustration, credit, or database changes.

## V251.40
- Restores/protects the developer demo-child **Gender** and **Age (3–12)** selectors.
- The developer UI now self-heals those selectors if an older/stale HTML shell is paired with the current JavaScript.
- Bumps the main CSS/JS/i18n cache-busting version so browsers do not reuse an older developer-generator interface after deployment.
- Otherwise identical to V251.39; no story or illustration prompt changes.

## V251.39

- Consolidated the story-generation prompts without removing tonight's creative safeguards: anti-repetition, genuine child appeal, safe peril, situational comedy, coherent fantasy, anti-personification, and explicit protection against default maps/notes/keys/ribbons/rainbows remain.
- Raised the concept bar against thin procedural stories and repeated mechanisms: concepts must have room to develop materially across the book, and storyboards now preserve rather than re-specify that creative intent.
- Reduced duplicated creative instructions across base, concept and storyboard stages so each stage has a clearer job.
- Developer token diagnostics now remain visible on the cover only and hide when reading begins.

## V251.38
- Developer-only token report now remains visible after successful story generation, including concept/storyboard and final reconciliation usage.
- Increased child-facing excitement and situational comedy without reintroducing adult/double-entendre humour.

# Moonbeam Stories V251.37

## V251.37 — developer token diagnostics

Developer-only generation failures now report OpenAI token usage for concept generation, storyboard planning and final story reconciliation, including configured output ceilings and incomplete-response reasons where available. Normal-user error messages are unchanged.

## V251.36 — account anti-repetition + average build-time guidance

- Confirms and retains the existing account-level anti-repetition system: the concept builder receives compact creative memory from up to 10 recent saved stories in the signed-in account and avoids repeating their underlying premise, story shape, props, discoveries, complications, payoff or ending unless the parent explicitly asks for it.
- Adds an average story creation-time line beneath the Preparing your story hourglass.
- The average is calculated from successful historical generation runs already recorded in `api_usage_events`: the successful concept/storyboard request duration plus the elapsed time from that completion to the matching successful final-story event. Failed runs are excluded.
- The average endpoint reuses `/api/generate`; no new Serverless Function or Supabase schema is required.
- Keeps V251.35 story prompts, developer diagnostics and V251.34 simplified developer demo-child generation unchanged.

## V251.35 — remove dual-audience humour + restore developer diagnostics

- Removes the V251.33 dual-audience / second-layer humour instructions from both story planning and final writing.
- Keeps the V251.33 excitement and page-turn tension improvements.
- Restores detailed developer-account story-generation failures, including stage, HTTP status, browser network state and a bounded response preview when available.
- Retains the V251.34 simplified developer demo-child portrait generator.

## V251.34 — simplified developer demo-child portraits
- Built directly from V251.33.
- Developer-only Generate demo child now constrains only age and gender; all ethnicity, skin-tone, hair/eye-colour, build and facial-feature profiling has been removed.
- Portraits now ask for a natural, appealing, entirely fictional child photographed casually on a modern phone, with a realistic everyday background and gentle Portrait-mode blur rather than a studio look.
- Normal customer Cast/photo handling and story generation are unchanged.
- No Supabase schema change.

## V251.33 — stronger page-turn tension, comedy and parent-level wit
- Built directly from V251.32.
- Strengthens the concept builder so competitions and challenges cannot rely on winning or losing alone for tension; where appropriate they need a consequential surprise, reversal, escalating complication, comic disaster, safe near-miss or similarly compelling development.
- Strengthens storyboarding so comedy develops through consequences, reactions, reversals and misunderstandings, while adventure/mystery normally contains at least one genuine page-turn uncertainty.
- Adds a restrained dual-audience layer to the writing stage: occasional subtle humour for the adult reading aloud, while every line remains completely suitable and understandable for the child.
- Keeps the adult layer sparse (normally no more than two or three moments across six spreads), avoids crude/adult subject matter and lazy adult-signifier jokes, and scales subtlety with the child’s age.
- Preserves existing coherence, anti-whimsy/personification, anti-stock-map/notes/keys, account anti-repetition, age-safety, Cast and illustration systems. No illustration-prompt, UI, Supabase schema or API-function-count changes.

## V251.22
- Strengthens the storyboard and final writing stages without changing the concept builder.
- Requires the selected premise to be exploited and developed rather than merely demonstrated across interchangeable middle scenes.
- Adds a middle-story dependency test: if scenes can be swapped or removed without materially changing the story, the storyboard must be redesigned.
- Encourages organic escalation through curiosity, humour, discovery, suspense, surprise, scale, consequence or emotional development without imposing an obstacle/attempt/setback/solution formula.
- Prevents the story from ending just as the premise becomes interesting and asks the final third to exploit the central idea fully.
- Discourages manufactured storybook flourishes and clever-sounding but empty lines.

# Moonbeam Stories V251.16

V251.16 repairs the developer-only cover text editor. Title and author/dedication are now edited directly in the browser and saved exactly as typed, rather than calling the missing `developer-cover-text` API action. Saved-book edits persist to the existing saved story record and invalidate saved KDP description/keyword metadata. No database migration or new API function is required.

# Moonbeam Stories V251.14

V251.14 adds a positive creative target on top of V251.13's anti-whimsy cleanup. The story engine now treats plausibility as a constraint on imagination rather than a substitute for it: grounded stories should still contain genuinely compelling experiences, discoveries, problems, achievements, humour, surprise or other consequential events, with the child acting as a meaningful cause of what happens rather than merely following adult procedure. Technical detail is retained only when it improves narrative interest or consequence, and the engine applies a concise “It was the one where…” retelling test without imposing a fixed plot formula.

The visual-storyboard and illustration prompts are also strengthened. They now prioritise the event that advances the page rather than an easy portrait or incidental object, require physical/spatial coherence for characters and equipment, preserve recurring vehicles/environments/objects, and seek visual progression between pages through changing story events rather than arbitrary redesign. The JSON-repair route carries the same standards. No UI, credits, database schema or API-function-count changes.

---

# Moonbeam Stories V251.13

V251.13 tightens the story engine's creative direction. It removes prompt wording that could encourage arbitrary whimsy (including locale vocabulary examples such as “biscuit”, the early-years invitation to “absurdity”, and the “mundane realism” framing) and replaces the previous weak personification guidance with a concise reality/agency/prose discipline. Blank or realistic premises now favour grounded adventure, mystery, discovery, exploration, humour and coherent problem-solving; deliberate fantasy remains fully available when established by the premise. The writer is explicitly directed to create imagination through interesting events rather than faux-poetic personification, arbitrary impossible objects, stock cosy props or strained comparisons. The JSON-repair path carries the same creative standard. No UI, illustration, credit, database or API-function-count changes.

---

# Moonbeam Stories V251.07

## V251.07 — illustrated whole-book audit fix

- Fixes a concrete indexing bug in the developer continuity tools: story-page text was being paired with the wrong illustration. Page 1 story text was compared with the opening illustration, subsequent pages were shifted, and the closing spread was omitted.
- The whole-book audit now supplies all six finished reading spreads in their true order: opening → story pages → closing, with each text paired to its own illustration.
- The manual continuity investigation and canonical repair planner use the same corrected page/image mapping.
- The separate **Check text against illustrations** tool is fixed to use the same correct mapping.
- Adds explicit within-page action/timing-state auditing. The model must flag mixed moments such as Sam still walking towards the rocket while the flag is already shown repaired.
- Coherent prose is not rewritten merely to accommodate an erroneous illustration; the audit is told to identify the illustration as the conflicting source when appropriate.
- Repair page indexes now map directly to the real reading spreads, including opening and closing.
- No new API endpoint and no SQL migration.

---

## V251.06 — live cover overlay editing fix

- Fixes **Correct title** so it updates the actual separate HTML title overlay on the existing cover immediately.
- The underlying cover illustration is not regenerated or altered when only the title changes.
- After a successful title correction Moonbeam refreshes the visible cover text layer and returns to the cover, so the new title is visible at once.
- Keeps persistence through the existing `saved_stories.title` field for saved books.
- Fixes the same overlay path for developer **author/dedication** overrides: saved overrides are restored into the book object and are used by the visible cover subtitle layer.
- `buildBook` now preserves saved cover-text overrides instead of dropping them when reopening a saved story.
- All V251.05 database fixes, V251.04 legal wording and V251.03 continuity tools are retained.
- No image generation is used for title/byline-only changes.
- No new Vercel endpoint and no SQL migration.

---

## V251.05 — saved cover-text persistence fix

- Fixes the developer **Correct title** failure on already-saved books.
- Removes the invalid attempt to write a non-existent `story` column in `saved_stories`.
- Title corrections now update the existing `saved_stories.title` column.
- Cover author/dedication overrides are stored inside the existing `saved_assets` JSON metadata, so no database column or SQL migration is required.
- Saved-story loading restores those cover-text overrides from `saved_assets`.
- KDP description/keyword caches are still invalidated when cover metadata changes.
- All V251.04 legal wording and V251.03 developer continuity tools are retained.
- No new Vercel endpoint and no SQL migration.

---

## V251.04 — AI continuity wording in Terms and Refund Policy

- Strengthens the Terms' AI-generated-content wording to expressly cover occasional story/illustration and cross-page continuity inconsistencies.
- Gives concrete categories such as character appearance, clothing, surroundings, and object appearance, size, position and continuity.
- Clarifies that minor AI-generated errors, variations and continuity inconsistencies do not necessarily mean the requested story was not supplied.
- Strengthens the Refund Policy to state that a successfully generated story is not normally refundable merely for a disliked creative choice or a minor visual, narrative or continuity inconsistency.
- Explicitly preserves remedies that apply under consumer law for faulty, misdescribed or otherwise non-compliant digital content/services.
- Avoids an absolute exclusion of responsibility.
- Equivalent wording is included in all seven supported legal-document languages.
- Legal-document revision date updated to 23 September 2026.
- No application logic, credits, story generation, developer editing, API endpoints or database schema changed.

---

## V251.03 — complete developer continuity repair + full re-illustration

- Keeps **Correct this page** for small individual page fixes.
- Keeps the automatic **Check text against illustrations** review.
- Adds **Add continuity problem** inside the whole-book audit so the developer can report problems the automatic scan misses.
- Manually reported problems are investigated across the entire finished story and all illustrations.
- The developer chooses canon; repair plans now include complete minimally corrected replacement text where needed.
- Staged workflow: **Apply proposed text repairs → Approve corrected text → Re-illustrate book**.
- Re-illustration stays locked until corrected text is explicitly approved.
- Full re-illustration starts clean and rebuilds **cover → page 1 → page 2 → …**, without using the rejected old artwork as continuity references.
- Human-chosen canonical facts are carried through the new illustration sequence, and each new image seeds the next.
- Saved-book artwork is replaced in place and publishing metadata caches are invalidated.
- Entire workflow is developer-account-only; ordinary customer generation is unchanged.
- No new Vercel endpoint and no SQL migration.

---

## V251.02 — developer whole-book continuity audit

- Adds **Whole-book continuity audit** beside the existing developer correction/review tools.
- Audits the complete story and all finished page illustrations together, across page boundaries.
- Detects persistent-state conflicts such as an object being planted and later appearing in a pocket, changing identity/size, inconsistent equipment, location, damage, clothing or time-of-day state.
- It does **not** invent an explanation or decide which contradictory version is canon.
- For each conflict it presents the evidence and 2–4 supported canonical choices, plus **Enter different canon…**.
- Once the developer chooses canon, Moonbeam creates a page-by-page repair plan identifying text changes and illustrations that require regeneration.
- The chosen canon is explicitly authoritative in that repair plan.
- No repair is silently applied at the audit stage.
- Developer-only; ordinary customer generation is unchanged.
- Reuses the existing `generate` endpoint: no new Vercel function and no SQL migration.

---

## V251.01 — developer illustration/text continuity review

- Adds **Check text against illustrations** to the developer editing tools on finished books.
- The review sends each finished page illustration with its corresponding text plus the complete finished story to the existing generation endpoint.
- It reports only genuine correctable text/image contradictions; harmless omissions and composition differences are ignored.
- Established story facts outrank an illustration. The checker will not rewrite the plot merely to accommodate an erroneous image.
- For safe mismatches, it proposes a minimal replacement for that page's text.
- Every proposed change is shown to the developer with **Accept / Reject**. Nothing changes automatically.
- Accepted corrections use the existing saved-book text persistence path.
- This is developer-only and is not an extra generation stage for ordinary customer books.
- No new Vercel endpoint and no SQL migration.

---

## V251.00 — full developer cover correction

- **Correct cover** now exposes three independent correction targets: **Correct title**, **Correct author/dedication**, and **Correct cover artwork**.
- The developer still describes the required change in free text; that instruction is authoritative.
- Title correction changes the actual stored book title rather than painting text into the artwork.
- Author/dedication correction changes the stored cover text layer, not the image.
- Saved-book cover-text corrections are persisted and invalidate previously prepared KDP description/keywords so downstream publishing can use the corrected metadata.
- V250.99 surgical illustration correction remains intact.
- Reuses the existing `generate` and `illustrate` endpoints: no new Vercel function and no SQL migration.

---

# Moonbeam Stories V250.99

## V250.99 — surgical illustration correction

- **Correct illustration** now sends the actual existing illustration as the first and primary edit reference.
- The image service is instructed to preserve composition, framing, characters, likenesses, poses, clothing, expressions, lighting, colours, background, scale and style.
- Only the developer-described error should change, plus the minimum dependent detail needed for physical coherence.
- Normal Moonbeam instructions that demand a new composition are explicitly disabled during correction requests.
- Cast references remain secondary identity anchors; preceding artwork remains secondary continuity context.
- Saved-book correction and V250.98 cover correction remain intact.
- No new API endpoint and no SQL migration.

---

# Moonbeam Stories V250.98

## V250.98 — developer-only cover correction

- Adds **Correct cover** to the finished cover for the developer account only.
- The developer describes the exact inconsistency; that instruction is authoritative.
- Regenerates only the underlying cover artwork from the complete finished story and Cast references.
- Existing Moonbeam title/author/dedication typography remains separate and unchanged.
- Saved books have their saved cover artwork replaced in place.
- Retains V250.97 page-level Correct text / Correct illustration.
- No new API endpoint and no SQL migration.

---

# Moonbeam Stories V250.97

## V250.97 — developer-only continuity correction

- Adds **Correct this page** to every finished story spread on the developer account only.
- The developer types the exact inconsistency and chooses **Correct text** or **Correct illustration**.
- Text correction rewrites only the current page, using the complete finished story for context and the developer instruction as authoritative.
- Illustration correction regenerates only the current page image, using the current story facts, developer instruction, Cast reference photo where available, and preceding artwork for continuity.
- Saved-book corrections replace the saved text/artwork in place. A text or image correction invalidates any previously generated KDP description so the next Kindle preparation is based on the corrected story.
- Developer correction reuses the existing `generate` and `illustrate` endpoints; no additional Vercel function is added.
- Ordinary customer accounts and shared-story readers do not see or receive the correction controls.
- No SQL migration required.

---

## V250.96 — coverless KDP EPUB + author photo fix

- Kindle EPUB export no longer includes the Moonbeam book cover. The EPUB now begins with the first story text page; the KDP cover is supplied separately outside the EPUB.
- Fixes the **About the Author** portrait so Sam/Emily's existing Moonbeam Cast/profile photo is decoded from its saved image bytes before being drawn into the circular author portrait.
- The author biography, Moonbeam website link, story text/illustration sequence, saved KDP description and all non-Kindle Moonbeam behaviour are unchanged.
- No new API endpoint or SQL migration is added.

---

## V250.95 — Vercel Hobby function-count fix

- Moves the four shared server helper modules (`_credits.js`, `_shares.js`, `_stripe.js`, `_usage.js`) out of `/api`. Vercel treats every JavaScript file under `/api` as a Serverless Function, including underscore-prefixed helper files.
- `/api` now contains exactly 12 JavaScript entry files, matching the Hobby-plan limit.
- Existing API entry-point URLs are unchanged.
- Updates the `resend-inbound` helper import to the helpers' non-API location.
- KDP description generation remains folded into the existing `generate.js` endpoint; no KDP endpoint is added.


## V250.94 — keep KDP description inside the 12-function Vercel limit

- Removes the separate `api/kdp-description.js` serverless route introduced in V250.93.
- KDP description generation now uses a developer-only `action: "kdp-description"` branch of the existing `api/generate.js` function.
- The KDP branch runs before story-credit reservation, so exporting/publishing copy does not consume a Moonbeam story credit.
- The client now requests KDP copy through `/api/generate`; saved-book KDP description behaviour and EPUB contents are otherwise unchanged.
- Deployment returns to 12 public Vercel API functions; the four underscore-prefixed files in `api/` are shared helper modules, not public routes.


## V250.93 — saved KDP description on Kindle export

- The first developer-only **Download Kindle eBook** action for a saved Sam or Emily book now generates a separate 100–150 word Amazon KDP description from the completed story.
- The description is saved inside the existing `saved_assets` metadata for that saved story; no database migration is required.
- The description is never inserted into the EPUB or normal Moonbeam reader. It is shown only in the developer publishing controls, as selectable plain text with **Copy KDP Description**.
- Reopening the saved story restores the same description; later EPUB downloads reuse it rather than generating a new version.
- Description generation is developer-account-only and does not consume a Moonbeam story credit.


## V250.92 — developer Kindle eBook export

- Adds a developer-only **Download Kindle eBook** button to finished, saved single-child Sam or Emily books.
- Exports a KDP-ready fixed-layout EPUB directly in the browser; no story or illustration is regenerated and no additional AI usage is incurred.
- Reuses the proven Instagram browser-flattened cover capture so the artwork, title and **By Sam/Emily Alderwick** typography are baked into one cover image exactly as rendered.
- Story text and illustrations alternate on separate fixed-layout pages. Illustration pages use the maximum available page area without cropping or distorting the artwork.
- Text pages are browser-rasterised for deterministic Kindle typography and to avoid fixed-layout font substitution.
- Adds a final **About the Author** page using the child's existing Moonbeam profile photo and a fixed reusable Sam/Emily biography. The displayed `moonbeamstories.co.uk` address has a clickable hotspot on Kindle platforms that support external links.
- Includes Amazon fixed-layout metadata: pre-paginated layout, original 1080×1350 design resolution, portrait orientation, children's-book type, navigation document, cover-image declaration and series metadata.
- EPUB packaging is generated locally in the browser. No new API endpoint, dependency or SQL migration is required.

---

## V250.91 — cover-first whole-book illustration continuity

- The dedicated front cover now reads the complete finished story (opening, all story pages, scene directions and closing) before choosing its scene.
- The finished story is explicitly authoritative over generic title/genre/premise imagery, including location, time of day, weather, clothing, vehicles, machines, props, scale and other concrete visual facts.
- The cover is now generated before reading-page prefetch begins and acts as **image zero** for visual continuity.
- Scene 1 always receives the finished cover as its continuity artwork; subsequent scenes continue the existing previous-artwork continuity chain.
- The old mobile path that could generate Scene 1 independently before the dedicated cover has been removed, preventing the continuity chain from starting in two different places.
- Story-required changes still override previous artwork, so clothing, locations, objects and environments may change when the text actually changes them.
- No SQL required. API count unchanged.

---

## V250.90 — reduce stock atmospheric personification

- Tightens the story-generation creative brief to discourage habitual personification of settings and inanimate surroundings.
- Places, planets, moons, forests, jungles, seas, skies and landscapes should not routinely listen, watch, whisper, hum, sing, breathe or wait as sentient observers.
- Personification remains available when it has a genuine story purpose, such as a setting that is actually magical or alive.
- Prefers concrete, specific description over stock atmospheric personification.
- All other V250.89 behaviour is unchanged.

No SQL required. API count unchanged.

---

# Moonbeam Stories V250.89

## V250.89 — developer-only Sam/Emily cover author credits

This build starts from **V250.88** and makes one deliberately narrow cover-text change.

- On the existing authenticated Moonbeam developer account only, a story with exactly one hero named **Sam** shows **By Sam Alderwick** on the cover instead of the normal bedtime dedication.
- On that same developer account only, a story with exactly one hero named **Emily** shows **By Emily Alderwick** instead of the normal bedtime dedication.
- Stories about every other child on the developer account keep the existing bedtime dedication unchanged.
- Stories with multiple heroes keep the existing bedtime dedication unchanged, even if Sam or Emily is one of them.
- All ordinary Moonbeam accounts keep the existing bedtime dedication unchanged.
- The restriction reuses Moonbeam's existing server-verified developer-access check (`MOONBEAM_DEVELOPER_EMAIL`); no developer email address is exposed or duplicated in client code.

No SQL is required. Story generation, illustration generation, saved stories, payments, sharing and Instagram publishing are otherwise unchanged.

---

# Moonbeam Stories V250.88

## V250.88 — retire automatic Reel posting; keep demo-child generator

The unattended Instagram automation experiment has been removed.

- Removes the automatic posting schedule UI and all schedule controls from the Create Story page.
- Removes the Supabase cron/cloud-runner/Sandbox routes and the Vercel Sandbox dependency.
- The old **Generate automatic Instagram reel** developer button is replaced by **Generate demo child**.
- That button now does only two things: invents one completely fictional child with a photorealistic portrait, and saves that child/photo to **Your Cast**.
- It does **not** invent a story premise, generate a story, create illustrations, build a Reel or publish anything to Instagram.
- Manual story creation is unchanged. The existing end-of-book **Post reel to Instagram** and **Post carousel to Instagram** flows are retained unchanged.
- Adds `SUPABASE_V250_88_RETIRE_INSTAGRAM_AUTOMATION.sql`, which must be run once to unschedule the old once-per-minute cron wake-up and retire its schedule RPCs. The old schedule table is retained only as inert historical data.
- Restores `SUPABASE_V250_CAST_GENDER.sql` to the complete package after it was accidentally omitted from the later V250.85/V250.86 packaging.

No customer story-generation, illustration, reader, Cast editing, payments or normal Instagram Reel/carousel behaviour is changed.

---

# Moonbeam Stories V250.87

## V250.87 — Fix automatic Reel Sandbox Chrome preflight scope

V250.86 reached the cloud-browser preparation stage but failed before the Sandbox Chrome preflight could run with `executable is not defined`. The diagnostic command embedded a Sandbox-local variable inside the outer Vercel Function template literal, so Node tried to interpolate that variable in the wrong scope.

- Keeps `executable` entirely inside the Sandbox preflight process.
- Runs `ldd` directly with `execFileSync('ldd', [executable])` and filters its output for unresolved libraries, avoiding nested template interpolation and shell quoting.
- Preserves the existing Chrome launch/close preflight, persistent Sandbox, 10-minute runner, schedule controls and automatic Reel pipeline.
- Customer-facing story generation, illustration generation and Instagram publishing behaviour are otherwise unchanged.

No SQL is required. API count remains unchanged.

---


## V250.86 — Fix Vercel Sandbox Chrome dependency installation

V250.85 reached the scheduled cloud runner but the first-time dependency step used Puppeteer's `--install-deps` helper. That helper is Debian/Ubuntu-specific and the Sandbox environment did not complete it successfully, so the browser never reached its launch preflight.

- Replaces Puppeteer's OS dependency helper with explicit Vercel-Sandbox-aware installation.
- Detects the Sandbox package manager at runtime and supports both current Ubuntu/`apt` images and Amazon-Linux/`dnf` images.
- Installs Chrome's required NSS/NSPR, GTK, X11, audio, font and graphics libraries with root privileges.
- Uses a fresh persistent Sandbox name (`moonbeam-instagram-auto-v3`) so the failed V250.85 environment is not reused.
- Keeps the real Chrome launch preflight and now also reports unresolved `ldd` libraries if launch still fails.
- The automatic story/Reel pipeline, schedule controls, 10-minute Sandbox limit and customer-facing generation are otherwise unchanged.

No SQL is required. API count remains unchanged.

---

## V250.85 — Fix cloud Chrome shared-library failure

The first unattended scheduled Reel reached the Vercel Sandbox correctly but Chrome could not start because the Sandbox did not yet contain Puppeteer's required Linux shared libraries (`libnspr4` was the first missing library reported).

- New persistent Sandbox name forces a clean browser environment rather than reusing the incomplete V250.84 Sandbox.
- Puppeteer is installed into a fixed persistent cache under `/vercel/sandbox/.cache/puppeteer`.
- During first-time Sandbox setup, Puppeteer's own Debian/Ubuntu dependency installer now installs the Chrome system libraries with elevated Sandbox privileges.
- Every scheduled run performs a short real Chrome launch/close preflight before handing off the 10-minute Reel job, so a broken browser environment fails immediately with a useful error instead of spending minutes on story generation first.
- The actual automatic story/Reel pipeline, schedule controls, Reel formatting and 10-minute Sandbox limit are unchanged.

No SQL is required for this fix. API count remains unchanged.

---

## V250.84 — Hobby-safe 10-minute unattended cloud runner

V250.83 could not deploy on the current Vercel Hobby plan because a Vercel Function cannot set `maxDuration` above **300 seconds**. V250.84 fixes the architecture rather than forcing the whole 4–7 minute Reel pipeline to fit inside a five-minute Function.

- `api/resend-inbound.js` is back to the valid **300-second** Vercel Function ceiling.
- When a scheduled post becomes due, the short Vercel Function now **launches a detached Vercel Sandbox runner and returns immediately**.
- The Sandbox runs the existing browser-driven Moonbeam generation flow independently for up to **10 minutes**, so Safari and the Mac can remain switched off.
- Vercel documents that Hobby sandboxes can run for up to **45 minutes**, so the 10-minute Moonbeam limit is comfortably inside the plan limit.
- The runner uses a one-time signed completion token; when it finishes it reports success/failure back to Moonbeam, updates the schedule, and the sandbox is stopped.
- A persistent named sandbox retains its Puppeteer installation between runs, so only the first run needs to prepare the browser environment.
- No new callable API endpoint is added; the callback is another action on the existing `/api/resend-inbound` route.

The existing schedule UI and automatic story/portrait/Reel behaviour are unchanged.

---

## V250.83 — 10-minute automatic Reel ceiling

The unattended Instagram Reel job now has substantially more headroom:
- Vercel function maximum duration increased from **300 seconds to 600 seconds**;
- the cloud Chromium protocol timeout increased from **290 seconds to 590 seconds**;
- the Supabase `pg_net` request timeout increased from **300,000 ms to 600,000 ms**.

The live Supabase scheduling function has also been updated to use the 10-minute request timeout. No further SQL needs to be run manually.

---

## V250.82 — Scheduled cloud automatic Instagram Reels

This build extends the developer-only automatic Reel trial so it can run with Richard's browser and computer switched off.

### Developer scheduling control
- The Create Story page now shows an **Automatic posting schedule** directly underneath **Generate automatic Instagram reel**.
- Richard can choose **Once**, **Every day**, **Every 2 days**, **Every 3 days**, or **Every week**, plus a first-post date and local clock time.
- The control shows whether automatic posting is on, the next scheduled run, and the previous run result.
- **Stop automatic posts** disables the schedule immediately.

### Cloud execution
- The schedule is persisted in Supabase rather than in Safari/local storage.
- Supabase `pg_cron` wakes Moonbeam once per minute and only claims a job when its `next_run_at` is due.
- A cloud-side headless Chromium session signs into the developer account with a one-time Supabase admin magic link and runs the same proven browser-driven `generateAutomaticInstagramReel()` flow.
- This deliberately preserves browser-flattened Reel typography instead of going back to the broken server-side text rendering path.
- The database lock prevents another scheduled run being claimed while the current one is still running.
- On success the next occurrence is calculated in the saved timezone; one-off schedules switch themselves off. On failure the run is recorded as failed and recurring schedules move to their next occurrence.

### Story variety
- The automatic premise selector is broadened substantially: wildcard/unconstrained, fantasy, space/SF, time travel, prehistory, underwater, surreal, absurd comedy, historical, giant/miniature, machines, extreme environments, inside-art/book/game worlds, mystery, transformation and occasional ordinary-place-becomes-impossible stories.
- This removes the V250.81 bias toward repeated modern-setting magical anomalies.

### Infrastructure
- Uses the existing `resend-inbound` endpoint, so the deployment remains at **12 callable API endpoints**.
- Adds `puppeteer-core` and serverless Chromium as production dependencies for unattended browser rendering.
- Adds `SUPABASE_V250_82_INSTAGRAM_AUTO_SCHEDULE.sql`. The migration has already been applied to the connected Moonbeam Supabase project in this build session.

---

## V250.81 — Automatic demo-child realism weighting

This build tightens the **developer-only automatic Instagram Reel** child invention stage before Richard trials it.

Changes:
- sampled demo-child ethnicity now follows broad current-UK proportions:
  - White **81.7%**
  - Asian / Asian British **9.3%**
  - Black / Black British / Caribbean / African **4.0%**
  - Mixed / Multiple **2.9%**
  - Other ethnic group **2.1%**
- within each broad bucket, Moonbeam now samples from more specific sub-profiles so eye colour, hair colour and hair texture stay **plausible** rather than producing absurd combinations;
- eye colour and hair colour are now conditionally varied rather than defaulting to repetitive blonde/blue-eyed outputs;
- portrait backgrounds are now explicitly varied across realistic real-world settings and must **not** default to a plain white or studio background;
- the child is instructed to look **ordinary and believable**, allowing slimmer, average, stockier or heavier builds and less idealised facial variation rather than every portrait being polished or model-like;
- the invented story premise is now constrained to **one child only**, with **no adults, siblings, pets or sidekick animals** in the premise.

No SQL required. API count remains unchanged at **12 callable endpoints**.

---

## V250.80 — One-click automatic Instagram Reel trial

A new **developer-only** button appears at the bottom of the Create Story page: **Generate automatic Instagram reel**.

One click now trials the whole marketing pipeline while Richard is at the screen:
1. invent a completely fictional demo child aged 3–12, with first name and Male/Female marker;
2. generate a photorealistic synthetic portrait of that fictional child;
3. add the child and portrait to Richard's Moonbeam Cast (internally tagged with the existing hidden `relationship` field as `__moonbeam_demo__`; no schema change);
4. invent an age-appropriate story premise and generate the story through the existing Moonbeam story engine;
5. generate the existing stable dedicated cover and all story illustrations;
6. save and verify the complete book;
7. render the current Reel format in the browser, preserving the proven browser-flattened typography;
8. run the existing Reel preparation checks;
9. publish automatically to **@moonbeamstoriesuk**;
10. add the complete book to the existing `/instagram` gallery.

A blocking developer progress card reports each stage and shows the fictional child portrait. On any failure the pipeline stops and reports the error rather than continuing to post. A prepared temporary Reel is discarded if publication fails.

The developer trial uses a secure developer-only generation header so these marketing demo stories do **not** consume Richard's customer story credits, while still creating the normal bounded illustration generation run. Ordinary customer generation is unchanged.

No SQL is required and the deployment remains at the existing **12 callable API endpoints**. This is manual/on-demand only: no scheduler or autonomous daily trigger has been added yet.

---


## V250.79 — Longer Reel CTA

- Extended the final Reel CTA from **2.8 seconds to 4.0 seconds** so viewers have more time to read and digest it.
- The photo opener remains 4.0 seconds.
- Book-page timings and all transitions are unchanged.
- The CTA wording and larger typography from V250.78 are retained.

No SQL required. API count unchanged.

---


## V250.77 — Special photo-to-cover reveal

This build starts from **V250.76** and adds a dedicated reveal transition only between the **real-photo opener** and the **normal-length book cover**.

Reel order is now:
- ultra-brief cover flash
- 4.0s real-photo opener
- **0.65s special reveal transition into the cover**
- normal cover
- story pages
- CTA

All later book-page transitions remain as before. No SQL required. API count unchanged.

---


## V250.76 — Reel order changed

This build starts from **V250.75** and changes the developer Reel sequence to:
- **ultra-brief cover flash**
- **real-photo opener**
- **normal-length book cover**
- **story pages**
- **CTA**

Timing details:
- cover flash remains **0.10s**
- real-photo opener remains **4.0s**
- the full visible book cover is now restored for **2.2s** before page 1

No SQL required. No API count change.

---


## V250.75 — Longer photo opener

This build starts from **V250.74** and makes one Reel timing change:
- the real-photo **Meet [name]** opening scene now stays on screen for **4.0 seconds** instead of 2.8 seconds, giving viewers time to read and understand the three-line setup.
- the ultra-brief book-cover flash frame remains unchanged.

No story generation, illustration generation, Cast logic, Reel text layout, Instagram publishing, database schema, or API endpoints are changed.

---


## V250.74 — Cover-flash Reel thumbnail

- Reel videos now start with an ultra-brief book-cover flash frame purely to influence the Instagram grid thumbnail.
- The visible viewing experience then moves straight into the real-photo “Meet [name]” opener, so the wanted-poster frame remains the effective first scene for viewers.
- The flash is intentionally tiny (0.10s) so it should barely register during playback while still giving Instagram a better chance of using the cover on the profile grid.


This build starts from **V250.72** and makes one visual-only change to the developer Instagram Reel:
- the cream/white fill of each story text panel now uses the same rounded path as its gold border, so the corners match exactly.

No story generation, illustration generation, Reel sequencing, Cast logic, Instagram publishing, database schema, or API endpoints are changed.

---

## V250.72 — Clean Reel book text panels

This build starts from **V250.71** and simplifies the book-page portion of the silent Reel.

### Reel text-panel change
- Removed the old highlighted/narrated snippet from the top of each Reel text panel.
- Removed the extra divider/highlight treatment so the lower half of each Reel page now looks like a straightforward book text window beneath the illustration.
- The full page text uses the available panel space and automatically scales down only when necessary to fit.
- Text is still flattened in the browser before the Reel reaches Vercel, preserving the proven typography fix.
- The real-photo intro, silent format, subtle motion, cover, CTA, one/two-child handling and Male/Female wording are unchanged.
- No SQL is required and **12 callable API endpoints** remain.

---

## V250.71 — Browser-flattened Reel opening text

This build fixes the broken/gibberish text in the new photo-led Reel opening. V250.70 accidentally reintroduced server-side SVG text for that one new opening frame, which is the same rendering path that caused the earlier Reel text corruption.

### Fix
- The entire real-photo opening frame — photos, **Meet [name]** heading, all three promo lines and Moonbeam branding — is now rendered and flattened to a JPEG **in the browser** before it is sent to Vercel.
- The Reel server now treats that opener as a finished image and does not typeset any of its text.
- The already-proven browser-rendered book text panels and CTA remain unchanged.
- Silent Reel timing, subtle motion, one/two-child handling, Cast/gender logic and preview-before-publish remain unchanged.
- No SQL is required.
- **12 callable API endpoints** remain.

---

## V250.70 — Silent photo-led Instagram Reels

This build starts from **V250.69** and changes the developer-only Reel format so it feels more like a short social promo than a narrated book excerpt.

### Reel format changes
- Reels are now **silent**. Moonbeam no longer generates teaser narration audio for Instagram Reels.
- Every Reel now opens with the **real uploaded photo** of the hero child (or two hero children when there are two protagonists).
- The opener uses social-style copy such as **“Meet Sam”**, followed by short lines about loving stories and being in them.
- After the real-photo opener, the Reel moves into the Moonbeam cover, then the illustrated story pages, and finishes with the existing CTA panel.
- Subtle motion and fade transitions remain, but the first segment still avoids the old black fade-in problem.

### Hero-photo handling
- Reel preparation now collects the current hero-child photo(s) directly from the story cast.
- When a story is saved, Moonbeam now also stores lightweight hero-cast metadata inside `saved_assets`, so reopened saved stories can still prepare a Reel more reliably.
- Reel posting continues to ignore supporting adults and pets for the opener.

### Existing behaviour retained
- The Reel flow is still developer-only and still uses preview-before-publish.
- Carousel posting is unchanged.
- No new SQL is required.
- **12 callable API endpoints** remain. No API endpoint has been added.

---

## V250.64 — Browser-rendered Reel text

This build starts from **V250.63** and fixes the Reel preview text corruption shown in Safari. The Reel no longer asks the server/Sharp SVG renderer to typeset story text, snippets, titles or the CTA.

### Reel text-rendering fix
- Reel text is now rasterised **in the browser**, using the same browser/canvas approach that fixed the Instagram carousel text slides in V250.52.
- The finished cover is captured in the browser and reused as the Reel cover frame, so its title typography is already flattened before it reaches Vercel.
- Each of the four Reel story text panels is captured as a finished JPEG in the browser, including the highlighted narrated snippet and the full page text.
- The final Reel CTA panel is also captured in the browser.
- Vercel/Sharp now only composites those already-finished image assets with the stored illustrations and renders the MP4; it no longer typesets Reel text server-side.
- The browser-captured assets are tightly compressed before upload so the Reel preparation request stays comfortably below Vercel request-size limits.
- If a Reel is the first Instagram post for a book, the exact browser-flattened cover is also used for the Moonbeam `/instagram` gallery entry.

### Existing behaviour retained
- Separate developer-only **Post carousel to Instagram** and **Post reel to Instagram** buttons remain.
- Reels are generated only after pressing the Reel button.
- Preview/approve-before-posting remains unchanged.
- Reels and carousels use the same agreed caption and five hashtags.
- Successful Reel posts still add the complete book to the Moonbeam Instagram gallery without duplicating an existing entry.
- The dedicated private `instagram-reels` video bucket introduced in V250.63 remains in use.
- **No new SQL is required for V250.64.**
- **12 callable API endpoints** remain. No API endpoint has been added.
- Story and illustration generation remain untouched. `api/generate.js` and `api/illustrate.js` are unchanged from V250.59.

---

# Moonbeam Stories V250.63

## V250.63 — Dedicated Instagram Reel video storage

This build starts from **V250.62** and fixes the Reel failure shown after the finished MP4 was rendered.

### Reel storage fix
- Rendered Reel MP4 files are no longer uploaded into the `saved-story-art` bucket.
- They now use a dedicated private Supabase Storage bucket named `instagram-reels`.
- The existing `saved-story-art` bucket remains image-only and is not loosened or repurposed.
- The public Moonbeam Reel URL still streams the video through the existing `/api/share` endpoint, including byte-range support required by browsers/Instagram.
- Temporary Reel videos are deleted from the new bucket after a successful post or when a preview is discarded.

### Required one-time Supabase migration
Run `SUPABASE_V250_63_INSTAGRAM_REELS_BUCKET.sql` once in the Supabase SQL editor before testing Reel posting. It creates/updates the private `instagram-reels` bucket with:
- MIME type: `video/mp4`
- maximum file size: 100 MB
- public access: off

The server-side Moonbeam functions access the bucket with the existing service credentials, so no additional public storage policy is required.

### Existing Instagram behaviour retained
- Separate developer-only **Post carousel to Instagram** and **Post reel to Instagram** buttons remain.
- Reel creation happens only on demand after pressing the Reel button.
- Successful Reel posts still ensure the complete book is present in the Moonbeam `/instagram` gallery without duplicating an existing gallery entry.
- Reels and carousels keep the same agreed caption and five hashtags:

[BOOK TITLE] ✨

A personalised Moonbeam story starring [CHILD NAME].

Swipe through to start the adventure, then read the full story via the link in our bio.

Create personalised, illustrated stories starring your own child at moonbeamstories.co.uk

#MoonbeamStories #PersonalisedStories #ChildrensBooks #BedtimeStories #Parenting

### API / illustration safety
- **12 callable API endpoints** remain. No API endpoint has been added.
- `api/generate.js` and `api/illustrate.js` are unchanged from V250.59.
- The restored illustration-generation behaviour and Optional Male/Female Cast field remain intact.

## V250.69
- Fixed Reel preparation so **Post reel to Instagram** no longer navigates back to the book cover.
- The finished cover is captured invisibly using the existing off-screen clone while the end page remains visible with **Preparing reel…** progress.
- Carousel behaviour is unchanged.


V250.69
- Reel captions now use reel-specific wording: “Watch the adventure begin...” rather than the carousel “Swipe through...” line.
- Reel rendering no longer fades in from black on the first segment, so the published Reel starts directly on the cover frame instead of a black thumbnail.


V250.69
- Carousel publishing now stays on the finished-book/end page; it no longer navigates back to the cover.
- Clicking **Post carousel to Instagram** is now the final approval: Moonbeam captures the cover/text assets off-screen and publishes directly without a second preview/permission step.
- Reel publishing is unchanged and still keeps its preview/approval workflow.


V250.69
- Reel publishing now uses progressive backoff while waiting for Instagram processing: 3s, 5s, 8s, 10s, then 12s between checks.
- This reduces Meta Graph API request pressure and the chance of hitting “Application request limit reached” without changing the final publish step.
- Reel preparation timeout is extended slightly to 150 seconds to accommodate the gentler polling cadence.


V250.69
- Reel publishing now waits five seconds before its first Instagram processing-status check.
- Subsequent status checks back off much more aggressively (8s, 12s, 16s, 20s, then 25s) to reduce Graph API request volume.
- Meta/Instagram application rate-limit responses are detected explicitly and shown as a clear temporary rate-limit message instead of the raw API error.
- No automatic retry is made when Meta is rate-limiting the app, so Moonbeam does not add more requests during the throttle window.


## V251.08 — human-directed continuity checks
- Removed the automatic whole-book continuity audit from the developer UI.
- Replaced it with a manual Continuity problems workflow.
- Added separate **Add text continuity problem** and **Add illustration continuity problem** controls.
- Text reports send story text only and direct the model to inspect textual continuity.
- Illustration reports send the finished illustrations and direct the model to inspect visual continuity, using prose only as factual/timing context.
- Human reports are investigated narrowly; Moonbeam is told not to launch an unrelated automatic audit.
- Existing canon selection, repair planning, text approval and re-illustration workflow is retained.
- No new API endpoint and no database/schema change.


## V251.09
Developer manual editing now accepts general text and illustration corrections/improvements, not only continuity reports. Medium-specific investigation remains human-directed. Illustration repair instructions explicitly preserve the existing illustration as the visual master and describe only the requested delta for surgical edits.

## V251.10
- Page illustration corrections are now non-destructive candidates: generate, preview, Accept / Try again / Keep original.
- Saved artwork is not overwritten until Accept.
- Accepted page/cover artwork refreshes the persistent saved-art cache as well as the object-URL cache, fixing stale original illustrations reappearing after replacement.
- AI page-text corrections are previewed before acceptance.
- Added direct manual page-text editing; Save text stores exactly what the developer typed without an AI rewrite.

## V251.11
- Illustration replacement previews keep the correction instruction editable.
- Before pressing Try again, the developer can refine or completely replace the instruction.
- Try again always uses the current instruction-box contents while preserving the untouched original illustration until Accept.

## V251.12
- Removed the whole-book continuity audit, text-vs-illustration book check, canonical conflict/repair workflow and whole-book reillustration controls.
- Developer editing is now deliberately page-local: one Edit this page control.
- Text editing retains AI suggestions, now with Accept / Suggest another / Keep original; the instruction can be refined or replaced before requesting another suggestion.
- Manual text override remains and saves exactly what is typed.
- Illustration editing remains non-destructive: describe the change, preview a draft, Accept / refine instruction and Try again / Keep original.
- No accepted content is replaced until the developer explicitly accepts it (manual text Save remains explicit).


## V251.16
- Fixed accepted developer illustration replacements reverting visually to the original image.
- Saved-book rendering now honours the exact accepted canonical in-memory illustration instead of immediately reloading the saved asset path.
- The accepted replacement is still persisted to Supabase storage and the local saved-art cache before the editor closes.


## V251.17
- Storyboard-first generation experiment: Moonbeam now plans the complete six-scene story arc without finished prose.
- All six page illustrations are generated from the complete plan before the final story is written.
- Every illustration sees the whole arc, including later scenes and the ending, while sequential generation preserves visual continuity.
- The final writer receives the original idea, complete plan and reduced copies of all six finished illustrations, then writes the six balanced reading spreads around that visual reality.
- Finished storyboard artwork is reused directly in the reader; it is not regenerated after the prose is written.
- No Supabase schema change required.


## V251.18
Removed residual problem-solution/beat forcing from the storyboard planner. Storyboard scenes now contain only event, visual moment and continuity; explicit WHY_IT_FOLLOWS and WHAT_CHANGES fields are gone. Creative guidance no longer foregrounds obstacles, consequences, problem-solving or child-as-fixer.


## V251.19
- Adds soft developmental child-appeal guidance to the story conception/storyboard stage.
- Focuses on compelling experiences rather than age/gender subject stereotypes.
- Explicit Story Ideas, interests, dislikes and Cast context outrank demographic tendencies.
- Gender is treated only as a weak optional signal and never as a restriction.
- No API or Supabase schema changes.


## V251.20 — Concept builder + account creative memory
- Adds a dedicated concept-builder pass before the six-scene storyboard. The concept pass cannot write story prose or scenes; it must first identify a genuinely compelling child-centred premise.
- Rejects outings/settings as sufficient stories on their own and explicitly checks what the child would be excited to tell somebody happened.
- Adds account-level anti-repetition using compact summaries of the 10 most recent saved stories. The concept builder is told not to recycle underlying plot shapes, distinctive props, discoveries or endings merely with different nouns/settings.
- Adds contemporary-authenticity guidance so stock adventure shorthand such as maps, backpacks, keys, ribbons and snacks appears only when naturally required.
- Keeps V251.17+ storyboard-first production: chosen concept -> storyboard -> six illustrations -> final prose written from the plan and finished pictures.
- No Supabase schema change and no new API endpoint.


## V251.21 — Robust concept-builder response handling
- Keeps the V251.20 concept-builder and account-level anti-repetition architecture unchanged.
- Parses concept JSON defensively, including harmless trailing commas and a nested `concept` object.
- Accepts a few semantically equivalent field names instead of rejecting an otherwise valid concept.
- If the first concept response is malformed, makes one formatting-repair attempt before failing.
- Replaces the misleading ‘could not find a strong story concept’ error with a neutral technical retry message.
- No Supabase schema change.

## V251.28
- Increased only the concept-builder and concept-format-repair `max_output_tokens` allowance from 1600 to 4000 after diagnostics confirmed both calls were ending `incomplete` with `reason: max_output_tokens` before producing visible output.
- Retains the V251.27 developer diagnostics. No story prompt, parser, illustration, reconciliation, API-count, or database changes.


## V251.30
- Keeps the V251.28 4,000-token concept-builder allowance.
- Strengthens concept, storyboard and final-author guidance for comedy, excitement, suspense and age-appropriate safe peril without changing the generation pipeline.


## V251.30
Strengthens the story concept architecture so adventure/mystery concepts require a genuine dramatic engine, adults do not neutralise the central adventure, safety shapes consequences rather than preventing events, and stock map/plan/note/key devices are not used as default navigation or discovery mechanisms. Retains the proven 4,000-token concept-builder limit.


## V251.31
- Adjusts the developer-only **Generate demo child** tool for publishing/marketing use.
- Removes the deliberate counter-beautification bias toward plain, awkward or heavier fictional children.
- Generated demo children are now naturally attractive, warm, expressive and visually appealing while remaining believable and individual rather than artificially perfect or model-like.
- Body type remains naturally varied but neutral; no deliberate uglification or caricature.
- Customer child profiles, story generation, illustration continuity and the 4,000-token concept limit are unchanged.


## V251.32
- Developer-only Generate demo child tool now lets the developer choose Boy, Girl or Random and age 3–12 or Random before generation.
- Random remains the default for both controls, preserving the previous one-click behaviour.
- Normal customer child creation and illustration behaviour are unchanged.

## V251.53
- Refines the V251.52 copyright/originality safeguard so it distinguishes protected works from original source material confidently in the UK public domain.
- Close adaptations of confidently public-domain originals are permitted when requested; the model does not rely on a hard-coded catalogue of public-domain titles.
- If public-domain status is uncertain, the source is treated as protected.
- Later protected adaptations, translations, illustrations, films, television versions, games and editions remain excluded even when the underlying original is public domain.
- Final story reconciliation preserves legitimate public-domain adaptations while retaining the protected-work safeguard.
- No Supabase schema change and no API endpoint added.

## V251.52
- Separates narrative/storyboard context from image-generation context for required story illustrations.
- Normal page illustration requests now send the already-planned current visual moment plus character/world continuity, rather than repeatedly exposing the image model to hazardous actions from all six scenes.
- Safety retries are rebuilt as genuinely fresh minimal prompts instead of prepending instructions to the rejected long prompt.
- Retry composition requires children to be visibly secure on stable ground with hazards separated by distance, structure, barrier or viewpoint.
- Story danger, suspense, six-scene planning, Cast identity, previous-art continuity and visual-variety architecture remain intact.
- No Supabase schema change and no API endpoint added.


## V251.59
- Fixes the developer masked-illustration editor so the complete image is bounded inside the correction dialog and the overlay canvas remains exactly aligned with it.
- Prevents the public homepage flashing during signed-in session restoration on refresh.
- Locks cover character rendering to the same naturalistic realism standard as interior illustrations.


## V251.76
- Astra's combined six-interior + cover art-direction stage now uses strict structured output with an exact six-scene schema and a larger output allowance.
- Removed the obsolete second Astra cover-art-direction API path; cover generation uses the commission already created with the interior storyboard.
- Developer-only Abort generation control is now compact.


## V251.87
- Fixed developer Story Workshop false-ready state after failed initial Astra planning.
- Send to Astra and Create this book now remain disabled until a valid initial production plan exists.
- Initial planning failures show the real diagnostic and a Retry initial development control.
- Removed silent no-op guards: impossible missing-plan states now surface visibly instead of making buttons appear broken.


## V251.91 — durable pre-illustration checkpoint
- Workshop production now MUST persist Astra's approved story architecture and complete art-direction plan before illustration 1 is requested.
- Approved Workshop concept references are included in that checkpoint, so a first-image failure can resume the same designed book rather than rerunning Astra planning.
- One-click generation now uses the same fail-closed rule: if its post-Astra checkpoint cannot be saved, Moonbeam stops before Sunburst rather than spending image calls without recoverable state.
- Workshop production failures now leave a persistent visible developer diagnostic instead of being cleared by the final cleanup block.
- No database migration is required.

# Moonbeam Stories V251.93

## V251.93 — developer Series Library, stage 1
- Developer account only: Saved Stories can now be organised as Series → Volume → Story.
- Create, rename and delete Series and Volume folders without deleting the saved stories inside them.
- Move saved stories between volumes or back to Loose stories; reorder stories within a volume.
- Rename individual saved stories from the library.
- Each Series now has editable persistent Series Instructions / Bible text, ready for Astra series-generation work in a later stage.
- Series data is stored in dedicated Supabase tables and is accessible only through the existing server-side developer-account gate; ordinary authenticated Moonbeam accounts have no direct table privileges.
- Ordinary users retain the existing flat Saved Stories interface unchanged.
- No story-generation, Astra, illustration, credit, reader or KDP-generation behaviour was changed in this stage.


## V251.94 — Develop Series with Astra (planning stage)
- Developer-only Series workspace now links a Series to a lead child from Your Cast.
- Develop Series with Astra separates the creative Series Bible from the audience/publishing brief and persists the approved plan.
- Generate new volume inherits the approved Series identity and Cast, lets Astra choose an 8–16 story ideal size plus two editorial candidates, and accepts optional developer direction without redefining the recurring lead.
- Character proposal → accept/retry → world interpretation → accept/revise/different interpretation → whole-volume story-outline planning.
- Each story concept can be accepted or individually replaced; at least 8 accepted concepts are required before the volume is considered ready for production. Rejected slots do not have to be replaced if at least 8 remain.
- Planning is durable in Supabase and can be resumed from the Series Library.
- Copyright/franchise collision avoidance is a hard planning guardrail, including manual character overrides.
- V251.94 deliberately stops before paid story/image production. The approved plan will be connected to the unchanged existing Moonbeam story-production pipeline in the next stage.


## V251.94.1 — Series Bible editing correction
- The Series Bible panel in the developer Series Library is now a real editable textarea with an explicit Save Bible action, rather than a read-only display panel.
- Manual Bible edits deliberately mark the Astra Series Plan unapproved so the developer reviews/approves the revised plan before starting a new volume.
- Removed the redundant legacy Edit instructions button from the Series card.
- Astra's series-development context now explicitly knows the commercial purpose: Amazon publishing is primarily intended to introduce parents to Moonbeam Stories and attract potential users, while promotion must remain outside the fiction itself.

## V251.95 — guided Series setup
- Developer-only New Series is now a mandatory step-by-step wizard: name → main Cast character → optional series-world Cast → audience → series concept → Astra development → review/approval.
- Incomplete series reopen at the first unfinished step and do not expose volume generation until setup is approved.
- Series-world Cast are explicitly optional: Astra is told not to force them into stories, normally to use at most one additional Series Cast member per story, and to allow brief cameo appearances.
- Astra receives the selected supporting Cast plus the standing Amazon/Moonbeam commercial purpose, while marketing remains separate from fiction.
- Existing volume planning and the current story-production pipeline are otherwise unchanged.


## V251.96 — guided volume planning
- Developer-only volume wizard: story target (8–16), Astra/manual character route, character approval, world interpretation, whole-volume story slate, individual accept/edit/reject-and-replace, and final approval.
- At least 8 accepted stories required; rejected/unaccepted slots may be omitted so the final volume can contain fewer stories than the original target.
- Planning persists in existing developer volume plan JSON and resumes at the current stage.
- This build deliberately stops at Ready for production and does not invoke the existing illustrated story-production pipeline.

## V251.98 — Series volume production
- Fixed Volume World revision flow: Astra now explicitly acknowledges developer steering, shows the revised Volume Bible, and remains on the world step until **Accept world** is pressed.
- Connected approved Series volume plans to the existing Moonbeam production pipeline without replacing the current Astra → art direction → Sunburst interiors → final prose → cover machinery.
- Volume production is resumable story-by-story. Each completed story is saved and filed into its Volume immediately before the next story is offered.
- Series-world supporting Cast remain optional. Production only adds a supporting Cast member when that approved story concept actually names them, and never adds more than one supporting Series Cast member automatically.
- Series-volume story covers suppress author credit and dedication.
- Series-volume saved covers are flattened to a single finished cover asset containing the generated artwork and rendered story title before storage; raw cover artwork is not treated as the finished publishing cover.
- Volume production progress is persisted in the existing Volume plan JSON; no new database migration is required.

---

# Moonbeam Stories V252.10

## V252.10 — contextual Series/Volume chapter covers
- Saved-story cover treatment is now derived from current developer Series/Volume membership, not from the protagonist, developer account, publishing status, or permanent mutation of standalone story metadata.
- Existing saved stories inside a Volume immediately render as chapter covers without the normal Moonbeam kicker/author/dedication overlay.
- Existing Series covers that were already saved as flattened artwork + title do not receive a second title overlay, so their saved title remains visible exactly once.
- A loose standalone story manually moved into a Volume receives a title-only cover overlay while viewed in that Volume; moving it back out restores the ordinary standalone cover treatment.
- Standalone saved stories and standalone publishing remain on the normal cover path and are unchanged.
- No image regeneration, resaving, OpenAI call or Supabase migration is required for existing King Sam stories.
- V252.07 transfer optimisation and V252.09 simplified no-replacement Series workflow are retained.


## V252.21
- Added a developer-only final Volume publication package after curation.
- Publication reads live Volume membership as authoritative, so deleted candidate stories cannot leak into cover/copy/export.
- Volume cover typography is composed at publication from Series name + Volume name + author; a folder named `Volume 1` therefore publishes as the Series title plus `Volume 1`.
- Added Astra-created collection cover direction, canonical Cast reference use, final cover persistence, KDP description, seven keyword phrases and reader age range.
- Added fixed-layout Volume EPUB export containing Volume cover, title page, contents, every surviving story (story cover + text + illustrations), navigation and About the Author page.
- No Supabase migration required; publication metadata is stored inside the existing Volume plan JSON.


## V252.22

- Removed the legacy per-Volume “Volume character / incarnation” stage from the generic Astra Volume workflow.
- Series identity, recurring lead and Series-world Cast now inherit automatically into every Volume.
- New Volume setup is four stages: Volume direction → Volume brief → Story slate → Review/generate.
- The first screen now offers “Let Astra decide” or an optional developer idea/direction for the Volume; this can steer themes, situations or settings but cannot redefine the established Series characters.
- Planned Series Volumes receive neutral sequential names (`Volume 1`, `Volume 2`, etc.) rather than being named after a temporary character concept.
- Astra's Volume-development prompt explicitly forbids inventing a new incarnation/role/identity for the recurring lead and treats the Series Bible and canonical Cast as inherited authority.
- Story production now labels the inherited context as the Volume creative brief rather than a Volume character.
- No Supabase migration required.


## V252.26 — Non-destructive story-cover illustration corrections
- Developer story-cover illustration corrections now use the same candidate-review workflow as ordinary page illustration corrections.
- Generating a corrected cover no longer overwrites the current cover immediately. The replacement is previewed while the original remains saved.
- **Accept replacement** persists the candidate cover; **Try again** can generate another candidate; **Keep original** discards the candidate without changing the book.
- Saved-story cover storage/cache persistence occurs only after explicit acceptance. No database migration or new API endpoint is required.

## V252.25 — Direct approved Series Bible editing
- Approved Series folders now expose Edit Series Bible and Save Series Bible directly; Astra redevelopment is not required for manual editorial corrections.


## V252.31 — Fiction Studio Stage 2
- Adds developer-only Book Development inside the isolated Back Room.
- Proposed Series Bible books can be expanded by Astra into a full-length 20–50 chapter novel blueprint with POV, character/relationship arcs, external plot, heat progression, turning points, continuity watchlist and ending.
- Book Plans persist separately in `developer_fiction_books`; browser roles remain revoked and only the server service role can access them.
- No manuscript chapters, children's-story generation or Sunburst illustration generation are called from this flow.
- Uses the existing `/api/generate` endpoint, preserving the 12-function Vercel limit.


## V252.40
- Fiction Studio now routes an approved Book Plan into the saved-novel workflow instead of the obsolete V252.32 manual chapter test.
- Generate Novel / Resume Novel writes sequential chapters automatically until completion.
- After a failed chapter request, the browser re-checks the authoritative database checkpoint before retrying, so a lost response does not blindly duplicate a saved chapter.
- Genuine transient chapter transport failures receive bounded retries.
- Continuity is self-repairing: before drafting the next chapter, a lagging ledger is rebuilt from saved chapter continuity deltas.
- Novel status polling transfers chapter numbers only instead of retransmitting the growing manuscript on every loop.


## V252.41 — exact isolated Fiction Studio book economics
- Each Fiction Studio book now persists its own Astra request ledger in `developer_fiction_books.usage`.
- Book Development architecture and chapter-plan batches are metered separately from manuscript chapter generation.
- Every metered response stores input, cached-input, cache-write (when reported), output and total tokens, API request duration, HTTP status, model and a frozen GPT-6 Astra USD price snapshot.
- Saved Novel shows Planning cost/time, Manuscript cost/time, total OpenAI cost/token counts and cumulative actual Astra API time. Idle pauses between Resume actions are excluded from actual API time.
- Review ZIP includes `generation-usage.json`.
- Historical pre-V252.41 activity is never backfilled with invented estimates; older books are explicitly marked as unmetered until new V252.41 calls occur.
- No new API function and no Supabase schema migration are required because the existing per-book `usage jsonb` column is used.

## V252.44 — Fiction Studio model laboratory + editorial pipeline
- Series Development, Book Development and Manuscript model selection: GPT-6 Astra / Sol / Luna. Each selection locks when its stage starts.
- Four versioned editorial sub-stages: developmental diagnosis, revision, line/style, proof. Each stage independently selects Astra / Sol / Luna and preserves the preceding manuscript.
- Exact request-level USD accounting in `developer_fiction_usage_events`, including model, stage/substage, response id, duration, input/cached/cache-write/output/reasoning tokens and historical price snapshot.
- Live book-generation accounting refreshes after each chapter response. Book totals show direct cost plus allocated Series Development share; series totals never double-count allocation.
- Saved novels show model provenance. Editorial versions are stored separately from the original manuscript.
- Requires `supabase/v252_43_fiction_models_editorial_usage.sql` before deploying this build.


V252.44 — Fiction Studio seed-first Series Development: removed Genre/Subgenre, Heat and Target Words creation controls and prompt influence; Series Development model now has creative discretion over form, genre, readership, explicitness, work count and work length. Saved novel status is derived from authoritative manuscript progress rather than stale plan_approved metadata.


V252.44 — Fiction Studio seed-first Series Development. New series creation now asks only for pen name, series name, Series Brief and Series Development model. Genre/subgenre, heat and target length controls no longer influence Series Development. The selected model has explicit discretion over form, genre, readership, explicitness, work count, work length and architecture, including single-work and open-ended outcomes. Work Development derives scale from the approved Bible instead of legacy series form fields. Saved novel badges are derived from authoritative manuscript progress so completed drafts no longer remain labelled PLAN_APPROVED.


V252.45 — Fiction Studio Series Development instruction simplified: the Series Brief is the brief. Removed the enumerated list of model “discretions” and special-case examples. The development model is instructed simply to deliver the best creative and commercial outcome that fully fulfils the supplied brief. Updated creation-page helper text to match.


V252.46 — Fiction Studio legacy-field cleanup. Completely removed the retired Series Creation genre/subgenre, heat and target-length plumbing: new-series API writes no longer send those fields, and the accompanying Supabase migration drops the obsolete developer_fiction_series columns. Book-level planning fields such as target_words and heat_progression remain model-authored Book Plan outputs.

## V252.46.1 — Fiction Studio book-path restoration
- Keeps each Series Bible Book 1/2/3/... card as the permanent entry point for that immutable book position.
- Reconciles those cards with existing `developer_fiction_books` records by `position`; no manuscript, plan or editorial data is moved or regenerated.
- Existing books open their saved Book workspace; undeveloped slots open Book Development.
- Card status is derived from authoritative saved plan/chapter/editorial state (including FIRST DRAFT COMPLETE and editorial-stage completion), not stale display status.
- Removes the duplicate Saved Novels presentation. The original manual Book Development → manuscript → editorial pathways remain unchanged.
- No Autopilot or automation added. No Supabase migration required.


## V252.46.2
Fiction Studio book-slot navigation compatibility repair. Numbered Series Bible book cards are permanent entry points for both legacy and newly created series. Each click re-reads authoritative developer_fiction_books state by immutable series position before opening an existing book or starting development for an undeveloped slot. Cards no longer depend on a background reconciliation request to become clickable. No automation or database migration.

## V252.46.3 — Fiction Studio manual-pathway repair
- Restores missing Series rename/delete handlers that were throwing during Series rendering and preventing later Book-card handlers from being attached.
- Keeps each numbered proposed-book card as the permanent entry point: existing position-matched books reopen; undeveloped slots enter Book Development.
- Re-renders immediately after Series Bible approval so newly created series expose their Book cards without requiring a reopen.
- Makes saved-book opening depend on the authoritative `novel-status` checkpoint; accounting/editorial display failures no longer erase manuscript progress state.
- Restores live accounting-card refresh during manuscript/editorial work.
- Makes an interrupted developmental-edit request safely resumable instead of leaving a running editorial row that cannot continue.
- No Autopilot and no database migration.
- Persistence remains server-side at every durable checkpoint: Series Bible save; work architecture; each validated Book Plan batch; each manuscript chapter; continuity ledger (with rebuild from saved chapter deltas after interruption); editorial run; and each edited chapter. Original draft chapters are never overwritten by editorial stages.


## V252.49 — resilient editorial resume and patching
- Line/style and Proof no longer abort an entire chapter because one model-supplied `find` excerpt differs only by harmless quote/whitespace transcription. Exact matching remains first choice; a tightly controlled normalized match is used only when it resolves to one unique source span.
- Any patch that still cannot be located uniquely, or overlaps another accepted patch, is skipped individually instead of throwing away the whole chapter. Successfully verified patches are applied and the chapter checkpoint is saved.
- Editorial prompts now ask for longer, distinctive verbatim source excerpts to reduce ambiguous patch matches.
- Resume progress no longer resets its visible chapter counter to 1. It reports the actual chapter saved/next chapter returned by the server.
- An already-running editorial stage now shows its locked model and disables the selector; the button says Resume instead of Run. This prevents the UI from implying that changing the dropdown can change a model already locked to the run.
- No Supabase migration required beyond the V252.47 editorial-continuity migration.


## V252.49
- Luna remains the initial default, but manual Sol/Astra editorial selections now persist and are sent exactly as selected.
- The server rejects missing/invalid editorial model values instead of silently falling back to Luna.
- Client and server both stop before chapter editing if the created run does not match the chosen model.
- Active editorial passes now have a visible reject control; saved chapters remain preserved in history.


## V252.50 — Fiction Studio novel reader

- Adds a developer-only **Read novel** control to saved Fiction Studio books.
- Desktop reader uses a clean two-page text spread with no illustrations, previous/next controls and arrow-key navigation.
- Mobile reader becomes a single-page horizontal swipe sequence with scroll snapping.
- Reader can switch between the first draft and preserved Revision, Line/style and Proof versions; in-progress editorial versions are assembled from the last completed source plus their saved edited chapters.
- Chapter headings and page counters are retained while prose is paginated into comfortable reading chunks.
- No Supabase migration and no additional Vercel endpoint are required; the reader reuses the developer Fiction Studio generate endpoint.


## V252.51 — repeatable revisions + editorial direction
- Every editorial pass now has an optional **Editorial direction for this pass** field. The instruction is persisted with that exact run and reused on resume.
- Revision is repeatable before Line/style. After a completed Revision, the workspace offers **Run another revision** from the latest completed Revision or **Run Line/style**.
- Each editorial run stores its exact `source_run_id`, so repeated revisions, continuity initialization, reader assembly and later stages use the intended source version rather than merely the latest run with the same stage name.
- Model, source version and direction lock when a pass starts. Rejecting a pass preserves its saved chapters/history without making it the active source.
- Requires `supabase/v252_51_multi_revision_direction.sql`. No new Vercel endpoint; API count remains 12.


## V252.54 — manual Fiction Studio Book Plan editor

- Adds **Edit Book Plan** after Book Development completes and before Chapter 1 is generated.
- The editor exposes the novel title, target length, architecture fields and every chapter's title, POV, events, purpose, relationship shift and continuity.
- Chapters can be added, removed and reordered; chapter numbers and `chapter_count` are recalculated deterministically on save.
- Saving makes the edited structured plan authoritative for manuscript generation and synchronises the saved novel title.
- Server-side validation prevents malformed/incomplete chapter plans and locks plan editing once manuscript generation has started, so an edited plan cannot silently conflict with already-written chapters.
- Fixes the Book Development batcher so it now honours the architecture model's chosen `chapter_count` (1–500) instead of silently forcing every plan to at least 20 chapters. This was the cause of plans whose metadata said 13 chapters while the chapter array contained 20.
- No AI call is used for manual editing and no Supabase migration is required.

## V252.53 — deterministic Fiction Studio character rename

- Adds **Rename character** to every saved Fiction Studio novel.
- This is a deterministic text/JSON operation, not an AI rewrite: it changes only whole-name matches and does not alter surrounding prose.
- Preview shows the exact number of matches and which saved records contain them before anything is changed.
- Default scope updates the current readable manuscript, its continuity, the Book Plan / book record, the latest Developmental report used by future editing, and optionally the Series Bible / future-book plans.
- An **Every saved draft/editorial version** scope is available when the author deliberately wants historical versions renamed too.
- A rename is blocked while any editorial pass is running, preventing an in-flight model from reintroducing the old name.
- Apply performs the replacements and then re-reads the selected scope; success is reported only when **zero whole-name occurrences of the old name remain**.
- Matching is Unicode-aware and case-insensitive while preserving common case forms (`Iker` → `Mateo`, `IKER` → `MATEO`, `iker` → `mateo`). Possessives such as `Iker's` are handled automatically without touching longer words such as `Ikerish`.
- No Supabase migration is required for V252.53.

## V252.55 — automatic per-book Fiction Studio pipeline

- Keeps Series Development, Series Bible review/editing, individual Book creation, Book Development and Book Plan review/editing manual.
- Pressing **Generate story** on an approved Book Plan starts automation for that book only: First draft → Developmental → one Revision → Line/style → Proof → Complete.
- Adds separate Luna/Sol/Astra selectors for First draft, Developmental, Revision, Line/style and Proof before generation starts; Luna remains the initial default.
- Locks each selected model when that stage starts and preserves the existing run/source provenance.
- Adds safe transient-connection recovery: after a failed draft/editorial request, Supabase checkpoints are checked before any retry so already-saved work is not deliberately regenerated.
- Retries an unsaved request at most three times, then pauses safely with all durable work preserved.
- Adds **Pause automatic pipeline** and resumable local pipeline state. A pause takes effect after any in-flight request has finished/saved.
- Automation never creates the next novel, never creates a new Book Plan, and never advances to another series book. Every book must still be deliberately started by the developer.
- Existing manual editorial controls remain available for books that were not started in automatic mode and for optional additional Revision passes after the automatic pipeline.
- No Supabase migration required.


## V252.58 — evolving series memory
- Added persistent Series Memory separate from the foundational Series Bible.
- Completed proofed books automatically update hard canon, character states, unresolved threads, planted details, world changes, open questions, non-binding future possibilities, and a compact voice reference.
- Later book development automatically reads Series Memory and may introduce new book-specific or future-recurring characters organically; the original Bible cast is no longer treated as exhaustive or compulsory.
- Future possibilities are explicitly non-binding so continuity becomes richer without imposing a formula.
- Prior proofed books are backfilled into Series Memory when a later book begins development, allowing older series to adopt the system.
- Requires supabase/v252_58_series_memory.sql.

## V252.59 — Series Intelligence
- Expands persistent Series Memory into a richer Series Intelligence archive while keeping the Series Bible as the stable creative foundation.
- Meaningful characters now carry lifecycle/relevance, life status, book appearances, last known location, current state, significant events, relationship history and continuity constraints. Dormant/transient characters remain remembered without being treated as active cast.
- Adds compact timeline, relationship-state, knowledge-state, secrets/reveal, institution-state and open-consequence records, alongside existing hard canon, unresolved threads, planted details, world changes, open questions and non-binding future possibilities.
- Adds a selective per-book context pass: later Book Development receives only core/active and genuinely relevant archived material instead of the full accumulated cast/history.
- Adds an explicit archive rule: prior existence is not a reason for present appearance. Dormant characters, memories, flashbacks, callbacks and reunions must not be manufactured merely because they exist in history; new characters are preferred when more natural to the current story and setting.
- Stores the selected cross-book context with the Book Development state so chapter planning and manuscript generation use the same bounded continuity context throughout that book.
- Adds an inspectable/editable **Series Intelligence** panel beside the Series Bible for developer correction of canon housekeeping when necessary.
- Existing proofed books can still be backfilled; older V252.58 memory is normalized into the V252.59 structure when used.
- Requires `supabase/v252_59_series_intelligence.sql` to update the JSON default for newly created series. The migration has been applied to the current Moonbeam Supabase project.

## V252.66 — independent Fiction Studio background jobs
- Fiction Studio automatic book generation and Re-edit-from-First-Draft jobs now lock their own `series_id` and `book_id` when they start. Navigating to another series no longer redirects later chapter/editorial requests to whichever series happens to be visible.
- Different books can run automatic generation/editing jobs simultaneously in the same open Moonbeam tab. Starting work on another series, editing a Bible, or developing another Book Plan no longer stops an already-running job.
- A book is protected from starting a second generation/editorial background job while one is already active for that book.
- Adds a **Background jobs** panel on the Fiction Studio library and series pages showing each active/session job, its locked series/book, current stage and saved progress. Clicking a job opens its book.
- Background jobs continue when navigating around Fiction Studio, but—as before—closing/reloading the browser tab stops browser-side orchestration after the current in-flight request; durable Supabase checkpoints remain resumable.
- Completion no longer forcibly navigates the UI back to a book if the developer is working in another series.
- No Supabase migration or additional Vercel endpoint is required.


## V252.66 — literary-depth refinement
- Adds a compact positive literary-depth directive to Fiction Studio drafting and editorial development: character-specific perception, subtext, contradiction, concrete social/physical observation, varied rhythm, and meaning carried by implication rather than explanation.
- Explicitly tells the model to write with confidence and freedom; these are creative opportunities rather than quotas, and the goal is richer, more human writing rather than cautious writing.
- Interiority should arise from the immediate scene rather than compulsory backstory or reminiscence.
- Revision should avoid restating emotions/themes once dramatized and should consider the layer beneath a scene's obvious plot function without forcing it into every scene.
- Line/style remains targeted: it favours natural human texture only where a local edit is genuinely needed, and must not polish unaffected prose merely for neatness.
- Existing global anti-banter/anti-pithiness, genre preservation, word-count protection, immutable chapter titles, re-edit branching, Series Intelligence and background-job concurrency remain intact.
- No Supabase migration required.


## V252.69 — Adult/children separation hardening
- Adult Fiction Studio moved out of `api/generate.js` into dedicated `api/fiction-studio.js`.
- Fiction Studio REST storage helper is allowlisted to the eight `developer_fiction_*` tables only.
- Normal Moonbeam generation rejects the legacy Fiction Studio action.
- Fiction Studio browser resume state is scoped to the authenticated developer user and active Fiction Studio state is cleared on account changes/sign-out.
- `/api/health` remains available via a rewrite to the lightweight GET health response in `api/generate.js`, keeping the deployment at 12 API functions.
- Existing `developer_fiction_*` data is unchanged and automatically uses the hardened access path; no migration required.


## V252.71 — Fiction Studio progress clarity
- Replaces the vague Background jobs presentation with a clear Generation status panel.
- Every in-tab job now shows a prominent RUNNING / PAUSED / COMPLETE badge, current stage, and latest saved checkpoint.
- Series book cards now prioritise an active re-edit/generation over an older completed Proof, so a book being re-edited no longer misleadingly looks simply FINAL.
- Editorial runs show the live stage and saved chapter count where available.
- First-draft and Book Development cards show saved progress even after navigation.
- No database migration required.


## V252.75
- Fixed stale status on the individual Fiction Studio book page. The header now uses the freshly fetched manuscript/editorial state before rendering, so completed or in-progress editorial stages override old Book Plan status.


## V252.76 — series-wide character rename
- Adds **Rename character across series** on the Fiction Studio series page.
- Deterministically updates the Series Bible, Series Intelligence, original series brief/future plans, every saved Book Plan, first draft, continuity record, and every saved Developmental/Revision/Line/Proof history for every book in the series.
- Preview shows the total occurrences plus per-book counts before anything changes.
- Blocks the rename while the series has active generation/edit work, preventing an in-flight request from reintroducing the old name.
- Applies whole-name replacement only, preserves normal casing behaviour, and verifies that zero old-name occurrences remain across the saved series before reporting success.
- No Supabase migration required.

## V252.77 — model-aware fiction style guidance

- Keeps the shared fiction-quality goals for Luna, Sol and Astra: preserve genre/voice, deepen character where useful, protect pacing and length, and avoid unnecessary flattening.
- Applies the strong anti-banter / anti-pithiness / anti-rhetorical-symmetry correction layer specifically to Luna, whose recurring style tendencies motivated those rules.
- Sol and Astra now receive a freedom-first version: they use their own best literary judgement and only correct banter, clipped repartee, slogan-like phrasing, symmetrical contrasts or “not X but Y” constructions when those tendencies are actually repetitive or intrusive in the manuscript.
- Developmental, Revision and Line/style passes are model-aware; first-draft generation and chapter planning are model-aware too.
- Genre-preservation overlays, chapter-title protection, word-count safeguards, branching/re-edit history, Series Intelligence, concurrency, purge and adult/children separation remain unchanged.
- No Supabase migration required.

## V252.78 — context-aware series text editing + cleaner series cards
- Replaces the series-level character-only rename control with a general **Find & replace across series** tool for names, vocabulary, spelling choices and exact recurring words/phrases.
- Scans the Series Bible, Series Intelligence, original brief/future plans, every Book Plan, first draft, continuity record and every saved Developmental/Revision/Line/Proof branch.
- Luna is used only as a conservative context classifier during preview; it never rewrites the prose. High-confidence intended substitutions are queued for automatic deterministic replacement.
- Every occurrence that is not auto-changed requires an explicit developer **Change** or **Leave unchanged** decision. Nothing uncertain or apparently unrelated is silently skipped.
- This allows changes such as `Mara` → `Jane` while preserving unrelated uses, or `ass` → `arse` while sending different senses/homonyms to review.
- Apply verifies that every preview occurrence received a final decision; if the series changed after preview, the operation fails closed and requires a new scan.
- Fiction Studio library cards now use a clear vertical hierarchy: model, series title, pen name, then book-progress summary. Titles and author names no longer compete on one crowded line.
- Series detail headers also use the simplified model / title / pen-name hierarchy rather than stale “Series Development” wording.
- No Supabase migration required.





## V252.85 — anti-AI places, institutions and titles
- Adds a shared anti-AI worldbuilding guard across Series Development, Book Development, chapter planning, Series Extension and manuscript generation.
- Contemporary realistic fiction now defaults to real geography when the scale makes that sensible. Major cities, metropolitan districts and substantial towns may be real; tiny communities involved in repeated serious fictional crime should normally be fictionalised inside a real county/region.
- Fictional settlements may no longer be invented by freely combining atmospheric English-looking fragments. When a small fictional place is needed, the model must derive it from the actual regional toponymic ecology and keep the result unshowy.
- Adds a fail-closed blacklist of recurring synthetic place constructions such as Greyhaven/Dunhaven/Bellwick/Ravenmere/Ashvale-style names and close stock constructions. Existing/user-supplied canon remains allowed.
- Institutions and local businesses must follow mundane real-world naming patterns for the setting; the model is told to reject a whole-world palette that becomes suspiciously coordinated, quaint, gothic or alliterative.
- Adds title anti-default rules. Series and book titles must emerge from the concept and market rather than stock AI constructions such as region+occupation+Mysteries/Cases or generic thriller phrases. A newly generated explicit SERIES TITLE matching a high-risk metadata-style template fails closed and must be regenerated.
- The guard is locale-aware: manuscript language does not override the naming logic of the actual country/culture.
- No Supabase migration or additional Vercel endpoint is required.

## V252.84 — Demographic/cultural fiction naming engine
- Adds a hard ban on recurring AI-fiction default names and close neighbours (including Mara/Maren/Mira, Elara/Elora, Voss/Vale/Vance, Mercer/Thorne/Hale and a much broader protected list). New Series Development, Book Development, chapter planning, Series Extension and manuscript generation are instructed never to create them.
- Adds server-side fail-closed validation at the stages that can create new fictional people. If a model nevertheless returns a newly introduced banned name, nothing from that stage is saved. Existing canonical names already present in supplied context remain readable so old series do not break.
- Names are now treated as demographic/cultural facts. The model estimates approximate birth year, uses the nearest reliable cohort evidence, and prefers ordinary names actually plausible for that character's country/region and generation rather than 'fictional-sounding' names.
- Family coherence is mandatory: siblings/parents/surnames and religious/ethnic/cultural naming traditions must make sense together unless mixed heritage, migration, adoption, remarriage, conversion or another explanation is actually established in the story. National popularity alone is not enough.
- Setting outranks writing language for names. A Hebrew-language novel set in Israel uses culturally plausible Israeli naming; a Hebrew-language novel about an English family in Manchester still uses plausible British names. Equivalent distinctions apply to Spain/Latin America, Portugal/Brazil, France/Quebec, etc.
- England/Wales receives embedded historical cohort anchors drawn from ONS/GRO-derived rankings (1954, 1964, 1974, 1984, 1994, 2004 and 2014) plus a broad ordinary UK surname pool. The rules use these as weighted realism anchors rather than forcing the same handful of names repeatedly.
- Locale source profiles tell the model to favour official/civil-registration evidence where available: ONS/NRS/NISRA/CSO (UK/Ireland), SSA (US), Statistics Canada, NSW BDM (Australia), INSEE (France), INE (Spain), ISTAT (Italy), Statistics Denmark, Statistics Norway, Statistics Sweden/official Swedish sources, Finnish official population/name data, Israel CBS, and equivalent national statistical/civil-registration sources for other settings. Where exact annual data is unavailable, the model must use the nearest reliable cohort and must not pretend to statistical precision.
- No Supabase migration required.

## V252.83 — Extend series
- Added the series-level **Extend series** button to the developer-only Fiction Studio after the initial Series Bible review is approved.
- Extension uses the series' already locked Series Development model and receives the authoritative Series Bible, persistent Series Intelligence, existing book records/plans, and the current proposed slate.
- It appends a fresh model-chosen batch (normally 3–6) without rewriting the existing Bible or previous books, and explicitly avoids mechanical repetition of earlier premises, twists, relationship arcs, settings, structures, or forced callbacks.
- No Supabase migration required.

## V252.86 — data-driven anti-AI world naming
- Replaces the V252.85 prompt-only place/institution guidance with an embedded evidence pack used automatically by Fiction Studio generation stages.
- UK regional detection injects real settlement exemplars from the relevant naming ecology (with OS Open Names / ONS geography as the source basis) before Astra/Luna names new places.
- Supported international locales inject real country-specific place exemplars and require the relevant national gazetteer/statistical authority as the naming reference model; language is not treated as nationality.
- Real geography remains the default where settlement scale makes it appropriate. Small communities can be fictionalised where serious crime/scandal would attach unfairly to a tiny real community, but the fictional name must be derived from real regional naming evidence rather than atmospheric free-combination.
- Businesses/institutions now use deterministic evidence-based methods: founder/family surnames, real locality/street names, functional descriptors, legal forms and historically attested institution types. Decorative adjective+noun naming is explicitly disallowed as a default.
- Existing AI-default place/institution/title rejection remains fail-closed and existing canon remains protected.
- No Supabase migration.


## V252.87
- Expanded Fiction Studio anti-AI world naming into an international data-driven geography and business/institution naming layer.
- All supported writing locales now have real settlement anchors rather than generic fallback geography.
- Added locale-specific organisation naming profiles, ordinary structural patterns and common legal/company forms, with culture/region constraints.
- No new Vercel API route and no database migration.

## V252.88 — live real-world collision safety
- Added a live web collision-checking layer to the existing developer-only Fiction Studio route; no additional Vercel API function is created.
- Series Development, Series Bible saves/approval, Extend Series, Book Development architecture, completed Book Plans and manually saved Book Plans are checked before canon is persisted.
- The checker uses OpenAI Responses web search with Luna to minimise cost and blocks only high-confidence harmful collisions. Ordinary shared names such as common UK first-name/surname combinations are explicitly not treated as collisions by themselves.
- Fictional people portrayed as serious wrongdoers are checked more strictly when a distinctive name plus location/profession/biographical details could identify a real person; famous/prominent real people may not be repurposed as fictional wrongdoers.
- Real companies/institutions may appear neutrally, but invented murder, fraud, corruption, abuse, dangerous negligence or other damaging conduct may not be attached to a real identifiable organisation. Fictional wrongdoing organisations are checked for exact/confusingly-close real-world trading-name collisions, especially in the same place/sector.
- Real major cities/districts remain usable as settings. Tiny real communities receive extra care where repeated fictional serious wrongdoing could attach to an identifiable community.
- Manuscript generation receives the same collision-safety rules and is told not to invent high-risk new entities outside the approved plan; live web checking remains concentrated at canon/planning boundaries rather than adding a web-search charge to every chapter.
- Live-check failures fail closed: the unsafe/unverified stage is not saved and can be retried.
- No Supabase migration.

## V252.93 — Book-page first-draft counter follows editorial state
- Fixes the top-of-book counter so a book already in Developmental/Revision/Line/Proof can no longer display `0 first-draft chapters saved` because of a stale `novel-status.saved_count`.
- Once durable editorial history or a live editorial job proves drafting has finished, the header treats the planned chapter count as the completed first-draft count.
- Keeps the change presentation-only: no manuscript, editorial history, Supabase schema or generation pipeline is altered.


## V252.95 — automated senior-editor quality gate

- Automatic adult-fiction pipeline now separates diagnosis from execution: Sol defaults to senior editor/quality gate; Luna defaults to manuscript drafting and revision.
- After the first draft, the senior editor reads the complete manuscript and returns a structured quality gate with critical/material/optional findings plus explicit strengths to preserve.
- Luna revises only from that concrete brief. The complete revision is then re-read by the senior editor. The review/revision loop repeats automatically while material defects remain, up to three Luna revisions by default.
- If the senior editor still requires revision at the safety cap, the pipeline pauses for human review instead of spending indefinitely or falsely declaring completion.
- Line/style and Proof start only after an explicit senior-editor approval.
- Re-reviews receive the previous senior report so resolved issues are checked rather than casually reopened.
- No new Vercel API route and no Supabase migration. Existing editorial run JSON stores the quality gate and preserved-strengths brief.

## V252.97 — real-location fact grounding
- Added a live researched location fact pack at Series Development using the existing `api/fiction-studio.js` route and OpenAI web search; no additional Vercel API route.
- Real settings are now researched for physical geography, waterways/coast/topography, transport and access, civic/public institutions, land use/local economy, relative geography and concrete local character.
- The fact pack explicitly records unsupported assumptions the novelist must not invent and flags contradictions between proposed fiction geography and researched reality.
- The researched Series location pack is saved inside the Series Bible so Book Development, drafting, Revision, Line/style and Proof all receive the same geographic canon.
- Each Book Development architecture also receives a live book-specific location addendum for new real locations introduced by that book.
- When a real-world detail is not supported, Astra/Luna are instructed to stay non-specific or clearly fictionalise it rather than guess.
- This is place-description grounding, separate from the existing place-name/business-name plausibility and collision checks.
- API route count remains unchanged; no Supabase migration required.

## V252.100 — visible senior-editor reports
- Book pages now show every completed senior-editor quality-gate report in collapsible round-by-round panels, including verdict, rationale, critical/material findings, synthetic-writing findings, strengths to preserve, priorities and chapter actions.
- Automatic pipelines update the open Book page as soon as each senior review completes; no page exit/re-entry is required to see the report.
- Series Book cards show a compact latest senior-review summary (approved/revision required plus critical, material and synthetic-writing counts).
- `list-books` now returns that compact latest senior-review summary from existing editorial-run data; no database migration or new API route is required.

## V252.104 — backstage first-name + surname selection
- New fictional character names are no longer chosen by Astra/Luna at the stages that establish canon.
- Series Development and Book Development now define a structured naming profile (birth cohort, country/region, explicit family/cultural context, family group and naming system) and use a temporary character marker instead of inventing a name.
- The backend researches real demographic naming data via live web search, builds hidden candidate pools, filters the AI-default blacklist/near-neighbours, and randomly selects the final name. Candidate pools are never shown to the creative model.
- Shared family surnames are selected once per surname group and reused for relatives. The selected surname is then supplied to the hidden given-name step so first name + surname are culturally coherent as a whole.
- Mixed families, marriage/divorce/adoption, patronymics and non-Western naming systems are supported through explicit naming-system metadata rather than forcing an English `first name + surname` pattern.
- The selector is expressly forbidden from inferring religion, ethnicity or migration history that the fiction has not established. If background is unspecified, it must use broadly ordinary local/cohort-plausible names rather than strongly community-specific combinations.
- This prevents demographic popularity from producing incoherent combinations such as assigning a strongly Muslim given name to a fictional family explicitly established as white English Christian merely because that given name is nationally common.
- Book architecture now has a `new_characters` list so important book-specific characters are named by the same hidden mechanism before chapter planning begins. Chapter planning is told not to invent extra canonical names outside that mechanism.
- Existing canonical names are preserved unless the developer explicitly changes them.
- No Supabase migration and no new Vercel API route.

### V252.105 — Structured-output schema hardening
- Fixed Series Development's strict JSON schema after V252.104 added `naming_profile`: strict Structured Outputs require every declared property to be listed in `required`.
- `naming_profile` is now required-but-nullable for Series Development, allowing established characters to return `null` while new `[[CHAR:...]]` characters return a complete profile.
- Added a recursive local strict-schema preflight. Any future schema with missing/extra `required` keys or missing `additionalProperties:false` fails locally before a model request is sent.
- Routed the remaining direct Responses API structured-output calls through the common preflight/retry wrapper so the check covers Series Development, Book architecture, chapter planning, series memory/context, naming research, geography/profession research, editorial stages and series extension.


## V252.106 — resumable Series Development backstage pipeline
Series Development now checkpoints Astra's creative Series Bible before any naming/geography/profession/collision work. Backstage enrichment runs as one persisted step per HTTP request in `developer_fiction_series.autopilot_state`, so refreshes, 504s and lost responses resume from the last completed step instead of rerunning or discarding Astra's work. Naming is one surname/given-name call at a time; geography is one call; profession discovery and each profession are separate calls; collision validation and finalization are separate checkpoints. No schema migration is required.

## V252.106 — bomb-proof resumable backstage research
- Series Development now saves Astra's creative core before any demographic naming, location research, profession research or collision validation begins.
- Every backstage unit runs as a separate HTTP request and checkpoints to `developer_fiction_series.autopilot_state`; refreshes, 504s, lost responses and redeploys resume from the last saved stage.
- Naming is granular: at most one surname-pool or one given-name call per request.
- Geography is one request; profession discovery is one request; each profession is one request; compact profession retry is its own request; collision validation and finalisation are separate checkpoints.
- Book Development architecture now uses the same staged pattern in `developer_fiction_books.development_state`: creative architecture, granular naming, location research, profession discovery/roles, collision validation, then chapter planning.
- Final Book Plan collision validation is now a separate checkpoint after all chapter-plan batches are saved.
- No new database columns or API routes are required; existing JSONB checkpoint fields are used.


## V252.108 — hard editorial length protection
- Line/style and Proof no longer rely on prompt wording to preserve manuscript length. The backend now measures every proposed edited chapter before saving it.
- Line/style rejects any chapter patch set whose net change exceeds the protected band; Proof uses a much tighter near-length-neutral band. Rejected patch sets are not saved: the exact source chapter is preserved instead, and the rejection is logged in the editorial run metadata.
- Whole-manuscript completion is mechanically guarded: Line/style must remain within ±3% of its source manuscript and Proof within ±1%. A stage outside that band cannot be marked complete.
- Revision cannot complete below 92% of the approved target. Existing restorative revision passes still run first; if they cannot recover the protected length, the pipeline pauses before Line/style rather than silently approving an under-length manuscript.
- These guards preserve the senior editor's ability to request substantive Revision changes while preventing later copy/style stages from stripping thousands of words from an approved manuscript.
- No Supabase migration or new API route is required.

## V252.109 — quality-led editorial completion

- Revision is no longer blocked, expanded, or repeated merely because it misses a numerical word-count floor. The planned target remains visible as diagnostic context only.
- Sol's senior-editor quality gate now explicitly judges substantive completeness, pacing, genre delivery, plot/character development and commercial readability rather than treating target length as a pass/fail criterion. Expansion is requested only when a concrete quality defect actually needs more narrative substance.
- Luna's Revision prompt now treats proportional chapter length as a planning reference, never a quota: no padding, recap or invented scenes simply to reach a number.
- Final publication checks no longer fail solely because a manuscript is more than 20% below its planned target; that condition is exported as a warning while structural publication faults remain blocking issues.
- Line/style and Proof retain mechanical anti-compression protection, with tighter per-chapter limits. Any destructive local patch is discarded and the exact source chapter is preserved.
- Whole-stage Line/style/Proof length bands are now advisory rather than blocking. Because destructive chapter edits are rejected before saving, aggregate drift can be recorded without stranding the book at an unfinished quality gate.
- Result: word count cannot trap the automated pipeline. Quality governs Revision; Line/style and Proof cannot quietly eat the manuscript; ordinary editorial completion continues without indefinite repair loops.
- No Supabase migration and no new Vercel API route.
