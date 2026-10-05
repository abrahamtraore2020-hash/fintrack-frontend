# APHRODITE — The Sex Bible · Workflows de relance WhatsApp + E-mail

Trois parcours, selon où en est la personne. Les messages sont en anglais (marché Nigeria / Ghana), prêts à copier.

| Parcours | Qui | But | Durée |
|---|---|---|---|
| **A. Panier abandonné** | A commencé le paiement Chariow mais n'a pas payé | Récupérer la vente à 8 $ | 3 jours |
| **B. Après achat** | A payé The Sex Bible | Faire télécharger, faire aimer le livre, vendre les 3 offres (17 $, 8 $, 5 $), obtenir un avis | 7 jours |
| **C. Visiteurs sans contact** | Ont vu la page, n'ont rien laissé | Les faire revenir | Pub Meta (reciblage) |

## Variables à remplacer

- `{first_name}` : prénom du client
- `{checkout}` : https://aphroditelove.mychariow.market/thesxbibleforcouple/checkout
- `{page}` : https://fintrack-frontend-ebon.vercel.app/the-sex-bible.html
- `{dl_bible}` : https://drive.google.com/file/d/1RoeWUFst_L5KWGCgv5Uamu3NSU6F2q3M/view?usp=drivesdk
- `{dl_bonus}` : https://drive.google.com/file/d/1CYv3D9AjUo9f3DWxl0bZ8gppizdxH6HZ/view?usp=drivesdk
- `{pack_17}`, `{video_8}`, `{ebook_5}` : liens de paiement Chariow des 3 offres (à créer)

⚠️ N'envoie jamais le lien de la page de remerciement dans une relance : elle compte un « Achat » pour le pixel Meta à chaque ouverture, ce qui fausserait tes statistiques. Envoie les liens directs ci-dessus.

---

## A. Panier abandonné (la priorité : ces gens voulaient acheter)

Où trouver ces personnes : Chariow → Ventes → statut **« Abandonné »** (nom, e-mail, téléphone).

| Quand | Canal | Message |
|---|---|---|
| +30 min | WhatsApp | A1 |
| +30 min | E-mail | A1-mail |
| +4 h | WhatsApp | A2 |
| +24 h | E-mail | A2-mail |
| +24 h | WhatsApp | A3 |
| +48 h | E-mail | A3-mail |
| +60 h | WhatsApp | A4 (dernier) |

**Stop** dès que la personne paie ou répond « STOP ».

### A1 · WhatsApp · +30 min — l'aide
```
Hi {first_name} 👋 It's Grace from APHRODITE.

I saw you started your order for The Sex Bible but the payment didn't go through.

Did you have a problem with the payment? I can help you right now 🙏

Here's your link again (still $8 instead of $25):
{checkout}
```

### A1-mail · +30 min
**Objet :** Your order is waiting, {first_name}
```
Hi {first_name},

Your order for The Sex Bible is still waiting for you — the payment wasn't completed.

If something went wrong (card, mobile money, connection), just reply to this email and we'll help you.

👉 Complete your order ($8 instead of $25):
{checkout}

What you get, instantly and privately:
• The Sex Bible — 258-page eBook
• FREE bonus: 365 Sex Positions eBook
• Download on your phone in seconds — nothing physical, nobody knows

See you inside,
APHRODITE
```

### A2 · WhatsApp · +4 h — le désir
```
{first_name}, quick question 😏

When was the last time your nights felt really exciting?

Most couples never learn how desire actually works — so the spark fades and nobody talks about it.

The Sex Bible changes that: seduction, foreplay, pleasure, 258 pages + 365 positions bonus.

Your copy is still reserved 👇
{checkout}
```

### A2-mail · +24 h
**Objet :** What nobody ever taught you
```
Hi {first_name},

Not in school. Not at home. Not even in our relationships.
Nobody teaches us how desire really works.

That's why we created The Sex Bible:
• Seduction — desire starts long before the bedroom
• Foreplay — the touch that changes everything
• Pleasure — understand it, his and hers
• Positions & techniques to break the routine for good

+ FREE: the 365 Sex Positions eBook — a new idea for every night.

Still $8 instead of $25, but the launch price ends soon.

👉 Get your copy: {checkout}

APHRODITE
```

### A3 · WhatsApp · +24 h — l'urgence
```
⏳ {first_name}, the $8 launch price for The Sex Bible ends very soon.

After that it goes back to $25.

258-page eBook + 365 Positions bonus, instant download, 100% private.

Last chance at $8 👇
{checkout}
```

### A3-mail · +48 h
**Objet :** Last hours at $8, {first_name}
```
Hi {first_name},

This is your last reminder: the launch price of The Sex Bible ends in a few hours.

$25 → $8 today only.

✓ 258-page eBook + FREE 365 Positions eBook
✓ Instant download, read it tonight on your phone
✓ 100% private — no package, no delivery

👉 {checkout}

After that, the price goes back to $25.

APHRODITE
```

