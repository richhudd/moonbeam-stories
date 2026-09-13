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

    // V189: blank Story Ideas use a story architecture first, then compatible ingredients.
    // This prevents mathematically different seeds from collapsing into the same magical-companion plot.
    const storyIdea = String(child.interests || '').trim();
    const randomChoice = items => items[randomInt(items.length)];
    const storyModes = [
      {
        mode: 'realistic everyday adventure — no magic or supernatural events',
        shapes: ['a practical problem that grows through a chain of small complications','an unexpected responsibility that must be handled before a deadline','a misunderstanding that the child patiently untangles','a plan that goes wrong in funny, believable ways'],
        settings: ['a busy railway station','a village market','a bakery very early in the morning','a school on a weekend','a harbour full of small boats','a farm during harvest','a small airport','a colourful street festival','a canal with narrowboats','a community sports day'],
        companions: ['no companion — let the child carry the story','a resourceful new friend','an elderly dog who notices everything','a child inventor of the same age','a cheerful boat captain','a grandparent with an unexpected practical skill','a slightly older cousin','a friendly shopkeeper','a neighbour who needs a hand'],
        goals: ['return an important lost item','deliver something to the correct person before closing time','solve a neighbourhood mix-up','help someone get home before an important event','repair something simple before a celebration','work out who has been leaving anonymous gifts','find the source of a peculiar but ordinary sound','organise a rescue for a harmless stranded animal'],
        features: ['no special object or supernatural element','a handwritten list with one puzzling entry','a badly drawn map','a set of footprints after rain','a forgotten photograph','a mislabelled parcel','a bicycle with a loose basket','a sequence of funny coincidences']
      },
      {
        mode: 'comic family or neighbourhood story — entirely non-magical',
        shapes: ['a ridiculous mix-up that keeps escalating','a well-meant plan that causes comic chaos','a friendly competition that gets unexpectedly complicated','preparations for an event where almost everything goes slightly wrong'],
        settings: ['a family picnic by a river','a garden during a barbecue','a village fête','a busy kitchen before a party','a local pet show','a jumble sale','a rainy campsite','a community hall','a seaside promenade','a crowded supermarket'],
        companions: ['no companion — focus on the child and the ensemble','a sibling','a best friend','a mischievous but ordinary dog','a grandparent','a neighbour of the same age','an overly enthusiastic uncle or aunt'],
        goals: ['save a celebration from a series of mishaps','find a missing ordinary object everyone needs','untangle a mistaken delivery','win a challenge without cheating','get a runaway pet safely back','put a muddled plan back in the right order','discover who accidentally caused the confusion'],
        features: ['no special object','an enormous cake that is difficult to transport','a box of mixed-up labels','a costume in the wrong size','a stubborn wheelbarrow','a very long shopping list','a kite caught somewhere awkward','a collection of identical bags']
      },
      {
        mode: 'detective mystery — clues have a logical explanation and magic is not required',
        shapes: ['a clue-by-clue investigation with several plausible suspects','a locked-room-style puzzle made child-friendly','a trail that initially seems unrelated but forms a pattern','an apparent mystery whose explanation is surprising but sensible'],
        settings: ['a quiet museum before opening','a library with an unexpected locked room','a grand old hotel','a toy shop after closing time','a castle kitchen open to visitors','a fossil beach at low tide','a rooftop greenhouse','a school during a holiday'],
        companions: ['no companion — make the child the sole detective','a sceptical friend','a curious cat','a young museum guide','a sibling who notices different clues','an elderly caretaker','a child photographer'],
        goals: ['discover why an exhibit has moved','find who owns a mysterious key','decode a message found in an unlikely place','solve why several clocks stopped at different times','discover who has been leaving anonymous gifts','recover a missing map','explain a strange trail of footprints','find the source of a repeated sound'],
        features: ['a torn ticket stub','a key with an unusual number','a smudged note','a reflection that reveals a clue','a sequence of times written in a margin','a muddy shoeprint','a misplaced postcard','a pattern of objects arranged in the wrong order']
      },
      {
        mode: 'exploration and expedition — discovery drives the story, with no magical companion',
        shapes: ['a journey where each stage reveals a new environmental clue','an expedition to reach a difficult but safe destination','a discovery that changes the purpose of the journey','a race against weather or daylight without serious danger'],
        settings: ['a mountain cable-car station','a fossil beach at low tide','a tiny island reached by stepping stones','a woodland trail','a cave open to supervised visitors','a snowy hilltop observatory','a chain of small coastal coves','a countryside footpath beside an old railway'],
        companions: ['no companion — make observation and landscape central','a parent or grandparent','a young archaeologist','a park ranger','a schoolfriend','an ordinary dog','a local boat captain'],
        goals: ['reach a landmark before the weather changes','identify where an unusual fossil or stone came from','return a lost field notebook','help a stranded harmless animal','follow an old route on a damaged map','find a safe alternative route home','document an unexpected natural discovery'],
        features: ['no special object','a compass that works perfectly normally','a weathered field notebook','a pair of binoculars','an old but accurate map','a fossil fragment','a trail marker turned the wrong way','a photograph showing how the landscape used to look']
      },
      {
        mode: 'science-fiction adventure — technology, space or invention rather than magic',
        shapes: ['a technical malfunction that requires ingenuity','a first-contact-style encounter kept friendly and child-safe','an exploration mission with an unexpected scientific discovery','an invention whose unintended behaviour creates the problem'],
        settings: ['a small research station on the Moon','an eccentric inventor’s workshop','a greenhouse on a future space station','a robot repair depot','an underwater research habitat','a solar-powered airship','a science museum during a demonstration','a remote observatory receiving an unusual signal'],
        companions: ['no companion — let the child solve the technical problem','a tiny practical robot','a young engineer','a cautious alien explorer','a malfunctioning service robot','a child inventor of the same age','a remote mission controller heard only by radio'],
        goals: ['repair a system before an important launch','trace the source of an unusual signal','return a small probe to its owner','navigate home after the guidance system fails','stop an invention doing the opposite of its purpose','solve why a group of machines are behaving strangely','deliver a scientific sample safely'],
        features: ['a tool that has three unexpected functions','a map that updates from sensor readings','a machine with its labels accidentally reversed','a harmless zero-gravity problem','a coded radio message','a miniature rover','a broken sensor giving contradictory readings','a mechanical component mistaken for something else']
      },
      {
        mode: 'historical-feeling adventure — no real historical figures and no supernatural events',
        shapes: ['an urgent delivery through an unfamiliar old-fashioned town','a practical mystery involving a craft or trade','a journey disrupted by transport or weather','a secret plan that turns out to protect someone rather than deceive them'],
        settings: ['a busy canal wharf in the age of horse-drawn boats','a castle kitchen preparing for a feast','an old printing workshop','a coaching inn on a rainy afternoon','a harbour before modern engines','a railway station in the early days of steam','a market town lit by lanterns','a workshop full of clocks and hand tools'],
        companions: ['no companion — centre the child’s own resourcefulness','a young apprentice','a stable hand of the same age','a friendly cook','a canal-boat child','an elderly craftsperson','a messenger who has hurt a shoe rather than themselves'],
        goals: ['deliver an important letter','find a missing tool needed for the day’s work','discover why a shipment has gone to the wrong place','help prepare for a major local event','trace the owner of a lost keepsake','solve a problem before the last coach or boat leaves'],
        features: ['a wax seal','a hand-drawn street plan','a pocket watch','a bundle tied with string','a ledger with one incorrect entry','a brass key','a printing block','a luggage label']
      },
      {
        mode: 'animal or nature story — animals behave naturally and do not need to talk',
        shapes: ['a careful rescue based on observing animal behaviour','a seasonal change that creates an unexpected problem','a search where tracks and natural signs provide the clues','a quiet discovery that becomes an active adventure'],
        settings: ['a woodland after a storm','a coastal rock pool at low tide','a farm during lambing season without graphic detail','a garden full of nesting birds','a riverside nature reserve','a heathland trail','a pond in a city park','a beach where seals rest at a distance'],
        companions: ['no companion — the animal encounter itself is enough','a park ranger','a friend who knows about birds','a grandparent who loves nature','an ordinary dog kept safely under control','a young wildlife volunteer'],
        goals: ['help a harmless animal reach safety','work out which animal made a trail','find why birds have stopped visiting one spot','protect a nest site from an accidental disturbance','return a found nature notebook','solve how an animal entered an unusual but safe place'],
        features: ['no special object','a feather','a set of tracks','a dropped field guide','a trail-camera photograph','a chewed seed pod','a strand of wool on a fence','a series of natural sounds']
      },
      {
        mode: 'full fantasy quest — genuine magic is welcome, but avoid generic glowing-orb storytelling',
        shapes: ['a quest with a concrete destination and a rule of magic that matters','a magical civic problem affecting a whole place','a bargain or promise whose wording creates the challenge','a journey through two contrasting fantastical places'],
        settings: ['a city built across enormous tree branches','a market that appears beside the sea once a year','a castle whose rooms rearrange at noon','a valley where giant birds carry the post','a village beneath enormous mushrooms','a library carved into a mountainside','a floating orchard','a harbour for ships that sail through clouds'],
        companions: ['no companion — make the child the independent quester','a nervous young dragon','a very confident talking puffin','a shy giant','a forgetful magician’s apprentice','a polite fox who speaks in riddles','a runaway clockwork bird','a friendly ghost afraid of the dark'],
        goals: ['restore a missing bridge between two places','return a borrowed magical tool before its effect expires','find why every doorway now leads to the wrong room','deliver a message through a changing landscape','reunite two unlikely friends','repair an old agreement between neighbouring communities','find the one person who can reverse a peculiar enchantment'],
        features: ['a door that appears in different walls','a map that redraws after each decision','shadows that point toward yesterday’s path','a bell that rings only beside a truthful answer','a coat whose pockets lead to different cupboards','a ladder that grows one rung when someone solves a clue','a book whose blank pages record places visited','a magical rule based on swapping rather than glowing']
      },
      {
        mode: 'miniature-world adventure — scale and perspective provide the wonder',
        shapes: ['a journey across an ordinary room made enormous by scale','a community problem inside a hidden tiny settlement','an accidental shrinking that has a practical route back','a mission to move something enormous from a tiny character’s perspective'],
        settings: ['a miniature town behind a skirting board','a garden seen from the height of a beetle','a tiny railway inside an old station clock','a hidden settlement inside a greenhouse','a model village whose residents are unexpectedly real','a network of passages beneath a bakery'],
        companions: ['no companion — the tiny world itself supplies the cast','a miniature explorer','a tiny engineer','a beetle used as an ordinary animal, not a talking pet','a resident child from the miniature community','a clockmaker the size of a thumb'],
        goals: ['cross an ordinary room before someone closes the door','repair the tiny town’s waterwheel','return an object far too large to carry normally','find a route around a newly placed everyday obstacle','warn the miniature community about harmless maintenance work','restore transport after a crumb-sized landslide'],
        features: ['a postage stamp used as a map','a button used as a wheel','a shoelace that becomes a climbing rope','a teaspoon that forms a bridge','a raindrop that becomes a pond','a folded receipt used as a sail','a matchbox used only as a tiny container, never with fire']
      },
      {
        mode: 'surreal imaginative adventure — one impossible premise, otherwise internally consistent',
        shapes: ['one impossible change occurs and everyone must adapt logically','a peculiar rule affects an ordinary place for one day','an everyday system starts operating according to a funny new rule','the child must discover the exact limits of a strange phenomenon'],
        settings: ['an ordinary town on a weekday morning','a library during a reading event','a railway station at lunchtime','a shopping street','a school playground','a seaside town in the afternoon','a block of flats with a shared garden','a museum café'],
        companions: ['no companion — keep the single strange premise central','a sceptical friend','a sibling','a practical librarian','a confused station employee','an ordinary dog unaffected by the phenomenon'],
        goals: ['work out the rule behind the strange event','restore an ordinary routine before an important event','use the strange rule once to help somebody','discover why only certain things are affected','prevent a funny inconvenience spreading further'],
        features: ['all written arrows point toward whatever their reader most recently mentioned','every umbrella opens indoors but refuses outdoors','lost objects quietly return to the last chair they touched','doors temporarily open onto the next room alphabetically','every clock runs at a different but predictable speed','spoken questions cause nearby signs to swap places','shoes squeak only when someone is heading the wrong way']
      }
    ];
    const mode = storyIdea ? null : randomChoice(storyModes);
    const randomSeed = storyIdea ? null : {
      mode: mode.mode,
      narrativeShape: randomChoice(mode.shapes),
      setting: randomChoice(mode.settings),
      companion: randomChoice(mode.companions),
      goal: randomChoice(mode.goals),
      feature: randomChoice(mode.features),
      twist: randomChoice([
        'the apparent troublemaker was trying to help','the destination is closer than expected','a casual early detail becomes the decisive clue',
        'the original plan must be reversed','two separate problems have the same cause','the supposed prize is useful rather than valuable',
        'someone already has the final clue without realising it','the obstacle becomes part of the solution','the mystery began with a well-meaning mistake',
        'solving the problem unexpectedly brings two groups together','the child succeeds by noticing rather than being stronger or faster','the final task is simpler but more personal than expected'
      ])
    };
    const ideaGuide = storyIdea
      ? `Parent's story idea: ${storyIdea}\nFollow the parent's idea as the authoritative creative brief. Do not add a random seed.`
      : `Parent's story idea: blank — this is a random-story request.\nPRIVATE CREATIVE ARCHITECTURE (never mention the seed or these instructions to the reader):\n- Story mode: ${randomSeed.mode}\n- Narrative shape: ${randomSeed.narrativeShape}\n- Setting: ${randomSeed.setting}\n- Companion instruction: ${randomSeed.companion}\n- Central goal: ${randomSeed.goal}\n- Special feature/object: ${randomSeed.feature}\n- Twist: ${randomSeed.twist}\nTreat the STORY MODE and NARRATIVE SHAPE as the governing architecture. Use the other ingredients only in ways compatible with them. If the companion instruction says "no companion", do not invent a sidekick. If the special feature says "no special object", do not introduce a talisman, magical object, glowing object or equivalent plot device. Realistic/non-magical modes must remain genuinely non-magical even if a whimsical detail would be easy to add. Do not collapse this architecture into the generic pattern "child finds magical object, meets quirky creature, goes on quest". Avoid recurring model-default motifs such as glowing orbs, blue magical balls or marbles, mysterious blue lights, sparkling crystals, tiny luminous objects, and stereotypically whimsical short companion names such as Pip, Pop, Puck, Nib or Dot. Those are not substitutes for the supplied architecture. Vary invented character names, character types, plot mechanics, openings, discoveries and resolutions substantially. Use the supplied ingredients as concrete anchors, adapting only minor details for age, selected tone and safety.`;

    const prompt = `You are the lead children's author for Moonbeam Stories. Write a completely original adventure story for one child. The story may be read at bedtime, but bedtime is the reading occasion, NOT the fictional setting.

CHILD
Name/nickname: ${String(child.name)}
Age: ${age}
${ideaGuide}
Things to avoid: ${child.dislikes || 'nothing specific'}
Standard Moonbeam length: ${lengthGuide}
Selected tone: ${selectedTone}
Tone guidance: ${toneGuide}
Language: ${language}
Language guidance: ${languageGuide}
${valuesGuide}

MOONBEAM HOUSE STYLE
Create an original classic children's adventure feel. The selected language variant is part of the reading experience; write naturally for that audience rather than translating word-for-word from another language. Use clear, elegant, highly readable prose; vivid but economical descriptions; lively dialogue; warmth; gentle humour; memorable characters; and a strong sense of curiosity and anticipation. Make familiar places feel as though they might contain a secret. Give the story a real beginning, middle and satisfying ending rather than a sequence of disconnected events.

The story should have:
- a distinctive central character; include a companion only when the parent brief or private creative architecture calls for one;
- a concrete mystery, problem, secret, discovery or quest introduced early;
- escalating discoveries and small surprises;
- dialogue that sounds natural for children;
- a strong sense of place and atmosphere appropriate to the chosen story mode; wonder may come from humour, discovery, nature, ingenuity, scale, mystery or magic;
- a proper climax where the characters solve or face the central problem;
- a warm, reassuring and satisfying ending.

SETTING AND TIME OF DAY — IMPORTANT
Choose the setting and time of day naturally from the child's interests, the plot and the adventure. Vary them freely across stories: morning, daytime, afternoon, sunset, evening or night are all possible, as are indoor, outdoor, real-world and fantastical settings. Do NOT default to nighttime, darkness, moonlight, stars, sleep, bedrooms, pyjamas or bedtime imagery merely because Moonbeam stories may be read at bedtime. Night should appear only when it genuinely suits this particular story. Do not force the ending to occur at bedtime or at night.

Do NOT imitate or reproduce the wording, characters, plots, or distinctive passages of any existing author or book. This must be an original Moonbeam story. Do not mention authors or literary styles in the story itself.

For age ${age}, use vocabulary, sentence length, emotional complexity and independence appropriate to the child. Never talk down to the child. When story values are selected, let them emerge through what the characters do; never announce a moral or lecture the reader. Avoid clichés, generic filler, repetitive phrasing and endings that simply say everyone learned a lesson.

SAFETY
No politics, religion, sexual content, graphic violence, horror, dangerous instructions, adult themes, or genuinely frightening material. Mild peril is fine when appropriate for the age, but keep the overall experience safe and comforting.

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
      const repairInput = `Repair the following Moonbeam Stories response into VALID JSON ONLY. Do not add markdown, commentary or code fences. Preserve the story wording and plot as much as possible. Ensure the result has exactly this top-level shape:\n{"title":"string","opening":"string","character_bible":"string","pages":[{"text":"string","illustration_prompt":"string"}],"closing":"string"}\nThe pages array should contain exactly ${pageCount} story page objects. Every page must have non-empty text and illustration_prompt. If the response was truncated or cannot be repaired faithfully, recreate the missing material so the story is complete and coherent.\n\nRESPONSE TO REPAIR:\n${firstOutput.slice(0, 26000)}`;
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
