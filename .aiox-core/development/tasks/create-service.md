# Create Service

## Purpose

Create a new service using standardized Handlebars templates from WIS-10. Generates consistent TypeScript service structures with proper configuration, testing, and documentation.

## Task Definition (AIOX Task Format V1.0)

```yaml
task: createService()
agent: "@dev"
responsável: Dex (Developer)
responsavel_type: Agente
atomic_layer: Config

elicit: true

inputs:
  - name: service_name
    type: string
    required: true
    pattern: "^[a-z][a-z0-9-]*$"
    validation: Must be kebab-case, start with letter

  - name: service_type
    type: enum
    options: ["api-integration", "utility", "agent-tool"]
    required: true
    default: "utility"

  - name: has_auth
    type: boolean
    required: false
    default: false

  - name: description
    type: string
    required: true
    validation: Non-empty, max 200 characters

  - name: env_vars
    type: array
    required: false
    default: []

outputs:
  - name: service_directory
    type: directory
    location: ".aiox-core/infrastructure/services/{service_name}/"
    persistido: true

  - name: files_created
    type: array
    destino: Memory
    persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] WIS-10 templates exist at .aiox-core/development/templates/service-template/
    tipo: pre-condition
    blocker: true
    validação: Check template directory exists with required .hbs files
    error_message: "Templates not found. Run WIS-10 first."

  - [ ] Service name is unique (no existing service with same name)
    tipo: pre-condition
    blocker: true
    validação: Check .aiox-core/infrastructure/services/{name}/ does not exist
    error_message: "Service '{name}' already exists. Choose a different name."

  - [ ] Service name follows kebab-case pattern
    tipo: pre-condition
    blocker: true
    validação: Regex match ^[a-z][a-z0-9-]*$
    error_message: "Invalid name. Use kebab-case (e.g., my-api-service)"
```

---

## Interactive Elicitation Process

### Step 1: Service Name
```
ELICIT: Service Name

What is the service name?
(Use kebab-case, e.g., "github-api", "file-processor", "auth-helper")

→ Validation: ^[a-z][a-z0-9-]*$
→ Check: Unique (not existing)
→ On invalid: Re-prompt with error message
```

### Step 2: Service Type
```
ELICIT: Service Type

What type of service is this?

1. api-integration - External API client with rate limiting and auth
2. utility - Internal helper/utility service
3. agent-tool - Tool for AIOX agents

→ Default: utility
→ If api-integration: Enable client.ts generation
```

### Step 3: Authentication
```
ELICIT: Authentication Required

Does this service require authentication?

1. Yes - Include auth configuration and secure headers
2. No - No authentication needed

→ Default: No
→ If Yes: Add auth placeholders to config
```

### Step 4: Description
```
ELICIT: Service Description

Brief description of the service:
(Max 200 characters, will appear in README and JSDoc)

→ Validation: Non-empty, <= 200 chars
```

### Step 5: Environment Variables
```
ELICIT: Environment Variables

What environment variables does this service need?
(Enter comma-separated list, or 'none')

Examples: API_KEY, BASE_URL, TIMEOUT_MS

→ Default: none
→ Parse: Split by comma, trim whitespace
→ Generate: .env.example entries
```

---

## Implementation Steps

### Step 0: Code Intelligence Duplicate Check (Pre-Scaffold)

Before scaffolding the service, check if a similar service already exists using code intelligence:

```javascript
// Code Intelligence pre-scaffold check (graceful — never blocks)
const { isCodeIntelAvailable } = require('.aiox-core/core/code-intel');
const { checkBeforeWriting } = require('.aiox-core/core/code-intel/helpers/dev-helper');

if (isCodeIntelAvailable()) {
  const result = await checkBeforeWriting(serviceName, description);
  if (result) {
    // Display as advisory — does NOT block scaffold
    console.log('⚠️  Code Intelligence Suggestion:');
    console.log(`   ${result.suggestion}`);
    console.log('   Consider REUSE or ADAPT before creating a new service.');
    // In interactive mode: prompt user to confirm proceeding
    // In YOLO mode: log and continue
  }
}
// If code intelligence not available: proceed normally (no impact)
```

### Step 1: Validate Inputs
```javascript
// Validate service_name
const namePattern = /^[a-z][a-z0-9-]*$/;
if (!namePattern.test(serviceName)) {
  throw new Error(`Invalid service name: ${serviceName}. Use kebab-case.`);
}

// Check uniqueness
const targetDir = `.aiox-core/infrastructure/services/${serviceName}/`;
if (fs.existsSync(targetDir)) {
  throw new Error(`Service '${serviceName}' already exists.`);
}
```

