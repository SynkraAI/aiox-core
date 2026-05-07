# Como acessar o AIOX Pro

O AIOX Pro e as squads Pro ficam disponíveis apenas para usuários com entitlement ativo. O acesso normal é feito por autenticação de email e senha; a chave `PRO-XXXX-XXXX-XXXX-XXXX` continua existindo como caminho legado.

## Quem tem acesso

- Membros elegíveis do AIOX Cohort Advanced.
- Usuários que já foram cadastrados como compradores/beneficiários Pro.
- Contas cujo email foi reconhecido pelo serviço de licença Pro.

Se o instalador responder que não encontrou acesso para o email, o problema é de entitlement ou conta, não de npm. Nesse caso, peça validação de acesso ao suporte/DevOps.

## Instalar e ativar

No projeto onde você quer usar o Pro:

```bash
npx aiox-pro install
npx aiox-pro setup
```

O setup guiado oferece dois caminhos:

- Email e senha: caminho recomendado.
- License key: caminho legado para chaves `PRO-...`.

Em automação/CI, use variáveis de ambiente:

```bash
export AIOX_PRO_EMAIL="seu-email@exemplo.com"
export AIOX_PRO_PASSWORD="sua-senha"
npx aiox-pro setup
```

Ou, para chave legada:

```bash
export AIOX_PRO_KEY="PRO-XXXX-XXXX-XXXX-XXXX"
npx aiox-pro setup
```

## Verificar o acesso

Depois de instalar:

```bash
npx aiox-pro status
npx aiox-pro features
npx aiox-pro validate
```

Esses comandos verificam a licença, listam recursos Pro disponíveis e forçam uma revalidação online quando necessário.

## Squads Pro

As squads Pro são entregues pelo pacote Pro privado e sincronizadas pelo instalador para as superfícies locais suportadas pelo AIOX. Depois da instalação, use os comandos de status/features acima para confirmar que o pacote Pro foi encontrado e ativado.

Se as squads não aparecerem depois de uma instalação bem-sucedida, rode:

```bash
npx aiox-pro update
npm run sync:ide
```

## Recuperação de acesso

Para recuperar senha ou licença:

```bash
npx aiox-pro recover
```

Se o email comprado não for reconhecido, ou se a conta existir mas a ativação falhar, o fluxo operacional correto é acionar `@devops` com um destes comandos:

- `*pro-check-access` para consultar entitlement e conta.
- `*pro-request-reset` para disparar reset de senha.
- `*pro-resend-verification` para reenviar verificação de email.
- `*pro-access-grant` para conceder ou restaurar acesso com validação de API e installer.

## Erros comuns

- `No AIOX Pro access found for this email.`: o email ainda não tem entitlement Pro ou foi digitado diferente do cadastro.
- `AIOX Pro is not installed.`: rode `npx aiox-pro install` antes de status/validate.
- `Invalid key format`: a chave legada precisa seguir o formato `PRO-XXXX-XXXX-XXXX-XXXX`.
- Falha em CI sem prompt interativo: defina `AIOX_PRO_EMAIL` + `AIOX_PRO_PASSWORD` ou `AIOX_PRO_KEY`.

Nunca compartilhe senha, token ou license key completa em issues públicas. Para suporte, envie apenas o email e o sintoma.
