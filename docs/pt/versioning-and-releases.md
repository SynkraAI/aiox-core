<!--
  Tradução: PT-BR
  Original: /docs/en/versioning-and-releases.md
  Última sincronização: 2026-01-26
-->

# Como Lançar uma Nova Versão

> 🌐 [EN](../versioning-and-releases.md) | **PT** | [ES](../es/versioning-and-releases.md)

---

## Releases Automatizados (Recomendado)

A maneira mais fácil de lançar novas versões é através de **releases semânticos automáticos**. Basta fazer commit com o formato de mensagem correto e fazer push - todo o resto acontece automaticamente.

### Formato de Mensagem de Commit

Use estes prefixos para controlar qual tipo de release acontece:

```bash
fix: resolve bug de parsing de argumentos CLI      # → release patch (4.1.0 → 4.1.1)
feat: adiciona novo modo de orquestração de agent  # → release minor (4.1.0 → 4.2.0)
feat!: redesenha interface CLI                     # → release major (4.1.0 → 5.0.0)
```

### O Que Acontece Automaticamente

Quando você faz push de commits com `fix:` ou `feat:`, o GitHub Actions irá:

1. Analisar suas mensagens de commit
2. Atualizar a versão no `package.json`
3. Gerar changelog
4. Criar tag git
5. **Publicar no NPM automaticamente**
6. Criar release no GitHub com notas

### Seu Fluxo de Trabalho Simples

```bash
# Faça suas alterações
git add .
git commit -m "feat: adiciona modo de colaboração em equipe"
git push

# É isso! O release acontece automaticamente
# Usuários agora podem executar: npx aios-core (e obter a nova versão)
```

### Commits que NÃO Disparam Releases

Estes tipos de commit não criarão releases (use-os para manutenção):

```bash
chore: atualiza dependências     # Sem release
docs: corrige erro no readme     # Sem release
style: formata código            # Sem release
test: adiciona testes unitários  # Sem release
```

### Teste Sua Configuração

```bash
npm run release:test    # Seguro executar localmente - testa a configuração
```

---

## Métodos de Release Manual (Apenas Exceções)

Somente use estes métodos se você precisar ignorar o sistema automático

### Atualização Manual Rápida de Versão

```bash
npm run version:patch   # 4.1.0 → 4.1.1 (correções de bugs)
npm run version:minor   # 4.1.0 → 4.2.0 (novas funcionalidades)
npm run version:major   # 4.1.0 → 5.0.0 (mudanças que quebram compatibilidade)

# Depois publique manualmente:
npm publish
git push && git push --tags
```

### Disparo Manual via GitHub Actions

Você também pode disparar releases manualmente através do workflow dispatch do GitHub Actions se necessário.

---

## Solução de Problemas

### Release Não Foi Disparado

Se seu merge para `main` não disparou um release:

1. **Verifique as mensagens de commit** - Apenas prefixos `fix:` e `feat:` disparam releases
2. **Verifique se o CI passou** - O release só executa se lint, typecheck e test passarem
3. **Verifique os logs do workflow** - Vá em Actions → Semantic Release para ver detalhes

### Release Falhou

Problemas comuns e soluções:

| Erro | Solução |
|------|---------|
| `ENOGHTOKEN` | Secret GITHUB_TOKEN ausente ou expirado |
| `ENOPKGAUTH` | Secret NPM_TOKEN ausente ou inválido |
| `ENOTINHISTORY` | Branch não tem histórico apropriado (use `fetch-depth: 0`) |
| `EINVALIDNPMTOKEN` | Regenere o token NPM com permissões de publicação |

### Pular um Release

Para fazer merge sem disparar um release, use uma destas opções:

```bash
# Método 1: Use prefixo que não dispara release
git commit -m "chore: atualiza dependências"

# Método 2: Adicione [skip ci] à mensagem de commit
git commit -m "feat: nova funcionalidade [skip ci]"
```

### Forçar um Release Manual

Se o release automático falhar, você pode fazer release manualmente:

```bash
npm run version:patch   # ou minor/major
git push && git push --tags
npm publish
```

---

## Arquivos de Configuração

| Arquivo | Propósito |
|---------|-----------|
| `.releaserc.json` | Configuração do semantic release |
| `.github/workflows/semantic-release.yml` | Workflow do GitHub Actions |
| `package.json` | Fonte da versão, scripts npm |

---

*Última atualização: Story 6.17 - Automação de Semantic Release*
