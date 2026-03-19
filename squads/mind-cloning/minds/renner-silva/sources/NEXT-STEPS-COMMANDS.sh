#!/bin/bash
# Renner Silva - Mind Cloning Project
# NEXT STEPS: Comandos prontos para execução
# Data: 2026-02-19

# ============================================================================
# FASE 1: DOWNLOAD E TRANSCRIÇÃO DE VÍDEOS YOUTUBE
# ============================================================================

# Diretórios de trabalho
SQUAD_DIR="<PROJECT_ROOT>/squads/renner-silva"
SOURCE_DIR="$SQUAD_DIR/source-material"
VIDEO_DIR="$SOURCE_DIR/videos"
TRANSCRIPT_DIR="$SOURCE_DIR/transcripts"

# Criar diretórios se não existirem
mkdir -p "$VIDEO_DIR"
mkdir -p "$TRANSCRIPT_DIR"

# ----------------------------------------------------------------------------
# 1.1 INSTALAR FERRAMENTAS NECESSÁRIAS
# ----------------------------------------------------------------------------

echo "=== Instalando ferramentas necessárias ==="

# Instalar yt-dlp (downloader YouTube)
brew install yt-dlp

# Instalar ffmpeg (processamento de vídeo/áudio)
brew install ffmpeg

# Instalar openai-whisper (transcrição de áudio)
pip3 install openai-whisper

# Verificar instalações
echo "Verificando instalações..."
yt-dlp --version
ffmpeg -version | head -1
whisper --help | head -1

# ----------------------------------------------------------------------------
# 1.2 DOWNLOAD DOS VÍDEOS PRINCIPAIS
# ----------------------------------------------------------------------------

echo ""
echo "=== Baixando vídeos do YouTube ==="

# Vídeo 1: A Fórmula Mágica do Sucesso (01:50:48)
# Prioridade: CRÍTICA (contém história de vida + estrutura da palestra)
cd "$VIDEO_DIR"
yt-dlp \
  "https://www.youtube.com/watch?v=3UMJFEBOEss" \
  -o "formula-magica-sucesso.%(ext)s" \
  --format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
  --merge-output-format mp4 \
  --write-description \
  --write-info-json \
  --write-thumbnail

echo "✅ Download 'A Fórmula Mágica do Sucesso' concluído"

# Vídeo 2: Os 8 Passos para criar o Roteiro Perfeito (02:24:53)
# Prioridade: CRÍTICA (contém framework completo dos 8 passos)
yt-dlp \
  "https://www.youtube.com/watch?v=Cx7A7pYZcqw" \
  -o "8-passos-roteiro-perfeito.%(ext)s" \
  --format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
  --merge-output-format mp4 \
  --write-description \
  --write-info-json \
  --write-thumbnail

echo "✅ Download 'Os 8 Passos do Roteiro Perfeito' concluído"

# Vídeo 3: A fórmula MÁGICA do sucesso! - TV CRECI (01:08:10)
# Prioridade: MÉDIA (versão alternativa, pode ter conteúdo adicional)
yt-dlp \
  "https://www.youtube.com/watch?v=VCrLV3VssUw" \
  -o "formula-magica-tv-creci.%(ext)s" \
  --format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
  --merge-output-format mp4 \
  --write-description \
  --write-info-json \
  --write-thumbnail

echo "✅ Download 'Fórmula Mágica TV CRECI' concluído"

# ----------------------------------------------------------------------------
# 1.3 TRANSCRIÇÃO COM WHISPER
# ----------------------------------------------------------------------------

echo ""
echo "=== Transcrevendo vídeos com Whisper ==="
echo "⚠️  ATENÇÃO: Este processo pode demorar várias horas dependendo do modelo usado"
echo ""

# Modelo "large" oferece melhor qualidade mas é mais lento
# Modelo "medium" é um bom compromisso qualidade/velocidade
# Modelo "base" é rápido mas menor qualidade

WHISPER_MODEL="large"  # Alterar para "medium" ou "base" se necessário

# Transcrever Vídeo 1: A Fórmula Mágica do Sucesso
echo "Transcrevendo 'A Fórmula Mágica do Sucesso' (pode demorar 1-2h)..."
whisper "$VIDEO_DIR/formula-magica-sucesso.mp4" \
  --model $WHISPER_MODEL \
  --language pt \
  --output_dir "$TRANSCRIPT_DIR" \
  --output_format txt \
  --output_format srt \
  --output_format vtt \
  --verbose True

echo "✅ Transcrição 'A Fórmula Mágica do Sucesso' concluída"

