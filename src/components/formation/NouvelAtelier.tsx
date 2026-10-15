'use client'

import { useState } from 'react'

export function NouvelAtelier({ formation }: { formation: string }) {
  const [ouvert, setOuvert] = useState(false)
  const [titre, setTitre] = useState('')
  const [erreur, setErreur] = useState('')
  const [busy, setBusy] = useState(false)

  const creer = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErreur('')
    const res = await fetch(`/api/formation/formations/${formation}/personas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titre }) })
    const d = await res.json().catch(() => ({}))
    if (res.ok) window.location.href = `/formation/${formation}/persona/${d.id}`
    else {
      setErreur(d.error || 'Erreur')
      setBusy(false)
    }
  }

  if (!ouvert)
    return (
      <button onClick={() => setOuvert(true)} className="rounded-lg bg-lion-blue px-5 py-2.5 font-semibold text-white">
        + Créer un atelier
      </button>
    )
  return (
    <form onSubmit={creer} className="space-y-3 rounded-xl border-2 border-lion-gold bg-white p-4">
      <h2 className="font-semibold">Nouvel atelier</h2>
      <input className="w-full rounded-lg border border-lion-blue/20 px-3 py-2 focus:border-lion-blue focus:outline-none" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre (ex. Trouver mon produit digital)" autoFocus />
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      <div className="flex gap-2">
        <button disabled={busy || !titre.trim()} className="rounded-lg bg-lion-blue px-5 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Création…' : 'Créer'}</button>
        <button type="button" onClick={() => setOuvert(false)} className="rounded-lg border border-lion-blue/20 px-4 py-2">Annuler</button>
      </div>
    </form>
  )
}
