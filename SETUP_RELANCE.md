# 🚀 APHRODITE Relance - Setup Final

## Étape 1: Ajouter les variables dans Vercel

**Aller à:** https://vercel.com/team-fintrack/fintrack-frontend → Settings → Environment Variables

**Copier-coller ces variables:**

```
CHARIOW_API_KEY=...
CHARIOW_PACK_17_URL=https://aphroditelove.mychariow.market/pack500
CHARIOW_VIDEO_8_URL=https://aphroditelove.mychariow.market/video8
CHARIOW_EBOOK_5_URL=https://aphroditelove.mychariow.market/ebook5
RELANCE_INIT_SECRET=dev-secret-123
RELANCE_CRON_SECRET=cron-job-secret-456
DASHBOARD_AUTH_TOKEN=dashboard-secret-789
```

**Remplacer les valeurs:**
- `CHARIOW_API_KEY` : Chariow → Développeurs → API → copier la clé
- **Les emails** : Utilisent la même API Chariow (gratuit, pas besoin de Brevo)
- Les `*_SECRET` : garder n'importe quelle valeur (à utiliser dans les URLs)

---

## Étape 2: Initialiser la base de données

1. Aller à `/aphrodite/setup`
2. Entrer le `RELANCE_INIT_SECRET` (ex: `dev-secret-123`)
3. Cliquer "Initialize Tables"
4. ✅ Voir "Success"

---

## Étape 3: Configurer Chariow Webhook

1. Chariow → Développeurs → Webhooks
2. Ajouter nouveau webhook:
   - **URL:** `https://yoursite.vercel.app/api/aphrodite/relance/webhooks`
   - **Événements:** `sale.abandoned`, `payment.failed`, `sale.completed`

---

## Étape 4: Configurer le Cron Job

**Option A: Vercel Crons (recommandé)**

Ajouter à `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/aphrodite/relance/send",
    "schedule": "*/5 * * * *"
  }]
}
```

**OU Option B: Cron externe**

Service comme https://cron-job.org :
- URL: `https://yoursite.vercel.app/api/aphrodite/relance/send?secret=YOUR_RELANCE_CRON_SECRET`
- Toutes les 5 minutes

---

## Étape 5: Accéder au Dashboard

**WhatsApp Relance:** https://yoursite.vercel.app/aphrodite/relance

Affiche:
- Clients avec panier abandonné
- Clients qui ont acheté
- Boutons WhatsApp pré-remplis pour chaque message

---

## 🎯 Résumé des endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/aphrodite/relance/webhooks` | Chariow webhook (automatique) |
| `/api/aphrodite/relance/send?secret=...` | Cron email sender (toutes les 5 min) |
| `/api/aphrodite/dashboard/customers` | API pour le dashboard |
| `/aphrodite/relance` | Dashboard UI |
| `/aphrodite/setup` | Setup & init DB |

---

## ✅ Checklist Final

- [ ] Ajouter toutes les variables Vercel
- [ ] Redéployer (Vercel le fait automatiquement)
- [ ] Aller à `/aphrodite/setup` → initialiser DB
- [ ] Configurer webhook Chariow
- [ ] Configurer cron job (Vercel ou externe)
- [ ] Tester le dashboard à `/aphrodite/relance`
- [ ] Faire un test: créer un panier abandonné dans Chariow
- [ ] Vérifier que l'email arrive dans 30 min

---

**Une fois tout configuré, le système fonctionne 100% automatiquement!**
