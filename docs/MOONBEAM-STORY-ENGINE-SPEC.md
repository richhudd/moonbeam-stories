# Moonbeam Story Engine Specification

**Status:** Design phase  
**Purpose:** Source of truth for the redesign of Moonbeam's story-generation engine.  
**Implementation rule:** No coding changes should be made from this specification until the design stages have been completed and reviewed.

---

# Stage 1 — What Makes a Good Moonbeam Story?

**Status: COMPLETE — initial design baseline**

## 1. Core principle

A Moonbeam story must be a **good story first and a personalised AI product second**.

Correct grammar, attractive prose, attractive illustrations, narration, personal details and technical reliability cannot compensate for a story that has no meaningful shape, causality or memorable idea.

The child should finish the story having experienced something that can be recalled and retold, not merely a sequence of pleasant paragraphs.

## 2. The seven essential qualities

Every successful Moonbeam story should satisfy seven independent qualities.

### A. Coherence

The reader should always be able to understand, at an age-appropriate level:

- what is happening;
- why it is happening;
- what changed because of it;
- why the characters do what they do;
- and how the ending follows from what came before.

Events must not feel like disconnected AI-generated episodes.

A story does **not** need to explain everything explicitly. Mystery, surprise and fantasy are allowed. But unexplained events must feel intentional rather than accidental.

### B. Narrative momentum

Every substantial story beat must earn its place.

A scene should normally do at least one of the following:

- change the situation;
- reveal something important;
- create or resolve a problem;
- change a relationship;
- produce a consequence;
- deepen an important emotion;
- set up something that matters later;
- deliver a significant comic or dramatic payoff.

If a scene could be removed without changing the story, it is probably expendable.

This does not mean every story must be fast or action-driven. Quiet stories can have momentum through curiosity, relationships, emotion, anticipation or discovery.

### C. Memorability

Every Moonbeam story should contain at least one **story-specific memorable element**: something a child or parent might naturally mention when describing the story afterwards.

This might be:

- an unusual central situation;
- a particularly funny escalation;
- an ingenious solution;
- a striking discovery;
- a recurring phrase or idea;
- a surprising reversal;
- a vivid character;
- a satisfying reveal;
- a strong emotional moment;
- or a distinctive imaginative rule.

The memorable element must arise naturally from the story. The engine must not satisfy this requirement merely by inserting arbitrary weirdness.

A useful internal test is:

> “What is *this* story about that distinguishes it from the last twenty Moonbeam stories?”

There should be a clear answer.

### D. Meaningful personalisation

Personalisation must affect the story rather than decorate it.

The child's name, interests, requested subject, family details or other supplied information should influence meaningful choices such as:

- the premise;
- the child's actions;
- knowledge or skills used;
- important decisions;
- relationships;
- setting;
- humour;
- obstacles or discoveries;
- resolution.

Weak personalisation is: “Jamie loves football,” followed by an essentially generic adventure in which football does not matter.

Strong personalisation is: Jamie's understanding of football becomes important to what happens or how something is solved.

Not every supplied detail must be used. Forced inclusion is worse than selective, meaningful inclusion.

### E. Emotional satisfaction

The story should make the reader **feel something appropriate to the story**.

That does not mean every story needs sentimentality, a lesson or a large emotional transformation. The intended response might instead be excitement, amusement, wonder, suspense, tenderness, relief, triumph, curiosity or cosy reassurance.

The ending must provide appropriate emotional and narrative closure. It should feel like the consequence of the story rather than a generic paragraph attached because the required word count has been reached.

### F. Surprise without randomness

A good Moonbeam story should resist being completely predictable.

Surprise can come from a reveal, reversal, comic consequence, unusual solution, unexpected character behaviour that makes sense in retrospect, imaginative discovery, or a setup paying off differently than expected.

The ideal is **surprising but inevitable in hindsight**.

Randomness is not surprise.

A new magical object, character, power or solution introduced simply because the story needs somewhere to go is not a satisfactory twist.

### G. Age-appropriate sophistication

Moonbeam must respect children's intelligence while matching their developmental level.

Age adaptation should affect more than vocabulary. It should influence:

- conceptual complexity;
- number of important characters;
- length and complexity of causal chains;
- subtlety of humour;
- emotional intensity;
- degree of ambiguity;
- sentence construction;
- amount of repetition;
- type of conflict;
- complexity of the resolution.

“Age appropriate” must not become “bland.”

Younger children can understand strong causality, humour, anticipation, patterns and satisfying payoffs even when language and structure are simple.

## 3. Universal coherence rules

These rules should eventually apply regardless of which narrative architecture is selected:

1. Important events have understandable causes or intentional mystery.
2. Consequences persist unless something changes them.
3. Characters cannot suddenly possess knowledge they have not acquired.
4. Important abilities, objects or rules needed for the resolution should normally be established before the climax.
5. Prominently introduced elements should have a purpose, payoff or deliberate atmospheric function.
6. Central problems should not simply disappear.
7. Character behaviour should remain intelligible and internally consistent unless a change is explained by the story.
8. The ending must grow from earlier events.
9. Repetition should have a purpose: escalation, pattern, humour, anticipation, learning or emotional effect.
10. Successive scenes should not be interchangeable variations of the same event unless deliberate repetition is the story form.
11. Fantasy and magical rules should remain internally consistent once established.
12. Coincidence may start a story; it should rarely solve the central problem.

## 4. What Moonbeam must actively avoid

The engine should regard the following as warning signs of weak output:

- grammatically polished but causally meaningless prose;
- a sequence of “and then” events with no meaningful consequences;
- generic quests created automatically when none was requested;
- unnecessary magical creatures, glowing objects, mysterious doors or arbitrary sidekicks;
- characters appearing only to deliver information and disappearing;
- repeated attempts that do not genuinely change the situation;
- sudden solutions that were not prepared for;
- morals stated explicitly instead of emerging from events;
- generic endings about bravery, friendship, believing in oneself or “the best adventure ever” when the story has not earned them;
- personal details inserted as name-drops;
- excessive description that delays the story without adding atmosphere or meaning;
- conflict added merely because a template demands conflict;
- false excitement produced by exclamation marks rather than events;
- unexplained changes of location, objective, knowledge or motivation;
- dream endings or similar devices that invalidate what happened unless specifically justified;
- stories whose pages could be reordered without materially affecting meaning.

## 5. Different stories may succeed differently

Not every story should maximize every characteristic in the same way.

A comic story may prioritise escalating consequences and laughter.  
A mystery may prioritise curiosity, clues and revelation.  
A quiet bedtime story may prioritise atmosphere, emotional progression and a satisfying return to safety.  
An adventure may prioritise goals, decisions, obstacles and consequences.  
A discovery story may have little conventional conflict but strong curiosity and revelation.

Therefore Stage 1 deliberately **does not impose one plot formula**.

The narrative architecture system designed in Stage 2 will determine how these universal quality principles manifest in different kinds of stories.

## 6. Values and lessons

Moonbeam stories may contain values, learning and emotional growth, but they should normally emerge from **what characters do and what happens as a result**.

The engine should avoid attaching a moral to every story.

A funny story is allowed simply to be funny.  
An adventure is allowed simply to be exciting.  
A gentle story is allowed simply to be comforting.

When a value is requested by the parent, the story should dramatise it rather than lecture about it.

## 7. Originality standard

Originality does not require unprecedented plots. Stories inevitably share structures, themes and familiar ingredients.

Moonbeam originality should come from the **specific combination and execution** of premise, character, setting, personalisation, complications, humour, imagery, choices and payoff.

The engine should favour a strong, specific idea over a large quantity of imaginative ingredients.

“One excellent idea developed properly” is preferable to “five unrelated magical ideas.”

## 8. The retelling test

A successful Moonbeam story should usually be reducible to a short, meaningful retelling:

> “It was the one where…”

If the only possible summary is a list of unrelated events, the story has probably failed.

This should become an important conceptual quality test for the later planning/validation system.

## 9. The parent read-aloud test

Because Moonbeam is partly a shared reading experience, stories should work for the adult reader as well as the child.

The adult should not repeatedly encounter:

- sentences that sound AI-generated;
- logical jumps;
- accidental repetition;
- confusing pronouns or geography;
- padding;
- awkward dialogue;
- meaningless whimsy.

The prose need not entertain adults through jokes or references aimed over the child's head. It simply needs enough craft and logic that reading it aloud is pleasurable rather than a task of mentally repairing the text.

## 10. Stage 1 quality definition

A **good Moonbeam story** is:

> **A coherent, age-appropriate and genuinely personalised story with meaningful progression, a distinctive central idea, internally consistent cause and effect, at least one memorable element, and an ending that delivers an appropriate narrative and emotional payoff. It respects the child's intelligence, avoids arbitrary AI-style invention, and is enjoyable to read aloud.**

This definition is the Stage 1 standard against which the narrative architectures, planner, validators and writing system in later stages will be designed.

---

# Stage 2 — Narrative Architecture Library

**Status: COMPLETE — initial design baseline**

## 1. Purpose

Moonbeam should not use one universal plot formula.

Instead, before prose is written, the story engine should choose an appropriate **narrative architecture**: the deep shape that determines what kind of progression and payoff the story will have.

The architecture is not a template containing fixed events. It is a set of narrative relationships. It answers questions such as:

- What makes the story move?
- What changes from beginning to end?
- What kind of anticipation does the reader experience?
- What makes the middle belong to the same story as the beginning?
- What form should the payoff take?

The architecture should provide enough structure to prevent incoherent AI wandering while leaving enormous freedom over premise, characters, setting, events, tone and ending.

## 2. Why Moonbeam should not simply use “The Seven Basic Plots”

Existing plot taxonomies are useful inspiration, but Moonbeam has different requirements.

A children's story generator needs:

- strong short-form structures;
- comic and gentle structures as well as dramatic ones;
- structures that work without villains;
- structures suitable for very young children;
- structures that produce good illustrated page turns;
- structures that can accommodate parent-supplied ideas;
- and structures that remain satisfying at Moonbeam story length.

For example, tragedy is an important literary form but should not be a standard Moonbeam architecture. Conversely, cumulative/pattern stories are extremely useful for children even though they do not map neatly onto some traditional adult plot classifications.

Moonbeam therefore uses its own architecture library.

## 3. The ten primary Moonbeam architectures

### Architecture 1 — THE QUEST

**Core movement:** A meaningful objective requires a journey or sequence of purposeful steps.

Typical deep shape:

**objective → progress → complications → adaptation → decisive final stage → achievement, altered achievement, or meaningful failure**

The objective might involve finding, delivering, reaching, collecting, returning, building or completing something.

The journey may be geographical, procedural or imaginative.

**What makes it distinctive:** forward movement toward a known destination or outcome.

