# Email Campaign Checklist

> **Source:** $100M Money Models Blueprint: Email/SMS Copy - Alex Hormozi
> **Pattern:** SC-CL-001 (Checklist Standard)
> **Version:** 1.0.0
> **Extracted:** 2026-02-10
> **Agent:** hormozi-copy

---

## Pre-Campaign Setup

### List & Segmentation
- [ ] Registration list identified and cleaned
- [ ] Purchase history imported
- [ ] Cart abandonment tracking configured
- [ ] Affiliate list separated
- [ ] Exclusion rules defined:
  - [ ] Purchasers excluded from upsell sequences
  - [ ] Previous affiliates excluded from recruitment
  - [ ] Cart abandoners routed to recovery sequence
- [ ] Merge variables tested ({FNAME}, {{smart_link}}, etc.)
- [ ] Fallback values set for empty fields

### Platform Configuration
- [ ] Email automation platform configured (HubSpot)
- [ ] SMS platform integrated (Twilio/SMSBump)
- [ ] Shopify/E-commerce webhooks active
- [ ] Calendar integration tested
- [ ] Smart link generation verified
- [ ] UTM parameters standardized
- [ ] Tracking pixels installed

### Deliverability Preparation
- [ ] Sender domain authenticated (SPF, DKIM, DMARC)
- [ ] IP reputation checked
- [ ] Warm-up plan in place (if new domain)
- [ ] Spam score tested (<5)
- [ ] Unsubscribe process verified
- [ ] CAN-SPAM/GDPR compliance verified

---

## Registration Sequence Checklist

### Email b1: Confirmation ("You're registered")
- [ ] Subject: "You're registered. (Save this email)"
- [ ] Opens with congratulations + name
- [ ] "PLEASE SAVE THIS EMAIL" instruction included
- [ ] Event details present:
  - [ ] Platform (YouTube Live)
  - [ ] Date
  - [ ] Time with timezone (PT + ET)
- [ ] Calendar link functional
- [ ] PS about pre-order/shipping
- [ ] Trigger: Immediate on form submit
- [ ] SMS companion sent

### Email b2: VIP Upsell (15 minutes)
- [ ] Subject: "in case you missed this"
- [ ] Confirms already registered
- [ ] VIP benefits listed with checkmarks:
  - [ ] Vegas day entry
  - [ ] Book first + guaranteed
  - [ ] Private VIP livestream
  - [ ] Launch Workshop
- [ ] "Same price" reminder
- [ ] Mystery tease PS ("better than NFT...")
- [ ] CTA to VIP page
- [ ] Trigger: 15 min after registration
- [ ] Exclusion: purchased = true, abandoned = true

### Email b3: VIP Follow-up (24 hours)
- [ ] Subject: "Get your book first + VIP Livestream"
- [ ] "Helps warehouse team" rationale
- [ ] Full VIP benefit list
- [ ] Price clearly stated ($29.99 + SH)
- [ ] "Secret Project" tease
- [ ] Calendar reminder link
- [ ] Trigger: 24h after registration
- [ ] Exclusion: purchased = true

### Email b4: Affiliate Invitation (48 hours)
- [ ] Subject: "Win a day with me (free)"
- [ ] Social proof (32,000 previous affiliates)
- [ ] Prize framing ("benefit you AND them")
- [ ] refer.acq.com link
- [ ] "Just 10 people" accessibility note
- [ ] Behind-the-scenes promise
- [ ] Trigger: 48h after registration
- [ ] Exclusion: previous affiliates

### Email b5: Affiliate Follow-up (72 hours)
- [ ] Subject: "Free Audiobook + Book Launch Event"
- [ ] Specific prize breakdown:
  - [ ] 70 Profit Tactics Audiobook
  - [ ] Chance at Vegas day
  - [ ] Recording of day
- [ ] "Biggest prize" tease
- [ ] Terms & Conditions link
- [ ] Trigger: 72h after registration
- [ ] Exclusion: previous affiliates

