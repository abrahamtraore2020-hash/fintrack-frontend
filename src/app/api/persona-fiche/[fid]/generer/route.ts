import { NextResponse } from 'next/server'
import { type Fiche, completerIdee, consigneAvatar, consigneSolution, ideeAUnPoint, ideeManquante, lireAvatar, lireSolution, normaliserFiche } from '@/data/persona'
import { MAX_GENERATIONS, lireFiche, sauverFiche } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MODELE = 'claude-sonnet-5-5'

// Deux fournisseurs possibles : Google Gemini (offre gratuite) ou Anthropic (payant). Gemini est utilisé s'il est configuré.
async function demanderIA(consigne: string): Promise<string | null> {
  const gem = process.env.GEMINI_API_KEY
  if (gem) {
    const base = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com'
    const modele = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const res = await fetch(`${base}/v1beta/models/${modele}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': gem, 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: consigne }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.7 } }),
      signal: AbortSignal.timeout(50_000),
    })
    if (!res.ok) return null
    const d = await res.json().catch(() => null)
    return d?.candidates?.[0]?.content?.parts?.find((x: { text?: string }) => x.text)?.text ?? null
  }
  const base = process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com'
  const res = await fetch(`${base}/v1/messages`, {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY ?? '', 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODELE, max_tokens: 2000, messages: [{ role: 'user', content: consigne }] }),
    signal: AbortSignal.timeout(50_000),
  })
  if (!res.ok) return null
  const d = await res.json().catch(() => null)
  return d?.content?.find((c: { type: string }) => c.type === 'text')?.text ?? null
}

// Public (clé secrète de l'étudiant) : propose la solution / le produit, ou l'avatar, à partir de ce que l'étudiant a écrit.
export async function POST(req: Request, { params }: { params: { fid: string } }) {
  const { cle, etape, data } = await req.json().catch(() => ({}))
  const { fiche } = await lireFiche(params.fid, cle)
  if (!fiche) return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 })
  const f = normaliserFiche(data)
  if (etape !== 'solution' && etape !== 'avatar') return NextResponse.json({ error: 'Étape inconnue' }, { status: 400 })
  if (etape === 'solution' && !ideeAUnPoint(f)) return NextResponse.json({ error: 'Écrivez d’abord au moins un point : le problème, la solution, le bénéfice, la promesse ou le nom du produit.' }, { status: 400 })
  if (etape === 'avatar' && (!f.avatar.nom || ideeManquante(f).length > 0)) return NextResponse.json({ error: 'Choisissez le prénom de votre avatar, et complétez d’abord votre idée (problème, solution, bénéfice, promesse, nom).' }, { status: 400 })

  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) return NextResponse.json({ mode: 'manuel' })
  if (fiche.generations >= MAX_GENERATIONS) return NextResponse.json({ error: 'Vous avez utilisé toutes vos propositions automatiques. Complétez ou modifiez la fiche à la main.' }, { status: 429 })

  let texte: string | null = null
  try {
    texte = await demanderIA(etape === 'solution' ? consigneSolution(f) : consigneAvatar(f))
  } catch {
    texte = null
  }
  const suivi = etape === 'solution' ? lireSolution(texte ?? '') : lireAvatar(texte ?? '')
  const idee = etape === 'solution' && suivi ? completerIdee(f, suivi as Partial<Fiche>) : null
  if (!suivi || (idee && ideeManquante(idee).length > 0)) return NextResponse.json({ error: 'La proposition automatique n’a pas fonctionné cette fois. Réessayez, ou complétez à la main.' }, { status: 502 })

  const nouvelle = idee ? idee : { ...f, avatar: { ...f.avatar, ...(suivi as object) } }
  await sauverFiche(params.fid, cle, normaliserFiche(nouvelle), fiche.generations + 1)
  return NextResponse.json({ mode: 'ia', data: normaliserFiche(nouvelle), restantes: MAX_GENERATIONS - fiche.generations - 1 })
}