**Variation:** The protagonist may travel alone or with others; the objective may change after a discovery; success may mean something different by the end; obstacles may be practical, comic, social or fantastical.

**Failure mode:** generic “go and collect three magical things” plotting, interchangeable obstacles, or a quest whose objective has no personal meaning.

---

### Architecture 2 — VOYAGE AND RETURN

**Core movement:** The protagonist enters an unfamiliar environment with different conditions, explores or experiences it, and eventually returns to the familiar world changed by the experience.

Typical deep shape:

**familiar world → crossing/transition → unfamiliar world → deeper involvement → crucial experience → return → changed understanding or perspective**

The unfamiliar world need not be magical. It could be a first day somewhere, a city, backstage at a theatre, beneath the sea, a historical period, another planet or an imagined miniature world.

**What makes it distinctive:** contrast between the known world and the entered world, with return providing the payoff.

**Variation:** The new world may be delightful, comic, bewildering, dangerous or simply fascinating. The protagonist may want to return immediately, resist returning, or only gradually realise what the experience means.

**Failure mode:** sightseeing. Merely visiting a succession of interesting places is not enough; the experience must develop and the return must mean something.

---

### Architecture 3 — MYSTERY AND REVELATION

**Core movement:** A question creates curiosity and successive information changes what the protagonist and reader believe.

Typical deep shape:

**puzzle/question → investigation → clues/observations → developing theory → complication or mistaken assumption → revealing connection → answer/payoff**

The mystery need not involve crime or danger. It might concern a strange noise, missing object, unexplained behaviour, unusual footprint, family surprise or apparently impossible event.

**What makes it distinctive:** the reader wants to know the answer.

**Variation:** comic mysteries, gentle mysteries, scientific mysteries, social misunderstandings and fantastical mysteries are all possible.

**Fairness rule:** the eventual answer should normally be supported by information introduced earlier, even if its significance was not obvious.

**Failure mode:** withholding arbitrary information, introducing the explanation at the last moment, or solving the mystery through coincidence.

---

### Architecture 4 — ESCALATING CHAOS

**Core movement:** One situation produces consequences that become progressively larger, stranger, funnier or harder to control.

Typical deep shape:

**small trigger → attempted response → unintended consequence → escalation → further response → larger escalation → peak chaos → clever/comic/satisfying resolution**

This is particularly suited to humour.

**What makes it distinctive:** causal escalation. Each new problem grows out of the previous attempt or consequence.

**Variation:** domestic mishaps, animals, cooking, inventions, school situations, misunderstandings, celebrations, magic and many other premises can drive it.

**Failure mode:** random silliness. Escalation must have a causal chain. “Then an elephant appeared” is not escalation unless the earlier story caused the elephant to appear.

---

### Architecture 5 — RESCUE / PROTECT / PUT-RIGHT

**Core movement:** Something valued is endangered, lost, broken, misplaced or in need of help, creating a concrete responsibility.

Typical deep shape:

**problem discovered → commitment to help → plan → complications → revised action → decisive intervention → restoration/reunion/new stable state**

The stakes can be tiny. Saving a picnic from rain can work just as well as rescuing someone from danger if the emotional scale fits the child.

**What makes it distinctive:** care and responsibility for something beyond simply achieving a personal prize.

**Variation:** rescue may require courage, ingenuity, cooperation, patience, knowledge or empathy.

**Failure mode:** helpless protagonist rescued by an adult/deus ex machina, excessive peril, or a resolution unrelated to the protagonist's actions.

---

### Architecture 6 — CHALLENGE / CONTEST / PERFORMANCE

**Core movement:** A defined challenge creates anticipation around preparation, participation and outcome.

Typical deep shape:

**challenge established → preparation/expectation → complication → adaptation → decisive performance/test → outcome → meaning of outcome**

This can cover sport, races, performances, school challenges, building competitions, puzzles, games and personal challenges.

**What makes it distinctive:** the reader knows that a test or moment of performance is coming.

**Variation:** Winning is only one possible payoff. The protagonist might lose but achieve something more personally significant; teamwork may matter; the apparent contest may transform.

**Failure mode:** predictable “child tries hard and wins” stories or generic moralising about taking part.

---

### Architecture 7 — DISCOVERY AND EXPLORATION

**Core movement:** Curiosity rather than conflict drives the story.

Typical deep shape:

**intriguing discovery → exploration → accumulating understanding → deeper or unexpected discovery → connection/recontextualisation → satisfying understanding or wonder**

This architecture is important because Moonbeam must not assume every good story needs an adversary or problem.

**What makes it distinctive:** the central reader question is “What is this / what will we discover?” rather than “Will the protagonist win?”

**Variation:** nature, science, history, places, hidden spaces, machines, family history, imaginative worlds and everyday environments can all support it.

**Failure mode:** encyclopaedic sightseeing. Each discovery must change or deepen the meaning of what came before rather than becoming a list of facts or wonders.

---

### Architecture 8 — RELATIONSHIP AND RECONCILIATION

**Core movement:** A relationship changes through interaction.

Typical deep shape:

**relationship state → connection or friction → shared events/misunderstanding → changed understanding → meaningful choice/action → new relationship state**

Possible relationships include friends, siblings, parent/child, grandparent/child, child/animal, rivals or two initially incompatible characters.

**What makes it distinctive:** the main change occurs between characters rather than in the external world.

**Variation:** forming a friendship, repairing one, learning to cooperate, understanding someone initially disliked, welcoming somebody new, or coping with temporary separation.

**Failure mode:** characters simply declaring that they are friends, sentimental speeches replacing events, or an external adventure that supposedly creates friendship without meaningful interaction.

---

### Architecture 9 — TRANSFORMATION / MASTERY

**Core movement:** The protagonist's capability, understanding, confidence, habit or attitude changes through experience.

Typical deep shape:

**initial limitation/state → experience exposes it → attempts/learning → meaningful difficulty → changed approach or understanding → demonstration of change → consequence**

This is Moonbeam's closest equivalent to “rebirth” or a character-growth plot, but should operate at child-sized scale.

**What makes it distinctive:** the ending demonstrates a change that the beginning made meaningful.

**Variation:** learning a skill, becoming more independent, revising an assumption, managing a fear, accepting change, developing patience or discovering an unexpected strength.

**Important rule:** the child need not begin with a “flaw.” Growth should not imply that the child was deficient.

**Failure mode:** preachy moral transformation, instant personality change, or telling the reader “Jamie had learned to be brave” without demonstrating it through action.

---

### Architecture 10 — CUMULATIVE / PATTERN AND PAYOFF

**Core movement:** Deliberate repetition builds a recognisable pattern, with variation or accumulation creating anticipation until the pattern culminates or breaks.

Typical deep shape:

**pattern established → repetition with variation → accumulation → heightened repetition → expectation → surprising break/convergence/payoff**

This architecture is particularly valuable for younger children and for future rhyme-and-rhythm stories.

**What makes it distinctive:** the child begins to anticipate the form and gains pleasure from repetition, participation and variation.

**Variation:** accumulating characters or objects, repeated encounters, repeated attempts with meaningful changes, refrains, journeys through a sequence, or progressively altered situations.

**Failure mode:** repetition as padding. Each recurrence must add, alter, escalate or prepare the payoff.

---

## 4. Secondary narrative flavours

Some useful story concepts should **not** become primary architectures because they describe subject matter, tone or a mechanism rather than deep narrative shape.

Examples include:

- secret world;
- magical object;
- time travel;
- mistaken identity;
- monster encounter;
- school adventure;
- animal companion;
- bedtime journey;
- historical adventure;
- science-fiction adventure;
- holiday story;
- spooky story.

These should be treated as **premise/setting/tone layers** that can combine with different architectures.

For example, “secret world” could produce:

- a Voyage and Return story;
- a Mystery and Revelation story;
- a Discovery and Exploration story;
- a Rescue story;
- or even Escalating Chaos.

This separation is important for diversity. Moonbeam should not confuse “what the story contains” with “how the story works.”

## 5. Architecture blending

Real stories often combine structures. Moonbeam should eventually permit this, but blending must be controlled.

The proposed rule is:

**Every story has one PRIMARY architecture. It may have one SECONDARY architecture only when the combination improves the story.**

The primary architecture controls the central narrative question and final payoff.

Example:

**Primary: Mystery**  
Why are footballs disappearing from the garden?

**Secondary: Relationship**  
The investigation forces two quarrelling siblings to cooperate.

The mystery must still be genuinely solved; the relationship subplot cannot replace the mystery payoff.

For shorter/younger stories, a single architecture will usually be preferable.

This prevents the current AI tendency to combine quest + mystery + magic + rescue + friendship lesson into one short story and develop none of them properly.

## 6. Architecture selection principles

The architecture should not be selected randomly without regard to the parent's input.

The eventual planner should consider, in order:

1. **Explicit parent story idea.** If the parent has clearly implied a structure, respect it.
2. **Nature of the premise.** A missing object naturally invites mystery; a race invites challenge; discovering a hidden ecosystem invites exploration.
3. **Child's age.** Complexity and architecture blending should be age appropriate.
4. **Child's interests and supplied details.** Select structures that allow these details to matter causally.
5. **Desired tone.** Comic stories may favour escalation; cosy stories may favour cumulative, relationship, exploration or voyage-and-return forms.
6. **Variety.** When several architectures fit equally well, the system may favour one that reduces repetition across generated candidates or recent stories where such history is available.

Architecture must serve the story idea, not override it.

## 7. Parent-supplied ideas versus “surprise me”

### Parent supplies a specific idea

Moonbeam should infer the best architecture from that idea rather than forcing the idea into a randomly selected form.

Example:

“My daughter finds a baby seal on the beach and helps it get back to its mother.”

Likely primary architecture: **Rescue / Protect / Put-Right**.

### Parent supplies only loose ingredients

Moonbeam may construct several candidate premises using different compatible architectures before choosing the strongest.

Example:

“Oliver, age 8, loves trains and dinosaurs.”

Possible candidates could include:

- Mystery: strange marks appear beside a heritage railway.
- Escalating Chaos: Oliver's model railway demonstration goes spectacularly wrong.
- Voyage and Return: an unusual train journey enters a prehistoric landscape.
- Challenge: Oliver must design a railway route for a dinosaur park.

The architecture creates genuine variation rather than merely changing scenery.

## 8. Age considerations

Architecture should not be rigidly assigned by age, but execution should change.

### Younger children

Particularly strong:
- Cumulative / Pattern and Payoff
- Escalating Chaos
- Rescue / Put-Right
- simple Quest
- simple Voyage and Return
- simple Discovery
- simple Relationship

Fewer major characters, shorter causal chains, clear recurring patterns and concrete objectives are preferable.

### Middle childhood

All ten architectures can work. Mysteries can contain more inference; challenges can have more complex setbacks; relationship stories can support misunderstanding and subtext; quests can have more consequential choices.

