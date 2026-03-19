# Template: App de IA (Low-Mid Ticket — R$50 a R$247)

## Metadados do Produto

```yaml
tipo: app_ia
ticket: low_a_mid
faixa_preco:
  frio: "R$50 – R$60 (sem aulas)"
  com_aulas: "R$197 – R$247 (com suporte e conteúdo)"
regras_ativas:
  - NO-H001  # pesquisa IA antes de criar
  - NO-H003  # 1 app = 1 problema específico
  - NO-F033  # custo variável, não fixo
```

---

## 1. Problema Específico (NO-H003)

```yaml
problema:
  regra: >
    1 app resolve 1 problema específico. Não tente criar um app que faz tudo.
    Apps focados têm proposta de valor mais clara e conversão mais alta (NO-H003).
  como_definir_o_problema:
    - passo_1: "Descreva o problema em 1 frase do ponto de vista do usuário"
    - passo_2: "Quantifique o problema: quanto tempo/dinheiro o usuário perde?"
    - passo_3: "Teste se o problema é real: alguém já pagou para resolver isso?"
    - passo_4: "Valide com pesquisa IA antes de construir (NO-H001)"
  exemplos_de_problemas_bons:
    - "Copywriter gasta 2h escrevendo emails — app gera em 5min"
    - "Terapeuta perde 30min por paciente em notas — app estrutura automaticamente"
    - "Empreendedor não sabe o que postar — app gera calendário editorial"
  problemas_a_evitar:
    - "App de produtividade geral (muito amplo)"
    - "Assistente de IA genérico (sem diferenciação)"
    - "App que compete direto com ChatGPT/Claude sem nicho"
```

---

## 2. Prompt System

```yaml
prompt_system:
  o_que_e: >
    O prompt system é o núcleo técnico do app — o conjunto de instruções
    que define como a IA se comporta para o usuário final.
  estrutura:
    system_prompt:
      objetivo: "Define persona, tom, limitações e contexto do app"
      componentes:
        - "Persona da IA: quem ela é e qual autoridade tem"
        - "Objetivo principal: o que ela faz e o que NÃO faz"
        - "Tom de voz: formal, casual, direto, educativo"
        - "Formato de saída esperado: lista, texto corrido, tabela, etc"
        - "Restrições: o que a IA não deve responder ou sugerir"
      exemplo_estrutura: |
        Você é [Nome da IA], um especialista em [nicho].
        Seu objetivo é [resultado específico] para [persona do usuário].
        Sempre responda em [formato].
        Nunca [restrição 1] ou [restrição 2].
        Quando não souber, diga: [frase padrão].
    user_prompts:
      objetivo: "Templates de input que guiam o usuário a obter o melhor resultado"
      quantidade_minima: 3
      exemplos:
        - "Prompt de início: 'Me conte sobre [contexto inicial]'"
        - "Prompt de refinamento: 'Ajuste para [condição específica]'"
        - "Prompt de entrega: 'Agora formate para [uso final]'"
  ferramentas_de_construcao:
    - "Claude API (Anthropic)"
    - "OpenAI API (GPT-4)"
    - "Gemini API (Google)"
  onde_hospedar_o_prompt: "Variável de ambiente no backend — nunca exposto ao front"
```

---

## 3. Features Mínimas (MVP)

```yaml
features_minimas:
  principio: >
    Lançar com o mínimo que entrega o resultado prometido.
    Adicionar features após validação de mercado, não antes.
  feature_obrigatoria_1:
    nome: "Input do usuário"
    descricao: "Campo onde o usuário descreve seu problema ou contexto"
  feature_obrigatoria_2:
    nome: "Processamento IA"
    descricao: "Envio para API + processamento do prompt system"
  feature_obrigatoria_3:
    nome: "Output formatado"
    descricao: "Resultado apresentado de forma clara e copiável"
  feature_obrigatoria_4:
    nome: "Autenticação"
    descricao: "Login simples (email ou Google) para controle de acesso"
  feature_obrigatoria_5:
    nome: "Controle de uso"
    descricao: "Limite de créditos ou tokens por plano (custo variável — NO-F033)"
  features_da_v2:
    - "Histórico de gerações"
    - "Favoritos"
    - "Templates salvos"
    - "Exportação para PDF/Word"
    - "Integrações (Notion, Google Docs)"
  ferramentas_de_construcao_rapida:
    - "Bubble (no-code)"
    - "Flutterflow (mobile)"
    - "Next.js + Vercel (code)"
    - "Softr (mais simples)"
```

