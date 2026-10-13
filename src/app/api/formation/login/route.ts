import { NextResponse } from 'next/server'
import { FORMATION_COOKIE, formationToken } from '@/lib/formationAuth'

export async function POST(req: Request) {
  const expected = process.env.FORMATION_PASSWORD
  const { password } = await req.json().catch(() => ({ password: '' }))
  if (!expected || typeof password !== 'string' || password !== expected) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(FORMATION_COOKIE, await formationToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
