# create-hook-set

## Metadata
```yaml
task_id: HZ_HOOKS_001
agent: hormozi-hooks
type: creation
complexity: medium
estimated_time: 30-45min
source: "$100M Hooks Playbook"
```

## Purpose
Create a complete set of scroll-stopping hooks using the 121 hook formula library and the 70-20-10 Innovation Rule.

> "After writing your headline, you have spent eighty cents of your advertising dollar." — David Ogilvy

## The Dean Graziosi Story (The Power of The Hook)

Dean Graziosi spent a fortune to be interviewed by Larry King. The interview was incredible. But the ad BOMBED.

**Original hook (failure):**
> "Tonight on Larry King, I'm here with my guest Dean Graziosi he's a multi New York Times best seller, a multi-millionaire, and tonight he's gonna show you how you can have that success too."

He rebuilt the entire studio, brought Larry King back — just to re-record ONE SENTENCE.

**New hook (monster success):**
> "Have you ever in your adult life looked at yourself in the mirror and thought 'I should be further ahead by now'? If you have, you're not alone. And tonight, my guest Dean Graziosi is going to help you see how you can live to your full potential."

**The book name didn't change. The cover didn't change. The price didn't change. The website didn't change.**

**Only the first sentences changed — the hook.**

> "Since then, I've spent as much time thinking about the first sentence as I do all the rest combined." — Dean Graziosi

---

## What Is A Hook?

> "A hook is whatever grabs your audience's attention. It's what people see and/or hear first. The first seconds of a video, the first line their eyes see."

**Good hooks** make people notice and pay attention.
**Bad hooks** people never notice.

> "If you have ten hours to make advertising, focus your first eight hours on hooks. That's how important they are."

---

## How Hooks Work: 2 Parts

### Part 1: Call Out

Makes the prospect say: "That's for me."

**The Cocktail Party Effect:**
Imagine you're at a nightclub. Lots of people yelling. Loud music. In all that noise, a single sound cuts through everything and you turn around. What sound? **Your name.**

> "Our goal with our call outs is to take advantage of the cocktail party effect and cut through all the noise."

### Part 2: Condition for Value

The hook promises some kind of value if they consume the content.

**Explicit example:**
"If [MOMS - target] [WATCH THIS VIDEO - condition] [THEY'LL KNOW HOW TO GET THEIR KIDS TO OBEY - value]."

**Implicit example:**
A mom showing a well-behaved child in the middle of chaos. Then she turns to camera and says: "Look how I did it."

---

## The 8 Categories of Verbal Hooks

### 1. Labels
Words your avatar identifies with.
- "Local business owners, I've got a gift for you"

### 2. Questions
**Yes questions:** "Would you pay $1,000 to have the business of your dreams in 30 days?"
**Open questions:** "Which one would you rather be?"

### 3. Conditionals
Scenarios or conditions leading to an outcome.
- "If you're working all the time and your business isn't growing, you're working on the wrong thing."

### 4. Commands
Direct commands telling the audience to do something.
- "Read this if you're tired of being broke."

### 5. Statements
- "The smartest thing you can do today..."
- "How to stand out from 99% of people."

### 6. Lists or Steps
- "In this video I'm going to talk about the 28 ways to stay poor."

### 7. Narratives
Stories and anecdotes.
- "One day I was in the back and this angry old lady walks in."

### 8. Exclamations
Expresses strong emotion like surprise or sadness.
- "Agghhhhh... This is the blueprint to becoming a millionaire and I'm going to walk you through the levels."

**Distribution of Hormozi's 121 Best Hooks:**
- Statements: 35%
- Conditionals: 20%
- Questions: 15%
- Commands: 10%
- Narratives: 10%
- Lists: 5%
- Labels: 3%
- Exclamations: 2%

---

## Non-Verbal Hooks

Hooks don't have to be just words. They can be noises or visuals.

> "Back to the cocktail party. Sure, a tray of dishes being dropped would get everyone's attention, but so does the 'cling_cling_cling' of a knife tapping a champagne glass."

**Good advertisers use verbal and non-verbal hooks together.**

---

## The 70-20-10 Process (Google Innovation Rule)

Larry Page and Sergey Brin — smarter and richer than me — mathematically proved this resource allocation brings the best returns.

### 70% — Core (Proven Hooks)

The biggest chunk of effort goes to hooks that ALREADY work:
1. **Your own previous winning ads**
2. **Hooks from your free content that performed well**
3. **Hooks from other people's ads** (keep an album on your phone)
4. **Hooks from other people's free content**
5. **Platform ad libraries** (last resort — hard to know what performs)

**Action:** Create a spreadsheet with tabs by platform. Columns: name, hook, views, link. Review your best hooks before creating content.

### 20% — Emergent (Winner Adjacent)

Promising but less proven hooks. "Adjacent to winner."

> "If I see something that works in another niche, I can try modeling the concept."

**Action:** Use tools that show outliers by platform. Paste into a slide deck with screenshot of outlier and ideas for repackaging.

### 10% — Experimental (Big New Ideas)

Risky ideas that might lead to big wins.

> "This is where we work on our craziest ideas. We're not afraid to try and fail here."

---

## Input Required

