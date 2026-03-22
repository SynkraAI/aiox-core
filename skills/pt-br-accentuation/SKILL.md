---
name: pt-br-accentuation
description: Verificação e correção automática de acentuação e pontuação em português brasileiro
risk: safe
source: self
version: 1.0.0
category: language-quality
tags:
  - portuguese
  - accentuation
  - quality
  - pt-br
---

# Skill: Acentuação e Pontuação em Português Brasileiro

## Visão Geral

Este skill garante que TODO texto gerado em português brasileiro contenha acentuação, cedilhas, tils e pontuação corretos. Deve ser carregado como verificação pré-geração que agentes aplicam ANTES de enviar qualquer texto em pt-BR.

**Princípio fundamental:** Na dúvida, USE o acento. Melhor acentuar demais do que omitir.

---

## Erros Mais Comuns de IA (CRÍTICO - Referência Exaustiva)

### Categoria 1: Verbos e Auxiliares (MÁXIMA PRIORIDADE)

| ❌ ERRADO | ✅ CORRETO | Contexto |
|-----------|------------|----------|
| nao | não | Advérbio de negação |
| sao | são | Verbo ser (3ª pessoa plural presente) |
| estao | estão | Verbo estar (3ª pessoa plural presente) |
| entao | então | Advérbio de tempo/conclusão |
| voce | você | Pronome pessoal |
| sera | será | Verbo ser (futuro) |
| tambem | também | Advérbio de inclusão |
| ja | já | Advérbio de tempo |
| ate | até | Preposição |
| apos | após | Preposição |
| tera | terá | Verbo ter (futuro) |
| fara | fará | Verbo fazer (futuro) |
| dara | dará | Verbo dar (futuro) |
| devera | deverá | Verbo dever (futuro) |
| podera | poderá | Verbo poder (futuro) |
| havera | haverá | Verbo haver (futuro) |
| ficara | ficará | Verbo ficar (futuro) |
| comecara | começará | Verbo começar (futuro) |
| continuara | continuará | Verbo continuar (futuro) |
| retornara | retornará | Verbo retornar (futuro) |
| gerara | gerará | Verbo gerar (futuro) |
| criara | criará | Verbo criar (futuro) |
| atualizara | atualizará | Verbo atualizar (futuro) |
| executara | executará | Verbo executar (futuro) |
| processara | processará | Verbo processar (futuro) |
| validara | validará | Verbo validar (futuro) |
| verificara | verificará | Verbo verificar (futuro) |
| lancara | lançará | Verbo lançar (futuro) |
| e | é | Verbo ser vs conjunção |
| esta | está | Verbo estar vs demonstrativo |
| so | só | Advérbio "apenas" vs substantivo "sol" |
| pode | pôde | Pretérito perfeito (ele pôde) |
| tem | têm | Singular vs plural (eles têm) |
| vem | vêm | Singular vs plural (eles vêm) |
| mantem | mantém | Singular vs plural (eles mantêm) |
| contem | contém | Singular vs plural (eles contêm) |
| obtem | obtém | Singular vs plural (eles obtêm) |
| detem | detém | Singular vs plural (eles detêm) |
| para | pára | Verbo parar (abolido pela Reforma 2009, hoje "para" sem acento) |
| nos | nós | Pronome vs preposição |
| da | dá | Verbo dar vs preposição |
| as | às | Crase (a + as = às) |

### Categoria 2: Palavras em -ção, -são, -ão (SUPER CRÍTICO)

| ❌ ERRADO | ✅ CORRETO | Categoria |
|-----------|------------|-----------|
| acao | ação | Substantivo |
| funcao | função | Substantivo |
| informacao | informação | Substantivo |
| producao | produção | Substantivo |
| solucao | solução | Substantivo |
| criacao | criação | Substantivo |
| execucao | execução | Substantivo |
| implementacao | implementação | Substantivo |
| configuracao | configuração | Substantivo |
| validacao | validação | Substantivo |
| verificacao | verificação | Substantivo |
| operacao | operação | Substantivo |
| aplicacao | aplicação | Substantivo |
| integracao | integração | Substantivo |
| atualizacao | atualização | Substantivo |
| otimizacao | otimização | Substantivo |
| documentacao | documentação | Substantivo |
| especificacao | especificação | Substantivo |
| autenticacao | autenticação | Substantivo |
| autorizacao | autorização | Substantivo |
| condicao | condição | Substantivo |
| situacao | situação | Substantivo |
| comunicacao | comunicação | Substantivo |
| notificacao | notificação | Substantivo |
| sincronizacao | sincronização | Substantivo |
| organizacao | organização | Substantivo |
| navegacao | navegação | Substantivo |
| sessao | sessão | Substantivo |
| versao | versão | Substantivo |
| dimensao | dimensão | Substantivo |
| decisao | decisão | Substantivo |
| revisao | revisão | Substantivo |
| opcao | opção | Substantivo |
| excecao | exceção | Substantivo |
| conexao | conexão | Substantivo |
| instalacao | instalação | Substantivo |
| conclusao | conclusão | Substantivo |
| protecao | proteção | Substantivo |

