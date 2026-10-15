import { NextResponse } from 'next/server'
import { FORMATION_COOKIE, createSessionToken, hashPassword, sessionCookieOptions } from '@/lib/formationAuth'
import { getPasswordRecord, lireFormateurParEmail } from '@/lib/formationStore'

export async function POST(req: Request) {
  const { password, remember, email } = await req.json().catch(() => ({ password: '', remember: false, email: '' }))
  let formateurId: string | undefined
  if (typeof email === 'string' && email.trim()) {
    // Formateur invité : email + mot de passe
    const f = await lireFormateurParEmail(email)
    const ok = !!f && f.actif && !!f.hash && !!f.salt && typeof password === 'string' && (await hashPassword(password, f.salt)) === f.hash
    if (!ok || !f) return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    formateurId = f.id
  } else {
    // Administrateur : mot de passe historique
    const rec = await getPasswordRecord()
    if (rec && 'error' in rec) return NextResponse.json({ error: rec.error }, { status: 503 })
    if (!rec || 'error' in rec || typeof password !== 'string' || (await hashPassword(password, rec.salt)) !== rec.hash) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }
  }
  const token = await createSessionToken(formateurId)
  if (!token) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquante' }, { status: 500 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(FORMATION_COOKIE, token, sessionCookieOptions(remember === true))
  return res
}