```yaml
hook_context:
  campaign_type: ""  # Ad, content, email, landing page
  platform: ""  # YouTube, Facebook, Instagram, TikTok, Email
  target_avatar: ""
  main_benefit: ""
  awareness_level: ""  # Most Aware, Product, Solution, Problem, Unaware
```

---

## Creation Process

### Step 1: Collect Reference Hooks

| Source | Where to Find | Quantity |
|--------|---------------|----------|
| Your winning ads | Your ad manager | Top 10 |
| Your organic content | Analytics | Top 10 |
| Other people's ads | Phone album, Ad libraries | Top 15 |
| Other people's content in your niche | Platform search | Top 15 |

### Step 2: Categorize by Type

For each collected hook, identify the category:

| Hook | Category | Views/Performance |
|------|----------|-------------------|
| | Label / Question / Conditional / etc. | |

### Step 3: Generate 50 Hooks Using 70-20-10

**35 Hooks (70% Core):**
Adapt your winning hooks and others' for your current context.

**10 Hooks (20% Adjacent):**
Take hooks from other niches that might work in yours.

**5 Hooks (10% Experimental):**
Try something completely new.

### Step 4: Distribute by Category

Ensure variety:
- Minimum 2 of each category
- More weight on Statements and Conditionals (which perform best)

---

## Output Format

```yaml
hook_set:
  campaign: ""
  platform: ""
  avatar: ""
  total_hooks: 50

  core_70_percent:
    from_my_winners:
      - hook: ""
        category: ""
        original_performance: ""
    from_my_content:
      - hook: ""
        category: ""
        original_performance: ""
    from_others_ads:
      - hook: ""
        category: ""
        source: ""
    from_others_content:
      - hook: ""
        category: ""
        source: ""

  adjacent_20_percent:
    - hook: ""
      category: ""
      original_niche: ""
      adaptation: ""

  experimental_10_percent:
    - hook: ""
      category: ""
      hypothesis: ""

  distribution_check:
    labels: 0
    questions: 0
    conditionals: 0
    commands: 0
    statements: 0
    lists: 0
    narratives: 0
    exclamations: 0

  testing_plan:
    ads: "Record 10 hooks for every 1 ad content piece"
    shorts: "Reuse winning tweets as short hooks"
    longs: "Record 3-4 hooks per piece, choose in post-production"
    emails: "Active split test on each campaign, document winners"
```

---

## Sample of 121 Best Hooks (Top Performers)

### Ads (Selection)
1. "Real quick question... Can I have your email address?"
2. "You might be wondering why I just caught a banana..."
3. "That's weird... I don't see your name on the invite list?"
4. "The rumors are true..."
5. "Would you pay $1,000 dollars to have the business of your dreams in 30 days?"

### Content YouTube (Selection)
- "You guys want to hear something completely insane"
- "Agghhhhh... This is the blueprint to becoming a millionaire"
- "I've been in business for 13 years. I've sold 9 companies..."
- "In this video I'm going to talk to you about the 28 ways to stay poor"

### Instagram (Selection)
- "If you wanna become obscenely wealthy and have your parents question if it's ethical..."
- "Poor people stay poor because they're afraid of other poor people judging them"
- "If you're working all the time and your business isn't growing, you're working on the wrong sh*t"
- "Entrepreneurship f*cking sucks most of the time"

### Twitter (Selection)
- "Winners define themselves by what they made happen. Victims define themselves by what's happened to them."
- "Everyone wants the view from the top, but no one wants the climb."
- "The sooner you accept that everything is your fault, the sooner you can do something about it."

---

## Hook Checklist

### FIRST TIME:
- [ ] Look at other people's top-performing ads/content
- [ ] Isolate the hooks
- [ ] Write down your 50 favorites
- [ ] Use all of them in ads and content

### EVERY TIME AFTER:
- [ ] Look at top 10% performers (top 5)
- [ ] Make 70% of next batch using those top 5 hooks
- [ ] Make 20% with permutations of those hooks
- [ ] Make 10% with completely different hooks

### GOOD HOOKS CONTAIN:
- [ ] Some form of attention grabber (call out)
- [ ] Some implication of value if they consume

### VARIETY USING:
For same topic (ex: chiropractor):
- **Conditional:** "If you're a chiropractor, this video will get you more leads."
- **Label:** "Chiropractors, I've got a gift for you."
- **Question:** "Would you rather struggle to get patients for the rest of your life or solve it in 6 weeks?"
- **Command:** "Watch this if you want more patients."
- **Statement:** "The top 1% of chiropractic clinics follow these rules..."
- **List:** "11 ways chiropractors get more patients without paid ads"
- **Story:** "Suddenly, my phone starts ringing nonstop..."

---

## Quality Gate

```yaml
hook_quality:
  - [ ] 50 hooks generated
  - [ ] 70-20-10 distribution applied
  - [ ] All 8 categories represented
  - [ ] Testing plan defined
  - [ ] Reference hooks documented with source
```

## Handoff

After creation:
- → `hormozi-ads` for campaign integration
- → `hormozi-copy` for content development
- → `hormozi-launch` for launch sequence hooks

---
*Task: HZ_HOOKS_001 | Agent: hormozi-hooks | Version: 2.0*
*Source: $100M Hooks Playbook*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
