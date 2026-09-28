# DAF Academy V2

Application d'apprentissage de la finance pensée comme un parcours progressif : cours, exemples, quiz, XP, streak et progression.

## Ce qui est déjà inclus
- 50 modules structurés en 6 niveaux.
- 16 modules entièrement jouables (cours + quiz).
- 64 questions avec explications.
- Validation à 70% + cours lu.
- XP et série quotidienne.
- Mode invité sans aucune configuration.
- Synchronisation Supabase optionnelle.
- Row Level Security : chaque utilisateur ne voit que ses données.
- PWA : manifest + service worker pour installation sur mobile.
- Interface responsive desktop/mobile.

## Lancer le projet
```bash
npm install
npm run dev
```

## Activer la synchro cloud
Voir `SETUP_SUPABASE.md`.

## Architecture
- `app/` : pages Next.js App Router.
- `components/ProgressProvider.tsx` : progression, XP, streak et cloud sync.
- `lib/curriculum.ts` : curriculum et contenu pédagogique.
- `supabase/schema.sql` : tables + policies RLS.
- `public/sw.js` : cache PWA minimal.

## Règle pédagogique actuelle
Un module est validé lorsque :
1. le cours a été marqué comme lu ;
2. le meilleur score au quiz est >= 70%.

Le dashboard affiche la progression sur les modules actuellement disponibles, sans gonfler artificiellement le taux avec les modules encore en roadmap.
