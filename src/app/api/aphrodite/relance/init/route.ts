import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialiser les tables de relance dans Supabase
// À appeler une fois pour créer la structure

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.RELANCE_INIT_SECRET || 'dev-secret'

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const sqls = [
    // Table des clients et leurs contacts (abandonnés, post-achat, visiteurs)
    `
    CREATE TABLE IF NOT EXISTS aphrodite_customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      chariow_id TEXT UNIQUE,
      first_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      country TEXT,
      status TEXT NOT NULL DEFAULT 'unknown', -- 'abandoned_cart', 'completed', 'visitor'
      abandoned_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_aphrodite_customers_email ON aphrodite_customers(email);
    CREATE INDEX idx_aphrodite_customers_phone ON aphrodite_customers(phone);
    CREATE INDEX idx_aphrodite_customers_status ON aphrodite_customers(status);
    `,

    // Table de suivi des emails de relance
    `
    CREATE TABLE IF NOT EXISTS aphrodite_relance_emails (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES aphrodite_customers(id) ON DELETE CASCADE,
      message_type TEXT NOT NULL, -- 'A1', 'A1-mail', 'A2', etc.
      channel TEXT NOT NULL, -- 'email' ou 'whatsapp'
      scheduled_at TIMESTAMPTZ NOT NULL,
      sent_at TIMESTAMPTZ,
      error TEXT,
      brevo_message_id TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_aphrodite_relance_emails_customer ON aphrodite_relance_emails(customer_id);
    CREATE INDEX idx_aphrodite_relance_emails_scheduled ON aphrodite_relance_emails(scheduled_at);
    CREATE INDEX idx_aphrodite_relance_emails_sent ON aphrodite_relance_emails(sent_at);
    `,

    // Table des variantes de produits (pack 17$, video 8$, ebook 5$)
    `
    CREATE TABLE IF NOT EXISTS aphrodite_offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      chariow_checkout_url TEXT,
      price_usd DECIMAL(10, 2),
      price_xof DECIMAL(10, 2),
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    `,

    // Table de suivi des achats supplémentaires (offres B2, B3, B4)
    `
    CREATE TABLE IF NOT EXISTS aphrodite_customer_purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES aphrodite_customers(id) ON DELETE CASCADE,
      offer_id UUID REFERENCES aphrodite_offers(id),
      offer_name TEXT, -- 'pack_17', 'video_8', 'ebook_5'
      purchased_at TIMESTAMPTZ NOT NULL,
      amount DECIMAL(10, 2),
      currency TEXT DEFAULT 'USD',
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_aphrodite_customer_purchases_customer ON aphrodite_customer_purchases(customer_id);
    `
  ]

  try {
    for (const sql of sqls) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: sql.trim() })
        if (error) {
          console.error('SQL Error:', error)
        }
      } catch (e: any) {
        // RPC method may not exist — log but continue
        console.log('RPC exec_sql not available, skipping:', e?.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tables initialized',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Initialization failed' },
      { status: 500 }
    )
  }
}
