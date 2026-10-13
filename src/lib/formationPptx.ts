import type { Episode } from '@/data/formation'
import { PLATEFORME } from '@/data/formation'
import { contraste, type Theme } from '@/data/theme'

type Slide = import('pptxgenjs').default.Slide
const c = (hex: string) => hex.replace('#', '').toUpperCase()
const pad = (n: number) => String(n).padStart(2, '0')
const W = 13.33
const H = 7.5

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const blob = await (await fetch(url)).blob()
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

// Charge une image et calcule sa taille pour la faire tenir dans la case (w x h) sans la déformer.
async function fitImage(url: string, x: number, y: number, w: number, h: number) {
  const data = await toDataUrl(url)
  if (!data) return null
  const img = new Image()
  await new Promise(r => ((img.onload = r), (img.onerror = r), (img.src = data)))
  if (!img.naturalWidth) return null
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
  const iw = img.naturalWidth * scale
  const ih = img.naturalHeight * scale
  return { data, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih }
}

// Ajoute à chaque diapositive la transition choisie et, si demandé, le passage automatique.
async function addTransitions(file: ArrayBuffer, theme: Theme): Promise<Blob> {
  const effect = { aucune: '', fondu: '<p:fade/>', glissement: '<p:push dir="l"/>', zoom: '<p:zoom/>' }[theme.animation]
  const auto = theme.autoSecondes > 0 ? ` advTm="${theme.autoSecondes * 1000}"` : ''
  const mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  if (!effect && !auto) return new Blob([file], { type: mime })
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(file)
  const xml = `<p:transition spd="med"${auto}>${effect}</p:transition>`
  for (const name of Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const s = await zip.file(name)!.async('string')
    zip.file(name, s.replace('</p:clrMapOvr>', `</p:clrMapOvr>${xml}`))
  }
  return zip.generateAsync({ type: 'blob', mimeType: mime })
}

