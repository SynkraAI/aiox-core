import { ImageResponse } from 'next/og'

export const alt = 'Tocks Custom - Mesas de Bilhar Artesanais'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
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
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: '2px solid #C9A96E',
            display: 'flex',
          }}
        />

        {/* Inner decorative corners */}
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 36,
            width: 40,
            height: 40,
            borderTop: '1px solid #C9A96E',
            borderLeft: '1px solid #C9A96E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 36,
            right: 36,
            width: 40,
            height: 40,
            borderTop: '1px solid #C9A96E',
            borderRight: '1px solid #C9A96E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 36,
            width: 40,
            height: 40,
            borderBottom: '1px solid #C9A96E',
            borderLeft: '1px solid #C9A96E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 36,
            width: 40,
            height: 40,
            borderBottom: '1px solid #C9A96E',
            borderRight: '1px solid #C9A96E',
            display: 'flex',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: '#C9A96E',
            marginBottom: 32,
            display: 'flex',
          }}
        />

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
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
            width: 120,
            height: 1,
            backgroundColor: '#C9A96E',
            marginTop: 28,
            marginBottom: 28,
            display: 'flex',
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
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
            bottom: 48,
            fontSize: 16,
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