### A4 · WhatsApp · +60 h — le dernier
```
Last message from me, {first_name} 🙏

I'm closing your reservation for The Sex Bible today.

If you still want it at $8, here's the link:
{checkout}

Otherwise, no worries — I won't bother you again ❤️
```

---

## B. Après achat (onboarding + offres)

Où trouver ces personnes : Chariow → Ventes → statut **« Complété »**.

| Quand | Canal | Message | Offre |
|---|---|---|---|
| Tout de suite | E-mail | B1-mail : bienvenue + téléchargement | — |
| +2 h | WhatsApp | B1 : « tu as bien reçu ? » | — |
| +1 jour | WhatsApp | B2 : premier conseil + pack 500 vidéos | 17 $ |
| +3 jours | E-mail | B3-mail : la formation vidéo | 8 $ |
| +5 jours | WhatsApp | B4 : le guide point G / point P | 5 $ |
| +7 jours | WhatsApp | B5 : demande d'avis | — |

**Ne pas proposer une offre déjà achetée** (vérifie dans Chariow avant d'envoyer).

### B1-mail · tout de suite
**Objet :** Your eBooks are here, {first_name} 🎉
```
Hi {first_name},

Thank you for your order — welcome to The Sex Bible!

Download your two eBooks here:
📕 The Sex Bible (258 pages): {dl_bible}
🎁 BONUS — 365 Sex Positions: {dl_bonus}

Tip: download them on your phone now so you can read anytime, privately.

Start tonight with Part 1 — Seduction. Desire starts long before the bedroom 😉

Enjoy,
APHRODITE
```

### B1 · WhatsApp · +2 h
```
Hi {first_name} 🎉 Thank you for getting The Sex Bible!

Just checking: did you download your 2 eBooks?

📕 The Sex Bible: {dl_bible}
🎁 365 Positions: {dl_bonus}

If anything doesn't open, reply here and I'll help you 🙏
```

### B2 · WhatsApp · +1 jour — pack 17 $
```
{first_name}, did you start reading? 😏

Little tip for tonight: Part 1 (Seduction) — build the tension all day before you even touch.

And if you want to go further, I have something private for our readers:
🎬 500 adult videos + private Telegram groups + 70 free adult sites
Only $17 — for readers only 👇
{pack_17}
```

### B3-mail · +3 jours — formation 8 $
**Objet :** Don't just read it — watch it
```
Hi {first_name},

You've got the book. Now see every technique done, step by step.

🎬 Orgasm Techniques Video Training — For Him & Her
• For her: reach orgasm more easily — and more often
• For him: control, stamina, and how to make her come again and again
• Watch privately on your phone

Readers' price: $8 (one time)
👉 {video_8}

APHRODITE
```

### B4 · WhatsApp · +5 jours — guide 5 $
```
{first_name}, do you know where the G-spot really is? And his P-spot? 🤫

Most couples never find them — and miss the most intense orgasms of their life.

📘 G-Spot & P-Spot: The Complete Guide
Only $5 👇
{ebook_5}
```

### B5 · WhatsApp · +7 jours — avis (preuve sociale)
```
Hi {first_name} ❤️ One week with The Sex Bible!

Can I ask you a small favor? In one or two sentences, what did you like most (or what changed for you)?

Your answer stays anonymous — only your first name and country, if you agree 🙏
```
Les réponses positives (prénom + pays, avec accord) peuvent aller sur la page de vente comme vrais témoignages.

---

## C. Visiteurs sans contact (pas de téléphone ni d'e-mail)

On ne peut pas leur écrire : on les relance avec la **pub Meta** grâce au pixel.
- Audience : visiteurs de la page de vente (7 jours) **sans** achat.
- Pub : visuel ad3 (offre $25 → $8, 48 h) + texte de la pub D du plan de campagne.
- Budget : 2 à 3 $/jour.

---

## Règles importantes

**WhatsApp**
- WhatsApp (Meta) interdit la vente de produits pour adultes via ses outils automatiques (API, chatbots). Pour protéger ton compte : envoie depuis **WhatsApp Business** à la main (messages enregistrés en « Réponses rapides »), avec un **numéro dédié** à APHRODITE, pas ton numéro principal.
- Jamais de mots crus dans le premier message, ni d'images explicites : le message s'affiche sur l'écran verrouillé du client.
- Maximum 4 messages par personne, et arrête tout de suite si elle répond STOP.
- Étiquettes WhatsApp Business conseillées : `Panier abandonné`, `Client`, `Offre 17 $ envoyée`, `Avis reçu`.

**E-mail**
- Objets sans mots crus (pas de « sex » dans l'objet) pour éviter les spams.
- Expéditeur : « APHRODITE ».
- Outil : les relances automatiques de Chariow si ta boutique les propose ; sinon un outil gratuit comme Brevo (jusqu'à 300 e-mails/jour).
