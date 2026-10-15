'use client'

import { useEffect, useState } from 'react'

const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-3 py-2 focus:border-lion-blue focus:outline-none'

export default function InscriptionFormateur({ params }: { params: { code: string } }) {
  const [valide, setValide] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const [piege, setPiege] = useState('')
  const [erreur, setErreur] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch(`/api/formateur/inscription?code=${encodeURIComponent(params.code)}`, { cache: 'no-store' })
      .then(async r => {
        const d = await r.json().catch(() => ({}))
        if (r.ok) {
          setValide(true)
          setNom(d.nom ?? '')
        } else {
          setValide(false)
          setMessage(d.error || 'Lien invalide')
        }
      })
      .catch(() => {
        setValide(false)
        setMessage('Impossible de joindre le serveur')
      })
  }, [params.code])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (password !== confirm) return setErreur('Les deux mots de passe sont différents')
    setBusy(true)
    const r = await fetch('/api/formateur/inscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: params.code, nom, email, password, site: piege }) })
    const d = await r.json().catch(() => ({}))
    if (r.ok) window.location.href = '/formation'
    else {
      setBusy(false)
      setErreur(d.error || 'Erreur, réessayez')
    }
  }

  if (valide === null) return <main className="px-4 py-12 text-center text-lion-ink/60">Chargement…</main>
  if (!valide) return <main className="mx-auto max-w-md px-4 py-12 text-center text-lg">{message}</main>
  const type = visible ? 'text' : 'password'
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-3xl font-bold">Créer mon espace formateur</h1>
      <p className="mt-2 text-lion-ink/80">Vous êtes invité(e) à rejoindre la plateforme. Vous aurez votre propre espace : vos formations, vos directs, vos exercices et vos ateliers.</p>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border-2 border-lion-gold p-5">
        <input className={field} value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" autoComplete="name" />
        <input className={field} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre email" autoComplete="username" inputMode="email" />
        <input className={field} type={type} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe (8 caractères minimum)" autoComplete="new-password" />
        <input className={field} type={type} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirmer le mot de passe" autoComplete="new-password" />
        <input className="hidden" tabIndex={-1} autoComplete="off" value={piege} onChange={e => setPiege(e.target.value)} aria-hidden />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} className="h-4 w-4 accent-lion-blue" />
          Afficher les mots de passe
        </label>
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-lion-gold px-5 py-3 text-lg font-bold text-lion-ink shadow disabled:opacity-60">{busy ? 'Un instant…' : '🚀 Créer mon espace'}</button>
      </form>
    </main>
  )
}
