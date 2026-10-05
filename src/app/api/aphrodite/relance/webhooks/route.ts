import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Webhook from Chariow for abandoned carts and failed payments
// Extracts customer info and schedules relance emails

interface ChariowPayload {
  event: string
  type: string
  action: string
  sale?: any
  customer?: any
  checkout?: any
  error?: string
}

function ok(data: object = {}) {
  return NextResponse.json({ received: true, ...data }, { status: 200 })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function extractCustomerInfo(payload: ChariowPayload) {
  const customer = payload.customer || payload.sale?.customer || payload.checkout?.customer || {}
  const sale = payload.sale || {}

  return {
    chariow_id: customer.id || sale.id || null,
    first_name: String(customer.first_name || customer.firstname || customer.name || '').split(/\s+/)[0].trim(),
    email: customer.email || sale.email || null,
    phone: customer.phone || sale.phone || null,
    country: customer.country || customer.address?.country || null,
  }
}

async function scheduleRelanceEmails(
  supabase: any,
  customerId: string,
  emailAddress: string | null
) {
  if (!emailAddress) return

  // Schedule A1-mail at +30 minutes
  const a1ScheduledAt = new Date(Date.now() + 30 * 60000).toISOString()

  // Schedule A2-mail at +4 hours
  const a2ScheduledAt = new Date(Date.now() + 4 * 60 * 60000).toISOString()

  // Schedule A3-mail at +24 hours
  const a3ScheduledAt = new Date(Date.now() + 24 * 60 * 60000).toISOString()

  const emails = [
    { message_type: 'A1-mail', scheduled_at: a1ScheduledAt },
    { message_type: 'A2-mail', scheduled_at: a2ScheduledAt },
    { message_type: 'A3-mail', scheduled_at: a3ScheduledAt },
  ]

  const { error } = await supabase.from('aphrodite_relance_emails').insert(
    emails.map(e => ({
      customer_id: customerId,
      ...e,
      channel: 'email',
    }))
  )

  if (error) {
    console.error('[Relance Webhook] Schedule error:', error)
  } else {
    console.log(`[Relance Webhook] Scheduled 3 emails for customer ${customerId}`)
  }
}

async function schedulePostPurchaseEmails(
  supabase: any,
  customerId: string,
  emailAddress: string | null
) {
  if (!emailAddress) return

  const emails = [
    { message_type: 'B1-mail', scheduled_at: new Date().toISOString(), delay: 0 }, // Immediately
    { message_type: 'B3-mail', scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60000).toISOString(), delay: 3 }, // +3 days
  ]

  const { error } = await supabase.from('aphrodite_relance_emails').insert(
    emails.map(e => ({
      customer_id: customerId,
      message_type: e.message_type,
      scheduled_at: e.scheduled_at,
      channel: 'email',
    }))
  )

  if (error) {
    console.error('[Relance Webhook] Post-purchase schedule error:', error)
  } else {
    console.log(`[Relance Webhook] Scheduled post-purchase emails for customer ${customerId}`)
  }
}

export async function POST(req: NextRequest) {
  let payload: ChariowPayload = {}

  try {
    const text = await req.text()
    if (text) payload = JSON.parse(text)
  } catch {
    return ok({ note: 'invalid_payload' })
  }

  const eventName = (payload.event || payload.type || payload.action || '').toLowerCase()
  console.log(`[Relance Webhook] Event: ${eventName}`)

  const supabase = getSupabase()

  // ABANDONED CART / FAILED PAYMENT
  if (
    eventName.includes('abandoned') ||
    eventName.includes('failed') ||
    eventName.includes('timeout') ||
    eventName.includes('error')
  ) {
    const customerInfo = extractCustomerInfo(payload)

    if (!customerInfo.email) {
      console.log('[Relance Webhook] No email for abandoned cart')
      return ok({ status: 'no_email' })
    }

    console.log(
      `[Relance Webhook] Abandoned cart detected: ${customerInfo.first_name} <${customerInfo.email}>`
    )

    // Create or update customer record
    const { data: existingCustomer } = await supabase
      .from('aphrodite_customers')
      .select('id')
      .eq('email', customerInfo.email)
      .single()

    let customerId: string

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Update status to abandoned
      await supabase
        .from('aphrodite_customers')
        .update({
          status: 'abandoned_cart',
          abandoned_at: new Date().toISOString(),
          ...customerInfo,
        })
        .eq('id', customerId)
    } else {
      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from('aphrodite_customers')
        .insert({
          status: 'abandoned_cart',
          abandoned_at: new Date().toISOString(),
          ...customerInfo,
        })
        .select('id')
        .single()

      if (error) {
        console.error('[Relance Webhook] Insert error:', error)
        return ok({ error: 'create_failed' })
      }

      customerId = newCustomer.id
    }

    // Schedule relance emails
    await scheduleRelanceEmails(supabase, customerId, customerInfo.email)

    return ok({ status: 'abandoned_cart_scheduled' })
  }

  // SUCCESSFUL PURCHASE
  if (
    eventName.includes('success') ||
    eventName.includes('completed') ||
    eventName.includes('paid')
  ) {
    const customerInfo = extractCustomerInfo(payload)

    if (!customerInfo.email) {
      console.log('[Relance Webhook] No email for successful purchase')
      return ok({ status: 'no_email' })
    }

    console.log(
      `[Relance Webhook] Purchase completed: ${customerInfo.first_name} <${customerInfo.email}>`
    )

    // Create or update customer record
    const { data: existingCustomer } = await supabase
      .from('aphrodite_customers')
      .select('id')
      .eq('email', customerInfo.email)
      .single()

    let customerId: string

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Update status to completed
      await supabase
        .from('aphrodite_customers')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          ...customerInfo,
        })
        .eq('id', customerId)

      // Clear any pending abandoned cart emails
      await supabase
        .from('aphrodite_relance_emails')
        .delete()
        .eq('customer_id', customerId)
        .is('sent_at', null)
    } else {
      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from('aphrodite_customers')
        .insert({
          status: 'completed',
          completed_at: new Date().toISOString(),
          ...customerInfo,
        })
        .select('id')
        .single()

      if (error) {
        console.error('[Relance Webhook] Insert error:', error)
        return ok({ error: 'create_failed' })
      }

      customerId = newCustomer.id
    }

    // Schedule post-purchase emails (B1, B3, B4)
    await schedulePostPurchaseEmails(supabase, customerId, customerInfo.email)

    return ok({ status: 'purchase_scheduled' })
  }

  return ok({ status: 'unknown_event' })
}

export async function GET() {
  return ok({ status: 'webhook_active' })
}

export async function OPTIONS() {
  return ok({ status: 'ok' })
}