---

## Pre-Launch Sequence Checklist

### Email 1: Announcement (45 days)
- [ ] Subject: "I've got a new book"
- [ ] Personal "Hey, Alex here" opening
- [ ] Book name and launch date
- [ ] Registration + preorder CTA
- [ ] Money Model definition
- [ ] "Crowning achievement" positioning
- [ ] Mystery project tease PS
- [ ] Full list send + new registrants
- [ ] SMS companion sent

### Email 2: Official Invitation (41 days)
- [ ] Subject: "[Your Invite Inside]"
- [ ] Official invitation positioning
- [ ] Mystery giveaway reminder
- [ ] "Show up live" requirement
- [ ] Vegas drawing mention
- [ ] Pre-order link
- [ ] Full list send

### Email 3: Value Explanation (35 days)
- [ ] Subject: "What's a money model?"
- [ ] Clear definition
- [ ] Four parts explained:
  - [ ] Attraction Offers
  - [ ] Upsell Offers
  - [ ] Downsell Offers
  - [ ] Continuity Offers
- [ ] "Magic when combined" messaging
- [ ] Refer friends link
- [ ] Full list send

### Email 4: Social Proof (28 days)
- [ ] Subject: "[new pic] - shipment of books"
- [ ] Real photos of books/warehouse
- [ ] "I need your help" appeal
- [ ] Warehouse team rationale
- [ ] Full VIP benefit list
- [ ] "Get yours first" urgency
- [ ] Full list send

### Email 5: Mystery Amplification (19 days)
- [ ] Subject: "I'm giving something HUGE away...LIVE"
- [ ] Mystery giveaway focus
- [ ] Two-step requirement:
  - [ ] Register
  - [ ] Show up live
- [ ] "How will we know" explanation
- [ ] "Entrepreneur event of the year"
- [ ] Full list send

### Email 6: Logistics (14 days)
- [ ] Subject: "Bigger than..."
- [ ] Clear event details:
  - [ ] Platform: YouTube Live
  - [ ] Date
  - [ ] Time with timezone
- [ ] "6+ Madison Square Gardens" context
- [ ] Check-inbox instruction
- [ ] Headliner tease PS
- [ ] Full list send

### Email 7: Headliner Reveal (11 days)
- [ ] Subject: "5 Mystery headliners...1 event...free?"
- [ ] Headliners described by results (not names):
  - [ ] Service business titan
  - [ ] Professional services exit
  - [ ] Software entrepreneur
- [ ] "What would you ask?" framing
- [ ] "FREE" emphasis
- [ ] VIP upgrade CTA for questions
- [ ] Full list send

### Email 8: Content Sneak Peek (9 days)
- [ ] Subject: "Money Models (sneak peek)"
- [ ] Table of contents image included
- [ ] "Get amped" energy
- [ ] Registration reminder
- [ ] Mystery giveaway PS
- [ ] Full list send

### Email 9: Meta-Book Reveal (7 days)
- [ ] Subject: "Did you miss this?"
- [ ] Meta-book explanation
- [ ] Previous books connected:
  - [ ] $100M Offers - offer example
  - [ ] $100M Leads - advertising example
  - [ ] $100M Money Models - monetization
- [ ] "Most powerful book" positioning
- [ ] "Expect fireworks" close
- [ ] Full list send

---

## Abandoned Cart Sequence Checklist

### Email 1: Immediate Recovery (20 minutes)
- [ ] Subject: "Pre-order checkout failed"
- [ ] Acknowledges registration
- [ ] "Checkout didn't go through"
- [ ] VIP benefits with checkmarks
- [ ] "Same price" reminder
- [ ] {{smart_link}} included
- [ ] Warehouse team rationale
- [ ] Trigger: 20 min after abandon
- [ ] Exclusion: purchased = true

