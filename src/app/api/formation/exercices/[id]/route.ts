import { NextRequest, NextResponse } from 'next/server'
import { fail, requireTrainer } from '@/lib/formationApi'
import { lireExercice, sauverExercice, supprimerExercice } from '@/lib/formationStore'
import { normalizeQuestions } from '@/data/exercice'

export const dynamic = 'force-dynamic'
type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { exercice, erreur } = await lireExercice(params.id)
  if (erreur) return fail(erreur, 500)
  return exercice ? NextResponse.json({ exercice }) : fail('Exercice introuvable', 404)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const { titre, modules, questions, ouvert } = await req.json().catch(() => ({}))
  if (typeof titre !== 'string' || !titre.trim()) return fail('Donnez un titre à l’exercice')
  if (!Array.isArray(questions)) return fail('Données invalides')
  const propres = normalizeQuestions(questions)
  if (propres.length !== questions.length) return fail('Une question est incomplète : il faut un énoncé, 3 réponses remplies et une seule bonne réponse')
  const error = await sauverExercice(params.id, {
    titre: titre.trim().slice(0, 150),
    modules: Array.isArray(modules) ? modules.filter((m: unknown): m is string => typeof m === 'string') : [],
    questions: propres,
    ouvert: ouvert !== false,
  })
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const error = await supprimerExercice(params.id)
  return error ? fail(error, 500) : NextResponse.json({ ok: true })
}
