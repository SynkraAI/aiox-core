import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Rect, Circle } from 'react-native-svg'

function CameraIllustration() {
  return (
    <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
      <Rect x="8" y="28" width="80" height="52" rx="10" fill="#1B3A1B" stroke="#4CAF50" strokeWidth="2" />
      <Rect x="30" y="18" width="36" height="14" rx="6" fill="#1B3A1B" stroke="#4CAF50" strokeWidth="2" />
      <Circle cx="48" cy="54" r="18" fill="#111" stroke="#4CAF50" strokeWidth="2" />
      <Circle cx="48" cy="54" r="11" fill="#0A0A0A" stroke="#2E7D32" strokeWidth="1.5" />
      <Circle cx="48" cy="54" r="6" fill="#1B3A1B" />
      <Circle cx="44" cy="50" r="2" fill="#4CAF50" opacity={0.5} />
      <Rect x="16" y="36" width="10" height="7" rx="3" fill="#4CAF50" opacity={0.7} />
      <Circle cx="74" cy="34" r="5" fill="#4CAF50" opacity={0.5} />
    </Svg>
  )
}

const TIPS: { icon: string; text: string }[] = [
  { icon: 'sunny-outline',           text: 'Local bem iluminado — prefira luz natural ou ambiente claro' },
  { icon: 'body-outline',            text: 'Fique de corpo inteiro, braços levemente afastados do corpo' },
  { icon: 'shirt-outline',           text: 'Use roupas justas ou mínimas para maior precisão' },
  { icon: 'phone-portrait-outline',  text: 'Segure o celular reto, na altura do peito, câmera traseira' },
  { icon: 'eye-off-outline',         text: 'Não use espelho — peça ajuda ou use um apoio fixo' },
  { icon: 'image-outline',           text: 'Evite sombras, luz por trás e fotos desfocadas' },
]

export const PHOTO_TIP_STORAGE_KEY = 'hidePhotoTip'

export default function PhotoTipScreen() {
  const insets = useSafeAreaInsets()
  const [dontShow, setDontShow] = useState(false)

  const handleStart = async () => {
    if (dontShow) await AsyncStorage.setItem(PHOTO_TIP_STORAGE_KEY, 'true')
    router.replace('/(app)/camera')
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.svgWrapper}>
          <CameraIllustration />
        </View>
        <Text style={styles.title}>Como tirar uma boa foto</Text>
        <Text style={styles.subtitle}>
          O resultado da análise depende diretamente da qualidade da foto. Siga as dicas abaixo.
        </Text>

        <View style={styles.tipList}>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Ionicons name={tip.icon as never} size={20} color="#4CAF50" />
              </View>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={16} color="#555" />
          <Text style={styles.noticeText}>
            Fotos mal tiradas geram análises imprecisas. A qualidade do resultado é sua responsabilidade.
          </Text>
        </View>

        <View style={styles.dontShowRow}>
          <Text style={styles.dontShowText}>Não mostrar novamente</Text>
          <Switch
            value={dontShow}
            onValueChange={setDontShow}
            trackColor={{ false: '#333', true: '#2E7D32' }}
            thumbColor={dontShow ? '#4CAF50' : '#666'}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleStart}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.btnText}>Iniciar Avaliação</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  header: { paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: {
    width: 38, height: 38,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },

  content: { padding: 24, paddingBottom: 48, gap: 20 },

  svgWrapper: { alignItems: 'center' },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  tipList: { gap: 10 },
  tipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#111', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: '#1E1E1E',
  },
  tipIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1B3A1B', justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  tipText: { color: '#ccc', fontSize: 14, flex: 1, lineHeight: 20 },

  notice: {
    flexDirection: 'row', gap: 10,
    backgroundColor: '#111', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#1E1E1E',
    alignItems: 'flex-start',
  },
  noticeText: { color: '#555', fontSize: 12, flex: 1, lineHeight: 18 },

  dontShowRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dontShowText: { color: '#666', fontSize: 14 },

  btn: {
    backgroundColor: '#4CAF50', borderRadius: 14,
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
