import type { Episode } from '@/data/formation'

// ---- Modèle ----
export interface Reponse {
  texte: string
  juste: boolean
}
export interface Question {
  id: string
  texte: string
  reponses: Reponse[] // exactement 3, dont 1 juste
  explication?: string
}
export interface Exercice {
  id: string
  formation: string // adresse (slug) de la formation
  titre: string
  modules: string[] // adresses des modules choisis
  questions: Question[]
  ouvert: boolean
  created_at: string
}
export interface Resultat {
  id: string
  nom: string
  email: string
  score: number
  total: number
  note: number
  created_at: string
}

export const LETTRES = ['A', 'B', 'C']
const uid = () => Math.random().toString(36).slice(2, 10)

export function melanger<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

// Vérifie et nettoie des questions venant du navigateur ou de la base : 3 réponses, 1 seule juste.
export function normalizeQuestions(v: unknown): Question[] {
  if (!Array.isArray(v)) return []
  const out: Question[] = []
  for (const q of v) {
    if (!q || typeof q !== 'object') continue
    const x = q as Partial<Question>
    if (typeof x.texte !== 'string' || !x.texte.trim() || !Array.isArray(x.reponses) || x.reponses.length !== 3) continue
    const reps = x.reponses.map(r => ({ texte: String((r as Reponse)?.texte ?? '').trim().slice(0, 300), juste: (r as Reponse)?.juste === true }))
    if (reps.some(r => !r.texte) || reps.filter(r => r.juste).length !== 1) continue
    out.push({
      id: typeof x.id === 'string' && x.id ? x.id.slice(0, 40) : uid(),
      texte: x.texte.trim().slice(0, 500),
      reponses: reps,
      ...(typeof x.explication === 'string' && x.explication.trim() ? { explication: x.explication.trim().slice(0, 500) } : {}),
    })
  }
  return out.slice(0, 50)
}

export const questionVide = (): Question => ({
  id: uid(),
  texte: '',
  reponses: [{ texte: '', juste: true }, { texte: '', juste: false }, { texte: '', juste: false }],
})

// ---- Note ----
export const note20 = (bonnes: number, total: number) => (total > 0 ? Math.round((bonnes / total) * 200) / 10 : 0)

export function mention(note: number): string {
  if (note >= 18) return '🏆 Excellent ! Vous maîtrisez le sujet.'
  if (note >= 14) return '👏 Très bien, continuez comme ça !'
  if (note >= 10) return '👍 Bien, il reste quelques points à revoir.'
  return '💪 Courage ! Revoyez le cours et réessayez.'
}

// Corrige les réponses d'un élève (calcul côté serveur : jamais de note envoyée par le navigateur).
export function corriger(questions: Question[], reponses: { qid: string; choix: number }[]) {
  let bonnes = 0
  for (const q of questions) {
    const r = reponses.find(x => x.qid === q.id)
    if (r && Number.isInteger(r.choix) && q.reponses[r.choix]?.juste) bonnes++
  }
  return { score: bonnes, total: questions.length, note: note20(bonnes, questions.length) }
}

