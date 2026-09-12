# V109 — anchored 60/40 mobile reader

V109 keeps the portrait-mobile reader at 60% illustration / 40% scrollable prose, but now explicitly anchors the illustration to the top of the reader and the text pane immediately below it at `top: var(--mobile-art-height)`. This prevents the enlarged illustration from overlapping prose that was still starting at its former position. The slim bottom navigation remains fixed. Desktop, story generation, saved stories, and translation logic are unchanged.

V109 mobile reader fix: the lower text page is now pinned from the 60% artwork boundary all the way to the bottom of the measured reader area, and its scroll viewport is pinned to all four inner edges. This removes the unused gap above the fixed navigation while preserving the 60/40 artwork/text boundary.
