const { randomInt } = require('crypto');

const ARCHITECTURES = [
  ['QUEST','The Quest','A meaningful objective requires purposeful progress toward an outcome.'],
  ['VOYAGE_RETURN','Voyage and Return','The child enters an unfamiliar environment, experiences it meaningfully, then returns with changed understanding.'],
  ['MYSTERY','Mystery and Revelation','A clear question is answered through fair clues, changing beliefs and an earned revelation.'],
  ['ESCALATING_CHAOS','Escalating Chaos','One situation causes progressively larger or funnier consequences that remain causally connected.'],
  ['RESCUE','Rescue / Protect / Put-Right','Something valued needs help, protection, repair or restoration and the child materially contributes.'],
  ['CHALLENGE','Challenge / Contest / Performance','A defined coming test creates anticipation through preparation, complication and outcome.'],
  ['DISCOVERY','Discovery and Exploration','Curiosity drives increasingly meaningful discovery rather than conventional conflict.'],
  ['RELATIONSHIP','Relationship and Reconciliation','The central change is between characters and is demonstrated through interaction and choice.'],
  ['TRANSFORMATION','Transformation / Mastery','Experience changes capability, understanding, confidence or approach, demonstrated in action.'],
  ['CUMULATIVE','Cumulative / Pattern and Payoff','Purposeful repetition accumulates, varies and culminates in a satisfying payoff.']
];

const architectureText = ARCHITECTURES.map(([id,name,desc])=>`${id} — ${name}: ${desc}`).join('\n');

const inspirationSettings = [
  'a railway station','a harbour','a family picnic','a museum before opening','a fossil beach','a woodland trail',
  'a wildlife reserve','a science fair','a sports club','a theatre rehearsal','a community garden','a ferry terminal',
  'a model railway club','an old watermill','a rooftop greenhouse','a coastal village','a library event','a swimming gala',
  'a repair workshop','a holiday cottage','an observatory','a market','a campsite','a canal towpath'
];
const inspirationDomains = [
  'ordinary practical problem','family or neighbourhood comedy','nature observation','making or repairing something',
  'sport or performance','logical mystery','exploration','relationship change','scientific discovery','transport',
  'history-flavoured everyday life','gentle surrealism','science fiction','fantasy with one clear rule'
];

function randomChoice(items){ return items[randomInt(items.length)]; }
function createVarietySeed(){
  return {
    settingInspiration: randomChoice(inspirationSettings),
    domainInspiration: randomChoice(inspirationDomains),
    contrastInspiration: randomChoice([
      'small problem, surprisingly clever solution',
      'ordinary place, unusual but plausible situation',
      'quiet beginning, comic escalation',
      'mistaken assumption corrected by observation',
      'something overlooked early becomes useful later',
      'two apparently separate problems share one cause',
      'the child notices what others miss',
      'success means something different by the end'
    ])
  };
}

function makePlanningPrompt(ctx){
  const hasIdea = !!ctx.storyIdea;
  return `You are the hidden story planner for Moonbeam Stories. You are NOT writing prose for the child yet.

Your task is to invent and structure a genuinely good children's story BEFORE any story prose is written.

CHILD AND PRODUCT CONSTRAINTS
Exact protagonist name: ${ctx.name}
Age: ${ctx.age}
Age band: ${ctx.ageBand} (${ctx.ageLabel})
Age-writing guidance: ${ctx.ageWriting}
Permitted stakes: ${ctx.ageStakes}
Forbidden themes/mechanisms: ${ctx.ageForbidden}
Language later used by writer: ${ctx.language}
Parent story idea: ${ctx.storyIdea || 'BLANK — Surprise me'}
Things to avoid: ${ctx.dislikes || 'nothing specific'}
Selected tone: ${ctx.selectedTone}
Values: ${ctx.valuesText}
Length format: six displayed reading sections total (opening + four middle sections + closing), about ${ctx.totalWords}.
Writing mode later: ${ctx.writingMode}.

INPUT MODE
${hasIdea
? `The parent supplied an idea. Classify it internally as PARENT_DEFINED if it already contains a reasonably specific premise, otherwise PARENT_GUIDED. Preserve the parent's central premise. Do not replace it with a competing story. If it is only loose ingredients, consider three genuinely different treatments that all honour those ingredients.`
: `This is SURPRISE_ME. Create THREE genuinely different compact candidate concepts before selecting one. They should differ at the story-idea level, normally including different compatible primary architectures. At least one candidate must be STRICT_REALISM. Do not default to magic, quests, glowing objects, secret doors, wise talking animals or friendship morals.`}

