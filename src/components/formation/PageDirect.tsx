'use client'

import { useEffect, useState } from 'react'

const AVANCE = 15 // minutes avant le début : ouverture de la salle

const pad = (n: number) => String(n).padStart(2, '0')
const d2 = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const j = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return { j, h, m, s: s % 60 }
}
const dateIcs = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function PageDirect({ id, titre, formation, debut, fin, duree }: { id: string; titre: string; formation: string; debut: string; fin: string; duree: number }) {
  const [now, setNow] = useState<number | null>(null)
  const [lien, setLien] = useState<string | null>(null)
  const [nom, setNom] = useState('')
  const [contact, setContact] = useState('')
  const [piege, setPiege] = useState('')
  const [etat, setEtat] = useState<'saisie' | 'envoi' | 'ok' | 'deja'>('saisie')
  const [erreur, setErreur] = useState('')
  const [pageUrl, setPageUrl] = useState('')

  const t0 = new Date(debut).getTime()
  const t1 = new Date(fin).getTime()
  const ouverture = t0 - AVANCE * 60_000

  // Horloge ; le lien est demandé au serveur dès que la salle ouvre (il n'est jamais dans la page avant).
  useEffect(() => {
    setNow(Date.now())
    setPageUrl(window.location.href)
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const ouverte = now !== null && now >= ouverture && now < t1
  useEffect(() => {
    if (!ouverte || lien) return
    let actif = true
    const demander = () =>
      fetch(`/api/direct/${id}/etat`, { cache: 'no-store' })
        .then(r => r.json())
        .then(d => actif && d.lien && setLien(d.lien))
        .catch(() => {})
    demander()
    const t = setInterval(demander, 10_000)
    return () => {
      actif = false
      clearInterval(t)
    }
  }, [ouverte, lien, id])

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setEtat('envoi')
    const res = await fetch(`/api/direct/${id}/inscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, contact, site: piege }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.doublon) return setEtat('deja')
    if (res.ok) return setEtat('ok')
    setErreur(d.error || 'Erreur, réessayez')
    setEtat('saisie')
  }

  const quand = (opts: Intl.DateTimeFormatOptions) => new Date(debut).toLocaleString('fr-FR', opts)
  const agenda = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: titre,
    dates: `${dateIcs(debut)}/${dateIcs(fin)}`,
    details: `Rejoignez le direct depuis cette page : ${pageUrl}`,
    location: pageUrl,
  })}`
  const termine = now !== null && now >= t1
  const c = now !== null ? d2(t0 - now) : null
  const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-4 py-3 text-base focus:border-lion-blue focus:outline-none'

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <p className="text-sm font-medium uppercase tracking-wider text-lion-blue">🔴 Direct · {formation}</p>
      <h1 className="mt-1 text-3xl font-bold">{titre}</h1>
      <p className="mt-3 text-lg first-letter:uppercase text-lion-ink/80">
        {quand({ weekday: 'long', day: 'numeric', month: 'long' })} · {quand({ hour: '2-digit', minute: '2-digit' })} · {duree} min
      </p>

      {/* Compte à rebours / salle */}
      <div className="mt-6 rounded-2xl bg-lion-blue p-6 text-center text-white">
        {now === null ? (
          <p className="py-6">…</p>
        ) : termine ? (
          <p className="py-4 text-lg font-semibold">Ce direct est terminé. Merci d’avoir participé !</p>
        ) : ouverte ? (
          <>
            <p className="text-lg font-semibold">{now >= t0 ? '🔴 Le direct a commencé' : '🟢 La salle est ouverte'}</p>
            {lien ? (
              <a href={lien} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-xl bg-lion-gold px-8 py-3 text-lg font-bold text-lion-ink shadow-lg">
                🎥 Rejoindre le direct
              </a>
            ) : (
              <p className="mt-3 opacity-80">Chargement du lien…</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-widest opacity-80">Début dans</p>
            <p className="mt-2 flex justify-center gap-3 font-bold tabular-nums">
              {[
                [c!.j, 'j'],
                [c!.h, 'h'],
                [c!.m, 'min'],
                [c!.s, 's'],
              ].map(([v, u]) => (
                <span key={u as string} className="min-w-[3.5rem] rounded-lg bg-white/15 px-2 py-2">
                  <span className="block text-3xl">{pad(v as number)}</span>
                  <span className="text-xs font-normal opacity-80">{u}</span>
                </span>
              ))}
            </p>
            <p className="mt-4 text-sm opacity-80">Le bouton « Rejoindre » apparaîtra ici {AVANCE} minutes avant le début.</p>
          </>
        )}
      </div>

      {!termine && (
        <>
          <section className="mt-8 rounded-2xl border-2 border-lion-gold p-5">
            {etat === 'ok' || etat === 'deja' ? (
              <div className="text-center">
                <p className="text-xl font-bold">{etat === 'ok' ? '✅ Inscription enregistrée !' : '✅ Vous êtes déjà inscrit(e)'}</p>
                <p className="mt-2 text-lion-ink/75">Ajoutez la séance à votre agenda pour être prévenu(e) automatiquement avant le début.</p>
              </div>
            ) : (
              <form onSubmit={envoyer} className="space-y-3">
                <h2 className="text-xl font-bold">✍️ Je m’inscris</h2>
                <p className="text-sm text-lion-ink/70">Pour recevoir le rappel de la séance.</p>
                <input className={field} value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" autoComplete="name" required />
                <input className={field} value={contact} onChange={e => setContact(e.target.value)} placeholder="Numéro WhatsApp (+225…) ou email" autoComplete="tel" inputMode="email" required />
                {/* Champ piège : invisible pour les humains */}
                <input className="hidden" tabIndex={-1} autoComplete="off" value={piege} onChange={e => setPiege(e.target.value)} aria-hidden />
                {erreur && <p className="text-sm text-red-600">{erreur}</p>}
                <button disabled={etat === 'envoi'} className="w-full rounded-xl bg-lion-blue px-5 py-3 text-lg font-bold text-white disabled:opacity-60">
                  {etat === 'envoi' ? 'Envoi…' : 'Je m’inscris'}
                </button>
                <p className="text-xs text-lion-ink/60">Vos coordonnées servent uniquement à vous rappeler cette séance.</p>
              </form>
            )}
          </section>

          <section className="mt-5 space-y-2">
            <h2 className="font-semibold">🔔 Ne manquez pas la séance</h2>
            <div className="flex flex-wrap gap-2">
              <a href={agenda} target="_blank" rel="noopener noreferrer" className="rounded-lg border-2 border-lion-blue px-4 py-2 font-semibold text-lion-blue">
                📅 Google Agenda
              </a>
              <a href={`/api/direct/${id}/ics`} className="rounded-lg border-2 border-lion-blue px-4 py-2 font-semibold text-lion-blue">
                📲 iPhone / autre agenda
              </a>
            </div>
            <p className="text-xs text-lion-ink/60">Vous serez prévenu(e) 30 minutes puis 5 minutes avant, directement par votre téléphone.</p>
          </section>
        </>
      )}
    </main>
  )
}
