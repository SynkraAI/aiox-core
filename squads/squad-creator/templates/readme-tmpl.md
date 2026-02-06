template:
  id: squad-readme-template-v1
  name: Squad README
  version: 1.0
  output:
    format: markdown
    filename: README.md
    title: "{{pack_name}} README"

workflow:
  mode: interactive
  elicitation: advanced-elicitation
  custom_elicitation:
    title: "README Documentation Elicitation"
    sections:
      - id: documentation-depth
        options:
          - "Minimal README - Basic overview and usage only"
          - "Standard README - Full documentation with examples"
          - "Comprehensive README - Complete guide with integration details"

sections:
  - id: initial-setup
    instruction: |
      Initial Setup for README Generation

      Gather information about the squad:
      - Pack name and purpose
      - Target users and use cases
      - Main features and capabilities
      - Example workflows
      - Installation requirements

      Output file location: `squads/{{pack_name}}/README.md`

  - id: header
    title: Header Section
    instruction: Generate pack title and brief description
    template: |
      # {{pack_title}}

      ## Overview

      {{pack_overview}}

  - id: purpose
    title: Purpose Section
    instruction: Explain why this squad exists and what problems it solves
    template: |
      ## Purpose

      This squad {{pack_purpose}}

      {{purpose_details}}

  - id: when-to-use
    title: When to Use
    instruction: List specific scenarios when users should activate this pack
    template: |
      ## When to Use This Pack

      Use {{pack_name}} when you want to:

      {{use_cases}}

  - id: whats-included
    title: What's Included
    instruction: |
      List all components included in the pack:
      - Agents (with brief description)
      - Tasks (with brief description)
      - Templates (with brief description)
      - Checklists (with brief description)
      - Data/Knowledge bases (with brief description)
    template: |
      ## What's Included

      ### Agents

      {{agent_list}}

      ### Tasks

      {{task_list}}

      ### Templates

      {{template_list}}

      ### Checklists

      {{checklist_list}}

      ### Data

      {{data_list}}

  - id: installation
    title: Installation Instructions
    template: |
      ## Installation

      To install this squad, run:

      ```bash
      npm run install:squad {{pack_name}}
      ```

      Or manually:

      ```bash
      node tools/install-squad.js {{pack_name}}
      ```

  - id: usage-examples
    title: Usage Examples
    instruction: |
      Create 2-3 concrete usage examples showing:
      - How to activate agents
      - How to use commands
      - Expected workflows
      - Sample outputs
    elicit: true
    template: |
      ## Usage Examples

      {{usage_examples}}

  - id: pack-structure
    title: Pack Structure
    instruction: Show the directory structure of the pack
    template: |
      ## Pack Structure

      ```
      squads/{{pack_name}}/
      ├── agents/                          # Domain-specific agents
      {{agents_structure}}
      ├── checklists/                      # Validation checklists
      {{checklists_structure}}
      ├── config.yaml                      # Pack configuration
      ├── data/                           # Knowledge bases
      {{data_structure}}
      ├── README.md                       # Pack documentation
      ├── tasks/                          # Workflow tasks
      {{tasks_structure}}
      └── templates/                      # Output templates
      {{templates_structure}}
      ```

  - id: key-features
    title: Key Features
    instruction: Highlight 3-5 distinguishing features of this pack
    template: |
      ## Key Features

      {{key_features}}

  - id: integration
    title: Integration with Core AIOS
    instruction: Explain how this pack integrates with AIOS framework
    template: |
      ## Integration with Core AIOS

      {{pack_name}} integrates seamlessly with:

      {{integration_details}}

  - id: getting-started
    title: Getting Started Guide
    instruction: Provide step-by-step guide for first-time users
    template: |
      ## Getting Started

      {{getting_started_steps}}

  - id: best-practices
    title: Best Practices
    condition: Standard or Comprehensive README
    template: |
      ## Best Practices

      {{best_practices}}

  - id: customization
    title: Customization
    condition: Standard or Comprehensive README
    template: |
      ## Customization

      You can customize this squad by:

      {{customization_options}}

  - id: dependencies
    title: Dependencies
    template: |
      ## Dependencies

      This squad requires:

      - Core AIOS-FULLSTACK framework
      {{additional_dependencies}}

  - id: support
    title: Support & Community
    condition: Comprehensive README
    template: |
      ## Support & Community

      - **Documentation**: See `docs/squads.md` for detailed guides
      - **Examples**: Browse `squads/` for reference implementations
      - **Issues**: Report problems via GitHub issues
      - **Contributions**: Submit PRs with improvements

  - id: version-history
    title: Version History
    template: |
      ## Version History

      - **v{{version}}** - {{version_description}}

  - id: footer
    title: Footer
    template: |
      ---

      **Ready to {{pack_tagline}}? Let's get started! 🚀**

      _Version: {{version}}_
      _Compatible with: AIOS-FULLSTACK v4+_