### Step 2: Load Templates
```javascript
const templateDir = '.aiox-core/development/templates/service-template/';
const templates = [
  'README.md.hbs',
  'index.ts.hbs',
  'types.ts.hbs',
  'errors.ts.hbs',
  'package.json.hbs',
  'tsconfig.json',      // Static (no .hbs)
  'jest.config.js',     // Static (no .hbs)
  '__tests__/index.test.ts.hbs'
];

// Conditional: client.ts.hbs only for api-integration
if (serviceType === 'api-integration') {
  templates.push('client.ts.hbs');
}
```

### Step 3: Prepare Template Context
```javascript
const context = {
  serviceName: serviceName,                    // kebab-case
  pascalCase: toPascalCase(serviceName),       // PascalCase
  camelCase: toCamelCase(serviceName),         // camelCase
  description: description,
  isApiIntegration: serviceType === 'api-integration',
  hasAuth: hasAuth,
  envVars: envVars.map(v => ({
    name: v,
    description: `${v} environment variable`
  })),
  storyId: 'WIS-11',
  createdAt: new Date().toISOString().split('T')[0]
};
```

### Step 4: Generate Files
```javascript
// Create target directory
fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(`${targetDir}__tests__/`, { recursive: true });

// Process each template
for (const templateFile of templates) {
  const templatePath = `${templateDir}${templateFile}`;
  const isHandlebars = templateFile.endsWith('.hbs');

  // Determine output filename
  const outputFile = isHandlebars
    ? templateFile.replace('.hbs', '')
    : templateFile;
  const outputPath = `${targetDir}${outputFile}`;

  if (isHandlebars) {
    // Render Handlebars template
    const template = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(template);
    const content = compiled(context);
    fs.writeFileSync(outputPath, content);
  } else {
    // Copy static file
    fs.copyFileSync(templatePath, outputPath);
  }
}
```

### Step 5: Post-Generation
```bash
# Navigate to service directory
cd .aiox-core/infrastructure/services/{service_name}/

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test
```

---

## Handlebars Helpers Required

The following helpers must be available:

```javascript
Handlebars.registerHelper('pascalCase', (str) => {
  return str.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
});

Handlebars.registerHelper('camelCase', (str) => {
  const pascal = str.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
});

Handlebars.registerHelper('kebabCase', (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
});

Handlebars.registerHelper('upperCase', (str) => {
  return str.toUpperCase().replace(/-/g, '_');
});
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] All template files generated successfully
    tipo: post-condition
    blocker: true
    validação: Verify all expected files exist in target directory

  - [ ] TypeScript compiles without errors
    tipo: post-condition
    blocker: false
    validação: Run npm run build, check exit code

  - [ ] Tests pass
    tipo: post-condition
    blocker: false
    validação: Run npm test, check exit code
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Service name exists | Directory already present | Prompt for different name |
| Template not found | WIS-10 not installed | Error: "Run WIS-10 first" |
| npm install fails | Network/package issues | Warning, continue without deps |
| Build fails | TypeScript errors | Warning, show errors, continue |
| Invalid name format | Name not kebab-case | Re-prompt with validation error |

**Error Recovery Strategy:**
```javascript
// Atomic generation - rollback on failure
try {
  generateAllFiles(targetDir, templates, context);
} catch (error) {
  // Clean up partial files
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  throw error;
}
```

---

## Performance

```yaml
duration_expected: 5-30s (excluding npm install)
cost_estimated: $0.002-0.005
token_usage: ~1,000-2,000 tokens
```

---

## Success Output

```
============================================
 SERVICE CREATED SUCCESSFULLY
============================================

 Service: {service_name}
 Type: {service_type}
 Location: .aiox-core/infrastructure/services/{service_name}/

 Files Created:
   README.md
   index.ts
   types.ts
   errors.ts
   client.ts (if api-integration)
   package.json
   tsconfig.json
   jest.config.js
   __tests__/index.test.ts

 Next Steps:
   1. cd .aiox-core/infrastructure/services/{service_name}
   2. Review generated code
   3. Implement service methods in index.ts
   4. Add tests in __tests__/
   5. Update environment variables as needed

============================================
```

---

## Metadata

```yaml
story: WIS-11
version: 1.0.0
created: 2025-12-24
author: "@dev (Dex)"
dependencies:
  templates:
    - service-template/ (from WIS-10)
  tasks: []
tags:
  - service-generation
  - scaffolding
  - handlebars
  - typescript
```
