'use client'

import { useState } from 'react'
import type { Episode } from '@/data/formation'
import { slugify } from '@/lib/slug'

export function DownloadPptx({ formationTitre, episodes, label }: { formationTitre: string; episodes: Episode[]; label: string }) {
  const [busy, setBusy] = useState(false)
  const download = async () => {
    setBusy(true)
    try {
      const { downloadPptx } = await import('@/lib/formationPptx')
      const nom = episodes.length === 1 ? `${formationTitre} - Module ${episodes[0].numero} - ${episodes[0].titre}` : formationTitre
      await downloadPptx(formationTitre, episodes, `${slugify(nom)}.pptx`)
    } catch {
      alert('Impossible de créer le PowerPoint. Réessayez.')
    }
    setBusy(false)
  }
  return (
    <button
      onClick={download}
      disabled={busy || episodes.length === 0}
      className="shrink-0 rounded-lg border-2 border-lion-gold bg-lion-gold/10 px-3 py-1.5 text-sm font-semibold text-lion-ink hover:bg-lion-gold/25 disabled:opacity-50"
    >
      {busy ? 'Création…' : `📥 ${label}`}
    </button>
  )
}
