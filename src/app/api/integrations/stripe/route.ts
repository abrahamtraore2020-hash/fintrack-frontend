import { NextRequest, NextResponse } from 'next/server'

const STRIPE_BASE = 'https://api.stripe.com/v1'

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json()
    if (!apiKey) return NextResponse.json({ error: 'Clé API manquante' }, { status: 400 })

    const headers = { 'Authorization': `Bearer ${apiKey}` }

    // Vérifier la clé via /balance
    const checkRes = await fetch(`${STRIPE_BASE}/balance`, { headers })
    if (!checkRes.ok) {
      return NextResponse.json({ error: 'Clé API Stripe invalide. Vérifiez dans Stripe → Développeurs → Clés API' }, { status: 401 })
    }

    // Récupérer toutes les transactions (charges réussies)
    let allCharges: any[] = []
    let hasMore = true
    let startingAfter: string | null = null

    while (hasMore && allCharges.length < 1000) {
      const url: string = startingAfter
        ? `${STRIPE_BASE}/charges?limit=100&starting_after=${startingAfter}`
        : `${STRIPE_BASE}/charges?limit=100`

      const res = await fetch(url, { headers })
      if (!res.ok) break
      const data = await res.json()
      const charges = data.data || []
      allCharges = [...allCharges, ...charges]
      hasMore = data.has_more === true
      startingAfter = charges.length > 0 ? charges[charges.length - 1].id : null
    }

    const transactions = allCharges
      .filter((c: any) => c.status === 'succeeded')
      .map((c: any) => ({
        type: 'income' as const,
        amount: Math.round((c.amount || 0) / 100), // Stripe stocke en centimes
        currency: ((c.currency || 'usd').toUpperCase() === 'XOF' ? 'XOF' : (c.currency || 'usd').toUpperCase() === 'EUR' ? 'EUR' : 'USD') as 'XOF' | 'USD' | 'EUR',
        category: 'freelance' as const,
        description: `Stripe – ${c.description || c.billing_details?.name || 'Paiement #' + c.id.slice(-6)}`,
        date: new Date((c.created || Date.now() / 1000) * 1000).toISOString().split('T')[0],
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
