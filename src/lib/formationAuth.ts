export const FORMATION_COOKIE = 'formation_access'

// Jeton dérivé du mot de passe : le mot de passe lui-même n'est jamais stocké dans le cookie.
export async function formationToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`formation:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Vérifie le cookie d'accès formateur (routes API).
export async function isFormationAuthorized(cookieValue: string | undefined): Promise<boolean> {
  const password = process.env.FORMATION_PASSWORD
  return !!password && cookieValue === (await formationToken(password))
}
