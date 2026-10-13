import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fail, requireTrainer } from '@/lib/formationApi'

const BUCKET = 'formation'
const MAX_BYTES = 4 * 1024 * 1024 // limite des requêtes Vercel : les images sont réduites dans le navigateur avant l'envoi
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

export async function POST(req: NextRequest) {
  const denied = await requireTrainer(req)
  if (denied) return denied
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return fail('Supabase n’est pas configuré', 500)

  const file = (await req.formData().catch(() => null))?.get('file')
  if (!(file instanceof File)) return fail('Aucune image reçue')
  const ext = TYPES[file.type]
  if (!ext) return fail('Format non accepté (JPG, PNG, WEBP ou GIF)')
  if (file.size > MAX_BYTES) return fail('Image trop lourde (4 Mo maximum)')

  const db = createClient(url, key, { auth: { persistSession: false } })
  const path = `images/${crypto.randomUUID()}.${ext}`
  const body = await file.arrayBuffer()
  let { error } = await db.storage.from(BUCKET).upload(path, body, { contentType: file.type })
  // Premier envoi : l'espace de stockage n'existe pas encore, on le crée.
  if (error && /not found/i.test(error.message)) {
    await db.storage.createBucket(BUCKET, { public: true })
    ;({ error } = await db.storage.from(BUCKET).upload(path, body, { contentType: file.type }))
  }
  if (error) return fail(`Envoi impossible : ${error.message}`, 500)
  return NextResponse.json({ url: db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl })
}
