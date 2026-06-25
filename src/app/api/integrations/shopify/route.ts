import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { shopDomain, accessToken } = await req.json()
    if (!shopDomain || !accessToken) return NextResponse.json({ error: 'Domaine boutique et Access Token requis' }, { status: 400 })

    const shop = shopDomain.replace(/https?:\/\//, '').replace(/\/$/, '')
    const headers = { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' }
    const BASE = `https://${shop}/admin/api/2024-01`

    // Vérifier accès
    const checkRes = await fetch(`${BASE}/shop.json`, { headers })
    if (!checkRes.ok) {
      return NextResponse.json({ error: 'Accès refusé. Vérifiez votre domaine et Access Token Shopify' }, { status: 401 })
    }

    // Récupérer toutes les commandes
    let allOrders: any[] = []
    let pageUrl = `${BASE}/orders.json?status=any&limit=250` as string | null

    while (pageUrl !== null && allOrders.length < 2000) {
      const currentUrl: string = pageUrl
      const res = await fetch(currentUrl, { headers })
      if (!res.ok) break
      const data = await res.json()
      allOrders = [...allOrders, ...(data.orders || [])]

      // Pagination via header Link
      const linkHeader = res.headers.get('Link') || ''
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
      pageUrl = nextMatch ? nextMatch[1] : null
    }

    const transactions = allOrders
      .filter((o: any) => o.financial_status === 'paid')
      .map((o: any) => ({
        type: 'income' as const,
        amount: Math.max(0, Number(o.total_price) || 0),
        currency: ((o.currency || 'USD') === 'XOF' ? 'XOF' : (o.currency || 'USD') === 'EUR' ? 'EUR' : 'USD') as 'XOF' | 'USD' | 'EUR',
        category: 'freelance' as const,
        description: `Shopify – ${o.name || 'Commande #' + o.order_number}`,
        date: (o.created_at || new Date().toISOString()).split('T')[0],
        accountId: '',
        isRecurring: false,
        coffreId: undefined,
      }))

    return NextResponse.json({
      success: true,
      transactions,
      total: transactions.length,
      revenue: transactions.reduce((s: number, t: any) => s + t.amount, 0),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
