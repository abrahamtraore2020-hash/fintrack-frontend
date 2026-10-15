// Outil « Comprendre son persona » : du problème au produit, puis à l'avatar du client idéal.

export interface Avatar {
  nom: string
  situation: string
  difficultes: string
  besoins: string
  objectifs: string
  deja_essaye: string
  objections: string
  budget: string
  ou_cherche: string
}
export interface Fiche {
  concerne: string // qui vit le problème
  probleme: string
  solution: string
  benefice: string
  promesse: string
  produit_nom: string
  produit_format: string
  avatar: Avatar
}

export const AVATAR_CHAMPS: { cle: keyof Avatar; titre: string; aide: string }[] = [
  { cle: 'situation', titre: '1. Sa situation', aide: 'Qui est-elle ? Que fait-elle ? Dans quel contexte vit-elle ou travaille-t-elle ?' },
  { cle: 'difficultes', titre: '2. Ses difficultés', aide: 'Ses problèmes au quotidien, avec ses propres mots.' },
  { cle: 'besoins', titre: '3. Ses besoins et ses désirs', aide: 'De quoi a-t-elle besoin ? Que voudrait-elle changer ?' },
  { cle: 'objectifs', titre: '4. Ses objectifs', aide: 'Quel résultat veut-elle obtenir, et pour quand ?' },
  { cle: 'deja_essaye', titre: '5. Ce qu’elle a déjà essayé', aide: 'Les solutions testées, et pourquoi elles n’ont pas suffi.' },
  { cle: 'objections', titre: '6. Ses objections et ses peurs', aide: 'Ce qui pourrait l’empêcher d’acheter.' },
  { cle: 'budget', titre: '7. Son budget et sa volonté de payer', aide: 'Ce qu’elle dépense déjà pour des problèmes proches (à vérifier).' },
  { cle: 'ou_cherche', titre: '8. Où elle cherche des solutions', aide: 'Plateformes, groupes, personnes qu’elle consulte.' },
]

export const FORMATS = ['Ebook', 'Formation vidéo', 'Modèles numériques', 'Fichier prêt à l’emploi', 'Guide pratique']

export const PRENOMS = {
  femmes: ['Aminata', 'Fatou', 'Awa', 'Mariam', 'Aïcha', 'Kadiatou', 'Marie', 'Salimata'],
  hommes: ['Moussa', 'Ibrahim', 'Kouassi', 'Mamadou', 'Issa', 'Yao', 'Abdoulaye', 'Seydou'],
}

const MAX = 1500
const txt = (v: unknown, max = MAX) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export const avatarVide = (): Avatar => ({ nom: '', situation: '', difficultes: '', besoins: '', objectifs: '', deja_essaye: '', objections: '', budget: '', ou_cherche: '' })
export const ficheVide = (): Fiche => ({ concerne: '', probleme: '', solution: '', benefice: '', promesse: '', produit_nom: '', produit_format: '', avatar: avatarVide() })

export function normaliserFiche(v: unknown): Fiche {
  const x = (v && typeof v === 'object' ? v : {}) as Partial<Fiche> & { avatar?: Partial<Avatar> }
  const a = (x.avatar && typeof x.avatar === 'object' ? x.avatar : {}) as Partial<Avatar>
  return {
    concerne: txt(x.concerne, 300),
    probleme: txt(x.probleme),
    solution: txt(x.solution),
    benefice: txt(x.benefice),
    promesse: txt(x.promesse, 400),
    produit_nom: txt(x.produit_nom, 150),
    produit_format: txt(x.produit_format, 60),
    avatar: {
      nom: txt(a.nom, 60),
      situation: txt(a.situation),
      difficultes: txt(a.difficultes),
      besoins: txt(a.besoins),
      objectifs: txt(a.objectifs),
      deja_essaye: txt(a.deja_essaye),
      objections: txt(a.objections),
      budget: txt(a.budget),
      ou_cherche: txt(a.ou_cherche),
    },
  }
}

// ---- Consignes envoyées à l'IA (génération automatique) ----

export function consigneSolution(f: Pick<Fiche, 'probleme' | 'concerne'>): string {
  return `Tu aides un débutant francophone (Afrique) à transformer un problème observé en idée de produit digital.

PROBLÈME OBSERVÉ : ${f.probleme}
PERSONNES CONCERNÉES : ${f.concerne || 'non précisé'}

À partir de ce problème, propose :
- "solution" : la solution en 1 à 2 phrases simples (le moyen de réduire le problème) ;
- "benefice" : le bénéfice concret pour la personne, en 1 à 2 phrases (situation avant / après), sans exagération ;
- "promesse" : une promesse claire en UNE phrase, réaliste, qui porte sur ce que le produit aide à faire. Interdit : promettre des ventes, de l'argent ou un résultat garanti ;
- "produit_nom" : un nom court et clair pour le produit digital ;
- "produit_format" : le format le plus adapté parmi exactement : ${FORMATS.join(' | ')}.

Réponds UNIQUEMENT par un objet JSON, sans autre texte :
{"solution":"…","benefice":"…","promesse":"…","produit_nom":"…","produit_format":"…"}`
}

