// Brevo email service for APHRODITE relance system
// Uses Brevo API (formerly Sendinblue) for email delivery

interface BrevoEmailParams {
  to: string
  subject: string
  html: string
  fromName?: string
  fromEmail?: string
  replyTo?: string
}

interface BrevoResponse {
  messageId: string
  error?: string
}

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_BASE = 'https://api.brevo.com/v3'
const DEFAULT_FROM_EMAIL = 'noreply@aphroditelove.com'
const DEFAULT_FROM_NAME = 'APHRODITE'

export async function sendBrevoEmail(params: BrevoEmailParams): Promise<BrevoResponse> {
  if (!BREVO_API_KEY) {
    console.error('[Brevo] API key not configured')
    return { messageId: '', error: 'BREVO_API_KEY not configured' }
  }

  const payload = {
    sender: {
      email: params.fromEmail || DEFAULT_FROM_EMAIL,
      name: params.fromName || DEFAULT_FROM_NAME,
    },
    to: [{ email: params.to }],
    subject: params.subject,
    htmlContent: params.html,
    replyTo: params.replyTo ? { email: params.replyTo } : undefined,
    tags: ['aphrodite-relance'],
  }

  try {
    const response = await fetch(`${BREVO_BASE}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const json = await response.json()

    if (!response.ok) {
      console.error('[Brevo] Error:', json)
      return {
        messageId: '',
        error: json?.message || `HTTP ${response.status}`,
      }
    }

    return {
      messageId: json?.id || json?.messageId || '',
    }
  } catch (error: any) {
    console.error('[Brevo] Exception:', error?.message)
    return {
      messageId: '',
      error: error?.message || 'Network error',
    }
  }
}

// Template builders for A/B/C workflows

export function buildTemplateA1(firstName: string, checkoutUrl: string): string {
  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(180deg, #3a0a14 0%, #14040a 55%, #050303 100%); padding: 30px; border-radius: 8px; color: #fff; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; letter-spacing: 4px; font-size: 28px; font-weight: 600;">APHRODITE</h1>
        </div>

        <p>Hi ${firstName} 👋</p>
        <p>It's Grace from APHRODITE.</p>

        <p>I saw you started your order for <strong>The Sex Bible</strong> but the payment didn't go through.</p>

        <p><strong>Did you have a problem with the payment?</strong> I can help you right now 🙏</p>

        <p>Here's your link again (still <strong style="color: #e0324a;">$8</strong> instead of <strong style="text-decoration: line-through;">$25</strong>):</p>

        <p style="text-align: center;">
          <a href="${checkoutUrl}" style="display: inline-block; background: linear-gradient(160deg, #e0324a, #8e0f22); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 700; letter-spacing: 1px;">COMPLETE YOUR ORDER</a>
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="font-size: 12px; color: #666;">
          APHRODITE · Digital eBooks<br>
          <a href="https://fintrack-frontend-ebon.vercel.app/the-sex-bible.html" style="color: #e0324a; text-decoration: none;">Learn more</a>
        </p>
      </body>
    </html>
  `
}

export function buildTemplateA2(firstName: string, checkoutUrl: string): string {
  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(180deg, #3a0a14 0%, #14040a 55%, #050303 100%); padding: 30px; border-radius: 8px; color: #fff; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; letter-spacing: 4px; font-size: 28px; font-weight: 600;">APHRODITE</h1>
        </div>

        <h2 style="font-size: 20px; margin: 20px 0;">What nobody ever taught us</h2>

        <p>Not in school. Not at home. Not even in our relationships.</p>
        <p>Nobody teaches us how desire really works.</p>

        <p>That's why we created <strong>The Sex Bible</strong>:</p>
        <ul style="line-height: 2;">
          <li><strong>Seduction</strong> — desire starts long before the bedroom</li>
          <li><strong>Foreplay</strong> — the touch that changes everything</li>
          <li><strong>Pleasure</strong> — understand it, his and hers</li>
          <li><strong>Positions & techniques</strong> to break the routine for good</li>
        </ul>

        <p>+ <strong>FREE:</strong> the 365 Sex Positions eBook — a new idea for every night.</p>

        <p style="background: #f8f8f8; padding: 15px; border-left: 4px solid #e0324a; border-radius: 4px;">
          Still <strong style="color: #e0324a;">$8</strong> instead of <strong style="text-decoration: line-through;">$25</strong>, but the launch price ends soon.
        </p>

        <p style="text-align: center;">
          <a href="${checkoutUrl}" style="display: inline-block; background: linear-gradient(160deg, #e0324a, #8e0f22); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 700; letter-spacing: 1px;">GET YOUR COPY</a>
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="font-size: 12px; color: #666;">
          APHRODITE
        </p>
      </body>
    </html>
  `
}

export function buildTemplateA3(firstName: string, checkoutUrl: string): string {
  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(180deg, #3a0a14 0%, #14040a 55%, #050303 100%); padding: 30px; border-radius: 8px; color: #fff; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; letter-spacing: 4px; font-size: 28px; font-weight: 600;">APHRODITE</h1>
        </div>

        <h2 style="font-size: 22px; margin: 20px 0; color: #e0324a;">⏳ Last hours at $8, ${firstName}</h2>

        <p>This is your last reminder: the launch price of <strong>The Sex Bible</strong> ends in a few hours.</p>

        <p style="font-size: 18px; text-align: center; margin: 20px 0;">
          <strong style="text-decoration: line-through; color: #999;">$25</strong> → <strong style="color: #e0324a; font-size: 32px;">$8</strong> today only
        </p>

        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 5px 0; color: #333;">✓ 258-page eBook + FREE 365 Positions eBook</p>
          <p style="margin: 5px 0; color: #333;">✓ Instant download, read it tonight on your phone</p>
          <p style="margin: 5px 0; color: #333;">✓ 100% private — no package, no delivery</p>
        </div>

        <p style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
          After that, the price goes back to <strong>$25</strong>.
        </p>

        <p style="text-align: center;">
          <a href="${checkoutUrl}" style="display: inline-block; background: linear-gradient(160deg, #e0324a, #8e0f22); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 700; letter-spacing: 1px;">CLAIM YOUR COPY NOW</a>
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="font-size: 12px; color: #666;">
          APHRODITE
        </p>
      </body>
    </html>
  `
}

export function buildTemplateB1(
  firstName: string,
  dlBibleUrl: string,
  dlBonusUrl: string
): string {
  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(180deg, #3a0a14 0%, #14040a 55%, #050303 100%); padding: 30px; border-radius: 8px; color: #fff; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; letter-spacing: 4px; font-size: 28px; font-weight: 600;">APHRODITE</h1>
        </div>

        <h2 style="font-size: 24px; margin: 20px 0;">Your eBooks are here 🎉</h2>

        <p>Hi ${firstName},</p>

        <p>Thank you for your order — welcome to <strong>The Sex Bible!</strong></p>

        <p><strong>Download your two eBooks here:</strong></p>

        <p style="background: #f0f0f0; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0;">
          <strong style="font-size: 16px;">📕 The Sex Bible (258 pages):</strong><br>
          <a href="${dlBibleUrl}" style="color: #e0324a; text-decoration: none; word-break: break-all; font-size: 12px;">Open in Google Drive</a>
        </p>

        <p style="background: #f0f0f0; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0;">
          <strong style="font-size: 16px;">🎁 BONUS — 365 Sex Positions:</strong><br>
          <a href="${dlBonusUrl}" style="color: #e0324a; text-decoration: none; word-break: break-all; font-size: 12px;">Open in Google Drive</a>
        </p>

        <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
          <strong>Tip:</strong> Download them on your phone now so you can read anytime, privately.
        </p>

        <p>Start tonight with <strong>Part 1 — Seduction</strong>. Desire starts long before the bedroom 😉</p>

        <p style="margin-top: 30px; font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
          Enjoy,<br>
          <strong>APHRODITE</strong>
        </p>
      </body>
    </html>
  `
}

export function buildTemplateB3(firstName: string, videoCheckoutUrl: string): string {
  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(180deg, #3a0a14 0%, #14040a 55%, #050303 100%); padding: 30px; border-radius: 8px; color: #fff; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; letter-spacing: 4px; font-size: 28px; font-weight: 600;">APHRODITE</h1>
        </div>

        <h2 style="font-size: 20px; margin: 20px 0;">Don't just read it — watch it</h2>

        <p>Hi ${firstName},</p>

        <p>You've got the book. Now see every technique done, <strong>step by step.</strong></p>

        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 700; color: #e0324a; font-size: 16px;">🎬 Orgasm Techniques Video Training</p>
          <p style="margin: 10px 0; color: #333;">For Him & Her</p>
          <ul style="margin: 10px 0; padding-left: 20px; color: #333;">
            <li>For her: reach orgasm more easily — and more often</li>
            <li>For him: control, stamina, and how to make her come again and again</li>
            <li>Watch privately on your phone</li>
          </ul>
        </div>

        <p style="text-align: center; color: #666; margin: 20px 0;">
          Readers' price: <strong style="color: #e0324a; font-size: 20px;">$8</strong> (one time)
        </p>

        <p style="text-align: center;">
          <a href="${videoCheckoutUrl}" style="display: inline-block; background: linear-gradient(160deg, #e0324a, #8e0f22); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 700; letter-spacing: 1px;">GET INSTANT ACCESS</a>
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="font-size: 12px; color: #666;">
          APHRODITE
        </p>
      </body>
    </html>
  `
}
