---
description: Verify the project integrity (build + lint)
---

# Verify Workflow

Run this workflow to ensure that the project is in a good state.

## Steps

1. **Build the Project**
   - Compiles TypeScript and builds the Vite app.
   ```bash
   npm run build
   ```

2. **Lint Code**
   - Runs ESLint to catch code style and quality issues.
   ```bash
   npm run lint
   ```

## Convenience Command
You can run the primary verification steps with a single command:
```bash
npm run verify
```
