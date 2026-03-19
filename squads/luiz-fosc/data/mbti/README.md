# MBTI Reference Data - Luiz Fosc Squad

Este diretório contém dados de referência curados sobre MBTI (Myers-Briggs Type Indicator), utilizados pelas tasks do squad luiz-fosc.

## Contexto

Luiz Fosc possui certificação MBTI pela Fellipelli (Step I e II) e aplica o framework em:
- Liderança e gestão de equipes
- Processos de contratação
- Vendas e negociação
- Relacionamentos (casamento, família)
- Desenvolvimento pessoal

**Filosofia central:** "Trate as pessoas como ELAS gostariam de ser tratadas" + "Estrutura > Talento"

## Estrutura de Arquivos

### Core References (Sempre carregar)

1. **type-profiles-overview.md** (7.9 KB)
   - Visão geral dos 16 tipos
   - Agrupados por temperamento (NT, NF, SJ, SP)
   - 1-page reference para identificação rápida

2. **cognitive-functions-reference.md** (9.7 KB)
   - As 8 funções cognitivas (Ni, Ne, Si, Se, Ti, Te, Fi, Fe)
   - Function stacks de todos os 16 tipos
   - Shadow functions e axis pairs

3. **polarities-summary.md** (16.3 KB)
   - As 4 dicotomias (E/I, S/N, T/F, J/P)
   - Definições, marcadores comportamentais, misconceptions
   - Exemplos práticos de Luiz Fosc (história do casamento J vs P)
   - Magic tricks aplicados a MBTI

### Specialized References (Carregar sob demanda)

4. **compatibility-matrix.md** (10.1 KB)
   - Matriz 16x16 de compatibilidade
   - Natural partners, complementary pairs, growth pairs
   - Detalhamento de pares comuns (INTJ+ENTP, INFJ+ENFP, etc.)
   - Princípios Fosc de compatibilidade

5. **career-map.md** (19.3 KB)
   - Guia completo de carreiras por tipo
   - Ambiente ideal, top carreiras, carreiras a evitar
   - Estilo de trabalho e potencial de liderança
   - Princípios Fosc de carreira

6. **personal-growth-framework.md** (17.4 KB)
   - Framework de desenvolvimento pessoal por tipo
   - Função inferior e grip experiences
   - Growth exercises específicos por tipo
   - Shadow integration e maturidade

7. **parenting-stages.md** (25.0 KB)
   - Guia de parenting por tipo de criança
   - Desenvolvimento por faixa etária (0-6, 7-12, 13-18)
   - Necessidades, atividades, fricção com pais
   - "What this child needs most"

8. **temperaments-and-strategies.md** (16.3 KB)
   - Sistema Keirsey (SP, SJ, NF, NT)
   - Communication style, leadership, stress response
   - Ideal environments por temperamento
   - Aplicações práticas (vendas, gestão, negociação)

9. **brazilian-statistics.md** (11.5 KB)
   - Distribuição de tipos no Brasil
   - Fatores culturais que afetam MBTI
   - Viés de teste no contexto brasileiro
   - Diferenças regionais e por gênero

### Sources Directory

**sources/personalities/**
- Diretório reservado para futuras adições
- Personalities específicas (políticos, celebridades, cases)
- Análises MBTI de figuras públicas

## Como Usar em Tasks

### Loading Strategy

**Para tasks gerais (identificação, coaching básico):**
```yaml
references:
  - type-profiles-overview.md
  - polarities-summary.md
  - cognitive-functions-reference.md
```

**Para assessment completo:**
```yaml
references:
  - type-profiles-overview.md
  - cognitive-functions-reference.md
  - polarities-summary.md
  - brazilian-statistics.md  # Se cliente brasileiro
```

**Para coaching de carreira:**
```yaml
references:
  - type-profiles-overview.md
  - career-map.md
  - personal-growth-framework.md
```

**Para coaching de relacionamentos:**
```yaml
references:
  - type-profiles-overview.md
  - compatibility-matrix.md
  - polarities-summary.md  # História do casamento J vs P
```

**Para parenting coaching:**
```yaml
references:
  - type-profiles-overview.md
  - parenting-stages.md
  - temperaments-and-strategies.md
```

**Para vendas/negociação:**
```yaml
references:
  - type-profiles-overview.md
  - temperaments-and-strategies.md  # Aplicações práticas
  - polarities-summary.md
```

## Princípios Fosc (em todos os arquivos)

### 1. "Trate as pessoas como ELAS gostariam de ser tratadas"
Não force seu estilo no outro. Adapte-se ao tipo do interlocutor.

### 2. "Estrutura > Talento"
Sistema compensa fraqueza natural. Não espere mudança mágica, crie estrutura.

### 3. Preferência ≠ Capacidade
Todos podem usar todos os lados, mas um é natural (baixo custo energético).

### 4. Maturidade = Acesso a Todas as 8 Funções
Desenvolvimento não muda tipo, expande repertório.

### 5. Contexto Cultural Importa
Tipo MBTI interage com cultura. Brasileiro ≠ Americano na expressão.

## Exemplos Fosc nos Arquivos

### História do Casamento (J vs P)
**Arquivo:** polarities-summary.md

Caso pessoal de Luiz sobre conviver com polaridade oposta:
- **J:** Quer planejar tudo com antecedência
- **P:** Quer manter opções abertas
- **Solução:** Sistema 60% planejado, 40% improvisado

### Magic Tricks Teaching
**Arquivo:** polarities-summary.md

Luiz usa truques de mágica em palestras MBTI:
- Para E: Truque interativo
- Para I: Truque contemplativo
- Para J: Reveal estruturado
- Para P: Plot twist inesperado

### Hiring Examples
**Arquivo:** polarities-summary.md

Diferença entre candidato S e N:
- S: "Tenho X anos de experiência, certificação Y"
- N: "Vejo potencial em fazer diferente baseado em padrão Z"

## Updates e Manutenção

**Version:** 1.0 (2026-03-09)
**Base:** 200+ assessments MBTI no Brasil (2018-2024)
**Regiões:** Principalmente Sudeste (SP, RJ) com casos no Sul e Nordeste

**Para atualizar:**
1. Nunca remova princípios Fosc
2. Adicione casos novos em "Fosc Examples"
3. Mantenha estrutura atual (facilita loading em tasks)
4. Brazilian-statistics.md deve ser atualizado anualmente

## Fontes

- MBTI Manual (Myers & Briggs Foundation)
- Gifts Differing (Isabel Myers)
- Psychological Types (Carl Jung)
- Please Understand Me I & II (David Keirsey)
- Was That Really Me? (Naomi Quenk)
- Do What You Are (Tieger & Barron-Tieger)
- Certificação Fellipelli Step I & II (Luiz Fosc)
- Filosofia "Estrutura > Talento" (Luiz Fosc proprietary)

---

**Curated by:** Luiz Fosc (MBTI Certified - Fellipelli)
**For:** AIOX Squad luiz-fosc tasks
**Last Updated:** 2026-03-09
