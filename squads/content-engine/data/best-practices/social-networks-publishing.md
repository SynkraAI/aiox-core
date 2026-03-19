---
id: social-networks-publishing
name: "Social Networks Publishing"
whenToUse: |
  Creating agents that publish content to Instagram, LinkedIn, X/Twitter,
  YouTube, or other social platforms.
  NOT for: copywriting, visual design, research, strategic planning.
version: "1.0.0"
---

# Social Networks Publishing — Best Practices

## Core Principles

1. **Never publish without explicit user confirmation.** This is the cardinal rule. Before any live post, present the full preview (platform, images, caption, hashtags) and wait for the user to confirm. A dry-run is not confirmation. The user must explicitly say "publish" or "go ahead" before any live API call is made.

2. **Dry-run first, always.** The first execution of any publishing workflow must be a dry-run (test mode). This validates that credentials are configured, images meet requirements, captions are within limits, and the API connection works. Only after a successful dry-run should the user be offered the option to publish for real.

3. **Validate platform requirements before attempting to publish.** Every platform has specific constraints. Validate all of them before making any API call. If validation fails, report the specific issue and suggest a fix before proceeding.

4. **Format content natively for each platform.** The same content may need reformatting for different platforms. Instagram captions use line breaks and 5-8 hashtags at the end. LinkedIn uses professional tone with 1-3 hashtags. X/Twitter needs concise messaging within character limits. Never publish the exact same raw text across all platforms without adaptation.

5. **Report publishing results immediately.** After every publish attempt, report the outcome clearly:
   - **Success**: Platform, post URL/permalink, post ID, timestamp
   - **Failure**: Platform, error message, HTTP status code, suggested fix
   - **Partial success** (multi-platform): Which platforms succeeded and which failed, with details for each

6. **Multi-platform publishing is sequential, not parallel.** When publishing to multiple platforms, publish to one at a time. Report the result of each before proceeding to the next. If one fails, ask the user whether to continue with remaining platforms or stop. Never fire-and-forget across all platforms simultaneously.

7. **Respect rate limits and warn proactively.** Track API usage against known rate limits. If the user is approaching a limit (e.g., 20 of 25 Instagram posts in 24 hours), warn them before the publish attempt, not after the error. Better to prevent a failed publish than to explain why it failed.

8. **Graceful handling of missing skills.** If the user requests publishing to a platform whose skill is not installed, do not error out. Instead: (a) list which platforms ARE available via installed skills, (b) explain which skill would be needed for the requested platform, (c) offer to proceed with available platforms only.

9. **Image format conversion when needed.** If images are in PNG format but the platform requires JPEG, inform the user and offer to convert. Do not silently convert or silently fail. Document any format transformations.

## Platform Requirements

Every platform has specific constraints that must be validated before making any API call.

### Instagram
- **Image format**: JPEG only
- **Image count**: 2-10 images for carousel
- **Caption length**: Max 2,200 characters
- **Rate limit**: 25 posts per 24 hours

### LinkedIn
- **Image format**: JPG/PNG
- **Image count**: Max 9 images
- **Caption length**: 3,000 character limit
- **Hashtags**: No hashtag walls. Keep to 1-3 relevant hashtags.

### X/Twitter
- **Image format**: JPG/PNG/GIF
- **Image count**: Max 4 images
- **Caption length**: 280 characters (or 25,000 for long-form)

### TikTok
- **Content type**: Video only for posts
- **Aspect ratios**: Platform-specific aspect ratios required

### YouTube
- **Thumbnail format**: JPG/PNG
- **Thumbnail size**: Max 2MB
- **Thumbnail dimensions**: 1280x720 minimum

## Publishing Workflow

1. **Receive content and identify targets.** Receive the approved content (images and text) from upstream agents or the user. Identify the target platform(s) for publication. If the user has not specified platforms, ask before proceeding.

2. **Check skill availability.** For each target platform, verify that the required publishing skill is installed:
   - Instagram: `instagram-publisher` skill
   - Multi-platform (LinkedIn, X, TikTok, etc.): `blotato` skill
   - If a required skill is missing, inform the user and list alternatives.

3. **Validate content against platform requirements.** For each target platform, check:
   - Image format and count (JPEG vs PNG, min/max images)
   - Caption length against character limit
   - Aspect ratio compatibility
   - Any platform-specific restrictions
   - If validation fails, report the specific issue and suggest a fix before proceeding.

4. **Present preview to user.** Show a clear, structured preview:
   ```
   PUBLISH PREVIEW
   Platform: Instagram (carousel)
   Images: 7 slides (slide-01.jpg through slide-07.jpg)
   Caption: [first 200 chars]... (1,847 / 2,200 chars)
   Hashtags: #marketing #contentcreation #socialmedia (3)
   Status: All validations passed
   ```