### Older children within Moonbeam's range

Architecture blending and more nuanced outcomes become possible. The protagonist can hold mistaken assumptions, face ambiguous choices, fail at an apparent objective, or discover that the original goal was incomplete.

Age should control **complexity**, not imagination.

## 9. Diversity controls

Architecture alone will not prevent repetitive stories. Stage 3 must vary dimensions within each architecture.

At minimum, stories should be capable of varying:

- source of narrative momentum;
- protagonist objective or curiosity;
- stakes;
- setting;
- number/type of other characters;
- whether the protagonist initiates or reacts;
- nature of complications;
- emotional arc;
- use of humour;
- realism/fantasy rules;
- resolution mechanism;
- degree of surprise;
- ending type.

The architecture is therefore a skeleton, not a finished plot.

## 10. Architecture-specific payoff rule

Every architecture promises the reader a different kind of satisfaction. The ending must fulfil the promise established by the chosen architecture.

- **Quest:** meaningful outcome of the objective/journey.
- **Voyage and Return:** meaningful return or contrast with the beginning.
- **Mystery:** revelation/explanation.
- **Escalating Chaos:** culmination and release/resolution.
- **Rescue / Put-Right:** fate of what needed help/restoration.
- **Challenge:** outcome and meaning of the test.
- **Discovery:** deepest discovery or changed understanding.
- **Relationship:** demonstrated change in the relationship.
- **Transformation:** demonstrated change in protagonist state/capability/understanding.
- **Cumulative:** convergence, break or payoff of the established pattern.

A story that does not deliver its architecture's promised payoff has failed even if the prose is attractive.

## 11. Anti-formula principle

Moonbeam must distinguish between **structure** and **formula**.

Structure creates intelligibility and expectation.

Formula results when the same surface sequence is repeatedly filled with different nouns.

Therefore the eventual implementation must NOT contain one fixed beat list for each architecture that is copied mechanically into every story.

For example, every Mystery must not become:

“find clue 1 → find clue 2 → accuse wrong person → find clue 3 → reveal.”

Instead the architecture defines relationships such as:

- a central unanswered question;
- information arriving progressively;
- beliefs changing in response;
- and an earned revelation.

The planner in Stage 3 will determine the actual beats afresh for each story.

## 12. Stage 2 architecture set

The initial Moonbeam Narrative Architecture Library is therefore:

1. **The Quest**
2. **Voyage and Return**
3. **Mystery and Revelation**
4. **Escalating Chaos**
5. **Rescue / Protect / Put-Right**
6. **Challenge / Contest / Performance**
7. **Discovery and Exploration**
8. **Relationship and Reconciliation**
9. **Transformation / Mastery**
10. **Cumulative / Pattern and Payoff**

This set is deliberately broader than Booker's seven in areas especially useful for children's storytelling, while excluding tragedy as a standard generation architecture.

The set should be treated as the baseline for Stage 3 rather than an immutable literary claim. If implementation testing later reveals substantial redundancy or a missing deep structure, the specification can be revised deliberately rather than patched ad hoc.

# Stage 3 — Story Planning System

**Status: COMPLETE — initial design baseline**

## 1. Purpose

Moonbeam should stop asking one model response to invent the story and write the finished prose at the same time.

Before any visible story text is written, Moonbeam should construct a **hidden story plan**.

The planner's job is not to produce beautiful sentences. Its job is to answer:

- What is this particular story?
- Why will the child care about what happens?
- What makes it different from a generic story?
- Which architecture best serves it?
- What causes each important event?
- What is set up early and paid off later?
- What changes by the end?
- What makes the ending belong specifically to this story?

Only after those questions have satisfactory answers should the writing stage begin.

## 2. Overall planning pipeline

The proposed hidden pipeline is:

**Input interpretation → candidate concepts → candidate evaluation → architecture selection → full story plan → structural self-check → approved plan → prose writer**

This separates **story invention** from **storytelling prose**.

The prose writer should receive an approved plan and concentrate on executing it well rather than inventing the plot while writing.

## 3. Step A — Interpret the parent's input

The planner first converts the user-facing inputs into a concise internal brief.

The internal brief should identify:

- child's exact name;
- age;
- explicitly supplied interests/details;
- explicit story idea, if any;
- requested tone;
- requested values, if any;
- dislikes/exclusions;
- desired story length;
- language;
- realism/fantasy constraints;
- any other hard product constraints.

Inputs should be divided into:

### Hard constraints
Must be obeyed.

Examples:
- exact child name;
- explicit parent premise;
- dislikes;
- requested language;
- safety restrictions;
- requested reality rule.

### Creative opportunities
May be used when they improve the story.

Examples:
- favourite sport;
- animal interest;
- hobby;
- place;
- family detail.

The planner must not force every available personal detail into the plot.

## 4. Step B — Determine how much invention is appropriate

Moonbeam should distinguish three input modes.

### Mode 1 — Parent-defined story

The parent has supplied a reasonably specific premise.

Example:

> “Sophie finds a baby dragon in the garden and has to hide it from her dad until she can get it home.”

The planner should preserve the premise and develop it. It should **not** generate unrelated competing concepts that replace the parent's idea.

It may still consider different ways to structure that same premise.

### Mode 2 — Parent-guided story

The parent supplies ingredients but not a complete premise.

Example:

> “A story about Ben, trains and dinosaurs.”

Moonbeam has substantial creative freedom but must make the supplied ingredients meaningful.

Several candidate concepts should normally be considered.

### Mode 3 — Surprise me

There is no meaningful parent plot direction.

Moonbeam has maximum creative freedom and should deliberately search for a strong premise rather than defaulting to generic children's-story ingredients.

This distinction prevents a concept-generation system from accidentally overriding the customer.

## 5. Step C — Generate candidate concepts before plotting

For Parent-guided and Surprise-me stories, Moonbeam should normally create **three compact candidate concepts internally** before choosing one.

Three is enough to create competition without excessive cost or complexity.

The candidates should differ at the level of **story idea**, not merely cosmetic details.

Bad candidate diversity:

- Jamie finds a magical key in a forest.
- Jamie finds a magical key at school.
- Jamie finds a magical key on the beach.

Good candidate diversity:

- A mystery about why every clock in Jamie's grandfather's workshop stops at exactly 4:17.
- A comic escalation in which Jamie tries to keep one escaped chicken out of a birthday party.
- A challenge story in which Jamie uses his interest in maps to help organise a chaotic treasure hunt.

Where appropriate, candidates should use different compatible architectures.

## 6. What a candidate concept contains

Each candidate should be extremely compact. It does not need page-by-page beats yet.

It should contain:

- **one-sentence premise**;
- **likely primary architecture**;
- **central narrative question**;
- **personalisation hook**;
- **memorable hook**;
- **likely payoff**.

Example:

**Premise:** Eight-year-old Maya discovers that the “ghost” moving things around her grandmother's greenhouse is actually a family of dormice preparing for winter.

**Architecture:** Mystery and Revelation.

**Narrative question:** What is moving everything in the greenhouse at night?

**Personalisation:** Maya's interest in animals helps her interpret clues others overlook.

**Memorable hook:** Tiny objects repeatedly arranged into peculiar nests.

**Payoff:** Maya solves the mystery and helps create a safe nesting place.

The purpose is to see whether the story has a strong identity before spending effort plotting it.

## 7. Step D — Score and select the concept

The planner should compare candidate concepts against a compact internal scorecard.

Each candidate should be judged for:

- **Coherence potential** — can this naturally form a causal story?
- **Distinctiveness** — does it have a specific identity?
- **Personalisation potential** — can the child's details matter?
- **Architecture fit** — is there a natural narrative shape?
- **Payoff potential** — is there a satisfying destination/reveal/resolution?
- **Age fit** — is the concept suitable and comprehensible?
- **Read-aloud appeal** — does the idea lend itself to enjoyable scenes?
- **Non-genericity** — is it avoiding Moonbeam/AI clichés?

The selection should not be a crude arithmetic contest where a one-point difference is treated as objective truth. The scorecard is a reasoning aid.

If all three concepts are weak, the system should generate replacements rather than choose the least bad one.

## 8. Stage 3 “premise gate”

Before full plotting, the selected concept should pass a simple gate:

> **Can the story be described compellingly in one or two sentences without relying on vague words such as “adventure”, “magical”, “amazing” or “learns an important lesson”?**

If not, the premise probably is not specific enough.

This gate directly attacks bland AI concepts.

## 9. Step E — Select primary and optional secondary architecture

After the concept is selected, the planner confirms the primary architecture from Stage 2.

It records:

- primary architecture;
- optional secondary architecture;
- why that architecture fits this premise;
- architecture-specific promise/payoff.

The architecture should never be selected merely for variety when it conflicts with the premise.

For short or younger stories, no secondary architecture should normally be used.

## 10. Step F — Build the Story Spine

The planner then creates a compact **Story Spine** before detailed beats.

The Story Spine contains:

### 1. Story identity
A one- or two-sentence statement of what makes this story specifically memorable.

### 2. Starting state
Where the child is, what is normal, and what matters at the beginning.

### 3. Narrative engine
What keeps the reader wanting the next page.

Depending on architecture, this might be:
- reaching an objective;
- answering a question;
- containing escalating chaos;
- protecting something;
- anticipating a contest;
- discovering what lies deeper;
- watching a relationship change;
- seeing whether a pattern will continue.

### 4. Stakes
Why the outcome matters at the scale appropriate to this child and story.

Stakes need not mean danger. They may be emotional, comic, practical, social, curious or imaginative.

### 5. Progression principle
How the middle will develop rather than repeat.

### 6. Turning point
The event, discovery, decision or consequence that substantially changes the direction or understanding of the story.

Not every story needs a dramatic reversal, but the plan should identify where the story deepens.

### 7. Climax / deepest payoff moment
The moment that most fully delivers the architecture's promise.

For quiet structures this may be a revelation, emotional action or final discovery rather than an action climax.

### 8. Ending state
What is concretely different from the beginning.

### 9. Setup/payoff links
Important early details that become useful, meaningful or newly understood later.

### 10. Retelling sentence
“It was the one where…”

If the retelling sentence is weak or generic, the plan returns for revision.

## 11. Step G — Create causal story beats

Only after the Story Spine works should the planner expand it into beats.

The number of planning beats should be based on story length and age rather than hard-coded universally.

Each beat should record:

- what happens;
- why it happens now;
- what causes it;
- what changes because of it;
- what the protagonist now knows/wants/decides;
- any setup introduced;
- any earlier setup paid off;
- the intended emotional/reader effect;
- the key visual opportunity for illustration.

This makes causality explicit before prose can hide weaknesses behind nice language.

## 12. The “because / therefore” test

Adjacent major beats should usually connect through **because**, **therefore**, **but**, **so**, discovery or deliberate pattern.

