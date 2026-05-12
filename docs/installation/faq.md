# Synkra AIOX FAQ

> 🌐 **EN** | [PT](../pt/installation/faq.md) | [ES](../es/installation/faq.md)

**Version:** 2.1.0
**Last Updated:** 2025-01-24

---

## Table of Contents

- [Installation Questions](#installation-questions)
- [Updates & Maintenance](#updates--maintenance)
- [Offline & Air-Gapped Usage](#offline--air-gapped-usage)
- [IDE & Configuration](#ide--configuration)
- [Agents & Workflows](#agents--workflows)
- [Squads](#Squads)
- [Advanced Usage](#advanced-usage)

---

## Installation Questions

### Q1: Why npx instead of npm install -g?

**Answer:** We recommend `npx aiox-core install` over global installation for several reasons:

1. **Always Latest Version**: npx fetches the latest version automatically
2. **No Global Pollution**: Doesn't add to your global npm packages
3. **Project Isolation**: Each project can have its own version
4. **No Permission Issues**: Avoids common global npm permission problems
5. **CI/CD Friendly**: Works seamlessly in automated pipelines

**If you prefer global installation:**

```bash
npm install -g aiox-core
aiox-core install
```

---

### Q2: What are the system requirements?

**Answer:**

| Component      | Minimum                            | Recommended     |
| -------------- | ---------------------------------- | --------------- |
| **Node.js**    | 18.0.0                             | 20.x LTS        |
| **npm**        | 9.0.0                              | 10.x            |
| **Disk Space** | 100 MB                             | 500 MB          |
| **RAM**        | 2 GB                               | 8 GB            |
| **OS**         | Windows 10, macOS 12, Ubuntu 20.04 | Latest versions |

**Check your system:**

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

---

### Q3: Can I install AIOX in an existing project?

**Answer:** Yes! AIOX is designed for both greenfield and brownfield projects.

**For existing projects:**

```bash
cd /path/to/existing-project
npx aiox-core install
```

The installer will:

- Create `.aiox-core/` directory (framework files)
- Create IDE configuration (`.claude/`, `.cursor/`, etc.)
- NOT modify your existing source code
- NOT overwrite existing documentation unless you choose to

**Important:** If you have an existing `.claude/` or `.cursor/` directory, the installer will ask before modifying.

---

### Q4: How long does installation take?

**Answer:**

| Scenario                | Time          |
| ----------------------- | ------------- |
| **First-time install**  | 2-5 minutes   |
| **Update existing**     | 1-2 minutes   |
| **Starter squad only** | 30-60 seconds |

Factors affecting installation time:

- Internet connection speed
- npm cache status
- Number of IDEs selected
- Starter squads selected

---

### Q5: What files does AIOX create in my project?

**Answer:** AIOX creates the following structure:

```
your-project/
├── .aiox-core/                 # Framework core (200+ files)
│   ├── agents/                 # 11+ agent definitions
│   ├── tasks/                  # 60+ task workflows
│   ├── templates/              # 20+ document templates
│   ├── checklists/             # Validation checklists
│   ├── scripts/                # Utility scripts
│   └── core-config.yaml        # Framework configuration
│
├── .claude/                    # Claude Code (if selected)
│   └── commands/AIOX/agents/   # Agent slash commands
│
├── .cursor/                    # Cursor (if selected)
│   └── rules/                  # Agent rules
│
├── docs/                       # Documentation structure
│   ├── stories/                # Development stories
│   ├── architecture/           # Architecture docs
│   └── prd/                    # Product requirements
│
└── Squads/            # (if installed)
    └── hybrid-ops/             # HybridOps pack
```

---

## Updates & Maintenance

### Q6: How do I update AIOX to the latest version?

**Answer:**

```bash
# Update via npx (recommended)
npx aiox-core update

# Or reinstall latest
npx aiox-core install --force-upgrade

# Check current version
npx aiox-core status
```

**What gets updated:**

- `.aiox-core/` files (agents, tasks, templates)
- IDE configurations
- Starter squads (if installed)

**What is preserved:**

- Your custom modifications in `core-config.yaml`
- Your documentation (`docs/`)
- Your source code

---

### Q7: How often should I update?

**Answer:** We recommend:

| Update Type          | Frequency   | Command                     |
| -------------------- | ----------- | --------------------------- |
| **Security patches** | Immediately | `npx aiox-core update` |
| **Minor updates**    | Monthly     | `npx aiox-core update` |
| **Major versions**   | Quarterly   | Review changelog first      |

**Check for updates:**

```bash
npm show aiox-core version
npx aiox-core status
```

---

### Q8: Can I rollback to a previous version?

**Answer:** Yes, several options:

**Option 1: Reinstall specific version**

```bash
npx aiox-core@1.1.0 install --force-upgrade
```

**Option 2: Use Git to restore**

```bash
# If .aiox-core is tracked in git
git checkout HEAD~1 -- .aiox-core/
```

**Option 3: Restore from backup**

```bash
# Installer creates backups
mv .aiox-core .aiox-core.failed
mv .aiox-core.backup .aiox-core
```

---

## Offline & Air-Gapped Usage

### Q9: Can I use AIOX without internet?

**Answer:** Yes, with some preparation:

**Initial setup (requires internet):**

```bash
# Install once with internet
npx aiox-core install

# Package for offline use
tar -czvf aiox-offline.tar.gz .aiox-core/ .claude/ .cursor/
```

**On air-gapped machine:**

```bash
# Extract the package
tar -xzvf aiox-offline.tar.gz

# AIOX agents work without internet
# (They don't require external API calls)
```

**Limitations without internet:**

- Cannot update to new versions
- MCP integrations (ClickUp, GitHub) won't work
- Cannot fetch library documentation (Context7)

---

### Q10: How do I transfer AIOX to an air-gapped environment?

**Answer:**

1. **On connected machine:**

   ```bash
   # Install and package
   npx aiox-core install
   cd your-project
   tar -czvf aiox-transfer.tar.gz .aiox-core/ .claude/ .cursor/ docs/
   ```

2. **Transfer the archive** via USB, secure transfer, etc.

3. **On air-gapped machine:**

   ```bash
   cd your-project
   tar -xzvf aiox-transfer.tar.gz
   ```

4. **Configure IDE manually** if needed (paths may differ)

---

## IDE & Configuration

### Q11: Which IDEs does AIOX support?

**Answer:**

| IDE                | Status       | Agent Activation    |
| ------------------ | ------------ | ------------------- |
| **Claude Code**    | Full Support | `/dev`, `/qa`, etc. |
| **Cursor**         | Full Support | `@dev`, `@qa`, etc. |
| **Gemini CLI**     | Full Support | Mention in prompt   |
| **GitHub Copilot** | Full Support | Chat modes          |

**Adding support for a new IDE:** Open a GitHub issue with the IDE's agent/rules specification.

---

### Q12: Can I configure AIOX for multiple IDEs?

**Answer:** Yes! Select multiple IDEs during installation:

**Interactive:**

```
? Which IDE(s) do you want to configure?
❯ ◉ Cursor
  ◉ Claude Code
```

**Command line:**

```bash
```

Each IDE gets its own configuration directory:

- `.cursor/rules/` for Cursor
- `.claude/commands/` for Claude Code

---

### Q13: How do I configure AIOX for a new team member?

**Answer:**

If `.aiox-core/` is committed to your repository:

```bash
# New team member just clones
git clone your-repo
cd your-repo

# Optionally configure their preferred IDE
npx aiox-core install --ide cursor
```

If `.aiox-core/` is not committed:

```bash
git clone your-repo
cd your-repo
npx aiox-core install
```

**Best practice:** Commit `.aiox-core/` to share consistent agent configurations.

---

## Agents & Workflows

### Q14: What agents are included?

**Answer:** AIOX includes 11+ specialized agents:

| Agent           | Role                 | Best For                        |
| --------------- | -------------------- | ------------------------------- |
| `dev`           | Full-Stack Developer | Code implementation, debugging  |
| `qa`            | QA Engineer          | Testing, code review            |
| `architect`     | System Architect     | Design, architecture decisions  |
| `pm`            | Project Manager      | Planning, tracking              |
| `po`            | Product Owner        | Backlog, requirements           |
| `sm`            | Scrum Master         | Facilitation, sprint management |
| `analyst`       | Business Analyst     | Requirements analysis           |
| `ux-expert`     | UX Designer          | User experience design          |
| `data-engineer` | Data Engineer        | Data pipelines, ETL             |
| `devops`        | DevOps Engineer      | CI/CD, deployment               |
| `db-sage`       | Database Architect   | Schema design, queries          |

---

### Q15: How do I create a custom agent?

**Answer:**

1. **Copy an existing agent:**

   ```bash
   cp .aiox-core/agents/dev.md .aiox-core/agents/my-agent.md
   ```

2. **Edit the YAML frontmatter:**

   ```yaml
   agent:
     name: MyAgent
     id: my-agent
     title: My Custom Agent
     icon: 🔧

   persona:
     role: Expert in [your domain]
     style: [communication style]
   ```

3. **Add to IDE configuration:**

   ```bash
   npx aiox-core install --ide claude-code
   ```

4. **Activate:** `/my-agent` or `@my-agent`

---

### Q16: What is "yolo mode"?

**Answer:** Yolo mode is autonomous development mode where the agent:

- Implements story tasks without step-by-step confirmation
- Makes decisions autonomously based on story requirements
- Logs all decisions in `.ai/decision-log-{story-id}.md`
- Can be stopped at any time

**Enable yolo mode:**

```bash
/dev
*develop-yolo docs/stories/your-story.md
```

**When to use:**

- For well-defined stories with clear acceptance criteria
- When you trust the agent's decision-making
- For repetitive tasks

**When NOT to use:**

- For complex architectural changes
- When requirements are ambiguous
- For production-critical code

---

## Squads

### Q17: What are Squads?

**Answer:** Starter squads are optional add-ons that extend AIOX capabilities:

| Pack           | Features                                                       |
| -------------- | -------------------------------------------------------------- |
| **hybrid-ops** | ClickUp integration, process automation, specialized workflows |

**Install an Squad:**

```bash
npx aiox-core install --Squads hybrid-ops
```

**List available packs:**

```bash
npx aiox-core install
```

---

### Q18: Can I create my own Squad?

**Answer:** Yes! Starter squads follow this structure:

```
my-expansion/
├── pack.yaml           # Pack manifest
├── README.md           # Documentation
├── agents/             # Custom agents
│   └── my-agent.md
├── tasks/              # Custom tasks
│   └── my-task.md
├── templates/          # Custom templates
│   └── my-template.yaml
└── workflows/          # Custom workflows
    └── my-workflow.yaml
```

**pack.yaml example:**

```yaml
name: my-expansion
version: 1.0.0
description: My custom Squad
dependencies:
  aiox-core: ">=1.0.0"
agents:
  - my-agent
tasks:
  - my-task
```

---

## Advanced Usage

### Q19: How do I integrate AIOX with CI/CD?

**Answer:**

**GitHub Actions example:**

```yaml
name: CI with AIOX
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npx aiox-core install --full --ide claude-code
      - run: npm test
```

**GitLab CI example:**

```yaml
test:
  image: node:18
  script:
    - npx aiox-core install --full
    - npm test
```

---

### Q20: How do I customize core-config.yaml?

**Answer:** The `core-config.yaml` file controls framework behavior:

```yaml
# Document sharding
prd:
  prdSharded: true
  prdShardedLocation: docs/prd

# Story location
devStoryLocation: docs/stories

# Files loaded by dev agent
devLoadAlwaysFiles:
  - docs/framework/coding-standards.md
  - docs/framework/tech-stack.md

# Git configuration
git:
  showConfigWarning: true
  cacheTimeSeconds: 300

# Project status in agent greetings
projectStatus:
  enabled: true
  showInGreeting: true
```

**After editing, restart your IDE to apply changes.**

---

### Q21: How do I contribute to AIOX?

**Answer:**

1. **Fork the repository:** https://github.com/SynkraAI/aiox-core

2. **Create a feature branch:**

   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make changes following coding standards:**
   - Read `docs/framework/coding-standards.md`
   - Add tests for new features
   - Update documentation

4. **Submit a pull request:**
   - Describe your changes
   - Link to related issues
   - Wait for review

**Types of contributions welcome:**

- Bug fixes
- New agents
- Documentation improvements
- Starter squads
- IDE integrations

---

### Q22: Where can I get help?

**Answer:**

| Resource            | Link                                                       |
| ------------------- | ---------------------------------------------------------- |
| **Documentation**   | `docs/` in your project                                    |
| **Troubleshooting** | [troubleshooting.md](./troubleshooting.md)                 |
| **GitHub Issues**   | https://github.com/SynkraAI/aiox-core/issues |
| **Source Code**     | https://github.com/SynkraAI/aiox-core        |

**Before asking for help:**

1. Check this FAQ
2. Check the [Troubleshooting Guide](./troubleshooting.md)
3. Search existing GitHub issues
4. Include system info and error messages in your question

---

## Related Documentation

- [Troubleshooting Guide](./troubleshooting.md)
- [Coding Standards](../framework/coding-standards.md)
