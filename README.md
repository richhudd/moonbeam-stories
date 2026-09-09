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
