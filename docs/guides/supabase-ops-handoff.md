# AIOX-Pro Access Ops Handoff

**Version:** 3.0.0
**Last Updated:** 2026-04-19
**Status:** Active

---

## Overview

Este handoff não é para descoberta genérica de Supabase.

Ele existe para operações repetíveis do AIOX-Pro access/licensing, onde o projeto, o serviço e o fluxo já são conhecidos. O foco aqui é permitir que o squad-creator gere tasks específicas para operações como:

- criar novo acesso
- liberar Pro para um e-mail existente
- reenviar verificação
- confirmar e-mail por admin
- reset de senha
- diagnosticar por que um login/acesso falhou

O documento precisa ser profundo o suficiente para evitar que a task gerada repita investigação desnecessária ou tome atalhos perigosos.

---

## Fixed Context

Para este fluxo, os fatos já conhecidos são:

- serviço real: `https://aiox-license-server.vercel.app`
- projeto Supabase correto: `aios-license-server`
- project ref: `evvvnarpwcdybxdvcwjh`
- auth backend: Supabase Auth do projeto `evvvnarpwcdybxdvcwjh`
- entitlement/buyer oracle: tabela `public.buyers`
- tabelas auxiliares relevantes:
  - `public.buyer_validations`
  - `public.licenses`
  - `public.activations`

**Regra:** para operações de acesso AIOX-Pro, não gastar tempo redescobrindo projeto. Começar direto deste contexto.

---

## What We Already Learned In Practice

Este fluxo já foi executado manualmente e os aprendizados abaixo devem ser tratados como conhecimento operacional consolidado:

- `POST /api/v1/auth/check-email` é o pré-check oficial do backend
  - ele retorna `isBuyer` e `hasAccount`
  - ele deve ser o primeiro oracle de estado do usuário

- `POST /api/v1/auth/login` é o segundo oracle
  - se retornar `EMAIL_NOT_VERIFIED`, o problema é confirmação de e-mail
  - se retornar `INVALID_CREDENTIALS`, o problema é senha
  - se retornar `200`, auth está funcional

- no projeto `evvvnarpwcdybxdvcwjh`, o login real depende do Supabase Auth

- o entitlement Pro não vem de `public.licenses`
  - o oracle operacional para buyer é `public.buyers`
  - se `buyers` não tiver o e-mail ativo, `check-email` não sobe `isBuyer`

- `public.licenses` e `public.activations` são importantes para licença e máquinas
  - mas não são o primeiro write para “liberar acesso”

- não é necessário ativar licença em máquina para concluir onboarding/access ops
  - ativação consome seat/estado operacional e deve ficar fora de tasks de provisionamento básico

---

## Operational Goal

Toda task derivada deste handoff deve responder claramente:

- o usuário já existe no auth?
- o e-mail está confirmado?
- o e-mail já está liberado em `buyers`?
- o fluxo final no serviço real funciona?

---

## Known Endpoints

Endpoints do serviço real que importam:

- `POST /api/v1/auth/check-email`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/activate-pro`
- `POST /api/v1/auth/request-reset`
- `POST /api/v1/auth/resend-verification`

UI/flow auxiliar:

- reset de senha: `https://aiox-license-server.vercel.app/reset-password`

---

## Endpoint Semantics

### `POST /api/v1/auth/check-email`

Usar para classificar o caso antes de qualquer write.

Resposta de interesse:

- `isBuyer: boolean`
- `hasAccount: boolean`
- `email`

Interpretação:

- `isBuyer=false`, `hasAccount=false`
  - falta conta e falta entitlement
- `isBuyer=false`, `hasAccount=true`
  - conta existe, falta buyer
- `isBuyer=true`, `hasAccount=false`
  - caso inconsistente ou migração parcial; investigar auth
- `isBuyer=true`, `hasAccount=true`
  - provisioning quase completo; validar login

