'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [initSecret, setInitSecret] = useState('')
  const [cronSecret, setCronSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function initDatabase() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/aphrodite/relance/init', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${initSecret}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()
      setResult({ success: res.ok, data })
    } catch (error: any) {
      setResult({ success: false, error: error?.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">APHRODITE Setup</h1>
        <p className="text-gray-400 mb-8">Configure the relance automation system</p>

        {/* Prerequisites */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">📋 Prerequisites</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-red-500 font-bold">1.</span>
              <div>
                <strong>Brevo Account</strong>
                <p className="text-gray-400">
                  Create a free account at <a href="https://brevo.com" className="text-blue-400">brevo.com</a> (300 free emails/day)
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 font-bold">2.</span>
              <div>
                <strong>Environment Variables</strong>
                <p className="text-gray-400">In Vercel Settings, add:</p>
                <code className="block bg-gray-900 p-2 mt-2 rounded text-xs">
                  BREVO_API_KEY=your_brevo_key
                  <br />
                  CHARIOW_API_KEY=your_chariow_key
                  <br />
                  RELANCE_INIT_SECRET=dev-secret
                  <br />
                  RELANCE_CRON_SECRET=cron-secret-token
                  <br />
                  DASHBOARD_AUTH_TOKEN=dashboard-secret
                </code>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 font-bold">3.</span>
              <div>
                <strong>Supabase Database</strong>
                <p className="text-gray-400">
                  Already connected via NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 font-bold">4.</span>
              <div>
                <strong>Chariow Webhook</strong>
                <p className="text-gray-400">
                  In Chariow → Développeurs → Webhooks, add a new webhook:
                  <br />
                  <code className="block bg-gray-900 p-2 mt-2 rounded text-xs">
                    https://yourdomain.com/api/aphrodite/relance/webhooks
                  </code>
                  <p className="text-xs text-gray-500 mt-2">
                    (Events: sale.abandoned, sale.failed, payment.failed, sale.completed, etc.)
                  </p>
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Initialize Database */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🗄️ Initialize Database Tables</h2>
          <p className="text-gray-400 text-sm mb-4">
            This creates the necessary tables in Supabase for tracking customers, relance emails, and purchases.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Init Secret (from env)</label>
              <input
                type="password"
                value={initSecret}
                onChange={e => setInitSecret(e.target.value)}
                placeholder="dev-secret"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
              />
            </div>

            <button
              onClick={initDatabase}
              disabled={loading || !initSecret}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded font-medium"
            >
              {loading ? 'Initializing...' : 'Initialize Tables'}
            </button>

            {result && (
              <div className={`p-4 rounded ${result.success ? 'bg-green-900/30 text-green-200' : 'bg-red-900/30 text-red-200'}`}>
                <p className="text-sm">
                  {result.success ? '✓ Success' : '✗ Error'}
                </p>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Cron Setup */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">⏱️ Cron Job Setup</h2>
          <p className="text-gray-400 text-sm mb-4">
            Schedule the email sender to run every 5 minutes.
          </p>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Option A: Vercel Crons</strong>
              <br />
              <code className="block bg-gray-900 p-2 mt-2 rounded text-xs">
                In vercel.json: &quot;crons&quot;: [{'{'}
                <br />
                &nbsp;&nbsp;&quot;path&quot;: &quot;/api/aphrodite/relance/send&quot;,
                <br />
                &nbsp;&nbsp;&quot;schedule&quot;: &quot;*/5 * * * *&quot;
                <br />
                {'}'}]
              </code>
            </p>
            <p>
              <strong>Option B: External Cron Service</strong>
              <br />
              <code className="block bg-gray-900 p-2 mt-2 rounded text-xs">
                https://yourdomain.com/api/aphrodite/relance/send?secret=YOUR_CRON_SECRET
              </code>
              <p className="text-gray-500 mt-2">Call this URL every 5 minutes with a service like cron-job.org</p>
            </p>
          </div>
        </div>

        {/* Dashboard Access */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">📊 Dashboard Access</h2>
          <p className="text-gray-400 text-sm">
            Once set up, access the relance dashboard at:
          </p>
          <code className="block bg-gray-900 p-3 mt-3 rounded text-sm text-blue-300">
            /aphrodite/relance
          </code>
          <p className="text-gray-400 text-sm mt-3">
            You'll need the DASHBOARD_AUTH_TOKEN in your .env to access it.
          </p>
        </div>

        {/* Webhooks */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🔗 Webhook Endpoints</h2>
          <div className="space-y-3 text-sm font-mono">
            <div>
              <p className="text-gray-400 mb-1">Chariow Webhook (abandoned & purchases):</p>
              <code className="block bg-gray-900 p-2 rounded text-xs">
                POST /api/aphrodite/relance/webhooks
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Send Scheduled Emails (cron):</p>
              <code className="block bg-gray-900 p-2 rounded text-xs">
                GET /api/aphrodite/relance/send?secret=RELANCE_CRON_SECRET
              </code>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Get Customers (dashboard):</p>
              <code className="block bg-gray-900 p-2 rounded text-xs">
                GET /api/aphrodite/dashboard/customers?status=abandoned_cart
              </code>
            </div>
          </div>
        </div>

        {/* Workflow */}
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🔄 How It Works</h2>
          <ol className="space-y-3 text-sm">
            <li>
              <strong>1. Customer abandons checkout</strong> → Chariow sends webhook event
            </li>
            <li>
              <strong>2. Webhook handler</strong> → Creates customer record, schedules 3 email reminders (A1, A2, A3)
            </li>
            <li>
              <strong>3. Cron job runs every 5 min</strong> → Finds scheduled emails with scheduled_at ≤ now, sends via Brevo
            </li>
            <li>
              <strong>4. WhatsApp (manual)</strong> → Dashboard shows customers pending WhatsApp contact, one-click open WhatsApp with pre-filled message
            </li>
            <li>
              <strong>5. Post-purchase (B workflow)</strong> → When customer pays, schedules B1 (welcome), B3 (video offer), B4 (ebook offer), B5 (review request)
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
