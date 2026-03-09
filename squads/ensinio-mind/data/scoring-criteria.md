# Scoring Criteria - WhatsApp Prospector Ensinio

> v2.1 — Enriquecido com ICPs, Red Flags e Sales Intelligence do ensinio-mind v1.1
> Source of truth: `squads/ensinio-mind/data/` (ICPs, red flags, arguments, sales playbook)

## Escala de Temperatura (1-10)

### Score 9-10: HOT - Necessidade explícita
- Menciona diretamente que precisa de área de membros/LMS
- Pergunta sobre plataformas de curso
- Menciona dor com plataforma atual (Hotmart, Memberkit, Cademi)
- Busca solução de checkout/pagamento integrado
- Quer agente de IA para vendas
- Menciona migração de plataforma
- **ICP Match:** Faturamento R$20-100k/mês, audiência 10-50k, nicho top 5
- **Ação:** Prioridade máxima para contato

### Score 7-8: WARM - Fit forte
- Tem curso/conteúdo online e fala sobre isso
- Menciona produtos digitais (mentorias, cursos, ebooks)
- Fala sobre comunidade para alunos
- Menciona gamificação ou retenção
- Tem negócio educacional claro
- **ICP Match:** Pelo menos 2 critérios do perfil comportamental
- **Ação:** Contatar em até 48h

### Score 5-6: MODERATE - Fit parcial
- Fala sobre negócio que PODERIA usar LMS
- Menciona conteúdo mas não necessariamente online
- Tem audiência mas sem produto digital ainda
- Fala sobre automação de vendas genericamente
- **ICP Match:** 1 critério do perfil comportamental
- **Ação:** Contatar na semana

### Score 3-4: COOL - Fit fraco
- Menções tangenciais a educação/conteúdo
- Negócio físico que poderia ter componente digital
- Fala sobre marketing mas sem produto educacional
- **Ação:** Contatar se sobrar capacidade

### Score 1-2: COLD - Sem fit
- Nenhuma menção a educação, cursos ou conteúdo
- Negócio completamente fora do escopo
- Apenas interações sociais no grupo
- **Ação:** Não contatar

## Red Flags — Desqualificação (ensinio-mind v1.1)

### BLOQUEADORES (Score automático = 0, excluir do pipeline)
| Red Flag | Sinal no Chat | Ação |
|----------|--------------|------|
| Produto físico | Fala sobre vender roupas, canecas, produtos tangíveis | Desqualificar |
| Apenas ebook | Quer "vitrine" para PDF/ebook simples | Desqualificar |
| Quer ser afiliado | Quer revender, não criar conteúdo | Desqualificar |
| "Gerenciem tudo pra mim" | Quer terceirização total | Desqualificar |

### ALERTAS (Penalidade de score, não exclui)
| Red Flag | Sinal no Chat | Penalidade |
|----------|--------------|-----------|
| Zero faturamento | Começando do zero absoluto | -2 |
| "Taxa zero" obsessivo | Insiste em custo zero | -2 |
| Checkout internacional | Precisa vender em USD/EUR | -1 (limitação atual) |
| Podcast/evento ao vivo | Precisa de feature inexistente | -1 (limitação atual) |

## ICP Match Score — Critérios do ensinio-mind v1.1

### Perfil Demográfico (bônus se match)
| Critério | Match Signal no Chat | Bônus |
|----------|---------------------|-------|
| Idade 26-45 | Inferir por contexto (profissional maduro) | +0.5 |
| Grandes centros (SP, RJ, BSB) | DDD 11, 21, 61 ou menção de cidade | +0.5 |

### Perfil Comportamental (bônus se match)
| Critério | Match Signal no Chat | Bônus |
|----------|---------------------|-------|
| Faturamento R$20-100k/mês | Menciona faturamento, equipe, escala | +1 |
| Audiência 10-50k | Menciona seguidores, canal, base | +1 |
| Usa 2+ plataformas | Menciona Hotmart + outra tool | +1 |
| Nichos top 5 | Negócios, Educação, Saúde, Finanças, Tech | +0.5 |

### Situação Típica do Cliente (bônus se match)
| Situação | Match Signal no Chat | Bônus |
|----------|---------------------|-------|
| "Tenho conteúdo e quero monetizar" | Primária — match direto | +1 |
| "Quero área de membros" | Secundária — match direto | +1 |
| "Preciso de app" | Terciária — match direto | +0.5 |
| Cansado de integrações | Menciona problemas entre plataformas | +1 |

## Critérios de Classificação por Tipo

### Cliente Potencial
- Tem ou quer ter curso/conteúdo online
- Precisa de área de membros
- Vende ou quer vender produtos digitais
- Precisa de checkout/pagamento
- Busca solução de IA para atendimento
- Tem equipe que precisa de treinamento

### Parceiro (Influencer/Promoter)
- Tem audiência grande mas não vende cursos
- Promove eventos
- É influencer digital
- Tem comunidade ativa
- Poderia indicar Ensinio para sua audiência

## Bônus de Score (+1 cada)
- Menciona frustração com plataforma atual (+1)
- Menciona orçamento disponível (+1)
- Tem urgência temporal (+1)
- Já tem conteúdo pronto para hospedar (+1)
- Tem equipe dedicada (+1)
- Usa plataforma concorrente (Hotmart, Memberkit, Cademi) (+1) — NEW v2.1
- Menciona app mobile como necessidade (+0.5) — NEW v2.1

## Penalidades de Score (-1 cada)
- Mensagem muito antiga sem contexto recente (-1)
- Apenas 1 mensagem no grupo (-1)
- Mensagem vaga sem detalhes do projeto (-1)
- Red flag de alerta ativo (ver tabela acima) (-1 a -2) — NEW v2.1

## Argumentos por Score Range (ensinio-mind v1.1)

Para enriquecer as mensagens de outreach, o outreach-writer deve usar os argumentos adequados:

| Score Range | Argumento Primário | Fonte |
|-------------|-------------------|-------|
| 9-10 (HOT) | All-in-One (Economia Real) — "Você não precisa de 3 plataformas" | ensinio-mind/data/ensinio-arguments.md |
| 7-8 (WARM) | Experiência Premium — "Seu aluno merece mais" | ensinio-mind/data/ensinio-arguments.md |
| 5-6 (MODERATE) | Soft approach — foco na curiosidade, sem pressão | ensinio-mind/data/ensinio-sales-playbook.md |
| 3-4 (COOL) | Educacional — link para conteúdo da Ensinio | Minimal outreach |
