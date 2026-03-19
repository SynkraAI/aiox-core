# Renner Silva - Source Material Directory
## Material Fonte para Mind Cloning Project

**Data de início:** 2026-02-19
**Status:** Coleta em andamento (Fase 1 - 40% completude)
**Objetivo:** Coletar 100% dos dados necessários para mind cloning completo

---

## ESTRUTURA DE ARQUIVOS

### 📋 Documentos de Planejamento e Status

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `README.md` | Este arquivo - Índice e visão geral | ✅ Completo |
| `EXECUTIVE-SUMMARY.md` | Resumo executivo dos dados coletados | ✅ Atualizado |
| `web-scraping-raw-data.md` | Dados brutos completos do web scraping | ✅ Completo |
| `data-collection-roadmap.md` | Plano detalhado de coleta de dados | ✅ Completo |
| `NEXT-STEPS-COMMANDS.sh` | Script executável para próximas fases | ✅ Pronto |

### 📁 Diretórios de Dados

| Diretório | Conteúdo Esperado | Status |
|-----------|-------------------|--------|
| `videos/` | Vídeos baixados do YouTube | ⏳ Pendente |
| `transcripts/` | Transcrições dos vídeos | ⏳ Pendente |
| `wayback-archive/` | Conteúdo do Web Archive | ⏳ Pendente |
| `linkedin/` | Posts e artigos do LinkedIn | ⏳ Pendente |
| `instagram/` | Posts e reels do Instagram | ⏳ Pendente |
| `facebook/` | Posts do Facebook | ⏳ Pendente |
| `podcasts/` | Transcrições de podcasts | ⏳ Pendente |

---

## QUICK START

### Para começar a coleta de dados AGORA:

```bash
# Navegar para o diretório
cd <PROJECT_ROOT>/squads/renner-silva/source-material

# Executar script de coleta
bash NEXT-STEPS-COMMANDS.sh
```

### Para revisar dados já coletados:

```bash
# Ver resumo executivo
cat EXECUTIVE-SUMMARY.md

# Ver dados brutos completos
cat web-scraping-raw-data.md

# Ver plano completo de coleta
cat data-collection-roadmap.md
```

---

## STATUS DE COMPLETUDE

### Dados Coletados (40%)

✅ **Completos:**
- Credenciais profissionais (95%)
- Frase assinatura (100%)
- Diferencial único (90%)
- Números de impacto (95%)
- Estrutura treinamento Palestras Poderosas (70%)
- Comunidade/Cultura Família Silva (85%)

⚠️ **Parciais:**
- Palestra "A Fórmula Mágica do Sucesso" (60%)
- Técnicas de mágica contextualizada (30%)
- Presença digital (50%)

❌ **Ausentes (CRÍTICO):**
- **Método S.I.M. completo (0%)**
- **História de vida detalhada (20%)**
- **8 Passos do Roteiro Perfeito (10%)**

### Meta de Completude

| Nível | Percentual | O que inclui |
|-------|-----------|--------------|
| **Mínimo Viável** | 60% | História de vida + Método S.I.M. + estrutura palestras |
| **Funcional** | 75% | + 8 Passos + técnicas de mágica + 10 depoimentos |
| **Ideal** | 85% | + blog posts + podcasts + cases empresas |
| **Completo** | 100% | + materiais acadêmicos + conteúdo redes sociais completo |

**Status atual:** 40% → Meta próxima: 60% (Mínimo Viável)

---

## PRIORIDADES DE COLETA

### 🔴 PRIORIDADE CRÍTICA (Bloqueadores)

1. **Transcrever "A Fórmula Mágica do Sucesso"**
   - URL: https://www.youtube.com/watch?v=3UMJFEBOEss
   - Duração: 01:50:48
   - Objetivo: História de vida completa + estrutura da palestra
   - Ferramenta: yt-dlp + Whisper
   - Tempo estimado: 2-3h