// Construit et télécharge un .pptx 16:9 avec l'apparence choisie pour la formation.
export async function downloadPptx(formationTitre: string, episodes: Episode[], theme: Theme, fileName: string) {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.title = formationTitre
  pptx.company = PLATEFORME.nom

  const T = { fontFace: theme.policeTitre }
  const B = { fontFace: theme.policeTexte }
  const onSection = c(contraste(theme.section))
  const logo = theme.logo ? await toDataUrl(theme.logo) : null
  const single = episodes.length === 1

  const logoBadge = async (s: Slide, x: number, y: number, d: number) => {
    if (!logo) return
    s.addShape('ellipse', { x, y, w: d, h: d, fill: { color: 'FFFFFF' }, line: { type: 'none' }, shadow: { type: 'outer', blur: 12, offset: 4, angle: 90, opacity: 0.25, color: '000000' } })
    const f = await fitImage(theme.logo!, x + d * 0.14, y + d * 0.14, d * 0.72, d * 0.72)
    if (f) s.addImage(f)
  }

  const sectionSlide = async (surtitre: string, titre: string, sousTitre: string, badge: string) => {
    const s = pptx.addSlide()
    s.background = { color: c(theme.section) }
    s.addShape('rect', { x: 0, y: 0, w: 0.16, h: H, fill: { color: c(theme.accent) }, line: { type: 'none' } })
    s.addText(surtitre.toUpperCase(), { ...B, x: 0.9, y: 1.6, w: logo ? 8 : 11, h: 0.5, fontSize: 14, bold: true, color: c(theme.accent), charSpacing: 6 })
    s.addText(titre, { ...T, x: 0.9, y: 2.15, w: logo ? 8 : 11.4, h: 2.0, fontSize: 46, bold: true, color: onSection, valign: 'top', fit: 'shrink' })
    if (sousTitre) s.addText(sousTitre, { ...B, x: 0.9, y: 4.25, w: logo ? 7.6 : 11, h: 1.0, fontSize: 18, color: onSection, transparency: 20, valign: 'top', fit: 'shrink' })
    s.addShape('rect', { x: 0.9, y: 5.55, w: 1.1, h: 0.07, fill: { color: c(theme.accent) }, line: { type: 'none' } })
    s.addText(badge.toUpperCase(), { ...B, x: 2.15, y: 5.38, w: 5, h: 0.4, fontSize: 13, bold: true, color: onSection, charSpacing: 3 })
    await logoBadge(s, 9.4, 1.65, 3.2)
  }

  const listSlide = (gauche: string, titre: string, items: string[]) => {
    const s = pptx.addSlide()
    s.background = { color: c(theme.fond) }
    s.addShape('rect', { x: 0, y: 0, w: W * 0.34, h: H, fill: { color: c(theme.section) }, line: { type: 'none' } })
    s.addText(gauche.toUpperCase(), { ...B, x: 0.6, y: 2.7, w: 3.6, h: 0.4, fontSize: 12, bold: true, color: c(theme.accent), charSpacing: 5 })
    s.addText(titre, { ...T, x: 0.6, y: 3.1, w: 3.6, h: 1.4, fontSize: 32, bold: true, color: onSection, valign: 'top' })
    const list = items.slice(0, 8)
    const step = Math.min(0.75, 5.8 / list.length)
    const top = (H - step * list.length) / 2
    list.forEach((t, k) => {
      const y = top + k * step
      s.addShape('ellipse', { x: 5.2, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: c(theme.accent) }, line: { type: 'none' } })
      s.addText(pad(k + 1), { ...B, x: 5.2, y: y + 0.05, w: 0.5, h: 0.5, fontSize: 12, bold: true, color: c(contraste(theme.accent)), align: 'center', valign: 'middle' })
      s.addText(t, { ...B, x: 5.9, y, w: 6.9, h: 0.6, fontSize: 18, bold: true, color: c(theme.texte), valign: 'middle', fit: 'shrink' })
    })
  }

  let page = 0
  const lessonSlide = async (e: Episode, index: number) => {
    const l = e.lecons[index]
    const s = pptx.addSlide()
    page++
    s.background = { color: c(theme.fond) }
    if (logo) {
      const f = await fitImage(theme.logo!, 12.0, 0.4, 0.75, 0.75)
      if (f) s.addImage(f)
    }
    s.addText(pad(index + 1), { ...T, x: 0.6, y: 0.45, w: 1.5, h: 1.1, fontSize: 54, bold: true, color: c(theme.accent), valign: 'bottom' })
    s.addText(`LEÇON ${index + 1}`, { ...B, x: 2.15, y: 0.5, w: 9, h: 0.4, fontSize: 11, color: c(theme.texte), transparency: 40, charSpacing: 2 })
    s.addText(l.titre || 'Leçon', { ...T, x: 2.15, y: 0.88, w: 9.6, h: 0.75, fontSize: 30, bold: true, color: c(theme.titre), valign: 'top', fit: 'shrink' })
    s.addShape('line', { x: 0.6, y: 1.85, w: W - 1.2, h: 0, line: { color: c(theme.accent), width: 1.5, transparency: 60 } })

    const points = l.points.filter(p => p.trim())
    const images = (l.images ?? []).slice(0, 4)
    if (points.length)
      s.addText(
        points.map(p => ({ text: p, options: { bullet: { code: '25C6' }, breakLine: true } })),
        { ...B, x: 0.6, y: 2.2, w: images.length ? 5.9 : 12, h: 4.4, fontSize: images.length ? 20 : 24, color: c(theme.texte), valign: 'top', paraSpaceAfter: 16, fit: 'shrink' },
      )
    const cols = images.length > 1 ? 2 : 1
    const rows = images.length > 2 ? 2 : 1
    const cw = (5.9 - (cols - 1) * 0.2) / cols
    const ch = (4.4 - (rows - 1) * 0.2) / rows
    for (let k = 0; k < images.length; k++) {
      const f = await fitImage(images[k], 6.85 + (k % cols) * (cw + 0.2), 2.2 + Math.floor(k / cols) * (ch + 0.2), cw, ch)
      if (f) s.addImage({ ...f, shadow: { type: 'outer', blur: 8, offset: 3, angle: 90, opacity: 0.2, color: '000000' } })
    }
    s.addText(`${formationTitre} · Module ${e.numero}`, { ...B, x: 0.6, y: 6.95, w: 9, h: 0.3, fontSize: 10, color: c(theme.texte), transparency: 50 })
    s.addText(String(page), { ...B, x: 11.9, y: 6.95, w: 0.8, h: 0.3, fontSize: 10, color: c(theme.texte), transparency: 50, align: 'right' })
  }

  if (single) {
    const e = episodes[0]
    await sectionSlide(formationTitre, e.titre, e.resume, `Module ${pad(e.numero)}`)
    if (e.lecons.length > 1) listSlide(`Module ${pad(e.numero)}`, 'Au programme', e.lecons.map(l => l.titre))
    for (let k = 0; k < e.lecons.length; k++) await lessonSlide(e, k)
  } else {
    await sectionSlide(PLATEFORME.nom, formationTitre, '', `${episodes.length} modules`)
    listSlide('Formation', 'Au programme', episodes.map(e => e.titre))
    for (const e of episodes) {
      await sectionSlide(`Module ${pad(e.numero)}`, e.titre, e.resume, formationTitre)
      for (let k = 0; k < e.lecons.length; k++) await lessonSlide(e, k)
    }
  }

  // Fin
  const end = pptx.addSlide()
  end.background = { color: c(theme.section) }
  await logoBadge(end, (W - 2.2) / 2, 1.1, 2.2)
  end.addText('Merci !', { ...T, x: 0.5, y: logo ? 3.55 : 2.8, w: W - 1, h: 1.0, fontSize: 48, bold: true, color: onSection, align: 'center' })
  end.addText('Des questions ?', { ...B, x: 0.5, y: logo ? 4.55 : 3.8, w: W - 1, h: 0.6, fontSize: 22, color: onSection, transparency: 20, align: 'center' })
  end.addShape('rect', { x: (W - 1.1) / 2, y: logo ? 5.35 : 4.6, w: 1.1, h: 0.07, fill: { color: c(theme.accent) }, line: { type: 'none' } })

  const raw = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer
  const blob = await addTransitions(raw, theme)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
}
