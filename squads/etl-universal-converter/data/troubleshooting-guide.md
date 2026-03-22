# ETL Universal Converter — Troubleshooting Guide

Guia prático para resolver problemas comuns ao usar o squad ETL Universal Converter.

---

## 1. OCR Confidence Baixo (< 30%)

**Sintoma:**
- Imagem pulada durante batch processing
- Mensagem: `OCR confidence too low (X%), skipping image`
- Output markdown vazio ou inexistente

**Causa:**
- Imagem com resolução muito baixa (< 150 DPI)
- Texto desfocado ou com baixo contraste
- Texto manuscrito (handwritten) — OCR otimizado para texto impresso
- Imagem com muito ruído/artefatos de compressão

**Solução:**

1. **Aumentar DPI da imagem:**
```bash
# macOS (via sips)
sips -s dpiHeight 300 -s dpiWidth 300 input.png --out high-dpi.png

# ImageMagick
convert input.png -density 300 -quality 100 high-dpi.png
```

2. **Melhorar contraste:**
```bash
# ImageMagick
convert input.png -contrast -sharpen 0x1 improved.png
```

3. **Verificar se é texto manuscrito:**
- OCR padrão (Tesseract) não funciona bem com handwriting
- Use serviços especializados (Google Vision, Azure OCR) para manuscritos
- Considere transcrição manual se for texto crítico

4. **Processar novamente:**
```bash
/etl-universal-converter:convert input=improved.png output=result.md
```

---

## 2. Batch Travou / Interrupted

**Sintoma:**
- Batch processing parou no meio
- Estado salvo em `.etl-batch-state.json`
- Mensagem: `Batch interrupted, state saved`

**Causa:**
- Processo interrompido manualmente (Ctrl+C)
- Erro fatal em um dos arquivos
- Sistema ficou sem memória/disco

**Solução:**

### Retomar do ponto onde parou:
```bash
/etl-universal-converter:batch --resume
```

### Forçar restart completo (ignora estado anterior):
```bash
/etl-universal-converter:batch --force
```

### Arquivo de estado corrompido:
```bash
# Deletar estado e começar do zero
rm .etl-batch-state.json
/etl-universal-converter:batch input=./files/ output=./markdown/
```

### Verificar último arquivo processado:
```bash
cat .etl-batch-state.json | jq '.last_processed'
```

---

## 3. Encoding Issues

**Sintoma:**
- Arquivo .md com caracteres estranhos: `Ã§Ã£o`, `Ã©`, `â€™`
- Acentos quebrados no output
- Erro: `UnicodeDecodeError`

**Causa:**
- Arquivo original em encoding não-UTF8 (ISO-8859-1, Windows-1252, etc.)
- Encoding cascade falhou na detecção automática
- BOM (Byte Order Mark) não reconhecido

**Solução:**

### Verificar encoding original:
```bash
# macOS
file -I input.txt

# Alternativa com chardet (Python)
python3 -c "import chardet; print(chardet.detect(open('input.txt', 'rb').read()))"
```

### Converter para UTF-8 antes de processar:
```bash
# iconv (disponível no macOS)
iconv -f ISO-8859-1 -t UTF-8 input.txt > input-utf8.txt

# Python (mais robusto)
python3 -c "
with open('input.txt', 'rb') as f:
    content = f.read()
with open('input-utf8.txt', 'wb') as f:
    f.write(content.decode('iso-8859-1').encode('utf-8'))
"
```

### Entender encoding cascade:
O squad tenta detectar encoding nesta ordem:
1. UTF-8 (preferencial)
2. UTF-16 com BOM
3. ISO-8859-1 / Latin-1
4. Windows-1252 (CP1252)
5. ASCII

Se detecção falhar, force UTF-8 e reprocesse.

---

## 4. Tesseract Not Installed

**Sintoma:**
- Erro: `Tesseract not found in PATH`
- OCR não funciona em imagens
- Task `ocr-image-to-markdown` falha

**Causa:**
- Tesseract OCR não instalado no sistema
- PATH não configurado corretamente

**Solução:**

### Instalar no macOS:
```bash
brew install tesseract
```

### Verificar instalação:
```bash
tesseract --version
# Deve mostrar: tesseract 5.x.x
```

