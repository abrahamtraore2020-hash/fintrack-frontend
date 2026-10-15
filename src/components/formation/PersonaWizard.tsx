'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { verifierEleve } from '@/data/exercice'
import { AVATAR_CHAMPS, FORMATS, PRENOMS, ficheVide, promptConversation, promptEbook, resumeFiche, type Fiche } from '@/data/persona'

type Info = { titre: string; ouvert: boolean; formation: string }
type Etape = 'accueil' | 'probleme' | 'produit' | 'avatar' | 'prompts'
const ETAPES: { cle: Etape; court: string }[] = [
  { cle: 'probleme', court: 'Problème' },
  { cle: 'produit', court: 'Solution & produit' },
  { cle: 'avatar', court: 'Avatar' },
  { cle: 'prompts', court: 'Prompts IA' },
]
const EXEMPLES = [
  'Des commerçantes WhatsApp n’arrivent pas à faire des affiches professionnelles.',
  'Des jeunes diplômés échouent à leurs entretiens d’embauche.',
  'Des couturières ne savent pas si elles gagnent de l’argent.',
]

const field = 'w-full rounded-lg border border-lion-blue/20 bg-white px-4 py-3 text-base focus:border-lion-blue focus:outline-none'
const btn = 'rounded-xl bg-lion-blue px-6 py-3 text-base font-bold text-white shadow disabled:opacity-50'
const btn2 = 'rounded-xl border-2 border-lion-blue px-5 py-2.5 font-semibold text-lion-blue disabled:opacity-50'