5. **Execute dry-run.** Run the publishing workflow in test mode:
   - Instagram: `--dry-run` flag on the publish script
   - Blotato: validate API connection and media upload without posting
   - Report dry-run results: credentials OK, media uploaded, container created, ready to publish.

6. **Request final confirmation.** Present the dry-run results and ask the user to confirm the live publish. Do not proceed without explicit approval.

7. **Publish and report.** Execute the live publish. Report the result immediately:
   - Success: post URL, post ID, platform, timestamp
   - Failure: error details, suggested fix, option to retry

8. **Multi-platform: repeat per platform.** If publishing to multiple platforms, repeat steps 3-7 for each platform sequentially. Report results after each one.

## Decision Criteria

- **Which skill to use**: Instagram-only content uses `instagram-publisher` (direct API, most control). Multi-platform or non-Instagram uses `blotato` (unified interface, broader reach). If both are available and the target is Instagram-only, prefer `instagram-publisher` for more granular control.
- **When to convert image formats**: Convert PNG to JPEG only when the platform strictly requires JPEG (Instagram carousel). Always inform the user before converting. Never silently convert.
- **When to split a caption**: If a caption exceeds the platform limit, present the full caption, highlight where the cut would happen, and ask the user to shorten it. Do not truncate automatically.
- **When to stop multi-platform publishing**: Stop and ask the user after any platform failure. The user decides whether to skip the failed platform and continue or abort entirely.

## Quality Criteria

- [ ] User confirmation was received before any live publish (not just dry-run)
- [ ] Dry-run was executed and passed before live publish
- [ ] All platform-specific validations passed (image format, dimensions, caption length, image count)
- [ ] Publish preview was presented with complete details (platform, images, caption, validation status)
- [ ] Successful publishes include post URL/permalink and post ID
- [ ] Failed publishes include error details, HTTP status, and suggested fix
- [ ] Multi-platform publishing was executed sequentially with per-platform reporting
- [ ] Rate limit status was checked and reported before publishing
- [ ] No caption was silently truncated or modified without user approval

## Output Examples

### Example 1: Instagram Carousel Publish Workflow

```
PUBLISH PREVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform:  Instagram (carousel)
Account:   @brandname
Skill:     instagram-publisher
Images:    7 slides
  1. slide-01.jpg (1080x1440, JPEG, 287KB)
  2. slide-02.jpg (1080x1440, JPEG, 195KB)
  3. slide-03.jpg (1080x1440, JPEG, 213KB)
  4. slide-04.jpg (1080x1440, JPEG, 178KB)
  5. slide-05.jpg (1080x1440, JPEG, 201KB)
  6. slide-06.jpg (1080x1440, JPEG, 192KB)
  7. slide-07.jpg (1080x1440, JPEG, 244KB)

Caption (1,847 / 2,200 chars):
  "You are doing 100 things to grow on Instagram.
   And ignoring the ONE that actually works.

   Here is what nobody tells you about organic growth:
   [... truncated for preview ...]

   Comment GUIDE below and I will DM you the full playbook.

   #instagramgrowth #socialmedia #contentcreator
   #digitalmarketing #organicgrowth"

VALIDATION
  Image format: JPEG (required: JPEG)
  Image count: 7 (required: 2-10)
  Image dimensions: 1080x1440 (valid carousel)
  Caption length: 1,847 chars (max: 2,200)
  Hashtags: 5 (recommended: 5-8)
  Rate limit: 3/25 posts used in last 24h

Status: All validations passed. Ready for dry-run.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DRY-RUN RESULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Credentials: Valid (token expires 2026-04-15)
  Image upload: 7/7 images uploaded to imgbb
  Media containers: 7/7 containers created
  Carousel container: Created successfully
  Publish: Skipped (dry-run mode)

Dry-run passed. Awaiting confirmation to publish live.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUBLISH RESULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Published successfully
  Platform:  Instagram
  Post URL:  https://www.instagram.com/p/ABC123xyz/
  Post ID:   17899506834567890
  Published: 2026-02-28 14:32:07 UTC
  Rate limit: 4/25 posts used in last 24h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Example 2: Multi-platform Publish with Partial Failure

```
MULTI-PLATFORM PUBLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Targets: Instagram, LinkedIn, X/Twitter
Skill:   blotato (multi-platform)

PLATFORM 1/3: Instagram
  Validation: All checks passed
  Dry-run:    Passed
  Publish:    Published successfully
  Post URL:   https://www.instagram.com/p/DEF456abc/
  Post ID:    ig_17899506834567890
  Published:  2026-02-28 14:35:12 UTC

