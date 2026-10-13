import type { Episode } from '@/data/formation'
import { PLATEFORME } from '@/data/formation'

const BLUE = '1D4ED8'
const YELLOW = 'F2B705'
const INK = '0F172A'
const FONT = 'Calibri'

async function logoData(): Promise<string | null> {
  try {
    const blob = await (await fetch('/lion-attitude-head.png')).blob()
    return await new Promise(resolve => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.onerror = () => resolve(null)
      r.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// Construit et télécharge un .pptx (16:9) aux couleurs Lion Attitude à partir des modules.
export async function downloadPptx(formationTitre: string, episodes: Episode[], fileName: string) {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 pouces
  pptx.title = formationTitre
  pptx.company = PLATEFORME.nom
  const logo = await logoData()

  pptx.defineSlideMaster({
    title: 'CONTENU',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 0, w: 13.33, h: 0.12, fill: { color: BLUE } } },
      { rect: { x: 0, y: 7.38, w: 13.33, h: 0.12, fill: { color: YELLOW } } },
      ...(logo ? [{ image: { data: logo, x: 12.35, y: 0.3, w: 0.62, h: 0.72 } }] : []),
      { text: { text: PLATEFORME.nom.toUpperCase(), options: { x: 0.5, y: 6.85, w: 6, h: 0.4, fontSize: 10, color: BLUE, fontFace: FONT, charSpacing: 4 } } },
    ],
    slideNumber: { x: 12.3, y: 6.85, w: 0.6, h: 0.4, fontSize: 10, color: '64748B', fontFace: FONT },
  })

  // Couverture
  const cover = pptx.addSlide()
  cover.background = { color: 'FFFFFF' }
  cover.addShape('rect', { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: BLUE } })
  cover.addShape('rect', { x: 0.35, y: 0, w: 0.12, h: 7.5, fill: { color: YELLOW } })
  if (logo) cover.addImage({ data: logo, x: 9.6, y: 1.3, w: 3.0, h: 3.5 })
  cover.addText(PLATEFORME.nom.toUpperCase(), { x: 1.1, y: 1.2, w: 8, h: 0.5, fontSize: 16, color: BLUE, bold: true, charSpacing: 6, fontFace: FONT })
  cover.addText(episodes.length === 1 ? episodes[0].titre : formationTitre, {
    x: 1.1, y: 2.0, w: 8.2, h: 2.0, fontSize: 44, bold: true, color: INK, fontFace: FONT, valign: 'top', fit: 'shrink',
  })
  cover.addText(episodes.length === 1 ? `${formationTitre} · Module ${episodes[0].numero}` : PLATEFORME.sousTitre, {
    x: 1.1, y: 4.2, w: 8.2, h: 0.9, fontSize: 18, color: '475569', fontFace: FONT, valign: 'top',
  })
  cover.addShape('rect', { x: 1.1, y: 5.4, w: 1.6, h: 0.08, fill: { color: YELLOW } })

  // Sommaire (formation complète)
  if (episodes.length > 1) {
    const s = pptx.addSlide({ masterName: 'CONTENU' })
    s.addText('Au programme', { x: 0.6, y: 0.45, w: 11, h: 0.8, fontSize: 32, bold: true, color: BLUE, fontFace: FONT })
    s.addText(
      episodes.map(e => ({ text: `Module ${e.numero} · ${e.titre}`, options: { bullet: { code: '25A0' }, breakLine: true } })),
      { x: 0.8, y: 1.5, w: 11.5, h: 5.1, fontSize: 22, color: INK, fontFace: FONT, valign: 'top', paraSpaceAfter: 10, fit: 'shrink' },
    )
  }

  for (const e of episodes) {
    // Intercalaire de module
    const sec = pptx.addSlide()
    sec.background = { color: BLUE }
    sec.addText(`MODULE ${e.numero}`, { x: 0.8, y: 2.2, w: 11, h: 0.6, fontSize: 20, color: YELLOW, bold: true, charSpacing: 6, fontFace: FONT })
    sec.addText(e.titre, { x: 0.8, y: 2.9, w: 11.5, h: 1.6, fontSize: 40, bold: true, color: 'FFFFFF', fontFace: FONT, valign: 'top', fit: 'shrink' })
    if (e.resume) sec.addText(e.resume, { x: 0.8, y: 4.6, w: 11, h: 1.0, fontSize: 18, color: 'DBEAFE', fontFace: FONT, valign: 'top' })
    if (logo) sec.addImage({ data: logo, x: 12.1, y: 6.3, w: 0.8, h: 0.93 })

    // Une diapositive par leçon
    e.lecons.forEach((l, i) => {
      const s = pptx.addSlide({ masterName: 'CONTENU' })
      s.addText(`Module ${e.numero} · Leçon ${i + 1}`, { x: 0.6, y: 0.35, w: 10, h: 0.4, fontSize: 12, color: '64748B', fontFace: FONT })
      s.addText(l.titre || 'Leçon', { x: 0.6, y: 0.75, w: 11.4, h: 0.9, fontSize: 32, bold: true, color: BLUE, fontFace: FONT, fit: 'shrink' })
      s.addShape('rect', { x: 0.6, y: 1.7, w: 1.2, h: 0.07, fill: { color: YELLOW } })
      const points = l.points.filter(p => p.trim())
      if (points.length)
        s.addText(
          points.map(p => ({ text: p, options: { bullet: { code: '25CF' }, breakLine: true } })),
          { x: 0.8, y: 2.1, w: 11.5, h: 4.5, fontSize: 24, color: INK, fontFace: FONT, valign: 'top', paraSpaceAfter: 14, fit: 'shrink' },
        )
    })
  }

  // Fin
  const end = pptx.addSlide()
  end.background = { color: 'FFFFFF' }
  end.addShape('rect', { x: 0, y: 7.1, w: 13.33, h: 0.4, fill: { color: BLUE } })
  if (logo) end.addImage({ data: logo, x: 5.66, y: 0.9, w: 2.0, h: 2.33 })
  end.addText('Des questions ?', { x: 0.5, y: 3.6, w: 12.33, h: 1.0, fontSize: 40, bold: true, color: BLUE, align: 'center', fontFace: FONT })
  end.addText(PLATEFORME.nom, { x: 0.5, y: 4.6, w: 12.33, h: 0.6, fontSize: 18, color: '475569', align: 'center', fontFace: FONT })

  await pptx.writeFile({ fileName })
}
