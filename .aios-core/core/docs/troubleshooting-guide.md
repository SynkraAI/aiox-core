# Synkra AIOS Meta-Agent Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common issues when using the Synkra AIOS meta-agent for component creation and management.

## Table of Contents

1. [Component Creation Issues](#component-creation-issues)
2. [Template Processing Problems](#template-processing-problems)
3. [Elicitation Workflow Issues](#elicitation-workflow-issues)
4. [Security Validation Errors](#security-validation-errors)
5. [Transaction and Rollback Problems](#transaction-and-rollback-problems)
6. [Batch Creation Failures](#batch-creation-failures)
7. [Dependency Resolution Issues](#dependency-resolution-issues)
8. [Performance Problems](#performance-problems)
9. [Debug Techniques](#debug-techniques)

## Component Creation Issues

### Issue: "Component already exists"

**Symptoms:**
```
❌ Error: Agent 'data-analyst' already exists at /aios-core/agents/data-analyst.md
```

**Causes:**
- Component with same name already created
- Previous creation attempt partially succeeded

**Solutions:**
1. Choose a different name:
   ```bash
   *create-agent
   ? Agent name: data-analyst-v2
   ```

2. Check existing components:
   ```bash
   ls aios-core/agents/
   ```

3. If overwriting is intended:
   ```bash
   # Remove existing component first
   rm aios-core/agents/data-analyst.md
   *create-agent
   ```

### Issue: "Invalid name format"

**Symptoms:**
```
❌ Name must be lowercase with hyphens only
```

**Causes:**
- Using uppercase letters
- Spaces or underscores in name
- Starting with number

**Solutions:**
1. Follow naming conventions:
   - ✅ Good: `data-analyst`, `api-tester`, `log-monitor`
   - ❌ Bad: `DataAnalyst`, `api_tester`, `log monitor`, `2-analyzer`

2. Use the transformer:
   ```javascript
   // Name transformer logic
   const validName = inputName
     .toLowerCase()
     .replace(/\s+/g, '-')
     .replace(/[^a-z0-9-]/g, '')
     .replace(/^[0-9]/, '');
   ```

### Issue: "Template not found"

**Symptoms:**
```
❌ Error: Template not found: agent-template.yaml
```

**Causes:**
- Missing template files
- Incorrect installation
- Wrong working directory

**Solutions:**
1. Verify template location:
   ```bash
   ls aios-core/templates/
   # Should see: agent-template.yaml, task-template.md, workflow-template.yaml
   ```

2. Reinstall templates:
   ```bash
   # From project root
   npm run setup:templates
   ```

3. Check working directory:
   ```bash
   pwd
   # Should be in aios-core root
   ```

## Template Processing Problems

### Issue: Variables not replaced

**Symptoms:**
```
Generated content contains: {{AGENT_NAME}} instead of actual value
```

**Causes:**
- Missing variables in elicitation
- Typo in variable names
- Template syntax errors

**Solutions:**
1. Enable debug mode:
   ```bash
   DEBUG_TEMPLATES=true *create-agent
   ```

2. Check variable mapping:
   ```javascript
   // Common variable mappings
   {
     AGENT_NAME: answers.agentName,
     AGENT_TITLE: answers.agentTitle,
     WHEN_TO_USE: answers.whenToUse
   }
   ```

3. Validate template syntax:
   - Opening tag: `{{#IF_VARIABLE}}`
   - Closing tag: `{{/IF_VARIABLE}}`
   - Variable: `{{VARIABLE_NAME}}`

### Issue: Malformed output

**Symptoms:**
- Broken YAML structure
- Missing sections
- Incorrect indentation

**Causes:**
- Template indentation issues
- Conditional logic errors
- Special characters in input

**Solutions:**
1. Check template indentation:
   ```yaml
   {{#IF_COMMANDS}}
   commands:
   {{#EACH_COMMANDS}}
     - name: {{COMMAND_NAME}}  # Note the spacing
   {{/EACH_COMMANDS}}
   {{/IF_COMMANDS}}
   ```

2. Escape special characters:
   ```javascript
   const escaped = input
     .replace(/"/g, '\\"')
     .replace(/\n/g, '\\n');
   ```

## Elicitation Workflow Issues

### Issue: Prompts not appearing

**Symptoms:**
- Command exits immediately
- No interactive prompts shown

**Causes:**
- Non-interactive terminal
- Mock mode enabled
- Input stream issues

**Solutions:**
1. Ensure interactive terminal:
   ```bash
   # Force interactive mode
   *create-agent --interactive
   ```

2. Check mock mode:
   ```javascript
   // In elicitation-engine.js
   if (this.mockMode) {
     console.log('Mock mode is enabled');
   }
   ```

3. Reset terminal:
   ```bash
   reset
   *create-agent
   ```

### Issue: Session not saving

**Symptoms:**
```
⚠️ Warning: Failed to save elicitation session
```

**Causes:**
- Missing session directory
- Permissions issues
- Disk space

**Solutions:**
1. Create session directory:
   ```bash
   mkdir -p aios-core/.sessions
   ```

2. Check permissions:
   ```bash
   chmod 755 aios-core/.sessions
   ```

3. Verify disk space:
   ```bash
   df -h .
   ```

## Security Validation Errors

### Issue: "Security check failed"

**Symptoms:**
```
❌ Security check failed: Potential code injection detected
```

**Causes:**
- Script tags in input
- Executable code patterns
- Suspicious file paths

**Solutions:**
1. Avoid code in descriptions:
   - ❌ Bad: `Executes <script>alert('hi')</script>`
   - ✅ Good: `Processes user alerts`

2. Use plain text:
   ```
   ? Description: Analyzes log files for errors
   # Not: Runs `grep -E "error|fail" *.log`
   ```

3. Check security rules:
   ```javascript
   // In security-checker.js
   const forbidden = [
     /<script/i,
     /eval\(/,
     /require\(['"]\./,
     /\.\.\//
   ];
   ```

### Issue: "Path traversal detected"

**Symptoms:**
```
❌ Security: Path traversal attempt detected
```

**Causes:**
- Using `../` in paths
- Absolute paths outside project
- Symbolic link attempts

**Solutions:**
1. Use relative paths within project:
   ```javascript
   // Good
   path.join(this.rootPath, 'agents', 'my-agent.md')
   
   // Bad
   path.join('../../../', 'agents', 'my-agent.md')
   ```

2. Validate paths:
   ```javascript
   const safePath = path.normalize(inputPath);
   if (!safePath.startsWith(this.rootPath)) {
     throw new Error('Path outside project');
   }
   ```

## Transaction and Rollback Problems

### Issue: "No transaction to rollback"

**Symptoms:**
```
⚠️ No transactions found to rollback
```

**Causes:**
- Transaction already rolled back
- Transaction logs deleted
- No recent operations

**Solutions:**
1. List available transactions:
   ```bash
   *list-transactions
   ```

2. Check transaction directory:
   ```bash
   ls aios-core/logs/transactions/
   ```

3. Use specific transaction ID:
   ```bash
   *undo-last --transaction-id=txn-1234567890-abcd
   ```

### Issue: Partial rollback failure

**Symptoms:**
```
✅ Successful: 3
❌ Failed: 2
   - file1.md: Permission denied
   - manifest.yaml: File not found
```

**Causes:**
- Files modified after creation
- Missing backup files
- Permission changes

**Solutions:**
1. Manual cleanup:
   ```bash
   # Check failed files
   ls -la aios-core/agents/file1.md
   
   # Remove manually if needed
   rm aios-core/agents/file1.md
   ```

2. Force rollback:
   ```bash
   *undo-last --force --continue-on-error
   ```

3. Restore from backup:
   ```bash
   # Check backups
   ls aios-core/logs/transactions/txn-*/backups/
   ```

## Batch Creation Failures

### Issue: "Circular dependency detected"

**Symptoms:**
```
❌ Circular dependency detected: A → B → C → A
```

**Causes:**
- Tasks depending on each other
- Workflow referencing itself
- Complex dependency chains

**Solutions:**
1. Review dependencies:
   ```javascript
   // Check dependency graph
   {
     "task-a": ["task-b"],
     "task-b": ["task-c"],
     "task-c": ["task-a"]  // Circular!
   }
   ```

2. Break circular chains:
   - Remove unnecessary dependencies
   - Create intermediate tasks
   - Use conditional dependencies

3. Visualize dependencies:
   ```bash
   *analyze-dependencies --visual
   ```

### Issue: Batch creation partially fails

**Symptoms:**
```
📦 Creating components [████████░░░░░░░░░░] 45% 5/11
❌ Some components failed to create
```

**Causes:**
- Individual component errors
- Dependency not met
- Resource constraints

**Solutions:**
1. Check failure details:
   ```bash
   # Review transaction log
   cat aios-core/logs/transactions/latest.json
   ```

2. Rollback and retry:
   ```bash
   *undo-last
   # Fix issues
   *create-suite --continue-from=component-6
   ```

3. Create individually:
   ```bash
   # Skip batch, create one by one
   *create-agent
   *create-task
   ```

## Dependency Resolution Issues

### Issue: "Missing dependencies"

**Symptoms:**
```
⚠️ Task 'analyze-data' requires agent 'data-analyst' which doesn't exist
```

**Causes:**
- Creating task before agent
- Typo in agent name
- Deleted dependencies

**Solutions:**
1. Check existing components:
   ```bash
   *list-components --type=agent
   ```

2. Create missing dependencies:
   ```bash
   *create-agent
   ? Agent name: data-analyst
   ```

3. Use batch creation:
   ```bash
   *create-suite
   > Complete Agent Package
   ```

## Performance Problems

### Issue: Slow component creation

**Symptoms:**
- Creation takes > 30 seconds
- Terminal freezes
- High CPU usage

**Causes:**
- Large template files
- Complex validation
- Disk I/O issues

**Solutions:**
1. Profile performance:
   ```bash
   DEBUG=perf:* *create-agent
   ```

2. Optimize templates:
   - Reduce template size
   - Simplify conditionals
   - Cache processed templates

3. Check system resources:
   ```bash
   # CPU usage
   top
   
   # Disk I/O
   iostat -x 1
   ```

### Issue: Memory usage high

**Symptoms:**
```
FATAL ERROR: JavaScript heap out of memory
```

**Causes:**
- Large batch operations
- Memory leaks
- Circular references

**Solutions:**
1. Increase Node memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" *create-suite
   ```

2. Reduce batch size:
   ```javascript
   // In batch-creator.js
   options.batchSize = 5; // Instead of 50
   ```

3. Clear caches:
   ```bash
   rm -rf aios-core/.cache/
   ```

## Debug Techniques

### Enable Debug Output

```bash
# All debug output
DEBUG=* *create-agent

# Specific modules
DEBUG=aios:template,aios:elicitation *create-agent

# Performance timing
DEBUG=perf:* *create-agent
```

### Check Logs

```bash
# Application logs
tail -f aios-core/logs/aios-developer.log

# Transaction logs
ls -la aios-core/logs/transactions/

# Error logs
grep ERROR aios-core/logs/*.log
```

### Validate Components

```bash
# Validate single component
*validate-component --type=agent --name=data-analyst

# Validate all components
*validate-all --fix-issues
```

### Test Mode

```bash
# Dry run without creating files
*create-agent --dry-run

# Test with mock data
*create-agent --test-mode
```

## Getting Help

### Built-in Help

```bash
# General help
*help

# Command-specific help
*help create-agent
*help create-suite
*help undo-last
```

### Documentation

- Template syntax: `aios-core/docs/template-syntax.md`
- Creation guide: `aios-core/docs/component-creation-guide.md`
- API reference: `aios-core/docs/api-reference.md`

### Support Channels

1. **Check existing issues**: Review known problems
2. **Enable debug mode**: Gather diagnostic info
3. **Collect logs**: Include relevant error messages
4. **Minimal reproduction**: Create simple test case

### Emergency Recovery

If all else fails:

1. **Backup current state**:
   ```bash
   tar -czf aios-backup.tar.gz aios-core/
   ```

2. **Reset to clean state**:
   ```bash
   git checkout -- aios-core/
   npm run setup
   ```

3. **Restore from transaction logs**:
   ```bash
   *restore-from-transaction --id=last-known-good
   ```