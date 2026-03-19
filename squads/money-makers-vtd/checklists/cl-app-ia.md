# Checklist: App de IA (Low-Mid Ticket — R$50 a R$247)

> Use antes de lançar o app e ao configurar o funil digital.
> Itens com código são regras do Natanael — obrigatórios.

---

## Definição do Problema (NO-H003)

- [ ] **O app resolve 1 (e apenas 1) problema específico?** (NO-H003)
  - O problema foi descrito em 1 frase do ponto de vista do usuário?
  - O app não tenta ser um "assistente geral"?
  - O problema quantificado (tempo ou dinheiro que o usuário perde)?

- [ ] **A pesquisa com IA foi feita antes de construir?** (NO-H001)
  - Foram validados concorrentes e soluções existentes?
  - O problema é real (alguém já pagou para resolver isso)?

---

## Prompt System

- [ ] O system prompt define persona, objetivo, tom e restrições?
- [ ] O system prompt foi testado com pelo menos 20 inputs diferentes?
- [ ] Os user prompt templates (mínimo 3) estão criados?
- [ ] O prompt está armazenado como variável de ambiente (não exposto)?
- [ ] A API de IA escolhida está definida (OpenAI / Anthropic / Google)?

---

## Features Mínimas (MVP)

- [ ] O input do usuário está funcionando?
- [ ] O processamento da API está funcionando (sem timeout)?
- [ ] O output está formatado de forma clara e copiável?
- [ ] A autenticação básica está implementada?
- [ ] O controle de uso por créditos/tokens está implementado?
- [ ] O onboarding leva o usuário ao primeiro resultado em menos de 5 minutos?

---

## Pricing

- [ ] O plano frio está definido (R$50-60)?
- [ ] O plano com aulas está definido (R$197-247)?
- [ ] Os créditos por plano estão definidos e comunicados?
- [ ] A reposição de créditos está configurada (mensal ou pacote)?
- [ ] A margem por crédito foi calculada (meta: > 70%)?

---

## Custo Variável (NO-F033)

- [ ] **O modelo de custo é variável (não fixo)?** (NO-F033)
  - O custo de API é proporcional ao uso?
  - Não há plano fixo de API desnecessário?
- [ ] O custo fixo de hospedagem foi mapeado?
- [ ] O break-even por plano foi calculado?
- [ ] A margem está saudável para o preço praticado?

---

## Onboarding

- [ ] O email de boas-vindas está configurado com link de acesso?
- [ ] O tutorial rápido (GIF ou vídeo de 60s) está pronto?
- [ ] A tela inicial direciona para o primeiro resultado imediato?
- [ ] O suporte está definido (email ou Telegram)?

---

## Funil (App → Email → Upsell)

- [ ] A captura de email no cadastro está configurada?
- [ ] A sequência de 3 emails está escrita (D+3, D+7, D+14)?
- [ ] O produto de upsell está definido com link?
- [ ] O CTA de upsell dentro do app está visível?

---

## Validação Final

- [ ] O app foi testado por pelo menos 3 pessoas do perfil do público?
- [ ] O pricing está coerente com o ticket do mix (low-mid)?
- [ ] A plataforma de pagamento está configurada e testada?
- [ ] O próximo passo após o app está definido? (NO-F021)
