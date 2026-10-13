'use client'

import { useEffect, useState } from 'react'

export default function AccesFormation() {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [erreur, setErreur] = useState('')
  const [visible, setVisible] = useState(false)
  const [remember, setRemember] = useState(true)

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
      body: JSON.stringify({ password, remember }),
    })
    if (res.ok) window.location.href = '/formation'
    else setErreur((await res.json().catch(() => ({}))).error || 'Erreur')
  }

  const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-3 py-2 focus:border-lion-blue focus:outline-none'
  return (
    <main className="flex min-h-[calc(100vh-81px)] flex-col items-center justify-center gap-6 px-4 py-10">
      <img src="/lion-attitude-logo.webp" alt="Lion Attitude" className="w-48 rounded-xl" />
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-lion-blue/15 border-t-4 border-t-lion-gold bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-lion-blue">
          {configured === false ? 'Créer votre mot de passe formateur' : 'Accès formateur'}
        </h1>
        {configured === false && (
          <p className="text-sm opacity-70">Première utilisation : choisissez un mot de passe (8 caractères minimum). Il vous sera demandé ensuite.</p>
        )}
        {configured !== null && (
          <>
            {/* Identifiant caché : permet au navigateur de proposer d'enregistrer le mot de passe */}
            <input type="text" name="username" autoComplete="username" value="formateur" readOnly hidden />
            <div className="relative">
              <input
                type={visible ? 'text' : 'password'}
                name="password"
                autoComplete={configured ? 'current-password' : 'new-password'}
                className={`${field} pr-12`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setVisible(v => !v)}
                aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute inset-y-0 right-0 px-3 text-lg"
              >
                {visible ? '🙈' : '👁️'}
              </button>
            </div>
            {!configured && (
              <input
                type={visible ? 'text' : 'password'}
                name="confirm"
                autoComplete="new-password"
                className={field}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirmer le mot de passe"
              />
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 accent-lion-blue" />
              Se souvenir de moi (30 jours)
            </label>
            <button className="w-full rounded-lg bg-lion-blue px-4 py-2 font-semibold text-white">
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
