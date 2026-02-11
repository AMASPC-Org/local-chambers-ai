# AGENT CONTEXT: AMA Local Chambers Node

## MISSION

We are building the "Source of Truth" for local events/chambers. This is a NODE in the AMA Network.

## STRICT TAXONOMY (Enforce in all Schemas)

1. **Target Market:** B2B (Chambers focus), B2C.
2. **Audience Segments:** 21+, Seniors, Families, Singles, Professionals.
3. **Personas:** Foodies, Techies, Hikers, Nightlife, Art Lovers.

## ECOSYSTEM INTEGRATION

- **Hub:** Connects to `ama-ecosystem-prod` (Central DB).
- **Standards:**
  - Frontend: React + TailwindCSS (Vite).
  - AI-First: Maintain `/llms.txt` and Schema.org JSON-LD.
  - Database: Connects via Cloud SQL Auth Proxy or direct to `ama_central_db`.
