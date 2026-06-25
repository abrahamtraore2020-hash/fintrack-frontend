import { NextRequest, NextResponse } from 'next/server'

const CHARIOW_BASE = 'https://api.chariow.com/v1'

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json()
    if (!apiKey) return NextResponse.json({ error: 'Clé API manquante' }, { status: 400 })

    // Récupérer toutes les commandes via pagination curseur
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }

    let allOrders: any[] = []
    let cursor: string | null = null
    let hasMore = true

    while (hasMore) {
      const url: string = cursor
        ? `${CHARIOW_BASE}/orders?cursor=${cursor}&per_page=50`
        : `${CHARIOW_BASE}/orders?per_page=50`

      const res = await fetch(url, { headers })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return NextResponse.json({ error: 'Clé API invalide ou accès refusé', details: err }, { status: res.status })
      }

      const data = await res.json()
      const pageOrders = data.data?.data || data.data || data.orders || data || []
      allOrders = [...allOrders, ...pageOrders]

      const pagination = data.data?.pagination || data.pagination
      hasMore = pagination?.has_more === true
      cursor = pagination?.next_cursor || null

      // Sécurité : max 1000 commandes
      if (allOrders.length >= 1000) break
    }

    const orders = allOrders

    // Convertir les commandes Chariow en transactions FinTrack
    const transactions = orders.map((order: any) => ({
      id: `chariow-${order.id}`,
      type: 'income' as const,
      amount: Number(order.total || order.amount || order.price || 0),
      currency: 'XOF' as const,
      category: 'freelance' as const,
      description: `Chariow – ${order.product_name || order.title || order.name || 'Commande #' + order.id}`,
      date: order.created_at ? order.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      accountId: '',
      isRecurring: false,
      createdAt: order.created_at || new Date().toISOString(),
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
