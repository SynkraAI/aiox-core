---
project: tocks-v4-fantastic
created: 2026-05-06
updated: 2026-05-06 (post user clarification)
created_by: orion (research agent)
status: RESOLVED — user clarified Skara = CNPJ antigo Tocks
parent: ../../../assets/MANIFEST.md
---

# Skara: Integrada ou Separada — RESOLVED

**Decision:** **INTEGRATED LEGACY** — Skara é o CNPJ antigo da Tocks Custom. Não é sub-brand, não é sister company. É a Tocks de antes do rebrand/CNPJ atual.

**Confidence:** HIGH (confirmed by user 06/Mai)

## TL;DR (versão final)

Skara é a **Tocks de antes**. O CNPJ migrou pra "Tocks Custom" (CNPJ atual visível em `master-drive/Dados de acesso/Documentos Tocks/Novo 2025 - 05/CARTÃO CNPJ - Tocks Indústria e Comércio.pdf`). Os assets na pasta `Identidade Visual/Skara/` e `Fotos/Opções de acabamento Skara/` são:

- **Legacy histórico** (logos antigos, papelaria antiga) → não usar em produto novo
- **Catálogo de acabamentos** (10 madeiras + 16 tecidos) → ESTES SÃO os acabamentos oficiais Tocks Custom hoje (confirmado: páginas de produto Vértice/Elipse listam exatamente os mesmos 10 madeiras + 16 códigos tecidos)

## Reverter conclusão anterior

A análise inicial recomendava SEPARATE site (skara.com.br dedicado). **Estava errada** porque assumia Skara era sub-brand viva. Ao saber que é CNPJ antigo:

- **Não precisa** site separado
- **Não precisa** stub `/skara` no tocks-website
- **Não precisa** registrar domínios skara.com.br
- **Não precisa** brand book Skara dedicado

## Evidence (consolidada, pós-clarificação)

1. **Catálogo idêntico cross-validado:** as páginas de produto reais em tockscustom.com.br/linha-original/mesa-de-bilhar-{vertice,elipse} listam exatamente os mesmos:
   - 10 madeiras (Carvalho Branco Linheiro, Ébano Linheiro, Freijó, Goiabão Escuro, Itaúba, Wengue, Canelão, Marupá, Cerejeira, Angelin)
   - 16 códigos de tecidos (102, 10391, 1431, 1459, 14891, 1549, 191801, 21223, 24724, 2699, 26921, 2759, 284, 3001, 309, 310)

   ⇒ "Opções de acabamento Skara" no master library = catálogo oficial Tocks Custom hoje. Skara nunca foi outra marca; foi nome antigo.

2. **CNPJ atual visível** em `Dados de acesso/Documentos Tocks/Novo 2025 - 05/CARTÃO CNPJ - Tocks Indústria e Comércio.pdf` confirma rebrand documental.

3. **User confirmation 06/Mai 12h:** *"1 era o cnpj antigo da tocks"*.

## Implications pro v4-fantastic

### Catálogo de acabamentos = Tocks Custom canon

Os PNGs em `master-drive/Fotos/Opções de acabamento Skara/Madeiras/` e `Tecidos/` SÃO o sample-deck oficial Tocks. Devem alimentar:

- **Páginas de produto** v4 (Vértice, Elipse, Ark, Curve, todas mesas) — exibir grid de acabamentos disponíveis
- **Configurador interativo** (futuro): user escolhe madeira + tecido → preview compositivo
- **Mesa de detalhe de acabamento** em qualquer thesis quando precisar mostrar fineza material

Path canônico (sem renomear "Skara" — preservar provenance histórico):
- `master-drive/Fotos/Opções de acabamento Skara/Madeiras/Itaúba.png` etc.

### Logos Skara = arquivar

Os 4 SVGs `Logo{1,2}-{Azul,Branca}-SKARA.svg` são histórico. **Não usar** em produto novo. Manter no master library como peça de história da marca apenas.

### Papelaria Skara = arquivar

Os 3 DOCX `papel timbrado skara`, `ordem de compra skara`, `timbrado-proposta-skara` são versões antigas. Os DOCX correspondentes NA PASTA `Identidade Visual/Tocks/Documentos - Papel Timbrado/` (`Ordem de compra - TOCKS.docx`, `Papel Timbrado - Recibo - TOCKS.docx`, `Proposta - TOCKS.docx`) são as **versões atuais Tocks Custom**.

### Skara em copy/storytelling

Skara pode (mas não precisa) aparecer em copy editorial Tocks v4 como **história da marca** ("Antes Skara, hoje Tocks Custom — três décadas no atelier de Itajaí…"), se isso ajudar storytelling. Decisão criativa do squad por thesis.

## Implementation path (revisado)

**Imediato (30 min):**
1. ✅ Atualizar este doc (feito)
2. ✅ Atualizar MANIFEST.md → seção Skara reescrita
3. Promover `Opções de acabamento Skara/` no MANIFEST como "**Catálogo oficial Tocks Custom**" (renomeação semântica, files ficam onde estão pra preservar provenance)
4. Apagar do código qualquer referência a "stub `/skara`" ou "registrar skara.com.br" — não foi feito, mas anotado no log anterior

**Médio-prazo (próximas iterações v4):**
5. Considerar `<FinishesCatalog>` componente que carrega os 10 madeiras + 16 tecidos como dado canônico
6. Página de produto v4 mostra "Acabamentos" expansível com grid PNG real

## Open questions resolvidas / remanescentes

- ✅ **Q1 (skara=quê):** RESOLVIDO — CNPJ antigo Tocks
- ✅ **Q2 (catálogo transversal):** SIM — confirmado via cross-validation tcdn.com.br
- ⚪ **Q3 (existe site Skara antigo?):** não importa mais — se existia, foi descontinuado no rebrand
- ⚪ **Q4 (volume relativo):** N/A — não há marca separada
- ⚪ **Q5 (cliente B2B vs DTC):** Tocks Custom é DTC-luxo (página de produto com preço, parcelamento, "compre" → contato concierge), confirmado no site

## Riscos remanescentes

- **Risco baixo — confusão histórica:** se houver clientes antigos com contrato em nome de Skara, manter rastreabilidade legal. Mitigação: dados de acesso/documentos legacy preservados na master library.
- **Risco baixo — branding contamination:** se Tocks Custom ainda é confundido com Skara em busca/SEO, considerar redirect 301 de skara.com.br → tockscustom.com.br se domínio ainda for ativo. Não-bloqueador de v4.

---

**Status final:** Skara=integrated legacy. Não há decisão pendente. v4-fantastic pode prosseguir sem se preocupar com Skara.