### Categoria 3: Palavras em -ncia, -ência, -ância

| ❌ ERRADO | ✅ CORRETO | Contexto |
|-----------|------------|----------|
| experiencia | experiência | Substantivo |
| referencia | referência | Substantivo |
| diferenca | diferença | Substantivo |
| influencia | influência | Substantivo |
| sequencia | sequência | Substantivo |
| frequencia | frequência | Substantivo |
| consequencia | consequência | Substantivo |
| aparencia | aparência | Substantivo |
| ciencia | ciência | Substantivo |
| consciencia | consciência | Substantivo |
| eficiencia | eficiência | Substantivo |
| deficiencia | deficiência | Substantivo |
| dependencia | dependência | Substantivo |
| independencia | independência | Substantivo |
| presenca | presença | Substantivo |
| ausencia | ausência | Substantivo |
| essencia | essência | Substantivo |
| agencia | agência | Substantivo |
| urgencia | urgência | Substantivo |
| emergencia | emergência | Substantivo |
| divergencia | divergência | Substantivo |
| convergencia | convergência | Substantivo |
| potencia | potência | Substantivo |
| competencia | competência | Substantivo |
| tendencia | tendência | Substantivo |
| evidencia | evidência | Substantivo |
| violencia | violência | Substantivo |
| paciencia | paciência | Substantivo |
| tolerancia | tolerância | Substantivo |
| importancia | importância | Substantivo |
| relevancia | relevância | Substantivo |
| distancia | distância | Substantivo |
| vigilancia | vigilância | Substantivo |
| instancia | instância | Substantivo |

### Categoria 4: Palavras em -ível, -ável, -úvel

| ❌ ERRADO | ✅ CORRETO | Contexto |
|-----------|------------|----------|
| possivel | possível | Adjetivo |
| impossivel | impossível | Adjetivo |
| disponivel | disponível | Adjetivo |
| indisponivel | indisponível | Adjetivo |
| visivel | visível | Adjetivo |
| invisivel | invisível | Adjetivo |
| acessivel | acessível | Adjetivo |
| inacessivel | inacessível | Adjetivo |
| flexivel | flexível | Adjetivo |
| inflexivel | inflexível | Adjetivo |
| reversivel | reversível | Adjetivo |
| irreversivel | irreversível | Adjetivo |
| responsavel | responsável | Adjetivo |
| irresponsavel | irresponsável | Adjetivo |
| favoravel | favorável | Adjetivo |
| desfavoravel | desfavorável | Adjetivo |
| agradavel | agradável | Adjetivo |
| desagradavel | desagradável | Adjetivo |
| aceitavel | aceitável | Adjetivo |
| inaceitavel | inaceitável | Adjetivo |
| mutavel | mutável | Adjetivo |
| imutavel | imutável | Adjetivo |
| observavel | observável | Adjetivo |
| notavel | notável | Adjetivo |
| variavel | variável | Adjetivo/Substantivo |
| invariavel | invariável | Adjetivo |
| aplicavel | aplicável | Adjetivo |
| inaplicavel | inaplicável | Adjetivo |
| comparavel | comparável | Adjetivo |
| incomparavel | incomparável | Adjetivo |
| solavel | solúvel | Adjetivo |
| insolavel | insolúvel | Adjetivo |

### Categoria 5: Palavras em -ário, -ória, -ório

