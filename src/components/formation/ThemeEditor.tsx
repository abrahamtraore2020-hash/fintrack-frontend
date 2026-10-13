'use client'

import { useState } from 'react'
import type { Episode } from '@/data/formation'
import { LOGO_LION, MODELES, POLICES, type Animation, type Theme } from '@/data/theme'
import { uploadImage } from '@/lib/resizeImage'
import { SlideViewer } from './SlideViewer'

const EXEMPLE: Episode = {
  slug: 'apercu',
  numero: 1,
  titre: 'Titre de votre module',
  resume: 'Un court résumé pour donner envie.',
  lecons: [
    { titre: 'Première leçon', points: ['Un premier point important', 'Un deuxième point', 'Un troisième point'] },
    { titre: 'Deuxième leçon', points: ['Encore un point'] },
  ],
}

const COULEURS: { cle: keyof Theme; nom: string }[] = [
  { cle: 'fond', nom: 'Fond des diapositives' },
  { cle: 'section', nom: 'Fond couverture / fin' },
  { cle: 'titre', nom: 'Titres' },
  { cle: 'texte', nom: 'Texte' },
  { cle: 'accent', nom: 'Accent (puces, numéros)' },
]

export function ThemeEditor({ theme, onChange, formationTitre, episode }: { theme: Theme; onChange: (t: Theme) => void; formationTitre: string; episode?: Episode }) {
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const set = (patch: Partial<Theme>) => onChange({ ...theme, ...patch })
  const select = 'w-full rounded-lg border border-lion-blue/20 bg-white px-3 py-2'
  const label = 'block text-sm font-medium text-lion-ink/80'
  const choix = (actif: boolean) => `rounded-lg border px-3 py-1.5 text-sm ${actif ? 'border-lion-blue bg-lion-blue text-white' : 'border-lion-blue/20 bg-white'}`
  const logoPerso = theme.logo !== null && theme.logo !== LOGO_LION

  const envoyerLogo = async (f: File | undefined) => {
    if (!f) return
    setEnvoi(true)
    setErreur('')
    try {
      set({ logo: await uploadImage(f) })
    } catch (e) {
      setErreur((e as Error).message)
    }
    setEnvoi(false)
  }

  return (
    <section className="space-y-5 rounded-xl border-2 border-lion-gold bg-white p-4">
      <h2 className="text-lg font-semibold text-lion-blue">🎨 Apparence de la présentation</h2>

      <div>
        <p className={label}>Modèles prêts à l’emploi</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODELES.map(m => (
            <button key={m.nom} onClick={() => set(m.theme)} className="flex items-center gap-2 rounded-lg border border-lion-blue/20 px-3 py-1.5 text-sm hover:border-lion-blue">
              <span className="flex overflow-hidden rounded">
                {[m.theme.section, m.theme.fond, m.theme.accent].map((col, k) => <span key={k} className="h-4 w-3" style={{ background: col }} />)}
              </span>
              {m.nom}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {COULEURS.map(({ cle, nom }) => (
          <label key={cle} className="flex items-center gap-3 rounded-lg border border-lion-blue/10 p-2">
            <input type="color" value={theme[cle] as string} onChange={e => set({ [cle]: e.target.value.toUpperCase() })} className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent" />
            <span className="text-sm">{nom}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={label}>Police des titres</span>
          <select className={select} value={theme.policeTitre} onChange={e => set({ policeTitre: e.target.value })}>
            {POLICES.map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className={label}>Police du texte</span>
          <select className={select} value={theme.policeTexte} onChange={e => set({ policeTexte: e.target.value })}>
            {POLICES.map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <div>
        <p className={label}>Logo</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button className={choix(theme.logo === null)} onClick={() => set({ logo: null })}>Aucun</button>
          <button className={choix(theme.logo === LOGO_LION)} onClick={() => set({ logo: LOGO_LION })}>Lion Attitude</button>
          <label className={`${choix(logoPerso)} cursor-pointer`}>
            {envoi ? 'Envoi…' : logoPerso ? 'Changer mon logo' : '📤 Mon logo'}
            <input type="file" accept="image/png,image/jpeg,image/webp" hidden disabled={envoi} onChange={e => (envoyerLogo(e.target.files?.[0]), (e.target.value = ''))} />
          </label>
          {logoPerso && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={theme.logo!} alt="" className="h-10 w-10 rounded border border-lion-blue/15 object-contain" />
          )}
        </div>
        {erreur && <p className="mt-1 text-sm text-red-600">{erreur}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={label}>Animation</span>
          <select className={select} value={theme.animation} onChange={e => set({ animation: e.target.value as Animation })}>
            <option value="aucune">Aucune</option>
            <option value="fondu">Fondu</option>
            <option value="glissement">Glissement</option>
            <option value="zoom">Zoom</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={label}>Défilement automatique</span>
          <select className={select} value={theme.autoSecondes} onChange={e => set({ autoSecondes: Number(e.target.value) })}>
            <option value={0}>Non (je clique moi-même)</option>
            {[5, 8, 10, 15, 20, 30].map(n => <option key={n} value={n}>Toutes les {n} secondes</option>)}
          </select>
        </label>
      </div>

      <div>
        <p className={`${label} mb-2`}>Aperçu</p>
        <SlideViewer formationTitre={formationTitre || 'Ma formation'} episode={episode?.lecons.length ? episode : EXEMPLE} theme={theme} />
      </div>
    </section>
  )
}
