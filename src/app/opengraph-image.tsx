import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FINTRACK — Gérez vos finances avec intelligence'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 60%, #0a0a0a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow effect */}
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* Logo */}
        <div style={{ fontSize: 72, marginBottom: 16 }}>💰</div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{ fontSize: 80, fontWeight: 800, color: 'white', letterSpacing: '-3px' }}>
            FIN
          </span>
          <span style={{ fontSize: 80, fontWeight: 800, color: '#F0B429', letterSpacing: '-3px' }}>
            TRACK
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 28, color: '#9CA3AF', marginTop: 12,
          letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500,
        }}>
          Track · Analyze · Improve
        </div>

        {/* Description */}
        <div style={{
          fontSize: 22, color: '#D1D5DB', marginTop: 28,
          textAlign: 'center', maxWidth: 750, lineHeight: 1.5,
        }}>
          La solution financière conçue pour l'Afrique
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {['Wave', 'Orange Money', 'MTN', 'Banques africaines'].map(label => (
            <div key={label} style={{
              background: 'rgba(240,180,41,0.15)',
              border: '1px solid rgba(240,180,41,0.35)',
              color: '#F0B429',
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 600,
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