| ❌ ERRADO | ✅ CORRETO | Contexto |
|-----------|------------|----------|
| necessario | necessário | Adjetivo |
| desnecessario | desnecessário | Adjetivo |
| obrigatorio | obrigatório | Adjetivo |
| voluntario | voluntário | Adjetivo |
| primario | primário | Adjetivo |
| secundario | secundário | Adjetivo |
| temporario | temporário | Adjetivo |
| ordinario | ordinário | Adjetivo |
| extraordinario | extraordinário | Adjetivo |
| contrario | contrário | Adjetivo |
| arbitrario | arbitrário | Adjetivo |
| binario | binário | Adjetivo |
| funcionario | funcionário | Substantivo |
| usuario | usuário | Substantivo |
| destinatario | destinatário | Substantivo |
| proprietario | proprietário | Substantivo |
| comentario | comentário | Substantivo |
| formulario | formulário | Substantivo |
| vocabulario | vocabulário | Substantivo |
| inventario | inventário | Substantivo |
| calendario | calendário | Substantivo |
| horario | horário | Substantivo |
| salario | salário | Substantivo |
| itinerario | itinerário | Substantivo |
| relatorio | relatório | Substantivo |
| repositorio | repositório | Substantivo |
| diretorio | diretório | Substantivo |
| territorio | território | Substantivo |
| criterio | critério | Substantivo |
| ministerio | ministério | Substantivo |
| historia | história | Substantivo |
| memoria | memória | Substantivo |
| categoria | categoria | Substantivo |
| auditoria | auditoria | Substantivo |
| trajetoria | trajetória | Substantivo |
| vitoria | vitória | Substantivo |

### Categoria 6: Palavras em -ico, -ica, -ético, -ática

| ❌ ERRADO | ✅ CORRETO | Contexto |
|-----------|------------|----------|
| unico | único | Adjetivo |
| publico | público | Adjetivo/Substantivo |
| especifico | específico | Adjetivo |
| basico | básico | Adjetivo |
| pratico | prático | Adjetivo |
| teorico | teórico | Adjetivo |
| tecnico | técnico | Adjetivo/Substantivo |
| grafico | gráfico | Adjetivo/Substantivo |
| dinamico | dinâmico | Adjetivo |
| estatico | estático | Adjetivo |
| automatico | automático | Adjetivo |
| sistematico | sistemático | Adjetivo |
| logico | lógico | Adjetivo |
| cronologico | cronológico | Adjetivo |
| biologico | biológico | Adjetivo |
| psicologico | psicológico | Adjetivo |
| tecnologico | tecnológico | Adjetivo |
| metodologico | metodológico | Adjetivo |
| critico | crítico | Adjetivo |
| historico | histórico | Adjetivo |
| geografico | geográfico | Adjetivo |
| cientifico | científico | Adjetivo |
| pedagogico | pedagógico | Adjetivo |
| estrategico | estratégico | Adjetivo |
| energetico | energético | Adjetivo |
| sintetico | sintético | Adjetivo |
| analitico | analítico | Adjetivo |
| politico | político | Adjetivo/Substantivo |
| economico | econômico | Adjetivo |
| organico | orgânico | Adjetivo |
| mecanico | mecânico | Adjetivo |
| eletronico | eletrônico | Adjetivo |
| topico | tópico | Substantivo |
| codigo | código | Substantivo |
| metodo | método | Substantivo |
| periodo | período | Substantivo |
| musica | música | Substantivo |
| matematica | matemática | Substantivo |
| pratica | prática | Substantivo |
| tecnica | técnica | Substantivo |
| logica | lógica | Substantivo |
| etica | ética | Substantivo |
| estatistica | estatística | Substantivo |
| analise | análise | Substantivo |
| sintese | síntese | Substantivo |

### Categoria 7: Substantivos Diversos com Acento

