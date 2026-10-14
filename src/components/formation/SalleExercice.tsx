'use client'

import { useEffect, useMemo, useState } from 'react'
import { LETTRES, melanger, mention, verifierEleve } from '@/data/exercice'

type QPublique = { id: string; texte: string; reponses: { i: number; texte: string }[] }
type Info = { titre: string; formation: string; ouvert: boolean; questions: QPublique[] }
type Verdict = { juste: boolean; bonne: number; explication: string | null }
type Fin = { score: number; total: number; note: number }


export function SalleExercice({ id }: { id: string }) {
  const [info, setInfo] = useState<Info | null>(null)
  const [erreur, setErreur] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [piege, setPiege] = useState('')
  const [etape, setEtape] = useState<'intro' | 'jeu' | 'fin'>('intro')
  const [k, setK] = useState(0)
  const [choisi, setChoisi] = useState<number | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [reponses, setReponses] = useState<{ qid: string; choix: number }[]>([])
  const [fin, setFin] = useState<Fin | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch(`/api/exercice/${id}`, { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) throw new Error()
        setInfo(await r.json())
      })
      .catch(() => setErreur('Cet exercice est introuvable ou indisponible.'))
  }, [id])

  const q = info?.questions[k]
  // L'ordre des réponses est mélangé pour chaque élève et chaque question.
  const ordre = useMemo(() => (q ? melanger(q.reponses) : []), [q])
  const total = info?.questions.length ?? 0

  const commencer = (e: React.FormEvent) => {
    e.preventDefault()
    const v = verifierEleve(nom, email)
    if (!v.ok) return setErreur(v.erreur)
    setErreur('')
    setK(0)
    setReponses([])
    setChoisi(null)
    setVerdict(null)
    setFin(null)
    setEtape('jeu')
  }

  const repondre = async (i: number) => {
    if (!q || choisi !== null || busy) return
    setChoisi(i)
    setBusy(true)
    const res = await fetch(`/api/exercice/${id}/repondre`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qid: q.id, choix: i }) })
    const d = await res.json().catch(() => null)
    setBusy(false)
    if (!res.ok || !d) {
      setChoisi(null)
      return setErreur('Connexion perdue : réessayez.')
    }
    setErreur('')
    setVerdict(d)
    setReponses(r => [...r, { qid: q.id, choix: i }])
  }

  const suivant = async () => {
    if (k + 1 < total) {
      setK(k + 1)
      setChoisi(null)
      setVerdict(null)
      return
    }
    setBusy(true)
    const res = await fetch(`/api/exercice/${id}/terminer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom, email, reponses, site: piege }) })
    const d = await res.json().catch(() => null)
    setBusy(false)
    if (!res.ok || !d) return setErreur(d?.error || 'Résultat non enregistré, réessayez.')
    setFin(d)
    setEtape('fin')
  }

  if (erreur && !info) return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-lion-ink/70">{erreur}</main>
  if (!info) return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-lion-ink/60">Chargement…</main>
  if (!info.ouvert) return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-lg">🔒 Cet exercice est fermé pour le moment.</main>
  if (!total) return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-lion-ink/70">Cet exercice n’a pas encore de questions.</main>

  const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-4 py-3 text-base focus:border-lion-blue focus:outline-none'

  if (etape === 'intro')
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <p className="text-sm font-medium uppercase tracking-wider text-lion-blue">🎯 Exercice{info.formation ? ` · ${info.formation}` : ''}</p>
        <h1 className="mt-1 text-3xl font-bold">{info.titre}</h1>
        <div className="mt-5 rounded-2xl bg-lion-blue p-5 text-white">
          <p className="text-lg font-semibold">{total} question{total > 1 ? 's' : ''} · 3 réponses possibles, une seule est juste</p>
          <p className="mt-1 text-sm opacity-85">Répondez à votre rythme et découvrez la bonne réponse après chaque question. Vous recevrez une note sur 20 à la fin.</p>
        </div>
        <form onSubmit={commencer} className="mt-6 space-y-3 rounded-2xl border-2 border-lion-gold p-5">
          <p className="text-sm text-lion-ink/70">Avant d’entrer dans la salle, présentez-vous :</p>
          <input className={field} value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" autoComplete="name" autoFocus />
          <input className={field} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre email" autoComplete="email" inputMode="email" />
          <input className="hidden" tabIndex={-1} autoComplete="off" value={piege} onChange={e => setPiege(e.target.value)} aria-hidden />
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <button className="w-full rounded-xl bg-lion-gold px-5 py-3 text-lg font-bold text-lion-ink shadow">🚀 Entrer dans la salle</button>
          <p className="text-xs text-lion-ink/60">Votre nom et votre email sont transmis à votre formateur avec votre note.</p>
        </form>
      </main>
    )

  if (etape === 'fin' && fin)
    return (
      <main className="mx-auto max-w-xl px-4 py-10 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-lion-blue">🎯 {info.titre}</p>
        <h1 className="mt-1 text-2xl font-bold">{fin.note >= 10 ? 'Bravo' : 'Merci'} {nom.split(' ')[0]} !</h1>
        <div className="mx-auto mt-6 flex h-44 w-44 flex-col items-center justify-center rounded-full border-8 border-lion-gold bg-lion-blue text-white shadow-xl">
          <span className="text-5xl font-extrabold">{fin.note.toString().replace('.', ',')}</span>
          <span className="text-sm opacity-80">sur 20</span>
        </div>
        <p className="mt-5 text-lg">
          <b>{fin.score}</b> bonne{fin.score > 1 ? 's' : ''} réponse{fin.score > 1 ? 's' : ''} sur <b>{fin.total}</b>
        </p>
        <p className="mt-3 text-lion-ink/80">{mention(fin.note)}</p>
        <button
          className="mt-6 rounded-xl border-2 border-lion-blue px-6 py-2.5 font-semibold text-lion-blue"
          onClick={() => {
            setEtape('intro')
            setFin(null)
          }}
        >
          🔁 Recommencer
        </button>
        <p className="mt-4 text-xs text-lion-ink/50">Votre résultat a été transmis à votre formateur.</p>
      </main>
    )

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-lion-blue">🎯 {info.titre}</span>
        <span className="text-lion-ink/70">
          Question {k + 1} / {total}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-lion-blue/10">
        <div className="h-full bg-lion-gold transition-all" style={{ width: `${(k / total) * 100}%` }} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_9rem]">
        <section>
          <div className="rounded-2xl bg-lion-blue px-5 py-6 text-center text-xl font-semibold leading-snug text-white shadow-lg sm:text-2xl">{q!.texte}</div>
          <ul className="mt-5 space-y-3">
            {ordre.map((r, pos) => {
              const estChoix = choisi === r.i
              const estBonne = verdict && verdict.bonne === r.i
              const cls = verdict
                ? estBonne
                  ? 'border-green-600 bg-green-100 text-green-900'
                  : estChoix
                    ? 'border-red-600 bg-red-100 text-red-900'
                    : 'border-lion-blue/15 bg-white opacity-60'
                : estChoix
                  ? 'border-lion-gold bg-lion-gold/30'
                  : 'border-lion-blue/25 bg-white hover:border-lion-blue hover:bg-lion-blue/5'
              return (
                <li key={r.i}>
                  <button
                    onClick={() => repondre(r.i)}
                    disabled={choisi !== null}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-lg transition ${cls}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lion-gold font-bold text-lion-ink">{LETTRES[pos]}</span>
                    <span className="flex-1">{r.texte}</span>
                    {verdict && estBonne && <span>✅</span>}
                    {verdict && estChoix && !estBonne && <span>❌</span>}
                  </button>
                </li>
              )
            })}
          </ul>
          {erreur && <p className="mt-3 text-sm text-red-600">{erreur}</p>}
          {verdict && (
            <div className="mt-5">
              <p className={`text-lg font-bold ${verdict.juste ? 'text-green-700' : 'text-red-700'}`}>{verdict.juste ? '🎉 Bonne réponse !' : '❌ Ce n’est pas la bonne réponse.'}</p>
              {verdict.explication && <p className="mt-1 text-lion-ink/80">💡 {verdict.explication}</p>}
              <button onClick={suivant} disabled={busy} className="mt-4 rounded-xl bg-lion-blue px-6 py-3 text-lg font-bold text-white disabled:opacity-60">
                {k + 1 < total ? 'Question suivante →' : busy ? 'Calcul…' : '🏁 Voir mon résultat'}
              </button>
            </div>
          )}
        </section>

        <aside className="hidden md:block">
          <ol className="flex flex-col-reverse gap-1 text-sm">
            {Array.from({ length: total }, (_, j) => (
              <li key={j} className={`flex justify-between rounded-md px-2.5 py-1 ${j === k ? 'bg-lion-gold font-bold text-lion-ink' : j < k ? 'bg-lion-blue/10 text-lion-blue' : 'text-lion-ink/50'}`}>
                <span>Niveau {j + 1}</span>
                <span>{j < k ? '✓' : j === k ? '●' : ''}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  )
}