### `POST /api/v1/auth/signup`

Usar somente quando `hasAccount=false`.

Saída útil:

- `userId`
- `message`

### `POST /api/v1/auth/login`

Usar para validar se o usuário consegue de fato entrar.

Saídas/erros úteis:

- `200` com `accessToken`, `userId`, `emailVerified`
- `EMAIL_NOT_VERIFIED`
- `INVALID_CREDENTIALS`

### `POST /api/v1/auth/request-reset`

Usar para recovery padrão quando não for desejável reset manual por admin.

### `POST /api/v1/auth/resend-verification`

Usar quando a conta existe mas ainda depende do inbox do usuário.

---

## Tables That Matter

### `public.buyers`

Oracle de entitlement Pro.

Campos relevantes:

- `email`
- `source`
- `purchased_at`
- `is_active`
- `metadata`

Regra prática:

- se o e-mail não está ativo em `buyers`, `check-email` não vai retornar `isBuyer: true`
- para “liberar acesso Pro”, este é o write primário

### `public.buyer_validations`

Cache/registro de validação de buyer por usuário autenticado.

Campos relevantes:

- `user_id`
- `email`
- `is_valid`
- `validated_at`
- `expires_at`

Regra prática:

- é tabela de apoio/cache
- não é o primeiro write para grant manual
- pode ser inspecionada em diagnóstico, mas o provisioning deve preferir `buyers`

### `public.licenses`

Licenças emitidas pelo backend.

Campos relevantes:

- `key`
- `customer_email`
- `features`
- `max_seats`
- `expires_at`
- `user_id`

Regra prática:

- relevante para emissão/licença existente
- não usar como primeiro mecanismo de grant manual de acesso

### `public.activations`

Ativações por máquina.

Campos relevantes:

- `license_id`
- `machine_id`
- `activated_at`
- `deactivated_at`

Regra prática:

- só entra em cena quando o problema é ativação/seat/machine lifecycle
- não é etapa padrão de criar acesso ou reset de senha

---

## Non-Negotiable Rules

- não redescobrir projeto Supabase para AIOX-Pro access ops
- não escrever em `full-agent` para resolver licensing
- não inferir schema diferente do que já está confirmado acima
- não encerrar tarefa sem validar no serviço real
- não expor `service_role`, `anon`, JWT, reset token ou access token
- não consumir seat/activation sem necessidade explícita
- não escrever em `licenses` para resolver um caso que é apenas buyer/auth
- não usar `buyer_validations` como substitute de `buyers`

---

## Mandatory Diagnostic Order

Toda task deve seguir esta ordem, mesmo quando parecer óbvio o que está errado:

1. `check-email`
2. `auth admin` por e-mail
3. `buyers` por e-mail
4. `login` se houver senha
5. `buyer_validations` apenas se houver dúvida de cache/estado intermediário
6. `licenses` e `activations` apenas se o problema incluir ativação/licença/máquina

Justificativa:

- esta ordem minimiza writes
- evita tocar licença quando o problema é apenas auth
- evita tocar auth quando o problema é apenas buyer
- evita consumir seat durante suporte básico

---

## Decision Tree

### Case A

`check-email => isBuyer=false, hasAccount=false`

Fazer:

1. `signup`
2. confirmar e-mail por admin se acesso imediato for necessário
3. inserir `buyers`
4. revalidar `check-email`
5. validar `login`

### Case B

`check-email => isBuyer=false, hasAccount=true`

Fazer:

1. localizar auth user
2. inserir `buyers` se ausente
3. se login falhar por `EMAIL_NOT_VERIFIED`, confirmar e-mail por admin ou reenviar verificação
4. revalidar `check-email`
5. validar `login`

### Case C

`check-email => isBuyer=true, hasAccount=true`, mas login falha por `EMAIL_NOT_VERIFIED`

Fazer:

1. confirmar e-mail por admin ou reenviar verificação
2. revalidar `login`

