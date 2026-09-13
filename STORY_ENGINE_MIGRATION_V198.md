# Moonbeam Story Engine V198 — Audit and Migration Record

## Scope
Base build audited: V197.
Design authority: `MOONBEAM-STORY-ENGINE-SPEC.md`, Stages 1–5.
Migration principle: retain proven product constraints, replace the story-generation core, and remove rules that force story behaviour for secondary technical reasons.

## Executive result
V197 contained valuable age, safety, localisation, name, length, character-continuity and product-output constraints. Those are retained.

The principal architectural problem was that V197 still asked the same generation pass to invent the premise, structure the plot, write the prose and create the storyboard. Its most recent progression patch also explicitly made narrative events serve illustration variety. V198 separates those responsibilities.

V198 story pipeline:
1. hidden story planning;
2. independent plan validation;
3. approved-plan writing;
4. deterministic structural checks;
5. independent final-story validation;
6. one targeted repair when appropriate;
7. regeneration instead of endless repair when quality still fails;
8. illustration/narration only after a story passes.

## KEEP

### Age bands and child-safety rules
Retained from V197:
- age bands 3–5, 6–8 and 9–12;
- concrete language / cast / causality guidance by age;
- age-dependent permitted stakes;
- explicit forbidden adult/violent/horror mechanisms;
- age safety overriding incompatible creative choices.

These rules now apply to both planning and final writing/validation rather than only the prose prompt.

### Exact child-name identity
Retained:
- supplied child name is authoritative;
- no invented surname, nickname or alternative form;
- deterministic validation checks that the exact supplied name survives into the story.

### Parent Story Idea precedence
Retained and strengthened:
- specific parent ideas remain authoritative;
- the planner classifies parent input as Parent-defined or Parent-guided;
- Parent-defined ideas are developed rather than competed against by random premises;
- loose ingredients may receive alternative treatments while preserving the supplied ingredients.

### Language/localisation
Retained:
- all nine existing language/locale codes;
- native spelling/vocabulary guidance;
- language remains a writer constraint.

Strengthened:
- planning remains structural while the final story is realised natively in the chosen language;
- no English-first translation stage is introduced.

### Tone and values
Retained:
- current four tone choices;
- selected values passed into generation;
- no imposed moral when no value is selected.

Reframed:
- tone is an overlay, not a plot engine;
- values should emerge through actions/consequences rather than a final lecture.

### Standard story length and product shape
Retained:
- opening + four middle pages + closing;
- approximately 650–750 words;
- target page lengths around 105–125 words, closing around 90–115;
- exactly four middle-page objects for current client/database compatibility.

Changed:
- length is now validated and, if necessary, repaired semantically.
- V197's local sentence reflow has been removed because it could split planned beats and leave illustration prompts attached to the wrong text.

### Character bible
Retained:
- recurring non-photo character continuity;
- exact age and stable appearance/clothing details;
- photographed child's visual identity remains governed by the supplied photo.

### Originality / anti-imitation
Retained:
- do not reproduce existing authors/books, characters, plots or distinctive passages;
- no author-name style prompting.

### API/client contract
Retained:
- `/api/generate`;
- story JSON fields: title, opening, character_bible, pages, closing;
- four middle page objects with `text` and `illustration_prompt`;
- credit reservation/refund behaviour;
- generationRunId and subsequent image/narration pipeline;
- no database migration.

## MOVE

### Visual variety
V197 made story progression partly responsible for earning distinct illustrations.

Moved to:
- planner: each genuine beat may include a visual opportunity, but story logic is primary;
- writer: illustration_prompt describes only the actual beat;
- client/server illustration prompts: composition, viewpoint, scale, pose and focal emphasis create visual variety without changing the plot.

### Random-story diversity
V197's large hard-coded story-family system mixed subject matter, reality rules, setting and plot engine into one mandatory blueprint.

Moved/reframed:
- architecture comes from the Stage 2 architecture library;
- small server-side variety sparks remain only as optional setting/domain/contrast inspiration;
- candidate concept competition creates diversity at the premise level;
- at least one Surprise-me candidate must be realistic;
- magic/quests/companions/special objects are no longer automatic ingredients.

