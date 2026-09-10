const {logUsage,estimateGBP}=require('./_usage');
const {verifyMoonbeamUser,consumeStoryCredit,refundStoryCredit,createGenerationRun}=require('./_credits');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = String(process.env.OPENAI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });

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
    try { creditsRemaining = await consumeStoryCredit(moonbeamUser.id); }
    catch (e) { return res.status(e.status || 500).json({ error: e.message, code: e.code || 'CREDIT_ERROR' }); }
    let creditReserved = true;
    const refundReservedCredit = async () => {
      if (!creditReserved) return;
      creditReserved = false;
      await refundStoryCredit(moonbeamUser.id);
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
      'pt-PT': 'Escreve em português natural de Portugal. Usa a ortografia, o vocabulário e as expressões habituais em Portugal, evitando brasileirismos.'
    }[language] || 'Write in natural British English.';
    // Standard Moonbeam format: opening + 4 story pages + closing = 6 reading spreads.
    const lengthConfig = { pages: 4, totalScreens: 6, totalWords: 'about 650-750 words' };
    const pageCount = 4;
    const lengthGuide = lengthConfig.totalWords;
    const targetPerScreen = '105-125 words';

    const prompt = `You are the lead children's author for Moonbeam Stories. Write a completely original bedtime adventure story for one child.

CHILD
Name/nickname: ${String(child.name)}
Age: ${age}
Interests: ${child.interests || 'imagination and exploring'}
Things to avoid: ${child.dislikes || 'nothing specific'}
Standard Moonbeam length: ${lengthGuide}
Tone: ${child.tone || 'cosy and funny'}
Language: ${language}
Language guidance: ${languageGuide}
Story values to weave naturally into the plot: ${(Array.isArray(child.values) && child.values.length ? child.values : ['Kindness', 'Curiosity']).join(', ')}

MOONBEAM HOUSE STYLE
Create an original classic children's adventure feel. The selected language variant is part of the reading experience; write naturally for that audience rather than translating word-for-word from another language. Use clear, elegant, highly readable prose; vivid but economical descriptions; lively dialogue; warmth; gentle humour; memorable characters; and a strong sense of curiosity and anticipation. Make familiar places feel as though they might contain a secret. Give the story a real beginning, middle and satisfying ending rather than a sequence of disconnected events.

The story should have:
- a distinctive central character and at least one memorable companion;
- a concrete mystery, problem, secret, discovery or quest introduced early;
- escalating discoveries and small surprises;
- dialogue that sounds natural for children;
- a sense of place and atmosphere, especially around ordinary things made magical by imagination;
- a proper climax where the characters solve or face the central problem;
- a warm, reassuring bedtime ending.

Do NOT imitate or reproduce the wording, characters, plots, or distinctive passages of any existing author or book. This must be an original Moonbeam story. Do not mention authors or literary styles in the story itself.

For age ${age}, use vocabulary, sentence length, emotional complexity and independence appropriate to the child. Never talk down to the child. Let the story value emerge through what the characters do; never announce a moral or lecture the reader. Avoid clichés, generic filler, repetitive phrasing and endings that simply say everyone learned a lesson.

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
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
