'use client'

import { useEffect, useState } from 'react'

export default function AccesFormation() {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    fetch('/api/formation/status')
      .then(async r => {
        const d = await r.json()
        if (!r.ok) setErreur(d.error)
        else setConfigured(d.configured)
      })
      .catch(() => setErreur('Impossible de joindre le serveur'))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (!configured && password !== confirm) return setErreur('Les deux mots de passe sont différents')
    const res = await fetch(configured ? '/api/formation/login' : '/api/formation/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) window.location.href = '/formation'
    else setErreur((await res.json().catch(() => ({}))).error || 'Erreur')
  }

  const field = 'w-full rounded-md border border-gold/30 bg-transparent px-3 py-2'
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-gold/30 p-6">
        <h1 className="text-xl font-bold">
          {configured === false ? 'Créer votre mot de passe formateur' : 'Accès formateur'}
        </h1>
        {configured === false && (
          <p className="text-sm opacity-70">Première utilisation : choisissez un mot de passe (8 caractères minimum). Il vous sera demandé ensuite.</p>
        )}
        {configured !== null && (
          <>
            <input type="password" className={field} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" autoFocus />
            {!configured && (
              <input type="password" className={field} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirmer le mot de passe" />
            )}
            <button className="w-full rounded-lg bg-gold px-4 py-2 font-semibold text-black">
              {configured ? 'Entrer' : 'Créer et entrer'}
            </button>
          </>
        )}
        {configured === null && !erreur && <p className="text-sm opacity-70">Chargement…</p>}
        {erreur && <p className="text-sm text-red-500">{erreur}</p>}
      </form>
    </main>
  )
}