2. **Transcrever "Os 8 Passos do Roteiro Perfeito"**
   - URL: https://www.youtube.com/watch?v=Cx7A7pYZcqw
   - Duração: 02:24:53
   - Objetivo: Framework completo dos 8 passos
   - Ferramenta: yt-dlp + Whisper
   - Tempo estimado: 3-4h

3. **Wayback Machine - Método S.I.M.**
   - URL: https://web.archive.org/web/*/metodosim.com.br
   - Objetivo: Obter sigla, princípios, framework
   - Ferramenta: Manual (browser)
   - Tempo estimado: 1-2h

### 🟡 PRIORIDADE ALTA (Importantes)

4. **Listar e analisar canal YouTube completo**
   - Identificar vídeos com entrevistas
   - Identificar vídeos com depoimentos
   - Transcrever 5-10 vídeos adicionais

5. **Wayback Machine - Blog**
   - URL: https://web.archive.org/web/*/rennersilva.com.br/blog
   - Objetivo: Posts com insights e padrões de escrita

### 🟢 PRIORIDADE MÉDIA (Complementares)

6. **Redes sociais (LinkedIn, Instagram, Facebook)**
7. **Podcasts e entrevistas**
8. **Cases de empresas e depoimentos completos**

---

## FERRAMENTAS NECESSÁRIAS

### Instaladas

- [x] Exa MCP (web search)
- [x] Bash (comandos sistema)

### Necessárias para Fase 1

- [ ] **yt-dlp** - Download de vídeos YouTube
  ```bash
  brew install yt-dlp
  ```

- [ ] **ffmpeg** - Processamento de vídeo/áudio
  ```bash
  brew install ffmpeg
  ```

- [ ] **openai-whisper** - Transcrição de áudio
  ```bash
  pip3 install openai-whisper
  ```

### Opcionais (para fases futuras)

- [ ] Selenium/Playwright - Automação de browser para redes sociais
- [ ] Beautiful Soup - Parsing de HTML (se conseguir acesso aos sites)
- [ ] Ferramentas de análise linguística (NLTK, spaCy)

---

## OUTPUTS ESPERADOS

### Após Fase 1 (Transcrições)

```
transcripts/
├── 01-formula-magica-sucesso.txt           # Transcrição completa
├── 01-formula-magica-sucesso.srt           # Legendas com timestamps
├── 01-formula-magica-sucesso.vtt           # Legendas WebVTT
├── 02-8-passos-roteiro-perfeito.txt        # Transcrição completa
├── 02-8-passos-roteiro-perfeito.srt        # Legendas com timestamps
├── 02-8-passos-roteiro-perfeito.vtt        # Legendas WebVTT
├── 03-formula-magica-tv-creci.txt          # Transcrição completa
└── analysis/
    ├── historia-de-vida-extracted.md       # História extraída
    ├── metodo-sim-references.md            # Menções ao Método S.I.M.
    ├── 8-passos-framework.md               # Framework dos 8 passos
    └── frases-assinatura.md                # Todas as frases assinatura
```

### Após Fase 2 (Web Archive)

```
wayback-archive/
├── metodosim-com-br/
│   ├── homepage.html
│   ├── metodo-sim-completo.md              # Framework completo
│   └── screenshots/
├── rennersilva-com-br/
│   ├── about.html
│   ├── biografia-completa.md
│   └── screenshots/
└── blog/
    ├── post-001.md
    ├── post-002.md
    └── ...
```

### Após Fase 3 (Vídeos Adicionais)

```
videos/
├── entrevistas/
│   ├── podcast-xyz.mp4
│   ├── entrevista-abc.mp4
│   └── ...
├── depoimentos/
│   ├── depoimento-aluno-1.mp4
│   └── ...
└── transcripts/
    └── (transcrições correspondentes)
```

### Após Fase 4 (Redes Sociais)

```
linkedin/
├── perfil.md
├── artigos/
│   ├── artigo-001.md
│   └── ...
└── posts/
    ├── post-001.md
    └── ...

instagram/
├── perfil.md
├── feed/
│   ├── post-001.md
│   └── ...
└── reels/
    ├── reel-001.md
    └── ...

facebook/
├── perfil.md
└── posts/
    ├── post-001.md
    └── ...
```

