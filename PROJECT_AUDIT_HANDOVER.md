# Audit Complet et Guide de Passation - Projet CashCheck

**Date de l'audit:** Août 2026
**Auditeur:** Expert en architecture logicielle (40 ans d'expérience)
**Projet:** SaaS CashCheck (Next.js 16, Supabase, Stripe, OpenAI)

---

## 1. Audit de Sécurité 🛡️

### Points forts
- **Authentification Supabase:** L'utilisation de Supabase pour l'authentification (Magic Links) est robuste et délègue la gestion des mots de passe.
- **Séparation Client/Serveur:** Les clés sensibles (Stripe, OpenAI, Supabase Service Role) sont bien cantonnées côté serveur (Server Actions / API Routes).
- **Webhook Stripe:** Utilisation d'un client administrateur (`supabaseAdmin`) uniquement pour les tâches côté serveur qui nécessitent de contourner la RLS, ce qui est une excellente pratique.

### Vulnérabilités & Points à corriger
- **Fallback Keys (Clés de secours):** Pour passer le build Vercel, des clés "dummy" ont été ajoutées. Si les vraies clés ne sont pas configurées sur Vercel, l'application crashera en production (ce qui est mieux qu'une faille, mais reste un déni de service).
- **Supabase RLS (Row Level Security):** Il est impératif de vérifier que la RLS est activée sur **toutes** les tables de la base de données (`profiles`, `scans`, etc.). Sans cela, n'importe quel utilisateur authentifié pourrait lire ou modifier les données des autres via l'API client.
- **Rate Limiting (Limitation de débit):** L'API `/api/scan` qui utilise OpenAI est vulnérable aux attaques de type "DDoS applicatif" ou d'épuisement de budget. Il faut implémenter un limiteur de requêtes (ex: Upstash Redis ou Vercel KV) pour bloquer les abus.
- **Validation des données entrantes:** Assurez-vous d'utiliser une librairie comme `Zod` pour valider toutes les données envoyées par l'utilisateur (formulaires, images) avant de les traiter ou de les stocker.

---

## 2. Audit de Scalabilité (Mise à l'échelle) 🚀

### Points forts
- **Architecture Serverless:** Déployé sur Vercel, le projet profitera de l'autoscaling instantané pour le frontend et les API routes.
- **Base de données PostgreSQL (Supabase):** Capable de gérer une très forte charge si elle est bien indexée.

### Goulots d'étranglement potentiels
- **Connexions à la Base de données:** Avec l'architecture serverless, chaque requête API peut ouvrir une nouvelle connexion à la base de données. Il est crucial d'utiliser le **Connection Pooling** de Supabase (PGBouncer) (Port 6543) pour éviter d'épuiser les connexions lors d'un pic de trafic.
- **Traitement OpenAI Synchrone:** L'appel à OpenAI dans `/api/scan` peut être long. Sur Vercel, les requêtes Serverless ont un timeout (par exemple 10s ou 60s selon le plan). Si OpenAI met trop de temps, la requête va timeout. **Solution future :** Utiliser des requêtes asynchrones, des Webhooks, ou des Background Jobs (ex: Inngest ou Vercel Background Functions).
- **Stockage d'images (Scans):** Si l'application stocke les images des chèques/reçus, la volumétrie peut exploser. Prévoir une compression côté client avant upload, et configurer des règles de rétention (suppression des vieux scans après X mois).

---

## 3. Éléments Manquants pour Terminer le Projet 🚧

Pour que le projet soit 100% opérationnel en production, voici les éléments indispensables :

### Variables d'Environnement (Clés API)
Ces clés doivent être ajoutées **impérativement** dans les paramètres du projet sur Vercel :
1. **Supabase :**
   - `NEXT_PUBLIC_SUPABASE_URL` : L'URL de l'API de votre projet.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : La clé publique anonyme.
   - `SUPABASE_SERVICE_ROLE_KEY` : Clé secrète d'administration (NE JAMAIS exposer au client).
