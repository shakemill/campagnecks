# Cks Manager - Campagne MCV

Application Next.js 14+ pour digitaliser les fiches individuelles de dépistage cardiovasculaire.

## Fonctionnalités livrées

- Création d'une campagne (nom + période)
- Création des comptes d'accès (médecin / infirmier-technicien) avec envoi SMTP
- Authentification NextAuth (JWT) avec changement obligatoire du mot de passe temporaire
- RBAC : l'infirmier modifie uniquement l'identification patient + constantes/biologie
- Saisie de fiche MCV et validation finale par médecin
- Génération automatique du rapport patient PDF avec QR de vérification
- Persistance sans base SQL via JSON sur Vercel Blob

## Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner :

- `AUTH_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `APP_BASE_URL` (ex. : `https://campagnecks.vercel.app`, pour les liens de connexion dans les e-mails)
- `BLOB_READ_WRITE_TOKEN`

### Persistance Vercel Blob (production)

Pour garantir la persistance des données sur Vercel :

1. Créer un store Blob dans le projet Vercel
2. Ajouter la variable `BLOB_READ_WRITE_TOKEN` avec le vrai token généré par Vercel
3. Ne pas utiliser la valeur placeholder `vercel_blob_rw_token` en production

Le projet refuse maintenant le fallback silencieux en production si l'écriture Blob échoue.

## Lancement

```bash
npm install
npm run dev
```

Ensuite :

1. Ouvrir `/setup` pour créer le premier compte médecin
2. Se connecter via `/login`
3. Créer la campagne puis les comptes d'accès
4. Saisir une fiche et valider en médecin pour générer le PDF

## Qualité

```bash
npm run lint
npm run test
```
