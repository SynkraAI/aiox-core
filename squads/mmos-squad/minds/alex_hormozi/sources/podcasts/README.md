# Podcasts - Alex Hormozi

## 🎙️ Estrutura

### guest_appearances/
Episódios onde Alex Hormozi foi convidado em outros podcasts

### own_podcast/
The Game w/ Alex Hormozi (podcast próprio)

---

## 📋 Guest Appearances - Priority List

### 🔴 P0 - Urgente

#### 1. Joe Rogan Experience
- **Status:** ⏸️ Não Coletado
- **Duração:** ~3 horas
- **Data:** [Pending]
- **Tópicos:** Business, fitness, entrepreneurship
- **Link:** [URL]

#### 2. Tom Bilyeu - Impact Theory
- **Status:** ✅ 1 episódio coletado
- **Arquivos:** `../interviews/Entrevista Tom Biley.md`
- **Ação:** Coletar episódios adicionais
- **Total Episódios:** 3+

#### 3. Andrew Huberman Lab
- **Status:** ⏸️ Não Coletado
- **Duração:** ~2 horas
- **Tópicos:** Performance, psychology, business mindset
- **Link:** [URL]

### 🟡 P1 - Alta Prioridade

#### 4. Chris Williamson - Modern Wisdom
- **Episódios:** 2-3 aparições
- **Tópicos:** Philosophy, business, personal development

#### 5. Steven Bartlett - Diary of a CEO
- **Episódios:** 1-2 aparições
- **Tópicos:** Entrepreneurship, scaling

#### 6. My First Million
- **Episódios:** Multiple
- **Tópicos:** Business strategies, deals

#### 7. Ed Mylett Show
- **Status:** ⏸️
- **Tópicos:** Success principles, mindset

---

## 🎧 Own Podcast - The Game

### Episódios para Coletar (Top 20)

**Critérios de Seleção:**
- Mais views/downloads
- Tópicos core (offers, leads, scaling)
- Episódios com frameworks explicados
- Casos práticos detalhados

**Lista Sugerida:**
1. [ ] Ep. 001 - Introduction to The Game
2. [ ] Top episódio sobre Value Equation
3. [ ] Top episódio sobre Grand Slam Offers
4. [ ] Top episódio sobre lead generation
5. [ ] Episódios com guests relevantes
6. [ ] ... (expandir conforme pesquisa)

---

## 🔧 Processamento

### Formato Desejado
Para cada podcast:
```
{podcast_name}/
  ├── {episode_number}_{title}/
  │   ├── audio.mp3
  │   ├── transcript.txt
  │   ├── summary.md
  │   ├── quotes.md
  │   └── frameworks.md
```

### Pipeline
1. **Download** → Audio files
2. **Transcribe** → Whisper API ou similar
3. **Extract** → Key insights, frameworks, quotes
4. **Summarize** → Main points
5. **Integrate** → Link to artifacts/

### Comandos ETL
```bash
# Transcrever podcast
*etl transcribe audio.mp3 --output transcript.txt

# Extrair insights
*etl extract-insights transcript.txt

# Criar summary
*etl summarize transcript.txt --format markdown
```

---

## 📊 Tracking

**Guest Appearances:**
- Total Identificados: 15+
- Coletados: 1
- Progresso: ████░░░░░░░░░░░░░░░░ 7%

**Own Podcast:**
- Total Episódios: 50+
- Meta: Top 20
- Coletados: 0
- Progresso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

*Última atualização: 2025-10-10*
