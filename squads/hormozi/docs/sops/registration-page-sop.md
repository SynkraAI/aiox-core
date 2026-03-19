# Registration Page SOP

> **Source:** $100M Money Models Blueprint - Registration Page Content & Main Offer Landing Page
> **Pattern:** SC-PE-001 (SOP Extraction Standard)
> **Version:** 1.0.0
> **Extracted:** 2026-02-10

---

## Part 1: Purpose

Create registration pages for events, webinars, and launches that maximize opt-in conversions while building anticipation and pre-qualifying prospects for future offers. A registration page is NOT a sales page - it captures commitment and creates the foundation for the entire launch sequence.

**Core Philosophy:**
```
Registration Page = Commitment Device + Anticipation Builder + Lead Qualifier

Unlike landing pages that sell, registration pages:
├── Capture COMMITMENT (email, calendar block, mental investment)
├── Build ANTICIPATION (mystery, curiosity, FOMO)
├── Pre-QUALIFY (segment by engagement level)
└── Create ASCENSION PATH (free → VIP → premium)
```

**The Hormozi Registration Framework:**
"Pergunta rapida. Posso pegar seu endereco de email? Porque quero convida-lo para o maior evento de empreendedores da temporada." (Source: Pre_Event_Registration_VSL.md, line 5)

**Business Impact:** With proper registration page optimization, Hormozi achieved "mais de 1.000.000+ registrations by launch day" (Source: Registration_Page_Content.md, line 13). Registration is the gateway to the entire launch funnel - get this wrong, and everything downstream fails.

---

## Part 2: Scope

### When This SOP Applies
- Creating registration pages for live events (virtual or in-person)
- Book launch registrations
- Webinar/workshop signups
- Product launch waitlists
- Free training registrations
- Challenge/bootcamp enrollments

### When This SOP Does NOT Apply
- Direct sales pages (use Landing Page SOP)
- Lead magnet download pages
- General content opt-ins
- Checkout/purchase pages

### Business Types
- Info-product businesses launching events
- SaaS companies doing webinars
- Coaches/consultants running workshops
- E-commerce businesses doing launch events
- Any business using event-based marketing

---

## Part 3: Preconditions

| Precondition | Requirement | Validation |
|--------------|-------------|------------|
| Event Definition | Date, time, platform finalized | "Aug 16, 2025 and starts at 9am Pacific / 12pm Eastern" (Source: Registration_Page_Content.md, line 13) |
| Hook/Promise | Clear value proposition for event | "giving them all away - LIVE - at the book launch" (Source: line 13) |
| Mystery Element | Something unrevealed to build curiosity | "something else I've quietly worked on for over a year" (Source: line 13) |
| Ascension Path | Post-registration upsell ready | VIP upgrade path documented |
| Technical Stack | Registration form, email automation, calendar integration | "Todas as nossas paginas de funil estao hospedadas na Loja eCommerce com formularios hubspot incorporados" (Source: Main_Offer_Landing_Page.md, line 104) |
| Follow-up Sequences | Post-registration email flow ready | SMS + Email sequences documented |

---

## Part 4: Core Framework (Registration Page Architecture)

### The 5-Part Registration Framework

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REGISTRATION PAGE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ PART 1: THE HOOK (0-3 seconds)                                              │
│ ├── Authority Statement                                                      │
│ ├── Event Promise                                                           │
│ └── Registration CTA                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ PART 2: THE PROOF (Value Stack)                                             │
│ ├── Credentials & Results                                                    │
│ ├── What They'll Learn                                                       │
│ └── Why It Matters                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ PART 3: THE MYSTERY (Curiosity Driver)                                       │
│ ├── Secret/Surprise Tease                                                    │
│ ├── Exclusivity Element                                                      │
│ └── FOMO Trigger                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ PART 4: THE FORM (Friction Minimization)                                     │
│ ├── Minimal Fields (Email + Name)                                            │
│ ├── Single CTA                                                               │
│ └── Privacy Assurance                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PART 5: THE POST-REGISTRATION FLOW                                           │
│ ├── Immediate Confirmation                                                   │
│ ├── Calendar Integration                                                     │
│ ├── VIP Upsell                                                               │
│ └── Referral Opportunity                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Registration-to-Revenue Funnel

```
Registration Opt-in → VIP Upgrade → Pre-Order → Live Event → Premium Offer
        ↓                 ↓              ↓            ↓             ↓
    Free Entry      $29.99 Book    15/200 Books   Engagement    $5,998+
```

**Source:** "Oferta de Pre-Pedido: Teremos uma oferta VIP de pre-pedido que direcionara clientes que se registram para a chamada para pre-encomendar sua copia e fazer upgrade para VIP." (Main_Offer_Landing_Page.md, line 120)

---

## Part 5: Process Steps

### PHASE 1: PRE-REGISTRATION PAGE SETUP

#### Step 1.1: Define Event Core Details
| Field | Value |
|-------|-------|
| **Description** | Establish all event parameters before page creation |
| **Cognitive Type** | Planning/Organization |
| **Automation Potential** | LOW - Requires strategic decisions |
| **Executor** | Human (Event Owner) |
| **Precondition** | Business goal defined |
| **Output** | Event brief with date, time, platform, promise |
| **Guardrails** | Must include: Date (with timezone), Platform (YouTube Live, Zoom), Core Promise, Mystery Element |
| **Decision Rule** | "It's on Aug 16, 2025 and starts at 9am Pacific / 12pm Eastern" - Always include multiple timezones (Source: Registration_Page_Content.md, line 13) |

**Template:**
```
Event: [NAME]
Date: [DATE] at [TIME PT] / [TIME ET]
Platform: [YouTube Live / Zoom / Other]
Core Promise: [What they'll get]
Mystery Element: [What you're teasing but not revealing]
Registration Goal: [Number]
```