| ❌ ERRADO | ✅ CORRETO | Contexto |
|-----------|------------|----------|
| conteudo | conteúdo | Substantivo |
| inicio | início | Substantivo |
| exercicio | exercício | Substantivo |
| numero | número | Substantivo |
| pagina | página | Substantivo |
| capitulo | capítulo | Substantivo |
| titulo | título | Substantivo |
| familia | família | Substantivo |
| saude | saúde | Substantivo |
| pais | país | Substantivo |
| veiculo | veículo | Substantivo |
| nivel | nível | Substantivo |
| movel | móvel | Substantivo |
| imovel | imóvel | Substantivo |
| fossil | fóssil | Substantivo |
| util | útil | Adjetivo |
| inutil | inútil | Adjetivo |
| facil | fácil | Adjetivo |
| dificil | difícil | Adjetivo |
| fragil | frágil | Adjetivo |
| esteril | estéril | Adjetivo |
| fertil | fértil | Adjetivo |
| volatil | volátil | Adjetivo |
| hostil | hostil | Adjetivo (SEM acento!) |
| perfil | perfil | Substantivo (SEM acento!) |
| barril | barril | Substantivo (SEM acento!) |
| funil | funil | Substantivo (SEM acento!) |
| projetil | projétil | Substantivo |
| missil | míssil | Substantivo |
| virus | vírus | Substantivo |
| bonus | bônus | Substantivo |
| onus | ônus | Substantivo |
| lapis | lápis | Substantivo |
| gratis | grátis | Advérbio |
| torax | tórax | Substantivo |
| climax | clímax | Substantivo |
| latex | látex | Substantivo |

### Categoria 8: Verbos no Subjuntivo com Ç

| ❌ ERRADO | ✅ CORRETO | Contexto |
|-----------|------------|----------|
| pareca | pareça | Subjuntivo |
| comeca | começa | Presente indicativo |
| conheca | conheça | Subjuntivo |
| esqueca | esqueça | Subjuntivo |
| faca | faça | Subjuntivo |
| deca | deça | Subjuntivo (arcaico) |
| cresca | cresça | Subjuntivo (ATENÇÃO: cresce sem ç antes de E) |
| desca | desça | Subjuntivo |
| peca | peça | Substantivo/Subjuntivo |

---

## Regras de Acentuação (Resumo Completo)

### 1. Oxítonas (Tônica na ÚLTIMA sílaba)

**Acentuam-se quando terminam em:**
- **-a(s):** sofá, está, Pará, atrás, aliás
- **-e(s):** café, você, até, português, através
- **-o(s):** cipó, avó, avô, após, robôs
- **-em/-ens:** alguém, também, parabéns, armazéns

**Ditongos abertos (ói, éi, éu) acentuam em oxítonas:** herói, chapéu, céu, dói, constrói

### 2. Paroxítonas (Tônica na PENÚLTIMA sílaba)

**Acentuam-se quando terminam em:**
- **-l:** fácil, útil, móvel, amável, possível
- **-n:** hífen, pólen, éden
- **-r:** caráter, mártir, açúcar, éter
- **-x:** tórax, fênix, látex
- **-ps:** bíceps, fórceps
- **-ã(s)/-ão(s):** órfã, órfãos, bênção, órgão, sótão
- **-i(s):** júri, táxi, lápis, grátis
- **-us:** bônus, ônus, vírus
- **-um/-uns:** álbum, fórum, álbuns
- **Ditongos:** história, série, água, árduo

**NÃO acentuam:** (maioria das paroxítonas terminadas em -a, -e, -o, -em)
- casa, pote, carro, item, jovem, nuvem

### 3. Proparoxítonas (Tônica na ANTEPENÚLTIMA sílaba)

**TODAS são acentuadas, SEM EXCEÇÃO:**
- público, árvore, lâmpada, página, número
- análise, crítico, método, época, histórico
- matemática, física, música, lógica, ética
- código, período, gráfico, único, específico

### 4. Ditongos Abertos (Reforma Ortográfica 2009)

**Acentuam-se apenas em:**
- **Oxítonas:** céu, véu, chapéu, herói, constrói, dói
- **Monossílabos tônicos:** réu, mói, dói, céu

**NÃO acentuam mais em paroxítonas:**
- ❌ idéia → ✅ ideia
- ❌ heróico → ✅ heroico
- ❌ assembléia → ✅ assembleia
- ❌ jibóia → ✅ jiboia

### 5. Hiatos (i e u tônicos)

**Acentuam-se quando:**
- Formam sílaba sozinhos ou com -s
- NÃO seguidos de -nh
- Exemplos: saída, faísca, baú, país, saúde, viúva, raízes

**NÃO acentuam:**
- rainha, moinho, bainha (seguidos de nh)
- ❌ feiúra → ✅ feiura (Reforma 2009 - hiato em paroxítona após ditongo)

### 6. Acento Diferencial (Mantidos após Reforma 2009)