OPTIONAL DIVERSITY INSPIRATION FOR BLANK/LOOSE INPUT
These are sparks, not hard constraints. Ignore them if they make the story worse or conflict with the parent.
Setting spark: ${ctx.varietySeed.settingInspiration}
Domain spark: ${ctx.varietySeed.domainInspiration}
Contrast spark: ${ctx.varietySeed.contrastInspiration}

MOONBEAM ARCHITECTURES
Choose exactly one PRIMARY architecture. A SECONDARY architecture is optional and should be used only when it genuinely strengthens the short story.
${architectureText}

UNIVERSAL STORY STANDARD
- The story must be coherent, age-appropriate and genuinely personalised.
- Events must connect through cause, consequence, discovery, deliberate pattern or meaningful character choice; avoid arbitrary "and then" succession.
- Every substantial beat must have a narrative function. Quiet emotional development and purposeful repetition count.
- Prominent objects, clues, rules, abilities and information should have a purpose or payoff.
- Coincidence may start a story but should rarely solve its central problem.
- The ending must grow from earlier events and fulfil the PRIMARY architecture's promise.
- Design at least one story-specific memorable element that is developed, not merely mentioned.
- Personal details should affect premise, decisions, knowledge, relationships, humour, setting or payoff. Do not force every detail.
- The child should materially affect the story where age and premise allow, without having to solve everything alone.
- If fantasy/science-fiction/surreal rules exist, keep them few and internally consistent.
- Do not imitate any existing author or book.

IMPORTANT SEPARATION OF CONCERNS
Do NOT change the story simply to create different illustrations. First make the story work as a story. After the six meaningful narrative sections are mapped, give each section a visual opportunity that depicts that actual beat. Visual variety may come from framing, action, viewpoint, scale, expression or focus; it must never force arbitrary plot, location or character changes.

PREMISE GATE
The selected concept must be describable specifically in one or two sentences without relying on vague words such as "adventure", "magical", "amazing" or "learns an important lesson".

PLAN THE ENDING BEFORE THE OPENING PROSE
Know exactly how the architecture pays off, what is different at the end, and which earlier setup contributes.

OUTPUT VALID JSON ONLY with this exact top-level shape:
{
  "input_mode":"PARENT_DEFINED|PARENT_GUIDED|SURPRISE_ME",
  "candidate_concepts":[
    {
      "premise":"string",
      "primary_architecture":"one architecture ID above",
      "central_narrative_question":"string",
      "personalisation_hook":"string",
      "memorable_hook":"string",
      "likely_payoff":"string",
      "reality_mode":"STRICT_REALISM|ONE_IMPOSSIBLE_RULE|SCIENCE_FICTION|FANTASY"
    }
  ],
  "selected_concept_index":0,
  "plan":{
    "premise":"string",
    "primary_architecture":"architecture ID",
    "secondary_architecture":"architecture ID or NONE",
    "architecture_promise":"string",
    "story_identity":"string",
    "central_narrative_question":"string",
    "starting_state":"string",
    "stakes":"string",
    "narrative_engine":"string",
    "progression_principle":"string",
    "turning_point":"string",
    "climax_or_deepest_payoff":"string",
    "ending_state":"string",
    "intended_emotional_note":"string",
    "memorable_element":"string",
    "surprise_design":"string or NONE",
    "personalisation_map":[{"detail":"string","function":"string"}],
    "setup_payoff_ledger":[{"setup":"string","payoff":"string"}],
    "character_knowledge":[{"character":"string","knowledge_progression":"string"}],
    "world_rules":["string"],
    "retelling_sentence":"It was the one where...",
    "display_beats":[
      {
        "section":"OPENING|MIDDLE_1|MIDDLE_2|MIDDLE_3|MIDDLE_4|CLOSING",
        "narrative_function":"string",
        "what_happens":"string",
        "cause_or_connection":"string",
        "what_changes":"string",
        "setup_or_payoff":"string",
        "reader_effect":"string",
        "visual_opportunity":"string"
      }
    ]
  }
}