#### Step 1.2: Prepare Technical Infrastructure
| Field | Value |
|-------|-------|
| **Description** | Set up all technical systems before page launch |
| **Cognitive Type** | Technical Execution |
| **Automation Potential** | MEDIUM - Template-based |
| **Executor** | Worker (Tech Team) |
| **Precondition** | Event details finalized |
| **Output** | Working registration form, email automation, calendar links |
| **Guardrails** | Must test: Form submission, email delivery, calendar add |
| **Decision Rule** | "Todas as nossas paginas de funil estao hospedadas na Loja eCommerce com formularios hubspot incorporados para capturar dados. Cada pagina tem um subdominio Vanity URL" (Source: Main_Offer_Landing_Page.md, line 104) |

**Required Integrations:**
- Registration form (HubSpot, etc.)
- Email automation platform
- SMS platform
- Calendar integration (Google, Apple, Outlook)
- Vanity URL subdomain

#### Step 1.3: Create Registration-to-VIP Ascension Path
| Field | Value |
|-------|-------|
| **Description** | Map the complete journey from registration to purchase |
| **Cognitive Type** | Strategic Planning |
| **Automation Potential** | LOW - Requires strategy |
| **Executor** | Human (Marketing Lead) |
| **Precondition** | Products/offers defined |
| **Output** | Complete funnel map with pages and automations |
| **Guardrails** | Each step must provide value AND advance toward purchase |
| **Decision Rule** | Follow the proven path: "Opt-in de Registro → Pagina de Vendas VIP (VSL) → Pagina de Checkout → Pagina de obrigado (VSL)" (Source: Main_Offer_Landing_Page.md, lines 106-115) |

---

### PHASE 2: REGISTRATION PAGE COPY

#### Step 2.1: Create Hook/Opening
| Field | Value |
|-------|-------|
| **Description** | Write the opening that immediately captures attention and states the invitation |
| **Cognitive Type** | Copywriting |
| **Automation Potential** | LOW - Requires human creativity |
| **Executor** | Human (Copywriter) |
| **Precondition** | Event details defined |
| **Output** | Opening hook that transitions into registration ask |
| **Guardrails** | Must be conversational, direct, and immediately state the value |
| **Decision Rule** | Use the direct invitation formula: "Pergunta rapida. Posso pegar seu endereco de email? Porque quero convida-lo para o maior evento de empreendedores da temporada." (Source: Pre_Event_Registration_VSL.md, line 5) |

**Hormozi Hook Template:**
```
"Pergunta rapida. Posso pegar seu [EMAIL/INFO]?
Porque quero convida-lo para [THE BIGGEST/MOST VALUABLE EVENT DESCRIPTION].
Eu gastei [INVESTMENT] neste evento."
```

#### Step 2.2: Establish Authority
| Field | Value |
|-------|-------|
| **Description** | Quickly establish why you're worth listening to |
| **Cognitive Type** | Trust Building |
| **Automation Potential** | LOW |
| **Executor** | Human |
| **Precondition** | Credibility metrics available |
| **Output** | 2-3 sentence authority statement with quantifiable results |
| **Guardrails** | Numbers must be real and verifiable |
| **Decision Rule** | Lead with portfolio results, not personal brags: "Eu sou dono da acquisition.com. Sao empresas do portfolio que fizeram mais de 250 milhoes de dolares no ano passado, e eu vendi tres empresas em 2021." (Source: Pre_Event_Registration_VSL.md, lines 6-9) |

**Authority Template:**
```
"I [OWN/RUN] [COMPANY].
[PORTFOLIO/CLIENTS] have done [SPECIFIC RESULT] in [TIMEFRAME].
I [PERSONAL ACCOMPLISHMENT with specific numbers]."
```

#### Step 2.3: Define the Event Value
| Field | Value |
|-------|-------|
| **Description** | Explain what they'll learn and why it matters |
| **Cognitive Type** | Value Communication |
| **Automation Potential** | LOW |
| **Executor** | Human |
| **Precondition** | Event content outline complete |
| **Output** | Clear articulation of takeaways |
| **Guardrails** | Focus on outcomes, not features |
| **Decision Rule** | Frame around the 4 business goals: "Todo negocio tem quatro objetivos principais em termos de ganhar dinheiro. Entao, um e conseguir que as pessoas entrem pela porta para comprar algo. Queremos que elas gastem mais dinheiro, queremos que facam isso em menos tempo. Queremos que facam isso repetidamente." (Source: Pre_Event_Registration_VSL.md, lines 11-13) |

**Value Framework:**
```
"Every business has [NUMBER] main goals when it comes to [TOPIC]:
1. [Goal 1 - Get people in]
2. [Goal 2 - Get them to spend more]
3. [Goal 3 - Get them to do it faster]
4. [Goal 4 - Get them to do it repeatedly]

This is exactly what I'll break down at the live event."
```

#### Step 2.4: Inject Mystery/Curiosity
| Field | Value |
|-------|-------|
| **Description** | Create an irresistible curiosity gap that can only be satisfied by attending |
| **Cognitive Type** | Psychological Persuasion |
| **Automation Potential** | LOW |
| **Executor** | Human |
| **Precondition** | Surprise/reveal planned for event |
| **Output** | Mystery hook that builds anticipation |
| **Guardrails** | MUST be real - never fake mystery. Deliver on the promise. |
| **Decision Rule** | Use the comparison framework: "E melhor que um NFT e custa menos que um Bitcoin" (Source: Pre_Event_Registration_VSL.md, line 17) |

**Mystery Template:**
```
"I've also been working on a secret project for over [TIME].
I won't tell you what it is yet, but I can tell you:
- It's better than [KNOWN VALUABLE THING]
- It costs less than [MORE VALUABLE THING]
- Every person who shows up live gets one FREE.

You have to be there live to get it."
```

#### Step 2.5: Create the Registration CTA
| Field | Value |
|-------|-------|
| **Description** | Write the simple, direct call-to-action |
| **Cognitive Type** | Conversion Optimization |
| **Automation Potential** | MEDIUM - Template-based |
| **Executor** | Hybrid |
| **Precondition** | Form ready |
| **Output** | Clear, simple CTA |
| **Guardrails** | Make it feel effortless |
| **Decision Rule** | Make it sound like the easiest thing ever: "Tudo que voce precisa fazer e uma coisa. Voce se inscreve abaixo e clica em enviar. E isso." (Source: Pre_Event_Registration_VSL.md, lines 20-21) |

