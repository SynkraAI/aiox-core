# Checklist: Setup do Squad

Use este checklist para configurar o Squad Content Creator no seu ambiente.

---

## Pre-requisitos

- [ ] **Claude Code instalado**
  - Versao minima: 1.0+
  - Comando: `claude --version`

- [ ] **Node.js instalado**
  - Versao minima: 18+
  - Comando: `node --version`

- [ ] **Conta Google Cloud (para APIs)**
  - Acesse: https://console.cloud.google.com

---

## Passo 1: Obter API Keys

### Google Gemini API (para Capa Lendaria)

```
1. Acesse: https://aistudio.google.com/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada (comeca com AIza...)
4. GUARDE EM LOCAL SEGURO
```

- [ ] API Key do Gemini obtida?

### YouTube Data API (para Espiao)

```
1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto (ou use existente)
3. Ative "YouTube Data API v3"
4. Crie credenciais > API Key
5. Copie a chave
```

- [ ] API Key do YouTube obtida?

---

## Passo 2: Configurar Variaveis de Ambiente

### Criar arquivo .env

No diretorio do projeto, crie um arquivo `.env`:

```bash
# Crie o arquivo
touch .env

# Adicione as chaves (substitua pelos seus valores)
echo 'VITE_GEMINI_API_KEY="sua-chave-gemini-aqui"' >> .env
echo 'YOUTUBE_API_KEY="sua-chave-youtube-aqui"' >> .env
```

- [ ] Arquivo .env criado?
- [ ] VITE_GEMINI_API_KEY configurada?
- [ ] YOUTUBE_API_KEY configurada?

### Verificar .gitignore

IMPORTANTE: O arquivo .env NAO deve ser commitado no git!

```bash
# Verifique se .env esta no .gitignore
cat .gitignore | grep ".env"

# Se nao estiver, adicione
echo ".env" >> .gitignore
```

- [ ] .env esta no .gitignore?

---

## Passo 3: Instalar Dependencias

```bash
# Na pasta do projeto
npm install
```

- [ ] Dependencias instaladas?
- [ ] Sem erros no console?

---

## Passo 4: Testar APIs

### Testar Gemini API

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent" \
  -H 'Content-Type: application/json' \
  -H 'X-goog-api-key: SUA_API_KEY_AQUI' \
  -X POST \
  -d '{"contents": [{"parts": [{"text": "Ola, funciona?"}]}]}'
```

- [ ] Resposta recebida (sem erro)?

### Testar YouTube API

```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=teste&key=SUA_API_KEY_AQUI"
```

- [ ] Resposta recebida (sem erro)?

---

## Passo 5: Configurar Claude Code

### Adicionar Squad

```bash
# Copie a pasta do squad para seu projeto
cp -r content-creator/ seu-projeto/.claude/commands/

# OU adicione no squads/
cp -r content-creator/ seu-projeto/squads/
```

- [ ] Squad copiado para o projeto?

### Testar Ativacao

```bash
# No Claude Code, teste:
/aiox-chief

# Deve responder com opcoes do squad
```

- [ ] AIOX Chief respondeu?

---

## Passo 6: Verificacao Final

- [ ] Gemini API funcionando?
- [ ] YouTube API funcionando?
- [ ] Squad carregado no Claude Code?
- [ ] Chaves NAO estao expostas no codigo?
- [ ] .env no .gitignore?

---

## Troubleshooting

### Erro: "API key not valid"
- Verifique se copiou a chave corretamente
- Verifique se a API esta ativada no Google Cloud
- Tente gerar uma nova chave

### Erro: "Quota exceeded"
- YouTube tem limite de 10.000 requests/dia
- Gemini tem limite de requests por minuto
- Aguarde ou use outra chave

### Erro: "Module not found"
- Execute `npm install` novamente
- Verifique a versao do Node.js

### Squad nao carrega
- Verifique se os arquivos estao na pasta correta
- Reinicie o Claude Code
- Verifique permissoes dos arquivos

---

## Seguranca

### NUNCA faca isso:
- Commitar .env no git
- Compartilhar sua API key
- Colocar chave direto no codigo
- Usar a mesma chave em projetos publicos

### SEMPRE faca isso:
- Use variaveis de ambiente
- Mantenha .env no .gitignore
- Rotacione chaves periodicamente
- Use chaves diferentes para dev/prod

---

## Proximos Passos

Apos configurar:

1. Teste o Video Editor com um video curto
2. Teste o Espiao com um canal pequeno
3. Teste a Capa Lendaria com uma foto
4. Familiarize-se com os checklists

---

**Versao:** 1.0
**Criado:** 28/02/2026

---

*Checklist: Setup do Squad - Squad Content Creator*
