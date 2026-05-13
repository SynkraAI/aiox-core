import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Image } from 'react-native'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import * as AppleAuthentication from 'expo-apple-authentication'
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg'
import { useAuthStore } from '../../src/stores/auth.store'
import { supabase } from '../../src/services/supabase.client'

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Defs>
        <ClipPath id="g">
          <Path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#g)">
        <Path d="M0 37V11l17 13z" fill="#FBBC05" />
        <Path d="M0 11l17 13 7-6.1L48 14V0H0z" fill="#EA4335" />
        <Path d="M0 37l30-23 7.9 1L48 0v48H0z" fill="#34A853" />
        <Path d="M48 48L17 24l-4-3 35-10z" fill="#4285F4" />
      </G>
    </Svg>
  )
}

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [oauthLoading, setOauthLoading] = useState(false)
  const { signIn, isLoading, setGuestMode } = useAuthStore()

  const handleGuestMode = () => {
    setGuestMode(true)
    router.replace('/(app)')
  }

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
        const code = url.searchParams.get('code')
        if (code) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
          if (sessionError) throw sessionError
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
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subtitle}>Seu personal inteligente</Text>

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
        {!oauthLoading && <GoogleIcon />}
        <Text style={styles.oauthText}>{oauthLoading ? 'Aguarde...' : 'Continuar com Google'}</Text>
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

      <TouchableOpacity style={styles.guestContainer} onPress={handleGuestMode}>
        <Text style={styles.guestText}>Explorar sem conta</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', padding: 24 },
  logo: { width: 140, height: 140, alignSelf: 'center', marginBottom: 4 },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  oauthText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  appleButton: { width: '100%', height: 52, marginBottom: 12 },
  signUpContainer: { marginTop: 24, alignItems: 'center' },
  signUpText: { color: '#888', fontSize: 15 },
  signUpLink: { color: '#4CAF50', fontWeight: '600' },
  guestContainer: { marginTop: 4, alignItems: 'center', padding: 12 },
  guestText: { color: '#333', fontSize: 13 },
})
