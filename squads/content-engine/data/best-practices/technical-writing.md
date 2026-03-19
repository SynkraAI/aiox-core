---
id: technical-writing
name: "Technical & Long-Form Writing"
whenToUse: |
  Creating agents that write articles, blog posts, documentation, tutorials,
  white papers, case studies, or educational content.
  NOT for: short-form persuasive copy, research, data analysis, strategic planning.
version: "1.0.0"
---

# Technical & Long-Form Writing — Best Practices

## Core Principles

1. **Clarity over cleverness.** Use simple, direct language. Choose concrete examples over abstract explanations. If a twelve-year-old cannot understand your sentence structure, rewrite it. Technical content does not require complicated prose.

2. **Structure first, always.** Never write without an outline. The outline is the skeleton that holds everything together. Define your sections, their order, and their purpose before drafting a single paragraph. Share the outline for approval before proceeding to the full draft.

3. **Evidence-based arguments.** Every claim needs support. Cite sources, reference data, quote experts, or provide concrete examples. Unsupported assertions undermine credibility. When exact data is unavailable, say so explicitly rather than fabricating statistics.

4. **Progressive disclosure.** Start simple, build complexity. Introduce concepts in layers so readers can follow regardless of their starting knowledge level. The first paragraph of each section should be accessible; depth increases as the section progresses.

5. **Accessibility without compromise.** Never use jargon without defining it on first use. Acronyms get spelled out the first time. Technical terms receive inline definitions or parenthetical explanations. Accessibility does not mean dumbing down; it means removing unnecessary barriers.

6. **Completeness within scope.** Cover the topic thoroughly within the defined boundaries. If a topic requires more depth than the current format allows, flag it and recommend a follow-up piece or a series. Never leave obvious questions unanswered.

7. **Audience-appropriate depth.** A tutorial for beginners requires different depth than a white paper for CTOs. Assess the audience before writing and calibrate vocabulary, example complexity, and assumed knowledge accordingly. When in doubt, err on the side of more explanation, not less.

8. **Scannable structure.** Use subheadings, bullet points, numbered lists, bold key terms, and short paragraphs. Readers scan before they read. Make scanning productive by ensuring subheadings communicate the key point of each section.

9. **Actionable takeaways.** Every piece should leave the reader with something they can do. A blog post should end with next steps. A tutorial should produce a working result. A white paper should inform a decision. Content without action is content without purpose.

## Writing Methodology

### Step 1: Load Context

Gather all inputs before writing anything. Required context includes:
- Topic definition and scope boundaries
- Target audience (role, expertise level, goals)
- Brand voice guidelines (if available)
- Research brief or source materials (from researcher agent)
- Content format (blog post, tutorial, documentation, white paper)
- Target word count or depth expectations
- Any existing content on the topic to avoid duplication

### Step 2: Create Outline

Build a detailed outline that maps the argument or teaching progression:
- Define the hook (why should the reader care right now?)
- Map sections to a logical flow (chronological, problem-solution, simple-to-complex)
- Assign approximate word counts per section
- Identify where evidence, examples, and visuals are needed
- Mark sections that may need additional research
- Present the outline for approval before proceeding

### Step 3: Draft Introduction

Write the introduction with three components:
- **Hook:** A concrete scenario, surprising statistic, or relatable problem that pulls the reader in
- **Promise:** A clear statement of what the reader will learn or gain
- **Roadmap:** A brief preview of the article structure so the reader knows what to expect

### Step 4: Write Body Sections

Draft one section at a time, following the approved outline:
- Open each section with a clear topic sentence
- Support claims with evidence (data, citations, examples)
- Include at least one concrete example per section
- Use transitional phrases between paragraphs and sections
- Add subheadings every 200-300 words
- Keep paragraphs under 4-5 sentences

### Step 5: Draft Conclusion

Write a conclusion that delivers on the introduction's promise:
- Summarize key points without repeating them verbatim
- Provide an actionable takeaway the reader can implement immediately
- If appropriate, point to next steps or related resources
- End on a forward-looking or motivating note, not a summary rehash

### Step 6: Self-Review

Review the complete draft against quality criteria:
- Read the full piece for flow and coherence
- Check that every section delivers on its outline promise
- Verify all claims have supporting evidence
- Confirm no jargon is used without definition
- Validate subheading frequency and readability
- Ensure the introduction's promise matches the conclusion's delivery
- Check reading level appropriateness for the target audience

### Step 7: Compile with Metadata

Prepare the final output with all required metadata:
- Title (compelling, specific, keyword-aware)
- Subtitle or deck (one-sentence summary)
- Meta description (for SEO, 150-160 characters)
- Suggested tags or categories
- Estimated reading time
- The complete article body

