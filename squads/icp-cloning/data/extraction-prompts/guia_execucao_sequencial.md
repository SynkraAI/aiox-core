# 📖 GUIA DE EXECUÇÃO SEQUENCIAL - Prompts P0-P14

## 🎯 Objetivo

Este guia explica como executar os 15 prompts de extração (10 originais + 5 Decision Intelligence) NA ORDEM CORRETA para obter máxima qualidade.

**Tempo total estimado:** 6.5-7.5 horas
**Resultado:** 16 documentos ricos em dados sobre a persona (incluindo Decision Intelligence)

---

## ⚠️ AVISOS IMPORTANTES

### Antes de Começar:
1. ✅ Complete o `briefing_icp.md` em `01_entrada/`
2. ✅ Passe pela `pre_validacao.md` e confirme dados suficientes
3. ✅ Tenha todos os dados do briefing facilmente acessíveis (copiar/colar)
4. ✅ Reserve 4-5 horas ininterruptas (ou faça em 2-3 sessões)

### Durante a Execução:
- **NÃO PULE PROMPTS** - cada um depende dos anteriores
- **SALVE TODOS OS OUTPUTS** - você vai precisar deles nos próximos prompts
- **ORGANIZE ARQUIVOS** - nomeie consistentemente (P0_output_Marina.md, P1_output_Marina.md...)
- **REVISE OUTPUTS** - se algo não faz sentido, re-execute antes de prosseguir

---

## 📋 ORDEM DE EXECUÇÃO

### BLOCO 1: FUNDAÇÃO (1-1.5 horas)

Estabelece a base demográfica, financeira e psicológica.

#### **P0 - Demografia & Contexto Socioeconômico**
- **Tempo**: 20-30 min
- **Dependências**: Apenas briefing
- **Input**: Dados demográficos do briefing
- **Output**: Contexto socioeconômico completo, renda disponível estimada, população similar
- **Arquivo**: `P0_demografia_contexto.md`
- **Salvar como**: `P0_output_[nome].md`

#### **P0B - Realidade Financeira & Endividamento**
- **Tempo**: 25-35 min
- **Dependências**: P0
- **Input**: Briefing + output P0 (especialmente renda disponível)
- **Output**: Affordability real, timing de compra, psicologia financeira, dívidas
- **Arquivo**: `P0B_realidade_financeira.md`
- **Salvar como**: `P0B_output_[nome].md`
- **⚠️ CRÍTICO**: Este módulo define limitações reais de compra!

#### **P1 - Psicometria (Big Five + 30 Facetas)**
- **Tempo**: 45-60 min (O MAIS IMPORTANTE!)
- **Dependências**: P0, P0B
- **Input**: Briefing + P0 (contexto) + P0B (ansiedade financeira)
- **Output**: Big Five completo, 30 facetas, interações entre fatores, contradições
- **Arquivo**: `P1_psicometria_big_five.md`
- **Salvar como**: `P1_output_[nome].md`
- **⚠️ CRÍTICO**: Este é o DNA psicológico! Dedique tempo adequado.

**Checkpoint Bloco 1:**
- [ ] Tenho P0_output.md com dados demográficos ricos
- [ ] Tenho P0B_output.md com affordability calculado
- [ ] Tenho P1_output.md com Big Five completo e justificado
- [ ] Revise: Os dados fazem sentido juntos? Há coerência?

---

### BLOCO 2: EXPRESSÃO E VALORES (1.5-2 horas)

Como ela se expressa e o que valoriza.

#### **P2 - Assinatura Linguística & Amostras Comportamentais**
- **Tempo**: 40-50 min
- **Dependências**: P0, P1
- **Input**: Briefing + P0 (região, classe) + P1 (personalidade afeta linguagem)
- **Output**: 100-150 frases autênticas, padrões de linguagem, emojis, swipe file
- **Arquivo**: `P2_linguagem_assinatura.md`
- **Salvar como**: `P2_output_[nome].md`
- **⚠️ CRÍTICO**: Linguagem autêntica = clone realista!