**CTA Template:**
```
"All you have to do is ONE thing:
Enter your email below and click submit.
That's it."
```

#### Step 2.6: Add Social Proof Numbers
| Field | Value |
|-------|-------|
| **Description** | Display real-time or milestone registration numbers |
| **Cognitive Type** | Social Proof |
| **Automation Potential** | HIGH - Can be automated |
| **Executor** | Worker |
| **Precondition** | Tracking in place |
| **Output** | Dynamic or updated registration count |
| **Guardrails** | Numbers must be real. Update regularly. |
| **Decision Rule** | Show momentum: "Ja temos mais de 300.000 pessoas registradas. Provavelmente serao cerca de 500.000 quando o evento comecar" (Source: Pre_Event_Registration_VSL.md, lines 24-25) |

---

### PHASE 3: POST-REGISTRATION CONFIRMATION

#### Step 3.1: Immediate Confirmation Email
| Field | Value |
|-------|-------|
| **Description** | Send immediate confirmation with key details |
| **Cognitive Type** | Technical Execution |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Email automation configured |
| **Output** | Confirmation email delivered within seconds |
| **Guardrails** | Must include: Event details, Calendar link, VIP upsell, Save this email notice |
| **Decision Rule** | Subject line: "You're registered. (Save this email)" (Source: Registration_Page_Content.md, line 12) |

**Confirmation Email Elements:**
```
SUBJECT: "You're registered. (Save this email)"

1. Congratulations + Event Name
2. "PLEASE SAVE THIS EMAIL. IT HAS IMPORTANT BOOK LAUNCH DETAILS."
3. What you'll get at the event
4. Registration milestone ("We have A LOT OF PEOPLE registered already. Our goal is to pass 1,000,000+")
5. Event logistics:
   - Platform: "I will stream it on YouTube Live. No fancy tech. Just straight YouTube Live. You click. You're in. Simple."
   - Date/Time with multiple timezones
   - Calendar link: "Tap here to add it to your calendar"
6. Tease the mystery: "AND something else I've quietly worked on for over a year. It's finally ready...but...I can't say any more."
7. VIP upgrade mention
```

(Source: Registration_Page_Content.md, line 13)

#### Step 3.2: SMS Confirmation
| Field | Value |
|-------|-------|
| **Description** | Send immediate SMS confirmation |
| **Cognitive Type** | Technical Execution |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | SMS platform configured, phone number captured |
| **Output** | SMS delivered immediately |
| **Guardrails** | Keep under 160 characters, include opt-out |
| **Decision Rule** | Template: "Hey {Name}, it's [CREATOR] - you'll get [NUMBER] more launch texts: [X] reminders + [Y] goodies. Check email for details. Reply 'Stop' to stop." (Source: Registration_Page_Content.md, line 10) |

#### Step 3.3: Thank You Page with VIP Upsell
| Field | Value |
|-------|-------|
| **Description** | Create thank you page that presents VIP upgrade opportunity |
| **Cognitive Type** | Conversion |
| **Automation Potential** | MEDIUM |
| **Executor** | Hybrid |
| **Precondition** | VIP offer ready |
| **Output** | Thank you page with calendar add + VIP upsell |
| **Guardrails** | Don't be pushy - make it a no-brainer value add |
| **Decision Rule** | "Na pagina de agradecimento. Se voce quiser pre-encomendar uma copia do livro. Eu tenho quatro outros bonus incriveis para voce la. Voce pode fazer upgrade para VIP e literalmente e tudo gratis." (Source: Pre_Event_Registration_VSL.md, lines 21-22) |

**Thank You Page Structure:**
```
1. "You're In!" confirmation
2. Calendar integration buttons (Google, Apple, Outlook)
3. VIP Upgrade Section:
   "Now if you think you're gonna [ACTION] at the event, you might as well [PRE-ACTION] and get instantly upgraded to VIP which includes:
   ✅ [VIP Benefit 1]
   ✅ [VIP Benefit 2]
   ✅ [VIP Benefit 3]
   ✅ [VIP Benefit 4]"
4. Affiliate/Referral CTA
```

---

### PHASE 4: REGISTRATION NURTURE SEQUENCE

#### Step 4.1: Quick Follow-Up (15 minutes)
| Field | Value |
|-------|-------|
| **Description** | Send quick reminder for those who didn't upgrade |
| **Cognitive Type** | Conversion |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Registered but not purchased |
| **Output** | Follow-up email |
| **Guardrails** | Only to non-purchasers |
| **Decision Rule** | Subject: "in case you missed this" - Timing: "Within 15 minutes of [Your Registered] Email" (Source: Registration_Page_Content.md, lines 21-23) |

**15-Minute Follow-Up Template:**
```
SUBJECT: "in case you missed this"

"FNAME - You're already registered for the [EVENT]. So you're good there.

Now if you think you're gonna [GET THE THING] at the event, you might as well [PRE-ACTION] and get instantly upgraded to VIP which includes:
✅ [VIP Benefit 1]
✅ [VIP Benefit 2]
✅ [VIP Benefit 3]
✅ [VIP Benefit 4]

→ [CTA LINK] ←"
```

(Source: Registration_Page_Content.md, line 24)

#### Step 4.2: 24-Hour Value Reminder
| Field | Value |
|-------|-------|
| **Description** | Reinforce value of upgrading to VIP |
| **Cognitive Type** | Persuasion |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Still registered, not upgraded |
| **Output** | Value-focused email |
| **Guardrails** | Focus on THEIR benefit, not your benefit |
| **Decision Rule** | Subject: "Get your book first + VIP Livestream" (Source: Registration_Page_Content.md, line 36) |

