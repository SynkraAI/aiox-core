# Framework Primary - Martin Fowler

**Type:** Primary Framework Reference
**Agent:** @kaizen:martin-fowler
**Framework:** Technology Radar
**Organization:** ThoughtWorks

## Origin

O Technology Radar nasceu em 2010 na ThoughtWorks como uma forma de compartilhar conhecimento interno sobre tecnologias emergentes e maduras. A ideia: criar um "mapa" visual que mostrasse não apenas o QUE estava disponível, mas QUANDO e COMO adotar cada tecnologia.

**Motivação original:**
- Equipes de consultoria da ThoughtWorks trabalhavam com centenas de clientes em contextos diversos
- Acumulavam evidência de campo sobre o que funcionava (e o que não funcionava) na prática
- Precisavam de uma forma sistemática de compartilhar esse conhecimento agregado
- Queriam combater a tendência da indústria de adotar tecnologia por hype ao invés de evidência

O Radar é publicado semestralmente desde 2010, com cada edição analisando ~100 tecnologias baseadas em experiência real de projetos.

## Core Components

O Technology Radar organiza tecnologias em **4 quadrantes** e **4 anéis** — uma matriz de 16 células que classifica cada tecnologia por tipo e maturidade.

### 4 Quadrantes (Categorização por Tipo)

#### 1. Techniques (Técnicas)

Práticas e abordagens de engenharia de software — como FAZER o trabalho.

**Exemplos:**
- Continuous Delivery
- Trunk-based Development
- Pair Programming
- Design Systems
- Micro Frontends
- Contract Testing
- Feature Toggles

**Critério de classificação:** "É uma prática ou processo de desenvolvimento?"

#### 2. Tools (Ferramentas)

Ferramentas de desenvolvimento, build, teste, deploy e operação.

**Exemplos:**
- GitHub Copilot
- Terraform
- k6 (load testing)
- Playwright (browser testing)
- Snyk (security scanning)
- Backstage (developer portal)

**Critério de classificação:** "É um executável ou serviço que você instala/usa?"

#### 3. Platforms (Plataformas)

Plataformas de infraestrutura, cloud providers, serviços gerenciados.

**Exemplos:**
- Cloudflare Workers
- Supabase
- Fly.io
- Vercel
- AWS Lambda
- Kubernetes

**Critério de classificação:** "É onde você roda/hospeda seu código?"

#### 4. Languages & Frameworks (Linguagens e Frameworks)

Linguagens de programação, frameworks, bibliotecas.

**Exemplos:**
- TypeScript
- Rust
- Astro
- Deno
- React
- Next.js

**Critério de classificação:** "É algo que você escreve código COM?"

### 4 Rings (Anéis de Recomendação)

Os anéis representam **maturidade de adoção** — não "qualidade" abstrata, mas evidência de campo.

#### Ring 1: ADOPT (Centro do Radar)

**Significado:** "A indústria deveria usar quando apropriado."

**Critérios para ADOPT:**
- Evidência ampla de sucesso em múltiplos contextos diferentes
- Comunidade madura, documentação sólida, suporte disponível
- Trade-offs bem conhecidos e aceitáveis
- Baixo risco de adoção — o custo de falhar é gerenciável
- Testado em produção por anos, não meses

**Exemplos:**
- TypeScript (Languages)
- Terraform (Tools)
- Continuous Delivery (Techniques)
- AWS (Platforms)

**Movimento para ADOPT:** Requer evidência de 5+ contextos distintos bem-sucedidos.

#### Ring 2: TRIAL

**Significado:** "Vale investir em entender. Use em projetos que toleram risco."

**Critérios para TRIAL:**
- Evidência positiva em contextos específicos — não generalizada ainda
- Promissora, mas precisa de experiência direta antes de generalizar
- Trade-offs conhecidos mas ainda sendo calibrados
- Comunidade crescendo, documentação em evolução

**Exemplos:**
- Deno (Languages & Frameworks)
- Playwright (Tools)
- Micro Frontends (Techniques)

**Movimento para TRIAL:** Requer evidência de 2+ contextos com resultados positivos.

#### Ring 3: ASSESS

**Significado:** "Vale explorar para entender como afeta você."

**Critérios para ASSESS:**
- Potencial interessante, mas pouca evidência prática
- Nova, intrigante, merece atenção — mas não compromisso
- Trade-offs ainda não claros
- Faça spikes, protótipos, experimentos — não produza com isso ainda

**Exemplos:**
- Novas linguagens emergentes (Zig, V)
- Ferramentas beta recém-lançadas
- Técnicas de cutting edge sem casos de uso consolidados

**Movimento para ASSESS:** Requer pelo menos 3 sinais de potencial (talks, papers, early adopters).

#### Ring 4: HOLD (Borda Externa)

**Significado:** "Proceda com cautela. Motivos para não adotar agora."

