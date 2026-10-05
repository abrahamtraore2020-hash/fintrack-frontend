import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Get recent sales for social proof notifications on the sales page

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
    const { data: sales, error } = await supabase
      .from('aphrodite_customer_purchases')
      .select('id, customer_id, purchased_at, aphrodite_customers(first_name, country)')
      .order('purchased_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[Sales API] Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format for frontend: match the RECENT_BUYERS format (name, place, date)
    const formatted = (sales || []).map((sale: any) => ({
      name: sale.aphrodite_customers?.first_name || 'Someone',
      place: sale.aphrodite_customers?.country || 'World',
      date: sale.purchased_at,
    }))

    return NextResponse.json({ buyers: formatted })
  } catch (error: any) {
    console.error('[Sales API] Exception:', error?.message)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}