The plan.display_beats array MUST contain exactly six entries in the order OPENING, MIDDLE_1, MIDDLE_2, MIDDLE_3, MIDDLE_4, CLOSING.
For PARENT_DEFINED input, candidate_concepts may contain only one concept. For PARENT_GUIDED or SURPRISE_ME, normally return three.
Do not write the finished story.`;
}

function makePlanValidationPrompt(ctx, planner){
  return `You are Moonbeam's critical children's-book story editor. Evaluate the HIDDEN PLAN below. Do not praise it and do not write story prose.

HARD CONSTRAINTS
Child exact name: ${ctx.name}
Age: ${ctx.age} (${ctx.ageBand})
Parent idea: ${ctx.storyIdea || 'blank / surprise me'}
Avoid: ${ctx.dislikes || 'nothing specific'}
Age guidance: ${ctx.ageWriting}
Forbidden: ${ctx.ageForbidden}

CHECK AS GATES, NOT AS AVERAGED SCORE
1. Specific premise, not vague generic "adventure".
2. Correct architecture fit and architecture-specific payoff.
3. Causal coherence: major beats connect through cause/consequence/discovery/choice/pattern.
4. Progression: middle beats are not interchangeable filler.
5. Setup/payoff fairness; no deus-ex-machina ending.
6. Ending resolves the central narrative question and grows from prior events.
7. Meaningful personalisation where input permits.
8. Protagonist agency where appropriate.
9. At least one developed memorable element.
10. Age fit and parent fidelity.
11. Avoid stacked AI clichés and arbitrary magical devices.
12. Visual notes do not distort plot.
13. Nonsense detector: a reader can explain why each major event happens and what changes.
14. Shuffle test: unless intentionally cumulative/patterned, reordering the middle would damage logic.

OUTPUT VALID JSON ONLY:
{
 "outcome":"PASS|REPAIR|REJECT",
 "hard_failures":["string"],
 "soft_failures":["string"],
 "recommended_repairs":["string"],
 "return_to":"PLAN|NONE"
}

Use REPAIR only for local defects that can be fixed without changing the central premise, primary architecture or majority of beats. Use REJECT for fundamental weakness.

PLAN:
${JSON.stringify(planner)}`;
}

function makePlanRepairPrompt(ctx, planner, findings){
  return `Repair this Moonbeam hidden story plan using ONLY the editor findings below. Preserve the parent brief, selected premise and primary architecture unless the findings explicitly require regeneration. Do not write story prose. Return the complete repaired planner JSON in the exact same shape as the original.

CHILD: ${ctx.name}, age ${ctx.age}
PARENT IDEA: ${ctx.storyIdea || 'blank / surprise me'}
AGE RULES: ${ctx.ageWriting} Forbidden: ${ctx.ageForbidden}

EDITOR FINDINGS:
${JSON.stringify(findings)}

CURRENT PLAN:
${JSON.stringify(planner)}`;
}

function makeWriterPrompt(ctx, planner){
  const plan = planner.plan;
  const mode = ctx.writingMode === 'rhyme'
    ? `RHYME & RHYTHM MODE