### Instalar idioma português (opcional):
```bash
brew install tesseract-lang
# OU baixar manualmente:
cd /opt/homebrew/share/tessdata
curl -O https://github.com/tesseract-ocr/tessdata/raw/main/por.traineddata
```

### Testar OCR:
```bash
tesseract input.png output -l por
cat output.txt
```

---

## 5. Python Packages Missing

**Sintoma:**
- Erro: `ModuleNotFoundError: No module named 'pandas'`
- Erro: `ImportError: cannot import name 'openpyxl'`
- Scripts Python falham ao executar

**Causa:**
- Dependências Python não instaladas
- Virtual environment não ativado

**Solução:**

### Rodar setup automatizado:
```bash
cd <PROJECT_ROOT>/squads/etl-universal-converter
chmod +x setup.sh
./setup.sh
```

### Instalação manual:
```bash
pip3 install pandas openpyxl chardet python-magic pillow pytesseract pdfplumber
```

### Usar virtual environment (recomendado):
```bash
# Criar venv
python3 -m venv .venv

# Ativar
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Processar arquivos
/etl-universal-converter:batch input=./files/

# Desativar ao terminar
deactivate
```

### Verificar pacotes instalados:
```bash
pip3 list | grep -E "pandas|openpyxl|chardet|pytesseract"
```

---

## 6. media-processor / book-to-markdown Not Found

**Sintoma:**
- Erro: `Squad 'media-processor' not found`
- Erro: `Skill 'book-to-markdown' not found`
- Task delegation falha

**Causa:**
- Squad ou skill não instalado no AIOS
- Path incorreto no config.yaml

**Solução:**

### Verificar squads instalados:
```bash
ls -1 <PROJECT_ROOT>/squads/
```

### Instalar media-processor (se ausente):
```bash
cd <PROJECT_ROOT>
# Criar squad ou copiar de backup
```

### Verificar skills instaladas:
```bash
ls -1 <PROJECT_ROOT>/skills/
```

### Instalar book-to-markdown skill (se ausente):
```bash
cd <PROJECT_ROOT>/.aios/skills
# Criar skill ou copiar de backup
```

### Verificar dependency mapping em config.yaml:
```yaml
dependencies:
  squads:
    - media-processor  # Path: squads/media-processor/
  skills:
    - book-to-markdown  # Path: skills/book-to-markdown/
```

---

## 7. File Too Large

**Sintoma:**
- Erro: `File exceeds maximum size limit`
- Processamento trava ou fica extremamente lento
- Sistema fica sem memória

**Causa:**
- Arquivo excede limite de tamanho por tipo
- Memória insuficiente para processar arquivo completo

**Limites por tipo:**
- CSV/TSV: 100 MB
- Excel: 50 MB
- PDF: 200 MB ou 500 páginas
- Imagem: 20 MB
- Texto: 50 MB

**Solução:**

### CSV/TSV — dividir em chunks:
```bash
# Dividir CSV grande (10000 linhas por arquivo)
split -l 10000 large.csv chunk_

# Processar cada chunk
for file in chunk_*; do
  /etl-universal-converter:convert input=$file output=${file}.md
done

# Combinar outputs
cat chunk_*.md > combined.md
```

### PDF — extrair páginas específicas:
```bash
# Extrair páginas 1-100 (macOS via Preview ou pdftk)
brew install pdftk-java
pdftk large.pdf cat 1-100 output first100.pdf

# Processar subset
/etl-universal-converter:convert input=first100.pdf output=first100.md
```

### Excel — converter para CSV primeiro:
```bash
# Usar LibreOffice headless
libreoffice --headless --convert-to csv large.xlsx

# Processar CSV (mais leve)
/etl-universal-converter:convert input=large.csv output=result.md
```

### Imagem — redimensionar:
```bash
# Reduzir resolução mantendo legibilidade
convert large.png -resize 50% smaller.png
/etl-universal-converter:convert input=smaller.png output=result.md
```

---

## 8. Encrypted / Password-Protected Files

**Sintoma:**
- Erro: `File is encrypted or password-protected`
- PDF não abre
- Excel pede senha

**Causa:**
- Arquivo protegido por senha
- Criptografia de nível de arquivo
- DRM (Digital Rights Management)

