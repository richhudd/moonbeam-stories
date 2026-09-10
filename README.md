Moonbeam Stories V33

Fixes the persistent title/footer regression in the portrait mobile reader. The cover is forcibly removed from the layout once the story begins, and reader page footers are removed so no Moonbeam/story title can obscure text or illustrations.

# Moonbeam Stories V31

Based on V30.

## V31 change
- Replaces the small inline loading state with an unmistakable full-screen animated hourglass overlay while a story is being generated.
- Forces two browser animation frames before starting the OpenAI request so iOS Safari paints the loading state immediately instead of coalescing it with the fetch.
- The overlay remains until the story succeeds or fails, then closes automatically.
- Retains V30 cover/title isolation and all earlier mobile reader changes.


## V33 cover-first-paint fix
- The front-cover loading layer now remains visible until Safari has actually decoded the generated cover bitmap.
- The cover image is explicitly laid out and painted across two animation frames before the loading layer is removed.
- Prevents the initial blank/white cover that only appeared after swiping away and back.
