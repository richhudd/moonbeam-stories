# Moonbeam Stories V22

V22 fixes occasional mobile text/footer collisions. The mobile reader now reserves a dedicated footer safety zone and the text-fitting calculation measures only the usable space above the footer, with extra tolerance for differing iPhone font metrics. The final line can no longer sit underneath the "Moonbeam Stories" footer.

All V21 features remain unchanged.

# Moonbeam Stories V21

V21 improves story-generation reliability. If the model returns a different number of story pages than requested, or uneven page lengths, the server automatically reflows the prose into the exact selected number of pages rather than showing an error to the reader.

All V20 features remain, including mobile single-page reading, swipe/tap page turns, Supabase accounts/cloud saves, balanced book layout, and smaller cover typography.

# Moonbeam Stories V14

Multilingual book-style bedtime story app.

## Languages
- English (UK)
- English (USA)
- Español (España)
- Español (Latinoamérica)
- Français (France)
- Deutsch (Deutschland)
- Italiano (Italia)
- Português (Portugal)

The selected language is now the app locale: interface labels, child/story preference controls, values, status messages, book controls and story generation adapt to it. The choice persists in localStorage.

Upload the contents of this folder to the root of the GitHub repository. No vercel.json is required.


## V15
Story length now controls the actual number of story pages: Short = 4, Medium = 6, Long = 8, with separate opening and closing pages.


## V16
Adds a generated illustrated front cover with reliable HTML title typography, a Begin Story flow, cover navigation from the opening page, background prefetching of the first interior illustrations, and cover regeneration for saved stories.


## V17
- Fixes story-length selection persistence; locale refresh no longer resets the selector to Medium.
- Short/Medium/Long now change page count, while each spread targets similar prose density.
- Backend rejects badly unbalanced page text.
- Desktop book spread uses a fixed 600px page height so text and illustration remain the same visual size without scrolling.
- Small text-density adjustment handles minor generation variation without changing the book layout.


## V18
- Supabase parent email/password authentication.
- Cloud child profiles protected by Row Level Security.
- Cloud saved story library protected by Row Level Security.
- Existing local/browser story saving remains available when signed out.
- Supabase project uses the public Project URL and publishable key in the browser; no database password or service-role key is included.
- For confirmation emails, configure Supabase Authentication URL settings with https://www.moonbeamstories.co.uk as the Site URL and allowed redirect URL.

## V20
- Phone portrait reader redesigned as a true single-page book.
- Text and illustration no longer stack vertically on phones.
- Each spread becomes two physical mobile pages: text, then its matching illustration.
- Swipe left/right or tap the page edges to turn pages.
- Mobile text automatically reduces slightly when necessary to fit the page without scrolling.
- Desktop/tablet two-page spread remains unchanged.
- Landscape phones retain the wider spread behaviour.
- Supabase accounts, cloud profiles and saved stories from V18 are unchanged.


## V20
- Reduced cover-title typography so artwork remains the dominant visual.
- Tighter title area, smaller kicker/subtitle, and responsive title cap on phones.
- Long titles use balanced wrapping rather than oversized type.


## V24 – faster illustrations
- Switched illustration generation to `gpt-image-2.5-flare`, OpenAI's fast image-generation model.
- Starts the cover plus the first three interior illustrations immediately.
- Prefetches the next three illustrations as the reader advances.
- Deduplicates simultaneous requests so the same page is never generated twice.
- Retries temporary image-service/rate-limit responses automatically.
- Adds persistent IndexedDB illustration caching using a stable story fingerprint, so reopening the same saved story on the same device reuses its cover and page images instead of regenerating them.
- Keeps the existing low-quality 1024×1024 WebP setting for speed/cost; it does not double-generate draft and final images.


## V24
Adds a complete Supabase password recovery flow: Forgot password email, recovery-link detection, and in-app new-password form.