| SEM acento | COM acento | Diferença |
|------------|------------|-----------|
| por | pôr | Preposição vs verbo |
| pode | pôde | Presente vs pretérito |
| têm | tem | Plural vs singular (eles têm / ele tem) |
| vêm | vem | Plural vs singular (eles vêm / ele vem) |

**Facultativos:**
- forma/fórma (substantivo "fôrma" aceito)
- demos/dêmos (presente vs pretérito - raro)

### 7. Trema (ABOLIDO em 2009)

**NÃO use mais:**
- ❌ lingüiça, freqüente, conseqüência, tranqüilo, agüentar
- ✅ linguiça, frequente, consequência, tranquilo, aguentar

**Exceção:** Mantém-se apenas em nomes próprios estrangeiros (Müller, Bündchen)

---

## Regras de Cedilha (Ç)

### Quando Usar Ç

**SEMPRE antes de A, O, U (som de "ss"):**
- caça, açúcar, força, braço, açude
- calça, roça, maçã, peça, poço, açougue

**NUNCA antes de E, I:**
- ❌ ceço → ✅ cesso
- ❌ cimento → ✅ cimento
- Use C simples: cena, certo, cidade, cinco

### Padrões Comuns com Ç

**Palavras em -ção:**
- ação, função, produção, solução, execução
- (ver tabela exaustiva na Categoria 2)

**Palavras em -aça, -aço:**
- ameaça, graça, praça, espaço, palhaço, aço

**Palavras em -eça, -eço:**
- peça, cabeça, começa, preço, tropeço, apareço

**Palavras em -iça, -iço:**
- cobiça, preguiça, carniça, serviço, feitiço

**Palavras em -oça, -oço:**
- roça, caroço, almoço, reforço, pescoço

**Palavras em -uça, -uço:**
- açúcar (exceção com acento), caramujo (sem ç)

---

## Crase (À = A + A)

### Quando Usar Crase

**Fórmula básica:** Preposição A + Artigo A = À

**Teste prático:**
1. Troque por palavra masculina
2. Se aparecer "AO", use crase (À)
3. Se aparecer "A" ou "O", NÃO use crase

**Exemplos:**
- Vou à escola (Vou ao colégio) → À
- Vou a casa (Vou a lar) → A
- Refiro-me à proposta (Refiro-me ao documento) → À
- Entreguei a ela (Entreguei a ele) → A

### Casos Obrigatórios de Crase

1. **Antes de horas:** às 14h, às 9h30, à 1h
2. **Locuções femininas:**
   - à medida que, à proporção que, à vista
   - às vezes, às pressas, às escondidas
   - à noite, à tarde, à esquerda, à direita
3. **"À moda de":** bife à milanesa, frango à passarinho
4. **Antes de nomes femininos determinados:**
   - Refiro-me à empresa (específica)
   - Vou à reunião de sexta

### Casos PROIBIDOS de Crase

1. **Antes de masculino:** a pé, a cavalo, a jato
2. **Antes de verbo:** começou a chover, vou a fazer
3. **Antes de pronomes:** a ela, a você, a essa, a qualquer
4. **Entre palavras repetidas:** cara a cara, gota a gota
5. **Antes de "casa" (=lar):** voltei a casa (sem especificador)
6. **Antes de "terra" (=chão):** desceu a terra (oposto de bordo)
7. **Com A no singular + substantivo plural:** a portas fechadas

### Crase Facultativa

1. **Antes de possessivo feminino:**
   - Vou a/à minha casa (ambos corretos)
2. **Antes de nomes próprios femininos:**
   - Entreguei a/à Maria (ambos corretos)
3. **Após "até":**
   - Vou até a/à porta (ambos corretos)

---

## Protocolo de Auto-Verificação (PRÉ-ENVIO)

### Checklist Mental (execute ANTES de enviar texto)

