'use client'

import { useState } from 'react'

export default function AccesFormation() {
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/formation/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) window.location.href = '/formation'
    else setErreur('Mot de passe incorrect')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-gold/30 p-6">
        <h1 className="text-xl font-bold">Accès formateur</h1>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full rounded-md border border-gold/30 bg-transparent px-3 py-2"
          autoFocus
        />
        {erreur && <p className="text-sm text-red-500">{erreur}</p>}
        <button className="w-full rounded-lg bg-gold px-4 py-2 font-semibold text-black">Entrer</button>
      </form>
    </main>
  )
}