**24-Hour Template Elements:**
```
"I want to make [PRE-ACTION] worth your while because it helps [OPERATIONAL REASON].

So, if you [PRE-ACTION] before the event you'll get all the VIP upgrades for free:
✅ Automatic entry to [PRIZE]
✅ Get your [PRODUCT] guaranteed
✅ Get yours first
✅ [EXCLUSIVE ACCESS]
✅ [BONUS WORKSHOP]

Reminder: People who wait will pay the same price but don't get any of the VIP Benefits.

This means you get all the VIP bonuses for free if you simply [PRE-ACTION] for the same price."
```

(Source: Registration_Page_Content.md, lines 37-38)

#### Step 4.3: 48-Hour Affiliate Invitation
| Field | Value |
|-------|-------|
| **Description** | Invite registrants to become affiliates/referrers |
| **Cognitive Type** | Network Expansion |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Affiliate program set up |
| **Output** | Affiliate invitation email |
| **Guardrails** | Make prizes benefit BOTH referrer and friends |
| **Decision Rule** | Subject: "Win a day with me (free)" - Timing: "48 Hours After Your Registered Email" (Source: Registration_Page_Content.md, lines 43-45) |

**Affiliate Invitation Template:**
```
"~32,000 - that's how many people signed up to win absurd prizes, get behind the scenes play by plays of the launch, and brought friends last launch. And those 32,000 people brought 130,000+ people with them.

So...we want to give even crazier business centric prizes for anyone who wants to invite their: slack group, team, friend group, online community, email list, organic following, or just the people they know...to the launch.

It's pretty simple: you just give them a link to register for free. And when they do, you get credit for it.

But - so it's not weird - I made the prizes things that benefit you and them."
```

(Source: Registration_Page_Content.md, line 46)

---

### PHASE 5: ABANDONED REGISTRATION RECOVERY

#### Step 5.1: Cart/Form Abandonment Detection
| Field | Value |
|-------|-------|
| **Description** | Track users who started but didn't complete registration |
| **Cognitive Type** | Technical |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Tracking pixels and automation configured |
| **Output** | Abandonment trigger |
| **Guardrails** | Wait 20+ minutes before triggering |
| **Decision Rule** | "20min After Abandoned Cart #1" (Source: Registration_Page_Content.md, line 97) |

#### Step 5.2: Abandonment Recovery Email
| Field | Value |
|-------|-------|
| **Description** | Re-engage those who didn't complete registration |
| **Cognitive Type** | Recovery |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Form abandonment detected |
| **Output** | Recovery email with smart link |
| **Guardrails** | Use pre-filled smart links |
| **Decision Rule** | Subject: "Pre-order checkout failed" - Include smart link that preserves their info (Source: Registration_Page_Content.md, lines 99-100) |

**Abandonment Recovery Template:**
```
"FNAME - You're registered for the [EVENT] but your [ACTION] didn't go through.

I figure, if you think you're gonna [GET THE THING] at the event, you might as well [PRE-ACTION] and become a VIP for free while you still can.

VIPs get:
✅ [VIP Benefit 1]
✅ [VIP Benefit 2]
✅ [VIP Benefit 3]

To make it fast & easy, your info is still saved & you can checkout here:
→ {{smart_link}} ←"
```

---

### PHASE 6: PRE-EVENT COUNTDOWN SEQUENCE

#### Step 6.1: 45-Day Pre-Launch Announcement
| Field | Value |
|-------|-------|
| **Description** | Initial announcement to full list |
| **Cognitive Type** | Announcement |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Registration page live |
| **Output** | Launch announcement email + SMS |
| **Guardrails** | Include mystery tease from Day 1 |
| **Decision Rule** | SMS: "{Name}, it's [CREATOR]. Big news. New [PRODUCT]: [NAME]. Live launch: [DATE]. Register for free -> [LINK]" (Source: Registration_Page_Content.md, line 119) |

#### Step 6.2: Weekly Content Emails
| Field | Value |
|-------|-------|
| **Description** | Build anticipation with valuable content leading to event |
| **Cognitive Type** | Value Delivery |
| **Automation Potential** | MEDIUM |
| **Executor** | Hybrid |
| **Precondition** | Content calendar planned |
| **Output** | Weekly emails with event tie-ins |
| **Guardrails** | Each email must provide value AND build anticipation |
| **Decision Rule** | Pattern from source: 41d "Invitation inside", 35d "What's a Money Model?", 28d "Pics" (shipment photos), 19d "Secret giveaway", 14d "Bigger than...", etc. (Source: Registration_Page_Content.md, lines 125-219) |

**Countdown Email Cadence:**
```
45 days: Announcement + Registration CTA
41 days: Official Invitation
35 days: Content preview (what you'll learn)
28 days: Behind-the-scenes photos/preparation
19 days: Secret giveaway tease
14 days: "Bigger than..." + logistics reminder
11 days: Mystery headliners tease
9 days: Content sneak peek (table of contents)
7 days: Meta-concept explanation
4 days: Secret reveal tease
48 hours: Final details + checklist
24 hours: Final reminder + save link
```

#### Step 6.3: 48-Hour Checklist Email
| Field | Value |
|-------|-------|
| **Description** | Send detailed pre-event checklist |
| **Cognitive Type** | Logistics |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | 48 hours before event |
| **Output** | Comprehensive checklist email |
| **Guardrails** | Include ALL timezones, join early warning |
| **Decision Rule** | Subject: "(48hrs out) what you need to know" (Source: Registration_Page_Content.md, line 217) |

**48-Hour Checklist Template:**
```
"Mozination - Are you ready for [DATE/TIME]?

Here's your [EVENT] pre-launch checklist:

Step 1: Mark your Calendar for [DATE] at [TIME PT] / [TIME ET]
Step 2: [VIP UPGRADE CTA if applicable]
Step 3: For the best live experience, desktop is best.
Step 4: Send this email to a friend if you want them to come and get [SECRET THING]

Reminders:
- If you join LIVE, you will get [SECRET PROJECT] - free.
- We now have over [NUMBER] people registered for this event.

IMPORTANT: Due to larger volumes than expected, it is best to join 12-17 minutes early so you don't get stuck in line waiting to get in.

Book Launch Start by TIMEZONE on [DATE]:
North America:
- Pacific Time (PST) – [TIME]
- Mountain Time (MST) – [TIME]
- Central Time (CST) – [TIME]
- Eastern Time (EST) – [TIME]
[Continue for all relevant timezones...]"
```