Weak:

> Jamie entered the cave. **And then** he met an owl. **And then** he found a boat. **And then** a storm began.

Stronger:

> Jamie entered the cave **because** he had followed the missing dog's muddy prints. He discovered the prints stopped beside an underground stream, **so** he used the abandoned rowing boat. **But** the current pulled the boat away from the bank…

“And then” is not banned. The principle is that the story should not depend primarily on arbitrary succession.

For cumulative/pattern structures, deliberate repetition is itself a valid connective mechanism, but each recurrence must alter or accumulate something.

## 13. Protagonist agency

Where age and premise allow, the child protagonist should materially affect the story.

Agency can include:

- making a choice;
- noticing something;
- asking the useful question;
- trying a solution;
- changing strategy;
- using knowledge;
- admitting a mistake;
- seeking help intelligently;
- showing kindness that changes events;
- persisting;
- deciding not to do something.

Agency does **not** require the child to solve every problem alone.

Adults may help. Other characters may be more knowledgeable or capable. But the personalised child should not usually be a passenger watching the plot happen.

## 14. Personalisation map

The plan should explicitly state how selected personal details affect the story.

Each used personal detail should have a role such as:

- **Premise-driving**
- **Decision-driving**
- **Skill/knowledge-driving**
- **Relationship-driving**
- **Humour-driving**
- **Setting-driving**
- **Payoff-driving**

A detail used only decoratively should not be counted as meaningful personalisation.

The planner may deliberately leave some supplied details unused.

## 15. Setup and payoff ledger

The planner should maintain a small internal ledger of important story elements.

For each significant element:

**Introduced → function → later consequence/payoff**

Example:

- Jamie notices the old station clock runs five minutes slow.
- Function: initially a characterful observation.
- Payoff: later explains why everyone believes the last train has already left.

Not every detail needs a payoff. Atmospheric description can simply create mood.

The ledger is for **prominent functional elements**: objects, rules, clues, promises, abilities, warnings, relationships and information that the story makes important.

This should reduce both forgotten setups and last-minute deus-ex-machina solutions.

## 16. Character knowledge ledger

The planner should track important knowledge states when relevant.

For each major character, the plan may record:

- what they know;
- what they believe incorrectly;
- what they do not yet know;
- when/how that changes.

This is especially important for mysteries, misunderstandings and relationship stories.

It prevents AI errors such as a character discussing information they have never been told.

For simple stories this ledger can remain minimal.

## 17. World-rule ledger

For fantasy, science-fiction or “one impossible rule” stories, the planner should record the small number of rules necessary for consistency.

Examples:

- Only Maya can hear the statues speak.
- The miniature world exists only inside the greenhouse.
- The robot cannot climb stairs.
- Time continues normally outside the hidden room.

The story should not invent new powers or exceptions merely to escape a plotting problem.

## 18. Memorable-element design

Stage 1 requires at least one memorable story-specific element.

The planner should identify it explicitly rather than hope one appears during prose generation.

It may be:

- the premise itself;
- a recurring comic device;
- a character;
- a striking visual situation;
- an unusual rule;
- a clever solution;
- a reveal;
- a reversal;
- an emotional action;
- a refrain/pattern.

The memorable element should be **developed**, not merely mentioned once.

## 19. Surprise design

The planner should decide whether the story benefits from surprise.

Surprise is optional. When used, it should normally be one of:

- **revelation** — new information changes understanding;
- **reversal** — an expected outcome changes;
- **recontextualisation** — an earlier detail acquires new meaning;
- **comic consequence** — a logical result is much funnier/larger than expected;
- **unexpected solution** — surprising but prepared for;
- **character choice** — a character acts differently from expectation for an established reason.

The planner should reject “surprises” that require an unprepared new power, object, character or rule.

## 20. Ending design happens before prose

Moonbeam should know the ending before it writes the opening.

The plan must specify:

- how the primary architecture pays off;
- how the central narrative question is answered;
- what happens to the central objective/problem/relationship/discovery;
- what earlier setup contributes to the ending;
- what state is different afterwards;
- intended final emotional note.

This is one of the most important changes from improvisational generation.

The prose writer may phrase the ending creatively but should not invent a fundamentally different resolution.

## 21. Illustration-aware planning without plot distortion

Because Moonbeam is an illustrated product, the planner should identify a **visual opportunity** for each displayed beat.

However, the story must not be distorted simply to produce spectacular images.

Visual variety can come from:

- scale;
- viewpoint;
- character interaction;
- location;
- physical action;
- quiet close-up;
- comic tableau;
- reveal;
- environmental change.

The planner should avoid six visually identical conversations, but it should also avoid inserting random action solely to vary illustrations.

Story logic remains primary.

## 22. Page architecture comes after story architecture

The plan should first create the correct number of **meaningful narrative beats** and then map those beats onto Moonbeam's displayed pages/spreads.

The current product's page count must not cause the planner to invent filler simply because a field such as “page 3” needs content.

Where a story format has a fixed number of displayed sections, each section should receive an appropriate portion of the existing narrative progression.

This distinction should reduce the current tendency for every page to behave like an isolated mini-event.

## 23. Plan compression test

Before prose generation, the plan should survive a compression test.

The engine should be able to summarize the entire causal story in a short paragraph.

If the summary becomes:

> “Jamie does X, then Y, then Z, then meets A, then finds B…”

the plan may be episodic.

A strong compressed plan should expose the story's connective logic.

## 24. Remove-one-beat test

For non-cumulative stories, the planner should ask of each middle beat:

> “If this beat vanished, would something important later stop making sense, become less satisfying, or lose necessary progression?”

If not, the beat may be filler.

This is not an absolute deletion rule; atmosphere and character moments can have value. But a story in which **every** middle beat is removable is structurally weak.

## 25. Anti-overplanning rule

The hidden plan must not become so elaborate that the finished children's story feels mechanical.

The plan establishes:

- causality;
- progression;
- setup/payoff;
- character knowledge;
- world rules;
- ending;
- memorable identity.

It should **not** prescribe every joke, adjective, gesture or line of dialogue.

The prose writer needs controlled creative freedom.

This is important because the solution to AI incoherence must not be lifeless over-engineering.

## 26. Proposed hidden plan schema

At implementation time, the planner should return structured data broadly equivalent to:

- input_mode
- hard_constraints
- selected_personal_details
- premise
- primary_architecture
- secondary_architecture (optional)
- architecture_promise
- story_identity
- central_narrative_question
- starting_state
- stakes
- narrative_engine
- progression_principle
- turning_point
- climax_or_deepest_payoff
- ending_state
- intended_emotional_note
- memorable_element
- surprise_design (optional)
- personalisation_map
- setup_payoff_ledger
- character_knowledge (when needed)
- world_rules (when needed)
- story_beats
- retelling_sentence

The exact JSON structure belongs to implementation design after Stage 5. Stage 3 defines the information model, not code syntax.

## 27. Cost and latency principle

The ideal creative pipeline could make many separate AI calls, but Moonbeam is a commercial product and must consider generation time and API cost.

Therefore the design requirement is **logical separation**, not necessarily one API request per logical step.

For example, implementation may eventually perform:

- one model call that generates and evaluates candidate concepts and returns the selected full plan;
- one model call that writes the story from the plan;
- one validation/repair call only when required.

The architecture must not depend on an expensive chain of ten separate model calls.

Quality testing during implementation should determine the minimum number of calls that reliably delivers the design.

## 28. Parent idea fidelity rule

When the parent supplies a story idea, the planner may enrich, structure and solve it but must not silently replace its central premise.

If the parent asks:

> “A realistic story about Ella learning to ride her bike with Grandpa.”

Moonbeam should not decide that a magical fox makes the story more memorable.

Originality must come from developing the requested story well.

This rule has priority over the engine's desire for novelty.

## 29. Planner freedom rule

Conversely, in Surprise-me mode, Moonbeam should have genuine creative freedom.

It should not be required to include:

- magic;
- quests;
- animal sidekicks;
- secret doors;
- mysteries;
- lessons;
- bedtime settings;
- danger.

The concept competition should be allowed to choose an excellent realistic, comic, quiet, domestic, scientific, social or imaginative story.

## 30. Stage 3 planning standard

A story is ready to enter the writing stage only when Moonbeam knows, in hidden structured form:

> **what the story is, why its events belong together, what drives the reader forward, how the child meaningfully affects it, what makes it memorable, what is being set up and paid off, what the architecture promises, and exactly how that promise will be fulfilled at the end.**

The writer's job is then to tell that already-good story beautifully.

# Stage 4 — Quality Gates and Validation

**Status: COMPLETE — initial design baseline**

## 1. Purpose

Moonbeam should not assume that because an AI response is grammatical, it is good enough to become a child's finished book.

The new Story Engine therefore needs explicit **quality gates** at two different levels:

1. **Plan validation** — Is the underlying story worth writing?
2. **Final-story validation** — Did the prose actually deliver the approved plan clearly and well?

A third mechanism, **targeted repair**, should fix limited defects when the story is otherwise sound.

The central principle is:

> **Do not polish a bad story. Reject it early. Repair only what is repairable.**

This prevents the system from spending illustration, narration and storage cost on structurally weak stories.

## 2. The validation ladder

The proposed sequence is:

**Candidate concepts → premise gate → full plan → plan validator → approved plan → prose writer → final-story validator → targeted repair if appropriate → final acceptance → illustration/narration**

A story must pass each meaningful gate before proceeding.

Validation should be stricter earlier in the pipeline, because structural flaws are cheaper to fix before prose and illustrations exist.

## 3. Three possible validator outcomes

Every major validation stage should return one of three outcomes:

### PASS

The output is good enough to proceed.

Minor stylistic imperfections that do not materially reduce quality may be tolerated.

### REPAIR

The output is fundamentally sound but has one or more local defects that can be corrected without reinventing the story.

Examples:

- one continuity error;
- a payoff is present but insufficiently prepared;
- one page repeats information;
- a name or pronoun is inconsistent;
- an ending is slightly too abrupt;
- a prominent setup is forgotten;
- a sentence is confusing while the plot remains sound.

### REJECT / REGENERATE

The output is structurally poor enough that patching would create a fragile story.

Examples:

- incoherent causal chain;
- generic or weak premise;
- central architecture promise not fulfilled;
- major events are arbitrary;
- story repeatedly contradicts itself;
- parent idea has been replaced;
- ending depends on an unintroduced solution;
- story is essentially filler;
- meaningful personalisation is absent when it should be central;
- the story cannot be summarised coherently.

This distinction is essential. Moonbeam should not try to “repair” every bad generation.

## 4. Hard failures versus soft failures

Validation criteria should be divided into:

### Hard failures

A hard failure blocks progression.

Examples:

- wrong child name;
- violates explicit parent premise;
- violates explicit dislikes or hard constraints;
- wrong language;
- unsafe/inappropriate content;
- impossible JSON/required structure failure;
- architecture's central promise unresolved;
- major contradiction;
- deus-ex-machina resolution;
- severe incoherence;
- story ends without resolving its core narrative question;
- fantasy/world rules contradict themselves in a way that affects the plot.

### Soft failures

A soft failure reduces quality but may be repairable.

Examples:

- weak opening;
- slightly generic wording;
- insufficient humour for a comic story;
- one underused personal detail;
- one page too long;
- minor repetition;
- an illustration beat that lacks visual distinction;
- payoff present but not strong enough;
- read-aloud rhythm feels awkward.

Hard failures should not be averaged away by strengths elsewhere.

## 5. Plan Validation Gate

Before prose generation, the full hidden plan from Stage 3 should be checked against the following dimensions.

### A. Premise strength

The plan should answer:

- Is there a clear, specific story idea?
- Can it be described without vague filler words?
- Is there a reason to care what happens?
- Does it have a distinctive identity?

Failure example:

> “Lily goes on a magical adventure and learns about friendship.”

Pass example:

> “Lily secretly enters her neighbour's enormous hedge maze to retrieve the neighbour's escaped tortoise before a garden party begins.”

### B. Architecture fit

The plan should answer:

- Is the selected architecture natural for this premise?
- Does the story's progression actually follow that architecture?
- Is the promised payoff clearly defined?
- If there is a secondary architecture, is it subordinate rather than competing?

### C. Causal coherence

The validator should examine the major beats and ask:

- Why does this happen now?
- What caused it?
- What changes because of it?
- Does the next beat logically follow?

A plan dominated by arbitrary “and then” progression should fail.

### D. Progression

The validator should verify that the story develops rather than repeats.

It should reject plans in which:

- multiple beats perform the same function;
- attempts do not change the situation;
- the middle could be reordered freely;
- pages are essentially interchangeable.

### E. Setup and payoff

The validator should check that:

- important resolution tools/rules/knowledge are introduced before they are needed;
- prominent setups are used, resolved or intentionally atmospheric;
- major clues are fair;
- promises made by the story receive payoffs.

### F. Ending integrity

The ending should:

- resolve the architecture's main promise;
- answer the central narrative question;
- arise from prior events;
- reflect protagonist choices/actions where appropriate;
- avoid sudden unrelated solutions;
- leave the story in a meaningfully different state.

### G. Personalisation quality

The validator should check whether selected personal details affect:

- premise;
- decisions;
- knowledge;
- relationships;
- humour;
- setting;
- or payoff.

Name insertion alone does not count.

### H. Protagonist agency

Where appropriate, the child should influence the outcome.

A story may fail this check if the protagonist simply observes while adults or magical characters do everything.

The standard should remain age-sensitive and premise-sensitive.

### I. Memorability

The plan must contain at least one developed memorable element.

The validator should ask:

> “What would a parent or child remember about this particular story tomorrow?”

If the answer is vague, the plan should be revised or regenerated.

### J. Age fit

The plan should suit the child's developmental level in:

- number of characters;
- complexity of motives;
- causal chain length;
- intensity;
- ambiguity;
- conceptual demands;
- emotional content;
- type of humour.

### K. Parent fidelity

Explicit parent input must remain authoritative.

The validator should detect when the planner has silently converted:

- realistic → magical;
- gentle → perilous;
- requested character/setting → unrelated substitute;
- requested premise → generic adventure.

### L. Originality / anti-cliché check

The plan should avoid excessive reliance on recurring AI children's-story defaults such as:

- glowing object;
- mysterious door;
- wise talking animal;
- hidden magical kingdom;
- arbitrary quest;
- sudden friendship moral;
- “believe in yourself” resolution;
- generic bravery lesson.

These elements are not forbidden. They fail only when used automatically, superficially or repetitively.

## 6. Plan validator output

The plan validator should return structured findings, not merely “good/bad”.

Conceptually:

- outcome: PASS / REPAIR / REJECT
- hard_failures
- soft_failures
- architecture_check
- causality_check
- progression_check
- setup_payoff_check
- ending_check
- personalisation_check
- memorability_check
- parent_fidelity_check
- recommended_repairs

The validator should not rewrite the story itself at this stage.

## 7. Repair versus regenerate decision at plan stage

A plan should be **repaired** when the core concept remains strong and defects are local.

Examples:

- one beat is redundant;
- the climax needs a stronger setup;
- the protagonist needs one additional meaningful decision;
- two beats should be merged;
- the ending should use an earlier detail.

A plan should be **regenerated** when the defect is fundamental.

Examples:

- no compelling premise;
- wrong architecture;
- causality is weak throughout;
- no meaningful ending exists;
- parent brief has been misunderstood;
- concept is generic at its core;
- plot requires many patches to make sense.

Rule:

> **If repair changes the story's central premise, architecture, or majority of beats, regenerate instead.**

## 8. Final Story Validation Gate

After prose is written, Moonbeam should validate the actual story against both:

1. the approved plan; and
2. the Stage 1 quality standard.

The final validator should not assume that a good plan guarantees good prose.

## 9. Final validator: structural fidelity

The validator should check:

- Did the prose follow the approved premise?
- Is the primary architecture still intact?
- Did all essential beats occur?
- Did the writer accidentally introduce an unrelated subplot?
- Did the planned ending survive?
- Were key setups/payoffs preserved?
- Did prose improvisation create new contradictions?

Small creative deviations are acceptable if they improve the story without breaking structure.

## 10. Final validator: continuity

The validator should examine:

- character names;
- character identities;
- relationships;
- ages if mentioned;
- possessions;
- locations;
- sequence of events;
- time of day where relevant;
- injuries/problems already resolved or still active;
- what each character knows;
- fantasy/science-fiction rules.

Continuity errors are particularly damaging in personalised stories because children notice concrete inconsistencies.

## 11. Final validator: causal clarity

The finished prose should still make clear:

- why characters act;
- how one event leads to another;
- why a new problem occurs;
- why the resolution works.

Beautiful prose must not obscure the story's logic.

## 12. Final validator: page-to-page progression

Each displayed section should materially advance, deepen or pay off the story.

The validator should flag:

- two adjacent pages doing essentially the same thing;
- repeated description with no development;
- multiple failed attempts that are functionally identical;
- pages whose removal changes nothing.

Quiet emotional development and deliberate cumulative patterns remain valid progression.

## 13. Final validator: ending quality

The final ending should be tested independently because weak endings disproportionately damage memorability.

The validator should ask:

- Does the ending resolve what the beginning made important?
- Did the protagonist or story earn the outcome?
- Is the resolution specific rather than generic?
- Does the last page add closure rather than merely stop?
- Does the final emotional note match the story?

Automatic phrases such as:

- “It was the best adventure ever.”
- “And from that day on, Jamie knew he could do anything.”
- “They learned that friendship was the greatest magic of all.”

should be treated as warning signs unless genuinely earned.

## 14. Final validator: personalisation

The validator should compare the finished story with the plan's personalisation map.

It should check whether:

- the child's name is correct throughout;
- meaningful personal details survived into prose;
- interests matter to events rather than merely appear in description;
- no invented sensitive/family details have been added without input;
- personalisation does not become repetitive name use.

## 15. Final validator: memorability and specificity

The validator should perform the Stage 1 retelling test again:

> “It was the one where…”

The finished story should still yield a concrete answer.

It should also identify the intended memorable element and confirm that the prose actually developed it.

If the planned memorable hook appears only once and has no narrative importance, the story has failed to execute the plan.

## 16. Final validator: read-aloud quality

Because Moonbeam stories are frequently narrated or read by adults, the final text should be checked for:

- awkward sentence construction;
- accidental tongue-twisters;
- excessive sentence length;
- unclear pronouns;
- confusing dialogue attribution;
- repeated words close together;
- unnatural exposition;
- overuse of exclamation marks;
- mechanical transitions;
- over-long descriptive passages;
- punctuation that makes spoken delivery awkward.

Stage 5 will define different read-aloud expectations for prose and rhyme modes.

## 17. Final validator: AI-language warning signs

The system should flag, but not automatically ban, common low-quality AI tendencies:

- “little did X know” used without purpose;
- “suddenly” repeatedly;
- “with a twinkle in his eye”;
- “heart filled with…”;
- “couldn't help but smile”;
- “a sense of wonder”;
- “more than just…” moral summaries;
- generic adjectives such as amazing, magical, incredible, wonderful;
- repetitive “as they…” transitional clauses;
- over-explaining emotions the events already show;
- explicit moral at the end.

The purpose is not to create a blacklist of English phrases. It is to detect cumulative genericity.

## 18. Final validator: age-appropriate prose

The prose validator should check more than vocabulary.

It should assess:

- sentence complexity;
- paragraph length;
- abstraction;
- implied knowledge;
- number of simultaneous characters;
- emotional intensity;
- subtlety of jokes;
- amount of explanation;
- dialogue complexity.

Simpler language should not flatten the story's intelligence.

## 19. Final validator: safety and content appropriateness

Existing product safety checks remain necessary and should be incorporated into the final acceptance gate.

The validator should ensure that the story remains suitable for the target age and respects explicit parent exclusions.

This is independent of literary quality.

## 20. Targeted repair principles

When final prose receives REPAIR rather than REJECT, the repair operation should be tightly scoped.

A repair prompt should receive:

- approved plan;
- current story;
- exact defects;
- instruction to change only what is necessary;
- requirement to preserve unaffected wording/plot where possible;
- requirement not to introduce new characters, rules, objects or subplots unless explicitly required by the repair.

This prevents repairs from creating new problems.

## 21. Examples of suitable targeted repairs

Suitable:

- correct a character name;
- clarify how a character learned something;
- strengthen an existing setup before its payoff;
- remove one redundant beat;
- merge two repetitive passages;
- make the ending explicitly resolve the existing problem;
- simplify an over-complex sentence;
- fix an age-inappropriate phrase;
- repair one world-rule contradiction.

Unsuitable for repair:

- invent a better premise;
- replace the whole middle;
- change architecture;
- add an entirely new climax;
- solve a story whose causal chain never worked.

Those require regeneration from the planning stage.

## 22. Repair loop limit

Moonbeam should not enter an endless “AI fixes AI” loop.

The proposed rule:

- one targeted repair attempt for ordinary defects;
- one revalidation;
- if a major defect remains, regenerate from the appropriate earlier stage.

A second repair may be allowed only for a clearly separate trivial formatting/continuity issue.

This prevents cost inflation and patch accumulation.

## 23. Validator independence

Where practical, validation should be performed with a prompt/function that is **not simply the same writing instruction repeated**.

The validator should be explicitly critical and diagnostic.

Its role is not:

> “Improve this story.”

Its role is:

> “Determine whether this story satisfies these exact structural and product requirements; identify concrete failures.”

