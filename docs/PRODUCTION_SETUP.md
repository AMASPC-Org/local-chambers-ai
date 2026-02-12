# Production Deployment Setup

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Access to the Firebase project console

## 1. Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com) → your project → **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Save the file as `service-account.json` in the project root
4. This file is gitignored — **never commit it**

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Key variables for production:
- `VITE_FIREBASE_*` — Firebase client config (from Firebase Console → Project Settings → General → Your Apps)
- `GEMINI_API_KEY` — From [Google AI Studio](https://aistudio.google.com/apikey)
- `GOOGLE_APPLICATION_CREDENTIALS` — Path to `service-account.json` (for Admin SDK scripts)

## 3. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

This deploys the RBAC rules from `firestore.rules`. Key behaviors:
- `organizations` and `public_listings`: publicly readable
- `organizations` writes: owner or admin only
- `public_listings` writes: Cloud Functions only (Admin SDK bypasses rules)
- `leads`: public create, owner/admin read
- Default: deny all

## 4. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

This deploys the composite indexes defined in `firestore.indexes.json`.

## 5. Deploy Cloud Functions

```bash
cd functions && npm run build && cd ..
firebase deploy --only functions
```

Deployed functions:
- `generateMembershipPacket` — HTTPS callable
- `verifyChamberClaim` — HTTPS callable
- `onOrganizationWrite` — Firestore trigger (denormalization)
- `chatWithGuide` — HTTPS callable

> **Region**: All GCP resources should target `us-west1`. Configure in `firebase.json` or function definitions as needed.

## 6. Seed Production Data

```bash
set GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
npx tsx scripts/seed-organizations.ts
```

> **Note**: Do NOT set `FIRESTORE_EMULATOR_HOST` when targeting production.
