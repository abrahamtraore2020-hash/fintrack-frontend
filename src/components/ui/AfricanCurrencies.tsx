'use client'

// Pièces et billets des monnaies africaines : FCFA, Cedi, Naira, Shilling, Rand
export function AfricanCoinFCFA({ size = 56, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coinGrad1" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="60%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
      </defs>
      <circle cx="28" cy="28" r="26" fill="url(#coinGrad1)" />
      <circle cx="28" cy="28" r="22" fill="none" stroke="#FEF08A" strokeWidth="1.5" opacity="0.6" />
      <circle cx="28" cy="28" r="18" fill="none" stroke="#FEF08A" strokeWidth="0.5" opacity="0.3" />
      <text x="28" y="25" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="700" fontSize="9" fill="#1A1A00">FCFA</text>
      <text x="28" y="36" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="11" fill="#1A1A00">XOF</text>
      <circle cx="28" cy="28" r="26" fill="none" stroke="#CA8A04" strokeWidth="1.5" />
    </svg>
  )
}

export function AfricanCoinNaira({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coinGrad2" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#coinGrad2)" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="#A7F3D0" strokeWidth="1" opacity="0.5" />
      <text x="24" y="21" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="13" fill="white">₦</text>
      <text x="24" y="31" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="600" fontSize="7" fill="white" opacity="0.9">NGN</text>
      <circle cx="24" cy="24" r="22" fill="none" stroke="#059669" strokeWidth="1.5" />
    </svg>
  )
}

export function AfricanCoinCedi({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coinGrad3" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="60%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#coinGrad3)" />
      <circle cx="22" cy="22" r="16" fill="none" stroke="#BFDBFE" strokeWidth="1" opacity="0.5" />
      <text x="22" y="19" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="12" fill="white">₵</text>
      <text x="22" y="28" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="600" fontSize="6.5" fill="white" opacity="0.9">GHS</text>
      <circle cx="22" cy="22" r="20" fill="none" stroke="#2563EB" strokeWidth="1.5" />
    </svg>
  )
}

export function AfricanCoinRand({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coinGrad4" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="60%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#coinGrad4)" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="#FECACA" strokeWidth="1" opacity="0.5" />
      <text x="20" y="17" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="11" fill="white">R</text>
      <text x="20" y="26" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="600" fontSize="6" fill="white" opacity="0.9">ZAR</text>
      <circle cx="20" cy="20" r="18" fill="none" stroke="#DC2626" strokeWidth="1.5" />
    </svg>
  )
}

export function AfricanCoinShilling({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coinGrad5" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="60%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B0764" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="16" fill="url(#coinGrad5)" />
      <circle cx="18" cy="18" r="12" fill="none" stroke="#E9D5FF" strokeWidth="1" opacity="0.5" />
      <text x="18" y="15" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="9" fill="white">KSh</text>
      <text x="18" y="23" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="600" fontSize="5.5" fill="white" opacity="0.9">KES</text>
      <circle cx="18" cy="18" r="16" fill="none" stroke="#7C3AED" strokeWidth="1.5" />
    </svg>
  )
}

// Illustration hero — groupe de pièces africaines
export function AfricanCurrenciesHero({ className = '' }: { className?: string }) {
  return (
    <div className={`relative select-none ${className}`}>
      <AfricanCoinFCFA size={64} className="animate-float absolute top-0 left-8 drop-shadow-lg" />
      <AfricanCoinNaira size={52} className="animate-float-delay absolute top-4 right-0 drop-shadow-lg" />
      <AfricanCoinCedi size={48} className="animate-float-slow absolute bottom-0 left-0 drop-shadow-lg" />
      <AfricanCoinRand size={42} className="animate-float absolute bottom-2 right-8 drop-shadow-lg" />
      <AfricanCoinShilling size={36} className="animate-float-delay absolute top-14 left-28 drop-shadow-lg" />
      {/* spacer */}
      <div className="w-52 h-32" />
    </div>
  )
}

// Bandeau décoratif pour le dashboard
export function CurrencyBanner({ className = '' }: { className?: string }) {
  const coins = [
    { symbol: 'FCFA', code: 'XOF', color: '#EAB308', flag: '🇨🇮🇸🇳🇧🇯' },
    { symbol: '₦', code: 'NGN', color: '#10B981', flag: '🇳🇬' },
    { symbol: '₵', code: 'GHS', color: '#3B82F6', flag: '🇬🇭' },
    { symbol: 'R', code: 'ZAR', color: '#EF4444', flag: '🇿🇦' },
    { symbol: 'KSh', code: 'KES', color: '#8B5CF6', flag: '🇰🇪' },
    { symbol: 'ETB', code: 'ETB', color: '#F97316', flag: '🇪🇹' },
  ]
  return (
    <div className={`flex items-center gap-3 overflow-x-auto pb-1 ${className}`}>
      {coins.map(c => (
        <div key={c.code} className="flex items-center gap-1.5 bg-white dark:bg-dark-card rounded-xl px-3 py-1.5 border border-gray-100 dark:border-dark-border flex-shrink-0 shadow-sm">
          <span className="text-sm font-bold" style={{ color: c.color }}>{c.symbol}</span>
          <span className="text-[10px] text-gray-400 font-medium">{c.code}</span>
        </div>
      ))}
    </div>
  )
}
