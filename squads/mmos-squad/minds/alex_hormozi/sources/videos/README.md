# Videos - Alex Hormozi

## 🎥 Estrutura

### youtube_main/
Canal principal @AlexHormozi - Vídeos longos educacionais

### youtube_shorts/
Shorts e clips curtos do canal principal

### acquisition_com/
Canal @acquisition.com - Conteúdo corporativo

---

## 📺 YouTube Main - Top Videos Priority

### 🔴 P0 - Must Have (Top 20)

#### Framework Deep Dives
1. [ ] **The Value Equation Explained**
   - Duração: ~30min
   - Tópico: Core framework
   - Link: [URL]

2. [ ] **Grand Slam Offer Framework**
   - Duração: ~45min
   - Tópico: Offer creation
   - Link: [URL]

3. [ ] **How to Get Rich (Full Guide)**
   - Duração: ~1h
   - Tópico: Wealth building philosophy
   - Link: [URL]

#### Scaling & Growth
4. [ ] **How I Scaled Companies to $100M+**
5. [ ] **The ONLY Way to Get Rich**
6. [ ] **10 Levels of Scale**

#### Sales & Marketing
7. [ ] **The Psychology of Selling**
8. [ ] **Lead Generation Masterclass**
9. [ ] **Pricing Strategy Deep Dive**
10. [ ] **How to Close More Sales**

#### Personal Development
11. [ ] **My Daily Routine**
12. [ ] **How I Stay Focused**
13. [ ] **Building a Personal Brand**
14. [ ] **Time Management for Entrepreneurs**

#### Case Studies
15. [ ] **Lessons from Gym Launch**
16. [ ] **How We Built Acquisition.com**
17. [ ] **Biggest Business Mistakes**

#### Strategy & Mindset
18. [ ] **Business Model Breakdown**
19. [ ] **Entrepreneurial Mindset**
20. [ ] **Long-term Thinking**

---

## 🎬 YouTube Shorts (Top 30)

**Critérios:**
- Most viral (1M+ views)
- Core concepts condensed
- Quotable moments

**Categorias:**
- [ ] Value Equation snippets (5)
- [ ] Offer creation tips (5)
- [ ] Sales psychology (5)
- [ ] Business mindset (5)
- [ ] Personal brand (5)
- [ ] Motivational (5)

---

## 🏢 Acquisition.com Channel

**Foco:** Conteúdo mais corporativo e estratégico

**Videos a Coletar:**
- [ ] Company overview
- [ ] Investment philosophy
- [ ] Portfolio companies
- [ ] Educational series

---

## 🔧 Processamento de Vídeos

### Formato de Output
Para cada vídeo:
```
{video_title}/
  ├── metadata.json
  ├── transcript.txt
  ├── summary.md
  ├── key_points.md
  ├── quotes.md
  ├── frameworks_extracted.md
  └── timestamps.txt
```

### Pipeline
1. **Download** → Video + Audio (yt-dlp)
2. **Extract Audio** → MP3 format
3. **Transcribe** → Whisper API
4. **Timestamps** → Key moments
5. **Extract** → Frameworks, quotes, insights
6. **Summarize** → Main takeaways
7. **Integrate** → Link to artifacts/

### Comandos

```bash
# Download video
yt-dlp "URL" -o "%(title)s.%(ext)s"

# Extract audio
ffmpeg -i video.mp4 -vn -acodec mp3 audio.mp3

# Transcribe
*etl transcribe audio.mp3

# Process
*etl process-video transcript.txt --extract-all
```

---

## 📊 Tracking

### YouTube Main
- **Total no Canal:** 500+
- **Meta Coleta:** Top 50
- **Coletados:** 0
- **Progresso:** ░░░░░░░░░░░░░░░░░░░░ 0%

### YouTube Shorts
- **Total no Canal:** 200+
- **Meta Coleta:** Top 30
- **Coletados:** 0
- **Progresso:** ░░░░░░░░░░░░░░░░░░░░ 0%

### Acquisition.com
- **Total no Canal:** 50+
- **Meta Coleta:** 10-15
- **Coletados:** 0
- **Progresso:** ░░░░░░░░░░░░░░░░░░░░ 0%

---

## 🎯 Sprint Plan

**Week 1:** Top 10 videos principais
**Week 2:** Mais 10 videos + iniciar shorts
**Week 3:** Completar shorts + acquisition.com
**Week 4:** Review e integração

---

*Última atualização: 2025-10-10*