**Solução:**

### Não é possível processar diretamente
O squad **não suporta** arquivos criptografados. Você deve descriptografar primeiro.

### PDF com senha:
```bash
# Remover senha (macOS Preview)
# 1. Abrir PDF no Preview
# 2. Exportar como PDF sem senha

# OU usar qpdf (CLI)
brew install qpdf
qpdf --password=SENHA --decrypt input.pdf output.pdf
```

### Excel com senha:
```bash
# LibreOffice CLI
libreoffice --headless --convert-to xlsx:"Calc MS Excel 2007 XML" \
  --password SENHA encrypted.xlsx
```

### Após descriptografar:
```bash
/etl-universal-converter:convert input=decrypted.pdf output=result.md
```

---

## 9. Output .md Already Exists

**Sintoma:**
- Erro: `Output file already exists: result.md`
- Processamento cancelado
- Mensagem: `Use --overwrite to replace`

**Causa:**
- Arquivo markdown de output já existe
- Proteção contra sobrescrita acidental (comportamento padrão)

**Solução:**

### Usar flag --overwrite:
```bash
/etl-universal-converter:convert input=file.pdf output=result.md --overwrite
```

### Renomear output manualmente:
```bash
# Mover arquivo existente
mv result.md result-old.md

# Processar novamente
/etl-universal-converter:convert input=file.pdf output=result.md
```

### Usar timestamp no nome:
```bash
/etl-universal-converter:convert input=file.pdf output=result-$(date +%Y%m%d-%H%M%S).md
```

### Batch com auto-rename:
```bash
# Output folder com estrutura preservada (não sobrescreve)
/etl-universal-converter:batch input=./files/ output=./markdown/ --auto-rename
```

---

## 10. Spreadsheet with Mixed Delimiters

**Sintoma:**
- CSV parseado incorretamente
- Colunas bagunçadas no output
- Mensagem: `Auto-detection failed, assuming comma delimiter`

**Causa:**
- Arquivo usa delimitador não-padrão (`;`, `\t`, `|`)
- Mistura de delimitadores na mesma planilha
- Auto-detecção falhou (não encontrou padrão consistente)

**Solução:**

### Especificar delimitador manualmente:
```bash
# Ponto-e-vírgula (padrão Excel brasileiro)
/etl-universal-converter:convert input=file.csv output=result.md --delimiter=";"

# Tab
/etl-universal-converter:convert input=file.tsv output=result.md --delimiter="\t"

# Pipe
/etl-universal-converter:convert input=file.txt output=result.md --delimiter="|"
```

### Verificar delimitador do arquivo:
```bash
# Mostrar primeiras linhas
head -5 file.csv

# Contar ocorrências de delimitadores
head -1 file.csv | tr -cd ',' | wc -c  # Vírgulas
head -1 file.csv | tr -cd ';' | wc -c  # Ponto-e-vírgula
```

### Normalizar delimitador antes de processar:
```bash
# Converter ; para ,
sed 's/;/,/g' file.csv > file-normalized.csv

# Processar arquivo normalizado
/etl-universal-converter:convert input=file-normalized.csv output=result.md
```

### Planilha com delimitadores misturados (quebrada):
```bash
# Abrir no Excel/LibreOffice Calc
# Salvar como CSV UTF-8 com delimitador consistente
# Processar o novo CSV
```

---

## 11. Quality Score Baixo (< 7.0)

**Sintoma:**
- `*verify` retorna score abaixo de 7.0
- Mensagem: `CONDITIONAL` ou `NEEDS_REVIEW`
- Auto-retry não melhora o score

**Causa:**
- Conversão perdeu conteúdo significativo (tabelas truncadas, seções omitidas)
- Estrutura do source é complexa (multi-coluna, layouts não-lineares)
- OCR com qualidade insuficiente
- Source com formatos mistos (texto + tabelas + imagens)

**Solução:**

### Verificar qual dimensão está baixa:
```bash
*verify ~/docs/output.md
# Olhar o breakdown: Fidelity, Completeness, Structure, Metadata, Readability
```

### Fidelity baixa (< 7):
- Comparar source vs output manualmente nos trechos flagados
- Se OCR: melhorar imagem (DPI, contraste) e re-converter
- Se spreadsheet: verificar se truncamento é aceitável

