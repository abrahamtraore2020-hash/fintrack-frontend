import { NextRequest, NextResponse } from 'next/server'
import { FORMATION_COOKIE, formationToken } from '@/lib/formationAuth'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/formation/acces')) return NextResponse.next()

  const password = process.env.FORMATION_PASSWORD
  // Sans mot de passe configuré, l'accès reste fermé.
  if (password && req.cookies.get(FORMATION_COOKIE)?.value === (await formationToken(password))) {
    return NextResponse.next()
  }
  const url = req.nextUrl.clone()
  url.pathname = '/formation/acces'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/formation', '/formation/:path*'] }
