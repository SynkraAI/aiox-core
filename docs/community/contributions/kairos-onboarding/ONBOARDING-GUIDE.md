# 🧔 AIOS Onboarding Guide — From Zero to Operational

> From "person who uses AI" to "person who orchestrates AI systems".
> A practical guide based on 12 days of real AIOS operation.

---

## Before You Start

This guide assumes you've already installed AIOS. If not, follow the [official installation guide](../../installation/) first.

**What this guide IS NOT:**
- Not a replacement for official AIOS documentation
- Not a promise of magical results
- Not a substitute for expertise in your business domain

**What this guide IS:**
- A practical roadmap from zero to operational
- Based on real experience (not theory)
- Focused on mindset shifts as much as technique

---

## The Journey — 4 Cognitive Phases, 5 Practical Levels

```
Phase 1: "I use AI"            → Level 1 (Day 1)
Phase 2: "I delegate to AI"    → Level 2 (Day 3) + Level 3 (Day 7)
Phase 3: "I orchestrate AI"    → Level 4 (Day 14)
Phase 4: "My system evolves"   → Level 5 (Day 30)
```

Most people get stuck in Phase 1. AIOS exists to take you to Phase 3+.
This guide maps each phase to practical levels with concrete actions.

---

## Level 1 — Your First Agent (Day 1)

### The Mindset Shift
You are no longer chatting with an AI. You are **defining the personality and rules** of an autonomous worker. The difference is that this worker needs clear instructions — but then executes on its own.

### What to do

**1. Understand the structure of an agent:**
```yaml
agent:
  name: [agent name]
  id: [unique identifier]
  title: [what it does in one sentence]

persona:
  role: [specific function]
  identity: [who it is]
  core_principles:
    - [rule 1]
    - [rule 2]
    - [rule 3]

commands:
  - name: [command]
    description: [what it does]
```

**2. Create your first agent — a simple assistant:**

Create the file `.antigravity/agents/my-assistant.md` (or the equivalent path in your IDE) with this content:

```yaml
agent:
  name: Assistant
  id: my-assistant
  title: Personal Assistant
  icon: 🤖

persona:
  role: Personal assistant
  identity: I help my operator with day-to-day tasks. I'm direct, organized, and proactive.
  core_principles:
    - Prioritize clarity over completeness
    - Ask before assuming
    - Always provide actionable next steps

commands:
  - name: help
    description: Show available commands
  - name: tasks
    description: List my pending tasks
  - name: summary
    description: Summarize what was done in the session
```

**3. Activate:** `@my-assistant` in your compatible IDE.

### ✅ Checkpoint Level 1
- [ ] Created a `.md` file with YAML agent definition
- [ ] Agent responds when activated
- [ ] Understood that I'm defining RULES, not writing prompts

---

## Level 2 — Your First Squad (Day 3)

### The Mindset Shift
A single agent is limited. Real power comes from **agents that work together**, each with a specialty. You don't do the work — you assemble the team.

### What to do

**1. Understand the squad structure:**
```
squads/
└── my-squad/
    ├── squad.yaml
    └── agents/
        ├── writer.md
        ├── reviewer.md
        └── publisher.md
```

**2. Create a content squad (real example):**

`squads/content/agents/writer.md`:
```yaml
agent:
  name: Writer
  id: content-writer
  title: Content Writer

persona:
  role: Create social media content
  identity: Writer focused on engagement and clarity
  core_principles:
    - Short, impactful texts
    - Always end with a CTA
    - Casual but professional tone
```

`squads/content/agents/reviewer.md`:
```yaml
agent:
  name: Reviewer
  id: content-reviewer
  title: Quality Reviewer

persona:
  role: Review and improve texts before publishing
  identity: Constructive critic. Improves without destroying.
  core_principles:
    - Check grammar and spelling
    - Evaluate tone and audience fit
    - Suggest specific improvements (not generic ones)
```

**3. Use the flow:** Writer creates → Reviewer reviews → you approve → publish.

### ✅ Checkpoint Level 2
- [ ] Created a `squads/[name]/agents/` folder with 2+ agents
- [ ] Each agent has clear, distinct responsibility
- [ ] Can activate each agent separately
- [ ] Asked someone else to interact with my agents and give feedback

---

## Level 3 — Engine vs Application (Day 7)

### The Mindset Shift
This is the most important concept: **AIOS is an engine, not an application**.

The engine is generic — works for any business.
The application is specific — serves YOUR domain.

If you mix them, you can't reuse the engine for another client.

### What to do