---

## 4. Pricing

```yaml
pricing:
  plano_frio:
    preco: "R$50 – R$60"
    descricao: "Acesso ao app sem suporte adicional"
    o_que_inclui:
      - "Acesso à plataforma"
      - "[X] créditos por mês"
      - "Tutoriais de uso em vídeo"
    para_quem: "Usuário que sabe o que quer e não precisa de mão na massa"
  plano_com_aulas:
    preco: "R$197 – R$247"
    descricao: "App + aulas de implementação + suporte"
    o_que_inclui:
      - "Tudo do plano frio"
      - "Módulo de aulas: como usar o app para [resultado]"
      - "Grupo de suporte (Telegram)"
      - "Q&A ao vivo mensal"
    para_quem: "Usuário que quer resultado guiado, não só ferramenta"
  logica_de_creditos:
    o_que_sao: "Unidade de consumo — 1 crédito = 1 geração de resultado"
    custo_por_credito: "Calculado com base no custo de API (NO-F033)"
    reposicao: "Mensal (assinatura) ou por pacote (one-time)"
```

---

## 5. Onboarding

```yaml
onboarding:
  objetivo: "Fazer o usuário ter o primeiro resultado em menos de 5 minutos"
  fluxo:
    - passo_1: "Cadastro (email + senha ou login social)"
    - passo_2: "Tela de boas-vindas: 'Vamos criar seu primeiro [resultado] agora'"
    - passo_3: "Input guiado: pergunta específica com exemplo de resposta"
    - passo_4: "Geração e exibição do resultado"
    - passo_5: "CTA: 'Copie seu resultado e use agora'"
    - passo_6: "Email de boas-vindas com dica de como usar mais"
  email_pos_cadastro:
    assunto: "Seu [Nome do App] está pronto — faça sua primeira geração"
    corpo:
      - "Link de acesso"
      - "Tutorial rápido (GIF ou vídeo de 60s)"
      - "Dica do que gerar primeiro para impressionar"
      - "Suporte: [email ou Telegram]"
```

---

## 6. Funil (App → Email → Upsell)

```yaml
funil:
  etapa_1_app:
    descricao: "Usuário usa o app e tem resultado"
    objetivo: "Entregar valor imediato e coletar email"
  etapa_2_email:
    descricao: "Sequência educativa sobre como extrair mais resultado do app"
    sequencia:
      - timing: "D+3"
        assunto: "3 formas de usar o [App] que a maioria não conhece"
      - timing: "D+7"
        assunto: "Resultado que [aluno] teve com o [App] esta semana"
      - timing: "D+14"
        assunto: "Para quem quer ir além do [App]..."
  etapa_3_upsell:
    descricao: "Oferta do produto seguinte no mix (mid ou high ticket)"
    produto_destino: "Curso / Workshop / Mentoria"
    copy: >
      "O [App] te dá a ferramenta. O [Produto] te dá o método completo.
      Para quem quer resultado [X vezes mais rápido], acesse..."
```

---

## 7. Custo Variável (NO-F033)

```yaml
custo_variavel:
  regra: >
    App de IA deve ter custo variável com o uso, não custo fixo alto.
    O custo de API (OpenAI, Anthropic, Google) é variável — pague pelo uso (NO-F033).
  estrutura_de_custo:
    custo_fixo:
      - "Hospedagem (Vercel/Render): R$50-200/mês"
      - "Domínio: R$50-100/ano"
      - "Banco de dados: R$0-100/mês (Supabase free tier ou pro)"
    custo_variavel:
      - "API de IA: varia com uso — calcule por crédito/token consumido"
      - "Stripe/Hotmart: taxa por transação (não custo fixo)"
  margem_minima_por_credito:
    formula: "(preco_do_credito - custo_api_por_geracao) / preco_do_credito"
    meta_margem: "> 70%"
  alerta: >
    Nunca pague plano fixo de API quando o volume não justifica.
    Migre para plano dedicado apenas quando margem variável validar.
```
