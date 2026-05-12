<!--
  Tradução: PT-BR
  Original: /docs/en/guides/template-engine-v2.md
  Última sincronização: 2026-01-26
-->

# Template Engine v2.0

> 🌐 [EN](../../guides/template-engine-v2.md) | **PT** | [ES](../../es/guides/template-engine-v2.md)

---

> Motor de geração de documentos e substituição de variáveis para Synkra AIOX.

**Versão:** 2.0
**Última Atualização:** 2025-12-05

---

## Visão Geral

O Template Engine fornece uma forma consistente de gerar documentos (PRDs, ADRs, Stories, etc.) com substituição de variáveis, condicionais e loops. Ele alimenta todas as tarefas de geração de documentos no AIOX.

### Funcionalidades Principais

| Funcionalidade     | Sintaxe                                 | Descrição                                  |
| ------------------ | --------------------------------------- | ------------------------------------------ |
| Variáveis          | `{{VAR_NAME}}`                          | Substituição simples de variáveis          |
| Condicionais       | `{{#IF_CONDITION}}...{{/IF_CONDITION}}` | Blocos condicionais                        |
| Loops              | `{{#EACH_ITEMS}}...{{/EACH_ITEMS}}`     | Iteração sobre arrays                      |
| Caminhos Aninhados | `{{user.name}}`                         | Acesso a propriedades de objetos aninhados |
| Escape             | `\{{literal}}`                          | Prevenir processamento do template         |

---

## Início Rápido

### Uso Básico

```javascript
const TemplateEngine = require('./.aiox-core/infrastructure/scripts/template-engine');

const engine = new TemplateEngine();

const template = `
# {{TITLE}}

Created by: {{AUTHOR}}
Date: {{DATE}}

## Summary
{{SUMMARY}}
`;

const variables = {
  TITLE: 'My Document',
  AUTHOR: 'Dex (@dev)',
  DATE: '2025-12-05',
  SUMMARY: 'This is a generated document.',
};

const output = engine.process(template, variables);
console.log(output);
```

### Saída

```markdown
# My Document

Created by: Dex (@dev)
Date: 2025-12-05

## Summary

This is a generated document.
```

---

## Referência da API

### Classe TemplateEngine

```javascript
const TemplateEngine = require('./.aiox-core/infrastructure/scripts/template-engine');
const engine = new TemplateEngine();
```

### Métodos

#### `process(template, variables)`

Processa uma string de template com as variáveis fornecidas.

**Parâmetros:**

- `template` (string) - String de template com placeholders
- `variables` (Object) - Pares chave-valor para substituição

**Retorna:** `string` - Template processado

```javascript
const result = engine.process('Hello, {{NAME}}!', { NAME: 'World' });
// Retorna: "Hello, World!"
```

#### `loadAndProcess(templatePath, variables)`

Carrega um arquivo de template e o processa.

**Parâmetros:**

- `templatePath` (string) - Caminho para o arquivo de template
- `variables` (Object) - Variáveis a substituir

**Retorna:** `Promise<string>` - Template processado

```javascript
const result = await engine.loadAndProcess('.aiox-core/product/templates/story-tmpl.md', {
  STORY_ID: '3.12',
  TITLE: 'Documentation',
});
```

#### `validateTemplate(template, requiredVars)`

Valida se um template possui todos os placeholders obrigatórios.

**Parâmetros:**

- `template` (string) - Template a validar
- `requiredVars` (string[]) - Lista de nomes de variáveis obrigatórias

**Retorna:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`

```javascript
const validation = engine.validateTemplate(template, ['TITLE', 'DATE']);
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}
```

#### `getTemplateVariables(template)`

Extrai todas as variáveis usadas em um template.

**Parâmetros:**

- `template` (string) - Template a analisar

**Retorna:** `Object` - `{ simple: string[], conditionals: string[], loops: string[] }`

```javascript
const vars = engine.getTemplateVariables(template);
console.log('Variables needed:', vars.simple);
console.log('Conditionals:', vars.conditionals);
console.log('Loop variables:', vars.loops);
```

#### `escapeInput(input)`

Escapa caracteres especiais em entrada do usuário para prevenir injeção.

**Parâmetros:**

- `input` (string) - Entrada do usuário a escapar

**Retorna:** `string` - Entrada escapada

```javascript
const safeInput = engine.escapeInput(userProvidedValue);
```

---

## Sintaxe de Templates

### Variáveis Simples

```markdown
# {{TITLE}}

