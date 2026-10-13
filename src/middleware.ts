import { NextRequest, NextResponse } from 'next/server'
import { FORMATION_COOKIE, isFormationAuthorized } from '@/lib/formationAuth'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/formation/acces')) return NextResponse.next()
  if (await isFormationAuthorized(req.cookies.get(FORMATION_COOKIE)?.value)) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/formation/acces'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/formation', '/formation/:path*'] }
