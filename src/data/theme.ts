// Apparence des présentations, réglable par formation.
export type Animation = 'aucune' | 'fondu' | 'glissement' | 'zoom'

export interface Theme {
  fond: string // fond des diapositives de contenu
  section: string // fond de la couverture, des intercalaires et de la fin
  titre: string // couleur des titres
  texte: string // couleur du texte
  accent: string // puces, filets, numéros
  policeTitre: string
  policeTexte: string
  logo: string | null // adresse du logo, ou null pour ne pas en afficher
  animation: Animation
  autoSecondes: number // 0 = pas de défilement automatique
}

export const LOGO_LION = '/lion-attitude-head.png'

export const DEFAULT_THEME: Theme = {
  fond: '#FFFFFF',
  section: '#1D4ED8',
  titre: '#1D4ED8',
  texte: '#0F172A',
  accent: '#F2B705',
  policeTitre: 'Poppins',
  policeTexte: 'Poppins',
  logo: LOGO_LION,
  animation: 'fondu',
  autoSecondes: 0,
}

export const MODELES: { nom: string; theme: Partial<Theme> }[] = [
  { nom: 'Lion Attitude', theme: { fond: '#FFFFFF', section: '#1D4ED8', titre: '#1D4ED8', texte: '#0F172A', accent: '#F2B705', policeTitre: 'Poppins', policeTexte: 'Poppins' } },
  { nom: 'Nuit dorée', theme: { fond: '#0F172A', section: '#020617', titre: '#F2B705', texte: '#E2E8F0', accent: '#F2B705', policeTitre: 'Playfair Display', policeTexte: 'Lato' } },
  { nom: 'Minimal', theme: { fond: '#FFFFFF', section: '#111827', titre: '#111827', texte: '#374151', accent: '#9CA3AF', policeTitre: 'Montserrat', policeTexte: 'Open Sans' } },
  { nom: 'Corporate', theme: { fond: '#F8FAFC', section: '#0B3B60', titre: '#0B3B60', texte: '#1E293B', accent: '#14B8A6', policeTitre: 'Raleway', policeTexte: 'Roboto' } },
  { nom: 'Énergie', theme: { fond: '#FFF7ED', section: '#C2410C', titre: '#9A3412', texte: '#1C1917', accent: '#F59E0B', policeTitre: 'Montserrat', policeTexte: 'Lato' } },
]

// Polices disponibles sur le web (Google Fonts) ; dans PowerPoint, la police doit être installée sur l'ordinateur.
export const POLICES = ['Poppins', 'Montserrat', 'Playfair Display', 'Raleway', 'Lato', 'Open Sans', 'Roboto', 'Merriweather', 'Arial', 'Georgia']
const SYSTEME = ['Arial', 'Georgia']

export function googleFontsUrl(polices: string[]): string | null {
  const web = Array.from(new Set(polices)).filter(p => POLICES.includes(p) && !SYSTEME.includes(p))
  if (!web.length) return null
  return `https://fonts.googleapis.com/css2?${web.map(p => `family=${p.replace(/ /g, '+')}:wght@400;600;700`).join('&')}&display=swap`
}

const HEX = /^#[0-9A-Fa-f]{6}$/

// Complète un thème partiel (ou venant de la base) avec les valeurs par défaut, en ignorant les valeurs invalides.
export function normalizeTheme(t: unknown): Theme {
  const x = (t && typeof t === 'object' ? t : {}) as Partial<Theme>
  const color = (k: keyof Theme) => (typeof x[k] === 'string' && HEX.test(x[k] as string) ? (x[k] as string) : (DEFAULT_THEME[k] as string))
  const font = (k: 'policeTitre' | 'policeTexte') => (typeof x[k] === 'string' && POLICES.includes(x[k]!) ? x[k]! : DEFAULT_THEME[k])
  return {
    fond: color('fond'),
    section: color('section'),
    titre: color('titre'),
    texte: color('texte'),
    accent: color('accent'),
    policeTitre: font('policeTitre'),
    policeTexte: font('policeTexte'),
    logo: x.logo === null ? null : typeof x.logo === 'string' && (x.logo === LOGO_LION || /^https?:\/\//.test(x.logo)) ? x.logo : DEFAULT_THEME.logo,
    animation: (['aucune', 'fondu', 'glissement', 'zoom'] as const).includes(x.animation as Animation) ? (x.animation as Animation) : DEFAULT_THEME.animation,
    autoSecondes: typeof x.autoSecondes === 'number' && x.autoSecondes >= 0 && x.autoSecondes <= 120 ? Math.round(x.autoSecondes) : 0,
  }
}

// Texte blanc sur fond foncé, texte sombre sur fond clair.
export function contraste(hex: string): string {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#0F172A' : '#FFFFFF'
}