export function PersonaWizard({ id }: { id: string }) {
  const [info, setInfo] = useState<Info | null>(null)
  const [erreurInfo, setErreurInfo] = useState('')
  const [etape, setEtape] = useState<Etape>('accueil')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [piege, setPiege] = useState('')
  const [fiche, setFiche] = useState<Fiche>(ficheVide())
  const acces = useRef<{ fid: string; cle: string } | null>(null)
  const [erreur, setErreur] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [copie, setCopie] = useState<string | null>(null)
  const [pret, setPret] = useState(false)

  const cleStock = `persona:${id}`
  const etapeSelon = (f: Fiche): Etape => (f.avatar.situation ? 'avatar' : f.solution ? 'produit' : 'probleme')

  // Chargement de l'atelier, puis reprise de la fiche si cet appareil en a déjà une.
  useEffect(() => {
    fetch(`/api/persona/${id}`, { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) throw new Error()
        setInfo(await r.json())
      })
      .catch(() => setErreurInfo('Cet atelier est introuvable ou indisponible.'))
    try {
      const s = JSON.parse(localStorage.getItem(cleStock) ?? 'null')
      if (s?.fid && s?.cle) {
        fetch(`/api/persona-fiche/${s.fid}?cle=${encodeURIComponent(s.cle)}`, { cache: 'no-store' })
          .then(async r => {
            if (!r.ok) return
            const d = await r.json()
            acces.current = { fid: s.fid, cle: s.cle }
            setNom(d.nom)
            setFiche(d.data)
            setEtape(etapeSelon(d.data))
          })
          .finally(() => setPret(true))
        return
      }
    } catch {}
    setPret(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Enregistrement automatique de la fiche (sans compte : clé secrète gardée dans cet appareil).
  const derniere = useRef('')
  useEffect(() => {
    if (!acces.current || etape === 'accueil') return
    const json = JSON.stringify(fiche)
    if (json === derniere.current) return
    const t = setTimeout(() => {
      derniere.current = json
      fetch(`/api/persona-fiche/${acces.current!.fid}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cle: acces.current!.cle, data: fiche }) }).catch(() => {})
    }, 900)
    return () => clearTimeout(t)
  }, [fiche, etape])

  const maj = (patch: Partial<Fiche>) => setFiche(f => ({ ...f, ...patch }))
  const majAvatar = (patch: Partial<Fiche['avatar']>) => setFiche(f => ({ ...f, avatar: { ...f.avatar, ...patch } }))

  const demarrer = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = verifierEleve(nom, email)
    if (!v.ok) return setErreur(v.erreur)
    setErreur('')
    setBusy(true)
    const res = await fetch(`/api/persona/${id}/demarrer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom, email, site: piege }) })
    const d = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok || !d.id) return setErreur(d.error || 'Impossible de démarrer, réessayez.')
    acces.current = { fid: d.id, cle: d.cle }
    try {
      localStorage.setItem(cleStock, JSON.stringify({ fid: d.id, cle: d.cle }))
    } catch {}
    setEtape('probleme')
  }

  const generer = useCallback(
    async (quoi: 'solution' | 'avatar') => {
      if (!acces.current) return
      setBusy(true)
      setErreur('')
      setNote('')
      const res = await fetch(`/api/persona-fiche/${acces.current.fid}/generer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cle: acces.current.cle, etape: quoi, data: fiche }) })
      const d = await res.json().catch(() => ({}))
      setBusy(false)
      if (!res.ok) return setErreur(d.error || 'Erreur, réessayez.')
      if (d.mode === 'manuel') {
        setNote('La proposition automatique n’est pas activée pour le moment : complétez les cases à la main, avec les aides sous chaque titre.')
        return quoi === 'solution' ? setEtape('produit') : undefined
      }
      setFiche(d.data)
      derniere.current = JSON.stringify(d.data)
      if (quoi === 'solution') setEtape('produit')
    },
    [fiche],
  )

  const copier = async (cle: string, texte: string) => {
    await navigator.clipboard.writeText(texte).catch(() => {})
    setCopie(cle)
    setTimeout(() => setCopie(null), 2500)
  }

  if (erreurInfo) return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-lion-ink/70">{erreurInfo}</main>
  if (!info || !pret) return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-lion-ink/60">Chargement…</main>
  if (!info.ouvert && etape === 'accueil') return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-lg">🔒 Cet atelier est fermé pour le moment.</main>

  const idx = ETAPES.findIndex(e => e.cle === etape)
  const stepper = idx >= 0 && (
    <ol className="mb-6 flex items-center gap-1 text-xs sm:text-sm">
      {ETAPES.map((e, i) => (
        <li key={e.cle} className="flex flex-1 items-center gap-1">
          <button
            disabled={i > 0 && !fiche.solution}
            onClick={() => setEtape(e.cle)}
            className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left font-semibold ${i === idx ? 'bg-lion-blue text-white' : i < idx ? 'bg-lion-blue/10 text-lion-blue' : 'bg-gray-100 text-gray-400'}`}
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${i === idx ? 'bg-lion-gold text-lion-ink' : 'bg-white'}`}>{i < idx ? '✓' : i + 1}</span>
            <span className="hidden truncate sm:inline">{e.court}</span>
          </button>
        </li>
      ))}
    </ol>
  )
  const retour = (vers: Etape) => <button className={btn2} onClick={() => setEtape(vers)}>← Retour</button>

  // ---------- Accueil ----------
  if (etape === 'accueil')
    return (
      <main className="mx-auto max-w-xl px-4 py-8">
        <p className="text-sm font-medium uppercase tracking-wider text-lion-blue">🧭 Atelier{info.formation ? ` · ${info.formation}` : ''}</p>
        <h1 className="mt-1 text-3xl font-bold">{info.titre}</h1>
        <p className="mt-3 text-lg text-lion-ink/80">Un guide en 4 étapes pour <b>trouver votre produit digital</b> et <b>comprendre votre client idéal</b>. Ce n’est pas un test : il n’y a pas de note.</p>
        <div className="mt-5 rounded-2xl bg-lion-blue p-5 text-white">
          <p className="font-semibold">Pourquoi on commence par le problème ?</p>
          <p className="mt-1 text-sm opacity-90">Beaucoup de débutants mélangent <b>problème</b>, <b>solution</b> et <b>bénéfice</b>. Ici, on les remet dans l’ordre : vous écrivez d’abord le problème, et le reste en découle.</p>
        </div>
        <form onSubmit={demarrer} className="mt-6 space-y-3 rounded-2xl border-2 border-lion-gold p-5">
          <p className="text-sm text-lion-ink/70">Avant de commencer, présentez-vous :</p>
          <input className={field} value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" autoComplete="name" />
          <input className={field} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre email" autoComplete="email" inputMode="email" />
          <input className="hidden" tabIndex={-1} autoComplete="off" value={piege} onChange={e => setPiege(e.target.value)} aria-hidden />
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-lion-gold px-5 py-3 text-lg font-bold text-lion-ink shadow disabled:opacity-60">{busy ? 'Un instant…' : '🚀 Commencer'}</button>
          <p className="text-xs text-lion-ink/60">Votre travail est enregistré et partagé avec votre formateur. Sur cet appareil, vous pouvez le reprendre quand vous voulez.</p>
        </form>
      </main>
    )

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      {stepper}

      {/* ---------- 1. Problème ---------- */}
      {etape === 'probleme' && (
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">1. Quel problème avez-vous remarqué ?</h1>
            <p className="mt-1 text-lion-ink/70">Pensez à une difficulté que vous avez observée chez des personnes. Écrivez-la simplement, avec des mots de tous les jours.</p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            {[['Problème', 'Ce qui coince, ce qui fait souffrir ou perdre du temps.'], ['Solution', 'Le moyen de le résoudre. (Elle viendra à l’étape 2.)'], ['Bénéfice', 'Ce que la personne y gagne. (Aussi à l’étape 2.)']].map(([t, d], i) => (
              <div key={t} className={`rounded-xl border p-3 ${i === 0 ? 'border-lion-gold bg-lion-gold/15' : 'border-lion-blue/10 bg-gray-50 text-lion-ink/60'}`}>
                <p className="font-bold">{i === 0 ? '👉 ' : ''}{t}</p>
                <p className="text-xs">{d}</p>
              </div>
            ))}
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Qui vit ce problème ? <span className="font-normal text-lion-ink/60">(votre cible)</span></span>
            <input className={field} value={fiche.concerne} onChange={e => maj({ concerne: e.target.value })} placeholder="Ex. des petites commerçantes qui vendent sur WhatsApp" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Le problème</span>
            <textarea className={field} rows={4} value={fiche.probleme} onChange={e => maj({ probleme: e.target.value })} placeholder="Ex. elles n’arrivent pas à faire des affiches professionnelles et perdent beaucoup de temps." />
          </label>
          <div className="text-sm">
            <p className="mb-1 text-lion-ink/60">Besoin d’inspiration ? Touchez un exemple :</p>
            <div className="flex flex-wrap gap-2">
              {EXEMPLES.map(x => (
                <button key={x} onClick={() => maj({ probleme: x })} className="rounded-full border border-lion-blue/25 px-3 py-1 text-left text-xs hover:bg-lion-blue/5">{x}</button>
              ))}
            </div>
          </div>
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <div className="flex flex-wrap gap-2">
            <button className={btn} disabled={busy || fiche.probleme.trim().length < 10} onClick={() => generer('solution')}>{busy ? 'Réflexion en cours…' : '✨ Trouver la solution et le produit'}</button>
            {fiche.solution && <button className={btn2} onClick={() => setEtape('produit')}>Voir ma solution →</button>}
          </div>
        </section>
      )}

      {/* ---------- 2. Solution et produit ---------- */}
      {etape === 'produit' && (
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">2. Votre solution et votre produit digital</h1>
            <p className="mt-1 text-lion-ink/70">À partir de votre problème, voici une proposition. <b>Relisez et modifiez</b> ce qui ne vous convient pas : c’est votre idée.</p>
          </div>
          <div className="rounded-xl border border-lion-blue/15 bg-lion-blue/[0.04] p-3 text-sm"><b>Problème :</b> {fiche.probleme}</div>
          {note && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{note}</p>}
          {([
            ['solution', '💡 La solution', 'Le moyen de résoudre le problème, en 1 ou 2 phrases.'],
            ['benefice', '🎁 Le bénéfice', 'Ce que la personne y gagne : sa situation avant / après.'],
            ['promesse', '🤝 La promesse', 'Une phrase claire sur ce que votre produit aide à faire. Sans promettre de ventes ni d’argent.'],
          ] as const).map(([cle, titre, aide]) => (
            <label key={cle} className="block space-y-1">
              <span className="font-semibold">{titre}</span>
              <span className="block text-xs text-lion-ink/60">{aide}</span>
              <textarea className={field} rows={cle === 'promesse' ? 2 : 3} value={fiche[cle]} onChange={e => maj({ [cle]: e.target.value })} />
            </label>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="font-semibold">📦 Le nom du produit digital</span>
              <input className={field} value={fiche.produit_nom} onChange={e => maj({ produit_nom: e.target.value })} placeholder="Un nom court et clair" />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold">Son format</span>
              <select className={field} value={fiche.produit_format} onChange={e => maj({ produit_format: e.target.value })}>
                <option value="">— Choisir —</option>
                {Array.from(new Set([...FORMATS, ...(fiche.produit_format ? [fiche.produit_format] : [])])).map(x => <option key={x}>{x}</option>)}
              </select>
            </label>
          </div>
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <div className="flex flex-wrap gap-2">
            {retour('probleme')}
            <button className={btn2} disabled={busy} onClick={() => generer('solution')}>{busy ? 'Réflexion…' : '🔄 Proposer autre chose'}</button>
            <button className={btn} disabled={!fiche.solution.trim() || !fiche.produit_nom.trim()} onClick={() => setEtape('avatar')}>Suivant : mon avatar →</button>
          </div>
        </section>
      )}

      {/* ---------- 3. Avatar ---------- */}
      {etape === 'avatar' && (
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">3. Comprendre sa cible en profondeur</h1>
            <p className="mt-1 text-lion-ink/70">Imaginez <b>une seule personne</b> précise qui a ce problème : votre avatar. Donnez-lui un prénom, puis découvrez qui elle est.</p>
          </div>
          <div>
            <label className="font-semibold">Le prénom de votre avatar</label>
            <div className="mt-1 flex flex-wrap gap-2">
              <input className={`${field} sm:max-w-xs`} value={fiche.avatar.nom} onChange={e => majAvatar({ nom: e.target.value })} placeholder="Ex. Aminata" />
              <button className={btn2} onClick={() => { const t = [...PRENOMS.femmes, ...PRENOMS.hommes]; majAvatar({ nom: t[Math.floor(Math.random() * t.length)] }) }}>🎲 Au hasard</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {[...PRENOMS.femmes.slice(0, 5), ...PRENOMS.hommes.slice(0, 3)].map(p => (
                <button key={p} onClick={() => majAvatar({ nom: p })} className={`rounded-full border px-2.5 py-1 ${fiche.avatar.nom === p ? 'border-lion-blue bg-lion-blue text-white' : 'border-lion-blue/25'}`}>{p}</button>
              ))}
            </div>
          </div>
          {note && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{note}</p>}
          <button className={btn} disabled={busy || !fiche.avatar.nom.trim()} onClick={() => generer('avatar')}>
            {busy ? 'Construction de l’avatar…' : fiche.avatar.situation ? '🔄 Refaire mon avatar' : `✨ Construire ${fiche.avatar.nom.trim() || 'mon avatar'}`}
          </button>
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <div className="rounded-xl border border-lion-gold bg-lion-gold/10 p-3 text-sm">
            ⚠️ Un avatar est une <b>hypothèse</b>, pas une vérité. Vérifiez-le en parlant à 5 à 10 vraies personnes de votre cible, puis corrigez-le.
          </div>
          <div className="space-y-3">
            {AVATAR_CHAMPS.map(c => (
              <label key={c.cle} className="block space-y-1">
                <span className="font-semibold">{c.titre.replace(/elle|Elle/g, m => (m === 'elle' ? (fiche.avatar.nom || 'elle') : (fiche.avatar.nom || 'Elle')))}</span>
                <span className="block text-xs text-lion-ink/60">{c.aide}</span>
                <textarea className={field} rows={3} value={fiche.avatar[c.cle]} onChange={e => majAvatar({ [c.cle]: e.target.value })} />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {retour('produit')}
            <button className={btn} onClick={() => setEtape('prompts')}>Suivant : mes prompts IA →</button>
          </div>
        </section>
      )}

      {/* ---------- 4. Prompts ---------- */}
      {etape === 'prompts' && (
        <section className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold">4. Vos prompts pour une IA</h1>
            <p className="mt-1 text-lion-ink/70">Un <b>prompt</b> est un message à copier dans une IA (ChatGPT, Claude, Gemini…). Ceux-ci contiennent déjà tout votre travail. Choisissez ce que vous voulez faire.</p>
          </div>
          {[
            { cle: 'conv', titre: '💬 Discuter avec une IA pour affiner mon idée', desc: 'L’IA vous pose des questions une par une pour améliorer votre idée, votre cible et votre promesse.', texte: promptConversation(fiche) },
            { cle: 'ebook', titre: '📘 Créer mon ebook avec une IA', desc: 'L’IA écrit un ebook complet pour votre produit, adapté à votre avatar.', texte: promptEbook(fiche) },
          ].map(p => (
            <div key={p.cle} className="rounded-2xl border-2 border-lion-gold p-4">
              <h2 className="text-lg font-bold">{p.titre}</h2>
              <p className="text-sm text-lion-ink/70">{p.desc}</p>
              <textarea readOnly className="mt-3 h-40 w-full rounded-lg border border-lion-blue/15 bg-lion-blue/[0.03] p-3 text-sm" value={p.texte} onFocus={e => e.currentTarget.select()} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button className={btn} onClick={() => copier(p.cle, p.texte)}>{copie === p.cle ? '✅ Copié !' : '📋 Copier le prompt'}</button>
                {[['ChatGPT', 'https://chatgpt.com'], ['Claude', 'https://claude.ai'], ['Gemini', 'https://gemini.google.com']].map(([n, u]) => (
                  <a key={n} href={u} target="_blank" rel="noopener noreferrer" className={btn2}>Ouvrir {n}</a>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {retour('avatar')}
            <button className={btn2} onClick={() => copier('resume', resumeFiche(fiche))}>{copie === 'resume' ? '✅ Copié !' : '📋 Copier mon récapitulatif'}</button>
          </div>
          <p className="text-xs text-lion-ink/60">Rappel : une IA peut se tromper. Relisez tout, vérifiez les informations, et testez votre idée auprès de vraies personnes avant de vendre.</p>
        </section>
      )}
    </main>
  )
}
