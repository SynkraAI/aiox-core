import { View, StyleSheet } from 'react-native'
import Svg, { Ellipse, Rect, Line } from 'react-native-svg'

interface Props {
  facing: 'front' | 'back'
}

export function HumanSilhouette({ facing }: Props) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width="160" height="340" viewBox="0 0 160 340">
        {/* Cabeça */}
        <Ellipse cx="80" cy="30" rx="24" ry="28" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        {/* Pescoço */}
        <Rect x="72" y="56" width="16" height="14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        {/* Tronco */}
        <Rect x="44" y="70" width="72" height="110" rx="8" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        {/* Braço esquerdo */}
        <Rect x="18" y="74" width="24" height="88" rx="12" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        {/* Braço direito */}
        <Rect x="118" y="74" width="24" height="88" rx="12" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        {/* Perna esquerda */}
        <Rect x="48" y="182" width="28" height="140" rx="14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        {/* Perna direita */}
        <Rect x="84" y="182" width="28" height="140" rx="14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        {/* Linha de simetria (apenas frente) */}
        {facing === 'front' && (
          <Line x1="80" y1="70" x2="80" y2="180" stroke="rgba(76,175,80,0.5)" strokeWidth="1" strokeDasharray="4,4" />
        )}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