Write lively original rhyming narrative verse with a strong regular spoken pulse, normally about three or four strong beats per line and primarily rhyming couplets. Natural language outranks rhyme. Hierarchy: story coherence > meaning > natural language > rhythm > rhyme. Never distort facts, syntax or character behaviour for a rhyme. Avoid filler, forced inversions and archaic rhyme words. Punctuation and line breaks must support natural read-aloud phrasing.`
    : `STORYBOOK PROSE MODE
Write natural contemporary children's-story prose: warm without sentimentality, vivid without adjective overload, clear without dullness. Use strong verbs, concrete detail, purposeful dialogue, sentence variety and natural read-aloud cadence. Show emotion through action where possible. Avoid generic AI moralising and decorative padding.`;

  return `You are the Moonbeam story WRITER. The story has already been planned and approved. Your job is to tell THAT story beautifully, not to invent a different plot.

CHILD
Exact protagonist name: ${ctx.name}
Age: ${ctx.age}
Language: ${ctx.language}
Language guidance: ${ctx.languageGuide}
Tone: ${ctx.selectedTone}
Tone guidance: ${ctx.toneGuide}
Values: ${ctx.valuesText}
Avoid: ${ctx.dislikes || 'nothing specific'}

AGE-SUITABILITY — HARD CONSTRAINT
${ctx.ageWriting}
Permitted stakes: ${ctx.ageStakes}
Explicitly excluded: ${ctx.ageForbidden}

${mode}

WRITER BOUNDARY
Preserve the approved premise, primary architecture, essential causal events, setup/payoff, world rules, meaningful personalisation, architecture payoff and ending. You MAY choose exact wording, dialogue, imagery, humour, transitions and small physical actions. Do NOT add a new major subplot, magical mechanism, companion, goal or resolution.

BEDTIME
This may be read at bedtime, but bedtime is the reading occasion, not the fictional setting. Do not default to night, moonlight, stars, sleep, bedrooms or pyjamas.

PAGE MAPPING
The planner first designed the whole story, then mapped it to six meaningful display beats. Follow that mapping. Each section must serve its assigned narrative function, but visual variety must NOT force new plot events or arbitrary location changes.

READ-ALOUD QUALITY
Use natural phrasing, clear pronouns, manageable sentence lengths for age ${ctx.age}, purposeful repetition only, and no explicit moral unless requested. Avoid stock phrases such as "best adventure ever", "friendship was the greatest magic", or "from that day on ... could do anything" unless uniquely earned.

ORIGINALITY
Do not imitate or reproduce the wording, characters, plots or distinctive passages of any existing author or book. Do not mention authors or literary styles.

LENGTH AND FORMAT — HARD PRODUCT CONSTRAINTS
Six displayed text sections total.
Opening: approximately 105-125 words.
Each of four page.text fields: approximately 105-125 words.
Closing: approximately 90-115 words.
Overall target: ${ctx.totalWords}.
Do not pad merely to hit length.

ILLUSTRATION DIRECTIONS
Each middle page needs one illustration_prompt describing the actual story beat and a visually useful composition. It may vary framing/viewpoint/action/focus, but MUST NOT invent or alter story events merely to be visually different. Do not specify art style.

RECURRING CHARACTER BIBLE
Create one concise, precise character_bible for recurring characters for visual continuity. For every recurring non-photo human include exact age, stable physical features and fixed clothing. For recurring animals/robots/fantastical beings give fixed species/body/material/colour/size/features. For the photographed main child, do not invent conflicting facial features; record story clothing/continuity only.

APPROVED HIDDEN PLAN
${JSON.stringify(plan)}

OUTPUT VALID JSON ONLY with exactly:
{"title":"string","opening":"string","character_bible":"string","pages":[{"text":"string","illustration_prompt":"string"},{"text":"string","illustration_prompt":"string"},{"text":"string","illustration_prompt":"string"},{"text":"string","illustration_prompt":"string"}],"closing":"string"}

The title must be specific to this actual story, easy to say and age-appropriate. Use the exact supplied child name if the child's name appears; never invent a surname, nickname or alternative form.`;
}

