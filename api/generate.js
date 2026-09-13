const {logUsage,estimateGBP}=require('../_usage');
const {verifyMoonbeamUser,reserveStoryCredit,refundReservedStoryCredit,createGenerationRun}=require('../_credits');
const {randomInt}=require('crypto');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });

  let reservedUserId=null, reservedBatchId=null, creditReserved=false;
  const refundOuterReservation=async()=>{if(!creditReserved||!reservedUserId)return;creditReserved=false;try{await refundReservedStoryCredit(reservedUserId,reservedBatchId)}catch(refundError){console.error('credit refund error',refundError)}};
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const child = body.child || {};
    if (!child.name || !Number.isFinite(Number(child.age))) {
      return res.status(400).json({ error: 'Please provide a name and age.' });
    }

    const age = Number(child.age);
    const length = 'standard';

    // V50: every new Moonbeam story has the same predictable length and cost.
    const moonbeamUser = await verifyMoonbeamUser(req);
    let creditsRemaining;
    try {
      const reservation = await reserveStoryCredit(moonbeamUser.id);
      creditsRemaining = reservation.remaining; reservedBatchId = reservation.batchId; reservedUserId=moonbeamUser.id;
    } catch (e) {
      return res.status(e.status || 500).json({ error: e.message, code: e.code || 'CREDIT_ERROR', batchId: e.batchId || null });
    }
    creditReserved = true;
    const refundReservedCredit = async () => {
      if (!creditReserved) return;
      creditReserved = false;
      await refundReservedStoryCredit(moonbeamUser.id,reservedBatchId);
    };
    const language = child.language || 'en-GB';
    const languageGuide = {
      'en-GB': 'Write in natural British English. Use British spelling and vocabulary, such as colour, favourite, holiday, trousers, biscuit, torch and garden where natural.',
      'en-US': 'Write in natural American English. Use American spelling and vocabulary, such as color, favorite, vacation, pants, cookie, flashlight and yard where natural.',
      'es-ES': 'Escribe en español natural de España. Usa ortografía, vocabulario y expresiones habituales en España, sin latinoamericanismos innecesarios.',
      'es-419': 'Escribe en español latinoamericano neutro y natural. Evita localismos muy específicos de un solo país y usa vocabulario ampliamente comprensible en Latinoamérica.',
      'fr-FR': 'Écris en français naturel de France. Utilise l’orthographe, le vocabulaire et les expressions courantes en France.',
      'de-DE': 'Schreibe in natürlichem Deutsch aus Deutschland. Verwende deutsche Rechtschreibung sowie in Deutschland übliche Wörter und Ausdrücke.',
      'it-IT': 'Scrivi in italiano naturale d’Italia. Usa ortografia, vocabolario ed espressioni comuni in Italia.',
      'pt-BR': 'Escreva em português brasileiro natural, usando ortografia, vocabulário e expressões comuns no Brasil.',
      'pl-PL': 'Pisz naturalnym, współczesnym językiem polskim odpowiednim dla dziecka. Używaj idiomatycznej polszczyzny, naturalnych dialogów i poprawnej gramatyki.'
    }[language] || 'Write in natural British English.';
    // Standard Moonbeam format: opening + 4 story pages + closing = 6 reading spreads.
    const lengthConfig = { pages: 4, totalScreens: 6, totalWords: 'about 650-750 words' };
    const pageCount = 4;
    const lengthGuide = lengthConfig.totalWords;
    const targetPerScreen = '105-125 words';
    const selectedTone = String(child.tone || 'cosy and funny');
    const toneGuide = {
      'cosy and funny': 'Warm, playful and gently humorous, with amusing situations and reassuring stakes.',
      'magical': 'Create a strong sense of wonder, enchantment and discovery, with extraordinary things emerging naturally from the story world.',
      'adventurous': 'Energetic and exciting, with exploration, obstacles, discoveries and mild age-appropriate peril.',
      'calm and dreamy': 'Gentle, atmospheric and unhurried, with softer conflict, beautiful imagery and a particularly soothing ending.'
    }[selectedTone] || 'Let the selected tone noticeably shape the mood, pacing, descriptions and dialogue throughout the story.';
    const selectedValues = Array.isArray(child.values) ? child.values.filter(v => String(v || '').trim()) : [];
    const valuesGuide = selectedValues.length
      ? `Story values to weave naturally into the plot: ${selectedValues.join(', ')}`
      : 'Story values: none specifically selected. Do not impose a particular moral or value theme.';

    // V191: age-safe cryptographic story blueprint generator.
    // The model does not choose the premise for a blank Story Idea. Code first chooses an
    // age-eligible story family and hard structural constraints, then the model writes that brief.
    const storyIdea = String(child.storyIdea || '').trim();
    const randomChoice = items => items[randomInt(items.length)];
    const chance = percent => randomInt(100) < percent;

    const ageBand = age <= 5 ? '3-5' : age <= 8 ? '6-8' : '9-12';
    const ageProfiles = {
      '3-5': {
        label:'early-years',
        writing:'Use short, clear sentences, concrete language, a small cast, simple cause-and-effect and frequent reassuring cues. Keep the central problem easy to understand. Excitement is welcome, but any separation, chase, storm, large creature or getting-lost moment must be brief, non-threatening and quickly reassuring.',
        stakes:'gentle and reassuring; no realistic danger, crime, horror, death-focused plots, abduction, weapons, war, serious injury or frightening villains',
        forbidden:'murder, true crime, kidnapping, abduction, realistic weapons, war, horror, gore, serious injury, death-focused plots, predatory threat, terrifying monsters, adult criminal behaviour'
      },
      '6-8': {
        label:'younger-reader',
        writing:'Use lively but accessible prose, clear motivations, a manageable cast, stronger cause-and-effect, humour, clues and moderate suspense. Mild peril may occur but must remain clearly child-safe, non-graphic and recover quickly into reassurance.',
        stakes:'exciting but child-safe; no murder/true crime, graphic violence, realistic weapon use, horror, abduction plots or adult criminal menace',
        forbidden:'murder, true crime, kidnapping, abduction, graphic injury, realistic weapon use, horror, gore, adult criminal menace'
      },
      '9-12': {
        label:'older-child',
        writing:'Use richer vocabulary, more layered motivations, stronger suspense, subtler humour and a more sophisticated plot while remaining clearly suitable for a child. Peril can feel meaningful but must not become graphic, horrific or adult in subject matter.',
        stakes:'meaningful adventure stakes without graphic violence, sexual content, true-crime treatment, torture, gore or adult horror',
        forbidden:'graphic violence, gore, torture, sexual content, true-crime treatment, sadistic threat, adult horror'
      }
    };
    const ageProfile = ageProfiles[ageBand];

    const storyFamilies = [
      {id:'everyday_problem',minAge:3,reality:'STRICT_REALISM',magic:'NONE',label:'realistic everyday problem-solving',
       engines:['a practical problem with several believable complications','preparing for an event when an important plan goes wrong','helping somebody complete a time-sensitive ordinary task','a mix-up that must be patiently untangled','building or repairing something ordinary with ingenuity'],
       settings:['a railway station in the morning','a harbour on a breezy afternoon','a farm during harvest','a community sports day','a library preparing for an event','a garden centre','a ferry terminal','a campsite after breakfast','a village market','a swimming pool before a lesson','a bicycle repair workshop','a museum entrance hall','a canal towpath','a local theatre during rehearsal','a wildlife visitor centre','a school fair','a bus depot open day','a seaside promenade','a pottery workshop','a community garden']},
      {id:'family_comedy',minAge:3,reality:'STRICT_REALISM',magic:'NONE',label:'family or neighbourhood comedy',
       engines:['a ridiculous misunderstanding that keeps escalating','a well-meant plan producing a chain of funny consequences','a friendly competition with unexpected complications','getting ready for a celebration when almost everything goes slightly wrong','an ordinary pet causing harmless chaos','two groups accidentally following different versions of the same plan'],
       settings:['a family picnic','a garden during a barbecue','a village fête','a rainy campsite','a community hall','a seaside day out','a crowded supermarket','a family wedding reception before guests arrive','a local pet show','a car-boot sale','a bowling alley','a mini-golf course','a sports clubhouse','a train journey','a holiday cottage','a playground picnic','a fun run','a garden party','a school talent show','a neighbourhood clean-up day']},
      {id:'logical_mystery',minAge:5,reality:'STRICT_REALISM',magic:'NONE',label:'logical child-safe mystery',
       engines:['a clue-by-clue investigation with a sensible explanation','several unrelated-looking clues that form a pattern','an object appearing in the wrong place for an ordinary reason','a repeated sound or event whose source must be discovered','a harmless disappearance caused by a surprising mix-up'],
       settings:['a museum before opening','a library during a special exhibition','a grand hotel in daytime','a fossil beach at low tide','a rooftop greenhouse','a school during a holiday','a historic house open to visitors','an aquarium education centre','a railway museum','a botanical garden','a theatre backstage','a lighthouse visitor centre','a sports stadium tour','a country house garden','a science centre','an old watermill','a marina','a sculpture park','a castle courtyard','a bookshop during an event']},
      {id:'expedition',minAge:5,reality:'STRICT_REALISM',magic:'NONE',label:'exploration and expedition',
       engines:['reaching a difficult but safe destination','following environmental clues along a route','a discovery changing the purpose of an expedition','a race against daylight or weather without serious danger','mapping an unfamiliar but supervised place','solving a route problem using observation rather than luck'],
       settings:['a mountain cable-car station','a fossil beach','a chain of coastal coves','a woodland trail','a supervised cave system','a snowy observatory','a moorland footpath','a small island reached by ferry','a desert visitor trail','a volcanic landscape visitor route','a rainforest research walkway','a river gorge path','a mountain lake','a coastal cliff path behind safety barriers','a national park ranger station','a dune system','a forest canopy walkway','a glacier visitor centre','a rocky valley','an archaeological field school']},
      {id:'nature',minAge:3,reality:'STRICT_REALISM',magic:'NONE',label:'animal and nature adventure',
       engines:['helping a harmless animal using careful observation','following tracks and natural signs','a seasonal change creating an unexpected practical problem','protecting a habitat from an accidental disturbance','finding the explanation for unusual animal behaviour','documenting an unexpected natural discovery'],
       settings:['a woodland after a storm','a coastal rock pool','a garden with nesting birds','a riverside nature reserve','a city park pond','a beach where seals rest at a distance','a butterfly garden','a wetland boardwalk','a farm meadow','a woodland hide','a dune reserve','a mountain stream','an orchard','a wildflower meadow','a forest pond','a coastal bird reserve','a nature trail beside a reservoir','a community allotment','a heathland trail','a sheltered bay']},
      {id:'invention',minAge:5,reality:'STRICT_REALISM',magic:'NONE',label:'invention and making story',
       engines:['designing something to solve an ordinary problem','an invention working correctly but creating an unexpected side effect','a team building challenge with limited materials','working out why a machine is not behaving as expected','improving a simple design through several attempts'],
       settings:['a school makerspace','a garage workshop','a science fair','a model-boat club','a community repair café','a robotics classroom','a bicycle workshop','a theatre props department','a garden shed workshop','a museum engineering day','a craft studio','a junior sailing club','a radio club','a design competition','a recycled-materials workshop','a photography studio','a woodworking demonstration','a kite-making event','a model railway club','a community invention challenge']},
      {id:'sports_challenge',minAge:4,reality:'STRICT_REALISM',magic:'NONE',label:'sport, performance or friendly challenge',
       engines:['practising a skill before an event','a team adapting when the original plan fails','a friendly contest decided by ingenuity rather than strength','helping a nervous performer or teammate','completing a challenge where cooperation matters more than winning'],
       settings:['an athletics track','a football training ground','a swimming gala','a climbing centre','a dance rehearsal','a school concert','a sailing lesson','a cycling skills course','a tennis club','a gymnastics hall','a junior orchestra rehearsal','a theatre stage','a skate park lesson','a rowing club','a martial-arts demonstration','a cross-country course','a cricket practice','a basketball court','a choir rehearsal','a community fun day']},
      {id:'historical_adventure',minAge:6,reality:'STRICT_REALISM',magic:'NONE',label:'historical-feeling adventure with fictional characters',
       engines:['an urgent delivery through an old-fashioned town','a practical problem involving a historical craft','a journey disrupted by old-fashioned transport or weather','preparing for a major local event','tracing the owner of a misplaced ordinary keepsake'],
       settings:['a canal wharf with horse-drawn boats','an old printing workshop','a coaching inn','a harbour before modern engines','an early steam railway station','a lantern-lit market town before evening','a clockmaker’s workshop','a sailing-ship dockyard while moored','a watermill','a pottery village','a textile workshop','a Victorian-style glasshouse','a rural post office in the age of bicycles','an old theatre','a blacksmith demonstration area','a horse-drawn delivery yard','a traditional fishing harbour','a bookbinder’s workshop','a historic farmstead','an early photographic studio']},
      {id:'science_fiction',minAge:5,reality:'SCIENCE_FICTION',magic:'NONE',label:'science-fiction adventure driven by technology rather than magic',
       engines:['a technical malfunction requiring ingenuity','a friendly first-contact encounter','an exploration mission making an unexpected scientific discovery','an invention producing an unintended but logical effect','navigating home when an automated system fails'],
       settings:['a research station on the Moon','a greenhouse on a space station','a robot repair depot','an underwater research habitat','a solar-powered airship','a future science museum','an observatory receiving an unusual signal','a Mars training habitat on Earth','an orbital hotel under construction','a deep-sea exploration vessel','a lunar rover garage','a floating ocean laboratory','a future city transport hub','a telescope control room','a zero-gravity training centre','a planetary geology lab','a weather-control research station','a remote drone base for conservation','a future Antarctic station','a small spacecraft approaching an asteroid research base']},
      {id:'fantasy',minAge:3,reality:'FANTASY',magic:'OVERT_ALLOWED',label:'fantasy with a specific rule of magic',
       engines:['a quest with a concrete destination and one clear magical rule','a magical civic problem affecting a whole place','a promise whose exact wording creates the challenge','a journey through contrasting fantastical places','a magical system malfunctioning in a funny or puzzling way'],
       settings:['a city built across enormous tree branches','a floating orchard','a harbour for cloud-sailing ships','a library carved into a mountain','a valley where giant birds deliver parcels','a castle whose rooms rearrange at noon','a village beside a waterfall flowing upward','a bridge-town suspended over a canyon','an island where paths change with the tide','a city of canals in the clouds','a mountain village reached by enormous lifts','a palace garden where statues politely change places','a market held on boats','a forest settlement built around giant roots','a lighthouse standing above a sea of mist','a town where every house has a different shaped door','a travelling fair run by friendly fantastical folk','a hilltop observatory for magical weather','a valley of enormous flowers','a walled city with messenger gryphons']},
      {id:'surreal_rule',minAge:4,reality:'ONE_IMPOSSIBLE_RULE',magic:'SINGLE_RULE_ONLY',label:'surreal adventure with exactly one impossible rule',
       engines:['discovering the exact limits of one strange phenomenon','adapting an ordinary routine to one impossible rule','using the strange rule once to help somebody','restoring normality by understanding the rule','solving a funny inconvenience caused by the rule'],
       settings:['an ordinary town on a weekday','a library during an event','a railway station at lunchtime','a shopping street','a school playground','a seaside town in the afternoon','a block of flats with a shared garden','a museum café','a sports centre','a public park','a ferry terminal','a cinema foyer','a town square','a garden centre','a tram stop','a swimming pool reception','a supermarket car park','a community centre','a pedestrian bridge','a bus station'],
       impossibleRules:['written arrows point towards the last place their reader mentioned','umbrellas open indoors but refuse outdoors','lost objects return to the last chair they touched','doors open onto rooms in alphabetical order','clocks each run at a different but predictable speed','spoken questions make nearby signs swap places','shoes squeak only when their wearer is heading the wrong way','reflections are delayed by exactly five seconds','lifts stop at floors in reverse order','anything placed in a pocket becomes surprisingly light until removed']}
    ];

    const eligibleFamilies = storyFamilies.filter(f => age >= f.minAge);
    const family = storyIdea ? null : randomChoice(eligibleFamilies);
    const companionTypesByReality = {
      STRICT_REALISM:['NONE','HUMAN','HUMAN','ORDINARY_ANIMAL'],
      SCIENCE_FICTION:['NONE','HUMAN','ROBOT','ALIEN'],
      FANTASY:['NONE','HUMAN','FANTASTICAL_BEING','ORDINARY_ANIMAL'],
      ONE_IMPOSSIBLE_RULE:['NONE','HUMAN','HUMAN','ORDINARY_ANIMAL']
    };
    const companionType = storyIdea ? null : randomChoice(companionTypesByReality[family.reality]);
    const companionDetails = {
      NONE:'none — the protagonist carries the story without a sidekick',
      HUMAN:randomChoice(['a sibling','a schoolfriend','a cousin','a new friend of a similar age','a helpful adult whose role fits the setting','a grandparent']),
      ORDINARY_ANIMAL:randomChoice(['an ordinary dog','an ordinary cat','an ordinary pony','a harmless local animal appropriate to the setting']),
      ROBOT:randomChoice(['a practical maintenance robot','a survey robot','a service robot with a clear job']),
      ALIEN:randomChoice(['a friendly young alien explorer','a cautious alien scientist','a stranded alien traveller']),
      FANTASTICAL_BEING:randomChoice(['a young dragon with a practical problem','a talking bird with a formal job','a gentle giant','a trainee wizard','a river spirit','a messenger gryphon'])
    };
    const namingModes = ['ordinary varied name','descriptive title or role where natural','longer distinctive name','no invented name unless the plot needs one'];
    const specialObjectPresent = storyIdea ? false : chance(family.reality==='FANTASY'?55:family.reality==='SCIENCE_FICTION'?45:25);
    const ordinaryObjects = ['a paper map','a notebook','a labelled parcel','a photograph','a ticket','a toolbox','a set of keys','a pair of binoculars','a timetable','a camera','a field guide','a clipboard','a backpack','a model','a compass'];
    const fantasyObjects = ['a map that changes according to one stated rule','a key that opens one specific impossible door','a cloak with one practical magical property','a bell that responds to one defined condition','a book that records only places actually visited','a tool used by a particular magical trade'];
    const scifiObjects = ['a sensor module','a small rover','a diagnostic tablet','a sample container','a navigation unit','a communications device','a repair tool','a survey drone'];
    const objectPool = family && family.reality==='FANTASY' ? fantasyObjects : family && family.reality==='SCIENCE_FICTION' ? scifiObjects : ordinaryObjects;
    const randomSeed = storyIdea ? null : {
      familyId:family.id,
      mode:family.label,
      realityRule:family.reality,
      magicLevel:family.magic,
      plotEngine:randomChoice(family.engines),
      setting:randomChoice(family.settings),
      companionType,
      companion:companionDetails[companionType],
      specialObject:specialObjectPresent ? randomChoice(objectPool) : 'NONE',
      impossibleRule:family.impossibleRules ? randomChoice(family.impossibleRules) : 'NONE',
      namingMode:randomChoice(namingModes),
      endingType:randomChoice(['comic payoff','quiet satisfaction','triumphant solution','surprising practical resolution','warm reunion','successful discovery','celebratory finish','clever reversal']),
      twist:randomChoice(['an early ordinary detail becomes important later','the first plan must be reversed','two problems turn out to share one cause','the obstacle becomes useful','somebody already has the needed information without realising it','the child succeeds by noticing something others missed','a mistaken assumption is corrected','the simplest explanation turns out to be right'])
    };

    const hardBlueprint = storyIdea ? '' : `STORY BLUEPRINT — HARD CONSTRAINTS, NOT SUGGESTIONS
STORY_FAMILY: ${randomSeed.mode}
REALITY_RULE: ${randomSeed.realityRule}
MAGIC_LEVEL: ${randomSeed.magicLevel}
SETTING: ${randomSeed.setting}
PLOT_ENGINE: ${randomSeed.plotEngine}
COMPANION_TYPE: ${randomSeed.companionType}
COMPANION: ${randomSeed.companion}
SPECIAL_OBJECT: ${randomSeed.specialObject}
IMPOSSIBLE_RULE: ${randomSeed.impossibleRule}
NAMING_MODE: ${randomSeed.namingMode}
TWIST: ${randomSeed.twist}
ENDING_TYPE: ${randomSeed.endingType}

Enforcement:
- Do not replace, reinterpret or add a second premise.
- STRICT_REALISM means every event is possible in the ordinary real world: no magic, supernatural beings, talking animals, enchanted objects, unexplained phenomena or magical realism.
- SCIENCE_FICTION permits speculative technology but no magic or supernatural explanation.
- ONE_IMPOSSIBLE_RULE permits exactly the stated impossible rule and no other magical/supernatural element.
- FANTASY permits magic, but it must follow the blueprint and must not default to a tiny magical companion or glowing-object quest.
- COMPANION_TYPE NONE means no sidekick or recurring helper is introduced.
- ORDINARY_ANIMAL means the animal behaves like a real animal and does not speak.
- SPECIAL_OBJECT NONE means no talisman, mysterious object, magical marble, glowing orb, crystal, secret key or equivalent plot device is invented.
- Do not introduce miniature magical creatures unless the blueprint explicitly requires one; this blueprint system never requires one by default.
- Follow NAMING_MODE. Avoid repetitive cute one-syllable fantasy names and do not default to Pip/Pop/Puck/Nib/Dot-like names.
- The selected setting is fixed. Do not choose a different setting.
- The selected plot engine is the central narrative mechanism. Do not turn every story into a mystery, secret discovery or quest.`;

    const ideaGuide = storyIdea
      ? `PARENT STORY IDEA — AUTHORITATIVE\n${storyIdea}\nUse this idea as the creative brief. Do not generate or add a competing random premise. Age-safety rules still override any unsuitable detail.`
      : `RANDOM STORY REQUEST\n${hardBlueprint}`;


    const effectiveToneGuide = (!storyIdea && randomSeed.realityRule === 'STRICT_REALISM' && selectedTone === 'magical')
      ? 'Create a strong sense of wonder through atmosphere, imagination, discovery, beauty, coincidence or the child’s feelings, but introduce NO literal magic or supernatural event.'
      : (!storyIdea && randomSeed.realityRule === 'SCIENCE_FICTION' && selectedTone === 'magical')
        ? 'Create wonder through scale, science, technology and discovery. Do not introduce literal magic or supernatural events.'
        : toneGuide;

    const prompt = `You are the lead children's author for Moonbeam Stories. Write a completely original adventure story for one child. The story may be read at bedtime, but bedtime is the reading occasion, NOT the fictional setting.

CHILD
Name/nickname: ${String(child.name)}
Age: ${age}
${ideaGuide}
Things to avoid: ${child.dislikes || 'nothing specific'}
Standard Moonbeam length: ${lengthGuide}
Selected tone: ${selectedTone}
Tone guidance: ${effectiveToneGuide}
Language: ${language}
Language guidance: ${languageGuide}
${valuesGuide}

MOONBEAM WRITING QUALITY
Write an original, polished children’s story in natural ${language}. Use clear, elegant prose; vivid but economical description; natural dialogue where useful; warmth; humour when appropriate; and a satisfying narrative arc. The permanent Moonbeam style controls writing quality, NOT plot architecture. Do not automatically add a mystery, secret, quest, magical creature, special object, hidden door, discovery or sidekick. For random stories, the STORY BLUEPRINT alone determines those creative choices.

SETTING AND STRUCTURE
${storyIdea ? 'Follow the setting and structure implied by the parent’s Story Idea. If the parent leaves details open, invent only what is needed to make that idea coherent and age-appropriate.' : 'Use the exact blueprint setting and plot engine. Do not substitute a setting or add a second story engine. Time of day may be chosen naturally unless the blueprint setting already specifies it.'}
Do not default to nighttime, moonlight, stars, sleep, bedrooms, pyjamas or bedtime imagery merely because the story may be read at bedtime.

The story must have a clear beginning, development, climax/resolution and satisfying ending. The form of conflict, discovery, humour, wonder and companionship must come from the parent brief or blueprint rather than from a generic children’s-story template.

Do NOT imitate or reproduce the wording, characters, plots, or distinctive passages of any existing author or book. This must be an original Moonbeam story. Do not mention authors or literary styles in the story itself.

AGE-SUITABILITY — HARD CONSTRAINT
Child age: ${age}; band: ${ageBand} (${ageProfile.label}).
${ageProfile.writing}
Permitted stakes: ${ageProfile.stakes}.
Explicitly excluded for this age band: ${ageProfile.forbidden}.
Age suitability overrides tone, parent detail and random blueprint if any conflict occurs. Never make an older genre merely less graphic; replace any unsuitable mechanism with an age-appropriate equivalent while preserving the harmless core idea.

GENERAL SAFETY
No politics, religion, sexual content, graphic violence, dangerous instructions or adult themes. Keep the experience emotionally safe for age ${age}. When story values are selected, let them emerge through action rather than announcing a moral. Avoid clichés, generic filler and repetitive phrasing.

OUTPUT
Return JSON only, with exactly this shape:
{"title":"string","opening":"string","character_bible":"string","pages":[...exactly ${pageCount} page objects...],"closing":"string"}

The opening, exactly ${pageCount} story pages and closing must together form one continuous story of the requested length. The page count is mandatory: exactly 4 story pages, plus the opening and closing, for 6 displayed reading spreads in total.

REAL-BOOK PAGE BALANCE — MANDATORY
The app displays ONE text page beside ONE equally sized illustration. Every displayed text page must therefore contain approximately the same amount of prose.
- Write the opening at approximately ${targetPerScreen}.
- Write EACH of the ${pageCount} page.text fields at approximately ${targetPerScreen}.
- Write the closing at approximately 90-115 words.
- Never make one page a few sentences while another is several long paragraphs.
- Keep each displayed page self-contained enough to turn naturally, but do not add headings inside the prose.
- Use exactly ${lengthConfig.totalScreens} displayed text pages in total.
- Aim for ${lengthGuide} overall.

Each pages array item MUST have exactly this shape: {"text":"string","illustration_prompt":"string"}. Add a concise character_bible describing the recurring characters' appearance, clothing, age range, colours and any distinctive features so an image model can keep them consistent. Each illustration_prompt should describe a charming, child-friendly storybook illustration for that specific scene and should refer to the character_bible details where relevant. Do not include text or lettering in illustrations.`;

    async function callStoryModel(input, maxOutputTokens = 5000) {
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-5.6-luna', input, max_output_tokens: maxOutputTokens })
      });
      const raw = await r.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = {}; }
      if (!r.ok) {
        const e = data && data.error;
        const message = typeof e === 'string' ? e : (e && (e.message || e.code || e.type)) || `OpenAI returned HTTP ${r.status}`;
        const error = new Error(String(message));
        error.openaiStatus = r.status;
        throw error;
      }
      let output = typeof data.output_text === 'string' ? data.output_text : '';
      if (!output && Array.isArray(data.output)) {
        for (const item of data.output) {
          if (!Array.isArray(item.content)) continue;
          for (const part of item.content) {
            if (typeof part.text === 'string') output += part.text;
            else if (typeof part.output_text === 'string') output += part.output_text;
          }
        }
      }
      return String(output || '').trim();
    }

    function candidateJsonStrings(text) {
      const clean = String(text || '').trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '');
      const candidates = [];
      if (clean) candidates.push(clean);

      // Extract the first balanced JSON object even if the model surrounded it with prose.
      let start = -1, depth = 0, inString = false, escaped = false;
      for (let i = 0; i < clean.length; i++) {
        const ch = clean[i];
        if (inString) {
          if (escaped) escaped = false;
          else if (ch === '\\') escaped = true;
          else if (ch === '"') inString = false;
          continue;
        }
        if (ch === '"') { inString = true; continue; }
        if (ch === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (ch === '}' && depth > 0) {
          depth--;
          if (depth === 0 && start >= 0) {
            candidates.push(clean.slice(start, i + 1));
            break;
          }
        }
      }
      return [...new Set(candidates.filter(Boolean))];
    }

    function parseStoryOutput(text) {
      for (const candidate of candidateJsonStrings(text)) {
        for (const version of [candidate, candidate.replace(/,\s*([}\]])/g, '$1')]) {
          try {
            const parsed = JSON.parse(version);
            const story = parsed && parsed.story && typeof parsed.story === 'object' ? parsed.story : parsed;
            if (story && typeof story === 'object') return story;
          } catch {}
        }
      }
      return null;
    }

    function normaliseStory(story) {
      if (!story || typeof story !== 'object') return null;
      const pages = Array.isArray(story.pages) ? story.pages.map(p => ({
        text: typeof p?.text === 'string' ? p.text.trim() : '',
        illustration_prompt: typeof p?.illustration_prompt === 'string' && p.illustration_prompt.trim()
          ? p.illustration_prompt.trim()
          : 'A charming children’s storybook illustration matching this part of the adventure.'
      })).filter(p => p.text) : [];
      const normal = {
        title: typeof story.title === 'string' ? story.title.trim() : '',
        opening: typeof story.opening === 'string' ? story.opening.trim() : '',
        character_bible: typeof story.character_bible === 'string' && story.character_bible.trim()
          ? story.character_bible.trim()
          : `Keep ${String(child.name)} visually consistent throughout the book, age ${age}, with the same hair, facial features and clothing unless the story explicitly changes clothing.`,
        pages,
        closing: typeof story.closing === 'string' ? story.closing.trim() : ''
      };
      if (!normal.title || !normal.opening || !normal.closing || !normal.pages.length) return null;
      return normal;
    }

    let firstOutput = '';
    let story = null;
    try {
      firstOutput = await callStoryModel(prompt);
      story = normaliseStory(parseStoryOutput(firstOutput));
    } catch (e) {
      if (e.openaiStatus) { await refundReservedCredit(); return res.status(502).json({ error: e.message, openai_status: e.openaiStatus }); }
      throw e;
    }

    // If the model produced almost-JSON, ask it to repair its own output once rather than
    // showing the reader a formatting error. This also catches missing required fields.
    if (!story) {
      const repairInput = `Repair the following Moonbeam Stories response into VALID JSON ONLY. Do not add markdown, commentary or code fences. Preserve the story wording and plot as much as possible, BUT the creative brief and age rules below remain mandatory during repair.\n\n${storyIdea ? `PARENT STORY IDEA: ${storyIdea}` : hardBlueprint}\n\nAGE RULES: Child age ${age}, band ${ageBand}. ${ageProfile.writing} Forbidden: ${ageProfile.forbidden}.\n\nEnsure the result has exactly this top-level shape:\n{"title":"string","opening":"string","character_bible":"string","pages":[{"text":"string","illustration_prompt":"string"}],"closing":"string"}\nThe pages array should contain exactly ${pageCount} story page objects. Every page must have non-empty text and illustration_prompt. If the response was truncated or cannot be repaired faithfully, recreate the missing material so the story is complete and coherent.\n\nRESPONSE TO REPAIR:\n${firstOutput.slice(0, 26000)}`;
      try {
        const repairedOutput = await callStoryModel(repairInput, 5000);
        story = normaliseStory(parseStoryOutput(repairedOutput));
      } catch (e) {
        if (e.openaiStatus) { await refundReservedCredit(); return res.status(502).json({ error: e.message, openai_status: e.openaiStatus }); }
        throw e;
      }
    }

    if (!story) {
      await refundReservedCredit();
      return res.status(502).json({ error: 'Moonbeam could not finish this story correctly. Please tap Make Tonight’s Story again.' });
    }

    const wordCount = value => String(value || '').trim().split(/\s+/).filter(Boolean).length;

    // Models occasionally return one page too many/few even when the prompt is explicit.
    // Never expose that implementation detail to the reader. Reflow the story prose locally
    // into the exact requested number of pages while keeping sentence order and plot intact.
    function splitIntoSentences(text) {
      const clean = String(text || '').replace(/\s+/g, ' ').trim();
      if (!clean) return [];
      const matches = clean.match(/[^.!?…]+(?:[.!?…]+[\"'’”)]*|$)/g);
      return (matches || [clean]).map(x => x.trim()).filter(Boolean);
    }

    function rebalancePages(pages, wanted) {
      const source = Array.isArray(pages) ? pages.filter(Boolean) : [];
      const allText = source.map(p => String(p.text || '').trim()).filter(Boolean).join(' ');
      const sentences = splitIntoSentences(allText);
      if (!sentences.length) return source.slice(0, wanted);

      const totalWords = sentences.reduce((n, x) => n + wordCount(x), 0);
      const target = Math.max(1, Math.round(totalWords / wanted));
      const buckets = [];
      let si = 0;

      for (let pageIndex = 0; pageIndex < wanted; pageIndex++) {
        const remainingPages = wanted - pageIndex;
        const remainingSentences = sentences.length - si;
        const bucket = [];
        let words = 0;

        while (si < sentences.length) {
          const sentence = sentences[si];
          const sw = wordCount(sentence);
          // Leave at least one sentence for each remaining page where possible.
          if (bucket.length && words + sw > target && remainingSentences > remainingPages - 1) break;
          bucket.push(sentence);
          words += sw;
          si++;
          if (si >= sentences.length) break;
          if (words >= target && (sentences.length - si) >= (remainingPages - 1)) break;
        }

        // Last page receives anything left over.
        if (pageIndex === wanted - 1 && si < sentences.length) {
          bucket.push(...sentences.slice(si));
          si = sentences.length;
        }

        const sourceIndex = source.length
          ? Math.min(source.length - 1, Math.floor((pageIndex + 0.5) * source.length / wanted))
          : 0;
        const prompt = source[sourceIndex] && source[sourceIndex].illustration_prompt
          ? source[sourceIndex].illustration_prompt
          : 'A charming children’s storybook illustration matching this part of the adventure.';
        buckets.push({ text: bucket.join(' ').trim(), illustration_prompt: prompt });
      }
      return buckets;
    }

    if (!Array.isArray(story.pages)) story.pages = [];
    const originalPageCount = story.pages.length;
    const originalCounts = story.pages.map(p => wordCount(p && p.text));
    const needsReflow = story.pages.length !== pageCount || originalCounts.some(n => n < 75 || n > 145);
    if (needsReflow) story.pages = rebalancePages(story.pages, pageCount);

    // Defensive fallback for malformed model output: guarantee exactly the selected count.
    while (story.pages.length < pageCount) {
      story.pages.push({ text: '', illustration_prompt: 'A charming children’s storybook illustration matching this part of the adventure.' });
    }
    if (story.pages.length > pageCount) story.pages = story.pages.slice(0, pageCount);

    const textScreens = [story.opening, ...story.pages.map(p => p && p.text), story.closing];
    const counts = textScreens.map(wordCount);

    const generationRunId = await createGenerationRun(moonbeamUser.id);
    await logUsage({event_type:'story',estimated_cost_gbp:estimateGBP('story'),metadata:{model:'gpt-5.6-luna',user_id:moonbeamUser.id,generation_run_id:generationRunId}});
    creditReserved = false;
    return res.status(200).json({
      creditsRemaining,
      generationRunId,
      story,
      image: null,
      layout: {
        requestedLength: length,
        storyPages: pageCount,
        displayedTextPages: pageCount + 2,
        pageWordCounts: counts,
        automaticallyReflowed: needsReflow,
        originalStoryPages: originalPageCount
      }
    });
  } catch (e) {
    console.error('generate error', e);
    await refundOuterReservation();
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
