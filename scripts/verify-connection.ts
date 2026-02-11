/**
 * verify-connection.ts
 * Standalone script — discovers schema from AMA-Ecosystem-Prod Firestore.
 * Writes results to scripts/discovery-results.json for reliable reading.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    env[trimmed.substring(0, eqIdx)] = trimmed.substring(eqIdx + 1);
  }
  return env;
}

interface CollectionResult {
  name: string;
  status: 'found' | 'empty' | 'denied' | 'error';
  docCount?: number;
  sampleDocId?: string;
  fields?: string[];
  sampleData?: Record<string, any>;
  error?: string;
}

async function main() {
  const env = loadEnv();
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const collectionsToTry = ['organizations', 'orgs', 'chambers', 'users', 'leads', 'events', 'venues', 'products', 'members', 'admins'];
  const results: CollectionResult[] = [];

  for (const collName of collectionsToTry) {
    try {
      const colRef = collection(db, collName);
      const q = query(colRef, limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        results.push({ name: collName, status: 'empty' });
      } else {
        const firstDoc = snapshot.docs[0];
        const data = firstDoc.data();
        results.push({
          name: collName,
          status: 'found',
          docCount: snapshot.size,
          sampleDocId: firstDoc.id,
          fields: Object.keys(data),
          sampleData: data,
        });
      }
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        results.push({ name: collName, status: 'denied' });
      } else {
        results.push({ name: collName, status: 'error', error: err.message });
      }
    }
  }

  const output = {
    projectId: firebaseConfig.projectId,
    timestamp: new Date().toISOString(),
    results,
  };

  const outPath = path.resolve(process.cwd(), 'scripts', 'discovery-results.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log('Results written to', outPath);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