## Decision Criteria

- **When to add examples vs. move on:** Add an example whenever a concept is abstract, counterintuitive, or new to the target audience. Move on when the point is concrete and self-evident.
- **When depth is sufficient:** Depth is sufficient when a reader at the target expertise level can act on the information without needing to consult another source for the same concept.
- **When to recommend splitting into a series:** If the outline exceeds the target word count by more than 30%, or if two or more sections could stand alone as complete articles, recommend a series.
- **When to use lists vs. prose:** Use lists for sequential steps, parallel items, or scannable reference material. Use prose for narrative flow, argumentation, and context-setting.
- **When to recommend visuals:** Recommend a diagram, screenshot, or illustration whenever a concept involves spatial relationships, multi-step processes, or comparisons across three or more items.

## Quality Criteria

Before delivering any piece of content, verify the following:

- [ ] **Clear structure.** The piece has a defined introduction, body sections, and conclusion. The reader can predict the flow from the introduction.
- [ ] **Examples in every section.** Each body section contains at least one concrete example, code snippet, scenario, or case reference.
- [ ] **No undefined jargon.** Every technical term, acronym, or domain-specific phrase is defined on first use.
- [ ] **Appropriate subheading frequency.** No section runs longer than 300 words without a subheading or visual break.
- [ ] **Evidence-backed claims.** Quantitative claims reference a source. Qualitative claims are supported by examples or expert references.
- [ ] **Actionable takeaway present.** The piece ends with specific next steps, recommendations, or actions the reader can take.
- [ ] **Reading level matches audience.** A beginner tutorial reads at a lower complexity than a white paper for senior engineers. Vocabulary and assumed knowledge align with the target audience.
- [ ] **Word count matches format.** Blog posts: 800-2,000 words. Tutorials: 1,500-3,000 words. White papers: 3,000-6,000 words. Documentation pages: 500-1,500 words.
- [ ] **No em dashes.** The entire output has been checked for em dashes and none are present.
- [ ] **Introduction promise matches conclusion delivery.** Whatever the introduction says the reader will learn, the conclusion confirms they learned it.
- [ ] **Transitions between sections.** Each section connects logically to the next. The reader never wonders "why am I reading this now?"
- [ ] **Metadata complete.** Title, meta description, tags, and estimated reading time are all provided with the final draft.

## Output Examples

### Example 1: Blog Post Introduction + Outline + First Section

**Title:** How Connection Pooling Cuts Your Database Latency in Half

**Meta description:** Learn how connection pooling works, why it reduces database latency, and how to implement it in Node.js with practical code examples.

**Estimated reading time:** 8 minutes

---

**Introduction:**

Every time your application opens a new database connection, it pays a tax. The TCP handshake, authentication, SSL negotiation, and protocol setup add 20-50 milliseconds per connection. For a single request, that is negligible. For an application handling 1,000 requests per second, that is 20-50 seconds of cumulative overhead every second, just from connection setup.

Connection pooling eliminates this tax by maintaining a set of pre-established connections that your application reuses. Instead of opening and closing connections per request, your app borrows a connection from the pool, uses it, and returns it. The result: database latency drops by 40-60% in most production workloads.

This article covers three things. First, you will understand how connection pooling works under the hood. Second, you will see benchmark data comparing pooled and unpooled connections. Third, you will implement a production-ready connection pool in Node.js with proper error handling and monitoring.

---

**Outline:**

1. The cost of a database connection (what happens during setup, measured latency)
2. How connection pooling works (pool lifecycle, borrow/return model, idle management)
3. Benchmark results (pooled vs. unpooled across load levels)
4. Implementation in Node.js (code walkthrough with pg-pool)
5. Production considerations (pool sizing, error handling, monitoring)
6. Common pitfalls (connection leaks, pool exhaustion, stale connections)
7. Key takeaways and next steps

---

**Section 1: The Cost of a Database Connection**

When your application calls `db.connect()`, the following sequence executes before a single query can run:

1. **DNS resolution** resolves the database hostname to an IP address (1-10ms)
2. **TCP handshake** establishes the network connection with a three-way SYN/SYN-ACK/ACK exchange (1-5ms locally, 10-50ms cross-region)
3. **TLS negotiation** sets up encrypted communication if SSL is enabled (5-15ms)
4. **Authentication** sends credentials and receives confirmation (2-10ms)
5. **Protocol initialization** configures session parameters like character set and timezone (1-5ms)

Total setup cost per connection: **10-90ms** depending on network topology and security configuration.

