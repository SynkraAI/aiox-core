# Como Contribuir com Pull Requests

> 🌐 **EN** | [PT](./pt/how-to-contribute-with-pull-requests.md) | [ES](./es/how-to-contribute-with-pull-requests.md)

---

**Novo no GitHub e em pull requests?** Este guia irá orientá-lo através dos conceitos básicos passo a passo.

## O Que é um Pull Request?

Um pull request (PR) é como você propõe mudanças para um projeto no GitHub. Pense nisso como dizer "Aqui estão algumas mudanças que eu gostaria de fazer - por favor, revise e considere adicioná-las ao projeto principal."

## Antes de Começar

⚠️ **Importante**: Por favor, mantenha suas contribuições pequenas e focadas! Preferimos muitas mudanças pequenas e claras ao invés de uma única mudança massiva.

**Obrigatório antes de submeter PRs:**

- **Para correções de bugs**: Crie uma issue usando o [template de bug report](https://github.com/SynkraAIinc/aiox-core/issues/new?template=bug_report.md)
- **Para novas features**:
  1. Discuta no Discord no [canal #general-dev](https://discord.gg/gk8jAdXWmj)
  2. Crie uma issue usando o [template de feature request](https://github.com/SynkraAIinc/aiox-core/issues/new?template=feature_request.md)
- **Para mudanças grandes**: Sempre abra uma issue primeiro para discutir o alinhamento

## Guia Passo a Passo

### 1. Fazer Fork do Repositório

1. Vá para o [repositório Synkra AIOX](https://github.com/SynkraAIinc/aiox-core)
2. Clique no botão "Fork" no canto superior direito
3. Isso cria sua própria cópia do projeto

### 2. Clonar Seu Fork

```bash
# Substitua SEU-USUARIO pelo seu nome de usuário real do GitHub
git clone https://github.com/SEU-USUARIO/aiox-core.git
cd aiox-core
```

### 3. Criar uma Nova Branch

**Nunca trabalhe diretamente na branch `main`!** Sempre crie uma nova branch para suas mudanças:

```bash
# Criar e mudar para uma nova branch
git checkout -b fix/typo-in-readme
# ou
git checkout -b feature/add-new-agent
```

**Dicas de nomenclatura de branches:**

- `fix/descricao` - para correções de bugs
- `feature/descricao` - para novas funcionalidades
- `docs/descricao` - para mudanças na documentação

### 4. Fazer Suas Mudanças

- Edite os arquivos que você deseja alterar
- Mantenha as mudanças pequenas e focadas em uma coisa
- Teste suas mudanças se possível

### 5. Fazer Commit das Suas Mudanças

```bash
# Adicionar suas mudanças
git add .

# Commit com uma mensagem clara
git commit -m "Corrigir erro de digitação no README.md"
```

**Boas mensagens de commit:**

- "Corrigir erro de digitação nas instruções de instalação"
- "Adicionar exemplo de uso de novo agente"
- "Atualizar link quebrado na documentação"

**Más mensagens de commit:**

- "coisas"
- "mudanças"
- "atualizar"

### 6. Fazer Push para Seu Fork

```bash
# Fazer push da sua branch para seu fork
git push origin fix/typo-in-readme
```

### 7. Criar o Pull Request

1. Vá para seu fork no GitHub
2. Você verá um botão verde "Compare & pull request" - clique nele
3. Selecione a branch de destino correta:
   - **Branch `next`** para a maioria das contribuições (features, docs, melhorias)
   - **Branch `main`** apenas para correções críticas
4. Preencha a descrição do PR usando o template em CONTRIBUTING.md:
   - **O Quê**: 1-2 frases descrevendo o que mudou
   - **Por Quê**: 1-2 frases explicando o motivo
   - **Como**: 2-3 bullets sobre a implementação
   - **Testes**: Como você testou
5. Referencie o número da issue relacionada (ex: "Fixes #123")

### 8. Aguardar Revisão

- Um mantenedor irá revisar seu PR
- Eles podem pedir mudanças
- Seja paciente e responsivo ao feedback

## O Que Torna um Pull Request Bom?

✅ **PRs Bons:**

- Mudam uma coisa por vez
- Têm títulos claros e descritivos
- Explicam o quê e por quê na descrição
- Incluem apenas os arquivos que precisam mudar

❌ **Evite:**

- Mudar a formatação de arquivos inteiros
- Múltiplas mudanças não relacionadas em um PR
- Copiar seu projeto/repositório inteiro no PR
- Mudanças sem explicação

## Erros Comuns a Evitar

1. **Não reformate arquivos inteiros** - mude apenas o que é necessário
2. **Não inclua mudanças não relacionadas** - foque em uma correção/feature por PR
3. **Não cole código em issues** - crie um PR apropriado ao invés disso
4. **Não submeta seu projeto inteiro** - contribua com melhorias específicas

## Precisa de Ajuda?

- 🐛 Reporte bugs usando o [template de bug report](https://github.com/SynkraAIinc/aiox-core/issues/new?template=bug_report.md)
- 💡 Sugira features usando o [template de feature request](https://github.com/SynkraAIinc/aiox-core/issues/new?template=feature_request.md)
- 📖 Leia as [Diretrizes de Contribuição](../CONTRIBUTING.md) completas

## Exemplo: PRs Bons vs Ruins

### 😀 Exemplo de PR Bom

**Título**: "Corrigir link quebrado para guia de instalação"
**Mudanças**: Um arquivo, uma linha alterada
**Descrição**: "O link no README.md estava apontando para o arquivo errado. Atualizado para apontar para o guia de instalação correto."

### 😞 Exemplo de PR Ruim

**Título**: "Atualizações"
**Mudanças**: 50 arquivos, codebase inteira reformatada
**Descrição**: "Fiz algumas melhorias"

---

**Lembre-se**: Estamos aqui para ajudar! Não tenha medo de fazer perguntas. Todo especialista já foi iniciante um dia.
