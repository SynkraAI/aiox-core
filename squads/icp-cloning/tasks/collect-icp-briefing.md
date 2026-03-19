# collect-icp-briefing

## Objetivo
Coletar dados iniciais do ICP através de briefing estruturado.

## Contexto
Fase 1 do processo de clonagem (30 min). Template guiado para coletar informações básicas que alimentarão as 15 camadas de extração.

## Inputs Necessários
- Template: `templates/briefing-icp-template.md`
- Usuário com conhecimento sobre o ICP

## Processo

### 1. Abrir Template
```
Usar: templates/briefing-icp-template.md
```

### 2. Preencher Seções Obrigatórias
- **Demografia:** Idade, gênero, localização, estado civil
- **Profissão:** Ocupação, setor, senioridade
- **Contexto de Vida:** Filhos, moradia, rotina
- **Financeiro:** Faixa de renda (mínimo)

### 3. Preencher Seções Recomendadas
- Dores e frustrações principais
- Objetivos e aspirações
- Padrões de comportamento observados
- Linguagem característica
- Contexto relacional

### 4. Validação
Executar: `checklists/pre-validation-checklist.md`
- [ ] Dados mínimos obrigatórios preenchidos
- [ ] Informações específicas (não genéricas)
- [ ] Exemplos concretos onde possível

## Outputs
- `outputs/briefing-icp-filled.md` - Briefing preenchido
- Pronto para Fase 2 (Extração P0-P14)

## Tempo Estimado
30 minutos

## Next Steps
Após completar: `extract-p0-demografia.md`
