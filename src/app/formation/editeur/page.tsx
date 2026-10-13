'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Episode, Lecon } from '@/data/formation'

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'episode'

const input = 'w-full rounded-md border border-lion-gold/30 bg-transparent px-3 py-2'
const small = 'rounded-md border border-lion-gold/30 px-2 py-1 text-sm disabled:opacity-30'

export default function EditeurPage() {
  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/formation/episodes')
      .then(r => r.json())
      .then(d => setEpisodes(d.episodes))
      .catch(() => setMessage('Impossible de charger les épisodes'))
  }, [])

  if (!episodes) return <main className="p-10">{message || 'Chargement…'}</main>

  const update = (i: number, patch: Partial<Episode>) =>
    setEpisodes(episodes.map((e, k) => (k === i ? { ...e, ...patch } : e)))
  const move = <T,>(arr: T[], i: number, d: number) => {
    const copy = [...arr]
    ;[copy[i], copy[i + d]] = [copy[i + d], copy[i]]
    return copy
  }
  const updateLecon = (i: number, j: number, patch: Partial<Lecon>) =>
    update(i, { lecons: episodes[i].lecons.map((l, k) => (k === j ? { ...l, ...patch } : l)) })

  const addEpisode = () => {
    let slug = 'nouvel-episode'
    for (let n = 2; episodes.some(e => e.slug === slug); n++) slug = `nouvel-episode-${n}`
    setEpisodes([...episodes, { slug, numero: episodes.length + 1, titre: 'Nouvel épisode', resume: '', lecons: [] }])
  }

  const save = async () => {
    setSaving(true)
    setMessage('')
    // Les épisodes créés ici prennent un identifiant (adresse) dérivé de leur titre.
    const used = new Set<string>()
    const prepared = episodes.map((e, i) => {
      let slug = e.slug.startsWith('nouvel-episode') ? slugify(e.titre) : e.slug
      for (let n = 2; used.has(slug); n++) slug = `${slugify(e.titre)}-${n}`
      used.add(slug)
      return { ...e, numero: i + 1, slug }
    })
    const res = await fetch('/api/formation/episodes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ episodes: prepared }),
    })
    const d = await res.json().catch(() => ({}))
    setMessage(res.ok ? '✅ Enregistré' : `❌ ${d.error || 'Erreur'}`)
    setSaving(false)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 pb-28">
      <Link href="/formation" className="text-sm text-lion-gold">← Retour à la formation</Link>
      <h1 className="mt-4 text-2xl font-bold">Modifier la formation</h1>

      <div className="mt-6 space-y-6">
        {episodes.map((e, i) => (
          <section key={e.slug + i} className="rounded-xl border border-lion-gold/30 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lion-gold font-semibold">Épisode {i + 1}</span>
              <span className="ml-auto flex gap-1">
                <button className={small} disabled={i === 0} onClick={() => setEpisodes(move(episodes, i, -1))}>↑</button>
                <button className={small} disabled={i === episodes.length - 1} onClick={() => setEpisodes(move(episodes, i, 1))}>↓</button>
                <button className={small} onClick={() => confirm(`Supprimer « ${e.titre} » ?`) && setEpisodes(episodes.filter((_, k) => k !== i))}>🗑️</button>
              </span>
            </div>
            <input className={input} value={e.titre} onChange={ev => update(i, { titre: ev.target.value })} placeholder="Titre de l’épisode" />
            <textarea className={input} rows={2} value={e.resume} onChange={ev => update(i, { resume: ev.target.value })} placeholder="Résumé" />

            {e.lecons.map((l, j) => (
              <div key={j} className="rounded-lg border border-lion-gold/20 p-3 space-y-2">
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
                  onBlur={() => updateLecon(i, j, { points: l.points.filter(p => p.trim() !== '') })}
                  placeholder="Un point par ligne"
                />
              </div>
            ))}
            <button className={small} onClick={() => update(i, { lecons: [...e.lecons, { titre: 'Nouvelle leçon', points: [] }] })}>
              + Ajouter une leçon
            </button>
          </section>
        ))}
        <button className="rounded-lg border border-lion-gold px-4 py-2" onClick={addEpisode}>+ Ajouter un épisode</button>
      </div>

      <div className="fixed bottom-0 inset-x-0 border-t border-lion-gold/30 bg-white/90 backdrop-blur p-3 flex items-center justify-center gap-4">
        <button className="rounded-lg bg-lion-gold px-6 py-2 font-semibold text-black disabled:opacity-50" disabled={saving} onClick={save}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {message && <span>{message}</span>}
      </div>
    </main>
  )
}
