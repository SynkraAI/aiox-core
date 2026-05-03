import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getUserProfile } from '../../src/services/profile.service'
import { sendChatMessage, getChatUsage } from '../../src/services/chat.service'
import type { ChatUsage, ChatResponse, ChatLimitError } from '../../src/services/chat.service'
import type { UserProfile } from '@shapeai/shared'

interface Message {
  id: string
  role: 'user' | 'coach'
  text: string
}

const PERSONA_NAMES: Record<string, string> = {
  rafael: 'Rafael',
  marina: 'Marina',
  bruno: 'Bruno',
}

const QUICK_SUGGESTIONS = [
  'Explique meu treino de hoje',
  'Alternativa sem equipamento',
  'Por que meu score de costas é baixo?',
  'Como progredir minha carga?',
  'Pulei treino, como reorganizo a semana?',
]

export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [usage, setUsage] = useState<ChatUsage | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [coachName, setCoachName] = useState('Rafael')
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    const [profileResult, usageResult] = await Promise.allSettled([
      getUserProfile(),
      getChatUsage(),
    ])

    if (profileResult.status === 'fulfilled') {
      const profile = profileResult.value as UserProfile
      const persona = profile.coach_persona ?? 'rafael'
      setCoachName(PERSONA_NAMES[persona] ?? 'Rafael')
    }

    if (usageResult.status === 'fulfilled') {
      const u = usageResult.value
      setUsage(u)
      if (u.limit !== null && u.count >= u.limit) {
        setLimitReached(true)
      }
    }
  }

  async function handleSend(text?: string) {
    const messageText = (text ?? input).trim()
    if (!messageText || isLoading || limitReached) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: messageText }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)

    try {
      const result = await sendChatMessage(messageText)

      if ('type' in result) {
        const limitErr = result as ChatLimitError
        setLimitReached(true)
        setUsage(limitErr.usage)
      } else {
        const resp = result as ChatResponse
        const coachMsg: Message = { id: `c-${Date.now()}`, role: 'coach', text: resp.reply }
        setMessages((prev) => [...prev, coachMsg])
        setUsage(resp.usage)
        if (resp.usage.limit !== null && resp.usage.count >= resp.usage.limit) {
          setLimitReached(true)
        }
        if (resp.persona) setCoachName(PERSONA_NAMES[resp.persona] ?? coachName)
      }
    } catch {
      const errMsg: Message = {
        id: `e-${Date.now()}`,
        role: 'coach',
        text: 'Não consegui processar sua mensagem. Verifique sua conexão e tente novamente.',
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setIsLoading(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
    }
  }

  const showSuggestions = messages.length === 0 && !limitReached

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="fitness" size={20} color="#4CAF50" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerName}>Coach {coachName}</Text>
            <Text style={styles.headerSub}>Personal trainer virtual</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {showSuggestions && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="fitness" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.emptyTitle}>Olá! Sou o Coach {coachName}</Text>
              <Text style={styles.emptyBody}>
                Estou aqui para ajudar com seu treino, explicar exercícios e acompanhar sua evolução.
                Escolha uma sugestão ou escreva sua dúvida.
              </Text>
            </View>
          )}

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.coachBubble]}
            >
              <Text style={[styles.bubbleText, msg.role === 'user' ? styles.userText : styles.coachText]}>
                {msg.text}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.bubble, styles.coachBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          )}

          {limitReached && (
            <View style={styles.limitCard}>
              <Ionicons name="lock-closed" size={24} color="#888" style={styles.limitIcon} />
              <Text style={styles.limitTitle}>Limite diário atingido</Text>
              <Text style={styles.limitBody}>
                Você usou todas as {usage?.limit} mensagens gratuitas de hoje.
                Faça upgrade para Pro e converse sem limites.
              </Text>
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => router.push('/(app)/paywall')}
              >
                <Text style={styles.upgradeBtnText}>Fazer upgrade para Pro →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Quick suggestions */}
        {showSuggestions && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsRow}
            contentContainerStyle={styles.suggestionsContent}
          >
            {QUICK_SUGGESTIONS.map((s) => (
              <TouchableOpacity key={s} style={styles.chip} onPress={() => handleSend(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Usage counter (Free only) */}
        {usage && usage.limit !== null && !limitReached && (
          <Text style={styles.usageCounter}>
            {usage.count}/{usage.limit} mensagens hoje
          </Text>
        )}

        {/* Input bar */}
        {!limitReached && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Pergunte ao seu coach..."
              placeholderTextColor="#555"
              multiline
              maxLength={500}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D1F0D',
    borderWidth: 1,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSub: { color: '#555', fontSize: 12, marginTop: 1 },
  settingsBtn: { padding: 4 },

  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 10 },

  emptyState: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 16, gap: 12 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0D1F0D',
    borderWidth: 1,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyBody: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#4CAF50', borderBottomRightRadius: 4 },
  coachBubble: { alignSelf: 'flex-start', backgroundColor: '#1A1A1A', borderBottomLeftRadius: 4 },
  loadingBubble: { paddingHorizontal: 20 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  coachText: { color: '#eee' },

  limitCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  limitIcon: { marginBottom: 4 },
  limitTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  limitBody: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  upgradeBtn: {
    marginTop: 8,
    backgroundColor: '#0D1F0D',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  upgradeBtnText: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },

  suggestionsRow: { flexGrow: 0 },
  suggestionsContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { color: '#aaa', fontSize: 13 },

  usageCounter: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 4,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#1A2E1A' },
})