For a simple SELECT query that takes 2ms to execute, the connection setup can represent 80-97% of the total request time. That ratio gets worse with geographic distance between your application server and database server.

To put this in context, consider an e-commerce application that runs 5 database queries per page load. If each query opens a new connection, the user pays 50-450ms in connection overhead alone, before any actual data retrieval. On a page that otherwise loads in 200ms, connection setup could triple the total response time.

This overhead is entirely avoidable. The connections themselves are reusable. Once established, a database connection can handle thousands of queries sequentially. The only reason to close and reopen connections is resource management, which is exactly what connection pooling automates.

### Example 2: Tutorial Section with Step-by-Step Instructions

**Section: Setting Up Automated Backups with Cron and Restic**

Before you begin, make sure you have the following prerequisites installed on your server:

- **Restic** (version 0.14 or later): the backup tool that handles deduplication and encryption
- **Cron**: the standard Unix job scheduler (pre-installed on most Linux distributions)
- **An S3-compatible storage bucket**: where your encrypted backups will be stored (AWS S3, MinIO, or Backblaze B2 all work)

If you do not have Restic installed, run the following command on Ubuntu/Debian:

```bash
sudo apt update && sudo apt install restic
```

Verify the installation by checking the version:

```bash
restic version
# Expected output: restic 0.16.2 (or later)
```

**Step 1: Initialize the backup repository.**

A Restic repository is the destination where your backup data lives. You initialize it once, and all future backups write to the same repository. Run this command, replacing the bucket name and path with your own:

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"

restic -r s3:s3.amazonaws.com/your-bucket-name/backups init
```

Restic will prompt you for a repository password. Choose a strong password and store it in a password manager. You will need this password for every backup and restore operation. Without it, your backups are permanently inaccessible (this is a security feature, not a limitation).

**Step 2: Create the backup script.**

Rather than typing the full Restic command every time, create a shell script that handles environment variables, paths, and error reporting. Save this file as `/opt/scripts/backup.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Configuration
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export RESTIC_REPOSITORY="s3:s3.amazonaws.com/your-bucket-name/backups"
export RESTIC_PASSWORD_FILE="/etc/restic/password.txt"

# Directories to back up
BACKUP_PATHS="/var/www /etc/nginx /home"

# Directories to exclude
EXCLUDE_PATTERNS="--exclude='*.tmp' --exclude='node_modules' --exclude='.cache'"

# Run the backup
restic backup $BACKUP_PATHS $EXCLUDE_PATTERNS \
  --tag "automated" \
  --tag "$(hostname)" \
  2>&1 | logger -t restic-backup

# Prune old snapshots: keep 7 daily, 4 weekly, 6 monthly
restic forget \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 6 \
  --prune \
  2>&1 | logger -t restic-prune

