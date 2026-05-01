import { useState, useRef } from 'react'
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
import { router } from 'expo-router'
import { startAnalysis, uploadPhoto, triggerProcessing } from '../../src/services/analysis.service'
import { HumanSilhouette } from '../../src/components/camera/HumanSilhouette'

type CaptureStep = 'front' | 'back'
type ScreenState = 'camera' | 'preview'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [step, setStep] = useState<CaptureStep>('front')
  const [screenState, setScreenState] = useState<ScreenState>('camera')
  const [frontPhotoUri, setFrontPhotoUri] = useState<string | null>(null)
  const [backPhotoUri, setBackPhotoUri] = useState<string | null>(null)
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  if (!permission) return <View style={styles.container} />

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Precisamos de acesso à câmera para a análise.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false })
    if (!photo) return

    // Validação real de tamanho via expo-file-system
    const info = await FileSystem.getInfoAsync(photo.uri)
    const fileSize = (info as FileSystem.FileInfo & { size?: number }).size
    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      Alert.alert('Foto muito grande', 'Cada foto deve ter no máximo 10 MB. Tente novamente.')
      return
    }

    setPreviewUri(photo.uri)
    if (step === 'front') setFrontPhotoUri(photo.uri)
    else setBackPhotoUri(photo.uri)

    setScreenState('preview')
  }

  const handleRetake = () => {
    setPreviewUri(null)
    setScreenState('camera')
  }

  const handleConfirm = async () => {
    if (step === 'front') {
      setStep('back')
      setScreenState('camera')
      setPreviewUri(null)
      return
    }

    // Ambas as fotos confirmadas — iniciar upload
    if (!frontPhotoUri || !backPhotoUri) return
    await handleUploadAndProcess(frontPhotoUri, backPhotoUri)
  }

  const handleUploadAndProcess = async (frontUri: string, backUri: string) => {
    setIsUploading(true)
    try {
      const { analysis_id, upload_urls } = await startAnalysis()

      await uploadPhoto(upload_urls.front, frontUri)
      await uploadPhoto(upload_urls.back, backUri)

      await triggerProcessing(analysis_id)

      router.push(`/(app)/analysis/${analysis_id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      if (msg === 'SUBSCRIPTION_REQUIRED') {
        router.push('/(app)/paywall')
      } else {
        Alert.alert('Erro', `Falha ao processar: ${msg}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  if (screenState === 'preview' && previewUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepLabel}>
          {step === 'front' ? 'Foto Frontal — Confirmar?' : 'Foto de Costas — Confirmar?'}
        </Text>
        <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        <View style={styles.previewButtons}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Text style={styles.retakeText}>Refazer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>{step === 'front' ? 'Confirmar →' : 'Enviar para Análise'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>
          Foto {step === 'front' ? '1' : '2'} de 2 — {step === 'front' ? 'Frente' : 'Costas'}
        </Text>
        <View style={styles.stepDots}>
          <View style={[styles.dot, step === 'front' && styles.dotActive]} />
          <View style={[styles.dot, step === 'back' && styles.dotActive]} />
        </View>
      </View>

      <CameraView ref={cameraRef} style={styles.camera} facing={step === 'front' ? 'front' : 'back' as CameraType}>
        <HumanSilhouette facing={step} />
        <Text style={styles.instruction}>
          {step === 'front'
            ? 'Fique de frente, braços levemente afastados'
            : 'Vire de costas, postura ereta'}
        </Text>
      </CameraView>

      <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
        <View style={styles.captureInner} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionText: { color: '#fff', textAlign: 'center', margin: 24, fontSize: 16 },
  camera: { flex: 1 },
  stepIndicator: { paddingTop: 60, paddingBottom: 12, alignItems: 'center', backgroundColor: '#000' },
  stepText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stepDots: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#444' },
  dotActive: { backgroundColor: '#4CAF50' },
  instruction: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
  },
  captureButton: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  preview: { flex: 1, width: '100%' },
  previewButtons: { flexDirection: 'row', padding: 24, gap: 12, backgroundColor: '#000' },
  retakeButton: {
    flex: 1, padding: 16, borderRadius: 12,
    backgroundColor: '#1A1A1A', alignItems: 'center',
  },
  retakeText: { color: '#fff', fontSize: 16 },
  confirmButton: {
    flex: 2, padding: 16, borderRadius: 12,
    backgroundColor: '#4CAF50', alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stepLabel: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 24, paddingTop: 60, backgroundColor: '#000' },
  button: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, margin: 24, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
