// Séance en direct (Google Meet ou autre lien de visioconférence).
export interface Direct {
  id: string
  titre: string
  debut: string // date et heure « AAAA-MM-JJTHH:MM » telles que saisies par le formateur
  fuseau?: string // fuseau horaire du formateur (ex. Africa/Abidjan) ; absent sur les anciens directs
  duree: number // minutes
  lien: string
  module?: string // ancien champ (module présenté), conservé pour les directs déjà enregistrés
}

const DEBUT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

function fuseauValide(z: unknown): z is string {
  if (typeof z !== 'string' || !z) return false
  try {
    new Intl.DateTimeFormat('fr-FR', { timeZone: z })
    return true
  } catch {
    return false
  }
}

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
      ...(fuseauValide(d.fuseau) ? { fuseau: d.fuseau } : {}),
      duree: typeof d.duree === 'number' && d.duree > 0 && d.duree <= 600 ? Math.round(d.duree) : 60,
      lien: d.lien!,
      ...(typeof d.module === 'string' && d.module ? { module: d.module } : {}),
    }))
    .sort((a, b) => a.debut.localeCompare(b.debut))
}

// Convertit « 2026-10-13T20:00 » vu dans le fuseau donné en instant universel (même résultat sur le serveur et dans le navigateur).
function instantDepuis(debut: string, fuseau: string): Date {
  const [d, h] = debut.split('T')
  const [y, mo, da] = d.split('-').map(Number)
  const [hh, mm] = h.split(':').map(Number)
  const voulu = Date.UTC(y, mo - 1, da, hh, mm)
  const decalage = (t: number) => {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', { timeZone: fuseau, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        .formatToParts(new Date(t))
        .map(x => [x.type, x.value]),
    )
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t
  }
  let t = voulu - decalage(voulu)
  t = voulu - decalage(t) // 2e passage : heures proches d'un changement d'heure
  return new Date(t)
}

// Anciens directs sans fuseau : lus comme une heure locale du navigateur.
export const debutDate = (d: Direct) => (d.fuseau ? instantDepuis(d.debut, d.fuseau) : new Date(d.debut))
export const finDate = (d: Direct) => new Date(debutDate(d).getTime() + d.duree * 60_000)

export type Etat = 'en-direct' | 'bientot' | 'a-venir' | 'termine'
export function etat(d: Direct, now = new Date()): Etat {
  if (now >= finDate(d)) return 'termine'
  if (now >= debutDate(d)) return 'en-direct'
  if (debutDate(d).getTime() - now.getTime() < 2 * 3600_000) return 'bientot'
  return 'a-venir'
}

// Le lien de la réunion n'est révélé aux inscrits que 15 minutes avant le début.
export const AVANCE_MINUTES = 15
export const salleOuverte = (d: Direct, now = new Date()) =>
  now.getTime() >= debutDate(d).getTime() - AVANCE_MINUTES * 60_000 && now < finDate(d)

export function dateLongue(d: Direct) {
  return debutDate(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}
export function heure(d: Direct) {
  return debutDate(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Message à envoyer à l'avance : il pointe vers la page d'inscription, pas vers la réunion.
export function invitation(d: Direct, plateforme: string, formation: string, pageUrl: string) {
  return [
    `🔴 DIRECT ${plateforme.toUpperCase()}`,
    `${formation} : ${d.titre}`,
    '',
    `📅 ${dateLongue(d)}`,
    `⏰ ${heure(d)} (durée ${d.duree} min)`,
    '',
    `✍️ Inscrivez-vous pour recevoir le rappel et le lien de la réunion :`,
    pageUrl,
  ].join('\n')
}

const dateIcs = (t: Date) => t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

// Lien « Ajouter à Google Agenda » (le lien Meet reste caché : l'événement renvoie vers la page d'inscription).
export function lienGoogleAgenda(d: Direct, pageUrl: string) {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: d.titre,
    dates: `${dateIcs(debutDate(d))}/${dateIcs(finDate(d))}`,
    details: `Rejoignez le direct depuis cette page : ${pageUrl}`,
    location: pageUrl,
  })
  return `https://calendar.google.com/calendar/render?${q}`
}

const echapper = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

// Fichier agenda (.ics) avec deux rappels : 30 minutes et 5 minutes avant.
export function fichierIcs(d: Direct, pageUrl: string, plateforme: string) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${plateforme}//Direct//FR`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${d.id}@${plateforme.toLowerCase().replace(/\s+/g, '-')}`,
    `DTSTAMP:${dateIcs(new Date())}`,
    `DTSTART:${dateIcs(debutDate(d))}`,
    `DTEND:${dateIcs(finDate(d))}`,
    `SUMMARY:${echapper(d.titre)}`,
    `DESCRIPTION:${echapper(`Rejoignez le direct depuis cette page : ${pageUrl}`)}`,
    `URL:${pageUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${echapper(`Direct dans 30 minutes : ${d.titre}`)}`,
    'TRIGGER:-PT30M',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${echapper(`Direct dans 5 minutes : ${d.titre}`)}`,
    'TRIGGER:-PT5M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export interface Inscription {
  id: string
  nom: string
  contact: string
  canal: 'whatsapp' | 'email'
  created_at: string
}

export type Verif = { ok: true; nom: string; contact: string; canal: 'whatsapp' | 'email' } | { ok: false; erreur: string }

// Vérifie et nettoie une inscription : nom + (email ou numéro WhatsApp avec indicatif pays).
export function verifierInscription(nom: unknown, contact: unknown): Verif {
  const n = typeof nom === 'string' ? nom.trim().replace(/\s+/g, ' ') : ''
  const c = typeof contact === 'string' ? contact.trim() : ''
  if (n.length < 2 || n.length > 80) return { ok: false, erreur: 'Indiquez votre nom' }
  if (c.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c) || c.length > 120) return { ok: false, erreur: 'Adresse email invalide' }
    return { ok: true, nom: n, contact: c.toLowerCase(), canal: 'email' }
  }
  const chiffres = c.replace(/[^\d]/g, '')
  if (chiffres.length < 8 || chiffres.length > 15 || /[^\d\s+().-]/.test(c))
    return { ok: false, erreur: 'Numéro WhatsApp invalide : ajoutez l’indicatif du pays (ex. +225…)' }
  return { ok: true, nom: n, contact: chiffres, canal: 'whatsapp' }
}
