-- Plusieurs formations, chacune avec ses modules (épisodes) en JSON.
create table if not exists public.formation_formations (
  slug text primary key,
  position int not null default 0,
  titre text not null,
  sous_titre text not null default '',
  episodes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.formation_formations enable row level security;

-- Nom affiché dans « Mon profil »
alter table public.formation_settings add column if not exists display_name text not null default '';

-- Première formation : reprend les modules déjà enregistrés, sinon le contenu de départ.
insert into public.formation_formations (slug, position, titre, sous_titre, episodes)
select
  'lance-ton-produit-digital', 0, 'Lance ton produit digital', 'Du problème à la solution, en 1 mois maximum',
  coalesce(
    (select jsonb_agg(jsonb_build_object('slug', slug, 'titre', titre, 'resume', resume, 'lecons', lecons) order by position)
       from public.formation_episodes),
    '[{"slug":"qui-suis-je","titre":"Qui suis-je ?","resume":"Mon parcours, mes résultats et ce que le groupe va t’apporter.","lecons":[{"titre":"Mon parcours","points":["D’où je viens","Pourquoi je suis légitime pour t’accompagner"]},{"titre":"Mes résultats","points":["Le calcul de mes gains","Les preuves : captures et chiffres"]},{"titre":"Ce que le groupe t’apporte","points":["Le fonctionnement et les règles du groupe","Ce que tu peux attendre, et ce qui est attendu de toi"]}]},{"slug":"produit-digital","titre":"Le produit digital","resume":"Comprendre, trouver, créer et vendre un produit digital que le marché demande.","lecons":[{"titre":"Définition du produit digital","points":["C’est quoi un produit digital","Exemples : ebook, formation, template, application, coaching"]},{"titre":"Où vendre et où trouver des produits digitaux","points":["Les plateformes de vente","Créer le sien ou revendre celui des autres"]},{"titre":"Produit passion ou produit qui résout un problème","points":["Les deux approches","La logique problème → solution"]},{"titre":"Créer un produit que le marché demande","points":["Trouver les vrais problèmes","Vérifier la demande avant de se lancer"]},{"titre":"Création du produit et ses composantes","points":["Format, contenu, outils"]},{"titre":"La cible","points":["Connaître le client à qui on veut vendre"]},{"titre":"Vendre en organique et en publicité payante","points":["Organique : réseaux sociaux, contenu, WhatsApp","Publicité payante : Facebook, TikTok, etc."]}]},{"slug":"offre-et-prix","titre":"L’offre et le prix","resume":"Créer une offre irrésistible et fixer le bon prix. C’est là que beaucoup bloquent.","lecons":[{"titre":"Créer une offre irrésistible","points":["Les composantes d’une offre","Bonus, garantie, urgence"]},{"titre":"Fixer le prix","points":["Comment choisir son prix","Comment le justifier"]}]}]'::jsonb
  )
where not exists (select 1 from public.formation_formations);
