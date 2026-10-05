import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  buildTemplateA1,
  buildTemplateA2,
  buildTemplateA3,
  buildTemplateB1,
  buildTemplateB3,
  sendChariowEmail,
} from '@/lib/chariow-email'

// Cron job to send scheduled relance emails
// Call this every 5 minutes from a scheduled trigger (e.g., Vercel Cron)
// GET /api/aphrodite/relance/send?secret=YOUR_SECRET

const CHECKOUT_URL = 'https://aphroditelove.mychariow.market/thesxbibleforcouple/checkout'
const DL_BIBLE = 'https://drive.google.com/file/d/1RoeWUFst_L5KWGCgv5Uamu3NSU6F2q3M/view?usp=drivesdk'
const DL_BONUS = 'https://drive.google.com/file/d/1CYv3D9AjUo9f3DWxl0bZ8gppizdxH6HZ/view?usp=drivesdk'
const PACK_17 = process.env.CHARIOW_PACK_17_URL || 'https://aphroditelove.mychariow.market/pack500'
const VIDEO_8 = process.env.CHARIOW_VIDEO_8_URL || 'https://aphroditelove.mychariow.market/video8'
const EBOOK_5 = process.env.CHARIOW_EBOOK_5_URL || 'https://aphroditelove.mychariow.market/ebook5'

export const maxDuration = 60

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getPendingEmails(supabase: any) {
  const now = new Date().toISOString()

  // Emails with scheduled_at <= now and not yet sent
  const { data, error } = await supabase
    .from('aphrodite_relance_emails')
    .select(
      `
      id,
      customer_id,
      message_type,
      channel,
      scheduled_at,
      aphrodite_customers(id, first_name, email, phone)
      `
    )
    .is('sent_at', null)
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(50)

  if (error) {
    console.error('[Relance] Query error:', error)
    return []
  }

  return data || []
}

async function markEmailSent(supabase: any, emailId: string, brevoId: string, error?: string) {
  const { error: err } = await supabase
    .from('aphrodite_relance_emails')
    .update({
      sent_at: new Date().toISOString(),
      brevo_message_id: brevoId || null,
      error: error || null,
    })
    .eq('id', emailId)

  if (err) {
    console.error('[Relance] Update error:', err)
  }
}

function buildEmailContent(
  messageType: string,
  firstName: string
): { subject: string; html: string } | null {
  switch (messageType) {
    case 'A1-mail':
      return {
        subject: `Your order is waiting, ${firstName}`,
        html: buildTemplateA1(firstName, CHECKOUT_URL),
      }
    case 'A2-mail':
      return {
        subject: 'What nobody ever taught you',
        html: buildTemplateA2(firstName, CHECKOUT_URL),
      }
    case 'A3-mail':
      return {
        subject: `Last hours at $8, ${firstName}`,
        html: buildTemplateA3(firstName, CHECKOUT_URL),
      }
    case 'B1-mail':
      return {
        subject: `Your eBooks are here, ${firstName} 🎉`,
        html: buildTemplateB1(firstName, DL_BIBLE, DL_BONUS),
      }
    case 'B3-mail':
      return {
        subject: "Don't just read it — watch it",
        html: buildTemplateB3(firstName, VIDEO_8),
      }
    default:
      return null
  }
}

async function sendEmailForCustomer(supabase: any, record: any) {
  const customer = record.aphrodite_customers
  if (!customer || !customer.email) {
    console.warn(`[Relance] Customer missing email for record ${record.id}`)
    await markEmailSent(supabase, record.id, '', 'No email address')
    return
  }

  const emailContent = buildEmailContent(record.message_type, customer.first_name)
  if (!emailContent) {
    console.warn(`[Relance] Unknown message type: ${record.message_type}`)
    await markEmailSent(supabase, record.id, '', 'Unknown template')
    return
  }

  console.log(`[Relance] Sending ${record.message_type} to ${customer.email}`)

  const result = await sendChariowEmail({
    to: customer.email,
    subject: emailContent.subject,
    html: emailContent.html,
    fromName: 'APHRODITE',
    fromEmail: 'noreply@aphroditelove.com',
  })

  if (result.error) {
    console.error(`[Relance] Send error for ${customer.email}:`, result.error)
    await markEmailSent(supabase, record.id, '', result.error)
  } else {
    console.log(`[Relance] Sent successfully to ${customer.email}`)
    await markEmailSent(supabase, record.id, result.messageId)
  }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const expectedSecret = process.env.RELANCE_CRON_SECRET

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  try {
    const pending = await getPendingEmails(supabase)

    if (pending.length === 0) {
      return NextResponse.json({ sent: 0, queued: 0 })
    }

    console.log(`[Relance] Found ${pending.length} pending emails`)

    let sent = 0
    for (const record of pending) {
      if (record.channel === 'email') {
        await sendEmailForCustomer(supabase, record)
        sent++
      }
    }

    return NextResponse.json({ sent, queued: pending.length })
  } catch (error: any) {
    console.error('[Relance] Cron error:', error?.message)
    return NextResponse.json(
      { error: error?.message || 'Processing failed' },
      { status: 500 }
    )
  }
}
