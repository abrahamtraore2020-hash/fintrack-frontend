'use client'

// Masque africain Baoulé (Côte d'Ivoire) — illustration blanche
export function MaskBaoule({ size = 80, opacity = 0.12, className = '' }: { size?: number; opacity?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 80 104" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
        {/* Visage ovale */}
        <ellipse cx="40" cy="50" rx="26" ry="36" />
        {/* Front décorations */}
        <path d="M28 20 Q40 14 52 20" />
        <path d="M32 16 Q40 10 48 16" />
        {/* Yeux en amande */}
        <ellipse cx="30" cy="44" rx="5" ry="3" />
        <ellipse cx="50" cy="44" rx="5" ry="3" />
        <circle cx="30" cy="44" r="1.5" fill="white" opacity={opacity} />
        <circle cx="50" cy="44" r="1.5" fill="white" opacity={opacity} />
        {/* Nez */}
        <path d="M37 48 Q40 54 43 48" />
        <path d="M35 52 Q40 56 45 52" />
        {/* Bouche */}
        <path d="M33 62 Q40 67 47 62" />
        <path d="M35 64 Q40 68 45 64" />
        {/* Scarifications joues */}
        <line x1="18" y1="46" x2="25" y2="48" />
        <line x1="18" y1="50" x2="25" y2="51" />
        <line x1="18" y1="54" x2="25" y2="54" />
        <line x1="62" y1="46" x2="55" y2="48" />
        <line x1="62" y1="50" x2="55" y2="51" />
        <line x1="62" y1="54" x2="55" y2="54" />
        {/* Coiffe */}
        <path d="M20 22 Q40 4 60 22" />
        <path d="M25 18 L25 8 M32 14 L30 4 M40 12 L40 2 M48 14 L50 4 M55 18 L55 8" />
        {/* Menton */}
        <path d="M32 80 Q40 86 48 80" />
        {/* Oreilles */}
        <path d="M14 48 Q10 52 14 56" />
        <path d="M66 48 Q70 52 66 56" />
      </g>
    </svg>
  )
}

// Masque Dogon (Mali) — illustration blanche
export function MaskDogon({ size = 70, opacity = 0.10, className = '' }: { size?: number; opacity?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.8} viewBox="0 0 70 126" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
        {/* Grande superstructure verticale */}
        <rect x="30" y="2" width="10" height="50" rx="2" />
        <line x1="35" y1="2" x2="35" y2="52" />
        <line x1="32" y1="8" x2="38" y2="8" />
        <line x1="32" y1="16" x2="38" y2="16" />
        <line x1="32" y1="24" x2="38" y2="24" />
        <line x1="32" y1="32" x2="38" y2="32" />
        <line x1="32" y1="40" x2="38" y2="40" />
        {/* Visage rectangulaire */}
        <rect x="18" y="48" width="34" height="44" rx="3" />
        {/* Yeux horizontaux */}
        <rect x="22" y="58" width="10" height="4" rx="1" />
        <rect x="38" y="58" width="10" height="4" rx="1" />
        {/* Nez en T */}
        <line x1="35" y1="62" x2="35" y2="74" />
        <line x1="30" y1="74" x2="40" y2="74" />
        {/* Bouche droite */}
        <line x1="26" y1="82" x2="44" y2="82" />
        <line x1="28" y1="86" x2="42" y2="86" />
        {/* Motifs géométriques */}
        <line x1="18" y1="70" x2="22" y2="70" />
        <line x1="48" y1="70" x2="52" y2="70" />
        {/* Bas du masque */}
        <path d="M18 92 L12 110 M35 92 L35 112 M52 92 L58 110" />
        <line x1="12" y1="110" x2="58" y2="110" />
      </g>
    </svg>
  )
}