### Case D

`check-email => isBuyer=true, hasAccount=true`, mas login falha por `INVALID_CREDENTIALS`

Fazer:

1. `request-reset` se o fluxo for self-service
2. ou update manual de senha por admin se o suporte precisar entregar senha provisória
3. validar `login`

### Case E

`check-email => isBuyer=true, hasAccount=false`

Fazer:

1. tratar como estado inconsistente
2. inspecionar auth admin
3. criar conta somente se confirmar ausência de user
4. não tocar licença antes de resolver auth

---

## Standard Validation Sequence

Toda task deve terminar com esta sequência:

1. validar `check-email`
2. validar `login` se houver senha conhecida
3. só validar `activate-pro` se o objetivo da task for ativação real em máquina

Estados esperados:

- acesso liberado:
  - `isBuyer: true`
  - `hasAccount: true`
- login funcionando:
  - status `200`
  - `emailVerified: true`

Se a task não consegue provar esses estados, ela não está concluída.

---

## Evidence Pack Required

Toda execução operacional deve sair com um pacote mínimo de evidências:

- resultado inicial de `check-email`
- existência ou ausência do usuário no auth
- existência ou ausência do e-mail em `buyers`
- writes executados
- resultado final de `check-email`
- resultado final de `login`, se aplicável

Formato esperado do resumo:

- `initial_check`
- `auth_state`
- `buyer_state`
- `writes`
- `final_check`
- `final_login`

---

## Playbook 1: Criar Novo Acesso Pro

### Use When

- o e-mail ainda não tem conta
- o e-mail precisa ganhar acesso Pro
- há senha inicial definida para onboarding/manual setup

### Inputs

- `email`
- `password`
- origem da liberação, ex.: `manual`
- motivo operacional

### Steps

1. checar `POST /api/v1/auth/check-email`
2. se `hasAccount: false`, criar conta com `signup`
3. localizar usuário no `auth admin`
4. confirmar e-mail por admin se a operação exigir acesso imediato
5. verificar se existe registro em `public.buyers`
6. se não existir, inserir buyer ativo
7. revalidar `check-email`
8. validar `login`

### Writes Allowed

- criar `auth user`
- inserir linha em `buyers`
- update admin de confirmação de e-mail

### Writes Not Allowed

- criar activation
- inventar linha em `licenses`
- alterar outras tabelas fora do fluxo

### Success Criteria

- `isBuyer: true`
- `hasAccount: true`
- `login` retorna `200`
- `emailVerified: true`

### Minimal Data Write

- `auth user`
- `public.buyers`

---

## Playbook 2: Liberar Pro Para Conta Já Existente

### Use When

- o usuário já tem conta
- o problema é só falta de entitlement

### Steps

1. checar `POST /api/v1/auth/check-email`
2. confirmar que `hasAccount: true`
3. verificar `public.buyers` por e-mail
4. se ausente, inserir buyer ativo
5. revalidar `check-email`
6. validar `login` se a senha for conhecida

### Writes Allowed

- inserir ou corrigir `buyers`
- update admin de confirmação de e-mail, se necessário para destravar login

### Success Criteria

- `isBuyer: true`
- conta existente preservada
- nenhum write extra além de `buyers`, salvo necessidade explícita

---

## Playbook 3: Reenviar Verificação de E-mail

### Use When

- a conta existe
- o login falha por e-mail não confirmado
- não é desejável confirmar por admin imediatamente

### Steps

1. confirmar que a conta existe
2. chamar `POST /api/v1/auth/resend-verification`
3. registrar que o usuário precisa abrir o link recebido
4. se a operação exigir liberação imediata, usar o Playbook 4

### Output Contract

- informar explicitamente se ainda há dependência de ação do usuário
- não reportar “acesso resolvido” se ainda depende do inbox

### Success Criteria