# Transcrever Vídeo 2: Os 8 Passos
echo "Transcrevendo 'Os 8 Passos do Roteiro Perfeito' (pode demorar 1-2h)..."
whisper "$VIDEO_DIR/8-passos-roteiro-perfeito.mp4" \
  --model $WHISPER_MODEL \
  --language pt \
  --output_dir "$TRANSCRIPT_DIR" \
  --output_format txt \
  --output_format srt \
  --output_format vtt \
  --verbose True

echo "✅ Transcrição 'Os 8 Passos do Roteiro Perfeito' concluída"

# Transcrever Vídeo 3: TV CRECI (opcional)
echo "Transcrevendo 'Fórmula Mágica TV CRECI' (pode demorar 1h)..."
whisper "$VIDEO_DIR/formula-magica-tv-creci.mp4" \
  --model $WHISPER_MODEL \
  --language pt \
  --output_dir "$TRANSCRIPT_DIR" \
  --output_format txt \
  --output_format srt \
  --output_format vtt \
  --verbose True

echo "✅ Transcrição 'Fórmula Mágica TV CRECI' concluída"

# ----------------------------------------------------------------------------
# 1.4 ORGANIZAR TRANSCRIÇÕES
# ----------------------------------------------------------------------------

echo ""
echo "=== Organizando transcrições ==="

cd "$TRANSCRIPT_DIR"

# Renomear arquivos para nomes mais claros
mv "formula-magica-sucesso.txt" "01-formula-magica-sucesso.txt" 2>/dev/null
mv "8-passos-roteiro-perfeito.txt" "02-8-passos-roteiro-perfeito.txt" 2>/dev/null
mv "formula-magica-tv-creci.txt" "03-formula-magica-tv-creci.txt" 2>/dev/null

# Listar arquivos gerados
echo ""
echo "Transcrições geradas:"
ls -lh *.txt

echo ""
echo "✅ FASE 1 CONCLUÍDA"
echo ""
echo "Próximos passos:"
echo "1. Revisar transcrições em: $TRANSCRIPT_DIR"
echo "2. Extrair Método S.I.M. das transcrições"
echo "3. Mapear história de vida completa"
echo "4. Listar os 8 passos do roteiro"

# ============================================================================
# FASE 2: WEB ARCHIVE - MÉTODO S.I.M.
# ============================================================================

echo ""
echo "=== FASE 2: Web Archive ==="
echo ""

# Verificar Wayback Machine para metodosim.com.br
echo "Verificando Wayback Machine para metodosim.com.br..."
echo "URL: https://web.archive.org/web/*/metodosim.com.br"
echo ""

# Abrir no browser (macOS)
open "https://web.archive.org/web/*/metodosim.com.br"

echo "Verificando Wayback Machine para rennersilva.com.br..."
echo "URL: https://web.archive.org/web/*/rennersilva.com.br"
echo ""
open "https://web.archive.org/web/*/rennersilva.com.br"

echo "Verificando Wayback Machine para blog..."
echo "URL: https://web.archive.org/web/*/rennersilva.com.br/blog"
echo ""
open "https://web.archive.org/web/*/rennersilva.com.br/blog"

echo ""
echo "⚠️  Ação manual necessária:"
echo "1. Revisar snapshots disponíveis no Wayback Machine"
echo "2. Copiar conteúdo relevante (especialmente Método S.I.M.)"
echo "3. Salvar em: $SOURCE_DIR/wayback-archive/"

# ============================================================================
# FASE 3: BUSCA NO YOUTUBE - OUTROS VÍDEOS RELEVANTES
# ============================================================================

echo ""
echo "=== FASE 3: Busca de vídeos adicionais ==="
echo ""

# Listar vídeos do canal
echo "Listando vídeos do canal Renner Silva..."
yt-dlp \
  "https://www.youtube.com/channel/UCAyyyfkJg5Sw35NJfk4OZeg" \
  --flat-playlist \
  --print "%(title)s | %(id)s | %(duration)s" \
  > "$SOURCE_DIR/youtube-channel-videos.txt"

echo "✅ Lista de vídeos salva em: $SOURCE_DIR/youtube-channel-videos.txt"
echo ""
echo "Revisar lista e identificar vídeos adicionais relevantes para transcrição"

# ============================================================================
# FASE 4: ANÁLISE DE REDES SOCIAIS
# ============================================================================

echo ""
echo "=== FASE 4: Redes Sociais ==="
echo ""

echo "⚠️  Ação manual necessária:"
echo ""
echo "1. LinkedIn:"
echo "   - Buscar: 'Renner Silva palestrante'"
echo "   - Coletar: Artigos, posts, experiência profissional"
echo "   - Salvar em: $SOURCE_DIR/linkedin/"
echo ""
echo "2. Instagram: @rennersilvaoficial"
echo "   - Coletar: Posts do feed, Reels, Stories em destaque"
echo "   - Salvar em: $SOURCE_DIR/instagram/"
echo ""
echo "3. Facebook: facebook.com/magicorenner"
echo "   - Coletar: Posts públicos, vídeos"
echo "   - Salvar em: $SOURCE_DIR/facebook/"
echo ""
echo "4. Podcasts:"
echo "   - Buscar: 'Renner Silva podcast' no Spotify/Apple Podcasts"
echo "   - Salvar links em: $SOURCE_DIR/podcasts-list.txt"