PLATFORM 2/3: LinkedIn
  Validation: All checks passed
  Dry-run:    Passed
  Publish:    FAILED
  Error:      403 Forbidden — "Publishing permission not granted"
  HTTP Status: 403
  Suggested fix: The LinkedIn account may need re-authorization in Blotato.
    1. Go to Blotato Settings > Connected Accounts
    2. Disconnect and reconnect the LinkedIn account
    3. Ensure "Create posts" permission is granted during OAuth

  LinkedIn publish failed. Continue with remaining platforms?

  [User confirms: continue]

PLATFORM 3/3: X/Twitter
  Validation: Caption exceeds 280 chars (1,847 chars)
    Original caption is too long for X/Twitter.
    Options:
    a) Use the first 277 chars + "..."
    b) Provide a custom short caption for X/Twitter
    c) Skip X/Twitter

  [User chooses: b, provides short caption]

  Validation: All checks passed (short caption: 142 chars)
  Dry-run:    Passed
  Publish:    Published successfully
  Post URL:   https://x.com/brandname/status/1234567890123456789
  Post ID:    tw_1234567890123456789
  Published:  2026-02-28 14:38:45 UTC

SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Instagram:  Published
  LinkedIn:   Failed (403 — re-authorize account)
  X/Twitter:  Published (with custom short caption)

  2/3 platforms published successfully.
  Action needed: Re-authorize LinkedIn account in Blotato.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Anti-Patterns

### Never Do

1. **Never publish without explicit user confirmation.** Dry-run success is not permission to go live. The user must explicitly confirm every publish. No exceptions, no shortcuts, no "I will just publish it since the dry-run passed."

2. **Never silently truncate captions.** If a caption exceeds the platform limit, present the issue to the user with options: shorten it, use a custom version, or skip the platform. Automatic truncation destroys the copy's structure and CTA.

3. **Never fire-and-forget across multiple platforms.** Multi-platform publishing must be sequential with reporting after each platform. If one fails, the user decides the next step. Parallel publishing hides failures and removes user control.

4. **Never ignore validation failures.** If any validation check fails (image format, caption length, aspect ratio, rate limit), stop the workflow and report the issue. Do not attempt to publish and "see what happens."

5. **Never report success without a URL.** "Published successfully" without a post URL is not verifiable. Every successful publish must include the post permalink. If the API does not return a URL, report that as a limitation.

6. **Never assume credentials are valid.** Always verify credentials during the dry-run phase. Tokens expire, permissions get revoked, accounts get disconnected. A credential check is part of every publish workflow.

7. **Never publish the same raw caption across all platforms without adaptation.** Instagram, LinkedIn, and X/Twitter have different formatting conventions, character limits, and audience expectations. At minimum, verify the caption fits the platform constraints. Ideally, suggest platform-specific adaptations.

### Always Do

1. **Present a structured preview before every publish.** Show: platform, account, images (with dimensions and format), caption (with character count), hashtags, and validation status. The user must see exactly what will be published.

2. **Run a dry-run before every live publish.** Test the full workflow without posting. Verify credentials, upload media, create containers, validate everything. Report dry-run results before requesting confirmation.

3. **Report results immediately after each publish.** Do not batch results. After each platform publish (success or failure), report the outcome with all relevant details before moving to the next platform.

4. **Warn about rate limits proactively.** Check current API usage against known limits before starting the publish workflow. "You have used 23 of 25 Instagram posts in the last 24 hours" is better than "Rate limit exceeded" after a failed attempt.

## Vocabulary Guidance

### Use

- **"Publish preview"** — Always present a structured preview before any publish action. Use this exact header.
- **"Dry-run result"** — Report test outcomes with this label. Clear distinction from live publishes.
- **"Published successfully: [URL]"** — The success message always includes the post URL/permalink.
- **"Validation passed/failed"** — Binary status for each platform requirement check.
- **"Awaiting confirmation"** — The explicit state when waiting for user approval to go live.
- **"Platform requirements"** — Reference specific constraints by platform name and numbers.
- **"Rate limit: X/Y used"** — Proactive reporting of API usage against limits.

### Avoid

- **"I will go ahead and publish"** — Never announce publishing without having received explicit confirmation first.
- **"Published"** without a URL — Every success claim must include a verifiable post link.
- **"It should work"** or **"probably fine"** — Publishing status is binary: validated or not, succeeded or failed.
- **"Oops"** or casual language for failures — Publish failures are serious. Report them professionally with error details and next steps.
- **Em dashes** — Use periods, colons, or line breaks instead.
