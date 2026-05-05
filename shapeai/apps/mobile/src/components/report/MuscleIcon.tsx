import { Image, StyleSheet } from 'react-native'

interface MuscleIconProps {
  muscle: string
  color: string
  size?: number
}

const MUSCLE_IMAGE: Record<string, ReturnType<typeof require>> = {
  biceps:     require('../../../assets/muscles/biceps.png'),
  triceps:    require('../../../assets/muscles/triceps.png'),
  chest:      require('../../../assets/muscles/chest.png'),
  abs:        require('../../../assets/muscles/abs.png'),
  traps:      require('../../../assets/muscles/traps.png'),
  quadriceps: require('../../../assets/muscles/quadriceps.png'),
  calves:     require('../../../assets/muscles/calves.png'),
  glutes:     require('../../../assets/muscles/glutes.png'),
  lats:       require('../../../assets/muscles/lats.png'),
  shoulders:  require('../../../assets/muscles/shoulders.png'),
}

export default function MuscleIcon({ muscle, color, size = 28 }: MuscleIconProps) {
  const source = MUSCLE_IMAGE[muscle]
  if (!source) return null

  return (
    <Image
      source={source}
      style={[styles.icon, { width: size, height: size, tintColor: color }]}
      resizeMode="contain"
    />
  )
}

const styles = StyleSheet.create({
  icon: { opacity: 0.9 },
})
