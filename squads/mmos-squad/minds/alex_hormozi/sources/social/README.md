# Social Media - Alex Hormozi

## 📱 Plataformas

### twitter/ - @AlexHormozi
Threads e tweets sobre business, ofertas, mindset

### instagram/ - @alexhormozi
Carousels educacionais, quotes, lifestyle

### linkedin/ - Alex Hormozi
Artigos profissionais e posts de thought leadership

### tiktok/ - @alexhormozi
Vídeos curtos virais, clips de conteúdo

---

## 🐦 Twitter Priority

### Top Threads (Meta: 50)

**Categorias:**
- [ ] Value Equation threads (10)
- [ ] Offer creation threads (10)
- [ ] Lead generation threads (10)
- [ ] Sales psychology threads (10)
- [ ] Business mindset threads (10)

**Critérios de Seleção:**
- Mais engajamento (likes + retweets)
- Frameworks explicados
- Storytelling com lições
- Contrarian takes
- Actionable advice

### Formato de Coleta
```
YYYYMMDD_thread_title/
  ├── thread.txt
  ├── thread.md (formatado)
  ├── metrics.json
  └── images/ (se houver)
```

---

## 📸 Instagram Priority

### Top Posts (Meta: 30-50)

**Tipos de Conteúdo:**
1. **Carousels Educacionais** (Prioridade Alta)
   - Frameworks step-by-step
   - Checklists e playbooks
   - Before/After comparisons

2. **Quote Posts**
   - One-liners impactantes
   - Filosofia de negócios
   - Mindset shifts

3. **Behind-the-Scenes**
   - Daily routine
   - Office/gym
   - Processo criativo

**Formato de Coleta:**
```
YYYYMMDD_post_title/
  ├── caption.txt
  ├── images/
  │   ├── slide_1.jpg
  │   ├── slide_2.jpg
  │   └── ...
  ├── metrics.json
  └── summary.md
```

---

## 💼 LinkedIn Strategy

### Content Types

**Artigos Longos:**
- [ ] Business strategy pieces
- [ ] Industry analysis
- [ ] Personal experiences
- [ ] Thought leadership

**Posts:**
- [ ] Company updates
- [ ] Professional insights
- [ ] Network building content

**Meta:** 20-30 melhores posts/artigos

---

## 🎵 TikTok Collection

### Priority: 🟢 P2 (Lower priority)

**Razão:** Muito overlap com YouTube Shorts

**Estratégia:**
- Coletar apenas vídeos únicos (não duplicados no YT)
- Foco em viral content exclusivo do TikTok
- Meta: 10-15 vídeos tops

---

## 🔧 Processamento

### Twitter Threads
```bash
# Scrape thread
*etl scrape-twitter-thread "THREAD_URL"

# Extract insights
*etl process-thread thread.txt --extract-frameworks
```

### Instagram
```bash
# Download post
*etl download-instagram-post "POST_URL"

# Extract text from carousel
*etl extract-carousel-text images/ --output post.md
```

### LinkedIn
```bash
# Scrape article
*etl scrape-linkedin "ARTICLE_URL"
```

---

## 📊 Tracking

### Twitter
- **Threads Identificados:** 200+
- **Meta:** Top 50
- **Coletados:** 0
- **Progresso:** ░░░░░░░░░░░░░░░░░░░░ 0%

### Instagram
- **Posts Identificados:** 500+
- **Meta:** Top 30
- **Coletados:** 0
- **Progresso:** ░░░░░░░░░░░░░░░░░░░░ 0%

### LinkedIn
- **Posts/Artigos:** 100+
- **Meta:** Top 20
- **Coletados:** 0
- **Progresso:** ░░░░░░░░░░░░░░░░░░░░ 0%

### TikTok
- **Vídeos:** 300+
- **Meta:** 10-15 únicos
- **Coletados:** 0
- **Progresso:** ░░░░░░░░░░░░░░░░░░░░ 0%

---

## 🎯 Sprint Plan

**Week 1:**
- Top 20 Twitter threads
- Top 10 Instagram carousels

**Week 2:**
- Mais 20 Twitter threads
- Mais 10 Instagram posts
- Iniciar LinkedIn

**Week 3:**
- Completar Instagram (30 total)
- Completar LinkedIn (20)
- Review TikTok

**Week 4:**
- TikTok unique content
- Integration & synthesis

---

*Última atualização: 2025-10-10*
