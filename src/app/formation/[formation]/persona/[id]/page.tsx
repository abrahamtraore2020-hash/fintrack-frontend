'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PLATEFORME } from '@/data/formation'
import { resumeFiche, type Fiche } from '@/data/persona'

type Atelier = { id: string; titre: string; ouvert: boolean }
type FicheEleve = { id: string; nom: string; email: string; data: Fiche; updated_at: string }
const small = 'rounded-md border border-lion-blue/20 bg-white px-2.5 py-1 text-sm hover:border-lion-blue disabled:opacity-30'
const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-3 py-2 focus:border-lion-blue focus:outline-none'

export default function AtelierPersonaPage({ params }: { params: { formation: string; id: string } }) {
  const [atelier, setAtelier] = useState<Atelier | null>(null)
  const [fiches, setFiches] = useState<FicheEleve[]>([])
  const [titre, setTitre] = useState('')
  const [ouvert, setOuvert] = useState(true)
  const [message, setMessage] = useState('')
  const [origine, setOrigine] = useState('')
  const [copie, setCopie] = useState('')
  const [deplie, setDeplie] = useState<string | null>(null)

  const charger = () =>
    fetch(`/api/formation/personas/${params.id}`)
      .then(async r => ({ ok: r.ok, d: await r.json().catch(() => ({})) }))
      .then(({ ok, d }) => {
        if (!ok) return setMessage(`❌ ${d.error || 'Atelier introuvable'}`)
        setAtelier(d.atelier)
        setTitre(d.atelier.titre)
        setOuvert(d.atelier.ouvert)
        setFiches(d.fiches)
      })

  useEffect(() => {
    setOrigine(window.location.origin)
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  if (!atelier) return <main className="p-10">{message || 'Chargement…'}</main>

  const enregistrer = async () => {
    const res = await fetch(`/api/formation/personas/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titre, ouvert }) })
    setMessage(res.ok ? '✅ Enregistré' : `❌ ${(await res.json().catch(() => ({}))).error || 'Erreur'}`)
  }
  const supprimer = async () => {
    if (!confirm(`Supprimer l’atelier « ${titre} » et le travail de tous les étudiants ?`)) return
    const res = await fetch(`/api/formation/personas/${params.id}`, { method: 'DELETE' })
    if (res.ok) window.location.href = `/formation/${params.formation}/persona`
    else setMessage(`❌ ${(await res.json().catch(() => ({}))).error || 'Erreur'}`)
  }
  const copier = (cle: string, t: string) => navigator.clipboard.writeText(t).then(() => (setCopie(cle), setTimeout(() => setCopie(''), 2500))).catch(() => {})

  const lien = `${origine}/persona/${params.id}`
  const texteLien = `🧭 ${PLATEFORME.nom} : ${titre}\n\nUn guide en 4 étapes pour trouver ton produit digital et comprendre ton client idéal :\n${lien}`
  const modifie = titre !== atelier.titre || ouvert !== atelier.ouvert

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-28">
      <Link href={`/formation/${params.formation}/persona`} className="text-sm text-lion-blue">← Ateliers persona</Link>
      <h1 className="mt-4 text-2xl font-bold text-lion-blue">🧭 Atelier « Comprendre son persona »</h1>

      <section className="mt-5 space-y-3 rounded-xl border-2 border-lion-gold bg-white p-4">
        <input className={field} value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de l’atelier" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ouvert} onChange={e => setOuvert(e.target.checked)} className="h-4 w-4 accent-lion-blue" />
          Atelier ouvert (les étudiants peuvent commencer avec le lien)
        </label>
      </section>

      <section className="mt-5 space-y-3 rounded-xl border border-lion-blue/15 bg-lion-blue/[0.04] p-4">
        <h2 className="font-semibold text-lion-blue">🔗 Lien à envoyer à vos étudiants</h2>
        {modifie && <p className="text-sm text-amber-700">⚠️ Enregistrez vos modifications avant d’envoyer le lien.</p>}
        <p className="break-all rounded-lg bg-white p-2.5 text-sm">{lien}</p>
        <div className="flex flex-wrap gap-2">
          <button className={small} onClick={() => copier('lien', lien)}>{copie === 'lien' ? '✅ Lien copié' : '📋 Copier le lien'}</button>
          <a className={small} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(texteLien)}`}>💬 Envoyer sur WhatsApp</a>
          <a className={small} target="_blank" rel="noopener noreferrer" href={lien}>👀 Voir ce que voient les étudiants</a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-lion-blue">👥 Travail des étudiants ({fiches.length})</h2>
        <button className={`${small} mt-2`} onClick={charger}>🔄 Actualiser</button>
        {fiches.length === 0 ? (
          <p className="mt-3 text-sm text-lion-ink/60">Aucun étudiant n’a encore commencé.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {fiches.map(f => {
              const ouvertF = deplie === f.id
              const etape = f.data.avatar.situation ? 'Avatar terminé' : f.data.solution ? 'Produit trouvé' : f.data.probleme ? 'Problème écrit' : 'Commencé'
              return (
                <li key={f.id} className="rounded-xl border border-lion-blue/15 bg-white p-3">
                  <button className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setDeplie(ouvertF ? null : f.id)}>
                    <span>
                      <span className="font-semibold">{f.nom}</span> <span className="text-sm text-lion-ink/60">{f.email}</span>
                      {f.data.produit_nom && <span className="block text-sm text-lion-blue">📦 {f.data.produit_nom}{f.data.avatar.nom ? ` · avatar ${f.data.avatar.nom}` : ''}</span>}
                    </span>
                    <span className="rounded-full bg-lion-blue/10 px-2.5 py-0.5 text-xs font-semibold text-lion-blue">{etape}</span>
                  </button>
                  {ouvertF && (
                    <div className="mt-3 space-y-2">
                      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-lion-blue/[0.04] p-3 text-sm">{resumeFiche(f.data)}</pre>
                      <button className={small} onClick={() => copier(f.id, resumeFiche(f.data))}>{copie === f.id ? '✅ Copié' : '📋 Copier cette fiche'}</button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="mt-10 border-t border-lion-blue/10 pt-6">
        <button onClick={supprimer} className="text-sm text-red-600 underline">Supprimer cet atelier</button>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-center gap-4 border-t-2 border-lion-gold bg-white/95 p-3 backdrop-blur">
        <button className="rounded-lg bg-lion-blue px-6 py-2 font-semibold text-white disabled:opacity-50" disabled={!modifie} onClick={enregistrer}>Enregistrer</button>
        {message ? <span className="text-sm">{message}</span> : modifie && <span className="text-sm text-lion-ink/60">Modifications non enregistrées</span>}
      </div>
    </main>
  )
}
