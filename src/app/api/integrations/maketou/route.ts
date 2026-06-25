import { NextRequest, NextResponse } from 'next/server'

const MAKETOU_BASE = 'https://api.maketou.com'

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json()
    if (!apiKey) return NextResponse.json({ error: 'Clé API manquante' }, { status: 400 })

    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }

    // Essayer différents endpoints possibles
    const ENDPOINTS = ['/api/orders', '/api/sales', '/api/transactions', '/orders', '/sales']
    let allOrders: any[] = []

    for (const endpoint of ENDPOINTS) {
      const res = await fetch(`${MAKETOU_BASE}${endpoint}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const items = data.data || data.orders || data.sales || data.transactions || data || []
        if (Array.isArray(items) && items.length >= 0) {
          allOrders = items
          break
        }
      }
    }

    const transactions = allOrders.map((order: any) => {
      const rawAmount = order.amount?.value ?? order.amount ?? order.total ?? order.price ?? order.total_price ?? 0
      const amount = Math.max(0, Number(rawAmount) || 0)
      return {
        type: 'income' as const,
        amount,
        currency: 'XOF' as const,
        category: 'freelance' as const,
        description: `Maketou – ${order.product?.name || order.product_name || order.title || 'Vente #' + order.id}`,
        date: (order.created_at || order.date || new Date().toISOString()).split('T')[0],
        accountId: '',
        isRecurring: false,
        coffreId: undefined,
      }
    })

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
