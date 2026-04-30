# QA Fix Request — ShapeAI Stories 1.2 + 2.1

**Gerado por:** Quinn (@qa)
**Data:** 2026-04-30
**Destinado a:** Dex (@dev)
**Prioridade:** Alta — stories bloqueadas para merge

---

## Story 1.2 — User Authentication · FAIL ❌

### FIX-1.2-A · CRÍTICO — Criar `signup.tsx`

**Arquivo:** `shapeai/apps/mobile/app/(auth)/signup.tsx`
**AC violado:** AC1 — Tela de Sign Up

Criar a tela com:
- Campos: email, senha, confirmação de senha
- Validação: email format, senha mínimo 8 chars, senhas coincidem
- Botão "Criar conta" com loading state
- Chamar `supabase.auth.signUp({ email, password })` (via store ou direto)
- Exibir erro amigável em caso de falha
- Botão/link "Já tenho conta" → navegar para login

---

### FIX-1.2-B · CRÍTICO — Criar `forgot-password.tsx`

**Arquivo:** `shapeai/apps/mobile/app/(auth)/forgot-password.tsx`
**AC violado:** AC6 — Recuperação de senha

Criar a tela com:
- Campo de email
- Botão "Enviar link de recuperação"
- Chamar `supabase.auth.resetPasswordForEmail(email)`
- Exibir confirmação de envio (não revelar se email existe ou não)

---

### FIX-1.2-C · ALTO — Adicionar OAuth e link forgot em `login.tsx`

**Arquivo:** `shapeai/apps/mobile/app/(auth)/login.tsx`
**ACs violados:** AC2 (Google), AC3 (Apple), AC6 (link forgot password)

Adicionar abaixo do botão "Entrar":
```tsx
// Link forgot password
<TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
  <Text>Esqueci minha senha</Text>
</TouchableOpacity>

// Separador
<Text>ou continue com</Text>

// Google OAuth
<TouchableOpacity onPress={handleGoogleSignIn}>
  <Text>Continuar com Google</Text>
</TouchableOpacity>

// Apple Sign In — APENAS iOS
{Platform.OS === 'ios' && (
  <AppleAuthentication.AppleAuthenticationButton
    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
    onPress={handleAppleSignIn}
  />
)}
```

Implementar `handleGoogleSignIn` com `expo-auth-session` + `supabase.auth.signInWithOAuth`.
Implementar `handleAppleSignIn` com `expo-apple-authentication` + exchange do token com Supabase.

---

### FIX-1.2-D · MÉDIO — Adicionar `signUp` ao `auth.store.ts`

**Arquivo:** `shapeai/apps/mobile/src/stores/auth.store.ts`

```typescript
interface AuthState {
  // ... existente
  signUp: (email: string, password: string) => Promise<string | null>
}

// Implementação
signUp: async (email, password) => {
  set({ isLoading: true })
  const { error } = await supabase.auth.signUp({ email, password })
  set({ isLoading: false })
  if (error) return error.message
  return null
},
```

---

### FIX-1.2-E · BAIXO — Cleanup do `onAuthStateChange`

**Arquivo:** `shapeai/apps/mobile/src/stores/auth.store.ts`

```typescript
initialize: async () => {
  const { data } = await supabase.auth.getSession()
  set({ session: data.session, isLoading: false })

  // Armazenar subscription para cleanup
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    set({ session })
  })

  // Retornar cleanup function
  return () => subscription.unsubscribe()
},
```

---

## Story 2.1 — AR Camera Capture · CONCERNS ⚠️

### FIX-2.1-A · ALTO — Câmera traseira para foto de costas

**Arquivo:** `shapeai/apps/mobile/app/(app)/camera.tsx`
**AC violado:** AC1 — guia correto por etapa

Linha 133, corrigir de:
```tsx
<CameraView ref={cameraRef} style={styles.camera} facing={'front' as CameraType}>
```
Para:
```tsx
<CameraView ref={cameraRef} style={styles.camera} facing={step === 'front' ? 'front' : 'back'}>
```

---

### FIX-2.1-B · MÉDIO — Implementar validação real de tamanho

**Arquivo:** `shapeai/apps/mobile/app/(app)/camera.tsx`
**AC violado:** AC8 — validação 10 MB

Instalar se necessário: `npx expo install expo-file-system`

Adicionar em `handleCapture` após `takePictureAsync`:
```typescript
import * as FileSystem from 'expo-file-system'

const handleCapture = async () => {
  if (!cameraRef.current) return
  const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false })
  if (!photo) return

  // Validação de tamanho real
  const info = await FileSystem.getInfoAsync(photo.uri, { size: true })
  const fileInfo = info as FileSystem.FileInfo & { size?: number }
  if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE_BYTES) {
    Alert.alert('Foto muito grande', 'Cada foto deve ter no máximo 10 MB. Tente novamente.')
    return
  }

  setPreviewUri(photo.uri)
  // ... resto do handler
}
```

---

### DÉBITO TÉCNICO — Registrar no backlog (não bloqueante)

| ID | Issue | Severidade |
|----|-------|-----------|
| DT-2.1-1 | Presigned URL armazenada no banco — substituir por S3 key | MÉDIO |
| DT-2.1-2 | Testes de rotas sem `app.inject()` do Fastify | BAIXO |
| DT-2.1-3 | Race condition freemium — adicionar transação DB | BAIXO |

---

## Checklist de Validação Pós-Fix

### Story 1.2
- [ ] `signup.tsx` criado e funcional
- [ ] `forgot-password.tsx` criado e funcional
- [ ] `login.tsx` com Google OAuth, Apple Sign In e link forgot password
- [ ] `auth.store.ts` com método `signUp`
- [ ] `onAuthStateChange` com cleanup
- [ ] Testes atualizados cobrindo novos componentes/métodos
- [ ] `npm test` passando

### Story 2.1
- [ ] `camera.tsx` usa câmera traseira para etapa `'back'`
- [ ] Validação de tamanho com `expo-file-system` implementada e funcional
- [ ] Teste de câmera atualizado para cobrir validação de tamanho
- [ ] `npm test` passando

---

*QA Fix Request gerado por Quinn (@qa) — 2026-04-30*
