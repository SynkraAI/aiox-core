# Contribuindo para o Navigator Squad

Obrigado pelo seu interesse em contribuir para o Navigator! Este guia vai te ajudar a começar.

---

## Indice

- [Codigo de Conduta](#codigo-de-conduta)
- [Primeiros Passos](#primeiros-passos)
- [Setup de Desenvolvimento](#setup-de-desenvolvimento)
- [Como Contribuir](#como-contribuir)
- [Padroes de Codigo](#padroes-de-codigo)
- [Testes](#testes)
- [Documentacao](#documentacao)
- [Processo de Pull Request](#processo-de-pull-request)
- [Comunidade](#comunidade)

---

## Codigo de Conduta

Ao participar deste projeto, você concorda em seguir o Código de Conduta do AIOS:

- Seja respeitoso e inclusivo
- Forneça feedback construtivo
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

Reporte comportamento inaceitável aos mantenedores do projeto.

---

## Primeiros Passos

### Pre-requisitos

- Node.js >= 18.0.0
- Git
- AIOS Core >= 4.0.0
- Familiaridade com arquitetura de agentes AIOS

### Quick Start

1. **Faça fork do repositório**
   ```bash
   # Visite https://github.com/SynkraAI/aios-core
   # Clique em "Fork"
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/SEU_USUARIO/aios-core.git
   cd aios-core/squads/navigator
   ```

3. **Instale as dependências**
   ```bash
   npm install
   ```

4. **Execute o health check**
   ```bash
   @navigator
   *navigator-doctor
   ```

5. **Execute os testes**
   ```bash
   npm test -- tests/unit/navigator/
   ```

---

## Setup de Desenvolvimento

### Variaveis de Ambiente

Crie `.env` para desenvolvimento local:
```bash
NAVIGATOR_AUTO_MODE=false  # Confirmações manuais durante dev
NODE_ENV=development
```

### Git Hooks

Instale os hooks de desenvolvimento:
```bash
npm run prepare
node squads/navigator/scripts/install-hooks.js install
```

### Setup de IDE

**Extensões VS Code (recomendadas):**
- ESLint
- Prettier
- YAML
- Markdown All in One
- Mermaid Preview

**Configurações:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Como Contribuir

### Tipos de Contribuicoes

1. **Reportar Bugs** - Encontrou um bug? Abra uma issue
2. **Sugestões de Features** - Tem uma ideia? Proponha
3. **Contribuições de Código** - Corrija bugs ou adicione features
4. **Documentação** - Melhore ou traduza a documentação
5. **Exemplos** - Compartilhe seus workflows Navigator
6. **Testes** - Escreva testes para código não coberto

### Areas que Precisam de Ajuda

Verifique issues marcadas como:
- `good-first-issue` - Ótimas para iniciantes
- `help-wanted` - Contribuições da comunidade são bem-vindas
- `documentation` - Melhorias na documentação necessárias
- `testing` - Cobertura de testes necessária

---

## Padroes de Codigo

### JavaScript/Node.js

- **Estilo:** Siga a config do ESLint (`.eslintrc.js`)
- **Nomenclatura:** camelCase para variáveis, PascalCase para classes
- **Async:** Use async/await, não callbacks
- **Erros:** Sempre trate erros explicitamente

**Exemplo:**
```javascript
async function detectPhase(roadmapPath) {
  try {
    const roadmap = await loadRoadmap(roadmapPath);
    const currentPhase = analyzeOutputs(roadmap);
    return currentPhase;
  } catch (error) {
    logger.error('Phase detection failed', { error });
    throw new Error(`Failed to detect phase: ${error.message}`);
  }
}
```

### Markdown

- Use headers ATX (`#`, `##`, `###`)
- Quebre linhas em 100 caracteres
- Use blocos de código com tags de linguagem
- Inclua índice para documentos longos

### YAML

- Use indentação de 2 espaços
- Use aspas em strings com caracteres especiais
- Valide com yamllint

### Mensagens de Commit

Siga [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <assunto>

<corpo>

<rodapé>
```

**Tipos:**
- `feat` - Nova feature
- `fix` - Correção de bug
- `docs` - Mudanças na documentação
- `test` - Adição/mudanças em testes
- `refactor` - Refatoração de código
- `chore` - Mudanças em build/ferramentas

**Exemplos:**
```bash
feat(phase-detector): add story status parsing

- Parse YAML front-matter from story files
- Calculate completion percentage
- Handle missing/malformed YAML gracefully

Closes #42
```

```bash
fix(checkpoint): prevent duplicate checkpoints

Skip checkpoint creation if ID already exists.
Add warning log when skipping.

Fixes #58
```

---

## Testes

### Executando Testes

```bash
# Todos os testes do Navigator
npm test -- tests/unit/navigator/

# Arquivo de teste específico
npm test -- tests/unit/navigator/doctor.test.js

# Watch mode
npm test -- --watch tests/unit/navigator/

# Cobertura
npm run test:coverage
```

### Escrevendo Testes

**Localização:** `tests/unit/navigator/`

**Estrutura:**
```javascript
describe('Component Name', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Metas de Cobertura de Testes

- **Geral:** 80%+
- **Funções core:** 90%+
- **Casos extremos:** Cobertos

### Checklist de Testes

- [ ] Testes unitários passam localmente
- [ ] Código novo tem testes
- [ ] Testes seguem convenção de nomenclatura
- [ ] Casos extremos cobertos
- [ ] Sem skip/only nos commits

---

## Documentacao

### Tipos de Documentacao

1. **Comentários de Código** - Explicações inline
2. **README.md** - Visão geral e uso
3. **Exemplos** - Tutoriais práticos
4. **Documentação de API** - Assinaturas de funções
5. **Guias** - Tutoriais passo a passo

### Padroes de Documentacao

**Comentários Inline:**
```javascript
// Bom: Explique o PORQUÊ, não o QUE
// Use glob pattern instead of exact match for flexibility
const stories = glob.sync('docs/stories/story-*.md');

// Ruim: Comentário redundante
// Get all story files
const stories = glob.sync('docs/stories/story-*.md');
```

**Documentação de Funções:**
```javascript
/**
 * Detect current project phase based on output files
 *
 * @param {string} roadmapPath - Path to roadmap.md file
 * @returns {Promise<PhaseResult>} Phase ID, name, and completion %
 * @throws {Error} If roadmap file not found or invalid
 *
 * @example
 * const phase = await detectPhase('.aios/navigator/my-project/roadmap.md');
 * console.log(`Current phase: ${phase.name} (${phase.completion}%)`);
 */
async function detectPhase(roadmapPath) {
  // ...
}
```

### Adicionando Exemplos

Exemplos vão em `squads/navigator/examples/`:

1. Crie `example-N-seu-cenario.md`
2. Siga esta estrutura:
   - Contexto (descrição do cenário)
   - Passos (passo a passo detalhado)
   - Resultados (o que foi alcançado)
   - Principais Aprendizados (lições aprendidas)
3. Adicione ao índice em `examples/README.md`
4. Inclua detalhes de projeto realistas
5. Teste o exemplo você mesmo primeiro

---

## Processo de Pull Request

### Antes de Submeter

- [ ] Código segue o guia de estilo
- [ ] Testes passam localmente
- [ ] Novos testes adicionados para código novo
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] Mensagens de commit seguem convenção
- [ ] Descrição do PR está clara

### Template de PR

```markdown
## Descricao
Breve descrição das mudanças

## Motivacao
Por que esta mudança é necessária?

## Mudancas Realizadas
- Mudança 1
- Mudança 2

## Testes
Como isso foi testado?

## Screenshots (se aplicável)
Anexe screenshots

## Checklist
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] CHANGELOG atualizado
```

### Processo de Review

1. **Checks automatizados** executam primeiro (ESLint, testes)
2. **Review de mantenedor** (1-2 dias úteis)
3. **Revisões** se solicitado
4. **Aprovação** e merge

### Apos o Merge

- Sua contribuição estará na próxima release
- Você será adicionado ao CONTRIBUTORS.md
- Obrigado! 🎉

---

## Comunidade

### Canais de Comunicacao

- **GitHub Issues** - Reportar bugs, solicitar features
- **GitHub Discussions** - Perguntas, ideias
- **AIOS Discord** - Chat em tempo real (em breve)

### Obtendo Ajuda

**Travou?** Pergunte em:
1. GitHub Discussions (Q&A)
2. Comentários de issues
3. Canal #navigator no Discord

**Tempo de resposta:** Geralmente dentro de 48 horas

### Reconhecimento

Contribuidores são reconhecidos em:
- CONTRIBUTORS.md
- Notas de release
- CHANGELOG.md

---

## Workflow de Desenvolvimento

### Fluxo Tipico

1. **Escolha uma issue** no GitHub
2. **Comente** "Gostaria de trabalhar nisso"
3. **Crie branch** `git checkout -b feat/sua-feature`
4. **Faça mudanças** e commits
5. **Push do branch** `git push origin feat/sua-feature`
6. **Abra PR** no GitHub
7. **Responda reviews**
8. **Comemore** quando for merged! 🎉

### Nomenclatura de Branches

- `feat/nome-feature` - Novas features
- `fix/nome-bug` - Correções de bug
- `docs/nome-doc` - Documentação
- `test/nome-teste` - Adição de testes
- `refactor/nome-refactor` - Refatoração

---

## Topicos Avancados

### Adicionando uma Nova Task

1. Crie `tasks/nav-sua-task.md`
2. Siga o formato de tasks existentes
3. Adicione ao manifest `squad.yaml`
4. Adicione à lista de comandos do agente
5. Escreva testes para a lógica da task
6. Adicione exemplo de uso
7. Atualize o README.md

### Adicionando um Novo Script

1. Crie `scripts/navigator/seu-script.js`
2. Adicione shebang e descrição
3. Exporte função principal
4. Trate erros graciosamente
5. Escreva testes unitários
6. Atualize documentação

### Modificando o Pipeline

1. Edite `data/navigator-pipeline-map.yaml`
2. Valide sintaxe YAML
3. Atualize phase-detector.js se necessário
4. Teste com projeto real
5. Documente mudanças no CHANGELOG

---

## Processo de Release

(Para mantenedores)

1. Atualize versão em `squad.yaml`
2. Atualize CHANGELOG.md
3. Crie git tag: `v1.0.0`
4. Push da tag: `git push origin v1.0.0`
5. Crie release no GitHub
6. Publique no repositório aios-squads

---

## Duvidas?

- **Questões técnicas:** GitHub Discussions
- **Problemas de segurança:** Email para mantenedores (privado)
- **Consultas gerais:** Abra uma issue

---

**Obrigado por contribuir para o Navigator!** 🧭

Suas contribuições tornam o AIOS melhor para todos.

---

*Guia de Contribuicao v1.0 - Ultima atualizacao 2026-02-20*
