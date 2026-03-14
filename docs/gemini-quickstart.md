# Gemini CLI + AIOS - Guia de Início Rápido

## Setup Completo ✅

Seu ambiente está configurado para usar o **Gemini CLI** com todos os agentes do AIOS.

---

## 1. Configurar Chave de API

Você precisa de uma chave de API do Google AI. Pegue em: https://aistudio.google.com/app/apikey

### Opção A: Global (Recomendado)
Adicione ao seu `~/.zshrc` ou `~/.bashrc`:
```bash
export GOOGLE_AI_API_KEY="sua-chave-aqui"
```

Depois rode:
```bash
source ~/.zshrc
```

### Opção B: Por Projeto
Adicione ao `.env` de cada projeto:
```bash
GOOGLE_AI_API_KEY=sua-chave-aqui
```

---

## 2. Uso Básico

### Com o Wrapper (Recomendado)
*(Nota: Substitua os caminhos pelos caminhos reais da sua máquina)*
```bash
# Dentro de um projeto AIOS
cd /path/to/your/aios-core
gemini-aios

# O wrapper vai:
# - Detectar o projeto AIOS
# - Carregar a chave de API
# - Informar os comandos disponíveis
```

### Diretamente
```bash
export GOOGLE_AI_API_KEY="..."
gemini
```

---

## 3. Comandos AIOS no Gemini

Dentro do Gemini CLI, você tem acesso a:

### Menu de Agentes
```text
/aios-menu
```
Mostra todos os agentes disponíveis.

### Ativação Rápida
- `/aios-dev` - Desenvolvedor
- `/aios-architect` - Arquiteto de sistemas
- `/aios-qa` - Quality Assurance
- `/aios-devops` - DevOps Engineer
- `/aios-pm` - Product Manager
- `/aios-data-engineer` - Engenheiro de Dados
- E mais...

### Comandos de Sistema
- `/aios-status` - Status da instalação
- `/aios-agents` - Lista de agentes
- `/aios-validate` - Validar instalação

---

## 4. Exemplo de Uso

```bash
# Iniciar Gemini no projeto AIOS
cd /path/to/your/aios-project
gemini-aios

# Dentro do Gemini:
> /aios-dev
# O agente desenvolvedor será ativado

> Como agente AIOS dev, crie um script para...
```

---

## 5. Comparação: Claude vs Gemini

| Recurso | Claude Code | Gemini CLI |
|---------|-------------|------------|
| Modelo | Claude Opus/Sonnet | Gemini 2.0 Flash |
| Custo | Pago | **Grátis** (com limites) |
| Ativação | `/dev` | `/aios-dev` |
| MCP | Nativo | Via extensão |
| Multimodal | Limitado | **Completo** (imagens, vídeo) |

---

## 6. Troubleshooting

### Erro: API Key não encontrada
```bash
# Verificar se a variável está definida
echo $GOOGLE_AI_API_KEY

# Se vazio, exportar manualmente
export GOOGLE_AI_API_KEY="AIza..."
```

### Extensão não aparece
```bash
# Verificar instalação
gemini extensions list | grep aios

# Reinstalar se necessário
cp -r /path/to/your/aios-core/packages/gemini-aios-extension/* ~/.gemini/extensions/aios/
```

---

## Pronto!

Agora você tem o poder do AIOS rodando com Gemini, de graça! 🚀
