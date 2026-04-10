'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

interface TableProps {
  woodColor: string
  fabricColor: string
}

/* ────────────────────────────────────────────
   Pocket positions — 4 corners + 2 mid-sides
   ──────────────────────────────────────────── */
const POCKET_POSITIONS: [number, number, number][] = [
  [-1.9, 0.18, -0.9],   // top-left
  [1.9, 0.18, -0.9],    // top-right
  [-1.9, 0.18, 0.9],    // bottom-left
  [1.9, 0.18, 0.9],     // bottom-right
  [0, 0.18, -0.9],      // mid-top
  [0, 0.18, 0.9],       // mid-bottom
]

/* ────────────────────────────────────────────
   Leg positions — 4 corners, slightly inset
   ──────────────────────────────────────────── */
const LEG_POSITIONS: [number, number, number][] = [
  [-1.95, -0.65, -1.0],
  [1.95, -0.65, -1.0],
  [-1.95, -0.65, 1.0],
  [1.95, -0.65, 1.0],
]

function Table({ woodColor, fabricColor }: TableProps) {
  const groupRef = useRef<THREE.Group>(null)

  /* ── Materials (created once, colors lerped each frame) ── */
  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: woodColor,
        roughness: 0.4,
        metalness: 0.1,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const fabricMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: fabricColor,
        roughness: 0.9,
        metalness: 0,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const cushionMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: fabricColor,
        roughness: 0.85,
        metalness: 0,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const pocketMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a0a0a',
        roughness: 0.95,
        metalness: 0,
      }),
    [],
  )

  /* ── Shared geometries (created once) ── */
  const geo = useMemo(() => ({
    frame: new THREE.BoxGeometry(4.4, 0.2, 2.4),
    surface: new THREE.BoxGeometry(3.8, 0.05, 1.8),
    leg: new THREE.BoxGeometry(0.15, 1.5, 0.15),
    pocket: new THREE.SphereGeometry(0.08, 16, 16),
    // Rails — long sides
    railLong: new THREE.BoxGeometry(3.8, 0.15, 0.28),
    // Rails — short sides
    railShort: new THREE.BoxGeometry(0.28, 0.15, 1.8),
    // Cushions — long sides (slightly smaller than rails, sits on top-inside)
    cushionLong: new THREE.BoxGeometry(3.7, 0.1, 0.12),
    // Cushions — short sides
    cushionShort: new THREE.BoxGeometry(0.12, 0.1, 1.7),
    // Decorative apron — long sides (below frame, between legs)
    apronLong: new THREE.BoxGeometry(3.6, 0.12, 0.06),
    // Decorative apron — short sides
    apronShort: new THREE.BoxGeometry(0.06, 0.12, 1.6),
  }), [])

  /* ── Frame loop: auto-rotate + color lerp ── */
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
    }

    const targetWood = new THREE.Color(woodColor)
    const targetFabric = new THREE.Color(fabricColor)
    const targetCushion = new THREE.Color(fabricColor).multiplyScalar(0.7)

    const lerpSpeed = delta * 3
    woodMaterial.color.lerp(targetWood, lerpSpeed)
    fabricMaterial.color.lerp(targetFabric, lerpSpeed)
    cushionMaterial.color.lerp(targetCushion, lerpSpeed)
  })

  return (
    <group ref={groupRef}>
      {/* ── Frame / table body ── */}
      <mesh
        geometry={geo.frame}
        material={woodMaterial}
        position={[0, 0.1, 0]}
        castShadow
        receiveShadow
      />

      {/* ── Playing surface (felt) ── */}
      <mesh
        geometry={geo.surface}
        material={fabricMaterial}
        position={[0, 0.225, 0]}
        receiveShadow
      />

      {/* ── Rails (wood) ── */}
      {/* Long rails — front and back */}
      <mesh
        geometry={geo.railLong}
        material={woodMaterial}
        position={[0, 0.325, -1.04]}
        castShadow
      />
      <mesh
        geometry={geo.railLong}
        material={woodMaterial}
        position={[0, 0.325, 1.04]}
        castShadow
      />
      {/* Short rails — left and right */}
      <mesh
        geometry={geo.railShort}
        material={woodMaterial}
        position={[-2.04, 0.325, 0]}
        castShadow
      />
      <mesh
        geometry={geo.railShort}
        material={woodMaterial}
        position={[2.04, 0.325, 0]}
        castShadow
      />

      {/* ── Rail cushions (fabric, darker) ── */}
      {/* Long cushions */}
      <mesh
        geometry={geo.cushionLong}
        material={cushionMaterial}
        position={[0, 0.3, -0.84]}
      />
      <mesh
        geometry={geo.cushionLong}
        material={cushionMaterial}
        position={[0, 0.3, 0.84]}
      />
      {/* Short cushions */}
      <mesh
        geometry={geo.cushionShort}
        material={cushionMaterial}
        position={[-1.84, 0.3, 0]}
      />
      <mesh
        geometry={geo.cushionShort}
        material={cushionMaterial}
        position={[1.84, 0.3, 0]}
      />

      {/* ── Decorative aprons (wood, below frame) ── */}
      <mesh
        geometry={geo.apronLong}
        material={woodMaterial}
        position={[0, -0.05, -1.15]}
      />
      <mesh
        geometry={geo.apronLong}
        material={woodMaterial}
        position={[0, -0.05, 1.15]}
      />
      <mesh
        geometry={geo.apronShort}
        material={woodMaterial}
        position={[-2.15, -0.05, 0]}
      />
      <mesh
        geometry={geo.apronShort}
        material={woodMaterial}
        position={[2.15, -0.05, 0]}
      />

      {/* ── Legs ── */}
      {LEG_POSITIONS.map((pos, i) => (
        <mesh
          key={`leg-${i}`}
          geometry={geo.leg}
          material={woodMaterial}
          position={pos}
          castShadow
        />
      ))}

      {/* ── Pockets ── */}
      {POCKET_POSITIONS.map((pos, i) => (
        <mesh
          key={`pocket-${i}`}
          geometry={geo.pocket}
          material={pocketMaterial}
          position={pos}
        />
      ))}
    </group>
  )
}

/* ────────────────────────────────────────────
   Exported wrapper with Canvas, lights, controls
   ──────────────────────────────────────────── */

interface BilliardTableViewerProps {
  woodColor: string
  fabricColor: string
  className?: string
}

export default function BilliardTableViewer({
  woodColor,
  fabricColor,
  className = '',
}: BilliardTableViewerProps) {
  return (
    <div className={`w-full aspect-[4/3] ${className}`}>
      <Canvas
        camera={{ position: [4, 3, 4], fov: 40 }}
        dpr={[1, 2]}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-3, 5, -3]} intensity={0.3} />
        <pointLight position={[3, 2, -2]} intensity={0.15} color="#fff5e6" />

        <Table woodColor={woodColor} fabricColor={fabricColor} />

        <ContactShadows
          position={[0, -1.41, 0]}
          opacity={0.4}
          blur={2}
          far={4}
        />
        <Environment preset="studio" />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={4}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  )
}
