'use client'

import { useState } from 'react'

export function CreateFormation() {
  const [open, setOpen] = useState(false)
  const [titre, setTitre] = useState('')
  const [sousTitre, setSousTitre] = useState('')
  const [erreur, setErreur] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErreur('')
    const res = await fetch('/api/formation/formations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre, sousTitre }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok) window.location.href = `/formation/${d.slug}`
    else {
      setErreur(d.error || 'Erreur')
      setBusy(false)
    }
  }

  const field = 'w-full rounded-lg border border-lion-blue/20 px-3 py-2 focus:border-lion-blue focus:outline-none'
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-lion-blue px-5 py-2.5 font-semibold text-white hover:bg-lion-blue/90">
        + Créer une formation
      </button>
    )
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border-2 border-lion-gold bg-white p-5">
      <h2 className="text-lg font-semibold">Nouvelle formation</h2>
      <input className={field} value={titre} onChange={e => setTitre(e.target.value)} placeholder="Nom de la formation" autoFocus />
      <textarea className={field} rows={2} value={sousTitre} onChange={e => setSousTitre(e.target.value)} placeholder="Description (facultatif)" />
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      <div className="flex gap-2">
        <button disabled={busy || !titre.trim()} className="rounded-lg bg-lion-blue px-5 py-2 font-semibold text-white disabled:opacity-50">
          {busy ? 'Création…' : 'Créer'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-lion-blue/20 px-4 py-2">Annuler</button>
      </div>
    </form>
  )
}