### Completeness baixa (< 7):
- Verificar se seções/sheets/slides foram omitidas
- Re-converter com `--overwrite` após ajustar parâmetros
- Para planilhas grandes: considerar `--no-truncate`

### Structure baixa (< 7):
- Headings podem ter sido flatten — verificar hierarquia no source
- Tabelas com merge cells perdem dados — considerar conversão manual
- Listas aninhadas precisam de indentação consistente no source

### Forçar re-extração com threshold custom:
```bash
*verify ~/docs/output.md --threshold 6.0
```

---

## 12. Human Review Queue Vazia ou Corrompida

**Sintoma:**
- `*review` não encontra documentos para revisar
- Mensagem: `No documents in review queue`
- Queue file corrompido

**Causa:**
- Nenhum documento flagado com `NEEDS_REVIEW`
- Arquivo `.qa/review-queue.yaml` corrompido ou deletado
- Quality verification não foi executada antes

**Solução:**

### Verificar se QA foi executado:
```bash
# Procurar frontmatter com qa_status
grep -l "qa_status" ~/docs/*.md
```

### Re-executar QA batch:
```bash
*qa-batch ~/docs/
# Isso regenera a queue automaticamente
```

### Limpar queue corrompida:
```bash
rm ~/docs/.qa/review-queue.yaml
*qa-batch ~/docs/
```

---

## 13. Auto-Retry Não Melhora o Score

**Sintoma:**
- Score CONDITIONAL (5.0-6.9) persiste após 2 retries
- Documento movido para human review automaticamente
- Mensagem: `Max retries reached, queuing for human review`

**Causa:**
- Problema é **estrutural**, não de parâmetros (layout complexo, formato não-padrão)
- Source tem conteúdo que simplesmente não converte bem para markdown (diagramas, fluxogramas)
- OCR em imagem de qualidade irrecuperável

**Solução:**

### Aceitar via human review:
```bash
*review ~/docs/output.md
# Opção 1: Aprovar como está (se loss é aceitável)
# Opção 2: Editar manualmente os trechos problemáticos
```

### Converter parcialmente:
- Extrair as seções que convertem bem
- Complementar manualmente o que foi perdido
- Aprovar com nota explicando as limitações

### Ajustar expectativas por tipo:
- OCR: threshold ajustado para 6.0 (lossy by nature)
- Apresentações com muitos gráficos: espere score 6-7
- Planilhas simples: espere 8-9

---

## 14. Source File Não Encontrado Durante Verificação

**Sintoma:**
- `*verify` mostra WARNING: `Source file not found`
- Score baseado apenas em output (sem comparação)
- Mensagem: `Scoring metadata only — fidelity check skipped`

**Causa:**
- Arquivo original foi movido ou deletado após conversão
- `source_path` no frontmatter aponta para path antigo
- Batch processou arquivos em diretório temporário

**Solução:**

### Atualizar source_path no frontmatter:
Editar o arquivo `.md` e corrigir `source_path` para o caminho atual.

### Re-verificar:
```bash
*verify ~/docs/output.md
```

### Prevenir — manter originais:
O squad **nunca deleta** source files. Se foram movidos, mantenha a estrutura de diretórios estável até o QA completar.

---

## Dicas Gerais de Debug

### Verbose mode para mais detalhes:
```bash
/etl-universal-converter:convert input=file.pdf output=result.md --verbose
```

### Verificar logs de execução:
```bash
cat squads/etl-universal-converter/runtime/last-execution.log
```

### Testar com arquivo pequeno primeiro:
Sempre valide o processo com 1 arquivo antes de rodar batch completo.

### Checklist rápido:
- [ ] Tesseract instalado? (`tesseract --version`)
- [ ] Pacotes Python instalados? (`pip3 list`)
- [ ] Arquivo encoding UTF-8? (`file -I arquivo`)
- [ ] Arquivo não criptografado?
- [ ] Tamanho dentro do limite?
- [ ] Output path com permissão de escrita?

---

**Não encontrou sua solução?** Verifique logs completos em `runtime/`, abra issue no repositório ou consulte a documentação do squad em `squads/etl-universal-converter/README.md`.
