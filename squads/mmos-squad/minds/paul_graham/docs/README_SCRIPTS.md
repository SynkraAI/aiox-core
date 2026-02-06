# Scripts para Download e Análise dos Essays

## 📁 Arquivos Criados

### 1. `download_essays_full.py`
**Script principal para download completo dos essays**

**Características:**
- Baixa todos os 232 essays do paulgraham.com
- Salva em 3 formatos: HTML, Markdown e Texto puro
- Inclui sistema de logs e controle de erros
- Delay configurável entre downloads
- Confirmação de uso necessária

**Como usar:**
```bash
python3 download_essays_full.py
```

**Outputs criados:**
- `full_essays/html/` - Arquivos HTML originais
- `full_essays/markdown/` - Versões convertidas para MD
- `full_essays/text/` - Texto puro para análise
- `full_essays/INDEX.md` - Índice completo
- `full_essays/download_log.json` - Log detalhado

### 2. `analyze_essays.py`
**Script de análise cognitiva automática**

**Funcionalidades:**
- Análise de vocabulário signature
- Extração de padrões linguísticos
- Identificação de temas principais
- Análise de sentimento
- Mapeamento de valores/princípios
- Detecção de padrões cognitivos

**Como usar:**
```bash
python3 analyze_essays.py
```

**Outputs criados:**
- `full_essays/analysis/complete_analysis.json` - Dados completos
- `full_essays/analysis/summary_report.md` - Relatório resumido

### 3. `scrape_essays.py`
**Script original para captura de referências**

## 🔧 Instalação de Dependências

```bash
pip3 install requests beautifulsoup4 nltk
```

## 📋 Workflow Completo

### Passo 1: Download
```bash
cd /path/to/Paul\ Graham/data
python3 download_essays_full.py
```

### Passo 2: Análise
```bash
python3 analyze_essays.py
```

### Passo 3: Usar nos Prompts de Clonagem
Os dados gerados podem ser usados nos prompts numerados (01-19) para:
- Extrair citações específicas
- Identificar padrões cognitivos
- Mapear valores e princípios
- Criar system prompt final

## ⚠️ Considerações Importantes

### Uso Responsável
- Execute os scripts por sua própria responsabilidade
- Certifique-se de ter direito legal ao conteúdo
- Use apenas para fins acadêmicos/educacionais
- Respeite termos de uso do site original

### Performance
- Download completo leva ~15-20 minutos
- Análise completa leva ~5-10 minutos
- Total de ~200MB de arquivos gerados

### Estrutura Final
```
data/
├── essay_references/          # Referências (232 arquivos)
├── full_essays/              # Conteúdo completo
│   ├── html/                 # HTMLs originais
│   ├── markdown/             # Versões MD
│   ├── text/                 # Texto puro
│   └── analysis/             # Análises geradas
├── download_essays_full.py   # Script de download
├── analyze_essays.py         # Script de análise
└── README_SCRIPTS.md         # Esta documentação
```

## 🎯 Para Clonagem Cognitiva

### Dados Extraídos Úteis:
1. **Vocabulário Signature** - palavras características
2. **Padrões Frasais** - estruturas linguísticas típicas
3. **Temas Dominantes** - áreas de foco principal
4. **Valores Expressos** - princípios declarados
5. **Tom/Sentimento** - características emocionais
6. **Padrões Cognitivos** - como estrutura pensamentos

### Integração com Framework:
- Use os dados nos prompts 03-09 (extração e análise)
- Alimente os prompts 10-12 (síntese) com os insights
- Valide o prompt final (18) contra os padrões identificados

---

*Scripts criados para acelerar o processo de clonagem cognitiva do Paul Graham*