## REWRITE

### Story generation
V197:
- one prompt invented and wrote the whole story.

V198:
- planner creates concept(s), selects architecture, plans ending first, builds a story spine, setup/payoff ledger and six mapped narrative beats;
- separate editor validates the plan;
- writer receives only an approved plan;
- final editor validates the actual prose.

### Narrative progression rule
V197 wording:
- every displayed spread had to advance the story in order to “earn a distinct illustration”;
- adjacent spreads were forbidden from naturally calling for essentially the same picture.

V198 rule:
- every substantial beat must have a meaningful narrative function;
- progression can be causal, emotional, relational, revelatory or deliberately cumulative;
- visual composition is downstream;
- no arbitrary action/location/plot change may be inserted merely to make another picture.

### Illustration prompts
V197 client prompts used wording such as “advance the action” and the closing prompt assumed characters were “safe and content after the adventure.”

V198:
- prompts depict the actual current beat;
- composition may vary without altering events;
- the closing depicts the actual ending/emotional state rather than forcing generic post-adventure cosiness.

### Repair
V197 repair mainly fixed malformed JSON and could reconstruct missing story material broadly.

V198:
- plan repair is distinct from prose repair;
- final repair receives exact editor findings and the approved plan;
- one targeted repair is normal;
- unresolved structural failure causes regeneration/failure rather than repeated patching.

### Page balance
V197 automatically reflowed sentences across pages when page count/word count was wrong.

V198:
- deterministic checks flag structural/length issues;
- the model performs a targeted meaning-aware repair;
- no blind sentence redistribution occurs.

## DELETE

### Mandatory V191/V197 random story blueprint as the story architecture
Deleted from active generation:
- mandatory story-family selection;
- mandatory hard setting/plot-engine combination;
- companion type lottery;
- special-object lottery;
- twist lottery;
- ending-type lottery.

Reason:
These mechanisms helped variety but could create ingredient soup and competed with the new architecture/planning system.

### Story-for-image coupling
Deleted:
- “every spread must earn a distinct illustration” as a reason for plot movement;
- “adjacent spreads must not naturally call for essentially the same picture”;
- forced changes in action/objective/location/visual circumstance solely to diversify art.

### Blind local page reflow
Deleted:
- sentence splitting and redistribution after generation.

Reason:
It could damage page-level story logic and misalign art direction from the prose it was meant to illustrate.

## NEW QUALITY CONTROL

### Hidden plan
Contains:
- selected premise;
- primary/optional secondary architecture;
- central narrative question;
- story identity;
- starting state/stakes/narrative engine;
- progression principle;
- turning point;
- climax/deepest payoff;
- ending state;
- memorable element;
- personalisation map;
- setup/payoff ledger;
- character knowledge/world rules when needed;
- retelling sentence;
- six display beats mapped only after the story spine is established.

### Plan validator
Checks:
- premise specificity;
- architecture fit;
- causality;
- progression;
- setup/payoff;
- ending integrity;
- personalisation;
- agency;
- memorability;
- age fit;
- parent fidelity;
- anti-cliché/genericity;
- nonsense and shuffle tests.

### Final validator
Checks:
- fidelity to approved plan;
- continuity;
- causal clarity;
- page progression;
- ending quality;
- personalisation;
- memorability;
- read-aloud quality;
- age fit;
- illustration prompts staying faithful to actual events.

### Deterministic validation
Checks:
- exact four middle pages;
- required story fields;
- exact child name present;
- non-empty illustration prompts;
- broad per-screen word-count bounds.

## Writing modes
Backend now recognises:
- `prose` (default);
- `rhyme` if a future client sends `child.writingMode = "rhyme"`.

No new UI toggle is introduced in V198. This avoids changing the customer interface before rhyme-mode product design/testing is ready.

## Illustration system
House art style and photo identity handling are unchanged.

Only story/composition responsibility has changed:
- illustrations may vary composition;
- they must not invent or accelerate plot for visual variety.

## Database
No Supabase migration is required.

## Rollback
V197 remains a complete independent build and is the rollback point.