### Email 2: Comparison (24 hours)
- [ ] Subject: "Pre-order checkout failed x 2"
- [ ] Option 1 vs Option 2 format:
  - [ ] Option 1 (wait): X marks
  - [ ] Option 2 (pre-order): Checkmarks
- [ ] Same price emphasized
- [ ] {{smart_link}} with saved info
- [ ] Trigger: 24h after abandon
- [ ] Condition: still abandoned

### Email 3: Deadline (48 hours)
- [ ] Subject: "Smart link expires tonight"
- [ ] Specific deadline (11:59 pm PT)
- [ ] "Why the hard stop?" explanation
- [ ] "Urgency drives action" self-reference
- [ ] {{smart_link}} in body and PS
- [ ] "<15 seconds" completion time
- [ ] Trigger: 48h after abandon
- [ ] Condition: still abandoned

### Bundle-Specific Recovery (15/200/800 books)
- [ ] Appropriate subject for tier
- [ ] Tier-specific bonuses highlighted:
  - [ ] 15-book: ACQ Closer + Ads Handbooks
  - [ ] 200-book: AI, Workshop, 12 Playbooks
  - [ ] 800-book: Scale Advisory access
- [ ] Extended sequence (5 emails for high-value)
- [ ] Phone support offered for 800-book

---

## Event Reminder Sequence Checklist

### 48-Hour Reminder
- [ ] Subject: "48 Hours Until the $100M Money Models..."
- [ ] "You're officially registered" confirmation
- [ ] All event details:
  - [ ] Date
  - [ ] Time
  - [ ] Zoom Link
  - [ ] Passcode
- [ ] "Camera-on, live experience" instructions
- [ ] Participation guidelines:
  - [ ] Camera on
  - [ ] Stay in frame
  - [ ] Mute mic
  - [ ] Stay present
- [ ] Trigger: 48h before event

### 24-Hour Reminder
- [ ] Subject: "Final Countdown..."
- [ ] "24 hours away" urgency
- [ ] "Your presence means a lot" personal touch
- [ ] Full event details repeated
- [ ] "Not just another livestream" positioning
- [ ] Trigger: 24h before event

### 1-Hour Reminder
- [ ] Subject: "goes live in 1 hour!"
- [ ] Short, high-energy
- [ ] Just time and link
- [ ] "Cameras on!" reminder
- [ ] "Let's make history" close
- [ ] Trigger: 1h before event

### SMS Reminders
- [ ] Welcome SMS with opt-out
- [ ] 24h reminder SMS
- [ ] 1h reminder SMS
- [ ] Compliance verified

---

## Post-Event Sequence Checklist

### Purchase Confirmations
- [ ] VIP-only confirmation
- [ ] VIP + 15 books confirmation
- [ ] 1-book purchase confirmation
- [ ] 200-book bundle confirmation
- [ ] 800-book Scale Advisory confirmation
- [ ] Each includes:
  - [ ] "PLEASE READ & SAVE THIS"
  - [ ] Shipping expectations
  - [ ] Bonus access links
  - [ ] SHOP app recommendation
  - [ ] Multiple order clarification

### Redemption Codes
- [ ] 15-book code email
- [ ] 14-book code email
- [ ] 199-book code email
- [ ] 214-book code email
- [ ] 800-book code email
- [ ] Each includes:
  - [ ] Unique code
  - [ ] Redemption count
  - [ ] Instructions
  - [ ] Expiration date (1 year)
  - [ ] Auto-donation clause

### Post-Event Upsells (Skool)
- [ ] SMS 1: Tuesday evening
- [ ] SMS 2: Friday evening
- [ ] SMS 3: Saturday 6pm (final)
- [ ] Email Cart Close 1: "One more free gift"
- [ ] Email Cart Close 2: "$15,961/month" social proof
- [ ] Email Cart Close 3: "First bonuses gone"
- [ ] Email Cart Close 4: "24hrs left"
- [ ] Email Cart Close 5: "[2 HRS LEFT]"

---

