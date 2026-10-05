import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Get list of customers pending WhatsApp relance for the dashboard
// Used by /aphrodite/relance admin dashboard

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expectedAuth = process.env.DASHBOARD_AUTH_TOKEN

  if (!expectedAuth || authHeader !== `Bearer ${expectedAuth}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const status = req.nextUrl.searchParams.get('status') || 'abandoned_cart'
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')

  try {
    const { data: customers, error } = await supabase
      .from('aphrodite_customers')
      .select(
        `
        id,
        first_name,
        email,
        phone,
        country,
        status,
        abandoned_at,
        completed_at,
        created_at,
        relance_emails:aphrodite_relance_emails(
          id,
          message_type,
          channel,
          sent_at,
          scheduled_at
        )
        `
      )
      .eq('status', status)
      .order('abandoned_at', { ascending: false, nullsFirst: false })
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      console.error('[Dashboard] Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ customers, count: customers?.length || 0 })
  } catch (error: any) {
    console.error('[Dashboard] Exception:', error?.message)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
