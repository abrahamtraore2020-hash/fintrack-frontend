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

    // Vérifier d'abord que la clé est valide via /store
    const storeRes = await fetch(`${CHARIOW_BASE}/store`, { headers })
    if (!storeRes.ok) {
      return NextResponse.json({ error: 'Clé API invalide. Vérifiez votre clé dans Chariow → Développeurs → API' }, { status: 401 })
    }

    // Essayer plusieurs endpoints pour les ventes/commandes
    const SALES_ENDPOINTS = ['/sales', '/orders', '/purchases', '/transactions']
    let allOrders: any[] = []
    let foundEndpoint = ''

    for (const endpoint of SALES_ENDPOINTS) {
      const testRes = await fetch(`${CHARIOW_BASE}${endpoint}?per_page=50`, { headers })
      if (testRes.ok) {
        const testData = await testRes.json()
        const items = testData.data?.data || testData.data || testData.orders || testData.sales || []
        if (Array.isArray(items)) {
          allOrders = items
          foundEndpoint = endpoint
          // Paginer si nécessaire
          let cursor: string | null = testData.data?.pagination?.next_cursor || null
          let hasMore: boolean = testData.data?.pagination?.has_more === true
          while (hasMore && allOrders.length < 1000) {
            const nextUrl: string = `${CHARIOW_BASE}${endpoint}?cursor=${cursor}&per_page=50`
            const nextRes = await fetch(nextUrl, { headers })
            if (!nextRes.ok) break
            const nextData = await nextRes.json()
            const nextItems = nextData.data?.data || nextData.data || []
            allOrders = [...allOrders, ...(Array.isArray(nextItems) ? nextItems : [])]
            cursor = nextData.data?.pagination?.next_cursor || null
            hasMore = nextData.data?.pagination?.has_more === true
          }
          break
        }
      }
    }

    const orders = allOrders

    // Debug : retourner le premier ordre brut pour identifier les champs
    const rawSample = orders.length > 0 ? orders[0] : null

    // Convertir les commandes Chariow en transactions FinTrack
    const transactions = orders.map((order: any) => {
      // Chercher le montant dans tous les champs possibles
      const rawAmount =
        order.total ?? order.amount ?? order.price ??
        order.total_price ?? order.grand_total ?? order.subtotal ??
        order.total_amount ?? order.revenue ?? order.net_amount ?? 0
      const amount = Math.max(0, Number(rawAmount) || 0)

      return {
        type: 'income' as const,
        amount,
        currency: 'XOF' as const,
        category: 'freelance' as const,
        description: `Chariow – ${order.product_name || order.title || order.reference || order.name || 'Commande #' + order.id}`,
        date: order.created_at ? order.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
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
      _debug_first_order: rawSample,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
