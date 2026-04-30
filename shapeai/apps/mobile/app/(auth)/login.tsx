import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useAuthStore } from '../../src/stores/auth.store'
import { supabase } from '../../src/services/supabase.client'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [oauthLoading, setOauthLoading] = useState(false)
  const { signIn, isLoading } = useAuthStore()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha email e senha.')
      return
    }
    const error = await signIn(email, password)
    if (error) Alert.alert('Erro ao entrar', error)
  }

  const handleGoogleSignIn = async () => {
    setOauthLoading(true)
    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: 'shapeai', path: 'auth/callback' })
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (error || !data.url) throw error ?? new Error('URL não gerada')

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type === 'success' && result.url) {
        const url = new URL(result.url)
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        }
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível entrar com Google.')
    } finally {
      setOauthLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!credential.identityToken) throw new Error('Token Apple ausente')

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      })
      if (error) throw error
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Erro', 'Não foi possível entrar com Apple.')
      }
    }
  }

  const busy = isLoading || oauthLoading

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShapeAI</Text>
      <Text style={styles.subtitle}>Análise corporal com IA</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.forgotContainer}
        onPress={() => router.push('/(auth)/forgot-password')}
      >
        <Text style={styles.forgotText}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={busy}>
        <Text style={styles.buttonText}>{isLoading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou continue com</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.oauthButton} onPress={handleGoogleSignIn} disabled={busy}>
        <Text style={styles.oauthText}>{oauthLoading ? 'Aguarde...' : '🌐  Continuar com Google'}</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        />
      )}

      <TouchableOpacity
        style={styles.signUpContainer}
        onPress={() => router.push('/(auth)/signup')}
      >
        <Text style={styles.signUpText}>Não tem conta? <Text style={styles.signUpLink}>Criar conta</Text></Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  forgotContainer: { alignItems: 'flex-end', marginBottom: 16 },
  forgotText: { color: '#4CAF50', fontSize: 14 },
  button: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { color: '#555', marginHorizontal: 12, fontSize: 13 },
  oauthButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  oauthText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  appleButton: { width: '100%', height: 52, marginBottom: 12 },
  signUpContainer: { marginTop: 24, alignItems: 'center' },
  signUpText: { color: '#888', fontSize: 15 },
  signUpLink: { color: '#4CAF50', fontWeight: '600' },
})