(Source: Registration_Page_Content.md, line 218)

---

### PHASE 7: LAUNCH DAY COMMUNICATIONS

#### Step 7.1: 3-Hour Before Email
| Field | Value |
|-------|-------|
| **Description** | Final pre-event reminder |
| **Cognitive Type** | Reminder |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | 3 hours before event |
| **Output** | Short, urgent reminder |
| **Guardrails** | Different for VIP vs non-VIP |
| **Decision Rule** | Subject: "Live in ~3hrs" - Include: Save this link, Set an alarm, Last VIP upgrade chance (Source: Registration_Page_Content.md, lines 241-250) |

#### Step 7.2: 60-Minute Before Email
| Field | Value |
|-------|-------|
| **Description** | Stream is up, join early |
| **Cognitive Type** | Urgency |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | 60 minutes before, stream live |
| **Output** | "We're live" email |
| **Guardrails** | VIP gets unique link |
| **Decision Rule** | Subject: "We're live in 60min..." - Note: "The stream is up & live now. So you can hop on the livestream early" (Source: Registration_Page_Content.md, lines 257-269) |

#### Step 7.3: 15-Minute Before (We're Live)
| Field | Value |
|-------|-------|
| **Description** | Final "we're live" push |
| **Cognitive Type** | Urgency |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | 15 minutes before |
| **Output** | SMS + Email |
| **Guardrails** | Keep extremely short |
| **Decision Rule** | Subject: "WE ARE LIVE NOW (LINK INSIDE)" - Body: "Book Launch starts now. Hop on >>> [LINK]" (Source: Registration_Page_Content.md, lines 277-278) |

#### Step 7.4: During Event Reminders
| Field | Value |
|-------|-------|
| **Description** | Send reminders to those not watching |
| **Cognitive Type** | Re-engagement |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Event in progress |
| **Output** | Periodic "you're missing it" emails |
| **Guardrails** | Can use different sender (e.g., partner/spouse) for attention |
| **Decision Rule** | +15min: Use different sender - "It's Leila, I stole Alex's email. Just wanted to let you know Alex is live on youtube & murdering it!" (Source: Registration_Page_Content.md, line 296) |

---

## Part 6: Decision Rules

### DR-001: Registration Form Fields
```yaml
rule: MINIMAL_FORM_FIELDS
trigger: Form design
condition:
  - IF lead_magnet_event THEN fields = [email]
  - IF qualification_needed THEN fields = [email, name]
  - IF phone_for_SMS THEN fields = [email, name, phone]
  - IF fields > 3 THEN "FAIL - too much friction"
action: Use minimum fields necessary
rationale: "Voce se inscreve abaixo e clica em enviar. E isso." - Make it effortless
confidence: HIGH (Source: Pre_Event_Registration_VSL.md, line 21)
```

### DR-002: Mystery Element Required
```yaml
rule: CURIOSITY_GAP_REQUIRED
trigger: Registration page copy
condition:
  - IF mystery_element == null THEN "WARNING - weaker conversion"
  - IF mystery_element != deliverable THEN "FAIL - never fake"
action: Include real mystery that will be revealed live
rationale: "E melhor que um NFT e custa menos que um Bitcoin" creates irresistible curiosity
confidence: HIGH (Source: Pre_Event_Registration_VSL.md, line 17)
```

### DR-003: VIP Path Required
```yaml
rule: ASCENSION_PATH
trigger: Registration thank you page
condition:
  - IF vip_upsell == null THEN "WARNING - leaving money on table"
  - IF vip_value < registration_action THEN "REVISE"
action: Always present VIP upgrade on thank you page
rationale: "Se voce quiser pre-encomendar uma copia do livro. Eu tenho quatro outros bonus incriveis para voce la."
confidence: HIGH (Source: Pre_Event_Registration_VSL.md, line 21)
```

### DR-004: Timezone Inclusion
```yaml
rule: MULTIPLE_TIMEZONES
trigger: Any time mention
condition:
  - IF timezones < 2 THEN "FAIL"
  - IF major_regions_missing THEN "FAIL"
action: Include PT, ET minimum; full list for 48hr/24hr emails
example: "9am Pacific / 12pm Eastern" minimum, full world list for final emails
confidence: HIGH (Source: Registration_Page_Content.md, line 218)
```

### DR-005: Social Proof Numbers
```yaml
rule: REGISTRATION_MOMENTUM
trigger: Page content
condition:
  - IF registration_count_visible == false THEN "WARNING"
  - IF count_not_updated THEN "FAIL"
action: Show real, updated registration numbers
example: "Ja temos mais de 300.000 pessoas registradas"
confidence: HIGH (Source: Pre_Event_Registration_VSL.md, line 24)
```

### DR-006: Follow-Up Timing
```yaml
rule: NURTURE_SEQUENCE_TIMING
trigger: Post-registration automation
condition:
  - IF immediate_confirmation == false THEN "FAIL"
  - IF first_followup > 15_minutes THEN "WARNING"
  - IF no_24hr_followup THEN "WARNING"
  - IF no_48hr_affiliate THEN "WARNING"
action: Follow the timing pattern from source
sequence:
  - Immediate: Confirmation email + SMS
  - 15 minutes: VIP reminder (non-purchasers only)
  - 24 hours: Value reminder
  - 48 hours: Affiliate invitation
confidence: HIGH (Source: Registration_Page_Content.md)
```

### DR-007: Early Join Warning
```yaml
rule: JOIN_EARLY_WARNING
trigger: 48hr and 24hr emails
condition:
  - IF early_join_warning == false THEN "FAIL"
action: Include early join recommendation
text: "Due to larger volumes than expected, it is best to join 12-17 minutes early"
confidence: HIGH (Source: Registration_Page_Content.md, line 218)
```

---

