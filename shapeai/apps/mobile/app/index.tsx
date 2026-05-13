import { useEffect, useRef } from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/stores/auth.store'
import { View, Text, Image, StyleSheet, Animated } from 'react-native'

function LoadingScreen() {
  const pulse = useRef(new Animated.Value(0.4)).current
  const bar = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(bar, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(bar, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const barTranslate = bar.interpolate({ inputRange: [0, 1], outputRange: [-160, 160] })

  return (
    <View style={s.container}>
      <Animated.Image
        source={require('../assets/splash-icon.png')}
        style={[s.logo, { opacity: pulse }]}
        resizeMode="contain"
      />
    </View>
  )
}

export default function Index() {
  const { session, isGuest, isLoading } = useAuthStore()
  if (isLoading) return <LoadingScreen />

  if (!session && !isGuest) return <Redirect href="/(auth)/login" />
  return <Redirect href="/(app)" />
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logo: {
    width: 280,
    height: 280,
  },
})
