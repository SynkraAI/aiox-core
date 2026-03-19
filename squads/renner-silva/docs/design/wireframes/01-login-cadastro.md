# Wireframe 01: Login / Cadastro

**Screen:** Authentication (Login + Signup + Reset Password)
**Priority:** Epic 2, Story 2.1
**Layout:** Auth Layout (centered card)

---

## Mobile (< 640px)

```
+------------------------------------------+
|                                          |
|            [Mic2 icon]                   |
|        Metodo Aplauda de Pe              |
|         por Renner Silva                 |
|                                          |
| +--------------------------------------+ |
| |                                      | |
| |  Entrar na sua conta                 | |
| |  ________________________________    | |
| |  [icon] | E-mail                 |   | |
| |  ________________________________    | |
| |  [icon] | Senha          [eye]   |   | |
| |  ________________________________    | |
| |                                      | |
| |  [     Entrar    ] (primary, full)   | |
| |                                      | |
| |  ---- ou continue com ----           | |
| |                                      | |
| |  [G] Continuar com Google (outline)  | |
| |                                      | |
| |  Esqueceu a senha?  (link)           | |
| |                                      | |
| |  ________________________________    | |
| |  Nao tem conta? Cadastre-se (link)   | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

## Desktop (> 1024px)

```
+------------------------------------------------------------------+
|                                                                    |
|  +-----------------------------+  +----------------------------+   |
|  |                             |  |                            |   |
|  |    [Illustration area]      |  |    [Mic2 icon, large]      |   |
|  |                             |  |    Metodo Aplauda de Pe    |   |
|  |    "Transforme sua voz      |  |    por Renner Silva        |   |
|  |     em aplausos de pe"      |  |                            |   |
|  |                             |  |  Entrar na sua conta       |   |
|  |    5 modulos                |  |  ________________________  |   |
|  |    29 checkpoints           |  |  | E-mail              |  |   |
|  |    4 trilhas                |  |  ________________________  |   |
|  |                             |  |  | Senha       [eye]   |  |   |
|  |                             |  |  ________________________  |   |
|  |                             |  |                            |   |
|  |                             |  |  [ ] Lembrar-me            |   |
|  |                             |  |                            |   |
|  |                             |  |  [      Entrar     ]       |   |
|  |                             |  |                            |   |
|  |                             |  |  ---- ou continue com ---- |   |
|  |                             |  |  [G] Continuar com Google  |   |
|  |                             |  |                            |   |
|  |                             |  |  Esqueceu a senha?         |   |
|  |                             |  |  Nao tem conta? Cadastre-se|   |
|  +-----------------------------+  +----------------------------+   |
|                                                                    |
+------------------------------------------------------------------+
```

## Signup Variant

Same layout, different form fields:

```
+--------------------------------------+
|                                      |
|  Criar sua conta                     |
|  ________________________________    |
|  [icon] | Nome completo          |   |
|  ________________________________    |
|  [icon] | E-mail                 |   |
|  ________________________________    |
|  [icon] | Senha          [eye]   |   |
|  ________________________________    |
|  [icon] | Confirmar senha [eye]  |   |
|  ________________________________    |
|                                      |
|  [    Criar conta   ] (primary)      |
|                                      |
|  ---- ou continue com ----           |
|  [G] Continuar com Google            |
|                                      |
|  Ja tem conta? Entrar (link)         |
+--------------------------------------+
```

## Password Reset Variant

```
+--------------------------------------+
|                                      |
|  Recuperar senha                     |
|                                      |
|  Digite seu e-mail e enviaremos      |
|  um link para redefinir sua senha.   |
|                                      |
|  ________________________________    |
|  [icon] | E-mail                 |   |
|  ________________________________    |
|                                      |
|  [  Enviar link  ] (primary)         |
|                                      |
|  < Voltar para login (link)          |
+--------------------------------------+
```

## Behavior Notes

- **Validation:** Real-time validation on blur. Error messages below each field in red.
- **Password toggle:** Eye icon toggles password visibility.
- **OAuth flow:** Google OAuth redirects to Supabase, returns with session.
- **Success states:** After signup -> redirect to trail selection. After login -> redirect to dashboard.
- **Error states:** "E-mail ja cadastrado", "Senha incorreta", "E-mail nao encontrado" -- displayed inline below form.
- **Password reset success:** Shows confirmation message with email sent + "Verifique sua caixa de entrada".
- **Loading:** Button shows spinner during auth request. Form inputs disabled.
