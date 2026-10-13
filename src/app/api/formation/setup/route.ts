import { NextResponse } from 'next/server'
import { FORMATION_COOKIE, createSessionToken, hashPassword, randomSalt, sessionCookieOptions } from '@/lib/formationAuth'
import { createPasswordRecord, getPasswordRecord } from '@/lib/formationStore'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
  }
  const existing = await getPasswordRecord()
  if (existing && 'error' in existing) return NextResponse.json({ error: existing.error }, { status: 503 })
  if (existing && 'hash' in existing) return NextResponse.json({ error: 'Un mot de passe existe déjà' }, { status: 409 })

  const salt = randomSalt()
  const err = await createPasswordRecord(await hashPassword(password, salt), salt)
  if (err) return NextResponse.json({ error: 'Un mot de passe existe déjà ou la base est indisponible' }, { status: 409 })

  const token = await createSessionToken()
  if (!token) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquante' }, { status: 500 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(FORMATION_COOKIE, token, sessionCookieOptions)
  return res
}
