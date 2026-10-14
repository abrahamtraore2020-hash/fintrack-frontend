import { NextRequest, NextResponse } from 'next/server'
import { fail, requireTrainer } from '@/lib/formationApi'
import { getFormation } from '@/lib/formationStore'
import { consigneIA, lireReponseIA, questionsSimples } from '@/data/exercice'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MODELE = 'claude-sonnet-5-5'

async function genererParIA(consigne: string, cle: string): Promise<string | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': cle, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODELE, max_tokens: 6000, messages: [{ role: 'user', content: consigne }] }),
    signal: AbortSignal.timeout(50_000),
  })
  if (!res.ok) return null
  const d = await res.json().catch(() => null)
  return d?.content?.find((c: { type: string }) => c.type === 'text')?.text ?? null
}

// Génère des questions à partir des modules choisis : par IA si la clé est configurée, sinon version simple.
export async function POST(req: NextRequest) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { formation: slug, modules, nombre } = await req.json().catch(() => ({}))
  if (typeof slug !== 'string' || !Array.isArray(modules) || modules.length === 0) return fail('Choisissez au moins un module')
  const n = Math.min(20, Math.max(1, Number(nombre) || 5))
  const { formation } = await getFormation(slug)
  if (!formation) return fail('Formation introuvable', 404)
  const episodes = formation.episodes.filter(e => modules.includes(e.slug))
  if (!episodes.length) return fail('Modules introuvables')

  const cle = process.env.ANTHROPIC_API_KEY
  let note = ''
  if (cle) {
    try {
      const texte = await genererParIA(consigneIA(episodes, n), cle)
      const questions = texte ? lireReponseIA(texte).slice(0, n) : []
      if (questions.length) return NextResponse.json({ questions, mode: 'ia' })
      note = 'La génération par IA a échoué cette fois : questions simples utilisées à la place.'
    } catch {
      note = 'La génération par IA n’a pas répondu à temps : questions simples utilisées à la place.'
    }
  }
  const questions = questionsSimples(episodes, n)
  if (!questions.length) return fail('Pas assez de contenu dans ces modules : il faut au moins 3 leçons avec des points. Ajoutez du contenu ou créez vos questions à la main.')
  return NextResponse.json({
    questions,
    mode: 'simple',
    note: note || 'Questions simples générées à partir de vos leçons. Ajoutez la clé ANTHROPIC_API_KEY dans Vercel pour des questions rédigées par l’IA.',
  })
}