function makeStoryValidationPrompt(ctx, planner, story, deterministicIssues=[]){
  return `You are Moonbeam's final children's-book editor. Decide whether this finished story is publishable. Be critical. Do not rewrite it.

CHILD: ${ctx.name}, age ${ctx.age}
PARENT IDEA: ${ctx.storyIdea || 'blank / surprise me'}
LANGUAGE: ${ctx.language}
WRITING MODE: ${ctx.writingMode}
AGE GUIDANCE: ${ctx.ageWriting}
FORBIDDEN: ${ctx.ageForbidden}

APPROVED PLAN:
${JSON.stringify(planner.plan)}

STORY:
${JSON.stringify(story)}

DETERMINISTIC WARNINGS:
${JSON.stringify(deterministicIssues)}

CHECK AS GATES
- exact parent brief and child identity;
- approved premise/architecture/essential beats preserved;
- causal clarity and continuity;
- every section has meaningful progression or purposeful pattern;
- setup/payoff and world rules;
- ending resolves the central narrative question without deus ex machina;
- personalisation remains meaningful;
- memorable element actually developed;
- age fit;
- read-aloud naturalness;
- no confusing pronouns/geography;
- no repetitive filler or generic moral summary;
- title specific rather than generic;
- illustration prompts reflect actual beats and do not invent events merely for variety.
${ctx.writingMode === 'rhyme' ? '- rhyme is natural, meaning-preserving and rhythmically readable; flag forced syntax/rhyme or semantic distortion.' : ''}

NONSENSE DETECTOR: Can a reader explain why each major event happened and what changed because of it?
SHUFFLE TEST: Unless intentionally cumulative/patterned, would reordering middle sections damage logic?
GENERICITY TEST: Do generic premise + stock device + interchangeable middle + generic moral/ending accumulate into forgettable AI text?

OUTPUT VALID JSON ONLY:
{
 "outcome":"PASS|REPAIR|REJECT",
 "hard_failures":["string"],
 "soft_failures":["string"],
 "repair_instructions":["string"],
 "return_to":"WRITER|PLAN|NONE"
}

REPAIR means local correction. REJECT means the finished story is structurally unacceptable or no longer faithfully executes the plan.`;
}

function makeStoryRepairPrompt(ctx, planner, story, findings){
  return `You are repairing a Moonbeam story after editorial validation. Make ONLY the changes needed to address the exact findings. Preserve unaffected wording and the approved plot wherever possible. Do not introduce new characters, rules, objects, subplots or a new resolution unless an editor finding explicitly requires it.

CHILD: ${ctx.name}, age ${ctx.age}
LANGUAGE: ${ctx.language}
AGE RULES: ${ctx.ageWriting} Forbidden: ${ctx.ageForbidden}
PARENT IDEA: ${ctx.storyIdea || 'blank / surprise me'}

APPROVED PLAN:
${JSON.stringify(planner.plan)}

EDITOR FINDINGS:
${JSON.stringify(findings)}

CURRENT STORY:
${JSON.stringify(story)}

Return VALID JSON ONLY with exactly:
{"title":"string","opening":"string","character_bible":"string","pages":[{"text":"string","illustration_prompt":"string"},{"text":"string","illustration_prompt":"string"},{"text":"string","illustration_prompt":"string"},{"text":"string","illustration_prompt":"string"}],"closing":"string"}

Keep exactly four middle pages. Maintain approximately 105-125 words in opening and each middle page, 90-115 in closing, but do not damage meaning merely to hit a number.`;
}

