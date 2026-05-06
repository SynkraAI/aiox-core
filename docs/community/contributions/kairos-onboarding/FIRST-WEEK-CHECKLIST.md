# 📋 First Week Checklist — From Zero to Operational in 7 Days

> One concrete action per day. By the end of the week, you have a working AIOS system.

---

## Day 1 — Know the House

- [ ] Install AIOS (follow [official installation guide](../../installation/))
- [ ] Run a quick test to confirm Node.js works (e.g., `node -e "console.log('AIOS OK')"`)
- [ ] Open `.antigravity/agents/` — read 2 existing agents to understand the format
- [ ] Read the "Level 1" section of the [Onboarding Guide](./ONBOARDING-GUIDE.md)

**Estimated time:** 1-2 hours
**Goal:** Understand where everything lives

---

## Day 2 — Create Your First Agent

- [ ] Create `.antigravity/agents/my-assistant.md` (copy template from Onboarding Guide)
- [ ] Activate the agent and test 3 conversations
- [ ] Adjust `core_principles` until it responds the way you want
- [ ] Understand: agent = persona definition + rules + commands

**Estimated time:** 1 hour
**Goal:** Have 1 functional agent that sounds like YOU want

---

## Day 3 — Build Your First Squad

- [ ] Create folder `squads/my-squad/agents/`
- [ ] Create 2 complementary agents (e.g., writer + reviewer, or researcher + synthesizer)
- [ ] Test the flow: agent 1 produces → agent 2 reviews/complements
- [ ] Read the "Level 2" section of the Onboarding Guide

**Estimated time:** 1-2 hours
**Goal:** 2 agents working in sequence

---

## Day 4 — Separate Engine from Client

- [ ] Create `clients/my-business/` with subfolders (agents, templates, data)
- [ ] Move any domain-specific files from `squads/` to `clients/`
- [ ] Run contamination search: `grep -r "my-business" squads/` (Linux/Mac) or `findstr /S /I "my-business" squads\*` (Windows)
- [ ] Expected result: zero matches

**Estimated time:** 30 minutes
**Goal:** Clean separation between engine and application

---

## Day 5 — Connect a Channel

- [ ] Choose: Telegram Bot (easier) or WhatsApp
- [ ] For Telegram: create bot via @BotFather, add token to `.env`
- [ ] Test: send message → bot responds
- [ ] Set up at least 2 useful commands (e.g., /status, /tasks)

**Estimated time:** 1-2 hours
**Goal:** Access your system from your phone

---

## Day 6 — Automate Something

- [ ] Choose 1 task you do every week (report, planning, review)
- [ ] Create a script that runs that task using your agents
- [ ] Schedule with `node-schedule` or cron
- [ ] Test: task runs and result arrives on Telegram

**Estimated time:** 2 hours
**Goal:** At least 1 thing running without you triggering it

---

## Day 7 — Review and Decide

- [ ] List what worked and what didn't
- [ ] Decide: do I want to keep evolving? do I want to serve clients with this?
- [ ] If yes: read Levels 4-5 of the Onboarding Guide
- [ ] If yes to clients: read about Engine/Client Separation in the guide

**Estimated time:** 1 hour
**Goal:** Clarity about the next month

---

## By the End of the Week You'll Have

| Item                                      | Status |
| :---------------------------------------- | :----: |
| AIOS installed and running                |   ✅    |
| 1 personalized agent                      |   ✅    |
| 1 squad with 2+ agents                    |   ✅    |
| Engine/client separation                  |   ✅    |
| Communication channel (Telegram/WhatsApp) |   ✅    |
| 1 automation running on its own           |   ✅    |
| Decision about next steps                 |   ✅    |

**Total time invested:** ~8-10 hours across the week

---

*Community Contribution by Gabriel Lima (@experiasolutions) — Based on real AIOS operation experience, Feb 2026*
