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

// Identifiant fixe du formateur « administrateur » (le propriétaire de la plateforme, connecté par le mot de passe historique).
export const ADMIN_ID = '00000000-0000-0000-0000-000000000001'

// Cookie de session signé : "<expiration>.<identifiant du formateur>.<signature>"
export async function createSessionToken(formateurId: string = ADMIN_ID): Promise<string | null> {
  const key = secret()
  if (!key) return null
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS)
  return `${exp}.${formateurId}.${await hmac(`formation:${exp}:${formateurId}`, key)}`
}

// Renvoie le formateur de la session, ou null si le cookie est absent, expiré ou falsifié.
// (Les anciens cookies « <expiration>.<signature> » restent valables : ils désignent l'administrateur.)
export async function readSession(token: string | undefined): Promise<{ id: string } | null> {
  const key = secret()
  if (!key || !token) return null
  const parts = token.split('.')
  const [exp] = parts
  if (!exp || Number(exp) < Date.now() / 1000) return null
  if (parts.length === 2) return parts[1] === (await hmac(`formation:${exp}`, key)) ? { id: ADMIN_ID } : null
  if (parts.length !== 3 || !/^[0-9a-f-]{36}$/i.test(parts[1])) return null
  return parts[2] === (await hmac(`formation:${exp}:${parts[1]}`, key)) ? { id: parts[1] } : null
}

export async function isFormationAuthorized(token: string | undefined): Promise<boolean> {
  return (await readSession(token)) !== null
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
