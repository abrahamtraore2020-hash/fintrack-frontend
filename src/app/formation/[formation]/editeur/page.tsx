'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { Episode, Lecon } from '@/data/formation'
import { slugify } from '@/lib/slug'
import { uploadImage } from '@/lib/resizeImage'
import { DEFAULT_THEME, type Theme } from '@/data/theme'
import { ThemeEditor } from '@/components/formation/ThemeEditor'

const input = 'w-full rounded-lg border border-lion-blue/20 bg-white px-3 py-2 focus:border-lion-blue focus:outline-none'
const small = 'rounded-md border border-lion-blue/20 px-2 py-1 text-sm disabled:opacity-30'
const NOUVEAU = 'nouveau-module'

const move = <T,>(arr: T[], i: number, d: number) => {
  const copy = [...arr]
  ;[copy[i], copy[i + d]] = [copy[i + d], copy[i]]
  return copy
}

export default function EditeurPage({ params }: { params: { formation: string } }) {
  const router = useRouter()
  const [titre, setTitre] = useState('')
  const [sousTitre, setSousTitre] = useState('')
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)
  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  // Dernier état connu du formulaire (lu par save, même appelé après un envoi d'image) et dernier état enregistré
  const form = useRef({ titre, sousTitre, theme, episodes })
  form.current = { titre, sousTitre, theme, episodes }
  const enregistre = useRef('')
  const modifie = episodes !== null && JSON.stringify(form.current) !== enregistre.current

  useEffect(() => {
    if (!modifie) return
    const avertir = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [modifie])

  useEffect(() => {
    // Ignore une réponse arrivée après coup : elle écraserait les modifications en cours
    let actif = true
    fetch(`/api/formation/formations/${params.formation}`)
      .then(r => r.json())
      .then(d => {
        if (!actif) return
        if (!d.formation) return setMessage(d.error || 'Formation introuvable')
        setTitre(d.formation.titre)
        setSousTitre(d.formation.sousTitre)
        setTheme(d.formation.theme ?? DEFAULT_THEME)
        const eps: Episode[] = d.formation.episodes
        // Arrivée par « Ajouter un module » : un module vide est prêt à remplir
        if (new URLSearchParams(window.location.search).has('nouveau')) {
          eps.push({ slug: `${NOUVEAU}-${Date.now()}`, numero: eps.length + 1, titre: '', resume: '', lecons: [{ titre: '', points: [] }] })
        }
        enregistre.current = JSON.stringify({ titre: d.formation.titre, sousTitre: d.formation.sousTitre, theme: d.formation.theme ?? DEFAULT_THEME, episodes: d.formation.episodes })
        setEpisodes(eps)
      })
      .catch(() => actif && setMessage('Impossible de charger la formation'))
    return () => {
      actif = false
    }
  }, [params.formation])

  if (!episodes) return <main className="p-10">{message || 'Chargement…'}</main>

  const update = (i: number, patch: Partial<Episode>) => setEpisodes(episodes.map((e, k) => (k === i ? { ...e, ...patch } : e)))
  const updateLecon = (i: number, j: number, patch: Partial<Lecon>) =>
    update(i, { lecons: episodes[i].lecons.map((l, k) => (k === j ? { ...l, ...patch } : l)) })

  // Remplace les images d'une leçon et enregistre aussitôt, pour ne jamais les perdre en quittant la page.
  const changerImages = (i: number, j: number, images: (prev: string[]) => string[]) => {
    const next = form.current.episodes!.map((e, k) =>
      k !== i ? e : { ...e, lecons: e.lecons.map((l, m) => (m !== j ? l : { ...l, images: images(l.images ?? []) })) },
    )
    setEpisodes(next)
    save({ episodes: next })
  }

  const addImages = async (i: number, j: number, files: FileList | null) => {
    if (!files?.length) return
    setUploading(`${i}-${j}`)
    setMessage('')
    const urls: string[] = []
    for (const f of Array.from(files)) {
      try {
        urls.push(await uploadImage(f))
      } catch (err) {
        setMessage(`❌ ${f.name} : ${(err as Error).message}`)
      }
    }
    setUploading(null)
    if (urls.length) changerImages(i, j, prev => [...prev, ...urls])
  }

  const save = async (changes: Partial<typeof form.current> = {}) => {
    const { titre, sousTitre, theme, episodes } = { ...form.current, ...changes }
    if (!episodes) return
    if (episodes.some(e => !e.titre.trim())) return setMessage('❌ Donnez un titre à chaque module, puis cliquez sur Enregistrer')
    setSaving(true)
    setMessage('')
    // Les modules créés ici prennent une adresse dérivée de leur titre.
    const used = new Set<string>()
    const prepared = episodes.map((e, i) => {
      const base = e.slug.startsWith(NOUVEAU) ? slugify(e.titre) : e.slug
      let slug = base
      for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`
      used.add(slug)
      return { ...e, numero: i + 1, slug, lecons: e.lecons.map(l => ({ ...l, points: l.points.filter(p => p.trim()) })) }
    })
    const res = await fetch(`/api/formation/formations/${params.formation}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre, sousTitre, episodes: prepared, theme }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok) {
      enregistre.current = JSON.stringify({ titre, sousTitre, theme, episodes: prepared })
      setEpisodes(prepared)
      setMessage('✅ Enregistré')
      router.refresh() // les pages de la formation afficheront la nouvelle version
    } else setMessage(`❌ ${d.error || 'Erreur'}`)
    setSaving(false)
  }

  const supprimerFormation = async () => {
    if (!confirm(`Supprimer définitivement la formation « ${titre} » et tous ses modules ?`)) return
    const res = await fetch(`/api/formation/formations/${params.formation}`, { method: 'DELETE' })
    if (res.ok) window.location.href = '/formation'
    else setMessage(`❌ ${(await res.json().catch(() => ({}))).error || 'Erreur'}`)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-28">
      <Link
        href={`/formation/${params.formation}`}
        onClick={e => modifie && !confirm('Vos modifications ne sont pas enregistrées. Quitter quand même ?') && e.preventDefault()}
        className="text-sm text-lion-blue"
      >
        ← Retour à la formation
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-lion-blue">Modifier la formation</h1>

      <section className="mt-6 space-y-3 rounded-xl border-2 border-lion-gold bg-white p-4">
        <input className={input} value={titre} onChange={e => setTitre(e.target.value)} placeholder="Nom de la formation" />
        <textarea className={input} rows={2} value={sousTitre} onChange={e => setSousTitre(e.target.value)} placeholder="Description" />
      </section>

      <div className="mt-6">
        <ThemeEditor theme={theme} onChange={setTheme} formationTitre={titre} episode={episodes.find(e => e.lecons.length > 0)} />
      </div>

      <div className="mt-6 space-y-6">
        {episodes.map((e, i) => (
          <section key={e.slug} className="space-y-3 rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lion-blue">Module {i + 1}</span>
              <span className="ml-auto flex gap-1">
                <button className={small} disabled={i === 0} onClick={() => setEpisodes(move(episodes, i, -1))}>↑</button>
                <button className={small} disabled={i === episodes.length - 1} onClick={() => setEpisodes(move(episodes, i, 1))}>↓</button>
                <button className={small} onClick={() => confirm(`Supprimer le module « ${e.titre || 'sans titre'} » ?`) && setEpisodes(episodes.filter((_, k) => k !== i))}>🗑️</button>
              </span>
            </div>
            <input className={input} value={e.titre} onChange={ev => update(i, { titre: ev.target.value })} placeholder="Titre du module" />
            <textarea className={input} rows={2} value={e.resume} onChange={ev => update(i, { resume: ev.target.value })} placeholder="Résumé" />

            {e.lecons.map((l, j) => (
              <div key={j} className="space-y-2 rounded-lg border border-lion-blue/10 bg-lion-blue/[0.03] p-3">
                <div className="flex gap-2">
                  <input className={input} value={l.titre} onChange={ev => updateLecon(i, j, { titre: ev.target.value })} placeholder="Titre de la leçon" />
                  <button className={small} disabled={j === 0} onClick={() => update(i, { lecons: move(e.lecons, j, -1) })}>↑</button>
                  <button className={small} disabled={j === e.lecons.length - 1} onClick={() => update(i, { lecons: move(e.lecons, j, 1) })}>↓</button>
                  <button className={small} onClick={() => update(i, { lecons: e.lecons.filter((_, k) => k !== j) })}>🗑️</button>
                </div>
                <textarea
                  className={input}
                  rows={Math.max(2, l.points.length)}
                  value={l.points.join('\n')}
                  onChange={ev => updateLecon(i, j, { points: ev.target.value.split('\n') })}
                  placeholder="Un point par ligne"
                />
                {!!l.images?.length && (
                  <div className="flex flex-wrap gap-2">
                    {l.images.map((src, k) => (
                      <div key={src} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-20 w-28 rounded-md border border-lion-blue/15 object-cover" />
                        <button
                          aria-label="Retirer l’image"
                          onClick={() => changerImages(i, j, prev => prev.filter((_, m) => m !== k))}
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-600 text-xs text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`${small} inline-block cursor-pointer`}>
                  {uploading === `${i}-${j}` ? 'Envoi…' : '📷 Ajouter des images'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    hidden
                    disabled={uploading !== null}
                    onChange={ev => {
                      addImages(i, j, ev.target.files)
                      ev.target.value = ''
                    }}
                  />
                </label>
              </div>
            ))}
            <button className={small} onClick={() => update(i, { lecons: [...e.lecons, { titre: '', points: [] }] })}>+ Ajouter une leçon</button>
          </section>
        ))}
        <button
          className="rounded-lg border-2 border-lion-blue px-4 py-2 font-semibold text-lion-blue"
          onClick={() => setEpisodes([...episodes, { slug: `${NOUVEAU}-${Date.now()}`, numero: episodes.length + 1, titre: '', resume: '', lecons: [{ titre: '', points: [] }] }])}
        >
          + Ajouter un module
        </button>
        <div className="border-t border-lion-blue/10 pt-6">
          <button onClick={supprimerFormation} className="text-sm text-red-600 underline">Supprimer cette formation</button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-center gap-4 border-t-2 border-lion-gold bg-white/95 p-3 backdrop-blur">
        <button className="rounded-lg bg-lion-blue px-6 py-2 font-semibold text-white disabled:opacity-50" disabled={saving} onClick={() => save()}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {modifie && !message.startsWith('❌') ? <span className="text-sm text-lion-ink/60">Modifications non enregistrées</span> : message && <span>{message}</span>}
      </div>
    </main>
  )
}
