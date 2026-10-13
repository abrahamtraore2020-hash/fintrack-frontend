import { NextResponse } from 'next/server'
import { getPasswordRecord } from '@/lib/formationStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rec = await getPasswordRecord()
  if (rec && 'error' in rec) return NextResponse.json({ error: rec.error }, { status: 503 })
  return NextResponse.json({ configured: rec !== null })
}