echo "Backup completed at $(date)" | logger -t restic-backup
```

Two things to note about this script. First, the `set -euo pipefail` line at the top ensures the script stops immediately if any command fails, rather than silently continuing with partial backups. Second, the output pipes to `logger`, which writes to your system's syslog. This means you can review backup logs with `journalctl -t restic-backup` without managing separate log files.

**Step 3: Set file permissions.**

Your backup script contains storage credentials, so restrict its permissions to root only:

```bash
sudo chmod 700 /opt/scripts/backup.sh
sudo chown root:root /opt/scripts/backup.sh
```

Store the repository password in a separate file with equally restrictive permissions:

```bash
echo "your-repository-password" | sudo tee /etc/restic/password.txt > /dev/null
sudo chmod 600 /etc/restic/password.txt
sudo chown root:root /etc/restic/password.txt
```

**Step 4: Schedule the backup with Cron.**

Open the root crontab and add a daily backup schedule:

```bash
sudo crontab -e
```

Add this line to run backups every day at 2:00 AM server time:

```cron
0 2 * * * /opt/scripts/backup.sh
```

The five fields represent minute (0), hour (2), day of month (any), month (any), and day of week (any). This schedule avoids peak usage hours while running frequently enough to limit data loss to a maximum of 24 hours.

**Step 5: Verify the setup.**

Run the backup script manually to confirm everything works before relying on the cron schedule:

```bash
sudo /opt/scripts/backup.sh
```

After the script completes, verify that snapshots appear in your repository:

```bash
restic -r s3:s3.amazonaws.com/your-bucket-name/backups snapshots
```

You should see one snapshot listed with the current timestamp and the tags "automated" and your hostname. If you see errors instead, check that your AWS credentials are correct and that the S3 bucket exists and is accessible from your server.

## Anti-Patterns

### Never Do

1. **Write without an outline.** Drafting without structure leads to meandering content, redundant sections, and missing coverage. Always outline first, get approval, then write.

2. **Use jargon without definition.** Every undefined technical term is a potential exit point for the reader. Define terms inline on first use, even if you think the audience "should know."

3. **Exceed scope without flagging.** If writing reveals that the topic needs more coverage than planned, stop and flag it. Recommend a follow-up piece or series rather than inflating the current piece beyond its intended scope.

4. **Write walls of text without subheadings.** More than 300 words without a visual break (subheading, list, code block, or image) signals that the content needs restructuring. Scan-friendliness is not optional.

5. **Make claims without evidence.** Statements like "most developers prefer" or "this approach is faster" require supporting data, a citation, or at minimum a concrete example. Unsupported claims erode trust.

6. **Use em dashes anywhere in the output.** Replace every em dash with a comma, period, colon, or parenthetical. This is a non-negotiable formatting rule.

7. **Start sections with definitions.** "Authentication is the process of..." is the weakest possible opening. Start with a problem, scenario, or consequence, then introduce the concept as the solution.

8. **Repeat the same point in different words.** If you have said it clearly once, move forward. Repetition for emphasis works in speeches, not in written content. Readers can re-read; they should not have to.

### Always Do

1. **Include at least one concrete example in every section.** Abstract explanations without examples leave readers uncertain about practical application. Examples bridge the gap between theory and practice.

2. **Define technical terms on first use.** Use inline definitions (parenthetical or appositive) to keep the reader moving without requiring them to look things up externally.

3. **Use subheadings every 200-300 words.** Subheadings serve two purposes: they help scanners find relevant sections, and they help readers track their progress through the piece.

4. **Provide actionable takeaways.** Every article, tutorial, or guide should end with something the reader can do next. If your content does not change behavior or inform a decision, reconsider its purpose.

5. **Front-load key information.** Put the most important point of each section in the first sentence. Readers who scan will still absorb the core message.

6. **Use parallel structure in lists.** Every item in a list should follow the same grammatical pattern. Mixing verb forms, sentence fragments, and complete sentences within a single list creates cognitive friction.

## Vocabulary Guidance

### Use

- **Concrete examples** to anchor abstract concepts: "For instance, if your API returns a 429 status code, that means..."
- **Scenario-based framing** to build relevance: "Consider this scenario: your team just shipped a feature and usage spikes overnight..."
- **Transitional phrases** to maintain flow between paragraphs and sections: "Building on this foundation...", "With that context in mind...", "This brings us to..."
- **Active voice** as the default for direct, clear communication: "The function validates the input" not "The input is validated by the function."
- **Specific numbers and data** over vague qualifiers: "Reduced load time by 40%" not "Significantly improved performance."
- **Reader-addressing language** to maintain engagement: "You will notice...", "At this point, you have...", "Your next step is..."
- **Short sentences for key points.** When stating something important, keep it brief. Let the sentence stand alone.

### Avoid

- **Jargon without definition.** If a term requires domain knowledge, define it inline on first use. No exceptions.
- **Em dashes.** Do not use em dashes in any output. They are the most recognizable marker of AI-generated text. Use commas, periods, parentheses, or colons instead.
- **Filler phrases.** Remove "It's important to note that...", "It goes without saying...", "Needless to say...", "At the end of the day...", "In today's world..." These add no information.
- **Passive voice without reason.** Use passive voice only when the actor is genuinely unknown or irrelevant. Otherwise, name the subject.
- **"In conclusion" or "To summarize."** The conclusion should feel like a natural landing, not an announcement. Show the ending through content, not labels.
- **Walls of text.** Never write more than 300 words without a subheading, list, or visual break. Dense paragraphs lose readers.
- **Rhetorical questions as filler.** Only use a question when you immediately answer it and the answer drives the narrative forward.
- **Exclamation marks.** Professional content earns enthusiasm through substance, not punctuation.

### Tone Rules

1. **Authoritative but approachable.** Write like a senior colleague explaining something to a motivated junior, not like a professor lecturing a class. Confidence without condescension.
2. **Educational without patronizing.** Assume the reader is intelligent but may lack specific domain knowledge. Explain concepts, not because the reader is incapable, but because the topic is genuinely complex.
3. **Evidence-driven, not opinion-driven.** State facts, cite sources, present data. When offering an opinion or recommendation, label it clearly: "Based on these results, we recommend..." or "In our experience..."
4. **Calm and measured.** Avoid hype, urgency, or sensationalism. Let the content's value speak for itself. "This approach reduces errors by 60%" is more persuasive than "This game-changing approach will revolutionize your workflow."