- endpoint responde com sucesso
- comunicação deixa claro que a ação do usuário ainda é necessária

---

## Playbook 4: Confirmar E-mail Por Admin

### Use When

- existe conta
- e-mail não confirmado
- é necessário desbloquear acesso imediatamente sem esperar inbox

### Steps

1. localizar o usuário no `auth admin`
2. aplicar update admin com `email_confirm: true`
3. revalidar login

### Why This Exists

- evita bloquear acesso imediato por dependência do inbox
- é o caminho de suporte quando a operação não pode esperar e-mail do usuário

### Success Criteria

- `email_confirmed_at` preenchido
- `login` retorna `200`

### Caution

- usar somente quando o processo permitir override administrativo

---

## Playbook 5: Reset de Senha

### Use When

- o usuário esqueceu a senha
- não é necessário impor uma senha manual por admin

### Steps

1. confirmar se a conta existe
2. chamar `POST /api/v1/auth/request-reset`
3. orientar uso de `https://aiox-license-server.vercel.app/reset-password`
4. não mudar entitlement durante reset

### Important Distinction

- reset de senha não corrige buyer
- reset de senha não corrige e-mail não confirmado
- reset de senha é só para credenciais

### Success Criteria

- request-reset responde com sucesso
- usuário consegue seguir o fluxo de recuperação

---

## Playbook 6: Definir Nova Senha Manualmente

### Use When

- suporte precisa definir uma senha inicial ou temporária
- a operação é administrativa e explícita

### Steps

1. localizar usuário no `auth admin`
2. atualizar a senha por admin
3. validar `login` com a nova senha

### When Preferred Over Request Reset

- onboarding assistido
- suporte executivo/manual
- ambiente onde a senha inicial precisa ser entregue explicitamente

### Success Criteria

- login com a nova senha funciona
- nenhuma outra tabela é alterada sem necessidade

---

## Playbook 7: Diagnosticar Falha de Acesso

### Use When

- o usuário diz “não consigo entrar”
- o acesso Pro não ativa
- não está claro se o problema é auth, buyer ou licença

### Diagnostic Order

1. `check-email`
2. `auth admin users` por e-mail
3. `buyers` por e-mail
4. `login`
5. `licenses` por `customer_email`
6. `buyer_validations` por `email` ou `user_id`

### Better Triage Order In Practice

Use esta priorização:

1. `check-email`
2. `login`
3. `auth admin`
4. `buyers`
5. `buyer_validations`
6. `licenses`
7. `activations`

Motivo:

- `check-email + login` já classificam a maioria dos casos sem write

### Interpretation

- `isBuyer: false` e `hasAccount: false`
  - falta conta e falta entitlement
- `isBuyer: false` e `hasAccount: true`
  - conta existe, falta buyer
- `isBuyer: true` e login falha por `EMAIL_NOT_VERIFIED`
  - buyer ok, falta confirmação de e-mail
- `isBuyer: true` e login falha por credenciais
  - entitlement ok, problema é senha

- `isBuyer: true`, login ok, ativação falha
  - sair do escopo de access ops e abrir investigação de licença/activation

---

## Minimal Command/Action Contract For Tasks

Uma task boa para o squad-creator não deve pedir “investigar como fazer”.

Ela deve declarar explicitamente:

1. quais leituras fará primeiro
2. qual write mínimo fará em cada ramo da árvore de decisão
3. qual validação final provará o sucesso
4. quais writes estão proibidos naquele caso

Exemplo de contrato ruim:

- “verificar Supabase e resolver acesso”

Exemplo de contrato bom:

- “rodar check-email; se hasAccount=false criar auth user; se buyer ausente inserir em buyers; confirmar e-mail por admin apenas se acesso imediato for necessário; validar check-email e login”

---

## Expected Task Outputs

Toda task gerada a partir deste handoff deve devolver:

