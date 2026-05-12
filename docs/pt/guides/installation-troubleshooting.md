<!--
  Tradução: PT-BR
  Original: /docs/en/guides/installation-troubleshooting.md
  Última sincronização: 2026-01-26
-->

# Guia de Instalação e Solução de Problemas do AIOX-Core

> 🌐 [EN](../../guides/installation-troubleshooting.md) | **PT** | [ES](../../es/guides/installation-troubleshooting.md)

---

## Início Rápido

```bash
npx aiox-core@latest
```

Este comando baixa e executa a versão mais recente do instalador do AIOX-Core.

## Requisitos do Sistema

| Requisito | Versão Mínima | Comando de Verificação |
|-----------|---------------|------------------------|
| **Node.js** | v18.0.0+ | `node --version` |
| **npm** | v9.0.0+ | `npm --version` |
| **npx** | (incluído com npm 5.2+) | `npx --version` |
| **Git** | Qualquer versão recente (opcional) | `git --version` |

### Links para Download

- **Node.js**: https://nodejs.org/ (Baixe a versão LTS - inclui npm e npx)
- **Git**: https://git-scm.com/ (Opcional, mas recomendado)

---

## Métodos de Instalação

### Método 1: npx (Recomendado)

```bash
# Install in current directory
npx aiox-core@latest

# Install with specific version
npx aiox-core@2.2.0

# Show version
npx aiox-core@latest --version

# Show help
npx aiox-core@latest --help
```

### Método 2: Do GitHub

```bash
npx github:SynkraAI/aiox-core install
```

### Método 3: Instalação Global

```bash
npm install -g aiox-core
aiox-core
```

---

## Ferramenta de Diagnóstico

Se você está tendo problemas de instalação, execute nossa ferramenta de diagnóstico:

### Windows (CMD)
```cmd
curl -o diagnose.cmd https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/quick-diagnose.cmd && diagnose.cmd
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/quick-diagnose.ps1 | iex
```

### macOS/Linux
```bash
curl -fsSL https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/diagnose-installation.js | node
```

---

## Problemas Comuns e Soluções

### Problema 1: "Node.js version too old"

**Erro:**
```
error engine Unsupported engine
error notsup Required: {"node":">=18.0.0"}
```

**Solução:**
1. Baixe o Node.js LTS de https://nodejs.org/
2. Instale e reinicie seu terminal
3. Verifique: `node --version` (deve mostrar v18+ ou v20+)

---

### Problema 2: "npm version too old"

**Erro:**
```
npm ERR! Required: {"npm":">=9.0.0"}
```

**Solução:**
```bash
# Update npm globally
npm install -g npm@latest

# Verify
npm --version
```

---

### Problema 3: "npx not found" ou "npx command not recognized"

**Causa:** Pasta bin do npm não está no PATH do sistema

**Solução (Windows):**
1. Encontre o prefixo do npm: `npm config get prefix`
2. Adicione ao PATH:
   - Pressione Win+X → Sistema → Configurações avançadas do sistema → Variáveis de Ambiente
   - Edite "Path" nas variáveis do usuário
   - Adicione: `C:\Users\SEU_USUARIO\AppData\Roaming\npm`
3. Reinicie o terminal

**Solução (macOS/Linux):**
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$PATH:$(npm config get prefix)/bin"

# Reload
source ~/.bashrc
```

---

### Problema 4: "EACCES: permission denied"

**Solução (Windows):**
Execute o terminal como Administrador

**Solução (macOS/Linux):**
```bash
# Fix npm permissions (recommended)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use nvm (best practice)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

---

### Problema 5: "ETIMEDOUT" ou "ECONNREFUSED"

**Causa:** Rede/firewall bloqueando registro do npm

**Soluções:**

1. **Verifique o registro do npm:**
   ```bash
   npm config get registry
   # Should be: https://registry.npmjs.org/
   ```

2. **Redefina o registro:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

3. **Teste a conectividade:**
   ```bash
   npm ping
   ```

4. **Atrás de proxy corporativo:**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

5. **Use mirror (China):**
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

---

### Problema 6: "PowerShell execution policy" (Windows)

**Erro:**
```
File cannot be loaded because running scripts is disabled on this system
```

**Solução:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Problema 7: "Cannot find module" ou "Missing dependencies"

**Solução:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules if exists
rm -rf node_modules

# Try again
npx aiox-core@latest
```

---

### Problema 8: "SSL/Certificate errors"

**Solução:**
```bash
# Temporarily disable strict SSL (not recommended for production)
npm config set strict-ssl false

# Better: Update certificates
npm config set cafile /path/to/certificate.pem
```

---

### Problema 9: Pacote mostra versão antiga

**Causa:** Cache do npm servindo versão antiga

**Solução:**
```bash
# Clear npx cache
npx clear-npx-cache

# Or force fresh download
npx --ignore-existing aiox-core@latest

# Or use specific version
npx aiox-core@2.2.0
```

---

## Checklist de Verificação do Ambiente

Execute estes comandos para verificar seu ambiente:

```bash
# 1. Check Node.js (need v18+)
node --version

# 2. Check npm (need v9+)
npm --version

# 3. Check npx
npx --version

# 4. Check npm registry access
npm view aiox-core version

# 5. Test installation
npx aiox-core@latest --version
```

**Saída esperada:**
```
v22.x.x (or v18+/v20+)
11.x.x (or v9+)
11.x.x (same as npm)
2.2.0
2.2.0
```

---

## Obtendo Ajuda

Se você ainda está tendo problemas:

1. **GitHub Issues**: https://github.com/SynkraAI/aiox-core/issues
2. **Execute diagnósticos**: `npx aiox-core@latest doctor`
3. **Verifique informações do sistema**: `npx aiox-core@latest info`

Ao reportar problemas, por favor inclua:
- Sistema operacional e versão
- Versão do Node.js (`node --version`)
- Versão do npm (`npm --version`)
- Mensagem de erro completa
- Saída da ferramenta de diagnóstico

---

## Referência Rápida

| Comando | Descrição |
|---------|-----------|
| `npx aiox-core@latest` | Instalar/executar assistente |
| `npx aiox-core@latest --version` | Mostrar versão |
| `npx aiox-core@latest --help` | Mostrar ajuda |
| `npx aiox-core@latest install` | Instalar no diretório atual |
| `npx aiox-core@latest init <name>` | Criar novo projeto |
| `npx aiox-core@latest doctor` | Executar diagnósticos |
| `npx aiox-core@latest info` | Mostrar informações do sistema |

---

*Última atualização: Dezembro 2025 | AIOX-Core v2.2.0*
