# Local Chambers AI - Project Rules

## 1. Core Philosophy
> "There should only be one rule: Follow the best practices."

This file consolidates the rules for **Local Chambers AI** (Vite Frontend + Firebase Functions Backend).

## 2. Infrastructure & Region Policy
- **Core Infra (Functions/Firestore)**: STRICTLY `us-west1` (Oregon).
- **Environment Variables**:
  - `GOOGLE_CLOUD_REGION=us-west1`
  - `VITE_FIREBASE_REGION=us-west1`

## 3. Technology Stack & Constraints
- **Frontend**: React (Vite) -> **ESModules**.
- **Backend / Functions**: Firebase Cloud Functions (Node.js 20) -> **CommonJS**.
  - `functions/package.json` MUST contain `"type": "commonjs"`.
- **Styling**: Tailwind CSS.
- **Database**: Firestore (NoSQL).

## 4. Coding Standards
- **Type Safety**:
  - **NO `any`**: Explicit types required.
  - **Zod**: Mandatory for all schema validation.
- **Async Logic**: Always use `async`/`await`.
- **React**: Functional components and Hooks only.

## 5. Workflows
- **Verification**: Run `npm run verify` (Build + Validate).
- **Handoff**: Run `/handoff`.
- **Landing**: Run `/landing`.

## 6. File-Specific Rules
- `functions/**/*.ts`:
  - Must target `us-west1`.
  - Must use CommonJS imports/exports logic internally (transpiled).