```
[ ] 1. SCAN DE TILS (~, ã, õ)
    → Buscar padrões: -ao, -oes, -ae
    → Corrigir: ação, função, irmãos, mãe, não, são

[ ] 2. SCAN DE CEDILHAS (ç)
    → Buscar padrões: -cao, -co + vogal
    → Corrigir: ação, função, força, começar, cabeça

[ ] 3. SCAN DE ACENTOS AGUDOS (á, é, í, ó, ú)
    → Buscar padrões: -vel, -rio, -tico, verbos
    → Corrigir: possível, necessário, único, será, está

[ ] 4. SCAN DE ACENTOS CIRCUNFLEXOS (â, ê, ô)
    → Buscar padrões: proparoxítonas, têm/vêm
    → Corrigir: número, você, ônibus, eles têm

[ ] 5. SCAN DE CRASE (à, às)
    → Buscar padrões: a + a, locuções femininas
    → Testar com masculino: "ao" = usa crase

[ ] 6. VERIFICAR CONJUGAÇÕES VERBAIS
    → Futuro (-rá, -rão): será, farão, terá
    → Presente 3ª plural (-ão): estão, são, dão
    → Subjuntivo com ç: faça, pareça, conheça

[ ] 7. VERIFICAR -ÍVEL/-ÁVEL
    → Nunca sem acento: possível, disponível, responsável

[ ] 8. VERIFICAR PROPAROXÍTONAS
    → TODAS acentuadas: código, período, número, página

[ ] 9. VERIFICAR NOMES PRÓPRIOS
    → Brasil, São Paulo, América, África (seguir regra)

[ ] 10. PRINCÍPIO DA DÚVIDA
     → Na dúvida, USE o acento
     → Melhor acentuar demais que omitir
```

---

## Cartão de Referência Rápida

### Top 20 Erros Críticos (MEMORIZE)

| Rank | ❌ Erro Fatal | ✅ Forma Correta |
|------|--------------|------------------|
| 1 | nao | não |
| 2 | voce | você |
| 3 | sao | são |
| 4 | estao | estão |
| 5 | sera | será |
| 6 | tambem | também |
| 7 | acao | ação |
| 8 | funcao | função |
| 9 | informacao | informação |
| 10 | possivel | possível |
| 11 | necessario | necessário |
| 12 | unico | único |
| 13 | codigo | código |
| 14 | numero | número |
| 15 | ja | já |
| 16 | ate | até |
| 17 | esta (verbo) | está |
| 18 | conteudo | conteúdo |
| 19 | disponivel | disponível |
| 20 | experiencia | experiência |

### Padrões de Alta Frequência

| Padrão | Regra | Exemplos |
|--------|-------|----------|
| -ção | SEMPRE til + cedilha | ação, função, solução, execução |
| -ência/-ância | SEMPRE acento | experiência, referência, importância |
| -ível/-ável | SEMPRE acento | possível, disponível, responsável |
| -ário/-ório | SEMPRE acento | necessário, obrigatório, relatório |
| -ico/-ica | SEMPRE acento (maioria) | único, público, específico, lógica |
| Futuro -rá/-rão | SEMPRE acento | será, farão, terá, deverá |
| Presente 3ª pl -ão | SEMPRE til | são, estão, dão, vão |
| Proparoxítonas | TODAS acentuadas | código, número, página, período |

---

## Instruções de Integração

### Para Agentes AIOS

**1. Carregar skill ANTES de gerar pt-BR:**
```
/AIOS:skills:pt-br-accentuation
```

**2. Aplicar checklist mental:**
- Execute a verificação em 10 passos acima
- Priorize categorias 1-3 (verbos, -ção, -ência)
- Na dúvida entre acentuar ou não: ACENTUE

**3. Validação pós-geração:**
- Leia o texto gerado procurando padrões da tabela de erros
- Use CTRL+F para buscar palavras sem acento da lista
- Corrija imediatamente antes de enviar ao usuário

**4. Princípio de qualidade:**
- Texto sem acentuação é INACEITÁVEL em pt-BR
- Melhor sobre-acentuar que sub-acentuar
- Zero tolerância para erros nas Top 20 palavras críticas

### Para Workflows AIOS

**Adicionar ao início de tasks que geram conteúdo em pt-BR:**

```yaml
pre_conditions:
  - skill: pt-br-accentuation
    action: load
  - check: language == pt-BR
    action: enforce_accentuation_protocol
```

**Adicionar ao fim de tasks que geram conteúdo em pt-BR:**

```yaml
post_conditions:
  - skill: pt-br-accentuation
    action: validate
  - check: accentuation_errors == 0
    action: block_if_failed
```

### Para Squads AIOS