- ação executada
- e-mail alvo
- writes realizados
- estado final de `check-email`
- estado final de `login`, se aplicável
- pendências restantes, se houver

Também deve devolver:

- classificação do caso na árvore de decisão
- motivo para cada write executado
- confirmação explícita de que nenhuma activation/seat foi consumida, salvo pedido explícito

---

## Squad-Creator Task Briefs

### Brief A: Criar Novo Acesso AIOX-Pro

```md
Criar task operacional para criar um novo acesso AIOX-Pro no backend de licensing já conhecido.

Contexto fixo:
- serviço: https://aiox-license-server.vercel.app
- projeto Supabase: evvvnarpwcdybxdvcwjh
- oracle de buyer: public.buyers

A task deve:
- rodar check-email e classificar o caso
- receber email e senha inicial
- criar conta se não existir
- confirmar email por admin quando necessário para liberação imediata
- inserir buyer ativo se ausente
- validar via check-email e login
- listar writes permitidos e proibidos

Done:
- isBuyer=true
- hasAccount=true
- login 200
```

### Brief B: Liberar Pro Para Conta Existente

```md
Criar task operacional para liberar entitlement Pro para uma conta já existente no AIOX-Pro.

Contexto fixo:
- serviço: https://aiox-license-server.vercel.app
- projeto Supabase: evvvnarpwcdybxdvcwjh
- tabela de entitlement: public.buyers

A task deve:
- confirmar existência da conta
- inserir buyer ativo apenas se ausente
- confirmar e-mail por admin apenas se login falhar por não verificado
- revalidar check-email
- validar login se houver senha fornecida

Done:
- isBuyer=true
- conta preservada
```

### Brief C: Reenviar Verificação

```md
Criar task operacional para reenviar verificação de email do AIOX-Pro.

Contexto fixo:
- serviço: https://aiox-license-server.vercel.app
- projeto Supabase: evvvnarpwcdybxdvcwjh

A task deve:
- confirmar que a conta existe
- chamar resend-verification
- reportar claramente se ainda depende de ação do usuário
- proibir conclusão “resolvido” sem prova de login, salvo se o objetivo explícito for apenas reenvio
```

### Brief D: Confirmar E-mail Por Admin

```md
Criar task operacional para confirmar por admin o email de uma conta do AIOX-Pro.

Contexto fixo:
- auth backend: Supabase Auth do projeto evvvnarpwcdybxdvcwjh

A task deve:
- localizar user por email
- aplicar email_confirm=true
- validar login após a confirmação
- explicitar que não deve tocar buyers/licenças se o problema for apenas verificação
```

### Brief E: Reset de Senha

```md
Criar task operacional para reset de senha do AIOX-Pro.

Contexto fixo:
- serviço: https://aiox-license-server.vercel.app
- página de recovery: https://aiox-license-server.vercel.app/reset-password

A task deve:
- confirmar existência da conta
- chamar request-reset
- reportar o próximo passo para o usuário
- explicitar que reset não resolve buyer nem verificação de e-mail
```

### Brief F: Diagnóstico de Falha de Acesso

```md
Criar task operacional para diagnosticar por que um usuário não consegue acessar o AIOX-Pro.

Contexto fixo:
- serviço: https://aiox-license-server.vercel.app
- projeto Supabase: evvvnarpwcdybxdvcwjh
- tabelas relevantes: buyers, buyer_validations, licenses, activations

A task deve:
- rodar check-email
- testar login cedo para classificar o erro
- verificar auth user
- verificar buyers
- classificar a falha em: falta conta, falta buyer, email não confirmado, senha inválida ou problema de licença
- listar o próximo playbook exato a executar
```

---

## Definition Of Done

- task parte do contexto fixo correto
- task não perde tempo redescobrindo projeto/licensing
- task executa apenas o playbook relevante
- task valida no serviço real
- resultado final fica objetivo e auditável

---

_Last Updated: 2026-04-19 | AIOX Ops_
