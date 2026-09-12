# V110 — mobile final-line scroll fix

V110 preserves the V109 portrait-mobile geometry: 60% fixed illustration, the scrolling text pane anchored immediately below it and extending to the fixed navigation.

The only reader change is extra **real bottom space inside the scrollable text content**. The text viewport now has 48px of bottom padding, so the final line can be scrolled fully above the bottom edge and remain there when the finger is released instead of appearing only during iOS overscroll/rubber-banding. No story fitting, font shrinking, illustration resizing, navigation positioning, desktop reader, generation, saved-story, payment, or translation logic was changed.
