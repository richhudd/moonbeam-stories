# Moonbeam Stories V31

Based on V30.

## V31 change
- Replaces the small inline loading state with an unmistakable full-screen animated hourglass overlay while a story is being generated.
- Forces two browser animation frames before starting the OpenAI request so iOS Safari paints the loading state immediately instead of coalescing it with the fetch.
- The overlay remains until the story succeeds or fails, then closes automatically.
- Retains V30 cover/title isolation and all earlier mobile reader changes.
