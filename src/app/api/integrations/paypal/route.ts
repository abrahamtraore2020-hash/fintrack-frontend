import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_BASE = 'https://api-m.paypal.com'

export async function POST(req: NextRequest) {
  try {
    const { clientId, clientSecret } = await req.json()
    if (!clientId || !clientSecret) return NextResponse.json({ error: 'Client ID et Client Secret requis' }, { status: 400 })

    // OAuth2 token
    const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Identifiants PayPal invalides. Vérifiez dans PayPal → Développeurs → Apps & Credentials' }, { status: 401 })
    }
    const { access_token } = await tokenRes.json()
    const headers = { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' }

    // Récupérer les transactions (12 derniers mois)
    const endDate = new Date().toISOString().replace(/\.\d{3}Z$/, '-0000')
    const startDate = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, '-0000')

    const txRes = await fetch(
      `${PAYPAL_BASE}/v1/reporting/transactions?start_date=${startDate}&end_date=${endDate}&fields=all&page_size=500`,
      { headers }
    )

    let allTx: any[] = []
    if (txRes.ok) {
      const txData = await txRes.json()
      allTx = txData.transaction_details || []
    }

    const transactions = allTx
      .filter((t: any) => t.transaction_info?.transaction_status === 'S')
      .map((t: any) => {
        const info = t.transaction_info || {}
        const amountObj = info.transaction_amount || {}
        const amount = Math.max(0, Number(amountObj.value) || 0)
        const currency = (amountObj.currency_code || 'USD').toUpperCase()
        return {
          type: 'income' as const,
          amount,
          currency: (currency === 'XOF' ? 'XOF' : currency === 'EUR' ? 'EUR' : 'USD') as 'XOF' | 'USD' | 'EUR',
          category: 'freelance' as const,
          description: `PayPal – ${info.transaction_subject || info.transaction_note || 'Paiement #' + (info.transaction_id || '').slice(-6)}`,
          date: (info.transaction_initiation_date || new Date().toISOString()).split('T')[0],
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
