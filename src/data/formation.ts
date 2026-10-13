export interface Lecon {
  titre: string
  points: string[]
}

export interface Episode {
  slug: string
  numero: number
  titre: string
  resume: string
  lecons: Lecon[]
}

export const FORMATION = {
  titre: 'Lance ton produit digital',
  sousTitre: 'Du problème à la solution, en 1 mois maximum',
}

export const EPISODES: Episode[] = [
  {
    slug: 'qui-suis-je',
    numero: 1,
    titre: 'Qui suis-je ?',
    resume: 'Mon parcours, mes résultats et ce que le groupe va t’apporter.',
    lecons: [
      { titre: 'Mon parcours', points: ['D’où je viens', 'Pourquoi je suis légitime pour t’accompagner'] },
      { titre: 'Mes résultats', points: ['Le calcul de mes gains', 'Les preuves : captures et chiffres'] },
      { titre: 'Ce que le groupe t’apporte', points: ['Le fonctionnement et les règles du groupe', 'Ce que tu peux attendre, et ce qui est attendu de toi'] },
    ],
  },
  {
    slug: 'produit-digital',
    numero: 2,
    titre: 'Le produit digital',
    resume: 'Comprendre, trouver, créer et vendre un produit digital que le marché demande.',
    lecons: [
      { titre: 'Définition du produit digital', points: ['C’est quoi un produit digital', 'Exemples : ebook, formation, template, application, coaching'] },
      { titre: 'Où vendre et où trouver des produits digitaux', points: ['Les plateformes de vente', 'Créer le sien ou revendre celui des autres'] },
      { titre: 'Produit passion ou produit qui résout un problème', points: ['Les deux approches', 'La logique problème → solution'] },
      { titre: 'Créer un produit que le marché demande', points: ['Trouver les vrais problèmes', 'Vérifier la demande avant de se lancer'] },
      { titre: 'Création du produit et ses composantes', points: ['Format, contenu, outils'] },
      { titre: 'La cible', points: ['Connaître le client à qui on veut vendre'] },
      { titre: 'Vendre en organique et en publicité payante', points: ['Organique : réseaux sociaux, contenu, WhatsApp', 'Publicité payante : Facebook, TikTok, etc.'] },
    ],
  },
  {
    slug: 'offre-et-prix',
    numero: 3,
    titre: 'L’offre et le prix',
    resume: 'Créer une offre irrésistible et fixer le bon prix. C’est là que beaucoup bloquent.',
    lecons: [
      { titre: 'Créer une offre irrésistible', points: ['Les composantes d’une offre', 'Bonus, garantie, urgence'] },
      { titre: 'Fixer le prix', points: ['Comment choisir son prix', 'Comment le justifier'] },
    ],
  },
]

export const getEpisode = (slug: string) => EPISODES.find(e => e.slug === slug)
