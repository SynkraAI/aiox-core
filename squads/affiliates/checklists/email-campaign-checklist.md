# Email Campaign Checklist

> Validate deliverability, compliance, and quality of every email campaign before sending.

**Fase:** Email
**Usado por:** `workflows/email-sequence-launch.md`, `tasks/email-qa.md`
**Items:** 9

---

## Checklist

- [ ] **SPF/DKIM/DMARC configured** — Sending domain has valid SPF record, DKIM signature enabled in ESP, and DMARC policy set to at least `p=none` with monitoring; verify via MXToolbox or mail-tester.com
- [ ] **Unsubscribe link functional** — One-click unsubscribe link present in email footer; clicking it removes subscriber from list within 10 business days (CAN-SPAM) or immediately (LGPD/GDPR); test with real click
- [ ] **Mobile responsive email** — Email renders correctly on iOS Mail, Gmail Android, and Outlook Mobile; single-column layout preferred; minimum 14px body font; CTA button minimum 44px tall
- [ ] **Spam score < 5 (test with mail-tester)** — Email achieves score of 5/10 or higher on mail-tester.com before send; review and fix any flagged elements (image-to-text ratio, spammy words, missing alt text)
- [ ] **LGPD consent documented** — Each subscriber on the list has a documented consent record (timestamp, source, consent text); consent is freely given, specific, and informed; data processor details on file
- [ ] **Subject line A/B test prepared** — At least 2 subject line variants created; A/B test configured in ESP with defined winner criteria (open rate or click rate) and minimum sample size before automatic selection
- [ ] **Preview text optimized** — Preview/preheader text set explicitly in email template (not left to ESP default); complements rather than repeats the subject line; 40-90 characters for optimal display
- [ ] **Links tracked with UTM** — Every link in the email includes UTM parameters (source=email, medium=email, campaign={campaign-name}); links tested to confirm they resolve to correct destination pages
- [ ] **Sent from warm domain (not cold)** — Sending domain or subdomain has at least 30 days of sending history with gradual volume ramp-up; new domains must complete warming protocol before campaign send

---

*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