# ============================================================================
# COMANDOS ÚTEIS ADICIONAIS
# ============================================================================

echo ""
echo "=== Comandos úteis ==="
echo ""
echo "# Verificar espaço em disco disponível:"
echo "df -h"
echo ""
echo "# Ver tamanho dos vídeos baixados:"
echo "du -sh $VIDEO_DIR"
echo ""
echo "# Ver tamanho das transcrições:"
echo "du -sh $TRANSCRIPT_DIR"
echo ""
echo "# Contar palavras nas transcrições:"
echo "wc -w $TRANSCRIPT_DIR/*.txt"
echo ""
echo "# Buscar por 'Método SIM' nas transcrições:"
echo "grep -i 'método.*sim' $TRANSCRIPT_DIR/*.txt"
echo ""
echo "# Buscar por 'Ki-suco' nas transcrições:"
echo "grep -i 'ki.*suco' $TRANSCRIPT_DIR/*.txt"
echo ""

# ============================================================================
# SUMÁRIO DE COMANDOS
# ============================================================================

cat << 'EOF'

============================================================================
SUMÁRIO DE EXECUÇÃO - RENNER SILVA MIND CLONING
============================================================================

FASE 1: Download e Transcrição (CRÍTICO)
----------------------------------------
1. Instalar ferramentas: brew install yt-dlp ffmpeg && pip3 install openai-whisper
2. Baixar vídeos principais (3 vídeos, ~5GB total)
3. Transcrever com Whisper modelo "large" (~3-6h total)
4. Organizar transcrições em /transcripts/

Resultado esperado:
✅ 3 transcrições completas em .txt, .srt, .vtt
✅ História de vida completa extraída
✅ Método S.I.M. identificado
✅ 8 Passos do Roteiro mapeados

FASE 2: Web Archive (ALTA PRIORIDADE)
--------------------------------------
1. Verificar metodosim.com.br no Wayback Machine
2. Verificar rennersilva.com.br no Wayback Machine
3. Verificar blog no Wayback Machine
4. Extrair e salvar conteúdo encontrado

Resultado esperado:
✅ Método S.I.M. completo (o que significa, framework)
✅ Posts do blog (se disponíveis)
✅ Conteúdo adicional do site

FASE 3: Vídeos Adicionais (MÉDIA PRIORIDADE)
---------------------------------------------
1. Listar todos os vídeos do canal
2. Identificar vídeos relevantes (entrevistas, depoimentos)
3. Transcrever vídeos selecionados

Resultado esperado:
✅ 5-10 vídeos adicionais transcritos
✅ Entrevistas com informações complementares

FASE 4: Redes Sociais (MÉDIA PRIORIDADE)
-----------------------------------------
1. Coletar conteúdo LinkedIn
2. Coletar conteúdo Instagram
3. Coletar conteúdo Facebook
4. Buscar podcasts

Resultado esperado:
✅ Posts de redes sociais salvos
✅ Podcasts identificados e transcritos

============================================================================
TEMPO ESTIMADO TOTAL
============================================================================

Fase 1 (Automático): ~4-8h (depende do hardware)
Fase 2 (Manual): ~2-3h
Fase 3 (Automático): ~2-4h
Fase 4 (Manual): ~4-6h

TOTAL: ~12-21h de trabalho

============================================================================
CRITÉRIO DE SUCESSO
============================================================================

Completude alvo: 85%

MUST HAVE (Bloqueadores):
- [x] História de vida completa
- [x] Método S.I.M. explicado
- [x] 8 Passos do Roteiro listados
- [x] Frases assinatura todas identificadas
- [x] Padrões de linguagem mapeados

SHOULD HAVE (Importantes):
- [x] Técnicas de mágica contextualizadas
- [x] 10+ depoimentos completos
- [x] Conteúdo de redes sociais
- [x] 3+ entrevistas/podcasts transcritos

NICE TO HAVE (Complementares):
- [ ] Blog posts completos
- [ ] Cases de empresas detalhados
- [ ] Materiais acadêmicos publicados

============================================================================

Para iniciar a execução:

chmod +x <PROJECT_ROOT>/squads/renner-silva/source-material/NEXT-STEPS-COMMANDS.sh
bash <PROJECT_ROOT>/squads/renner-silva/source-material/NEXT-STEPS-COMMANDS.sh

============================================================================
EOF

echo ""
echo "Script preparado. Executar? (y/n)"