// ---- Génération automatique simple (sans IA) à partir des leçons ----
interface Fait {
  module: string
  lecon: string
  point: string
}
export function questionsSimples(episodes: Episode[], nombre: number): Question[] {
  const faits: Fait[] = episodes.flatMap(e => e.lecons.flatMap(l => l.points.filter(p => p.trim()).map(p => ({ module: e.titre, lecon: l.titre.trim(), point: p.trim() }))))
  const lecons = Array.from(new Set(faits.map(f => f.lecon).filter(Boolean)))
  if (lecons.length < 3 || faits.length < 3) return []
  const questions: Question[] = []

  const build = (texte: string, bonne: string, fausses: string[], explication: string) => {
    const reps = melanger([{ texte: bonne, juste: true }, ...fausses.slice(0, 2).map(t => ({ texte: t, juste: false }))])
    questions.push({ id: uid(), texte, reponses: reps, explication })
  }

  // Type 1 : « À quelle leçon appartient ce point ? »   Type 2 : « Lequel de ces points est dans cette leçon ? »
  const ordre = melanger(faits)
  for (let i = 0; i < ordre.length && questions.length < nombre; i++) {
    const f = ordre[i]
    if (i % 2 === 0) {
      const fausses = melanger(lecons.filter(l => l !== f.lecon))
      if (fausses.length < 2) continue
      build(`Dans le module « ${f.module} », à quelle leçon appartient ce point : « ${f.point} » ?`, f.lecon, fausses, `Ce point fait partie de la leçon « ${f.lecon} ».`)
    } else {
      const autres = faits.filter(x => x.lecon !== f.lecon && x.point !== f.point)
      const fausses = melanger(Array.from(new Set(autres.map(x => x.point)))).slice(0, 2)
      if (fausses.length < 2) continue
      build(`Parmi ces propositions, laquelle fait partie de la leçon « ${f.lecon} » ?`, f.point, fausses, `« ${f.point} » est abordé dans la leçon « ${f.lecon} ».`)
    }
  }
  return questions.slice(0, nombre)
}

// ---- Génération par IA : lecture de la réponse du modèle ----
export function lireReponseIA(texte: string): Question[] {
  const debut = texte.indexOf('[')
  const fin = texte.lastIndexOf(']')
  if (debut === -1 || fin <= debut) return []
  let brut: unknown
  try {
    brut = JSON.parse(texte.slice(debut, fin + 1))
  } catch {
    return []
  }
  if (!Array.isArray(brut)) return []
  const questions = brut.flatMap((b: { question?: unknown; bonne?: unknown; fausses?: unknown; explication?: unknown }) => {
    if (typeof b?.question !== 'string' || typeof b.bonne !== 'string' || !Array.isArray(b.fausses) || b.fausses.length < 2) return []
    const fausses = b.fausses.slice(0, 2).map(String)
    return [
      {
        id: uid(),
        texte: b.question,
        reponses: melanger([{ texte: b.bonne, juste: true }, ...fausses.map(t => ({ texte: t, juste: false }))]),
        ...(typeof b.explication === 'string' ? { explication: b.explication } : {}),
      },
    ]
  })
  return normalizeQuestions(questions)
}

export function consigneIA(episodes: Episode[], nombre: number): string {
  const cours = episodes
    .map(e => `MODULE « ${e.titre} »${e.resume ? ` : ${e.resume}` : ''}\n` + e.lecons.map(l => `- Leçon « ${l.titre} » : ${l.points.filter(p => p.trim()).join(' ; ')}`).join('\n'))
    .join('\n\n')
  return `Tu es formateur. À partir du cours ci-dessous, rédige ${nombre} questions à choix multiple en français, dans l'esprit d'un jeu-quiz, pour tester des débutants sur la création d'un produit digital. Le ton doit être simple et rassurant : évite les montants chiffrés et toute promesse de gains.

Règles :
- Chaque question a UNE bonne réponse et DEUX fausses réponses plausibles, de longueur et de style comparables.
- Une seule bonne réponse possible, sans ambiguïté, fondée sur le cours.
- Questions variées (définition, mise en situation, choix de la bonne décision), de la plus simple à la plus difficile.
- Ajoute une courte explication de la bonne réponse.
- Réponds UNIQUEMENT par un tableau JSON, sans autre texte, de la forme :
[{"question":"…","bonne":"…","fausses":["…","…"],"explication":"…"}]

COURS :
${cours}`
}

// Identification de l'élève avant d'entrer dans la salle : nom + email.
export function verifierEleve(nom: unknown, email: unknown): { ok: true; nom: string; email: string } | { ok: false; erreur: string } {
  const n = typeof nom === 'string' ? nom.trim().replace(/\s+/g, ' ') : ''
  const e = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (n.length < 2 || n.length > 80) return { ok: false, erreur: 'Indiquez votre nom' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) || e.length > 120) return { ok: false, erreur: 'Indiquez une adresse email valide' }
  return { ok: true, nom: n, email: e }
}