---

## CHECKLIST DE EXECUÇÃO

### Fase 1: Transcrições (CRÍTICO)

- [ ] Instalar yt-dlp
- [ ] Instalar ffmpeg
- [ ] Instalar openai-whisper
- [ ] Baixar "A Fórmula Mágica do Sucesso"
- [ ] Baixar "Os 8 Passos do Roteiro Perfeito"
- [ ] Baixar "Fórmula Mágica TV CRECI" (opcional)
- [ ] Transcrever vídeo 1 com Whisper
- [ ] Transcrever vídeo 2 com Whisper
- [ ] Transcrever vídeo 3 com Whisper (opcional)
- [ ] Extrair história de vida das transcrições
- [ ] Identificar Método S.I.M. nas transcrições
- [ ] Mapear os 8 passos do roteiro
- [ ] Catalogar frases assinatura
- [ ] Documentar padrões de linguagem

### Fase 2: Web Archive (ALTA PRIORIDADE)

- [ ] Verificar metodosim.com.br no Wayback Machine
- [ ] Extrair conteúdo do Método S.I.M.
- [ ] Verificar rennersilva.com.br no Wayback Machine
- [ ] Extrair biografia completa
- [ ] Verificar blog no Wayback Machine
- [ ] Salvar posts relevantes
- [ ] Organizar conteúdo em markdown

### Fase 3: Vídeos Adicionais (MÉDIA PRIORIDADE)

- [ ] Listar todos os vídeos do canal
- [ ] Identificar 5-10 vídeos relevantes
- [ ] Baixar vídeos selecionados
- [ ] Transcrever vídeos
- [ ] Extrair insights adicionais

### Fase 4: Redes Sociais (MÉDIA PRIORIDADE)

- [ ] Coletar conteúdo LinkedIn
- [ ] Coletar conteúdo Instagram
- [ ] Coletar conteúdo Facebook
- [ ] Buscar e listar podcasts
- [ ] Transcrever podcasts selecionados

### Fase 5: Síntese e Validação

- [ ] Consolidar todos os dados coletados
- [ ] Validar consistência entre fontes
- [ ] Preencher gaps remanescentes via inferência
- [ ] Documentar fontes de cada informação
- [ ] Criar índice final de completude
- [ ] Gerar relatório final

---

## MÉTRICAS DE SUCESSO

### Completude de Dados

| Item | Meta Mínima | Meta Ideal | Status Atual |
|------|-------------|------------|--------------|
| História de vida | 60% | 90% | 20% ⚠️ |
| Método S.I.M. | 70% | 100% | 0% ❌ |
| 8 Passos do Roteiro | 70% | 100% | 10% ❌ |
| Técnicas de mágica | 50% | 80% | 30% ⚠️ |
| Padrões de linguagem | 60% | 90% | 40% ⚠️ |
| Frases assinatura | 80% | 100% | 70% ⚠️ |
| Depoimentos | 5 | 20 | 3 ⚠️ |
| Cases empresas | 3 | 10 | 0 ❌ |

### Qualidade das Fontes

| Tier | Tipo de Fonte | Quantidade Meta | Status |
|------|---------------|-----------------|--------|
| Tier 1 | Conteúdo direto Renner | 10+ | 5 ⚠️ |
| Tier 2 | Entrevistas aprovadas | 5+ | 0 ❌ |
| Tier 3 | Depoimentos alunos | 20+ | 3 ⚠️ |
| Tier 4 | Menções terceiros | 10+ | 5 ⚠️ |

---

## CRONOGRAMA

### Semana 1 (Fase 1 - CRÍTICO)

- **Dia 1-2:** Instalação de ferramentas + Download de vídeos
- **Dia 3-4:** Transcrições com Whisper
- **Dia 5-7:** Análise das transcrições + extração de dados

### Semana 2 (Fases 2-3)

