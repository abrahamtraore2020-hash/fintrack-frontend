import { NextResponse } from 'next/server'
import { getPasswordRecord } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rec = await getPasswordRecord()
  if (rec === 'error') return NextResponse.json({ error: 'Base de données indisponible ou table manquante' }, { status: 503 })
  return NextResponse.json({ configured: rec !== null })
}
