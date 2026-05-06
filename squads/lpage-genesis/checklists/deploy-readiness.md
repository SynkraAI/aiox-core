# Deploy Readiness Checklist

## Build

- [ ] Build completes with zero errors?
- [ ] No TypeScript errors?
- [ ] No console.log/console.error in production?
- [ ] Environment variables set correctly?

## Assets

- [ ] All images optimized (WebP/AVIF)?
- [ ] CSS minified?
- [ ] JS minified and tree-shaken?
- [ ] Fonts loaded correctly?

## Content

- [ ] All placeholder text replaced?
- [ ] All links working (no 404s)?
- [ ] Forms submit correctly?
- [ ] CTA buttons have correct URLs?

## Security

- [ ] HTTPS enforced?
- [ ] No exposed API keys in source?
- [ ] CSP headers configured?
- [ ] No mixed content warnings?

## Quality Gates Passed

- [ ] Lighthouse Performance >= 90?
- [ ] Lighthouse Accessibility >= 90?
- [ ] Lighthouse SEO >= 90?
- [ ] Visual QA score >= 85?
- [ ] All 5 checklists passed?

## Deploy Config

- [ ] Correct site name set?
- [ ] Custom domain configured (if applicable)?
- [ ] SSL certificate active?
- [ ] Redirect rules set (if needed)?
- [ ] Analytics/tracking code inserted?

---

ALL items must pass before deploy authorization
