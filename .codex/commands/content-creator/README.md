# Content Creator Squad

Squad de agentes IA para criadores de conteudo — cortes de video, espionagem de concorrentes, repurposing e roteiros.

---

## Visao Geral

| Item | Quantidade |
|------|------------|
| **Agentes** | 5 (chief + 4 especialistas) |
| **Tasks** | 3 workflows guiados |
| **Checklists** | 4 validacoes de qualidade |
| **Recursos** | 1 tutorial (Capa Lendaria) |

---

## Como Usar

### Ativar o Squad

```bash
# No Claude Code, ative com:
/aiox-chief
```

O **AIOX Chief** e o lider do squad. Ele sabe qual agente chamar para cada tarefa.

### Ou chame agentes diretamente:

| Comando | Agente | Faz o que |
|---------|--------|-----------|
| `/aiox-chief` | Lider | Coordena tudo, roteia pro agente certo |
| `/video-editor` | Editor | Corta videos, cria shorts/reels |
| `/espiao` | Espiao | Analisa canais e concorrentes |
| `/repurposing` | Repurposing | Multiplica 1 video em 10+ pecas |
| `/scriptwriter` | Roteirista | Cria roteiros com hook + CTA |

### Recursos Extras

| Recurso | Tipo | Uso |
|---------|------|-----|
| **Capa Lendaria** | Aplicacao Web | Gera thumbnails profissionais |

---

## Agentes

### AIOX Chief (Lider)
**Quando usar:** Nao sabe qual agente chamar? Fala com o Chief.

```
"Quero analisar o canal do @fulano"
→ Chief aciona o Espiao

"Preciso de 10 cortes da minha live"
→ Chief aciona o Video Editor

"Transforma esse video em posts pro Instagram"
→ Chief aciona o Repurposing

"Preciso de thumbnail pra meu video"
→ Chief indica o tutorial da Capa Lendaria
```

### Video Editor
**Quando usar:** Cortar videos longos em shorts/reels/clips.

```
"Corta essa live em 10 shorts de 60s"
"Identifica os melhores momentos desse video"
"Cria clips virais dessa gravacao"
```

**Checklist:** `checklists/qualidade-corte.md`

### Espiao
**Quando usar:** Analisar concorrentes, descobrir o que funciona.

```
"Analisa os 10 videos mais vistos desse canal"
"Quais thumbnails funcionam nesse nicho?"
"Extrai os padroes de hook desse criador"
```

**Checklist:** `checklists/analise-canal.md`

### Repurposing
**Quando usar:** Multiplicar um conteudo em varios formatos.

```
"Transforma esse video de 10min em:"
- 5 shorts
- 3 carrosseis
- 10 tweets
- 1 newsletter
```

**Checklist:** `checklists/repurposing.md`

### Scriptwriter
**Quando usar:** Criar roteiros para videos.

```
"Cria um roteiro de 60s sobre [tema]"
"Escreve um script com hook forte pra reels"
"Roteiro de VSL de 5 minutos sobre [produto]"
```

**Checklist:** `checklists/roteiro.md`

---

## Tasks (Workflows Guiados)

Para tarefas comuns, use os workflows prontos:

| Task | O que faz | Agente |
|------|-----------|--------|
| `cortar-video` | Guia completo pra cortar videos | Video Editor |
| `analisar-canal` | Passo a passo pra espionar canal | Espiao |
| `multiplicar-conteudo` | Workflow de repurposing | Repurposing |

---

## Checklists

Toda entrega passa por validacao de qualidade:

| Checklist | Uso | Score Minimo |
|-----------|-----|--------------|
| `qualidade-corte.md` | Validar cortes de video | 6/8 |
| `analise-canal.md` | Validar relatorios de espionagem | 75% |
| `repurposing.md` | Validar multiplicacao de conteudo | 75% |
| `roteiro.md` | Validar roteiros | 75% |

---

## Recursos

### Capa Lendaria V27.0

**Tipo:** Aplicacao Web (nao e agente)
**Funcao:** Gerar thumbnails profissionais com IA
**Formatos:** YouTube (16:9), Reels/Shorts (9:16), Feed (1080x1350)

**Como usar:** Veja o tutorial em `agents/thumbnail-creator.md`

**Repositorio:** github.com/ericasouza-eng/DESAFIO-AIOX

---

## Estrutura do Squad

```
content-creator/
├── agents/
│   ├── aiox-chief.md         # Lider/Orquestrador
│   ├── video-editor.md       # Cortes de video
│   ├── espiao.md             # Analise de concorrentes
│   ├── repurposing.md        # Multiplicar conteudo
│   ├── scriptwriter.md       # Roteiros
│   └── thumbnail-creator.md  # TUTORIAL Capa Lendaria
│
├── tasks/
│   ├── cortar-video.md       # Workflow de cortes
│   ├── analisar-canal.md     # Workflow de espionagem
│   └── multiplicar-conteudo.md # Workflow de repurposing
│
├── checklists/
│   ├── qualidade-corte.md    # Validacao de cortes
│   ├── analise-canal.md      # Validacao de analises
│   ├── repurposing.md        # Validacao de multiplicacao
│   └── roteiro.md            # Validacao de roteiros
│
└── README.md                  # Este arquivo
```

---

## Fluxo de Trabalho

```
1. USUARIO
   └── Faz pedido ao AIOX Chief

2. CHIEF
   ├── Entende o que precisa
   ├── Roteia pro agente certo
   └── Coleta informacoes necessarias

3. AGENTE
   ├── Executa a tarefa
   ├── Segue o workflow (task)
   └── Cria output

4. CHIEF
   ├── Aplica checklist
   ├── Valida qualidade
   └── Se OK, entrega pro usuario
       Se NAO, solicita ajustes

5. USUARIO
   └── Recebe entrega validada
```

---

## Dicas

1. **Comece pelo Chief** - Ele sabe rotear
2. **Seja especifico** - "10 cortes de 60s" > "corta o video"
3. **De contexto** - Seu nicho, seu publico, seu objetivo
4. **Use os workflows** - Sao guias passo a passo
5. **Confie nos checklists** - Garantem qualidade

---

## Metricas de Sucesso

| Metrica | Meta |
|---------|------|
| Entrega dentro do prazo | 95%+ |
| Aprovacao no primeiro checklist | 80%+ |
| Satisfacao do usuario | 9/10+ |
| Cortes que viralizam (>10K views) | 20%+ |
| Pecas por video multiplicado | 10+ |

---

## Suporte

Duvidas? Pergunte no grupo do Content Creator.

---

## Repositorio Oficial

**GitHub:** https://github.com/ericasouza-eng/DESAFIO-AIOX

O Design System e ferramentas visuais estao no repositorio acima.

---

## Changelog

| Versao | Data | Mudancas |
|--------|------|----------|
| 1.1 | 28/02/2026 | Thumbnail Creator convertido em tutorial; +3 checklists; routing atualizado |
| 1.0 | - | Versao inicial |

---

*Squad criado por Academia Lendaria - Content Creator 2026*