This reduces the tendency of models to praise their own output or rewrite unnecessarily.

Implementation testing may determine whether a separate model call, a combined evaluator, deterministic checks or a hybrid gives the best quality/cost trade-off.

## 24. Deterministic checks

Not every check requires an AI model.

The implementation should use deterministic validation where practical for:

- required JSON fields;
- exact page count;
- child-name consistency;
- missing/empty sections;
- approximate length bounds;
- duplicate sections;
- malformed character-bible data;
- prohibited output formatting;
- language field consistency;
- obvious structural schema errors.

AI judgement should be reserved for genuinely semantic questions such as coherence, memorability and payoff quality.

## 25. Quality score versus gates

Moonbeam may use internal scores for diagnostics, but acceptance should not depend on one blended numerical score.

A story that is:

- beautifully written,
- highly personalised,
- funny,

but has an incoherent ending should still fail.

Therefore critical criteria operate as **gates**, not merely weighted points.

Possible internal scoring can help rank candidates, but hard structural failures must block publication.

## 26. Minimum acceptance criteria

Before a story can proceed to illustration/narration, it must at minimum satisfy:

1. Parent brief and hard constraints respected.
2. Correct child identity/name.
3. Clear specific premise.
4. Architecture promise fulfilled.
5. Coherent major causal chain.
6. Meaningful progression.
7. No major unresolved contradiction.
8. Ending resolves the central narrative question.
9. Resolution is prepared rather than arbitrary.
10. Meaningful personalisation where input permits.
11. At least one developed memorable element.
12. Age-appropriate content and narrative complexity.
13. Read-aloud prose is clear.
14. Required technical structure is valid.

Failure of any critical item blocks final acceptance.

## 27. “Nonsense detector” diagnostic

Because the user's main complaint about current Moonbeam stories is grammatically correct but meaningless prose, Stage 4 adopts an explicit diagnostic:

> **Can a reader explain, in simple causal language, why each major event happened and what changed because of it?**

If not, the story should fail regardless of sentence-level polish.

A second diagnostic:

> **Could the middle pages be shuffled into another order without noticeably changing the story?**

If yes, and the story is not intentionally cumulative/patterned, the structure is probably weak.

## 28. Genericity detector

The validator should consider the combination of:

- generic premise;
- stock magical device;
- generic character behaviour;
- generic moral;
- interchangeable middle;
- generic ending.

No single one automatically fails a story.

However, when several occur together, the story should be rejected as insufficiently distinctive.

The purpose is to prevent a technically coherent but forgettable Moonbeam story.

## 29. Similarity and repetition across Moonbeam stories

Longer-term, if the product can access recent story metadata for the same child/account, validation should consider whether a new story is too similar to recent ones in:

- architecture;
- premise;
- central device;
- setting;
- companion type;
- resolution;
- memorable hook.

This is a diversity feature, not a requirement for the first engine refactor.

The system should not reject a parent's explicit request merely because it resembles an earlier story.

## 30. Architecture-specific validation

In addition to universal checks, each Stage 2 architecture should have specific acceptance questions.

### Quest
- Is the objective meaningful and clear?
- Does progress change over the journey?
- Does the ending resolve the objective?

### Voyage and Return
- Is the entered world meaningfully distinct?
- Does the experience develop rather than become sightseeing?
- Does the return matter?

### Mystery and Revelation
- Is there a clear question?
- Are clues/information fair?
- Does the revelation explain the earlier mystery?

### Escalating Chaos
- Does each escalation arise from prior events?
- Does intensity/comedy genuinely build?
- Is there a satisfying release/resolution?

### Rescue / Protect / Put-Right
- Is what needs help clearly established?
- Does the protagonist meaningfully contribute?
- Is the fate of the central concern resolved?

### Challenge / Contest / Performance
- Is the coming test clearly established?
- Does preparation/complication affect the outcome?
- Does the outcome carry story-specific meaning?

### Discovery and Exploration
- Does each discovery deepen/reframe what came before?
- Is there a satisfying deepest discovery or understanding?
- Is it more than a list of wonders/facts?

### Relationship and Reconciliation
- Do interactions actually change the relationship?
- Is change demonstrated in behaviour?
- Is reconciliation earned rather than declared?

### Transformation / Mastery
- Is the initial state clear?
- Does experience produce believable change?
- Does the ending demonstrate that change?

### Cumulative / Pattern and Payoff
- Is the pattern clear enough to anticipate?
- Does each recurrence add/alter something?
- Is there a genuine culmination or pattern break?

## 31. Validation should preserve story variety

Quality control must not accidentally force all stories toward the same shape.

The validator should test whether the chosen architecture succeeds **on its own terms**.

It must not reject:

- a quiet discovery story for lacking danger;
- a comic story for lacking emotional transformation;
- a cumulative story for repetition that is purposeful;
- a relationship story for lacking a villain;
- a bedtime story for having low external stakes.

Validation enforces quality, not uniformity.

## 32. Validation should not become censorship of creativity

Unexpected events, coincidence, surrealism, absurdity and magic can all be excellent.

The question is whether they are **intentional and narratively functional**.

For example:

- an absurd event in an escalating comedy may be excellent;
- the same event appearing solely to solve the climax may be a failure.

The validator should distinguish imaginative freedom from lazy plotting.

## 33. Cost-control design

The quality system should be designed so that most successful stories require:

- planning;
- one plan evaluation;
- writing;
- one final evaluation.

Repair/regeneration should be exceptional paths, not mandatory extra calls for every story.

Deterministic checks should run cheaply before semantic validation.

During implementation, benchmark whether plan generation + evaluation can safely be combined without reducing quality.

## 34. Logging for future improvement

The future engine should ideally record non-sensitive quality metadata such as:

- chosen architecture;
- validation outcome;
- reason for rejection;
- repair category;
- whether regeneration was needed;
- story length;
- age band.

This would make it possible to identify systematic failures such as:

- Mystery plans failing more often;
- rhyme stories needing more repairs;
- certain age bands receiving generic concepts.

No unnecessary personal story content needs to be retained for this diagnostic purpose.

## 35. Stage 4 acceptance philosophy

Moonbeam's validator should behave less like a proofreader and more like a **children's-book editor with veto power**.

Its job is not to admire fluency.

Its job is to prevent the product from publishing a story that is:

- incoherent;
- generic;
- causally empty;
- falsely personalised;
- unresolved;
- structurally repetitive;
- or memorable only because it makes no sense.

The core standard is:

> **A story advances only if its premise, architecture, causality, progression, personalisation, memorability and payoff work as a story—not merely as grammatical text.**

# Stage 5 — Writing Modes

**Status: COMPLETE — initial design baseline**

## 1. Purpose

Once a story plan has passed Stage 4, Moonbeam's writing layer converts that approved structure into finished child-facing text.

The writer's job is **not** to rediscover the plot.

Its job is to express the approved story:

- clearly;
- memorably;
- age-appropriately;
- naturally;
- with strong read-aloud flow;
- in the selected language;
- and in the selected writing mode.

The writing layer should add craft, voice, humour, dialogue, rhythm, imagery and emotional texture **without breaking the plan**.

## 2. Writing modes

Moonbeam should initially support two principal writing modes:

### Mode A — STORYBOOK PROSE

Natural children's-story prose with flexible sentence structure, dialogue, description and pacing.

This should remain the default mode.

### Mode B — RHYME & RHYTHM

A deliberately rhythmic, rhyming narrative mode designed for read-aloud performance.

This is not “write like” any living author or specific copyrighted work.

It is a Moonbeam-defined technical mode using:

- consistent rhythmic pulse;
- regular end-rhyme where appropriate;
- natural syntax;
- child-friendly vocabulary;
- refrain/pattern where useful;
- strong spoken cadence;
- disciplined rhyme quality;
- and preservation of the approved plot.

Other modes may be added later, but they should not be introduced until they have equally precise standards.

## 3. Shared rules across all writing modes

Every mode must preserve:

- approved premise;
- primary architecture;
- essential beats;
- central narrative question;
- protagonist agency;
- setup/payoff structure;
- world rules;
- character knowledge;
- parent constraints;
- selected meaningful personalisation;
- architecture-specific payoff;
- ending state;
- memorable element.

The writer may enrich scenes but should not invent a new major subplot, magical mechanism, companion, goal or resolution unless the plan explicitly allows it.

## 4. Storybook prose mode — style standard

Storybook prose should aim for:

- natural contemporary language;
- warmth without sentimentality;
- clarity without dullness;
- vividness without adjective overload;
- concise but meaningful description;
- dialogue where it improves character or movement;
- sentence variety;
- strong verbs;
- concrete imagery;
- emotional meaning shown through events where possible;
- humour arising from situation and character rather than forced jokes;
- a satisfying read-aloud cadence.

It should not sound like a school comprehension passage or generic AI bedtime text.

## 5. Storybook prose — paragraph discipline

Paragraphs should normally correspond to a meaningful unit of action, observation, dialogue or emotional shift.

Avoid:

- one enormous paragraph per page;
- constant one-sentence paragraphing;
- repeatedly restating what has just happened;
- explanatory paragraphs whose only purpose is to tell the reader the moral.

Paragraph length should adapt to age and page layout.

## 6. Storybook prose — sentence variety

The writer should vary:

- sentence length;
- openings;
- syntax;
- rhythm;
- balance of narration/dialogue.

However, variety should not become showy.

For younger children, shorter and more transparent sentence structures should dominate.

For older children, longer compound/complex sentences can be used where they remain easy to follow aloud.

## 7. Dialogue

Dialogue should have a function.

It may:

- reveal character;
- create humour;
- change a relationship;
- communicate necessary information;
- force a decision;
- sharpen conflict;
- deliver a clue;
- produce a payoff.

Avoid dialogue that merely repeats narration.

Characters should not all sound identical.

Younger-child dialogue should remain concrete and comprehensible.

## 8. Description

Description should do at least one useful thing:

- establish place;
- create mood;
- clarify action;
- support illustration;
- reveal character perception;
- set up later payoff;
- make a key moment memorable.

Avoid decorative description that delays the story.

A few precise details are preferable to long strings of adjectives.

## 9. Humour

Humour should be available in any architecture but not mandatory.

Possible sources include:

- character behaviour;
- escalation;
- timing;
- misunderstanding;
- contrast;
- repetition with variation;
- understatement;
- physical comedy;
- surprising but logical consequences;
- playful language.

Humour should not require cruelty, humiliation or age-inappropriate sarcasm.

The engine should not insert jokes merely because “children's stories should be funny.”

## 10. Emotional writing

Moonbeam should prefer **dramatised feeling** over explicit emotional labelling.

Prefer:

> Ava kept both hands on the handlebars even when the front wheel wobbled.

over:

> Ava felt very brave and determined.