## Part 7: Exceptions & Edge Cases

### Exception 1: Cold Audience Registration
**Trigger:** Audience doesn't know you
**Adjustment:**
- More authority proof needed
- Consider video on registration page
- May need to explain the value more thoroughly
- Social proof numbers extra important

### Exception 2: Paid Event Registration
**Trigger:** Event has a cost to attend
**Adjustment:**
- Registration becomes checkout
- Value stack more prominent
- Guarantee considerations
- Use Landing Page SOP instead

### Exception 3: Time-Limited Registration
**Trigger:** Limited spots or closing deadline
**Adjustment:**
- Add countdown timer
- "X spots remaining" counter
- Real scarcity messaging
- More aggressive follow-up

### Exception 4: International Audience
**Trigger:** Global audience base
**Adjustment:**
- Full timezone list in all emails
- Consider time-friendly scheduling
- Multiple reminder emails at local times
- Replay option if possible

### Exception 5: Multi-Day Event
**Trigger:** Event spans multiple days
**Adjustment:**
- Session-by-session reminders
- Day-specific calendar adds
- Recap emails between days
- Engagement tracking per session

---

## Part 8: Outputs

| Output | Format | Destination | Frequency |
|--------|--------|-------------|-----------|
| Registration Count | Dashboard | Marketing Manager | Real-time |
| Conversion Rate (Visit → Register) | Metric | Stakeholders | Daily |
| VIP Upgrade Rate | Metric | Revenue Team | Daily |
| Email Open/Click Rates | Report | Marketing | Per email |
| SMS Delivery/Response | Report | Marketing | Per SMS |
| Referral Signups | Dashboard | Affiliate Manager | Daily |

### Key Metrics to Track
```
PRIMARY:
├── Registration Conversion Rate (Target: >30% from targeted traffic)
├── VIP Upgrade Rate (Target: >5% of registrations)
├── Email Open Rate (Target: >40% for launch emails)
└── Event Show-Up Rate (Target: >25% of registrations)

SECONDARY:
├── SMS Opt-in Rate
├── Calendar Add Rate
├── Referral Conversion Rate
├── Abandoned Form Recovery Rate
└── Time-to-Register (session duration)
```

---

## Part 9: Validation

### Pre-Launch Checklist (48 Hours Before)

**TECHNICAL VALIDATION (2 hours)**
| Check | Status |
|-------|--------|
| Registration form submits correctly | [ ] |
| Confirmation email delivers within 60 seconds | [ ] |
| SMS delivers immediately | [ ] |
| Calendar links work (Google, Apple, Outlook) | [ ] |
| VIP upsell page loads correctly | [ ] |
| Smart links preserve user data | [ ] |
| All vanity URLs redirect properly | [ ] |

**COPY VALIDATION (1 hour)**
| Check | Status |
|-------|--------|
| Hook makes immediate invitation clear | [ ] |
| Authority statement includes specific numbers | [ ] |
| Mystery element creates genuine curiosity | [ ] |
| CTA sounds effortless | [ ] |
| All timezones included in relevant emails | [ ] |
| Email subjects are action-oriented | [ ] |

**AUTOMATION VALIDATION (2 hours)**
| Check | Status |
|-------|--------|
| 15-minute follow-up triggers correctly | [ ] |
| 24-hour follow-up triggers correctly | [ ] |
| 48-hour affiliate email triggers correctly | [ ] |
| Countdown sequence scheduled correctly | [ ] |
| Launch day emails scheduled correctly | [ ] |
| VIP vs Non-VIP segmentation working | [ ] |

### Quality Gates

| Gate | Threshold | Action if Failed |
|------|-----------|------------------|
| Form Completion Rate | <80% | Simplify form, reduce fields |
| Confirmation Delivery | <95% | Check deliverability, domains |
| VIP Page Load | >3 seconds | Optimize page speed |
| Email Open Rate | <30% | Revise subject lines |
| Show-Up Rate | <15% | Add more reminders, increase value |

---

## Part 10: Escalation Paths

| Situation | Escalate To | Timeline |
|-----------|-------------|----------|
| Form not working | Tech Lead | Within 15 min |
| Emails not delivering | Email Platform + Dev | Within 1 hour |
| Registration drop >30% | Marketing Lead | Same day |
| VIP conversion <1% | Offer Owner | Within 24 hours |
| Mass unsubscribes | Marketing Lead | Immediately |
| Negative feedback | Customer Success | Within 2 hours |

---

## Part 11: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-10 | SOP Extractor | Initial extraction from $100M Money Models Blueprint |

---

## Appendix A: The Hormozi Registration Formula

### Registration Page VSL Script Template

```
[HOOK]
"Quick question. Can I get your email address?
Because I want to invite you to the biggest [AVATAR] event of the [SEASON/YEAR].
I spent over [INVESTMENT] on this event."

[AUTHORITY]
"Before I tell you more about it, let me tell you about what the whole event is about, which is [THIS THING].
I [OWN/RUN] [COMPANY].
[These are portfolio companies] that did [RESULT] [TIMEFRAME].
I [PERSONAL ACCOMPLISHMENT]."

[FRAMEWORK]
"When I look at all the businesses I've had throughout my career, there were [NUMBER] things that separated the winners from the losers.
Piece by piece, I started putting them together into what I call [CONCEPT NAME].

Every business has [NUMBER] main goals when it comes to [MAKING MONEY]:
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]
4. [Goal 4]

And this is exactly what I cover inside [THE THING].
I will break down the strategies I use to scale my companies at the live event."

[MYSTERY]
"It's going to be insane.
I've also been working on a secret project for over [TIME].
I won't tell you what it is yet, but I can tell you that it's better than [THING A] and costs less than [THING B].
And every person who shows up live, including you, will receive one absolutely free.
All you have to do is one thing..."

[CTA]
"You sign up below and click submit.
That's it.
On the thank you page, if you want to [PRE-ORDER], I have [NUMBER] other amazing bonuses for you there.
You can upgrade to VIP and it's literally all free.
If you just [REGISTER], it's going to be incredible.
It's going to be THE event of the [SEASON]."

[SOCIAL PROOF]
"We already have over [NUMBER] people registered.
It'll probably be around [BIGGER NUMBER] when the event starts.
So I hope to see you there."
```