function wordCount(value){
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function deterministicStoryIssues(story, ctx){
  const issues = [];
  if (!story || typeof story !== 'object') return ['Story is not an object.'];
  if (!story.title) issues.push('Missing title.');
  if (!story.opening) issues.push('Missing opening.');
  if (!story.closing) issues.push('Missing closing.');
  if (!Array.isArray(story.pages) || story.pages.length !== 4) issues.push('Story must contain exactly four middle pages.');
  const all = [story.title, story.opening, ...(Array.isArray(story.pages)?story.pages.map(p=>p&&p.text):[]), story.closing].join(' ');
  const exactName = String(ctx.name);
  if (!all.includes(exactName)) issues.push('Exact child name is absent from story text/title.');
  const screens = [story.opening, ...(Array.isArray(story.pages)?story.pages.map(p=>p&&p.text):[]), story.closing];
  const counts = screens.map(wordCount);
  const totalWords = counts.reduce((a,b)=>a+b,0);
  if (totalWords < 540 || totalWords > 850) issues.push(`Total story length is ${totalWords} words; outside broad quality bounds 540-850.`);
  const normalisedScreens = screens.map(x=>String(x||'').replace(/\s+/g,' ').trim().toLowerCase());
  for (let i=1;i<normalisedScreens.length;i++) {
    if (normalisedScreens[i] && normalisedScreens[i] === normalisedScreens[i-1]) issues.push(`Displayed sections ${i} and ${i+1} are duplicates.`);
  }
  counts.forEach((n,i)=>{
    const min = i===screens.length-1 ? 70 : 80;
    const max = i===screens.length-1 ? 140 : 150;
    if (n < min || n > max) issues.push(`Displayed section ${i+1} has ${n} words; outside broad quality bounds ${min}-${max}.`);
  });
  if (Array.isArray(story.pages)) {
    story.pages.forEach((p,i)=>{
      if (!p || !String(p.text||'').trim()) issues.push(`Middle page ${i+1} has no text.`);
      if (!p || !String(p.illustration_prompt||'').trim()) issues.push(`Middle page ${i+1} has no illustration_prompt.`);
    });
  }
  return issues;
}

function normalisePlanner(value){
  if (!value || typeof value !== 'object' || !value.plan || typeof value.plan !== 'object') return null;
  if (!Array.isArray(value.plan.display_beats) || value.plan.display_beats.length !== 6) return null;
  const allowed = new Set(ARCHITECTURES.map(x=>x[0]));
  if (!allowed.has(value.plan.primary_architecture)) return null;
  return value;
}

function normaliseStory(story, child, age){
  if (!story || typeof story !== 'object') return null;
  const pages = Array.isArray(story.pages) ? story.pages.map(p => ({
    text: typeof p?.text === 'string' ? p.text.trim() : '',
    illustration_prompt: typeof p?.illustration_prompt === 'string' ? p.illustration_prompt.trim() : ''
  })) : [];
  const normal = {
    title: typeof story.title === 'string' ? story.title.trim() : '',
    opening: typeof story.opening === 'string' ? story.opening.trim() : '',
    character_bible: typeof story.character_bible === 'string' && story.character_bible.trim()
      ? story.character_bible.trim()
      : `Keep ${String(child.name)} visually consistent throughout the book, age ${age}, with the same story clothing and recognisable identity.`,
    pages,
    closing: typeof story.closing === 'string' ? story.closing.trim() : ''
  };
  if (!normal.title || !normal.opening || !normal.closing || pages.length !== 4 || pages.some(p=>!p.text || !p.illustration_prompt)) return null;
  return normal;
}

module.exports = {
  ARCHITECTURES,
  createVarietySeed,
  makePlanningPrompt,
  makePlanValidationPrompt,
  makePlanRepairPrompt,
  makeWriterPrompt,
  makeStoryValidationPrompt,
  makeStoryRepairPrompt,
  deterministicStoryIssues,
  normalisePlanner,
  normaliseStory,
  wordCount
};
