# Activer la synchronisation gratuite avec Supabase

L'application fonctionne immédiatement sans Supabase. Dans ce mode, la progression reste sur l'appareil.

## 1. Créer le projet
1. Créer un compte Supabase et un nouveau projet.
2. Ouvrir **SQL Editor**.
3. Copier/coller le contenu de `supabase/schema.sql` puis exécuter le script.

## 2. Ajouter les clés
Dans Supabase, ouvrir le panneau **Connect** et récupérer :
- Project URL
- Publishable key

Créer `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Ne jamais mettre une `service_role` key dans une variable `NEXT_PUBLIC_*`.

## 3. Authentification
Dans Supabase > Authentication > Providers, laisser **Email** activé.
Pour un test rapide, tu peux désactiver temporairement la confirmation d'email ; pour une app publique, garde-la activée.

## 4. Lancer
```bash
npm install
npm run dev
```
Puis ouvrir `http://localhost:3000` et utiliser le bouton **Se connecter**.

## 5. Déploiement gratuit
Sur Vercel : importer le repository GitHub et ajouter les deux mêmes variables d'environnement.
La base et l'authentification restent chez Supabase.