#### **P3 - Valores & Trade-offs**
- **Tempo**: 30-40 min
- **Dependências**: P1
- **Input**: Briefing + P1 (personalidade correlaciona com valores)
- **Output**: 5-7 valores hierarquizados, trade-offs, conflitos, sistema de priorização
- **Arquivo**: `P3_valores_tradeoffs.md`
- **Salvar como**: `P3_output_[nome].md`
- **⚠️ IMPORTANTE**: Valores governam TODAS as decisões!

#### **P4 - Comunidade & Tribos**
- **Tempo**: 20-30 min
- **Dependências**: P0, P1, P3
- **Input**: Briefing + P0 (localização) + P1 (extroversão) + P3 (valores)
- **Output**: Tribos de pertencimento, grupos, influenciadores, pressões sociais
- **Arquivo**: `P4_comunidade_tribos.md`
- **Salvar como**: `P4_output_[nome].md`

**Checkpoint Bloco 2:**
- [ ] Tenho P2_output.md com 100+ frases autênticas
- [ ] Tenho P3_output.md com valores hierarquizados
- [ ] Tenho P4_output.md com tribos mapeadas
- [ ] Revise: A linguagem reflete a personalidade (P1)? Os valores fazem sentido?

---

### BLOCO 3: COMPORTAMENTO E DECISÃO (1.5-2 horas)

Como ela age, decide e reage.

#### **P5 - Neuropsico - Triggers & Design Comportamental**
- **Tempo**: 35-45 min
- **Dependências**: P1, P0B
- **Input**: Briefing + P1 (Neuroticismo) + P0B (ansiedade financeira)
- **Output**: 8 cadeias TSM, gatilhos emocionais, padrões de estresse, vieses cognitivos
- **Arquivo**: `P5_neuropsico_triggers.md`
- **Salvar como**: `P5_output_[nome].md`
- **⚠️ IMPORTANTE**: Define como ela REAGE emocionalmente!

#### **P6 - Hábitos Digitais & Jornada de Aprendizado**
- **Tempo**: 25-30 min
- **Dependências**: P0, P1, P4
- **Input**: Briefing + P0 (idade, classe) + P1 (Openness) + P4 (tribos online)
- **Output**: Dispositivos, plataformas, jornada 5 estágios, horários de pico
- **Arquivo**: `P6_habitos_digitais.md`
- **Salvar como**: `P6_output_[nome].md`

#### **P7 - Comportamento de Compra (5-Gate Model)**
- **Tempo**: 40-50 min
- **Dependências**: P0B, P1, P3, P5
- **Input**: Briefing + P0B (affordability) + P1 (personalidade) + P3 (valores) + P5 (vieses)
- **Output**: 5 Gates, critérios de decisão, gatilhos vs barreiras, timing
- **Arquivo**: `P7_comportamento_compra.md`
- **Salvar como**: `P7_output_[nome].md`
- **⚠️ CRÍTICO**: Define como ela COMPRA!

**Checkpoint Bloco 3:**
- [ ] Tenho P5_output.md com triggers mapeados
- [ ] Tenho P6_output.md com jornada digital
- [ ] Tenho P7_output.md com 5-Gate Model completo
- [ ] Revise: Comportamento de compra é coerente com finanças (P0B) e personalidade (P1)?

---

### BLOCO 4: PROFUNDIDADE E CONTEXTO (1-1.5 horas)

Adiciona camadas de profundidade narrativa e expectativas.

#### **P8 - Narrativas & Arquétipos**
- **Tempo**: 25-35 min
- **Dependências**: P1, P3
- **Input**: Briefing + P1 (personalidade) + P3 (valores) + histórico de vida
- **Output**: Top 3 arquétipos, jornada da heroína, narrativa pessoal, mitos
- **Arquivo**: `P8_narrativas_arquetipos.md`
- **Salvar como**: `P8_output_[nome].md`