- **Dia 1-2:** Web Archive (Método S.I.M. + Blog)
- **Dia 3-5:** Vídeos adicionais do canal
- **Dia 6-7:** Primeira consolidação de dados

### Semana 3 (Fases 4-5)

- **Dia 1-3:** Redes sociais + Podcasts
- **Dia 4-5:** Síntese final
- **Dia 6-7:** Validação e documentação final

**Prazo total estimado:** 3 semanas (~21 dias)

---

## CONTATOS E REFERÊNCIAS

### URLs Principais

- 🌐 Site oficial: https://rennersilva.com.br/ (bloqueado)
- 🎓 Palestras Poderosas: https://palestraspoderosas.com.br/
- 📚 Método S.I.M.: https://metodosim.com.br/ (bloqueado)
- 🎥 YouTube: https://www.youtube.com/channel/UCAyyyfkJg5Sw35NJfk4OZeg
- 📘 Facebook: https://www.facebook.com/magicorenner/
- 📸 Instagram: @rennersilvaoficial
- 📧 Contato: +55 31 98453-9961

### Bureaus de Palestras

- Expo Empreendedor: https://expoempreendedor.com.br/
- Dialethos Eventos: https://www.dialethoseventos.com.br/
- VIP Palestras: https://www.vippalestras.com.br/
- Palestras de Sucesso: https://palestrasdesucesso.com.br/
- Polo Palestrantes: https://polopalestrantes.com.br/
- Fadel Palestrantes: https://fadelpalestrantes.com.br/

---

## TROUBLESHOOTING

### Problemas Comuns

**1. yt-dlp não baixa vídeo:**
```bash
# Atualizar yt-dlp
brew upgrade yt-dlp

# Tentar com outro formato
yt-dlp -F [URL]  # Listar formatos
yt-dlp -f [format-id] [URL]
```

**2. Whisper out of memory:**
```bash
# Usar modelo menor
whisper video.mp4 --model medium  # ao invés de large
```

**3. Transcrição com erros:**
```bash
# Revisar manualmente
# Ou usar outro serviço: Descript, Sonix, etc.
```

**4. Sites bloqueados:**
```bash
# Tentar com diferentes user agents
curl -A "Mozilla/5.0..." [URL]

# Usar Web Archive
https://web.archive.org/web/*/[URL]
```

---

## CHANGELOG

### 2026-02-19 - Criação Inicial

- ✅ Estrutura de diretórios criada
- ✅ Web scraping inicial executado (Exa MCP)
- ✅ Dados brutos compilados (40% completude)
- ✅ Roadmap de coleta criado
- ✅ Executive summary gerado
- ✅ Script de próximos passos criado
- ✅ README criado

### Próximas Atualizações

- [ ] 2026-02-20: Fase 1 iniciada (download + transcrições)
- [ ] 2026-02-21: Fase 1 concluída
- [ ] 2026-02-22: Fase 2 iniciada (Web Archive)
- [ ] 2026-02-23: Fases 2-3 concluídas
- [ ] 2026-02-24: Fase 4 iniciada (Redes Sociais)
- [ ] 2026-02-25: Consolidação final

---

## ARQUIVOS DESTE DIRETÓRIO

```
source-material/
├── README.md                           # Este arquivo
├── EXECUTIVE-SUMMARY.md                # Resumo executivo (40% dados)
├── web-scraping-raw-data.md            # Dados brutos web scraping
├── data-collection-roadmap.md          # Plano detalhado de coleta
├── NEXT-STEPS-COMMANDS.sh              # Script executável
├── videos/                             # (a ser criado)
├── transcripts/                        # (a ser criado)
├── wayback-archive/                    # (a ser criado)
├── linkedin/                           # (a ser criado)
├── instagram/                          # (a ser criado)
├── facebook/                           # (a ser criado)
└── podcasts/                           # (a ser criado)
```

---

**Última atualização:** 2026-02-19
**Mantido por:** Squad Renner Silva - Mind Cloning Project
**Status:** 🔴 Em Progresso - Fase 1 Pendente
