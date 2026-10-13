'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PLATEFORME } from '@/data/formation'
import { dateLongue, etat, heure, invitation, type Direct, type Etat } from '@/data/direct'

type Groupe = { slug: string; titre: string; directs: Direct[] }
type Ligne = Direct & { formation: string }
const VIDE = { titre: '', debut: '', duree: 60, lien: '', formation: '' }

// L'heure courante n'est connue qu'après le chargement (évite un décalage entre serveur et navigateur).
export function useMaintenant() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now
}

const BADGE: Record<Etat, { texte: string; cls: string }> = {
  'en-direct': { texte: '🔴 EN DIRECT', cls: 'bg-red-600 text-white animate-pulse' },
  bientot: { texte: '⏰ Bientôt', cls: 'bg-lion-gold text-lion-ink' },
  'a-venir': { texte: 'À venir', cls: 'bg-lion-blue/10 text-lion-blue' },
  termine: { texte: 'Terminé', cls: 'bg-gray-100 text-gray-500' },
}

// Directs d'une formation (fixe = son adresse) ou de toutes les formations, avec choix de la formation.
export function DirectsPanel({ formations, fixe }: { formations: Groupe[]; fixe?: string }) {
  const router = useRouter()
  const now = useMaintenant()
  const [form, setForm] = useState<typeof VIDE & { id?: string; origine?: string } | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [copie, setCopie] = useState<string | null>(null)
  const [voirPasses, setVoirPasses] = useState(false)

  const groupes = fixe ? formations.filter(f => f.slug === fixe) : formations
  const titreDe = (slug: string) => formations.find(f => f.slug === slug)?.titre ?? ''
  const lignes: Ligne[] = groupes
    .flatMap(g => g.directs.map(d => ({ ...d, formation: g.slug })))
    .sort((a, b) => a.debut.localeCompare(b.debut))

  const enregistrer = async (slug: string, liste: Direct[]) => {
    const res = await fetch(`/api/formation/formations/${slug}/directs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directs: liste }),
    })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) setMessage(`❌ ${d.error || 'Erreur'}`)
    return res.ok
  }
  const directsDe = (slug: string) => formations.find(f => f.slug === slug)?.directs ?? []

  const nouveau = () => {
    setMessage('')
    setForm({ ...VIDE, formation: fixe ?? (formations.length === 1 ? formations[0].slug : '') })
  }

  const valider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    if (!form.formation) return setMessage('❌ Choisissez la formation')
    if (!/^https:\/\//.test(form.lien.trim())) return setMessage('❌ Collez le lien de la réunion (il commence par https://meet.google.com/…)')
    const direct: Direct = { id: form.id ?? crypto.randomUUID(), titre: form.titre.trim(), debut: form.debut, duree: Number(form.duree), lien: form.lien.trim() }
    setBusy(true)
    setMessage('')
    let ok: boolean
    if (form.id && form.origine === form.formation) {
      ok = await enregistrer(form.formation, directsDe(form.formation).map(d => (d.id === form.id ? direct : d)))
    } else {
      // Nouveau direct, ou direct déplacé vers une autre formation
      ok = await enregistrer(form.formation, [...directsDe(form.formation), direct])
      if (ok && form.id && form.origine) ok = await enregistrer(form.origine, directsDe(form.origine).filter(d => d.id !== form.id))
    }
    setBusy(false)
    if (ok) {
      setForm(null)
      router.refresh()
    }
  }

  const supprimer = async (d: Ligne) => {
    if (!confirm(`Supprimer le direct « ${d.titre} » ?`)) return
    setBusy(true)
    if (await enregistrer(d.formation, directsDe(d.formation).filter(x => x.id !== d.id))) router.refresh()
    setBusy(false)
  }

  const copier = async (d: Ligne) => {
    await navigator.clipboard.writeText(invitation(d, PLATEFORME.nom, titreDe(d.formation))).catch(() => {})
    setCopie(d.id)
    setTimeout(() => setCopie(null), 2500)
  }

  const avenir = lignes.filter(d => !now || etat(d, now) !== 'termine')
  const passes = now ? lignes.filter(d => etat(d, now) === 'termine').reverse() : []
  const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-3 py-2 focus:border-lion-blue focus:outline-none'
  const small = 'rounded-lg border border-lion-blue/20 bg-white px-3 py-1.5 text-sm hover:border-lion-blue'

  const carte = (d: Ligne) => {
    const e = now ? etat(d, now) : 'a-venir'
    const chaud = e === 'en-direct' || e === 'bientot'
    return (
      <li key={d.id} className={`rounded-xl border bg-white p-4 shadow-sm ${chaud ? 'border-red-300 ring-2 ring-red-100' : 'border-lion-blue/15'}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[e].cls}`}>{BADGE[e].texte}</span>
            <h3 className="mt-1.5 text-lg font-semibold">{d.titre}</h3>
            <p className="text-sm capitalize text-lion-ink/70">
              {dateLongue(d)} · {heure(d)} · {d.duree} min
            </p>
            {!fixe && (
              <Link href={`/formation/${d.formation}`} className="text-sm text-lion-blue underline">
                Formation : {titreDe(d.formation)}
              </Link>
            )}
          </div>
          {e !== 'termine' && (
            <a
              href={d.lien}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-lg px-4 py-2 font-semibold text-white ${chaud ? 'bg-red-600 hover:bg-red-700' : 'bg-lion-blue hover:bg-lion-blue/90'}`}
            >
              {e === 'en-direct' ? '🎥 Rejoindre maintenant' : '🎥 Ouvrir Google Meet'}
            </a>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={small} onClick={() => copier(d)}>{copie === d.id ? '✅ Copiée' : '📋 Copier l’invitation'}</button>
          <a className={small} href={`https://wa.me/?text=${encodeURIComponent(invitation(d, PLATEFORME.nom, titreDe(d.formation)))}`} target="_blank" rel="noopener noreferrer">
            💬 Envoyer sur WhatsApp
          </a>
          <button className={small} onClick={() => (setMessage(''), setForm({ titre: d.titre, debut: d.debut, duree: d.duree, lien: d.lien, formation: d.formation, id: d.id, origine: d.formation }))}>
            ✏️ Modifier
          </button>
          <button className={`${small} text-red-600`} disabled={busy} onClick={() => supprimer(d)} aria-label="Supprimer le direct">🗑️</button>
        </div>
      </li>
    )
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-lion-blue">{fixe ? '🔴 Directs' : '🔴 Mes directs'}</h2>
        {!form && formations.length > 0 && (
          <button className="rounded-lg bg-lion-blue px-4 py-2 font-semibold text-white" onClick={nouveau}>
            + Programmer un direct
          </button>
        )}
      </div>

      {form && (
        <form onSubmit={valider} className="mt-4 space-y-3 rounded-xl border-2 border-lion-gold bg-white p-4">
          <h3 className="font-semibold">{form.id ? 'Modifier le direct' : 'Nouveau direct'}</h3>
          {!fixe && (
            <label className="block space-y-1">
              <span className="text-sm text-lion-ink/70">Formation</span>
              <select className={field} required value={form.formation} onChange={e => setForm({ ...form, formation: e.target.value })}>
                <option value="">— Choisissez la formation —</option>
                {formations.map(f => <option key={f.slug} value={f.slug}>{f.titre}</option>)}
              </select>
            </label>
          )}
          <input className={field} required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Titre (ex. Séance 1 : Qui suis-je ?)" />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm text-lion-ink/70">Date et heure</span>
              <input type="datetime-local" required className={field} value={form.debut} onChange={e => setForm({ ...form, debut: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-lion-ink/70">Durée</span>
              <select className={field} value={form.duree} onChange={e => setForm({ ...form, duree: Number(e.target.value) })}>
                {[30, 45, 60, 90, 120, 180].map(m => <option key={m} value={m}>{m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' 30' : ''}`}</option>)}
              </select>
            </label>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-lion-ink/70">Lien Google Meet</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input className={field} required value={form.lien} onChange={e => setForm({ ...form, lien: e.target.value })} placeholder="https://meet.google.com/abc-defg-hij" />
              <a href="https://meet.new" target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg border-2 border-lion-blue px-3 py-2 text-center text-sm font-semibold text-lion-blue">
                ➕ Créer un lien Meet
              </a>
            </div>
            <p className="text-xs text-lion-ink/60">
              « Créer un lien Meet » ouvre une nouvelle réunion Google Meet dans un autre onglet : copiez son adresse (en haut de la page) et collez-la ici.
            </p>
          </div>
          {message && <p className="text-sm text-red-600">{message}</p>}
          <div className="flex gap-2">
            <button disabled={busy} className="rounded-lg bg-lion-blue px-5 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
            <button type="button" className="rounded-lg border border-lion-blue/20 px-4 py-2" onClick={() => setForm(null)}>Annuler</button>
          </div>
        </form>
      )}
      {!form && message && <p className="mt-3 text-sm text-red-600">{message}</p>}

      {avenir.length === 0 && !form ? (
        <p className="mt-4 rounded-xl border-2 border-dashed border-lion-blue/20 p-6 text-center text-lion-ink/70">
          Aucun direct programmé. Cliquez sur « Programmer un direct » pour préparer votre prochaine séance Google Meet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">{avenir.map(carte)}</ul>
      )}

      {passes.length > 0 && (
        <div className="mt-4">
          <button className="text-sm text-lion-blue underline" onClick={() => setVoirPasses(v => !v)}>
            {voirPasses ? 'Masquer' : 'Voir'} les directs passés ({passes.length})
          </button>
          {voirPasses && <ul className="mt-3 space-y-3 opacity-80">{passes.map(carte)}</ul>}
        </div>
      )}
    </section>
  )
}

// Bandeau rappelant un direct en cours ou imminent (pages de formation et de module).
export function LiveBanner({ directs }: { directs: Direct[] }) {
  const now = useMaintenant()
  if (!now) return null
  const d = directs.find(x => etat(x, now) === 'en-direct') ?? directs.find(x => etat(x, now) === 'bientot')
  if (!d) return null
  const live = etat(d, now) === 'en-direct'
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ${live ? 'bg-red-600 text-white' : 'bg-lion-gold text-lion-ink'}`}>
      <span className="font-semibold">
        {live ? '🔴 EN DIRECT' : `⏰ Direct à ${heure(d)}`} : {d.titre}
      </span>
      <a href={d.lien} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white px-4 py-1.5 font-semibold text-lion-ink">
        🎥 Rejoindre sur Google Meet
      </a>
    </div>
  )
}
