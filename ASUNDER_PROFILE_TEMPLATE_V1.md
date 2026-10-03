# Asunder Profile Page V1 — fixed canonical architecture

Production blank reference: `assets/asunder-profile-template-v1.png`

This page is the story/chapter title page for every one of the four top-level stories in an Asunder-format volume.

## Fixed architecture — never redesign per character
- Story number only above the profile screenshot, e.g. `1.3`.
- ASUNDER wordmark/header and “VERIFIED MEMBER PROFILE” treatment.
- Large portrait area on the left.
- First name only as the visible profile name. Never display a surname.
- Right-hand facts in this exact order: Age; Current city; Background; Relationship status; Member type; Member since; Availability; Travel windows; Verification.
- “ABOUT ME” panel beneath.
- “MEMBER TAGS” panel beneath the bio.
- Fixed luxury ivory/charcoal/muted-gold visual language and fixed typography/spacing.

## Fields Moonbeam must complete for each new woman
- first_name — visible; first name only
- full_name — internal continuity record only; never render the surname on the Asunder page
- age — exact adult age assigned in canon
- current_city
- background — concise nationality/cultural background already established in canon
- relationship_status
- member_type
- member_since
- availability
- travel_windows
- verification — normally “Verified Member”
- bio — concise first-person Asunder profile copy; alluring/refined, not a prose dump of her whole biography
- tags — character-specific platform metadata
- portrait_path — the canonical generated profile portrait

## Canonical portrait rules
Before prose drafting, Moonbeam must create a detailed physical identity and biography for each new principal young wife, then generate her canonical portrait. The portrait must match her assigned adult age and established description. All such women are petite, but bust size/body proportions, ethnicity/background, face, colouring, hair, styling, outfit, pose and setting must vary naturally between individuals. They should be exceptionally attractive. Clothing should look expensive and seductive but character-appropriate; valid settings include high-end domestic interiors, beaches, yachts, terraces, villas, travel locations and refined social settings. Do not default every woman to a cocktail dress or hotel bar.

If a woman already has a canonical Asunder profile record, reuse the exact saved record and portrait. Do not regenerate or redesign her page.

## Prose continuity rule
The canonical profile/portrait is binding continuity. Manuscript prose must not contradict it, but it must not mechanically redescribe the image/profile. Reinforce only occasional relevant attributes naturally while getting on with the story.


## Production-asset separation (V252.148)

The PNG contains no generation instructions, examples or sample profile values. It is a clean visual shell only. All generation instructions live in this Markdown specification and in the server-side Fiction Studio prompts. Moonbeam must never render instructional copy into a published profile page.

The only text that is structural and therefore remains part of the template is the Asunder branding, the fixed field labels, `ABOUT ME`, `MEMBER TAGS`, `VERIFIED MEMBER PROFILE`, and footer branding. The story number, first name, portrait, field values, biography and tags are variable overlays supplied for the individual woman.
