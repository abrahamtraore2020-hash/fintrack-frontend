import { NextResponse } from 'next/server'
import { FORMATION_COOKIE, createSessionToken, hashPassword, sessionCookieOptions } from '@/lib/formationAuth'
import { getPasswordRecord } from '@/lib/formationStore'

export async function POST(req: Request) {
  const { password, remember } = await req.json().catch(() => ({ password: '', remember: false }))
  const rec = await getPasswordRecord()
  if (rec && 'error' in rec) return NextResponse.json({ error: rec.error }, { status: 503 })
  if (!rec || 'error' in rec || typeof password !== 'string' || (await hashPassword(password, rec.salt)) !== rec.hash) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }
  const token = await createSessionToken()
  if (!token) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquante' }, { status: 500 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(FORMATION_COOKIE, token, sessionCookieOptions(remember === true))
  return res
}
