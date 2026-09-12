# V120 — Private Share Story

V120 adds Moonbeam's family-sharing loop while preserving the existing V118/V119 reader and narration behaviour for owners.

## What is new
- A **Share Story** button appears on the owner's final **The End** page for both newly generated and previously saved stories.
- Unsaved stories are permanently saved (canonical text + permanent illustrations) before sharing.
- Sender chooses the display name recipients see and can add up to 10 recipient name/email pairs.
- Each recipient receives a separate Resend email and a separate cryptographically random private link. No CC/BCC disclosure.
- `/shared/<token>` opens directly into a restricted shared-story shell that reuses the normal Moonbeam cover, reader, illustrations, highlighting, auto-scroll and page navigation. No recipient account is required.
- Shared readers get both **Read It Myself** and **Read to Me**. Shared narration regenerates audio only and is allowed only when the requested text exactly belongs to the valid, non-revoked shared story.
- Private saved artwork remains private in Supabase. `/api/shared-asset` validates the share token before proxying only the artwork belonging to that story.
- Shared readers cannot enter the sender's account/setup/library. The final page instead offers **Create my story** and returns to Moonbeam's public acquisition flow.
- The owner can reopen Share Story to see prior recipients, see whether a link has been opened, and revoke individual links.
- Recipient email addresses are stored only as share-delivery records; V120 does not subscribe recipients to marketing.

## Required deployment step
Run `SUPABASE_V120_STORY_SHARING.sql` once in the Supabase SQL editor before deploying V120.

V120 uses the existing `RESEND_API_KEY`. Optional environment variables:
- `RESEND_SHARE_FROM` (defaults to `Moonbeam Stories <noreply@mail.moonbeamstories.co.uk>`)
- `MOONBEAM_SITE_URL` (defaults to `https://www.moonbeamstories.co.uk`)

## API functions
V120 has 14 API functions. The three additions are `story-share.js`, `shared-story.js`, and `shared-asset.js`. Shared narration is handled by the existing `narrate.js` endpoint.