Author: {{AUTHOR}}
Version: {{VERSION}}
```

### Variáveis Aninhadas

Acesse propriedades de objetos aninhados com notação de ponto:

```markdown
Project: {{project.name}}
Owner: {{project.owner.name}}
Email: {{project.owner.email}}
```

```javascript
const variables = {
  project: {
    name: 'AIOX',
    owner: {
      name: 'Pedro',
      email: 'pedro@example.com',
    },
  },
};
```

### Condicionais

Inclua conteúdo apenas se uma variável for truthy:

```markdown
{{#IF_HAS_DEPENDENCIES}}

## Dependencies

This project depends on:
{{DEPENDENCIES}}
{{/IF_HAS_DEPENDENCIES}}
```

```javascript
const variables = {
  HAS_DEPENDENCIES: true,
  DEPENDENCIES: '- react\n- typescript',
};
```

### Loops

Itere sobre arrays:

```markdown
## Tasks

{{#EACH_TASKS}}

- [ ] {{ITEM.title}} ({{ITEM.priority}})
      {{/EACH_TASKS}}
```

```javascript
const variables = {
  TASKS: [
    { title: 'Write docs', priority: 'HIGH' },
    { title: 'Add tests', priority: 'MEDIUM' },
    { title: 'Review code', priority: 'LOW' },
  ],
};
```

**Variáveis de Contexto do Loop:**

- `{{ITEM}}` - Item atual
- `{{INDEX}}` - Índice atual (base 0)
- `{{FIRST}}` - Boolean, true se primeiro item
- `{{LAST}}` - Boolean, true se último item

### Escape

Previna processamento do template com barra invertida:

```markdown
To use variables, write \{{VARIABLE_NAME}}.
```

Saída: `To use variables, write {{VARIABLE_NAME}}.`

---

## Templates Suportados

### Templates de Documentos

| Template  | Localização                 | Propósito                                      |
| --------- | --------------------------- | ---------------------------------------------- |
| **PRD**   | `templates/prd-tmpl.md`     | Documento de Requisitos do Produto             |
| **ADR**   | `templates/adr-tmpl.md`     | Registro de Decisão de Arquitetura             |
| **PMDR**  | `templates/pmdr-tmpl.md`    | Registro de Decisão de Mapeamento de Processos |
| **DBDR**  | `templates/dbdr-tmpl.md`    | Registro de Design de Banco de Dados           |
| **Story** | `templates/story-tmpl.yaml` | User Story                                     |
| **Epic**  | `templates/epic-tmpl.md`    | Definição de Epic                              |
| **Task**  | `templates/task-tmpl.md`    | Definição de Task                              |

### Localização dos Templates

Todos os templates são armazenados em:

```
.aiox-core/product/templates/
```

---

## Criando Templates Personalizados

### Passo 1: Criar Arquivo de Template

```markdown
# {{COMPONENT_NAME}}

**Type:** {{COMPONENT_TYPE}}
**Created:** {{DATE}}
**Author:** {{AUTHOR}}

## Description

{{DESCRIPTION}}

{{#IF_HAS_PROPS}}

## Properties

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |

{{#EACH_PROPS}}
| {{ITEM.name}} | {{ITEM.type}} | {{ITEM.default}} | {{ITEM.description}} |
{{/EACH_PROPS}}
{{/IF_HAS_PROPS}}

{{#IF_HAS_EXAMPLES}}

## Examples

{{EXAMPLES}}
{{/IF_HAS_EXAMPLES}}
```

### Passo 2: Definir Schema do Template

Crie um arquivo de schema (opcional, mas recomendado):

```yaml
# my-template.schema.yaml
name: component-template
version: '1.0'
description: Template for component documentation

variables:
  required:
    - COMPONENT_NAME
    - COMPONENT_TYPE
    - DATE
    - AUTHOR
    - DESCRIPTION
  optional:
    - HAS_PROPS
    - PROPS
    - HAS_EXAMPLES
    - EXAMPLES

validation:
  COMPONENT_TYPE:
    enum: [React, Vue, Angular, Vanilla]
  DATE:
    format: date
```

### Passo 3: Usar na Task

```javascript
const engine = new TemplateEngine();

// Load template
const template = await fs.readFile('templates/component-tmpl.md', 'utf8');

// Validate required variables
const validation = engine.validateTemplate(template, ['COMPONENT_NAME', 'DATE']);
if (!validation.valid) {
  throw new Error(`Missing variables: ${validation.missing.join(', ')}`);
}

// Process
const output = engine.process(template, {
  COMPONENT_NAME: 'Button',
  COMPONENT_TYPE: 'React',
  DATE: new Date().toISOString().split('T')[0],
  AUTHOR: 'Dex',
  DESCRIPTION: 'A reusable button component',
  HAS_PROPS: true,
  PROPS: [
    { name: 'variant', type: 'string', default: 'primary', description: 'Button style' },
    { name: 'size', type: 'string', default: 'medium', description: 'Button size' },
  ],
  HAS_EXAMPLES: false,
});
```

---

## Boas Práticas

### 1. Use Nomes de Variáveis Significativos

```markdown
<!-- Bom -->

{{STORY_TITLE}}
{{ACCEPTANCE_CRITERIA}}
{{AUTHOR_NAME}}

<!-- Ruim -->

{{T}}
{{AC}}
{{N}}
```

### 2. Forneça Valores Padrão Sensatos

```javascript
const variables = {
  TITLE: title || 'Untitled',
  DATE: date || new Date().toISOString().split('T')[0],
  VERSION: version || '1.0',
};
```

### 3. Valide Antes de Processar

```javascript
const validation = engine.validateTemplate(template, requiredVars);
if (!validation.valid) {
  console.error('Missing:', validation.missing);
  return; // Don't process invalid templates
}
```

### 4. Escape Entrada do Usuário

```javascript
// Always escape user-provided content
const safeInput = engine.escapeInput(userInput);
const output = engine.process(template, { USER_CONTENT: safeInput });
```

### 5. Use Condicionais para Seções Opcionais

```markdown
{{#IF_HAS_NOTES}}

## Notes

{{NOTES}}
{{/IF_HAS_NOTES}}
```

---

## Solução de Problemas

### Problemas Comuns

| Problema                 | Solução                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Variável não substituída | Verifique se a ortografia corresponde exatamente (sensível a maiúsculas/minúsculas) |
| Loop produz saída vazia  | Certifique-se de que a variável é um array, não undefined                           |
| Condicional sempre falso | Verifique se a variável é truthy (não string vazia/0/null)                          |
| Injeção de template      | Use `escapeInput()` para valores fornecidos pelo usuário                            |

### Modo Debug

```javascript
// Get all variables in template
const vars = engine.getTemplateVariables(template);
console.log('Expected variables:', vars);

// Validate against your data
const validation = engine.validateTemplate(template, Object.keys(yourVariables));
console.log('Validation result:', validation);
```

---

## Documentação Relacionada

- [Guia de Quality Gates](./quality-gates.md)

---

_Synkra AIOX Template Engine v2.0_
