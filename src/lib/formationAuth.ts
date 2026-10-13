export const FORMATION_COOKIE = 'formation_access'
const SESSION_SECONDS = 60 * 60 * 24 * 30

const enc = new TextEncoder()
const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')

// Clé de signature des sessions : jamais exposée au navigateur.
function secret(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null
}

async function hmac(message: string, key: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(message)))
}

// Cookie de session signé : "<expiration>.<signature>"
export async function createSessionToken(): Promise<string | null> {
  const key = secret()
  if (!key) return null
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS)
  return `${exp}.${await hmac(`formation:${exp}`, key)}`
}

export async function isFormationAuthorized(token: string | undefined): Promise<boolean> {
  const key = secret()
  if (!key || !token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false
  return sig === (await hmac(`formation:${exp}`, key))
}

// remember = true : l'appareil reste connecté 30 jours ; sinon jusqu'à la fermeture du navigateur.
export function sessionCookieOptions(remember: boolean) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(remember ? { maxAge: SESSION_SECONDS } : {}),
  }
}

export function randomSalt(): string {
  return hex(crypto.getRandomValues(new Uint8Array(16)).buffer)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' }, k, 256)
  return hex(bits)
}