// Masque Dan (Côte d'Ivoire / Libéria) — illustration blanche
export function MaskDan({ size = 72, opacity = 0.11, className = '' }: { size?: number; opacity?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 72 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
        {/* Visage rond */}
        <ellipse cx="36" cy="42" rx="28" ry="34" />
        {/* Front bombé */}
        <path d="M16 28 Q36 16 56 28" />
        {/* Yeux ronds expressifs */}
        <circle cx="26" cy="38" r="5" />
        <circle cx="46" cy="38" r="5" />
        <circle cx="26" cy="38" r="2" fill="white" opacity={opacity} />
        <circle cx="46" cy="38" r="2" fill="white" opacity={opacity} />
        {/* Nez large */}
        <path d="M30 44 Q36 48 42 44" />
        <ellipse cx="33" cy="46" rx="3" ry="2" />
        <ellipse cx="39" cy="46" rx="3" ry="2" />
        {/* Lèvres épaisses */}
        <path d="M28 56 Q36 52 44 56" />
        <path d="M28 56 Q36 64 44 56" />
        {/* Scarifications frontales */}
        <line x1="30" y1="22" x2="33" y2="28" />
        <line x1="36" y1="20" x2="36" y2="26" />
        <line x1="42" y1="22" x2="39" y2="28" />
        {/* Trous décoratifs contour */}
        <circle cx="9" cy="42" r="1.5" />
        <circle cx="63" cy="42" r="1.5" />
        <circle cx="12" cy="32" r="1" />
        <circle cx="60" cy="32" r="1" />
        <circle cx="12" cy="52" r="1" />
        <circle cx="60" cy="52" r="1" />
        {/* Menton */}
        <path d="M28 70 Q36 76 44 70" />
      </g>
    </svg>
  )
}

// Pièce FCFA — dessin blanc style illustration
export function CoinFCFA({ size = 64, opacity = 0.10, className = '' }: { size?: number; opacity?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={opacity}>
        <circle cx="32" cy="32" r="28" />
        <circle cx="32" cy="32" r="23" />
        <circle cx="32" cy="32" r="4" />
        {/* Rayons décoratifs */}
        <line x1="32" y1="4" x2="32" y2="10" />
        <line x1="32" y1="54" x2="32" y2="60" />
        <line x1="4" y1="32" x2="10" y2="32" />
        <line x1="54" y1="32" x2="60" y2="32" />
        <line x1="11.5" y1="11.5" x2="15.7" y2="15.7" />
        <line x1="48.3" y1="48.3" x2="52.5" y2="52.5" />
        <line x1="52.5" y1="11.5" x2="48.3" y2="15.7" />
        <line x1="15.7" y1="48.3" x2="11.5" y2="52.5" />
        <text x="32" y="28" textAnchor="middle" fontFamily="Poppins,sans-serif" fontSize="7" fontWeight="700" fill="white" opacity={opacity} stroke="none">FCFA</text>
        <text x="32" y="38" textAnchor="middle" fontFamily="Poppins,sans-serif" fontSize="9" fontWeight="800" fill="white" opacity={opacity} stroke="none">XOF</text>
      </g>
    </svg>
  )
}

// Billet — dessin blanc
export function BilletAfrica({ width = 96, opacity = 0.09, className = '' }: { width?: number; opacity?: number; className?: string }) {
  const h = width * 0.5
  return (
    <svg width={width} height={h} viewBox="0 0 96 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity={opacity}>
        <rect x="3" y="3" width="90" height="42" rx="4" />
        <rect x="7" y="7" width="82" height="34" rx="2" />
        {/* Motif central */}
        <circle cx="48" cy="24" r="10" />
        <circle cx="48" cy="24" r="6" />
        <text x="48" y="27" textAnchor="middle" fontFamily="Poppins,sans-serif" fontSize="7" fontWeight="700" fill="white" opacity={opacity} stroke="none">500</text>
        {/* Lignes décoratives */}
        <line x1="12" y1="14" x2="30" y2="14" />
        <line x1="12" y1="18" x2="26" y2="18" />
        <line x1="12" y1="22" x2="28" y2="22" />
        <line x1="66" y1="14" x2="84" y2="14" />
        <line x1="70" y1="18" x2="84" y2="18" />
        <line x1="68" y1="22" x2="84" y2="22" />
        {/* Coins décoratifs */}
        <path d="M12 34 L12 38 L16 38" />
        <path d="M84 34 L84 38 L80 38" />
        <path d="M12 14 L12 10 L16 10" />
        <path d="M84 14 L84 10 L80 10" />
      </g>
    </svg>
  )
}

// Composition décors — à placer en arrière-plan d'une page
export function BackgroundDecor({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <MaskBaoule  size={160} opacity={0.07} className="absolute -top-8 -right-8 rotate-12" />
      <MaskDogon  size={120} opacity={0.06} className="absolute bottom-10 -left-6 -rotate-6" />
      <MaskDan    size={100} opacity={0.07} className="absolute top-1/2 right-4 rotate-3" />
      <CoinFCFA   size={90}  opacity={0.07} className="absolute top-8 left-1/3" />
      <BilletAfrica width={140} opacity={0.06} className="absolute bottom-16 left-1/4 -rotate-6" />
      <CoinFCFA   size={60}  opacity={0.05} className="absolute bottom-4 right-1/3 rotate-12" />
    </div>
  )
}