## Affiliate Sequence Checklist

### Recruitment Emails
- [ ] Full list blast with prizes
- [ ] Follow-up blast (specific prizes)
- [ ] Previous affiliates targeted email
- [ ] Follow-up for previous affiliates
- [ ] Last chance email with blackbook
- [ ] SMS companions for key emails

### Post-Registration Sequence
- [ ] Welcome + first goodie (Blackbook)
- [ ] New ads preview (weekly)
- [ ] Leaderboard update (weekly)
- [ ] 1-week left update
- [ ] Big reveal (2 days before)
- [ ] Birthday surprise (Leila email)

### Post-Event Affiliate
- [ ] Event wrapup with results
- [ ] Audiobook access (10+ referrals)
- [ ] Top 10 winner notification
- [ ] Top 11-50 notification
- [ ] Giveaway winner notification

---

## Quality Gates Checklist

### Before Any Send
- [ ] Segment verified
- [ ] Exclusions applied
- [ ] Subject line <60 characters
- [ ] Preview text set
- [ ] Spam score <5
- [ ] All links validated
- [ ] Merge fields tested
- [ ] Mobile preview checked
- [ ] Send time optimal
- [ ] Test send completed

### Campaign Level
- [ ] Full sequence mapped
- [ ] Triggers configured
- [ ] Delays set correctly
- [ ] Conditions validated
- [ ] A/B tests planned
- [ ] Tracking configured

### Compliance
- [ ] CAN-SPAM compliant
- [ ] GDPR compliant (if applicable)
- [ ] Unsubscribe functional
- [ ] Physical address included
- [ ] SMS opt-out included

---

## Metrics Tracking Checklist

### Per Email
- [ ] Open rate tracked
- [ ] Click rate tracked
- [ ] Conversion tracked
- [ ] Unsubscribe tracked
- [ ] Bounce rate tracked
- [ ] Spam complaints tracked

### Per Sequence
- [ ] Sequence completion rate
- [ ] Drop-off points identified
- [ ] Best performing emails
- [ ] Worst performing emails

### Campaign Level
- [ ] Registration to purchase rate
- [ ] VIP upgrade rate
- [ ] Cart recovery rate
- [ ] Event show rate
- [ ] Revenue per email
- [ ] Overall ROI

---

## Post-Campaign Review

### Performance Analysis
- [ ] Open rates by email
- [ ] Click rates by email
- [ ] Conversion by sequence
- [ ] Revenue attribution
- [ ] A/B test results

### Optimization Opportunities
- [ ] Subject line learnings documented
- [ ] CTA learnings documented
- [ ] Timing learnings documented
- [ ] Segment learnings documented

### Template Updates
- [ ] Winning variations saved
- [ ] Losing variations retired
- [ ] New patterns identified
- [ ] Checklist updated

---

## Emergency Procedures

### High Bounce Rate (>2%)
- [ ] Pause sends immediately
- [ ] Identify source of bad addresses
- [ ] Clean list
- [ ] Re-verify remaining addresses
- [ ] Resume with clean list

### Spam Complaints (>0.1%)
- [ ] Pause sends immediately
- [ ] Review content for triggers
- [ ] Check list acquisition method
- [ ] Add suppression rules
- [ ] Resume with modifications

### Wrong Link/Content Sent
- [ ] Identify affected recipients
- [ ] Prepare correction email
- [ ] Send correction within 1 hour
- [ ] Monitor for customer complaints
- [ ] Document for prevention

### Technical Failure
- [ ] Identify scope of failure
- [ ] Contact platform support
- [ ] Prepare backup send method
- [ ] Communicate delay if necessary
- [ ] Resume when resolved

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Campaign Manager | | | |
| Email Copywriter | | | |
| Automation Engineer | | | |
| Compliance Officer | | | |

---

**Checklist Version:** 1.0.0
**Total Checkpoints:** 250+
**Last Updated:** 2026-02-10



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
