'use client'

import { useCallback, useEffect, useState } from 'react'

type Formateur = { id: string; email: string | null; nom: string; slug: string; admin: boolean; actif: boolean; formations: number; created_at: string }
type Invitation = { code: string; nom: string; created_at: string; utilisee_le: string | null }

const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-3 py-2 focus:border-lion-blue focus:outline-none'
const small = 'rounded-md border border-lion-blue/20 bg-white px-2.5 py-1 text-sm hover:border-lion-blue disabled:opacity-30'

export function GestionFormateurs() {
  const [formateurs, setFormateurs] = useState<Formateur[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [erreur, setErreur] = useState('')
  const [nom, setNom] = useState('')
  const [origine, setOrigine] = useState('')
  const [copie, setCopie] = useState('')
  const [busy, setBusy] = useState(false)

  const charger = useCallback(async () => {
    const r = await fetch('/api/formation/formateurs', { cache: 'no-store' })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) return setErreur(d.error || 'Erreur')
    setFormateurs(d.formateurs ?? [])
    setInvitations(d.invitations ?? [])
    setErreur(d.erreur ?? '')
  }, [])
  useEffect(() => {
    setOrigine(window.location.origin)
    charger()
  }, [charger])

  const lien = (code: string) => `${origine}/formateur/inscription/${code}`
  const inviter = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const r = await fetch('/api/formation/formateurs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom }) })
    setBusy(false)
    if (!r.ok) return setErreur((await r.json().catch(() => ({}))).error || 'Erreur')
    setNom('')
    charger()
  }
  const copier = async (code: string) => {
    await navigator.clipboard.writeText(lien(code)).catch(() => {})
    setCopie(code)
    setTimeout(() => setCopie(''), 2500)
  }
  const basculer = async (f: Formateur) => {
    if (f.actif && !confirm(`Désactiver ${f.nom || f.email} ? Il ne pourra plus se connecter (ses contenus sont conservés).`)) return
    const r = await fetch(`/api/formation/formateurs/${f.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actif: !f.actif }) })
    if (!r.ok) setErreur((await r.json().catch(() => ({}))).error || 'Erreur')
    charger()
  }
  const retirer = async (code: string) => {
    await fetch(`/api/formation/invitations/${code}`, { method: 'DELETE' })
    charger()
  }

  const attente = invitations.filter(i => !i.utilisee_le)
  return (
    <div className="mt-6 space-y-8">
      {erreur && <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">⚠️ {erreur}</p>}

      <section className="space-y-3 rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Inviter un formateur</h2>
        <form onSubmit={inviter} className="flex flex-wrap gap-2">
          <input className={`${field} sm:max-w-xs`} value={nom} onChange={e => setNom(e.target.value)} placeholder="Son nom (facultatif)" />
          <button disabled={busy} className="rounded-lg bg-lion-blue px-5 py-2 font-semibold text-white disabled:opacity-50">➕ Créer un lien d’invitation</button>
        </form>
        <p className="text-xs text-lion-ink/60">Envoyez le lien à la personne (WhatsApp, email). Elle choisit son email et son mot de passe. Le lien ne sert qu’une seule fois.</p>
        {attente.length > 0 && (
          <ul className="space-y-2 pt-2">
            {attente.map(i => (
              <li key={i.code} className="rounded-lg bg-lion-blue/[0.04] p-3 text-sm">
                <p className="font-medium">{i.nom || 'Invitation'} <span className="font-normal text-lion-ink/60">· en attente</span></p>
                <p className="mt-1 break-all font-mono text-xs">{lien(i.code)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className={small} onClick={() => copier(i.code)}>{copie === i.code ? '✅ Copié !' : '📋 Copier le lien'}</button>
                  <a className={small} target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Bonjour, voici votre invitation pour créer votre espace formateur : ${lien(i.code)}`)}`}>💬 WhatsApp</a>
                  <button className={`${small} text-red-600`} onClick={() => retirer(i.code)}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold">Les formateurs ({formateurs.length})</h2>
        <ul className="mt-3 space-y-2">
          {formateurs.map(f => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-lion-blue/15 bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <p className="font-semibold">{f.nom || f.email || 'Sans nom'} {f.admin && <span className="ml-1 rounded-full bg-lion-gold/30 px-2 py-0.5 text-xs">Administrateur</span>}</p>
                <p className="text-sm text-lion-ink/70">{f.email ?? 'Connexion par mot de passe'} · {f.formations} formation{f.formations > 1 ? 's' : ''}</p>
              </div>
              {!f.admin && (
                <button className={small} onClick={() => basculer(f)}>{f.actif ? '⏸️ Désactiver' : '▶️ Réactiver'}</button>
              )}
              {!f.actif && <span className="text-xs font-semibold text-red-600">Désactivé</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
