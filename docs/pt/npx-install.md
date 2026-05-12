<!--
  Tradução: PT-BR
  Original: /docs/en/npx-install.md
  Última sincronização: 2026-01-26
-->

# Guia de Instalação via NPX

> 🌐 [EN](../npx-install.md) | **PT** | [ES](../es/npx-install.md)

---

## Visão Geral

O Synkra AIOX pode ser instalado via NPX para uma configuração rápida sem instalação global. Este guia cobre o uso correto e a resolução de problemas para instalações baseadas em NPX.

## Início Rápido

### Uso Correto

Sempre execute `npx aiox-core install` **a partir do diretório do seu projeto**:

```bash
# Navegue primeiro para o seu projeto
cd /path/to/your/project

# Então execute o instalador
npx aiox-core install
```

### Erro Comum

**NÃO** execute o instalador a partir do seu diretório home ou locais arbitrários:

```bash
# INCORRETO - Falhará com erro de diretório temporário do NPX
cd ~
npx aiox-core install

# CORRETO - Navegue primeiro para o projeto
cd ~/my-project
npx aiox-core install
```

## Por Que Isso Importa

O NPX executa pacotes em **diretórios temporários** (ex: `/private/var/folders/.../npx-xxx/` no macOS). Quando o Synkra AIOX é executado a partir desses locais temporários, ele não consegue:

- Detectar a configuração da sua IDE corretamente
- Instalar arquivos no diretório correto do projeto
- Configurar integrações com a IDE adequadamente

## Detecção de Diretório Temporário do NPX

A partir da versão 4.31.1, o Synkra AIOX detecta automaticamente quando está sendo executado a partir de um diretório temporário do NPX e exibe uma mensagem de erro útil:

```
⚠️  Diretório Temporário do NPX Detectado

O NPX executa em um diretório temporário, o que impede
o AIOX de detectar sua IDE corretamente.

Solução:
  cd /path/to/your/project
  npx aiox-core install

Veja: https://aiox-core.dev/docs/npx-install
```

## Etapas de Instalação

### Etapa 1: Navegue para o Projeto

```bash
cd /path/to/your/project
```

O diretório do seu projeto deve conter:
- Arquivos de gerenciamento de pacotes (`package.json`, etc.)
- Diretórios de código-fonte

### Etapa 2: Execute o Instalador

```bash
npx aiox-core install
```

### Etapa 3: Siga os Prompts Interativos

O instalador solicitará que você:
1. Confirme o diretório de instalação (deve ser o diretório atual)
2. Selecione os componentes para instalar (Core + Squads)
3. Configure as integrações com a IDE
4. Configure a organização da documentação

## Notas Específicas por Plataforma

### macOS

Os diretórios temporários do NPX normalmente aparecem em:
- `/private/var/folders/[hash]/T/npx-[random]/`
- `/Users/[user]/.npm/_npx/[hash]/`

O Synkra AIOX detecta esses padrões e previne instalação incorreta.

### Linux

Padrões de diretório temporário similares:
- `/tmp/npx-[random]/`
- `~/.npm/_npx/[hash]/`

### Windows

Usuários do Windows normalmente não encontram esse problema, mas padrões de detecção similares se aplicam:
- `%TEMP%\npx-[random]\`
- `%APPDATA%\npm-cache\_npx\`

## Resolução de Problemas

### Erro: "NPX Temporary Directory Detected"

**Causa**: Você está executando o instalador a partir do seu diretório home ou outro local que não é um projeto.

**Solução**:
1. Navegue para o diretório real do seu projeto:
   ```bash
   cd /path/to/your/actual/project
   ```
2. Execute o instalador novamente:
   ```bash
   npx aiox-core install
   ```

### Diretório de Instalação Errado

Se o instalador solicitar um caminho de diretório:
- Use `.` (diretório atual) se você já está no seu projeto
- Forneça o caminho absoluto para o seu projeto: `/Users/you/projects/my-app`
- Não use `~` ou caminhos relativos que apontem para fora do seu projeto

### IDE Não Detectada

Se sua IDE não for detectada após a instalação:
1. Verifique se você executou o instalador a partir do diretório correto do projeto
3. Execute o instalador novamente e selecione sua IDE manualmente

## Alternativa: Instalação Global

Se você preferir não usar NPX, pode instalar globalmente:

```bash
npm install -g aiox-core
cd /path/to/your/project
aiox-core install
```

## Detalhes Técnicos

### Arquitetura de Defesa em Profundidade

O Synkra AIOX v4.31.1+ implementa detecção em duas camadas:

1. **Camada PRIMÁRIA** (`tools/aiox-npx-wrapper.js`):
   - Verifica `__dirname` (onde o NPX extrai o pacote)
   - Usa padrões regex para caminhos temporários do macOS
   - Saída antecipada antes de delegar ao CLI

2. **Camada SECUNDÁRIA** (`tools/installer/bin/aiox.js`):
   - Verificação de fallback usando `process.cwd()`
   - Valida no início do comando de instalação
   - Fornece redundância se o wrapper for contornado

### Padrões de Detecção

```javascript
const patterns = [
  /\/private\/var\/folders\/.*\/npx-/,  // temp do macOS
  /\/\.npm\/_npx\//                      // cache do NPX
];
```

## Suporte

Para ajuda adicional:
- GitHub Issues: https://github.com/SynkraAIinc/aiox-core/issues
- Documentação: https://aiox-core.dev/docs
- Referência da Story: 2.3 - NPX Installation Context Detection

---

**Versão**: 4.31.1+
**Última Atualização**: 2025-10-22
**Aplica-se a**: macOS (principal), Linux/Windows (detecção disponível)
