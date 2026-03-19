# Ingerir Conteudo Pilar

name: ingest-pillar
description: Receber conteudo longo (URL YouTube, texto, arquivo) e gerar transcricao limpa e estruturada para atomizacao
elicit: true

## INPUTS

- **Fonte do conteudo:** URL YouTube, texto colado, ou arquivo de audio/video (obrigatorio)
- **Tipo de fonte:** youtube | texto | arquivo (obrigatorio)
- **Tema central:** assunto principal do conteudo (opcional — inferir da transcricao se nao fornecido)
- **Publico:** avatar especifico (opcional — perguntar depois se nao fornecido)

## STEPS

### Etapa 1: Identificar Fonte

1. Perguntar ao usuario:
   ```
   Qual e a fonte do conteudo pilar?
   1. URL do YouTube
   2. Colar texto/transcricao
   3. Arquivo (audio/video/texto)
   ```
2. Se YouTube URL → ir para Etapa 2A
3. Se texto colado → ir para Etapa 2B
4. Se arquivo → ir para Etapa 2C

### Etapa 2A: YouTube URL

5. Receber URL do YouTube
6. **PRIORIDADE 1 — Transcricao nativa do YouTube:**
   - Acessar a transcricao nativa do video (disponivel em "Mais" > "Transcrição" no YouTube)
   - Esta transcricao e PUBLICA e mais precisa que legendas auto-geradas
   - Usar a transcricao nativa como fonte primaria
7. **PRIORIDADE 2 — yt-text (se transcricao nativa nao disponivel):**
   - Executar script yt-text para extrair legendas e formatar via Gemini:
   ```bash
   bash infrastructure/services/yt-text/scripts/yt-text.sh "URL"
   ```
   - O script extrai legendas nativas, formata, traduz se necessario, gera resumo
   - Output em `outputs/videos/{slug}/transcricao.md`
8. **PRIORIDADE 3 — Whisper API (ultimo recurso):**
   - Executar script de transcricao via audio:
   ```bash
   ./scripts/transcribe.sh "URL" transcricao-pilar.txt
   ```
   - Baixa audio via yt-dlp → Whisper API → transcricao
   - Divide em partes de 10 min se audio > 25MB
9. Se video > 2 horas → avisar que sera processado em partes (automatico)
10. **OBRIGATORIO: Salvar transcricao completa no output final** como artefato permanente
11. Ler o arquivo de transcricao gerado
12. Ir para Etapa 3

**Pre-requisitos (documentados no README):**
- yt-dlp instalado (`brew install yt-dlp`)
- ffmpeg instalado (`brew install ffmpeg`) — para videos longos
- OPENAI_API_KEY ou GEMINI_API_KEY configurada no ambiente

### Etapa 2B: Texto Colado

9. Receber texto completo do usuario
10. Identificar se e transcricao bruta ou texto editado
11. Ir para Etapa 3

### Etapa 2C: Arquivo

12. Receber caminho do arquivo
13. Se audio/video → enviar para Whisper API
14. Se texto → ler conteudo
15. Ir para Etapa 3

### Etapa 3: Limpeza da Transcricao

16. Remover muletas verbais ("ne", "tipo", "entao", "ah", "eh")
17. Remover repeticoes e gaguejos
18. Corrigir pontuacao e paragrafacao
19. Manter o tom e vocabulario original do autor
20. NAO reescrever — apenas limpar para legibilidade

### Etapa 4: Estruturacao

21. Dividir transcricao em blocos tematicos (por assunto abordado)
22. Dar titulo curto a cada bloco
23. Marcar timestamps aproximados de cada bloco (se disponivel)
24. Identificar tema central e subtemas
25. Calcular duracao total e extensao (palavras)

### Etapa 5: Entrega

26. Apresentar ao usuario:
    - Resumo do conteudo (3-5 linhas)
    - Tema central identificado
    - Lista de blocos tematicos com titulos
    - Duracao/extensao total
    - Perguntar: "1. Confirmar e seguir para atomizacao, 2. Ajustar blocos, 3. Refazer limpeza"

## VETO CONDITIONS

- Se URL do YouTube e invalida ou video nao existe → NAO executar, pedir URL valida
- Se conteudo tem menos de 5 minutos (ou < 500 palavras) → avisar que pode gerar poucos atomos, perguntar se quer continuar
- Se transcricao Whisper tem qualidade muito baixa (texto incoerente) → avisar e oferecer opcao de colar transcricao manual
- Se conteudo nao e do proprio usuario (conteudo de terceiros sem autorizacao) → avisar sobre uso etico
- Se texto colado e copia de livro/curso de terceiros → VETO, nao processar conteudo nao original

## OUTPUT EXAMPLE

```
INGESTAO DE CONTEUDO PILAR
Fonte: YouTube — https://youtube.com/watch?v=xyz
Duracao: 47 minutos
Palavras: ~6.200
Tema central: Posicionamento de marca como arma de conversao

BLOCOS TEMATICOS:
1. [00:00-05:30] Introducao — Por que 95% dos empreendedores sao invisiveis
2. [05:30-14:20] O erro do conteudo generico — postar mais nao e vender mais
3. [14:20-22:10] Case: cliente de 3k para 47k em 60 dias
4. [22:10-31:00] Framework de posicionamento em 3 pilares
5. [31:00-38:45] Como precificar sem medo — crenca de preco baixo
6. [38:45-44:00] Consistencia com posicionamento vs barulho
7. [44:00-47:00] Encerramento — proximo passo e CTA

STATUS: Transcricao limpa e estruturada. Pronta para atomizacao.
Confirmar e seguir para atomizacao? (1. Sim, 2. Ajustar blocos, 3. Refazer)
```

## COMPLETION CRITERIA

- Fonte identificada e conteudo obtido
- Transcricao limpa (sem muletas, repeticoes, gaguejos)
- Conteudo estruturado em blocos tematicos com titulos
- Tema central e subtemas identificados
- Duracao/extensao calculada
- Usuario confirmou qualidade da transcricao
- Output pronto para ser input do atomize-content

## REFERENCES

- Whisper API (OpenAI) para transcricao de audio/video
- data/regras-inviolaveis.md — para manter tom na limpeza
- data/cliches-proibidos.md — para identificar muletas a remover