#### **P9 - Expectativas, Sucesso & Satisfação**
- **Tempo**: 30-40 min
- **Dependências**: TODOS os anteriores (P0-P8)
- **Input**: Briefing + TODOS os outputs P0-P8
- **Output**: Expectativas 3 camadas, definição de sucesso, WOW moments, NPS drivers
- **Arquivo**: `P9_expectativas_sucesso.md`
- **Salvar como**: `P9_output_[nome].md`
- **⚠️ ÚLTIMO PROMPT DE EXTRAÇÃO!**

**Checkpoint Final Bloco 4:**
- [ ] Tenho P8_output.md com arquétipos e narrativas
- [ ] Tenho P9_output.md com expectativas completas
- [ ] TENHO TODOS OS 11 OUTPUTS (P0, P0B, P1-P9)
- [ ] Revise geral: Tudo faz sentido? Há coerência entre os módulos?

---

### BLOCO 5: DECISION INTELLIGENCE (2-2.5 horas) **NOVO!**

Mapeia como a persona REALMENTE decide e age (não como deveria).

#### **P10 - Decision Context Mapping**
- **Tempo**: 35-45 min
- **Dependências**: P0-P9 (especialmente P0B, P1, P3, P5, P7)
- **Input**: TODOS os outputs P0-P9
- **Output**: Inventário de decisões, fatores contextuais, mudança de modo decisório, decision budget, contextos de compra
- **Arquivo**: `P10_decision_context_mapping.md`
- **Salvar como**: `P10_output_[nome].md`
- **⚠️ PRIMEIRO PROMPT DI**: Mapeia QUANDO e COMO contexto afeta decisões

#### **P11 - Action Triggers**
- **Tempo**: 40-50 min
- **Dependências**: P0-P10
- **Input**: P0B (affordability) + P1 (personalidade) + P3 (valores) + P5 (triggers) + P7 (compra) + P10 (contexto)
- **Output**: Anatomia da procrastinação, gatilhos racionais/emocionais/sociais/temporais, combinações poderosas, limiares "bom o suficiente", permissões, mecanismos de compromisso, quebra-procrastinação
- **Arquivo**: `P11_action_triggers.md`
- **Salvar como**: `P11_output_[nome].md`
- **⚠️ CRÍTICO PARA CONVERSÃO**: O que MOVE para ação!

#### **P12 - Objection & Friction Map**
- **Tempo**: 35-45 min
- **Dependências**: P0-P11
- **Input**: P0B (financeiro) + P1 (personalidade) + P3 (valores) + P5 (medos) + P7 (barreiras) + P12_humanizacao (sistema imunológico)
- **Output**: Hierarquia de objeções (primárias/ocultas/dealbreakers), fricções cognitivas/emocionais/práticas, cadeia de objeções, paralisia decisória, arrependimento, matriz de tratamento
- **Arquivo**: `P12_objection_friction_map.md`
- **Salvar como**: `P12_output_[nome].md`
- **⚠️ CRÍTICO PARA CONVERSÃO**: O que BLOQUEIA decisão!

#### **P13 - Decision Heuristics**
- **Tempo**: 40-50 min
- **Dependências**: P0-P12
- **Input**: TODOS os anteriores (especialmente P1 para vieses, P3 para valores, P5 para vieses cognitivos)
- **Output**: Estilo decisório (System 1/2, Satisficer/Maximizer), heurísticas clássicas (disponibilidade, representatividade, ancoragem, afeto), regras IF-THEN automáticas, top 5 vieses, pseudocódigo decisório, atalhos mentais personalizados
- **Arquivo**: `P13_decision_heuristics.md`
- **Salvar como**: `P13_output_[nome].md`
- **⚠️ O CÓDIGO DECISÓRIO**: Como REALMENTE decide (não idealmente)

#### **P14 - Outcome Learning**
- **Tempo**: 35-45 min
- **Dependências**: P0-P13 + Memórias Episódicas
- **Input**: TODOS os anteriores + memórias episódicas (aprendizados formativos)
- **Output**: Padrões de atribuição (sucesso/fracasso), processamento de feedback, atualização de crenças, calibração de confiança, consolidação de aprendizado, evolução adaptativa, minimização de arrependimento
- **Arquivo**: `P14_outcome_learning.md`
- **Salvar como**: `P14_output_[nome].md`
- **⚠️ ÚLTIMO PROMPT DI**: Como APRENDE com resultados

