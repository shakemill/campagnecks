# Cks Manager - Campagne MCV

Application Next.js 14+ pour digitaliser les fiches individuelles de depistage cardiovasculaire.

## Fonctionnalites livrees

- Creation d'une campagne (nom + periode)
- Creation des comptes d'acces (medecin / infirmier-technicien) avec envoi SMTP
- Authentification NextAuth (JWT) avec changement obligatoire du mot de passe temporaire
- RBAC: infirmier modifie uniquement identification patient + constantes/biologie
- Saisie de fiche MCV et validation finale par medecin
- Generation automatique du rapport patient PDF avec QR de verification
- Persistance sans base SQL via JSON sur Vercel Blob

## Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner:

- `AUTH_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `BLOB_READ_WRITE_TOKEN`

### Persistance Vercel Blob (production)

Pour garantir la persistance des donnees sur Vercel:

1. Creer un store Blob dans le projet Vercel
2. Ajouter la variable `BLOB_READ_WRITE_TOKEN` avec le vrai token genere par Vercel
3. Ne pas utiliser la valeur placeholder `vercel_blob_rw_token` en production

Le projet refuse maintenant le fallback silencieux en production si l'ecriture Blob echoue.

## Lancement

```bash
npm install
npm run dev
```

Ensuite:

1. Ouvrir `/setup` pour creer le premier compte medecin
2. Se connecter via `/login`
3. Creer la campagne puis les comptes d'acces
4. Saisir une fiche et valider en medecin pour generer le PDF

## Qualite

```bash
npm run lint
npm run test
```
