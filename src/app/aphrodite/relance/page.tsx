'use client'

import { useEffect, useState } from 'react'

interface Customer {
  id: string
  first_name: string
  email: string
  phone: string
  country: string
  status: string
  abandoned_at: string
  completed_at: string
  relance_emails: Array<{
    id: string
    message_type: string
    channel: string
    sent_at: string | null
    scheduled_at: string
  }>
}

const MESSAGES = {
  abandoned_A1: `Hi {first_name} 👋 It's Grace from APHRODITE.

I saw you started your order for The Sex Bible but the payment didn't go through.

Did you have a problem with the payment? I can help you right now 🙏

Here's your link again (still $8 instead of $25):
https://aphroditelove.mychariow.market/thesxbibleforcouple/checkout`,

  abandoned_A2: `{first_name}, quick question 😏

When was the last time your nights felt really exciting?

Most couples never learn how desire actually works — so the spark fades and nobody talks about it.

The Sex Bible changes that: seduction, foreplay, pleasure, 258 pages + 365 positions bonus.

Your copy is still reserved 👇
https://aphroditelove.mychariow.market/thesxbibleforcouple/checkout`,

  abandoned_A3: `⏳ {first_name}, the $8 launch price for The Sex Bible ends very soon.

After that it goes back to $25.

258-page eBook + 365 Positions bonus, instant download, 100% private.

Last chance at $8 👇
https://aphroditelove.mychariow.market/thesxbibleforcouple/checkout`,

  abandoned_A4: `Last message from me, {first_name} 🙏

I'm closing your reservation for The Sex Bible today.

If you still want it at $8, here's the link:
https://aphroditelove.mychariow.market/thesxbibleforcouple/checkout

Otherwise, no worries — I won't bother you again ❤️`,

  completed_B2: `{first_name}, did you start reading? 😏

Little tip for tonight: Part 1 (Seduction) — build the tension all day before you even touch.

And if you want to go further, I have something private for our readers:
🎬 500 adult videos + private Telegram groups + 70 free adult sites
Only $17 — for readers only 👇
{pack_17_link}`,

  completed_B4: `{first_name}, do you know where the G-spot really is? And his P-spot? 🤫

Most couples never find them — and miss the most intense orgasms of their life.

📘 G-Spot & P-Spot: The Complete Guide
Only $5 👇
{ebook_5_link}`,

  completed_B5: `Hi {first_name} ❤️ One week with The Sex Bible!

Can I ask you a small favor? In one or two sentences, what did you like most (or what changed for you)?

Your answer stays anonymous — only your first name and country, if you agree 🙏`,
}

function whatsappLink(phone: string, message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

export default function RelancePage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [status, setStatus] = useState('abandoned_cart')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)

  const authToken = process.env.NEXT_PUBLIC_DASHBOARD_AUTH_TOKEN

  useEffect(() => {
    if (!authToken) {
      setError('DASHBOARD_AUTH_TOKEN not configured')
      setLoading(false)
      return
    }

    fetchCustomers()
  }, [status, authToken])

  async function fetchCustomers() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/aphrodite/dashboard/customers?status=${status}&limit=100`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      setCustomers(data.customers || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  function getMessageOptions(customer: Customer): { key: string; label: string; message: string }[] {
    if (customer.status === 'abandoned_cart') {
      return [
        {
          key: 'A1',
          label: 'A1 · Help (+30 min)',
          message: MESSAGES.abandoned_A1,
        },
        {
          key: 'A2',
          label: 'A2 · Desire (+4h)',
          message: MESSAGES.abandoned_A2,
        },
        {
          key: 'A3',
          label: 'A3 · Urgency (+24h)',
          message: MESSAGES.abandoned_A3,
        },
        {
          key: 'A4',
          label: 'A4 · Last message (+60h)',
          message: MESSAGES.abandoned_A4,
        },
      ]
    } else if (customer.status === 'completed') {
      return [
        {
          key: 'B2',
          label: 'B2 · Pack 500 videos',
          message: MESSAGES.completed_B2,
        },
        {
          key: 'B4',
          label: 'B4 · G-Spot Guide',
          message: MESSAGES.completed_B4,
        },
        {
          key: 'B5',
          label: 'B5 · Ask for review',
          message: MESSAGES.completed_B5,
        },
      ]
    }
    return []
  }

  const messageOptions = customers.length > 0 ? getMessageOptions(customers[0]) : []

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">APHRODITE Relance</h1>
        <p className="text-gray-400 mb-8">WhatsApp & Email automation dashboard</p>

        {/* Status Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          {['abandoned_cart', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 font-medium transition ${
                status === s
                  ? 'border-b-2 border-red-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s === 'abandoned_cart' ? 'Panier abandonné' : 'Achetés (offres)'}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-300">
            💬 <strong>WhatsApp:</strong> Cliquez sur un client pour ouvrir WhatsApp avec un message pré-rempli.
            <br />
            Vous pouvez modifier le message et l'envoyer manuellement (WhatsApp API interdit l'envoi auto pour produits adultes).
          </p>
        </div>

        {/* Message Selector */}
        {messageOptions.length > 0 && (
          <div className="mb-8 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm font-medium mb-3">Message template:</p>
            <div className="flex gap-2 flex-wrap">
              {messageOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedMessage(opt.key)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    selectedMessage === opt.key
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Customers Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun client dans cette catégorie</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3">Prénom</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Tél</th>
                  <th className="text-left p-3">Pays</th>
                  <th className="text-left p-3">Depuis</th>
                  <th className="text-left p-3">Emails</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => {
                  const selectedOpt = messageOptions.find(m => m.key === selectedMessage)
                  const message = selectedOpt
                    ? selectedOpt.message
                        .replace('{first_name}', customer.first_name)
                        .replace('{pack_17_link}', process.env.NEXT_PUBLIC_CHARIOW_PACK_17_URL || '')
                        .replace('{ebook_5_link}', process.env.NEXT_PUBLIC_CHARIOW_EBOOK_5_URL || '')
                    : ''

                  const whatsappUrl = customer.phone ? whatsappLink(customer.phone, message) : null

                  return (
                    <tr key={customer.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-3">{customer.first_name}</td>
                      <td className="p-3 text-xs text-gray-400">{customer.email}</td>
                      <td className="p-3 text-xs">{customer.phone || '—'}</td>
                      <td className="p-3">{customer.country || '—'}</td>
                      <td className="p-3 text-xs text-gray-400">
                        {customer.abandoned_at
                          ? new Date(customer.abandoned_at).toLocaleDateString('fr-FR')
                          : new Date(customer.completed_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3 text-xs">
                        {customer.relance_emails.filter(e => e.sent_at).length}/{customer.relance_emails.length}
                      </td>
                      <td className="p-3">
                        {whatsappUrl && selectedMessage ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs inline-flex items-center gap-1"
                          >
                            💬 WhatsApp
                          </a>
                        ) : (
                          <span className="text-gray-600 text-xs">No WhatsApp</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
