// Séance en direct (Google Meet ou autre lien de visioconférence).
export interface Direct {
  id: string
  titre: string
  debut: string // date et heure locales « AAAA-MM-JJTHH:MM » (heure du formateur)
  duree: number // minutes
  lien: string
  module?: string // adresse du module présenté, facultatif
}

const DEBUT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

export function normalizeDirects(v: unknown): Direct[] {
  if (!Array.isArray(v)) return []
  return v
    .filter(d => d && typeof d === 'object')
    .map(d => d as Partial<Direct>)
    .filter(d => typeof d.id === 'string' && typeof d.titre === 'string' && typeof d.debut === 'string' && DEBUT.test(d.debut) && typeof d.lien === 'string' && /^https:\/\//.test(d.lien))
    .map(d => ({
      id: d.id!,
      titre: d.titre!.slice(0, 200),
      debut: d.debut!,
      duree: typeof d.duree === 'number' && d.duree > 0 && d.duree <= 600 ? Math.round(d.duree) : 60,
      lien: d.lien!,
      ...(typeof d.module === 'string' && d.module ? { module: d.module } : {}),
    }))
    .sort((a, b) => a.debut.localeCompare(b.debut))
}

// L'heure saisie est celle du formateur : on la lit comme une heure locale du navigateur.
export const debutDate = (d: Direct) => new Date(d.debut)
export const finDate = (d: Direct) => new Date(debutDate(d).getTime() + d.duree * 60_000)

export type Etat = 'en-direct' | 'bientot' | 'a-venir' | 'termine'
export function etat(d: Direct, now = new Date()): Etat {
  if (now >= finDate(d)) return 'termine'
  if (now >= debutDate(d)) return 'en-direct'
  if (debutDate(d).getTime() - now.getTime() < 2 * 3600_000) return 'bientot'
  return 'a-venir'
}

export function dateLongue(d: Direct) {
  return debutDate(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}
export function heure(d: Direct) {
  return debutDate(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function invitation(d: Direct, plateforme: string, formation: string) {
  return [
    `🔴 DIRECT ${plateforme.toUpperCase()}`,
    `${formation} : ${d.titre}`,
    '',
    `📅 ${dateLongue(d)}`,
    `⏰ ${heure(d)} (durée ${d.duree} min)`,
    '',
    `👉 Rejoindre : ${d.lien}`,
    '',
    'Connectez-vous 5 minutes avant. À tout à l’heure !',
  ].join('\n')
}
