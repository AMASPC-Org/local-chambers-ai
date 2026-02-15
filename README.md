# Local Chambers AI

![Status: Active](https://img.shields.io/badge/Status-Active-green)

## Mission
To be the AI-powered search and discovery engine connecting local businesses with Chamber of Commerce benefits and networking opportunities.

## Status
**Active**
This is a live application deployed to Firebase Hosting.

## Tech Stack
*   **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
*   **Backend**: Firebase (Hosting, Functions, Firestore)
*   **Maps**: Google Maps Platform (via `@vis.gl/react-google-maps`)
*   **Language**: TypeScript

## Architecture Overview
The application follows a serverless architecture on Google Cloud/Firebase.
*   **Frontend**: SPA hosted on Firebase Hosting.
*   **Backend**: Cloud Functions for API business logic.
*   **Database**: Firestore (NoSQL).
*   See [docs/](docs/) for detailed architectural diagrams (Pending).

## Getting Started

### Prerequisites
*   Node.js (v22+)
*   Firebase CLI
*   `ama-agentic-ecosystem` checked out in a sibling directory (for secrets management).

### Installation
```bash
npm install
cd functions && npm install
```

### Configuration
1.  Set `GEMINI_API_KEY` in `.env.local` (Get it from Google AI Studio).
2.  Ensure local emulators are configured if testing backend logic.

### Running Locally
```bash
# Start Frontend (Development Mode)
npm run dev

# Start Backend Emulators (Optional)
firebase emulators:start
```
*Note: `npm run dev` fetches secrets from `../ama-agentic-ecosystem` automatically.*

## Key Commands
*   `npm run build`: Production build (Vite).
*   `npm run verify`: Run build verification.
*   `npm run audit:drift`: Check for architectural drift.

## Project Rules
See [PROJECT_RULES.md](PROJECT_RULES.md) for repository-specific guidelines.
Adhere to global mandates in `~/.antigravity/.agent/HEAD_RULES.md`.

## Global Automation
*   **Drift Detection**: Run `/audit` to verify GCP region compliance (us-west1).
*   **Handoff**: Use `/handoff` to sync changes safely.

## Project Structure
```
local-chambers-ai/
├── src/                 # React Frontend
├── functions/           # Cloud Functions (Backend)
├── docs/                # Documentation
├── scripts/             # Utility scripts (Audit, etc.)
└── firebase.json        # Firebase configuration
```

## Related Repos
*   **ama-agentic-ecosystem**: Secrets management and shared scripts.
*   **AMAEventScraper**: Data source integration.