Direct emotional language remains useful when natural, especially for younger children, but should not substitute for meaningful events.

## 11. Moral restraint

If the parent requested a value, the prose should let the value emerge through:

- decisions;
- consequences;
- relationships;
- action;
- changed understanding.

Avoid a final paragraph explaining the lesson unless the story form genuinely calls for explicit reflection.

If no value was requested, do not invent one automatically.

## 12. Opening prose

The opening should establish enough of the following quickly:

- protagonist;
- immediate situation;
- interesting detail;
- central curiosity/objective/problem;
- tone.

It need not begin with danger or action.

But it should avoid spending a large proportion of a short story on generic scene-setting before the story begins.

Avoid routine openings such as:

> “It was a beautiful sunny day…”

unless the weather is actually significant.

## 13. Page-turn writing

Moonbeam's book format should make page turns feel purposeful.

Where possible, a displayed section should end with:

- a changed situation;
- an unanswered question;
- a decision;
- a discovery;
- an approaching consequence;
- a comic setup;
- a quiet emotional beat;
- or a satisfying mini-payoff.

Not every page should use a cliffhanger.

The goal is forward pull, not artificial suspense.

## 14. Closing prose

The closing section should:

- deliver the planned resolution;
- let the reader feel its consequence;
- avoid over-explaining;
- avoid generic “best adventure ever” language;
- provide enough space for emotional closure.

A strong final line may:

- echo an earlier phrase;
- recontextualise an earlier detail;
- deliver a small joke;
- show a relationship change;
- return to a familiar image;
- suggest continuation without reopening the plot.

## 15. Age adaptation: principle

Age adaptation should affect **writing craft**, not merely vocabulary.

The same approved story plan may be told differently for a 5-year-old and a 10-year-old.

The writing layer should adapt:

- sentence length;
- syntax;
- paragraph length;
- vocabulary;
- explicitness;
- dialogue complexity;
- humour;
- figurative language;
- narrative distance;
- repetition;
- pace.

## 16. Younger-child prose

For younger children, favour:

- concrete language;
- short-to-medium sentences;
- clear subject/action relationships;
- fewer pronoun chains;
- repetition with purpose;
- recognisable patterns;
- direct emotional cues where needed;
- immediate cause and effect;
- limited simultaneous character complexity.

Do not equate young age with babyish language.

Avoid excessive diminutives, forced cuteness and patronising narration.

## 17. Middle-childhood prose

For middle childhood, allow:

- more varied sentence length;
- stronger dialogue;
- inference;
- subtler humour;
- richer description;
- more complex motives;
- mild ambiguity where clear in context;
- more layered setup/payoff.

The writer should still prioritise clarity and read-aloud fluency.

## 18. Older-child prose within Moonbeam's range

For older children, allow:

- more nuanced emotional language;
- more subtext;
- longer causal chains;
- more sophisticated humour;
- controlled figurative language;
- occasional withheld information for suspense/mystery;
- more complex sentence structures.

Avoid turning the voice into young-adult fiction if the product remains a picture/storybook format.

## 19. Vocabulary policy

Use the simplest word that best expresses the intended meaning, not automatically the shortest word.

Occasionally unfamiliar vocabulary is desirable when context makes it understandable.

The writer should not flatten language into only high-frequency words.

Distinctive nouns and verbs can make stories memorable.

## 20. Repetition

Repetition is powerful when intentional.

Use it for:

- cumulative structure;
- anticipation;
- humour;
- emotional emphasis;
- refrain;
- rhythm;
- participation;
- reinforcement for younger readers.

Avoid accidental repetition of:

- adjectives;
- emotional summaries;
- sentence openings;
- transition phrases;
- the child's name.

## 21. Personalisation in prose

The writer should preserve the planner's meaningful personalisation without over-signalling it.

Do not repeatedly remind the reader:

> “As someone who loved trains, Jamie…”

Instead, demonstrate the relevance naturally through what the child notices, knows, chooses or does.

The child should feel like the protagonist, not a personalised label pasted onto a generic manuscript.

## 22. Proper-name frequency

The child's name should be used naturally.

Avoid:

- name in almost every sentence;
- confusing pronoun stretches;
- repeated full names where ordinary narration would use “he/she/they”.

Exact name spelling remains a hard constraint.

## 23. Rhyme & Rhythm mode — purpose

Rhyme mode exists because strong rhythm, rhyme, repetition and anticipation can significantly improve memorability and read-aloud pleasure.

However:

> **Rhyme is a writing treatment applied to a good story, not a substitute for a good story.**

The approved plan must remain intact.

If preserving rhyme would require distorting plot logic, meaning, character behaviour or parent constraints, plot integrity wins.

## 24. Rhyme & Rhythm — structural principle

The writer should use a strong regular spoken pulse.

The default target should be a **bouncy stress-based children's narrative metre**, commonly using lines with roughly three or four strong beats.

The exact syllable count may vary slightly when natural speech requires it, but stressed beats should remain perceptibly regular.

The mode may often lean toward anapaestic movement:

**da-da-DUM / da-da-DUM / da-da-DUM**

but Moonbeam should not require every line to be mechanically identical.

The goal is a natural, predictable read-aloud rhythm rather than metrical perfection at the expense of language.

## 25. Rhyme scheme

Default behaviour should use clear end-rhyme in couplets or short alternating patterns.

The engine may vary rhyme scheme when needed for naturalness, but should avoid chaotic switching.

For example:

- AABB couplets;
- ABAB quatrains;
- occasional unrhymed refrain/transition where deliberate.

For the first implementation, **rhyming couplets should be the default** because they are easier for children to anticipate and easier to validate reliably.

## 26. Rhyme quality

Prefer:

- exact rhymes;
- strong natural near-rhymes where accent permits;
- syntactically natural line endings;
- meaningful words at rhyme positions.

Avoid:

- forced word order;
- archaic words inserted solely for rhyme;
- meaningless filler;
- repeating the same rhyme pair;
- rhymes that only work in one accent if the selected narration locale differs;
- grammatical distortion;
- changing story facts to obtain a rhyme.

A weak rhyme should be rewritten, not defended.

## 27. Meaning outranks rhyme

The hierarchy is:

1. Story coherence
2. Meaning
3. Natural language
4. Rhythm
5. Rhyme

A line that rhymes perfectly but makes little sense is a failure.

This rule directly addresses the risk of producing memorable-sounding nonsense.

## 28. Line integrity

Each rhyming line should normally express a complete or naturally continued thought.

Avoid splitting sentences at bizarre points merely to preserve metre.

Line breaks should support speech rhythm.

Punctuation should reflect actual spoken phrasing.

## 29. Rhyme-mode plot compression

Because verse takes more space to express the same information, rhyme mode may require slightly simpler sentence-level expression.

It must **not** remove essential beats.

If length constraints become tight:

- compress description first;
- remove redundant explanation;
- simplify wording;
- preserve causal events, setup/payoff and climax.

Do not delete necessary story logic to fit rhyme.

## 30. Refrains

Rhyme mode may use a recurring refrain when it supports the architecture.

Best suited to:

- cumulative stories;
- quests;
- escalating chaos;
- repeated attempts;
- comic anticipation.

A refrain should evolve or gain meaning when possible.

Avoid inserting a refrain merely because rhyming books often have one.

## 31. Rhyme-mode validator requirements

In addition to Stage 4 checks, rhyme mode should validate:

- rhyme presence and consistency;
- rhyme naturalness;
- approximate stress regularity;
- spoken cadence;
- forced syntax;
- repeated rhyme words;
- meaning preservation;
- pronunciation compatibility with selected language/accent;
- punctuation/read-aloud phrasing.

Weak lines should undergo **line-level repair** where possible rather than regenerating the entire story.

If rhyme causes repeated semantic damage, the story should fail rhyme mode rather than publish poor verse.

## 32. Rhyme-mode narration

Narration must use a mode-specific delivery profile.

The current generic instruction to avoid “sing-song” delivery is appropriate for prose but conflicts with rhythmic verse if interpreted too strongly.

Rhyme narration should instead aim for:

- clear natural metre;
- subtle rhythmic lift;
- expressive but not exaggerated delivery;
- meaningful pauses at punctuation and stanza boundaries;
- preservation of rhyme without over-performing it;
- natural word stress;
- no nursery-rhyme caricature unless specifically intended.

The goal is **musical speech**, not chanting.

## 33. Visible text and narrated text

The visible story and spoken narration should normally contain the same words.

Narration quality should be controlled through:

- punctuation;
- line breaks;
- prosody instructions;
- voice selection;
- pace.

Avoid hidden alternate spoken wording because that complicates product trust and synchronisation.

## 34. Prose-mode narration

For prose, the narrator should retain the existing principle of:

- warm children's-audiobook delivery;
- natural regional pronunciation;
- conversational phrasing;
- subtle character expression;
- clear diction;
- no theatrical overacting;
- no robotic pacing.

Narration instructions may adapt slightly by story tone.

A mystery can carry more anticipation; a comic story slightly quicker timing; a quiet bedtime story gentler pacing.

## 35. Language and localisation principle

Moonbeam should generate the finished story directly in the selected language where model quality is sufficient.

It should not ordinarily:

> write the English story → mechanically translate it

because translation can damage:

- natural dialogue;
- humour;
- rhyme;
- idiom;
- metre;
- age suitability.

The approved plan can remain language-neutral in structure, but the writer should realise it natively in the target language.

## 36. Multilingual prose

For prose mode, each language should aim for natural children's literature in that language rather than preserving English syntax.

Localisation should respect:

- idiom;
- punctuation conventions;
- dialogue conventions;
- natural forms of address;
- grammatical gender where relevant;
- age-appropriate vocabulary;
- regional variant selected by product.

The story facts and causal structure remain stable.

## 37. Multilingual rhyme

Rhyme cannot be safely translated line-for-line.

For rhyme mode, the writer should **re-compose the verse in the target language from the approved plan**.

The translated-language rhyme version may therefore use different:

- line wording;
- rhyme pairs;
- sentence boundaries;
- refrain phrasing;
- minor descriptive details.

It must preserve:

- premise;
- beats;
- meaning;
- character actions;
- setup/payoff;
- ending;
- personalisation.

The quality target is equivalent verse, not literal equivalence.

## 38. Language-specific rhyme availability

Rhyme mode should only be offered in a language when Moonbeam can produce and validate reliable read-aloud verse in that language.

It is better to support fewer languages well than claim a rhyme mode that produces poor or unnatural verse.

Implementation testing should determine the initial supported set.

## 39. Cultural localisation

Moonbeam may adapt minor culturally dependent details where necessary for naturalness, but should not silently relocate or rewrite a parent-specified setting.

Examples of safe adaptation:

- units;
- ordinary vocabulary variants;
- school terminology;
- everyday idiom.

Major cultural changes belong in the plan, not the writer.

