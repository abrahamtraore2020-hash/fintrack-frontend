'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { PLATEFORME } from '@/data/formation'
import { LETTRES, questionVide, type Question, type Resultat } from '@/data/exercice'

type Mod = { slug: string; titre: string }
const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-3 py-2 focus:border-lion-blue focus:outline-none'
const small = 'rounded-md border border-lion-blue/20 bg-white px-2.5 py-1 text-sm hover:border-lion-blue disabled:opacity-30'

export default function EditeurExercicePage({ params }: { params: { formation: string; id: string } }) {
  const [titre, setTitre] = useState('')
  const [modules, setModules] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [ouvert, setOuvert] = useState(true)
  const [tousModules, setTousModules] = useState<Mod[]>([])
  const [formationTitre, setFormationTitre] = useState('')
  const [nombre, setNombre] = useState(5)
  const [message, setMessage] = useState('')
  const [infoGen, setInfoGen] = useState('')
  const [saving, setSaving] = useState(false)
  const [generation, setGeneration] = useState(false)
  const [resultats, setResultats] = useState<Resultat[]>([])
  const [copie, setCopie] = useState(false)
  const [origine, setOrigine] = useState('')

  const etat = useRef({ titre, modules, questions, ouvert })
  etat.current = { titre, modules, questions, ouvert }
  const enregistre = useRef('')
  const modifie = questions !== null && JSON.stringify(etat.current) !== enregistre.current

  useEffect(() => {
    setOrigine(window.location.origin)
    let actif = true
    Promise.all([
      fetch(`/api/formation/exercices/${params.id}`).then(async r => ({ ok: r.ok, d: await r.json().catch(() => ({})) })),
      fetch(`/api/formation/formations/${params.formation}`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/formation/exercices/${params.id}/resultats`).then(r => r.json()).catch(() => ({})),
    ]).then(([ex, fo, re]) => {
      if (!actif) return
      if (!ex.ok) return setMessage(`❌ ${ex.d.error || 'Exercice introuvable'}`)
      const e = ex.d.exercice
      setTitre(e.titre)
      setModules(e.modules)
      setOuvert(e.ouvert)
      setTousModules((fo.formation?.episodes ?? []).map((m: Mod) => ({ slug: m.slug, titre: m.titre })))
      setFormationTitre(fo.formation?.titre ?? '')
      setResultats(re.resultats ?? [])
      enregistre.current = JSON.stringify({ titre: e.titre, modules: e.modules, questions: e.questions, ouvert: e.ouvert })
      setQuestions(e.questions)
    })
    return () => {
      actif = false
    }
  }, [params.id, params.formation])

  useEffect(() => {
    if (!modifie) return
    const avertir = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [modifie])

  if (!questions) return <main className="p-10">{message || 'Chargement…'}</main>

  const majQuestion = (i: number, patch: Partial<Question>) => setQuestions(questions.map((q, k) => (k === i ? { ...q, ...patch } : q)))
  const majReponse = (i: number, j: number, texte: string) => majQuestion(i, { reponses: questions[i].reponses.map((r, m) => (m === j ? { ...r, texte } : r)) })
  const bonne = (i: number, j: number) => majQuestion(i, { reponses: questions[i].reponses.map((r, m) => ({ ...r, juste: m === j })) })
  const deplacer = (i: number, d: number) => {
    const c = [...questions]
    ;[c[i], c[i + d]] = [c[i + d], c[i]]
    setQuestions(c)
  }

  const enregistrer = async () => {
    const { titre, modules, questions, ouvert } = etat.current
    if (!questions) return
    setSaving(true)
    setMessage('')
    const res = await fetch(`/api/formation/exercices/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titre, modules, questions, ouvert }) })
    const d = await res.json().catch(() => ({}))
    if (res.ok) {
      enregistre.current = JSON.stringify({ titre, modules, questions, ouvert })
      setMessage('✅ Enregistré')
    } else setMessage(`❌ ${d.error || 'Erreur'}`)
    setSaving(false)
    return res.ok
  }

  const generer = async () => {
    setGeneration(true)
    setMessage('')
    setInfoGen('')
    const res = await fetch('/api/formation/exercices/generer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formation: params.formation, modules, nombre }) })
    const d = await res.json().catch(() => ({}))
    setGeneration(false)
    if (!res.ok) return setMessage(`❌ ${d.error || 'Erreur'}`)
    setQuestions([...questions, ...d.questions])
    setInfoGen(`${d.mode === 'ia' ? '✨ Questions rédigées par l’IA. ' : ''}${d.questions.length} question${d.questions.length > 1 ? 's' : ''} ajoutée${d.questions.length > 1 ? 's' : ''}. ${d.note ?? ''} Relisez-les et modifiez-les si besoin, puis enregistrez.`)
  }

  const supprimer = async () => {
    if (!confirm(`Supprimer l’exercice « ${titre} » et tous ses résultats ?`)) return
    const res = await fetch(`/api/formation/exercices/${params.id}`, { method: 'DELETE' })
    if (res.ok) window.location.href = `/formation/${params.formation}/exercices`
    else setMessage(`❌ ${(await res.json().catch(() => ({}))).error || 'Erreur'}`)
  }

  const lien = `${origine}/exercice/${params.id}`
  const texteLien = `🎯 Exercice ${PLATEFORME.nom} : ${titre}\n\nTestez vos connaissances (${questions.length} questions, note sur 20) :\n${lien}`
  const moyenne = resultats.length ? Math.round((resultats.reduce((s, r) => s + r.note, 0) / resultats.length) * 10) / 10 : null

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-28">
      <Link
        href={`/formation/${params.formation}/exercices`}
        onClick={e => modifie && !confirm('Vos modifications ne sont pas enregistrées. Quitter quand même ?') && e.preventDefault()}
        className="text-sm text-lion-blue"
      >
        ← Exercices{formationTitre ? ` · ${formationTitre}` : ''}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-lion-blue">🎯 Modifier l’exercice</h1>

      <section className="mt-5 space-y-3 rounded-xl border-2 border-lion-gold bg-white p-4">
        <input className={field} value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de l’exercice" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ouvert} onChange={e => setOuvert(e.target.checked)} className="h-4 w-4 accent-lion-blue" />
          Salle ouverte (les élèves peuvent entrer avec le lien)
        </label>
      </section>

      <section className="mt-5 space-y-3 rounded-xl border border-lion-blue/15 bg-lion-blue/[0.03] p-4">
        <h2 className="font-semibold text-lion-blue">✨ Générer des questions automatiquement</h2>
        <p className="text-sm text-lion-ink/70">Choisissez les modules du cours sur lesquels porte l’exercice.</p>
        {tousModules.length === 0 ? (
          <p className="text-sm text-lion-ink/60">Cette formation n’a pas encore de module.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tousModules.map(m => {
              const on = modules.includes(m.slug)
              return (
                <button key={m.slug} onClick={() => setModules(on ? modules.filter(x => x !== m.slug) : [...modules, m.slug])} className={`rounded-lg border px-3 py-1.5 text-sm ${on ? 'border-lion-blue bg-lion-blue text-white' : 'border-lion-blue/25 bg-white'}`}>
                  {on ? '✓ ' : ''}
                  {m.titre}
                </button>
              )
            })}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-lg border border-lion-blue/20 bg-white px-3 py-2" value={nombre} onChange={e => setNombre(Number(e.target.value))}>
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
          </select>
          <button disabled={generation || modules.length === 0} onClick={generer} className="rounded-lg bg-lion-blue px-4 py-2 font-semibold text-white disabled:opacity-50">
            {generation ? 'Génération…' : '✨ Générer'}
          </button>
        </div>
        {infoGen && <p className="text-sm text-lion-ink/80">{infoGen}</p>}
      </section>

      <div className="mt-6 space-y-5">
        {questions.map((q, i) => (
          <section key={q.id} className="space-y-3 rounded-xl border border-lion-blue/15 border-l-4 border-l-lion-gold bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lion-blue">Question {i + 1}</span>
              <span className="ml-auto flex gap-1">
                <button className={small} disabled={i === 0} onClick={() => deplacer(i, -1)}>↑</button>
                <button className={small} disabled={i === questions.length - 1} onClick={() => deplacer(i, 1)}>↓</button>
                <button className={small} onClick={() => setQuestions(questions.filter((_, k) => k !== i))} aria-label="Supprimer la question">🗑️</button>
              </span>
            </div>
            <textarea className={field} rows={2} value={q.texte} onChange={e => majQuestion(i, { texte: e.target.value })} placeholder="La question (ex. Qui veut gagner des millions ?)" />
            <div className="space-y-2">
              {q.reponses.map((r, j) => (
                <label key={j} className={`flex items-center gap-2 rounded-lg border p-2 ${r.juste ? 'border-green-500 bg-green-50' : 'border-lion-blue/15'}`}>
                  <input type="radio" name={`bonne-${q.id}`} checked={r.juste} onChange={() => bonne(i, j)} className="h-4 w-4 accent-green-600" aria-label="Bonne réponse" />
                  <span className="w-5 font-bold text-lion-blue">{LETTRES[j]}</span>
                  <input className={field} value={r.texte} onChange={e => majReponse(i, j, e.target.value)} placeholder={r.juste ? 'Bonne réponse' : 'Fausse réponse'} />
                </label>
              ))}
              <p className="text-xs text-lion-ink/60">Cochez la case verte devant la bonne réponse. Les réponses sont mélangées pour chaque élève.</p>
            </div>
            <input className={field} value={q.explication ?? ''} onChange={e => majQuestion(i, { explication: e.target.value })} placeholder="Explication affichée après la réponse (facultatif)" />
          </section>
        ))}
        <button className="rounded-lg border-2 border-lion-blue px-4 py-2 font-semibold text-lion-blue" onClick={() => setQuestions([...questions, questionVide()])}>
          + Ajouter une question
        </button>
      </div>

      <section className="mt-8 space-y-3 rounded-xl border-2 border-lion-gold bg-white p-4">
        <h2 className="font-semibold text-lion-blue">🔗 Lien à envoyer à vos élèves</h2>
        {modifie && <p className="text-sm text-amber-700">⚠️ Enregistrez d’abord : les élèves verront la dernière version enregistrée.</p>}
        {questions.length === 0 && <p className="text-sm text-amber-700">⚠️ Ajoutez au moins une question avant d’envoyer le lien.</p>}
        <p className="break-all rounded-lg bg-lion-blue/[0.05] p-2.5 text-sm">{lien}</p>
        <div className="flex flex-wrap gap-2">
          <button className={small} onClick={() => navigator.clipboard.writeText(lien).then(() => (setCopie(true), setTimeout(() => setCopie(false), 2500))).catch(() => {})}>
            {copie ? '✅ Lien copié' : '📋 Copier le lien'}
          </button>
          <a className={small} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(texteLien)}`}>💬 Envoyer sur WhatsApp</a>
          <a className={small} target="_blank" rel="noopener noreferrer" href={lien}>👀 Voir la salle</a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-lion-blue">📊 Résultats</h2>
        {resultats.length === 0 ? (
          <p className="mt-2 text-sm text-lion-ink/60">Aucun élève n’a encore terminé cet exercice.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-lion-ink/70">{resultats.length} passage{resultats.length > 1 ? 's' : ''} · moyenne {moyenne?.toString().replace('.', ',')} / 20</p>
            <ul className="mt-3 divide-y divide-lion-blue/10 rounded-xl border border-lion-blue/15 bg-white">
              {[...resultats].sort((a, b) => b.note - a.note).map(r => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span>
                    <span className="font-medium">{r.nom}</span>
                    {r.email && <span className="ml-2 text-sm text-lion-ink/60">{r.email}</span>}
                    <span className="ml-2 text-xs text-lion-ink/50">{new Date(r.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <b className="text-lg text-lion-blue">{r.note.toString().replace('.', ',')}</b>
                    <span className="text-sm text-lion-ink/60"> / 20 · {r.score}/{r.total}</span>
                  </span>
                </li>
              ))}
            </ul>
            <button className={`${small} mt-3`} onClick={() => navigator.clipboard.writeText([...resultats].sort((a, b) => b.note - a.note).map(r => `${r.nom};${r.email};${r.note};${r.score}/${r.total}`).join('\n')).catch(() => {})}>
              📋 Copier les notes
            </button>
          </>
        )}
      </section>

      <div className="mt-10 border-t border-lion-blue/10 pt-6">
        <button onClick={supprimer} className="text-sm text-red-600 underline">Supprimer cet exercice</button>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-center gap-4 border-t-2 border-lion-gold bg-white/95 p-3 backdrop-blur">
        <button className="rounded-lg bg-lion-blue px-6 py-2 font-semibold text-white disabled:opacity-50" disabled={saving} onClick={() => enregistrer()}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {modifie && !message.startsWith('❌') ? <span className="text-sm text-lion-ink/60">Modifications non enregistrées</span> : message && <span className="text-sm">{message}</span>}
      </div>
    </main>
  )
}
