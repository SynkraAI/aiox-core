import { ImageResponse } from 'next/og'

export const alt = 'Tocks Custom - Mesas de Bilhar Artesanais'
export const size = { width: 1200, height: 600 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0A',
          position: 'relative',
        }}
      >
        {/* Gold border frame */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: '2px solid #C9A96E',
            display: 'flex',
          }}
        />

        {/* Inner decorative corners */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 32,
            width: 36,
            height: 36,
            borderTop: '1px solid #C9A96E',
            borderLeft: '1px solid #C9A96E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 32,
            right: 32,
            width: 36,
            height: 36,
            borderTop: '1px solid #C9A96E',
            borderRight: '1px solid #C9A96E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: 32,
            width: 36,
            height: 36,
            borderBottom: '1px solid #C9A96E',
            borderLeft: '1px solid #C9A96E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            width: 36,
            height: 36,
            borderBottom: '1px solid #C9A96E',
            borderRight: '1px solid #C9A96E',
            display: 'flex',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            width: 72,
            height: 2,
            backgroundColor: '#C9A96E',
            marginBottom: 28,
            display: 'flex',
          }}
        />

        {/* Main title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '0.12em',
            lineHeight: 1,
            display: 'flex',
          }}
        >
          TOCKS CUSTOM
        </div>

        {/* Divider */}
        <div
          style={{
            width: 100,
            height: 1,
            backgroundColor: '#C9A96E',
            marginTop: 24,
            marginBottom: 24,
            display: 'flex',
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: '#C9A96E',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          Mesas de Bilhar Artesanais
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 42,
            fontSize: 15,
            color: '#666666',
            letterSpacing: '0.15em',
            display: 'flex',
          }}
        >
          tockscustom.com.br
        </div>
      </div>
    ),
    { ...size },
  )
}
