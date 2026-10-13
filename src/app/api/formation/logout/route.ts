import { NextResponse } from 'next/server'
import { FORMATION_COOKIE } from '@/lib/formationAuth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(FORMATION_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