(Source: Pre_Event_Registration_VSL.md, complete script)

---

## Appendix B: Email Subject Line Templates

### Registration Confirmation Sequence
| Email | Subject Line | Timing |
|-------|--------------|--------|
| Confirmation | "You're registered. (Save this email)" | Immediate |
| First Follow-up | "in case you missed this" | 15 minutes |
| Value Reminder | "Get your book first + VIP Livestream" | 24 hours |
| Affiliate Invite | "Win a day with me (free)" | 48 hours |
| Second Affiliate | "Free Audiobook + Book Launch Event" | 72 hours |

### Pre-Event Countdown Sequence
| Days Out | Subject Line | Purpose |
|----------|--------------|---------|
| 45 | "I've got a new book" | Announcement |
| 41 | "[Your Invite Inside]" | Official invitation |
| 35 | "What's a money model?" | Content preview |
| 28 | "[new pic] - shipment of books for you" | Behind-the-scenes |
| 19 | "I'm giving something HUGE away...LIVE" | Mystery tease |
| 14 | "Bigger than..." | Logistics + hype |
| 11 | "5 Mystery headliners...1 event...free?" | Speaker reveal |
| 9 | "Money Models (sneak peek)" | Content tease |
| 7 | "Did you miss this?" | Meta-concept |
| 4 | "What I'm gonna give you..." | Secret project |
| 48h | "(48hrs out) what you need to know" | Checklist |
| 24h | "Watch your inbox tomorrow @9am PST / 12pm EST" | Final prep |

### Launch Day Sequence
| Timing | Subject Line |
|--------|--------------|
| 3 hours before | "Live in ~3hrs" |
| 60 min before | "We're live in 60min..." |
| 15 min before | "WE ARE LIVE NOW (LINK INSIDE)" |
| +15 min | "Alex is live & murdering it! Hop on!" |
| +60 min | "Made this for you..." |
| +90 min | "Launch Bonus Gone When Livestream Ends" |

(Source: Registration_Page_Content.md, complete email sequence)

---

## Appendix C: VIP Benefits Stack Template

### Structure
```
VIP upgrade includes:

✅ Automatic entry to [PRIZE/GIVEAWAY] ([DETAILS])
✅ Your [PRODUCT] first & guaranteed first printing (shipped before everyone who waits)
✅ A private VIP livestream "Backstage Pass" (separate from the riff raff) with chat enabled to submit questions
✅ [BONUS WORKSHOP] - revealing [PROCESS] which will show you how you could [OUTCOME]. [VALUE STATEMENT]. (Recording included).

Reminder: People who wait to get their copy at the event will pay the same price but don't get any of the VIP Benefits.

This means you get all the VIP bonuses for free if you simply pre-order the book for the same price I'll offer it at the launch anyway.

My way of saying thank you for helping us out.
```

(Source: Registration_Page_Content.md, lines 24, 37)

---

## Appendix D: Source References

> Complete mapping of each element extracted to its location in the original material.

### Core Framework Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| Registration Page Purpose | Main_Offer_Landing_Page.md | 106-107 | "Opt-in de Registro - Onde todos irao se registrar para o evento virtual ao vivo." |
| VSL Hook Opening | Pre_Event_Registration_VSL.md | 5 | "Pergunta rapida. Posso pegar seu endereco de email?" |
| Authority Statement | Pre_Event_Registration_VSL.md | 6-9 | "Eu sou dono da acquisition.com. Sao empresas do portfolio que fizeram mais de 250 milhoes de dolares no ano passado" |
| Value Framework | Pre_Event_Registration_VSL.md | 11-13 | "Todo negocio tem quatro objetivos principais em termos de ganhar dinheiro" |
| Mystery Element | Pre_Event_Registration_VSL.md | 15-17 | "Eu tambem tenho trabalhado em um projeto em segredo por mais de dois anos...e melhor que um NFT e custa menos que um Bitcoin" |
| CTA Simplicity | Pre_Event_Registration_VSL.md | 20-21 | "Tudo que voce precisa fazer e uma coisa. Voce se inscreve abaixo e clica em enviar. E isso" |
| VIP Upsell | Pre_Event_Registration_VSL.md | 21-22 | "Se voce quiser pre-encomendar uma copia do livro. Eu tenho quatro outros bonus incriveis para voce la" |
| Social Proof Numbers | Pre_Event_Registration_VSL.md | 24-25 | "Ja temos mais de 300.000 pessoas registradas" |

### Registration Confirmation Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| Confirmation Subject | Registration_Page_Content.md | 12 | "Subject line: You're registered. (Save this email)" |
| SMS Template | Registration_Page_Content.md | 10 | "Hey {Name}, it's Alex Hormozi - you'll get 6 more launch texts: 3 reminders + 3 goodies" |
| Save Email Warning | Registration_Page_Content.md | 13 | "PLEASE SAVE THIS EMAIL. IT HAS IMPORTANT BOOK LAUNCH DETAILS." |
| Registration Goal | Registration_Page_Content.md | 13 | "Our goal is to pass 1,000,000+ registrations by launch day" |
| Platform Simplicity | Registration_Page_Content.md | 13 | "I will stream it on Youtube Live. No fancy tech. Just straight Youtube Live. You click. You're in. Simple." |
| Calendar Link | Registration_Page_Content.md | 13 | "Tap here to add it to your calendar" |

### Follow-Up Sequence Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| 15-min Follow-up Subject | Registration_Page_Content.md | 23 | "Subject line: in case you missed this" |
| 15-min Follow-up Timing | Registration_Page_Content.md | 21 | "Within 15 minutes of [Your Registered] Email" |
| 24-hour Subject | Registration_Page_Content.md | 36 | "Subject line: Get your book first + VIP Livestream" |
| 24-hour Timing | Registration_Page_Content.md | 34 | "24 Hours After [Your Registered] Email" |
| Affiliate Subject | Registration_Page_Content.md | 45 | "Subject line: Win a day with me (free)" |
| Affiliate Timing | Registration_Page_Content.md | 43 | "48 Hours After Your Registered Email" |
| Affiliate Stats | Registration_Page_Content.md | 46 | "~32,000 - that's how many people signed up...And those 32,000 people brought 130,000+ people with them" |

