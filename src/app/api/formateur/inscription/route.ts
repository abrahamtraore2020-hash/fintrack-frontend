import { NextResponse } from 'next/server'
import { FORMATION_COOKIE, createSessionToken, hashPassword, randomSalt, sessionCookieOptions } from '@/lib/formationAuth'
import { consommerInvitation, creerFormateur, lierInvitation, lireInvitation, rendreInvitation } from '@/lib/formationStore'
import { verifierEleve } from '@/data/exercice'

export const dynamic = 'force-dynamic'

// Public : vérifie qu'un lien d'invitation est valable.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code') ?? ''
  const inv = await lireInvitation(code)
  if (!inv || inv.utilisee_le) return NextResponse.json({ error: 'Ce lien d’invitation n’est plus valable. Demandez-en un nouveau.' }, { status: 404 })
  return NextResponse.json({ nom: inv.nom })
}

// Public (avec un lien d'invitation) : crée le compte formateur et le connecte.
export async function POST(req: Request) {
  const { code, nom, email, password, site } = await req.json().catch(() => ({}))
  if (typeof site === 'string' && site) return NextResponse.json({ ok: true }) // piège anti-robots
  const v = verifierEleve(nom, email)
  if (!v.ok) return NextResponse.json({ error: v.erreur }, { status: 400 })
  if (typeof password !== 'string' || password.length < 8) return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
  const inv = typeof code === 'string' ? await lireInvitation(code) : null
  if (!inv || inv.utilisee_le) return NextResponse.json({ error: 'Ce lien d’invitation n’est plus valable. Demandez-en un nouveau.' }, { status: 404 })
  if (!(await consommerInvitation(inv.code))) return NextResponse.json({ error: 'Ce lien d’invitation vient d’être utilisé.' }, { status: 409 })

  const salt = randomSalt()
  const res = await creerFormateur(v.email, v.nom, await hashPassword(password, salt), salt)
  if ('erreur' in res) {
    // L'invitation n'est pas perdue si la création échoue (ex. email déjà utilisé).
    await rendreInvitation(inv.code)
    return NextResponse.json({ error: res.erreur }, { status: res.doublon ? 409 : 500 })
  }
  await lierInvitation(inv.code, res.id)
  const token = await createSessionToken(res.id)
  if (!token) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquante' }, { status: 500 })
  const rep = NextResponse.json({ ok: true })
  rep.cookies.set(FORMATION_COOKIE, token, sessionCookieOptions(true))
  return rep
}
