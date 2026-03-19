# Knowledge Base Index — Leandro Ladeira Mind Clone

> **Data:** 2026-03-09
> **Status:** Otimizado — Arquivos ACTIVE usados no DNA, demais movidos para archive/
> **Objetivo:** Facilitar manutenção e expansão da knowledge base

---

## RESUMO

| Métrica | Valor |
|---------|-------|
| **Total de arquivos .md** | 253 (10 na raiz + 243 em archive) |
| **Arquivos ACTIVE (usados no DNA)** | 8 |
| **Arquivos de documentação** | 2 (INDEX.md + OPTIMIZATION_REPORT.md) |
| **Arquivos ARCHIVED (não processados)** | 243 (inclui cópias dos 8 ACTIVE) |
| **Taxa de processamento** | 3.2% (8/251 arquivos de conteúdo) |

---

## ARQUIVOS ACTIVE (Usados no DNA Extraction)

Estes arquivos foram processados e estão citados em `data/dna/thinking_dna_raw.md`:

### Do curso "Venda Todo Santo Dia"

1. ✅ **AULA 17 - M.O.E.R.md**
   - Framework: M.O.E.R (Metrificar, Otimizar, Escalar, Resultados)
   - Status: ACTIVE — Citado 7x no thinking_dna_raw.md

2. ✅ **AULA 4 - 5 FASES DO PERPÉTUO.md**
   - Framework: 5 Fases do Perpétuo (Descoberta → Relacionamento → Conversão → Remarketing → Recuperação)
   - Status: ACTIVE — Citado 8x no thinking_dna_raw.md

3. ✅ **Aula 4 - Dinâmica da Venda do Perpétuo.md**
   - Framework: Sistema Operacional (Perpétuo + Lançamento)
   - Status: ACTIVE — Citado 16x no thinking_dna_raw.md (fonte mais citada)

4. ✅ **Aula 6 - Big Ideia.md**
   - Framework: Big Idea (Posicionamento de produto)
   - Status: ACTIVE — Citado 2x no thinking_dna_raw.md

5. ✅ **Aula Extra - Mandala da Criatividade Infinita.md**
   - Framework: Mandala da Criatividade (M.T.O — Momento, Tipo, Objetivo)
   - Status: ACTIVE — Citado 7x no thinking_dna_raw.md

6. ✅ **zAula Extra - Validação por Menor Esforço (VME).md**
   - Framework: VME (5 fases de validação)
   - Status: ACTIVE — Citado 7x no thinking_dna_raw.md

### Do curso "Stories 10x"

7. ✅ **Dispositivos de Engenharia Social - Stories 10x.md**
   - Framework: 38 Dispositivos de Engenharia Social
   - Status: ACTIVE — Citado 8x no thinking_dna_raw.md

8. ✅ **Material de Apoio - Stories 10x.md**
   - Framework: Stories 10X (4 tipos de sequências)
   - Status: ACTIVE — Citado 5x no thinking_dna_raw.md

---

## ARQUIVOS ARCHIVED (Não usados no DNA — Movidos para archive/)

Total de **243 arquivos** movidos para `data/knowledge-base/archive/`:

### Categorias

| Categoria | Quantidade | Destino |
|-----------|-----------|---------|
| ⭐ Venda Todo Santo Dia | 119 arquivos | `archive/venda-todo-santo-dia/` |
| Stories 10x | 34 arquivos | `archive/stories-10x/` |
| Stories 10x (AO VIVO) | 19 arquivos | `archive/stories-10x-ao-vivo/` |
| Transcrições YouTube | 56 arquivos | `archive/transcricoes-youtube/` |
| CPLs Lightcopy | 3 arquivos | `archive/cpls-lightcopy/` |
| Documentos | 11 arquivos | `archive/documentos/` |
| Outros | 1 arquivo | `archive/` (.transcription-state-dg.json, leandro-ladeira-batch2-delta-dna.md) |

**Status:** ARCHIVED — Disponíveis para processamento futuro, mas não usados no DNA v1.0

---

## ARQUIVOS PENDENTES (Para próximas iterações)

Conforme mencionado em `data/dna/README.md`, há **7 arquivos prioritários** para Fase 2:

1. ⏳ AULA 12 - ESTRATÉGIA NA PRÁTICA Parte 1.md
2. ⏳ Aula 4 - Cinco formas de recuperação.md
3. ⏳ Aula 12 - Copy vídeo de vendas - parte 1.md
4. ⏳ AULA 21 - FUNDAMENTOS DO GOOGLE ADS.md
5. ⏳ Aula 01 - A lógica das sequências.md
6. ⏳ Aula 25 - Estratégia de picos de venda.md
7. ⏳ AULA 16 - REMARKETING.md

**Localização:** Todos estão em `archive/venda-todo-santo-dia/`

---

## ESTRUTURA PÓS-OTIMIZAÇÃO

```
data/knowledge-base/
├── INDEX.md                                  ← Este arquivo
├── AULA 17 - M.O.E.R.md                     ← ACTIVE
├── AULA 4 - 5 FASES DO PERPÉTUO.md          ← ACTIVE
├── Aula 4 - Dinâmica da Venda do Perpétuo.md ← ACTIVE
├── Aula 6 - Big Ideia.md                    ← ACTIVE
├── Aula Extra - Mandala da Criatividade Infinita.md ← ACTIVE
├── zAula Extra - Validação por Menor Esforço (VME).md ← ACTIVE
├── Dispositivos de Engenharia Social - Stories 10x.md ← ACTIVE
├── Material de Apoio - Stories 10x.md       ← ACTIVE
└── archive/                                  ← ARCHIVED (245 arquivos)
    ├── venda-todo-santo-dia/
    ├── stories-10x/
    ├── stories-10x-ao-vivo/
    ├── transcricoes-youtube/
    ├── cpls-lightcopy/
    └── documentos/
```

---

## PRÓXIMOS PASSOS

### Fase 2 - Aprofundamento (7 arquivos)
- [ ] Mover 7 arquivos prioritários de `archive/` de volta para raiz
- [ ] Processar e adicionar ao DNA
- [ ] Atualizar este INDEX.md com novos ACTIVE

### Fase 3 - Voice DNA
- [ ] Processar transcrições de YouTube (55 arquivos em `archive/transcricoes-youtube/`)
- [ ] Extrair padrões linguísticos adicionais
- [ ] Sintetizar em `voice_dna.md` final

### Fase 4 - Agent Profile
- [ ] Criar `agents/leandro-ladeira.md`
- [ ] Definir comandos específicos
- [ ] Smoke test do agente

---

## CHANGELOG

### 2026-03-09 - Otimização da Knowledge Base
- ✅ Criado INDEX.md
- ✅ Identificados 8 arquivos ACTIVE
- ✅ Movidos 245 arquivos para archive/
- ✅ Removidos 6 arquivos .DS_Store
- ✅ Estrutura organizada por categoria

### 2026-03-07 - Fase 1 Completa
- ✅ Extraído Thinking DNA (8 frameworks, 15+ heurísticas)
- ✅ Extraído Voice DNA (80+ citações, 14 categorias)
- ✅ 8 arquivos processados (53% dos prioritários)

---

**Última atualização:** 2026-03-09 19:30
