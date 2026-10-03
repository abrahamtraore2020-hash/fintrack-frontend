import { NextRequest, NextResponse } from 'next/server'

// Vrais acheteurs récents de The Sex Bible, lus depuis l'API Chariow, pour les
// notifications d'achat de /the-sex-bible.html. Seuls le prénom, le pays et la
// date sortent de cette route — jamais l'email, le nom complet ou le téléphone.
//
// Configuration (Vercel → Settings → Environment Variables) :
//   CHARIOW_API_KEY        clé API Chariow (Chariow → Développeurs → API)
//   CHARIOW_PRODUCT_MATCH  optionnel, texte à chercher dans le nom du produit
//                          (par défaut : "sex bible")

export const dynamic = 'force-dynamic'

const CHARIOW_BASE = 'https://api.chariow.com/v1'
const CACHE_MS = 2 * 60 * 1000
const MAX_BUYERS = 20

const COUNTRY_CODES: Record<string, string> = {
  NG: 'Nigeria', GH: 'Ghana', ZM: 'Zambia', KE: 'Kenya', ZA: 'South Africa', UG: 'Uganda',
  TZ: 'Tanzania', RW: 'Rwanda', MW: 'Malawi', ZW: 'Zimbabwe', BW: 'Botswana', NA: 'Namibia',
  LR: 'Liberia', SL: 'Sierra Leone', GM: 'Gambia', CM: 'Cameroon', CI: "Côte d'Ivoire",
  SN: 'Senegal', BJ: 'Benin', TG: 'Togo', BF: 'Burkina Faso', ML: 'Mali', NE: 'Niger',
  GN: 'Guinea', GA: 'Gabon', CG: 'Congo', CD: 'DR Congo', ET: 'Ethiopia',
  US: 'USA', GB: 'United Kingdom', CA: 'Canada', FR: 'France',
}

const DIAL_CODES: Record<string, string> = {
  '234': 'Nigeria', '233': 'Ghana', '260': 'Zambia', '254': 'Kenya', '256': 'Uganda',
  '255': 'Tanzania', '250': 'Rwanda', '265': 'Malawi', '263': 'Zimbabwe', '267': 'Botswana',
  '264': 'Namibia', '231': 'Liberia', '232': 'Sierra Leone', '220': 'Gambia', '237': 'Cameroon',
  '225': "Côte d'Ivoire", '221': 'Senegal', '229': 'Benin', '228': 'Togo', '226': 'Burkina Faso',
  '223': 'Mali', '227': 'Niger', '224': 'Guinea', '241': 'Gabon', '242': 'Congo', '243': 'DR Congo',
  '251': 'Ethiopia', '27': 'South Africa',
}

type Buyer = { name: string; place: string; date: string }

let cache: { at: number; buyers: Buyer[] } | null = null

function countryName(value: any): string {
  if (!value) return ''
  if (typeof value === 'object') return countryName(value.name || value.code || value.iso || value.country)
  const v = String(value).trim()
  if (/^[A-Za-z]{2}$/.test(v)) return COUNTRY_CODES[v.toUpperCase()] || ''
  return v.length <= 40 ? v : ''
}

function countryFromPhone(phone: any): string {
  const raw = typeof phone === 'object' && phone ? (phone.country_code || phone.dial_code || phone.number) : phone
  const digits = String(raw || '').replace(/\D/g, '')
  for (const len of [3, 2]) {
    const name = DIAL_CODES[digits.slice(0, len)]
    if (name) return name
  }
  return ''
}

function firstName(customer: any): string {
  const raw = String(customer?.first_name || customer?.firstname || customer?.name || '').trim().split(/\s+/)[0] || ''
  const clean = raw.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, '').slice(0, 20)
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() : ''
}

function toBuyer(sale: any, productMatch: RegExp): Buyer | null {
  const productName = String(sale?.product?.name || sale?.product_name || sale?.items?.[0]?.product?.name || '')
  if (productName && !productMatch.test(productName)) return null

  const customer = sale?.customer || sale?.buyer || {}
  const name = firstName(customer)
  if (!name) return null

  const place =
    countryName(customer.country) ||
    countryName(sale?.shipping?.country) ||
    countryName(sale?.billing?.country) ||
    countryName(customer.address?.country) ||
    countryName(sale?.country) ||
    countryFromPhone(customer.phone) ||
    countryFromPhone(sale?.phone)

  const date = sale?.completed_at || sale?.paid_at || sale?.created_at
  if (!date || isNaN(new Date(date).getTime())) return null

  return { name, place: place || 'Africa', date: new Date(date).toISOString() }
}

async function fetchSales(apiKey: string): Promise<{ status: number; sales: any[] }> {
  const res = await fetch(`${CHARIOW_BASE}/sales?per_page=50&status=completed`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) return { status: res.status, sales: [] }
  const json = await res.json()
  const list = json?.data?.data || json?.data || json?.sales || []
  return { status: res.status, sales: Array.isArray(list) ? list : [] }
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.CHARIOW_API_KEY
  const productMatch = new RegExp(process.env.CHARIOW_PRODUCT_MATCH || 'sex\\s*bible|sxbible', 'i')

  // ?debug=1 : montre la structure des ventes (noms des champs uniquement, aucune donnée client)
  if (req.nextUrl.searchParams.get('debug')) {
    if (!apiKey) return NextResponse.json({ configured: false })
    try {
      const { status, sales } = await fetchSales(apiKey)
      const s = sales[0] || {}
      return NextResponse.json({
        configured: true,
        status,
        count: sales.length,
        saleKeys: Object.keys(s),
        customerKeys: Object.keys(s.customer || {}),
        productName: s.product?.name ?? null,
        buyers: sales.map(sale => toBuyer(sale, productMatch)).filter(Boolean).length,
      })
    } catch (e: any) {
      return NextResponse.json({ configured: true, error: e?.message || 'fetch failed' })
    }
  }

  if (!apiKey) return NextResponse.json({ buyers: [] })

  if (!cache || Date.now() - cache.at > CACHE_MS) {
    try {
      const { sales } = await fetchSales(apiKey)
      const buyers = sales
        .map(sale => toBuyer(sale, productMatch))
        .filter((b): b is Buyer => b !== null)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, MAX_BUYERS)
      cache = { at: Date.now(), buyers }
    } catch {
      if (!cache) return NextResponse.json({ buyers: [] })
    }
  }

  return NextResponse.json(
    { buyers: cache ? cache.buyers : [] },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } },
  )
}
