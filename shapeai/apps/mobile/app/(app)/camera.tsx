import { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { startAnalysis, uploadPhoto, triggerProcessing } from '../../src/services/analysis.service'
import { HumanSilhouette } from '../../src/components/camera/HumanSilhouette'

type CaptureStep = 'front' | 'back'
type ScreenState = 'camera' | 'preview'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

const STEP_CONFIG: Record<CaptureStep, { label: string; number: number; instruction: string }> = {
  front: {
    label: 'Frente',
    number: 1,
    instruction: 'Fique de frente, braços levemente afastados do corpo',
  },
  back: {
    label: 'Costas',
    number: 2,
    instruction: 'Vire de costas, braços levemente afastados',
  },
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [step, setStep] = useState<CaptureStep>('front')
  const [screenState, setScreenState] = useState<ScreenState>('camera')
  const [frontPhotoUri, setFrontPhotoUri] = useState<string | null>(null)
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  // Reset completo toda vez que a tela recebe foco — o Tabs navigator
  // mantém componentes montados, então o estado anterior persiste.
  useFocusEffect(
    useCallback(() => {
      setStep('front')
      setScreenState('camera')
      setFrontPhotoUri(null)
      setPreviewUri(null)
      setIsUploading(false)
    }, [])
  )

  if (!permission) return <View style={styles.container} />

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={56} color="#4CAF50" />
        <Text style={styles.permissionTitle}>Câmera necessária</Text>
        <Text style={styles.permissionText}>Precisamos de acesso à câmera para a análise de shape.</Text>
        <TouchableOpacity style={styles.actionButton} onPress={requestPermission}>
          <Text style={styles.actionButtonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const validatePhoto = async (uri: string): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const info = await FileSystem.getInfoAsync(uri, { size: true } as any)
      const fileSize = info.exists && 'size' in info ? (info.size as number) : null
      if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
        Alert.alert('Foto muito grande', 'Cada foto deve ter no máximo 10 MB. Tente novamente.')
        return false
      }
    } catch {
      // size check indisponível — prosseguir
    }
    return true
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false })
    if (!photo) return
    if (!(await validatePhoto(photo.uri))) return
    setPreviewUri(photo.uri)
    setScreenState('preview')
  }

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    })
    if (result.canceled || !result.assets[0]) return
    const uri = result.assets[0].uri
    if (!(await validatePhoto(uri))) return
    setPreviewUri(uri)
    setScreenState('preview')
  }

  const handleRetake = () => {
    setPreviewUri(null)
    setScreenState('camera')
  }

  const handleRetakeFront = () => {
    setFrontPhotoUri(null)
    setStep('front')
    setPreviewUri(null)
    setScreenState('camera')
  }

  const handleConfirm = async () => {
    if (!previewUri) return

    if (step === 'front') {
      setFrontPhotoUri(previewUri)
      setPreviewUri(null)
      setStep('back')
      setScreenState('camera')
      return
    }

    // Ambas confirmadas — iniciar upload
    if (!frontPhotoUri) return
    const backUri = previewUri
    setIsUploading(true)
    try {
      const { analysis_id, upload_urls } = await startAnalysis()
      await Promise.all([
        uploadPhoto(upload_urls.front, frontPhotoUri),
        uploadPhoto(upload_urls.back, backUri),
      ])
      await triggerProcessing(analysis_id)
      router.push(`/(app)/analysis/${analysis_id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      if (msg === 'SUBSCRIPTION_REQUIRED') {
        router.push('/(app)/paywall')
      } else {
        Alert.alert('Erro', `Falha ao processar: ${msg}`)
      }
      setIsUploading(false)
    }
  }

  if (isUploading) {
    return (
      <View style={styles.uploadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.uploadingText}>Enviando fotos...</Text>
      </View>
    )
  }

  if (screenState === 'preview' && previewUri) {
    const config = STEP_CONFIG[step]
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.stepLabel}>Foto {config.number} de 2 — {config.label}</Text>
        </View>
        <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        <View style={styles.previewButtons}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retakeText}>Refazer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>
              {step === 'back' ? 'Enviar para Análise' : 'Confirmar →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const config = STEP_CONFIG[step]

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.stepInfo}>
          <Text style={styles.stepText}>Foto {config.number} de 2 — {config.label}</Text>
          <View style={styles.stepDots}>
            <View style={[styles.dot, step === 'front' ? styles.dotActive : styles.dotDone]} />
            <View style={[styles.dot, step === 'back' && styles.dotActive]} />
          </View>
        </View>
        {/* Botão refazer frente quando está no passo de costas */}
        {step === 'back' && frontPhotoUri ? (
          <TouchableOpacity style={styles.retakeFrontButton} onPress={handleRetakeFront}>
            <Image source={{ uri: frontPhotoUri }} style={styles.retakeFrontThumb} />
            <View style={styles.retakeFrontOverlay}>
              <Ionicons name="refresh-outline" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {/* Câmera — sempre traseira */}
      <CameraView ref={cameraRef} style={styles.camera} facing={'back' as CameraType}>
        <HumanSilhouette facing={step} />
        <Text style={styles.instruction}>{config.instruction}</Text>
      </CameraView>

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.galleryButton} onPress={handlePickFromGallery}>
          <Ionicons name="images-outline" size={26} color="#fff" />
          <Text style={styles.galleryText}>Galeria</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <View style={{ width: 70 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  permissionContainer: {
    flex: 1, backgroundColor: '#0A0A0A',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  permissionTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  permissionText: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 32 },
  actionButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, paddingHorizontal: 32 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  uploadingContainer: {
    flex: 1, backgroundColor: '#0A0A0A',
    justifyContent: 'center', alignItems: 'center', gap: 16,
  },
  uploadingText: { color: '#fff', fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#000',
  },
  backButton: {
    width: 38, height: 38,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 19,
  },
  stepInfo: { flex: 1, alignItems: 'center' },
  stepText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  stepDots: { flexDirection: 'row', gap: 6, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  dotActive: { backgroundColor: '#4CAF50' },
  dotDone: { backgroundColor: '#2E7D32' },

  retakeFrontButton: {
    width: 38, height: 38, borderRadius: 8,
    overflow: 'hidden', borderWidth: 1.5, borderColor: '#4CAF50',
  },
  retakeFrontThumb: { width: '100%', height: '100%' },
  retakeFrontOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', paddingVertical: 2,
  },

  camera: { flex: 1 },
  instruction: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: '85%',
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  galleryButton: { width: 70, alignItems: 'center', gap: 4 },
  galleryText: { color: '#aaa', fontSize: 11 },
  captureButton: {
    width: 76, height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },

  topBar: { paddingTop: 56, paddingBottom: 12, alignItems: 'center', backgroundColor: '#000' },
  stepLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
  preview: { flex: 1, width: '100%' },
  previewButtons: { flexDirection: 'row', padding: 20, gap: 12, backgroundColor: '#000' },
  retakeButton: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#1A1A1A', alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  retakeText: { color: '#fff', fontSize: 15 },
  confirmButton: {
    flex: 2, padding: 14, borderRadius: 12,
    backgroundColor: '#4CAF50', alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
