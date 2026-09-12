# V111 — Safari mobile scroll-range fix

V111 preserves the V110/V109 portrait geometry: 60% fixed illustration and 40% scrolling text down to the fixed navigation.

The mobile prose viewport is now a normal in-flow 100%-height scrolling element rather than an absolutely positioned scroller containing visibly overflowing text. A real 48px in-flow spacer follows the story text, so mobile Safari includes the complete final lines plus clearance in the element's scrollHeight.

No story-generation, saved-story, translation, illustration, payment or desktop-reader behaviour was changed.