## 40. Tone handling

Tone is an overlay, not a plot architecture.

Examples:

- funny;
- cosy;
- adventurous;
- mysterious;
- gentle;
- exciting;
- whimsical;
- thoughtful.

The writer should express tone through:

- pacing;
- diction;
- dialogue;
- imagery;
- sentence rhythm;
- comic timing;
- narrative distance.

Tone should not cause the writer to invent incompatible plot events.

## 41. “Bedtime” handling

Bedtime is primarily the **reading occasion**, not automatically the story setting.

A bedtime story does not need:

- moonlight;
- sleepy animals;
- stars;
- pyjamas;
- dreams;
- night-time adventure.

If a calming bedtime tone is selected, the writer can reduce intensity toward the end and favour satisfying closure, but should preserve the chosen premise and architecture.

## 42. Tension and intensity

Tension should be age-appropriate.

Possible tension sources include:

- uncertainty;
- time pressure;
- embarrassment;
- challenge;
- separation;
- mystery;
- comic anticipation;
- mild danger.

The writer should not artificially increase peril because adventure prose “needs excitement.”

## 43. Action clarity

Physical action should be easy to visualise.

Avoid sequences where:

- geography becomes impossible;
- characters teleport between positions;
- pronouns obscure who did what;
- action verbs are vague;
- multiple simultaneous movements overload the page.

Clear action improves both reading and illustration prompting.

## 44. Illustration handoff

The writer should output scene text that remains faithful to the approved visual beat.

The illustration system should derive from:

- story plan;
- final scene text;
- character bible;
- visual notes.

The writer should not insert visual spectacle solely to improve the image.

## 45. Character voice consistency

Recurring characters should have stable speech tendencies where appropriate.

This may include:

- vocabulary level;
- confidence;
- humour;
- directness;
- formality;
- recurring verbal habit.

Avoid exaggerated catchphrases unless intentional.

The personalised child should not be assigned an unrealistic adult voice.

## 46. Exposition discipline

World rules and background should be introduced only when needed.

Prefer:

- demonstration;
- discovery;
- dialogue with purpose;
- consequence.

Avoid paragraphs explaining a fantastical system before the child has any reason to care.

## 47. Figurative language

Use metaphor, simile, sound pattern and personification selectively.

They should sharpen an image or mood.

Avoid chains of decorative comparisons.

For younger children, comparisons should be concrete and comprehensible.

## 48. Sound play

Alliteration, internal rhyme, onomatopoeia and sound effects can improve read-aloud quality.

Use selectively in prose and more freely in rhyme mode.

Sound play should serve:

- humour;
- action;
- atmosphere;
- character;
- memorability.

Avoid making every line conspicuously “writerly.”

## 49. Titles

The title should normally emerge after the story plan is known.

A good title should be:

- specific;
- memorable;
- easy to say;
- age-appropriate;
- connected to the actual story.

Avoid generic titles such as:

- “Sophie's Magical Adventure”
- “Jack's Amazing Journey”
- “The Wonderful Day”

unless genuinely justified by the premise.

The title may reference:

- central object;
- mystery;
- place;
- comic problem;
- key character;
- memorable phrase.

## 50. Length and pacing

Requested length should control total word budget without creating filler.

When expanding a story:

- deepen meaningful scenes;
- add consequence;
- add dialogue;
- enrich character interaction;
- develop setup/payoff;
- allow emotional moments to breathe.

Do not simply add more obstacles.

When shortening:

- remove redundant description;
- compress transitions;
- reduce secondary dialogue;
- retain causal spine and payoff.

## 51. Page balance

Displayed pages should be reasonably balanced, but exact equality is not more important than storytelling.

A climax may deserve more text.

A reveal may work with less.

The writer should avoid one nearly empty page followed by one overloaded page unless intentionally designed.

## 52. Writer freedom

Once the plan is approved, the writer retains freedom over:

- exact wording;
- dialogue;
- imagery;
- jokes;
- sentence rhythm;
- paragraphing;
- transitions;
- small physical actions;
- sensory detail.

It does not have freedom to change:

- core premise;
- architecture;
- important causal events;
- resolution mechanism;
- hard parent constraints.

This creates a clean boundary between planning and writing.

## 53. Anti-imitation / originality rule

Moonbeam may use general literary techniques such as:

- rhyme;
- metre;
- repetition;
- cumulative structures;
- comic escalation;
- dialogue;
- refrains;
- read-aloud rhythm.

It should not instruct the model to imitate a living author or reproduce distinctive wording, characters, plots or passages from existing works.

Moonbeam should describe its own desired mechanics directly.

## 54. Final writing-mode quality question

Before final acceptance, the writing layer should answer:

### For prose:
> “Does this sound like a naturally written children's story that is enjoyable to read aloud, while faithfully telling the approved story?”

### For rhyme:
> “Does this sound like natural, rhythmic children's verse whose rhyme strengthens the story rather than distorting it?”

If the answer depends on overlooking awkward language, forced rhyme or broken logic, the story is not ready.

## 55. Stage 5 initial product recommendation

For the first implementation of the redesigned Story Engine:

- **Storybook Prose** should remain the default.
- **Rhyme & Rhythm** should be an explicit optional writing mode.
- Both use the same planning architectures and quality gates.
- Rhyme receives additional metre/rhyme validation and different narration prosody.
- Do not create separate “rhyming plot types.” Architecture remains independent from surface form.

This preserves product simplicity while allowing rhyme to become a genuine quality feature rather than a novelty toggle.

## 56. Stage 5 completion standard

The complete Moonbeam Story Engine now has five conceptually distinct layers:

1. **Quality definition** — what a good Moonbeam story is.
2. **Narrative architecture** — what deep shape the story uses.
3. **Planning system** — invent and structure the story before writing.
4. **Quality gates** — reject or repair weak plans/stories.
5. **Writing modes** — express the approved story as excellent prose or verse.

The redesign is therefore ready to move from **product/story design** to **technical implementation design and code audit**.

---

# Decision Log

## Stage 1
- Story quality is defined independently of any single plot structure.
- Coherence is mandatory; conventional conflict is not.
- Memorability is an explicit product requirement.
- Personalisation must affect story mechanics rather than merely surface details.
- Surprise is desirable, but arbitrary randomness is a failure.
- Values/morals are optional unless requested and should emerge through events.
- Age adaptation concerns narrative sophistication as well as language.
- Read-aloud quality is part of the product standard.
- The “retelling test” is adopted as a conceptual measure of story distinctiveness and coherence.
- Stage 1 intentionally leaves narrative families undefined; those belong to Stage 2.

## Stage 2
- Moonbeam will use its own children's-story architecture taxonomy rather than implementing an existing literary taxonomy literally.
- Ten primary architectures are adopted as the initial baseline.
- Subject matter, tone and devices such as “secret world,” magical objects and time travel are not architectures.
- Every generated story has one primary architecture.
- One secondary architecture may be used where justified; short/younger stories should generally use one.
- Parent-supplied story ideas take precedence over architecture selection.
- Architecture determines the type of narrative progression and promised payoff, not a fixed sequence of beats.
- Architecture-specific payoff is mandatory.
- The system explicitly distinguishes structure from formula.
- Tragedy is not a standard Moonbeam architecture.
- Stage 3 will determine how original story plans are generated inside these architectures.

## Stage 3
- Story invention and prose writing are logically separated.
- Parent input is classified as Parent-defined, Parent-guided, or Surprise-me.
- Parent-guided and Surprise-me stories normally generate three competing concepts before full plotting.
- Candidate concepts compete on coherence, distinctiveness, personalisation, architecture fit, payoff, age fit, read-aloud appeal and non-genericity.
- A premise gate rejects concepts that cannot be described specifically and compellingly.
- The selected concept is expanded first into a Story Spine and then causal beats.
- Major beats explicitly track cause and consequence.
- Protagonist agency is expected where age and premise allow, without requiring children to solve everything alone.
- Meaningful personalisation is explicitly mapped to story function.
- Setup/payoff, character knowledge and world rules are tracked when relevant.
- The memorable element is deliberately designed during planning.
- The ending is planned before the opening prose is written.
- Illustration opportunities are planned without allowing illustration needs to distort story logic.
- Narrative beats are created before they are mapped to fixed product pages.
- Compression and remove-one-beat tests are adopted as planning diagnostics.
- Planning must remain compact enough to preserve prose creativity.
- Logical stages do not imply one API call per stage; implementation should minimise cost and latency while preserving separation of concerns.
- Parent premise fidelity outranks novelty.

## Stage 4
- Validation occurs at both plan and final-story stages.
- Validator outcomes are PASS, REPAIR, or REJECT/REGENERATE.
- Hard failures block progression and cannot be offset by high scores elsewhere.
- Bad premises and structurally broken plots are regenerated, not endlessly patched.
- One targeted repair attempt is the normal maximum before revalidation/regeneration.
- Architecture-specific validation supplements universal quality checks.
- Deterministic checks should handle schema/name/page-count/formatting issues where possible.
- Semantic model validation is reserved for coherence, causality, payoff, memorability, personalisation and similar qualitative judgements.
- A blended quality score must never allow a critical structural failure to pass.
- Explicit “nonsense detector,” retelling, shuffle-the-middle and genericity diagnostics are adopted.
- Final acceptance occurs before illustration/narration.
- Validation must judge each architecture on its own terms and must not force all stories toward conventional conflict or one formula.
- Quality-control metadata may be logged for future engine improvement without retaining unnecessary personal story content.

## Stage 5
- Storybook Prose remains the default writing mode.
- Rhyme & Rhythm becomes a first-class optional writing mode rather than a universal default.
- Both modes consume the same approved story plan; rhyme does not have separate plot architecture.
- Plot/meaning outrank metre and rhyme.
- Default rhyme implementation should favour strong stress-based rhythm and rhyming couplets for reliability.
- Rhyme requires additional validation for cadence, rhyme quality, forced syntax and pronunciation.
- Rhyme narration gets its own prosody profile; prose narration's anti-sing-song instruction should not be applied unchanged.
- Visible and narrated wording should normally remain identical.
- Age adaptation changes narrative prose craft, not only vocabulary.
- Humour, description, dialogue, emotional writing and tone are overlays that must serve the approved plan.
- Bedtime is treated as a reading occasion, not an automatic fictional setting.
- Finished stories should be generated natively in the target language where possible rather than mechanically translated from English.
- Rhyming versions must be re-composed in each target language rather than translated line-for-line.
- Rhyme mode should only be offered in languages that can be validated to an acceptable standard.
- Titles should be specific to the actual story and generated after the premise/plan is known.
- Anti-imitation rule remains explicit: Moonbeam defines its own writing mechanics rather than naming living authors.
- With Stage 5 complete, the Story Engine design phase is ready for technical implementation design and audit of the current codebase.
