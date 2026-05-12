// Integration/Performance test - uses describeIntegration
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Agent Backward Compatibility Test Suite
 *
 * Task 5.2 Requirements:
 * - Agents without dependencies.tools continue working
 * - No errors thrown during agent activation
 * - Existing workflows unaffected
 * - Verify graceful handling of missing tools field
 *
 * This suite tests:
 * 1. Agents without dependencies.tools field load successfully
 * 2. No errors when accessing tools property
 * 3. Agent structure remains valid
 * 4. Workflows using agents without tools work correctly
 */
describeIntegration('Agent Backward Compatibility - Missing Tools Field', () => {
  const agentsPath = path.join(__dirname, '../../aiox-core/agents');

  // Agents WITH dependencies.tools (migrated)
  const agentsWithTools = ['dev', 'qa', 'architect', 'po', 'sm'];

  // Agents WITHOUT dependencies.tools (legacy/backward compatible)
  const agentsWithoutTools = ['analyst', 'pm', 'ux-expert'];

  // Helper function to load agent YAML from markdown
  async function loadAgentYaml(agentId) {
    const filePath = path.join(agentsPath, `${agentId}.md`);
    const content = await fs.readFile(filePath, 'utf8');

    // Extract YAML block from markdown - handle both \n and \r\n line endings
    const yamlMatch = content.match(/```yaml[\r\n]+([\s\S]*?)[\r\n]+```/);
    if (!yamlMatch) {
      throw new Error(`No YAML block found in ${agentId}.md`);
    }

    return yaml.load(yamlMatch[1]);
  }

  // Helper to safely access dependencies.tools
  function getAgentTools(agentConfig) {
    return agentConfig?.dependencies?.tools || null;
  }

  describeIntegration('Agents Without Tools Field', () => {
    test('agents without dependencies.tools load successfully', async () => {
      const results = [];

      for (const agentId of agentsWithoutTools) {
        const config = await loadAgentYaml(agentId);
        results.push({
          id: agentId,
          hasTools: !!config.dependencies?.tools,
          config,
        });
      }

      // All should load without errors
      expect(results).toHaveLength(agentsWithoutTools.length);

      // All should NOT have tools field
      results.forEach(({ _id, hasTools }) => {
        expect(hasTools).toBe(false);
      });
    });

    test('analyst agent has no tools field', async () => {
      const config = await loadAgentYaml('analyst');

      expect(config.dependencies).toBeDefined();
      expect(config.dependencies.tools).toBeUndefined();

      // Should have other dependencies
      expect(config.dependencies.tasks).toBeDefined();
      expect(config.dependencies.templates).toBeDefined();
    });

    test('pm agent has no tools field', async () => {
      const config = await loadAgentYaml('pm');

      expect(config.dependencies).toBeDefined();
      expect(config.dependencies.tools).toBeUndefined();
    });

    test('ux-expert agent has no tools field', async () => {
      const config = await loadAgentYaml('ux-expert');

      expect(config.dependencies).toBeDefined();
      expect(config.dependencies.tools).toBeUndefined();
    });
  });

  describeIntegration('Agents With Tools Field', () => {
    test('dev agent has tools field', async () => {
      const config = await loadAgentYaml('dev');

      expect(config.dependencies).toBeDefined();
      expect(config.dependencies.tools).toBeDefined();
      expect(Array.isArray(config.dependencies.tools)).toBe(true);
      expect(config.dependencies.tools.length).toBeGreaterThan(0);
    });

    test('qa agent has tools field', async () => {
      const config = await loadAgentYaml('qa');

      expect(config.dependencies).toBeDefined();
      expect(config.dependencies.tools).toBeDefined();
      expect(Array.isArray(config.dependencies.tools)).toBe(true);
    });

    test('all agents with tools have valid tool lists', async () => {
      for (const agentId of agentsWithTools) {
        const config = await loadAgentYaml(agentId);
        const tools = getAgentTools(config);

        expect(tools).toBeDefined();
        expect(Array.isArray(tools)).toBe(true);
        expect(tools.length).toBeGreaterThan(0);

        // Each tool should be a string (tool ID)
        tools.forEach(toolId => {
          expect(typeof toolId).toBe('string');
          expect(toolId.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describeIntegration('No Errors Thrown for Missing Tools', () => {
    test('getAgentTools() handles undefined tools gracefully', async () => {
      const config = await loadAgentYaml('analyst');

      expect(() => {
        const tools = getAgentTools(config);
        expect(tools).toBeNull();
      }).not.toThrow();
    });

    test('accessing tools on agents without field does not throw', async () => {
      for (const agentId of agentsWithoutTools) {
        await expect(async () => {
          const config = await loadAgentYaml(agentId);
          const tools = config.dependencies?.tools;
          expect(tools).toBeUndefined();
        }).not.toThrow();
      }
    });

    test('agents without tools can still be loaded and parsed', async () => {
      const configs = await Promise.all(
        agentsWithoutTools.map(id => loadAgentYaml(_id)),
      );

      configs.forEach((config, index) => {
        expect(config).toBeDefined();
        expect(config.agent).toBeDefined();
        expect(config.agent.id).toBe(agentsWithoutTools[index]);
      });
    });
  });

  describeIntegration('Agent Structure Validation', () => {
    test('all agents have required core fields', async () => {
      const allAgents = [...agentsWithTools, ...agentsWithoutTools];

      for (const agentId of allAgents) {
        const config = await loadAgentYaml(agentId);

        // Core agent fields
        expect(config.agent).toBeDefined();
        expect(config.agent.id).toBe(agentId);
        expect(config.agent.name).toBeDefined();
        expect(config.agent.title).toBeDefined();

        // Core persona/behavior fields
        expect(config.persona || config.core_principles).toBeDefined();

        // Dependencies (may be empty but should exist)
        expect(config.dependencies).toBeDefined();
      }
    });

    test('agents without tools have other dependencies', async () => {
      for (const agentId of agentsWithoutTools) {
        const config = await loadAgentYaml(agentId);

        // Should have at least one other dependency type
        const hasTasks = config.dependencies?.tasks?.length > 0;
        const hasTemplates = config.dependencies?.templates?.length > 0;
        const hasData = config.dependencies?.data?.length > 0;
        const hasChecklists = config.dependencies?.checklists?.length > 0;

        expect(hasTasks || hasTemplates || hasData || hasChecklists).toBe(true);
      }
    });

    test('dependencies.tools is always array or undefined, never null', async () => {
      const allAgents = [...agentsWithTools, ...agentsWithoutTools];

      for (const agentId of allAgents) {
        const config = await loadAgentYaml(agentId);
        const tools = config.dependencies?.tools;

        // Should be undefined or array, never null
        expect(tools === null).toBe(false);
        if (tools !== undefined) {
          expect(Array.isArray(tools)).toBe(true);
        }
      }
    });
  });

  describeIntegration('Workflow Compatibility', () => {
    test('agents without tools can execute their commands', async () => {
      // Test that analyst agent has valid commands despite no tools
      const config = await loadAgentYaml('analyst');

      expect(config.commands).toBeDefined();
      expect(config.commands.length).toBeGreaterThan(0);

      // Commands should reference tasks, not tools
      const commandsStr = JSON.stringify(config.commands);
      expect(commandsStr).toContain('task');
    });

    test('agents without tools maintain activation instructions', async () => {
      for (const agentId of agentsWithoutTools) {
        const config = await loadAgentYaml(agentId);

        expect(config['activation-instructions']).toBeDefined();
        expect(Array.isArray(config['activation-instructions'])).toBe(true);
      }
    });

    test('mock workflow execution with agent without tools', async () => {
      // Simulate agent activation and command execution
      const config = await loadAgentYaml('analyst');

      // Mock activation
      const mockActivation = () => {
        return {
          agentId: config.agent.id,
          name: config.agent.name,
          tools: getAgentTools(config),
          commands: config.commands,
        };
      };

      const activated = mockActivation();

      expect(activated.agentId).toBe('analyst');
      expect(activated.tools).toBeNull();
      expect(activated.commands).toBeDefined();
      expect(() => {
        // Accessing tools should not throw
        const tools = activated.tools || [];
        expect(tools).toEqual([]);
      }).not.toThrow();
    });
  });

  describeIntegration('Graceful Degradation', () => {
    test('agent system handles mixed agents (with and without tools)', async () => {
      const results = {
        withTools: [],
        withoutTools: [],
      };

      for (const agentId of agentsWithTools) {
        const config = await loadAgentYaml(agentId);
        results.withTools.push({
          id: agentId,
          toolCount: getAgentTools(config)?.length || 0,
        });
      }

      for (const agentId of agentsWithoutTools) {
        const config = await loadAgentYaml(agentId);
        results.withoutTools.push({
          id: agentId,
          toolCount: getAgentTools(config)?.length || 0,
        });
      }

      // Agents with tools should have > 0 tools
      results.withTools.forEach(({ _id, toolCount }) => {
        expect(toolCount).toBeGreaterThan(0);
      });

      // Agents without tools should have 0 tools
      results.withoutTools.forEach(({ _id, toolCount }) => {
        expect(toolCount).toBe(0);
      });
    });

    test('safe tool access pattern works for all agents', async () => {
      const allAgents = [...agentsWithTools, ...agentsWithoutTools];

      for (const agentId of allAgents) {
        const config = await loadAgentYaml(agentId);

        // Safe access pattern
        const tools = config?.dependencies?.tools ?? [];

        expect(Array.isArray(tools)).toBe(true);
        expect(() => {
          tools.forEach(tool => {
            expect(typeof tool).toBe('string');
          });
        }).not.toThrow();
      }
    });
  });

  describeIntegration('Comprehensive Backward Compatibility Report', () => {
    test('comprehensive agent compatibility check', async () => {
      const report = {
        agents_with_tools: [],
        agents_without_tools: [],
        errors: [],
        structure_issues: [],
      };

      const allAgents = [...agentsWithTools, ...agentsWithoutTools];

      for (const agentId of allAgents) {
        try {
          const config = await loadAgentYaml(agentId);
          const tools = getAgentTools(config);

          const agentInfo = {
            id: agentId,
            name: config.agent.name,
            has_tools_field: !!tools,
            tool_count: tools?.length || 0,
            has_dependencies: !!config.dependencies,
            has_commands: !!config.commands,
          };

          if (tools) {
            report.agents_with_tools.push(agentInfo);
          } else {
            report.agents_without_tools.push(agentInfo);
          }

          // Check structure
          if (!config.agent || !config.agent.id) {
            report.structure_issues.push({
              agent: agentId,
              issue: 'Missing agent.id',
            });
          }

        } catch (error) {
          report.errors.push({
            agent: agentId,
            error: error.message,
          });
        }
      }

      // Verify results
      expect(report.errors).toHaveLength(0);
      expect(report.structure_issues).toHaveLength(0);
      expect(report.agents_with_tools.length).toBe(agentsWithTools.length);
      expect(report.agents_without_tools.length).toBe(agentsWithoutTools.length);

      // All agents without tools should have 0 tool count
      report.agents_without_tools.forEach(agent => {
        expect(agent.tool_count).toBe(0);
        expect(agent.has_dependencies).toBe(true);
      });

      // Log summary
      console.log('\n✅ Agent Backward Compatibility Report:');
      console.log(`  Agents with tools: ${report.agents_with_tools.length}`);
      console.log(`  Agents without tools: ${report.agents_without_tools.length}`);
      console.log(`  Errors: ${report.errors.length}`);
      console.log(`  Structure issues: ${report.structure_issues.length}`);
      console.log(`  Status: ${report.errors.length === 0 ? 'PASS ✅' : 'FAIL ❌'}`);
    });
  });
});