**Checkpoint Final Bloco 5 (Decision Intelligence):**
- [ ] Tenho P10_output.md (contextos decisórios)
- [ ] Tenho P11_output.md (gatilhos de ação)
- [ ] Tenho P12_output.md (objeções e fricções)
- [ ] Tenho P13_output.md (heurísticas e vieses)
- [ ] Tenho P14_output.md (padrões de aprendizado)
- [ ] TENHO TODOS OS 16 OUTPUTS (P0, P0B, P1-P9, P10-P14)
- [ ] Revise: Os padrões decisórios são coerentes com personalidade e valores?

**Por que Decision Intelligence é essencial:**
- ✅ Transforma clone de "persona que tem preferências" em "pessoa que DECIDE e AGE"
- ✅ Identifica gatilhos específicos de ação (não só interesses)
- ✅ Mapeia objeções reais (não só superficiais)
- ✅ Cria modelo preditivo de comportamento de compra
- ✅ Gera insights acionáveis para copy e conversão

---

## 🔍 VALIDAÇÃO COMPLETA DE QUALIDADE

Antes de prosseguir para Fase 3 (Processamento SYNAPSE), valide:

### Checklist de Completude:
- [ ] **P0**: Demografia completa com população similar estimada
- [ ] **P0B**: Renda disponível REAL calculada, não apenas teórica
- [ ] **P1**: Big Five com 30 facetas, todos justificados
- [ ] **P2**: Mínimo 100 frases autênticas geradas
- [ ] **P3**: 5-7 valores hierarquizados com trade-offs
- [ ] **P4**: 3-5 tribos mapeadas
- [ ] **P5**: 8 cadeias TSM completas
- [ ] **P6**: Jornada de 5 estágios detalhada
- [ ] **P7**: 5 Gates com critérios de passagem/rejeição
- [ ] **P8**: Top 3 arquétipos identificados
- [ ] **P9**: Expectativas em 3 camadas
- [ ] **P10**: Inventário de 30+ decisões + matriz contextual
- [ ] **P11**: 5-7 gatilhos por tipo (racional/emocional/social/temporal)
- [ ] **P12**: Hierarquia completa de objeções (primárias/ocultas/dealbreakers)
- [ ] **P13**: Pseudocódigo decisório + Top 5 vieses
- [ ] **P14**: Padrões de atribuição + calibração de confiança

### Checklist de Coerência:
- [ ] Personalidade (P1) é coerente com linguagem (P2)?
- [ ] Valores (P3) são coerentes com decisões de compra (P7)?
- [ ] Affordability (P0B) é realista com renda (P0)?
- [ ] Triggers emocionais (P5) refletem Neuroticismo (P1)?
- [ ] Comportamento digital (P6) faz sentido para idade/classe (P0)?
- [ ] Narrativas (P8) explicam valores (P3) e medos (P1)?
- [ ] Expectativas (P9) são compatíveis com realidade financeira (P0B)?

### Checklist de Especificidade:
- [ ] Usei NÚMEROS específicos (não "aproximadamente")?
- [ ] Dei EXEMPLOS concretos (não generalidades)?
- [ ] Citei FRASES reais que ela diria?
- [ ] Identifiquei PADRÕES específicos (não "às vezes faz X")?

**Se TODOS os checkboxes = ✅, PROSSIGA!**

**Se ALGUM = ❌, volte e refine antes de prosseguir!**

---

## 📁 ORGANIZAÇÃO DOS ARQUIVOS

Organize seus outputs assim:

```
meu_projeto_clone/
├── briefing_icp_preenchido.md
├── outputs_extracao/
│   ├── P0_output_[nome].md
│   ├── P0B_output_[nome].md
│   ├── P1_output_[nome].md
│   ├── P2_output_[nome].md
│   ├── P3_output_[nome].md
│   ├── P4_output_[nome].md
│   ├── P5_output_[nome].md
│   ├── P6_output_[nome].md
│   ├── P7_output_[nome].md
│   ├── P8_output_[nome].md
│   ├── P9_output_[nome].md
│   ├── P10_output_[nome].md  ← Decision Intelligence
│   ├── P11_output_[nome].md  ← Decision Intelligence
│   ├── P12_output_[nome].md  ← Decision Intelligence
│   ├── P13_output_[nome].md  ← Decision Intelligence
│   └── P14_output_[nome].md  ← Decision Intelligence
└── (próximas fases virão aqui)
```

---

## 💡 DICAS PARA EXECUÇÃO EFICIENTE

### Estratégia de Sessões:

**Opção 1 - Tudo de uma vez (6.5-7.5 horas)**
- Melhor para: Manter contexto fresco e coerência máxima
- Reserve: Dia completo ou dois períodos (manhã + tarde)
- Faça: Pausas de 10-15min a cada 2-3 prompts

**Opção 2 - Dividir em 2 sessões (RECOMENDADO)**
- Sessão 1 (4h): P0 → P0B → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 (Base completa)
- Sessão 2 (2.5h): P10 → P11 → P12 → P13 → P14 (Decision Intelligence)
- Intervalo entre sessões: Máximo 24h
- Vantagem: DI usa TODA a base já consolidada

**Opção 3 - Dividir em 3 sessões**
- Sessão 1 (2.5h): P0 → P0B → P1 → P2 → P3 (Fundação + Expressão)
- Sessão 2 (2h): P4 → P5 → P6 → P7 → P8 → P9 (Social + Decisão + Expectativas)
- Sessão 3 (2.5h): P10 → P11 → P12 → P13 → P14 (Decision Intelligence completo)

**Opção 4 - Dividir em 4 sessões**
- Sessão 1 (1.5h): P0 → P0B → P1 (Base psicológica)
- Sessão 2 (2.5h): P2 → P3 → P4 → P5 → P6 (Expressão + Social)
- Sessão 3 (1.5h): P7 → P8 → P9 (Decisão + Narrativas)
- Sessão 4 (2.5h): P10 → P11 → P12 → P13 → P14 (DI completo)

### Otimizando Tempo:

1. **Prepare dados antes**: Tenha briefing em arquivo de texto para copiar rápido
2. **Use templates**: Cada prompt já tem estrutura, só preencher
3. **Não edite outputs**: Aceite o que a IA gerar, refine só se crítico
4. **Salve incrementalmente**: Não espere terminar tudo para salvar

### Se Algo Der Errado:

**Output muito genérico:**
- Adicione mais contexto específico do briefing
- Peça para "ser mais específico e dar exemplos concretos"

**Output incoerente:**
- Revise o input - pode ter contradição no briefing
- Re-execute o prompt com dados corrigidos

**Output incompleto:**
- Peça para "completar a seção X que ficou faltando"
- Ou re-execute o prompt inteiro

---

## 🎉 PARABÉNS POR COMPLETAR A FASE 2!

Ao terminar todos os 16 prompts (11 originais + 5 Decision Intelligence), você terá:

✅ 15.000-20.000 palavras de análise profunda
✅ Persona mapeada em 16 dimensões
✅ Base psicológica + comportamental completa
✅ **Modelo preditivo decisório** (Decision Intelligence)
✅ Insights acionáveis para copy e conversão
✅ Base sólida para criar clone 100% funcional com capacidades decisórias

**Próximo passo**: Vá para `03_processamento_synapse/` para integrar tudo (incluindo consolidação DI)!

---

## 📞 SUPPORT

**Problemas comuns**:
- IA se recusa a gerar? → Simplifique o prompt, remova jargão técnico
- Output muito curto? → Peça para "expandir com mais detalhes e exemplos"
- Não entendeu o que fazer? → Releia instruções do prompt específico

**Lembre-se**: Qualidade > Velocidade. Vale mais gastar 6 horas e ter outputs ricos do que 3 horas e ter dados rasos.
