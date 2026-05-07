const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');

const repoRoot = path.resolve(__dirname, '..', '..');
const agentsDir = path.join(repoRoot, '.claude', 'agents');
const authorityHookPath = path.join(repoRoot, '.claude', 'hooks', 'enforce-git-push-authority.cjs');
const allowedColors = new Set(['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']);

function readFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  return yaml.load(match[1]);
}

function runAuthorityHook(command, env = {}) {
  return spawnSync(process.execPath, [authorityHookPath], {
    input: JSON.stringify({
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command },
    }),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

describe('Claude native subagent governance', () => {
  it('keeps all native subagents compliant with supported frontmatter fields', () => {
    const files = fs.readdirSync(agentsDir).filter(file => file.endsWith('.md')).sort();

    expect(files).toHaveLength(29);

    for (const file of files) {
      const frontmatter = readFrontmatter(path.join(agentsDir, file));

      expect(frontmatter).toBeTruthy();
      expect(frontmatter.name).toEqual(expect.stringMatching(/^[a-z0-9-]+$/));
      expect(frontmatter.description).toBeTruthy();
      expect(allowedColors.has(frontmatter.color)).toBe(true);
      expect(frontmatter.tools || []).not.toContain('Task');
    }
  });

  it('requires the remote Git authority hook for every non-devops bypass agent with Bash', () => {
    const files = fs.readdirSync(agentsDir).filter(file => file.endsWith('.md')).sort();

    for (const file of files) {
      const frontmatter = readFrontmatter(path.join(agentsDir, file));
      const tools = frontmatter.tools || [];
      const isNonDevopsBypassBash =
        frontmatter.permissionMode === 'bypassPermissions' &&
        tools.includes('Bash') &&
        !['aiox-devops', 'devops', 'github-devops'].includes(frontmatter.name);

      if (isNonDevopsBypassBash) {
        expect(JSON.stringify(frontmatter.hooks)).toContain('enforce-git-push-authority.cjs');
      }
    }
  });

  it('registers the remote Git authority hook at project settings level', () => {
    const settings = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude', 'settings.json'), 'utf8'));
    const preToolUse = settings.hooks?.PreToolUse || [];

    expect(JSON.stringify(preToolUse)).toContain('enforce-git-push-authority.cjs');
    expect(preToolUse.some(entry => entry.matcher === 'Bash')).toBe(true);
  });

  it('uses shell-neutral project hook commands in committed Claude settings', () => {
    const settings = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude', 'settings.json'), 'utf8'));
    const commands = Object.values(settings.hooks || {})
      .flat()
      .flatMap(entry => entry.hooks || [])
      .map(hook => hook.command);

    expect(commands).toEqual(expect.arrayContaining([
      'node .claude/hooks/synapse-wrapper.cjs',
      'node .claude/hooks/precompact-wrapper.cjs',
      'node .claude/hooks/enforce-git-push-authority.cjs',
    ]));

    for (const command of commands) {
      expect(command).not.toContain('CLAUDE_PROJECT_DIR');
      expect(command).not.toContain('${');
      expect(command).toMatch(/^node \.claude\/hooks\/[-a-z]+\.cjs$/);
    }
  });

  it('blocks remote GitHub operations outside devops and allows devops-tagged commands', () => {
    const blockedCommands = [
      'git push origin main',
      'gh pr create --title test --body test',
      'gh pr merge 123 --admin',
    ];

    for (const command of blockedCommands) {
      const result = runAuthorityHook(command, { AIOX_ACTIVE_AGENT: 'dev' });
      expect(result.status).toBe(0);
      const decision = JSON.parse(result.stdout);
      expect(decision.hookSpecificOutput.permissionDecision).toBe('deny');
    }

    const allowed = runAuthorityHook('git push origin main', { AIOX_ACTIVE_AGENT: 'devops' });
    expect(allowed.status).toBe(0);
    expect(allowed.stdout).toBe('');
  });
});