**1. Separate:**
```
project-root/
├── squads/          ← ENGINE (generic, never mentions your business)
├── scripts/         ← ENGINE
├── .aios-core/      ← ENGINE
└── clients/
    └── my-business/ ← APPLICATION (specific to your domain)
        ├── agents/
        ├── templates/
        └── data/
```

**2. Golden rule:** If a file in `squads/` mentions a client name or specific domain (e.g., "clinic", "pet shop") → it's in the wrong place. Move it to `clients/`.

**3. Test:**
```bash
# Search for domain contamination
grep -r "my-business-name" squads/ scripts/
# Expected result: NO matches
```

> **Windows users:** Use `findstr /S /I "my-business-name" squads\*` instead of grep.

### ✅ Checkpoint Level 3
- [ ] `squads/` has no reference to any specific domain
- [ ] `clients/[name]/` contains everything specific to my business
- [ ] Can imagine using the same engine for a different type of business

---

## Level 4 — Your System Works While You Sleep (Day 14)

### The Mindset Shift
Until now, you triggered agents manually. Now the system runs **on its own** on a schedule. You wake up and find the report ready.

### What to do

**1. Choose a communication channel:**
- Telegram Bot (simplest — recommended to start)
- WhatsApp via API integration (more complex, but where your clients are)

**2. Create a simple scheduler:**
```javascript
const schedule = require('node-schedule');
const { execSync } = require('child_process');
const https = require('https');

// Every day at 6am: generate summary and send via Telegram
schedule.scheduleJob('0 6 * * *', async () => {
  console.log('[Scheduler] Generating morning report...');

  // 1. Execute your scripts
  const status = execSync('node scripts/my-status.js').toString();

  // 2. Send via Telegram
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = JSON.stringify({ chat_id: chatId, text: status });

  const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  req.write(body);
  req.end();
  console.log('[Scheduler] Morning brief sent!');
});
```

**3. Use PM2 to keep it running:**
```bash
npm install -g pm2
pm2 start my-scheduler.js --name my-system
pm2 save
```

### ✅ Checkpoint Level 4
- [ ] I have at least 1 task that runs automatically
- [ ] I receive results without manually triggering
- [ ] The process survives a computer reboot

---

## Level 5 — Meta-Agents (Day 30)

### The Mindset Shift
Final level: agents that improve other agents. The system evolves on its own.

This level is advanced and depends on your context. Examples of what's possible:
- Agent that audits the quality of other agents' outputs
- Agent that detects gaps in the system and proposes improvements
- Agent that compresses memories from previous sessions

### Honest recommendation
Don't attempt Level 5 before Levels 1-4 are solid. Most operators will extract the majority of value from Levels 2-3.

### ✅ Checkpoint Level 5
- [ ] I have at least 1 operational meta-agent
- [ ] The system identified and fixed a problem without my intervention
- [ ] I understand when the system is evolving vs. "spinning in circles"

---

## Common Mistakes (learned from practice)

| Mistake                                      | Consequence           | Solution                                |
| :------------------------------------------- | :-------------------- | :-------------------------------------- |
| Create 20 agents on Day 1                    | Chaos, none work well | Start with 1. Add when needed.          |
| Not separating engine/client                 | Impossible to reuse   | Separate from Day 1, even with 1 client |
| Copy agents without understanding            | Fragile foundation    | Understand the YAML before copying      |
| Promise results before testing               | Frustration           | Test internally before selling          |
| Run everything in parallel on a weak machine | Freezing              | Serial execution. Respect your RAM.     |

---

## What AIOS Does NOT Do

Being honest (because nobody else will be):

- **Doesn't replace expertise.** If you don't know marketing, a marketing agent will produce mediocre content with confidence. You need to know how to evaluate.
- **Isn't magic.** LLMs make mistakes. Agents make mistakes. The system makes mistakes. The advantage is that it fails fast and cheap, not that it never fails.
- **Isn't "set and forget."** It needs maintenance, tuning, and constant evolution.
- **Depends on the LLM.** Output quality depends on the model you use. Free tier = good for development. Production with clients = consider paid models.

---

## Next Steps

1. Start with Level 1 today
2. Use the [First Week Checklist](./FIRST-WEEK-CHECKLIST.md) to guide your first 7 days
3. When stuck, look at existing agent definitions in `.antigravity/agents/` for reference
4. When you master the first 3 levels, explore Levels 4-5

---

*Community Contribution by Gabriel Lima (@experiasolutions) — Based on 12 days of real AIOS operation, Feb 2026*