**Content-engine, icp-cloning, mind-cloning, etc.:**
- Load este skill automaticamente quando language=pt-BR
- Aplicar validação antes de salvar arquivos .md
- Reportar erros de acentuação como CRITICAL no QA gate

### Para Review e QA

**Critérios de aprovação:**
- ZERO erros nas Top 20 palavras críticas
- <5 erros totais em texto de até 1000 palavras
- <10 erros totais em texto de até 5000 palavras
- Erros de acentuação BLOQUEIAM aprovação em QA Gate

---

## Exemplos de Uso

### Exemplo 1: Geração de Story em pt-BR

**ANTES (SEM skill):**
```
Titulo: Implementar funcao de autenticacao
Descricao: Criar um sistema de autenticacao com validacao de usuario
Status: Em andamento
```

**DEPOIS (COM skill):**
```
Título: Implementar função de autenticação
Descrição: Criar um sistema de autenticação com validação de usuário
Status: Em andamento
```

### Exemplo 2: Comentários em Código (INGLÊS!)

**CORRETO (comentários em inglês conforme regra global):**
```typescript
// Validate user authentication
function validateAuth() {
  // Check if user is authenticated
  return user.isAuthenticated();
}
```

**ERRADO (não use pt-BR em comentários):**
```typescript
// Valida autenticacao do usuario ❌
function validateAuth() {
  // Verifica se usuario esta autenticado ❌
  return user.isAuthenticated();
}
```

### Exemplo 3: Mensagens de Commit (pt-BR)

**ANTES:**
```
feat: adiciona funcao de validacao de formulario
```

**DEPOIS:**
```
feat: adiciona função de validação de formulário
```

### Exemplo 4: Documentação Markdown

**ANTES:**
```markdown
## Configuracao Inicial

Antes de comecar, voce precisa:

1. Instalar as dependencias
2. Configurar as variaveis de ambiente
3. Executar as migracoes do banco de dados
```

**DEPOIS:**
```markdown
## Configuração Inicial

Antes de começar, você precisa:

1. Instalar as dependências
2. Configurar as variáveis de ambiente
3. Executar as migrações do banco de dados
```

---

## Exceções e Casos Especiais

### Palavras que NÃO levam acento (CUIDADO!)

| Palavra | Por quê | Confusão comum |
|---------|---------|----------------|
| raiz | Não é hiato tônico | ❌ raíz |
| juiz | Não é hiato tônico | ❌ juíz |
| ruim | Não é hiato tônico | ❌ ruím |
| ainda | Ditongo decrescente | ❌ aínda |
| caindo | Ditongo decrescente | ❌ caíndo |
| rainha | Seguido de NH | ❌ raínha |
| bainha | Seguido de NH | ❌ baínha |
| tainha | Seguido de NH | ❌ taínha |
| possui | I tônico mas não hiato | ❌ possúi |
| contribui | I tônico mas não hiato | ❌ contribuí |
| ideia | Paroxítona (Reforma 2009) | ❌ idéia |
| assembleia | Paroxítona (Reforma 2009) | ❌ assembléia |
| heroico | Paroxítona (Reforma 2009) | ❌ heróico |
| para (verbo) | Reforma 2009 eliminou | ❌ pára |
| pelo/pela | Sem acento diferencial | ❌ pêlo/pêla |
| polo | Sem acento diferencial | ❌ pólo |

### Homônimos com/sem acento (atenção ao contexto!)

| SEM acento | Significado | COM acento | Significado |
|------------|-------------|------------|-------------|
| e | Conjunção "and" | é | Verbo ser |
| esta | Demonstrativo | está | Verbo estar |
| para | Preposição | pára | (abolido Reforma 2009, não usar) |
| pela | Preposição + artigo | péla | (abolido Reforma 2009, não usar) |
| pode | Presente de poder | pôde | Pretérito de poder |
| por | Preposição | pôr | Verbo |
| tem | 3ª singular | têm | 3ª plural |
| vem | 3ª singular | vêm | 3ª plural |

---

## Changelog

### v1.0.0 (2026-02-22)
- Versão inicial do skill
- 100+ pares de palavras críticas organizadas por categoria
- Protocolo de auto-verificação em 10 passos
- Regras completas de acentuação, cedilha e crase
- Integração com workflows AIOS
- Cartão de referência rápida Top 20 erros

---

**FIM DO SKILL**