2. **Stripe :**
   - `STRIPE_SECRET_KEY` : Clé API secrète de production.
   - `STRIPE_WEBHOOK_SECRET` : Clé secrète de signature du Webhook (obtenue après création de l'endpoint webhook sur le dashboard Stripe pointant vers `https://votredomaine.com/api/webhook`).
3. **OpenAI :**
   - `OPENAI_API_KEY` : Clé API pour le système de scan/vision.

### Tâches Restantes
- **Configuration Stripe :** Créer les produits et les prix dans le dashboard Stripe (Abonnement ou Paiement à l'acte) et s'assurer que leurs IDs correspondent à ceux utilisés dans le code (ex: bouton de paiement).
- **Configuration Supabase SQL :** S'assurer que les tables (`profiles`, `scans`, etc.) existent bien, avec la RLS configurée, et les triggers éventuels (ex: création d'un profile automatique à l'inscription).
- **Tests Bout-en-Bout :** Réaliser un cycle complet (Inscription -> Payer l'abonnement -> Scanner un chèque -> Consulter l'historique) avec des vrais comptes tests.

---

## 4. Instructions de Passation (Pour le futur développeur) 🤝

Bienvenue sur le projet CashCheck ! Voici ce qu'il faut savoir :

### Stack Technique
- **Framework :** Next.js (App Router, Turbopack)
- **Styling :** TailwindCSS
- **Backend / BDD :** Supabase (PostgreSQL)
- **Paiements :** Stripe
- **IA :** OpenAI (Vision)

### Architecture
- `app/` : Contient toutes les routes, pages et API de l'application. Les routes API sont dans `app/api/`.
- `components/` : Composants UI réutilisables (navigation, boutons, etc.).
- `utils/supabase/` : Instanciations du client Supabase pour le serveur, le client et le middleware.
- **Middleware :** Le fichier `proxy.ts` (anciennement `middleware.ts`) intercepte les requêtes pour protéger les routes (`/dashboard`, `/historique`, etc.) et gère la redirection vers `/login` ou `/paywall` si l'utilisateur n'est pas abonné.

### Lancement en Local
1. Cloner le repo.
2. `npm install`
3. Créer un fichier `.env.local` et y insérer toutes les variables d'environnement citées plus haut.
4. Lancer le serveur avec `npm run dev`.

### Déploiement
Le déploiement se fait automatiquement via Vercel sur la branche `main`. Lors du "build", des valeurs par défaut (`dummy_key`) sont utilisées pour contourner les limitations de Vercel (les vraies clés n'étant pas accessibles à l'étape de génération statique). Assure-toi que les vraies clés sont bien configurées dans le dashboard Vercel pour le runtime.

---

## 5. Mes Suggestions d'Expert (Bonus) 🌟

Avec mon expérience, voici ce que je recommanderais d'ajouter pour transformer ce SaaS d'un bon projet à un projet d'entreprise solide :

1. **Système de Logs et Monitoring (Observabilité) :**
   Intégrer Sentry ou Datadog. Actuellement, si le webhook Stripe échoue, ou si OpenAI renvoie une erreur, cela sera silencieux. Vous devez être alerté instantanément.

2. **Feedback UX lors des temps de chargement :**
   Le scan de documents via IA prend quelques secondes. Mettez en place une animation de chargement engageante (Squelettes, barre de progression) avec des citations ou des messages pour faire patienter l'utilisateur.

3. **Protection contre la fraude (CashCheck) :**
   Puisque l'application traite de l'analyse financière (chèques/reçus), ajoutez un disclaimer juridique clair indiquant que l'IA peut se tromper, afin de vous protéger légalement.

4. **Analytics Produit :**
   Intégrer PostHog ou Vercel Web Analytics pour suivre le taux de conversion sur le Paywall et comprendre où les utilisateurs abandonnent le processus.
