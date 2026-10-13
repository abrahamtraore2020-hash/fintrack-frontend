'use client'

import { useEffect, useState } from 'react'

const field = 'w-full rounded-lg border border-lion-blue/20 px-3 py-2 focus:border-lion-blue focus:outline-none'
const card = 'space-y-3 rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-5 shadow-sm'

export default function ProfilPage() {
  const [nom, setNom] = useState('')
  const [msgNom, setMsgNom] = useState('')
  const [actuel, setActuel] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [visible, setVisible] = useState(false)
  const [msgMdp, setMsgMdp] = useState('')

  useEffect(() => {
    fetch('/api/formation/profile').then(r => r.json()).then(d => setNom(d.nom ?? '')).catch(() => {})
  }, [])

  const saveNom = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/formation/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom }),
    })
    setMsgNom(res.ok ? '✅ Enregistré' : `❌ ${(await res.json().catch(() => ({}))).error || 'Erreur'}`)
  }

  const saveMdp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nouveau !== confirmation) return setMsgMdp('❌ Les deux nouveaux mots de passe sont différents')
    const res = await fetch('/api/formation/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actuel, nouveau }),
    })
    if (res.ok) {
      setActuel('')
      setNouveau('')
      setConfirmation('')
      setMsgMdp('✅ Mot de passe changé')
    } else setMsgMdp(`❌ ${(await res.json().catch(() => ({}))).error || 'Erreur'}`)
  }

  const type = visible ? 'text' : 'password'
  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-lion-blue">Mon profil</h1>

      <form onSubmit={saveNom} className={card}>
        <h2 className="font-semibold">Mon nom</h2>
        <input className={field} value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" />
        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-lion-blue px-5 py-2 font-semibold text-white">Enregistrer</button>
          {msgNom && <span className="text-sm">{msgNom}</span>}
        </div>
      </form>

      <form onSubmit={saveMdp} className={card}>
        <h2 className="font-semibold">Changer mon mot de passe</h2>
        <input type="text" name="username" autoComplete="username" value="formateur" readOnly hidden />
        <input type={type} autoComplete="current-password" className={field} value={actuel} onChange={e => setActuel(e.target.value)} placeholder="Mot de passe actuel" />
        <input type={type} autoComplete="new-password" className={field} value={nouveau} onChange={e => setNouveau(e.target.value)} placeholder="Nouveau mot de passe (8 caractères minimum)" />
        <input type={type} autoComplete="new-password" className={field} value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder="Confirmer le nouveau mot de passe" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} className="h-4 w-4 accent-lion-blue" />
          Afficher les mots de passe
        </label>
        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-lion-blue px-5 py-2 font-semibold text-white">Changer</button>
          {msgMdp && <span className="text-sm">{msgMdp}</span>}
        </div>
      </form>
    </main>
  )
}
