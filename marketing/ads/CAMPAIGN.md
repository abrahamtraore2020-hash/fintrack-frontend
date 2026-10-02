# APHRODITE — The Sex Bible · Campagne Meta (Facebook / Instagram)

Tout ce qu'il faut pour lancer la campagne le moment venu.

## L'offre

- **Produit** : The Sex Bible — The Complete Guide to Understanding Sex, Intimacy & Pleasure (258 pages) + bonus 365 Sex Positions
- **Prix** : 8 $ (barré 25 $, -68 %), urgence 2 jours, 10 premiers acheteurs
- **Page de vente** : https://fintrack-frontend-ebon.vercel.app/the-sex-bible.html
- **Paiement** : https://aphroditelove.mychariow.market/thesxbibleforcouple/checkout
- **Marché** : Afrique anglophone — Nigeria, Ghana (puis Zambie, Kenya)
- **Langue des pubs** : anglais

## Avant de lancer

- [ ] Mettre l'ID du pixel Meta dans `public/the-sex-bible.html` (`FB_PIXEL_ID`) — la page envoie déjà PageView, ViewContent et InitiateCheckout
- [ ] Ajouter le même pixel côté Chariow si possible, pour l'événement Purchase
- [ ] Vérifier le pixel dans le Gestionnaire d'événements → Tester les événements
- [ ] Ciblage 18+ obligatoire

## Les 3 créas

| # | Fichier | Angle | Segment | Rôle |
|---|---------|-------|---------|------|
| 1 | `ad1-pain-4x5.jpg` | Douleur — « la chambre silencieuse » | Couples / mariés 25-45 | Arrêter le scroll, émotion |
| 2 | `ad2-curiosity-4x5.jpg` | Curiosité — « le savoir interdit » | Hommes + femmes 21-40 | Désir, large audience |
| 3 | `ad3-offer-4x5.jpg` | Offre — « -68 % pendant 48 h » | Reciblage (visiteurs, vidéo/engagement) | Faire acheter |

### Ad 1 — Douleur
- **Texte principal** :
  > Same bed. Same routine. Same silence.
  > Many couples go through it — the spark fades, the nights repeat, and nobody talks about it.
  > The Sex Bible is the complete guide to understanding intimacy, desire and pleasure — for men, women and couples.
  > 📱 258-page eBook + bonus 365 Positions eBook · 100% private · instant download
  > 👉 $8 instead of $25 — 48 hours only.
- **Titre** : There's a way back.
- **Description** : Digital eBook · instant download · $8
- **Bouton** : Shop now / Get offer

### Ad 2 — Curiosité
- **Texte principal** :
  > What nobody ever taught you about pleasure.
  > Not in school. Not at home. Not even by your partner.
  > The Sex Bible: one complete guide — seduction, foreplay, intimacy, pleasure. No awkwardness. No judgment. No pretending.
  > 📱 Digital eBook — no package, instant download, read it on your phone.
  > 👉 $8 today only (instead of $25).
- **Titre** : The guide everyone needs — and nobody talks about.
- **Description** : 258-page eBook + 365 Positions bonus
- **Bouton** : Learn more

### Ad 3 — Offre
- **Texte principal** :
  > ⏳ Last chance: 68% OFF ends in 48 hours.
  > The Sex Bible (258-page eBook) + FREE bonus eBook: 365 Sex Positions.
  > $25 → $8. Reserved for the first 10 buyers.
  > Instant eBook download — no physical book, read it tonight.
- **Titre** : $8 · 48 hours only
- **Description** : Digital eBook · Instant download
- **Bouton** : Shop now

## Structure de campagne

- **Objectif** : Ventes (conversions) sur l'événement **InitiateCheckout** au début, puis **Purchase** dès que Chariow le remonte. Si le pixel n'a pas encore de données : objectif Trafic → page de vente pendant les 2-3 premiers jours.
- **Ensemble 1 — Froid large** : Nigeria + Ghana, 21-45 ans, tous genres, ciblage Advantage+ (large). Pubs 1 + 2.
- **Ensemble 2 — Couples** : 25-45 ans, intérêts mariage / relationships / romance. Pub 1.
- **Ensemble 3 — Reciblage** : visiteurs de la page (7 jours) + personnes ayant interagi avec les pubs. Pub 3.
- **Placements** : Advantage+ (fil + stories + reels). Formats 4:5 (fil) et 9:16 (stories).

## Budget de test

- 5 à 10 $/jour par ensemble pendant 3 à 4 jours, sans toucher.
- Couper une pub si coût par clic sur le lien > 0,30 $ ou CTR < 1 % après ~1 000 impressions.
- Garder la meilleure, puis augmenter le budget de 20 % tous les 2 jours.

## Indicateurs

- CTR lien ≥ 1,5 % · coût par InitiateCheckout ≤ 1,5 $ · coût par achat ≤ 4 $ (marge sur 8 $)

## Règles Meta (important)

- Toujours préciser **eBook / instant download** dans les textes : sans ça, les gens croient recevoir un livre papier.

- Meta encadre fortement les produits « adultes » : présenter le livre comme un **guide d'intimité et de relation de couple**, pas comme un contenu érotique.
- Pas de nudité ni de pose suggestive dans les visuels ; la couverture montre un couple dénudé — si une pub est refusée, tester le livre plus petit, de biais ou affiché sur un téléphone.
- Ne jamais affirmer un attribut personnel (« Your sex life is boring? », « Are you bad in bed? ») : parler des couples en général.
- La page de vente contient des photos sensuelles : si Meta bloque à cause de la page, prévoir une variante plus sage de la page pour les pubs.

## Fichiers

- `ad*-4x5.jpg` : visuels prêts à publier (1080×1350)
- `sources/` : image IA d'origine, version avec la vraie couverture, et le gabarit HTML des textes
