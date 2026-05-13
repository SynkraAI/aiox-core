import { View, StyleSheet } from 'react-native'
import Svg, { Ellipse, Path, Line } from 'react-native-svg'

interface Props {
  facing: 'front' | 'back'
}

const S = 'rgba(255,255,255,0.75)'
const F = 'rgba(255,255,255,0.07)'
const W = '1.8'

export function HumanSilhouette({ facing }: Props) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width="170" height="360" viewBox="0 0 170 360">

        {/* Cabeça */}
        <Ellipse
          cx="85" cy="28" rx="24" ry="26"
          fill={F} stroke={S} strokeWidth={W}
        />

        {/* Tronco — ombros curvados, cintura afunilada, quadril levemente alargado */}
        <Path
          d="M 75 54
             Q 52 58 36 72
             Q 28 104 36 140
             Q 40 162 46 180
             Q 42 192 50 208
             L 120 208
             Q 128 192 124 180
             Q 130 162 134 140
             Q 142 104 134 72
             Q 118 58 95 54
             Z"
          fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />

        {/* Braço direito — levemente afastado, afilando em direção ao pulso */}
        <Path
          d="M 126 74
             Q 140 86 144 132
             Q 146 162 138 200
             Q 134 208 128 206
             Q 124 198 126 182
             Q 132 156 128 122
             Q 124 92 118 80
             Z"
          fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />

        {/* Braço esquerdo — espelho */}
        <Path
          d="M 44 74
             Q 30 86 26 132
             Q 24 162 32 200
             Q 36 208 42 206
             Q 46 198 44 182
             Q 38 156 42 122
             Q 46 92 52 80
             Z"
          fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />

        {/* Perna direita — levemente cônica, pé plano */}
        <Path
          d="M 92 210
             Q 90 250 92 284
             Q 94 314 94 336
             L 102 346
             L 118 346
             L 120 336
             Q 120 314 116 284
             Q 110 250 118 210
             Z"
          fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />

        {/* Perna esquerda — espelho */}
        <Path
          d="M 78 210
             Q 80 250 78 284
             Q 76 314 76 336
             L 68 346
             L 52 346
             L 50 336
             Q 50 314 54 284
             Q 60 250 52 210
             Z"
          fill={F} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />

        {/* Linha de simetria — somente na pose de frente */}
        {facing === 'front' && (
          <Line
            x1="85" y1="54" x2="85" y2="208"
            stroke="rgba(76,175,80,0.7)"
            strokeWidth="1"
            strokeDasharray="5,4"
          />
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