### VIP Benefits Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| VIP Benefit 1 | Registration_Page_Content.md | 24 | "Automatic entry to win a day with me in Vegas (you and 9 others)" |
| VIP Benefit 2 | Registration_Page_Content.md | 24 | "Your $100M Money Models book first & guaranteed first printing" |
| VIP Benefit 3 | Registration_Page_Content.md | 24 | "A private VIP livestream 'Backstage Pass' (separate from the riff raff)" |
| VIP Benefit 4 | Registration_Page_Content.md | 24 | "$100M LAUNCH Workshop - revealing my proven process" |
| VIP Value Prop | Registration_Page_Content.md | 24 | "get all the VIP bonuses for free if you simply pre-order the book for the same price" |

### Countdown Email Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| 45-day SMS | Registration_Page_Content.md | 119 | "{Name}, it's Hormozi. Big news. New book(!): 100M Money Models. Live launch: Aug 16" |
| 45-day Subject | Registration_Page_Content.md | 121 | "I've got a new book" |
| 41-day Subject | Registration_Page_Content.md | 131 | "[Your Invite Inside]" |
| 35-day Subject | Registration_Page_Content.md | 140 | "What's a money model?" |
| 28-day Subject | Registration_Page_Content.md | 150 | "[new pic] - shipment of books for you" |
| 19-day Subject | Registration_Page_Content.md | 161 | "I'm giving something HUGE away...LIVE" |
| 14-day Subject | Registration_Page_Content.md | 172 | "Bigger than..." |
| 11-day Subject | Registration_Page_Content.md | 181 | "5 Mystery headliners...1 event...free?" |
| 9-day Subject | Registration_Page_Content.md | 190 | "Money Models (sneak peek)" |
| 7-day Subject | Registration_Page_Content.md | 198 | "Did you miss this?" |
| 4-day Subject | Registration_Page_Content.md | 207 | "What I'm gonna give you..." |

### 48-Hour Checklist Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| 48hr Subject | Registration_Page_Content.md | 217 | "(48hrs out) what you need to know" |
| Checklist Intro | Registration_Page_Content.md | 218 | "Mozination - Are you ready for Saturday 9am PT/12pm ET?" |
| Step 1 | Registration_Page_Content.md | 218 | "Mark your Calendar for Saturday, August 16th, at 9 AM PT / 12 PM ET" |
| Step 3 | Registration_Page_Content.md | 218 | "For the best live experience, desktop is best." |
| Early Join Warning | Registration_Page_Content.md | 218 | "it is best to join 12-17 minutes early so you don't get stuck in line" |
| Registration Count | Registration_Page_Content.md | 218 | "we now have over 1,000,000 people registered for this insane Launch Event" |
| Full Timezone List | Registration_Page_Content.md | 218 | "Book Launch Start by TIMEZONE on Aug 16: [full list of world timezones]" |

### Launch Day Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| 3hr Subject | Registration_Page_Content.md | 241 | "Live in ~3hrs" |
| 60min Subject | Registration_Page_Content.md | 257 | "We're live in 60min..." |
| 15min Subject | Registration_Page_Content.md | 277 | "WE ARE LIVE NOW (LINK INSIDE)" |
| 15min Body | Registration_Page_Content.md | 278 | "Book Launch starts now. Hop on >>> [link]" |
| +15min From | Registration_Page_Content.md | 294 | "From Name: Leila" |
| +15min Subject | Registration_Page_Content.md | 295 | "Alex is live & murdering it! Hop on!" |
| +15min Body | Registration_Page_Content.md | 296 | "It's Leila, I stole Alex's email. Just wanted to let you know Alex is live on youtube & murdering it!" |

### Abandoned Cart Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| Abandon Timing | Registration_Page_Content.md | 97 | "20min After Abandoned Cart #1" |
| Abandon Subject | Registration_Page_Content.md | 99 | "Pre-order checkout failed" |
| Smart Link | Registration_Page_Content.md | 100 | "your info is still saved & you can checkout here: {{smart_link}}" |

### Technical Infrastructure Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| Hosting Platform | Main_Offer_Landing_Page.md | 104 | "All of our funnel pages are hosted on eCommerce Store with embedded hubspot forms to capture data" |
| Vanity URLs | Main_Offer_Landing_Page.md | 104 | "Each page has a subdomain Vanity URL that is set up for easy call out" |
| Registration Funnel | Main_Offer_Landing_Page.md | 90-91 | "the registration funnel, the eCommerce Store ready for book launch" |
| Affiliate Software | Main_Offer_Landing_Page.md | 139 | "We will be using an eCommerce Storepage for the Affiliate opt-in page and First Promoter as our Affiliate software" |

### Affiliate Program Elements

| Element | Source Document | Line | Direct Quote |
|---------|----------------|------|--------------|
| Top 10 Prize | Main_Offer_Landing_Page.md | 133 | "private 1-on-1 Podcast in-person + a day with the other top 99 affiliates + a quiet private dinner with Leila and Alex" |
| Top 50 Prize | Main_Offer_Landing_Page.md | 134 | "Participate in Live Affiliate Workshop at HQ - Full Day + Group Q&A Session with Alex" |
| 10+ Referrals Prize | Main_Offer_Landing_Page.md | 135 | "Enter drawing for Live Affiliate Workshop + Unreleased 70 Business Tactics Audiobook" |
| All Affiliates Prize | Main_Offer_Landing_Page.md | 136 | "$100M Money Models Ads Folder + ACQ Affiliate Blackbook + High-res event recording" |

---

**Validation Score: 11/11 parts complete**
**Source References: 75+ elements mapped**
**Ready for squad blueprint creation.**



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