export function consigneAvatar(f: Fiche): string {
  return `Tu aides un débutant francophone (Afrique) à comprendre son client idéal en créant un avatar (persona).

PROBLÈME : ${f.probleme}
PERSONNES CONCERNÉES : ${f.concerne || 'non précisé'}
SOLUTION : ${f.solution}
PRODUIT : ${f.produit_nom} (${f.produit_format})
PRÉNOM DE L'AVATAR : ${f.avatar.nom}

Décris cet avatar, qui représente la cible précise du produit. Chaque champ fait 1 à 3 phrases courtes, concrètes, au présent, adaptées au contexte africain francophone. Ce sont des HYPOTHÈSES à vérifier sur le terrain : n'invente aucune statistique et aucun chiffre précis.
Champs : "situation", "difficultes", "besoins", "objectifs", "deja_essaye", "objections", "budget", "ou_cherche".

Réponds UNIQUEMENT par un objet JSON, sans autre texte :
{"situation":"…","difficultes":"…","besoins":"…","objectifs":"…","deja_essaye":"…","objections":"…","budget":"…","ou_cherche":"…"}`
}

function extraireJson(texte: string): Record<string, unknown> | null {
  const d = texte.indexOf('{')
  const f = texte.lastIndexOf('}')
  if (d === -1 || f <= d) return null
  try {
    const o = JSON.parse(texte.slice(d, f + 1))
    return o && typeof o === 'object' && !Array.isArray(o) ? o : null
  } catch {
    return null
  }
}

export function lireSolution(texte: string): Partial<Fiche> | null {
  const o = extraireJson(texte)
  if (!o) return null
  const r = { solution: txt(o.solution), benefice: txt(o.benefice), promesse: txt(o.promesse, 400), produit_nom: txt(o.produit_nom, 150), produit_format: txt(o.produit_format, 60) }
  return r.solution && r.benefice && r.promesse && r.produit_nom ? r : null
}

export function lireAvatar(texte: string): Omit<Avatar, 'nom'> | null {
  const o = extraireJson(texte)
  if (!o) return null
  const r = { situation: txt(o.situation), difficultes: txt(o.difficultes), besoins: txt(o.besoins), objectifs: txt(o.objectifs), deja_essaye: txt(o.deja_essaye), objections: txt(o.objections), budget: txt(o.budget), ou_cherche: txt(o.ou_cherche) }
  return Object.values(r).every(Boolean) ? r : null
}

// ---- Prompts à donner à une IA (générés sans IA, à partir de la fiche) ----

const ligne = (t: string, v: string) => `- ${t} : ${v || '(non précisé)'}`

export function resumeFiche(f: Fiche): string {
  return [
    'MON IDÉE DE PRODUIT DIGITAL',
    ligne('Problème observé', f.probleme),
    ligne('Personnes concernées', f.concerne),
    ligne('Solution', f.solution),
    ligne('Bénéfice pour le client', f.benefice),
    ligne('Promesse', f.promesse),
    ligne('Nom du produit', f.produit_nom),
    ligne('Format', f.produit_format),
    '',
    `MON CLIENT IDÉAL (avatar) : ${f.avatar.nom || '(prénom non choisi)'}`,
    ...AVATAR_CHAMPS.map(c => ligne(c.titre.replace(/^\d+\.\s*/, ''), f.avatar[c.cle])),
  ].join('\n')
}

export function promptConversation(f: Fiche): string {
  return `Tu es un coach expérimenté en création de produits digitaux pour des débutants francophones en Afrique. Je veux affiner mon idée de produit digital en discutant avec toi.

${resumeFiche(f)}

RÈGLES POUR NOTRE CONVERSATION
- Pose-moi UNE seule question à la fois, puis attends ma réponse.
- Aide-moi à clarifier le problème, à préciser ma cible et à améliorer ma solution. Challenge mes hypothèses avec bienveillance.
- Rappelle-moi que mon avatar est une hypothèse que je dois vérifier en parlant à de vraies personnes.
- N'invente aucune statistique et ne promets jamais que mon produit va générer des ventes ou de l'argent.
- Reste simple, concret et adapté au contexte africain francophone.
- À la fin, fais-moi un résumé : le problème, la cible, la promesse, le produit, et les 3 prochaines actions pour vérifier la demande.

Commence par me poser ta première question.`
}

export function promptEbook(f: Fiche): string {
  const titre = f.produit_nom || 'Mon ebook'
  return `Agis comme un expert en création de produits digitaux, en rédaction pédagogique et en marketing éthique. Écris l'ebook complet décrit ci-dessous.

${resumeFiche(f)}

CONSIGNES POUR L'EBOOK
- Titre : « ${titre} ».
- Lecteur : ${f.avatar.nom ? `quelqu'un comme ${f.avatar.nom}` : 'mon client idéal'}, un débutant. Parle-lui avec les mots de ses difficultés.
- Objectif : l'aider à résoudre ce problème : ${f.probleme || '(à préciser)'}. Fais le lien entre son problème, la solution et le bénéfice annoncé.
- Longueur : 10 à 15 pages A4, mise en page aérée.
- Structure : titre et sous-titre, sommaire, introduction (le problème vécu par le lecteur), 5 à 7 chapitres progressifs avec exemples concrets pour l'Afrique francophone, encadrés « À retenir », exercices pratiques avec une fiche à remplir, conclusion et prochaines étapes.
- Ton : celui d'un formateur expérimenté, en français clair et naturel, termes techniques définis simplement.
- N'invente aucune statistique, étude ou résultat chiffré. Si tu cites une donnée précise, appuie-la sur une source vérifiable.
- Ne promets jamais de résultat garanti, ni de ventes, ni d'argent : décris des progrès réalistes.
- Utilise seulement des témoignages ou exemples clairement présentés comme des illustrations.

Rédige d'abord le sommaire détaillé, puis l'ebook complet, chapitre par chapitre. Ne te contente pas d'un plan.`
}