**Critérios para HOLD:**
- Riscos identificados que superam benefícios
- Alternativas melhores/mais simples disponíveis
- Hype desproporcional à evidência
- Lock-in excessivo ou custo de saída alto

**IMPORTANTE:** HOLD não significa "ruim" ou "morto" — significa "não recomendado neste momento."

**Exemplos:**
- Microservices para startups early-stage (complexidade > benefício)
- Tecnologias com vendor lock-in severo sem vantagem compensatória
- Frameworks que resolvem problemas que não existem mais

**Movimento para HOLD:** Sempre requer justificativa escrita explicando POR QUÊ.

### Movement Rules (Regras de Movimento entre Anéis)

1. **Movimento para dentro (Assess → Trial → Adopt):**
   - Requer evidência positiva cumulativa
   - Nenhuma tecnologia pula anéis — sempre progressão gradual
   - Cada movimento precisa de justificativa baseada em experiência real

2. **Movimento para fora (Adopt → Hold):**
   - Requer evidência de problemas emergentes ou alternativas superiores
   - Exemplo: Ruby on Rails (Adopt → Trial) quando Node/Go provaram ser alternativas melhores para certos contextos

3. **Permanência no anel:**
   - Tecnologias podem permanecer no mesmo anel entre edições
   - Permanência em Adopt = evidência continua de utilidade
   - Permanência em Hold = problemas não resolvidos

4. **Cada blip deve ser acompanhado de justificativa:**
   - Não apenas "moveu de Trial para Adopt"
   - Mas "moveu de Trial para Adopt porque vimos sucesso em 8 projetos diferentes de e-commerce e fintech"

## Application in Kaizen Squad

### Quando usar o Technology Radar framework:

1. **Avaliação de tecnologias para adoção:**
   - Squad precisa decidir se adota uma nova ferramenta/framework
   - Martin Fowler aplica o framework completo: identifica quadrante, avalia evidência, propõe anel

2. **Revisão de stack tecnológico:**
   - Periodicamente, revisar todas as tecnologias em uso
   - Identificar quais subiram de Trial para Adopt (investir mais)
   - Identificar quais devem ir para Hold (planejar migração)

3. **Combate a hype:**
   - Quando alguém propõe adotar tecnologia "porque todo mundo está usando"
   - Martin Fowler pergunta: "Qual a evidência de campo? Em quantos contextos foi testada?"

4. **Documentação de decisões arquiteturais:**
   - Cada ADR (Architecture Decision Record) pode referenciar a posição no Radar
   - Exemplo: "Adotamos TypeScript (Adopt no Radar 2023) porque..."

### Como o framework se integra:

**Com Neal Ford (Fitness Functions):**
- Radar identifica QUAIS tecnologias adotar
- Fitness Functions garantem que qualidades arquiteturais sejam preservadas após adoção

**Com outros especialistas:**
- Radar fornece vocabulário comum para discutir maturidade tecnológica
- "Isso está em Assess ainda" = todos entendem que é cedo demais para produção

## Integration Points

### Input para o Radar

**Fontes de evidência:**
1. **Projetos da ThoughtWorks:** 100+ projetos/ano em contextos diversos
2. **Comunidade:** Feedback de desenvolvedores, conferências, papers
3. **Experiência direta:** Uso em produção por anos
4. **Postmortems:** Análise de sucessos E fracassos

**O que NÃO conta como evidência:**
- Marketing de vendor
- Hype de keynote em conferência
- "Todo mundo está usando" (sem dados concretos)
- Benchmarks sintéticos sem contexto

### Output do Radar

**Para quem é útil:**
1. **CTOs e Arquitetos:** Decisões de tecnologia baseadas em evidência agregada
2. **Desenvolvedores:** Guia de quais tecnologias investir tempo aprendendo
3. **Product Managers:** Entender trade-offs de decisões técnicas
4. **Organizações:** Reduzir risco de adoção prematura ou tardia

**Formato de publicação:**
- Documento web interativo: https://thoughtworks.com/radar
- PDF com justificativas escritas para cada blip
- Seminário semestral apresentando destaques

### Integração com outros frameworks

**Com Evolutionary Architecture (Neal Ford):**
- Radar ajuda a decidir QUAIS tecnologias adotar
- Evolutionary Architecture ajuda a COMO adotar de forma incremental

**Com Refactoring (Fowler):**
- Radar identifica quando uma tecnologia deve ir para Hold
- Refactoring fornece técnicas para migrar PARA LONGE dela

**Com ADRs (Architecture Decision Records):**
- Cada decisão arquitetural pode referenciar posição no Radar
- Exemplo: "Escolhemos Supabase (Trial no Radar 2023) porque nosso contexto específico (MVP, time pequeno) aceita o risco de Trial."

---

**Source:** MF Mind DNA - Technology Radar Framework (complete)
**Last Updated:** 2026-02-15
