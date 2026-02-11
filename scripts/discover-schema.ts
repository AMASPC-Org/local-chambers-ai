/**
 * discover-schema.ts — Firestore Schema Discovery
 *
 * Run: npx tsx scripts/discover-schema.ts
 *
 * Probes the live Firestore database to determine:
 *  1. Which collections exist (from a known candidate list)
 *  2. What fields each document contains
 *  3. Whether products are stored as subcollections
 *
 * Uses the Firebase CLIENT SDK (same config as CloudAgent) so no
 * service account is needed. Requires Firestore security rules to
 * allow reads for the probed collections.
 *
 * Output: Logs field names per collection and a recommended SchemaConfig.
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ---------------------------------------------------------------------------
// Firebase Init (mirrors CloudAgent but uses process.env instead of import.meta)
// ---------------------------------------------------------------------------

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log('🔧 Firebase config loaded for project:', firebaseConfig.projectId);

if (!firebaseConfig.projectId) {
  console.error('❌ VITE_FIREBASE_PROJECT_ID is not set. Check .env.local');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------------------------------------------------------------------
// Candidate collections to probe
// ---------------------------------------------------------------------------

const TOP_LEVEL_CANDIDATES = [
  'organizations',
  'orgs',
  'chambers',
  'products',
  'leads',
  'members',
  'users',
  'events',
];

// Subcollection names to probe on each found org-like document
const SUBCOLLECTION_CANDIDATES = ['products', 'tiers', 'members', 'leads'];

// ---------------------------------------------------------------------------
// Discovery Logic
// ---------------------------------------------------------------------------

interface CollectionProbe {
  name: string;
  exists: boolean;
  docCount: number;
  sampleFields: string[];
  sampleData?: Record<string, unknown>;
  subcollections?: {
    name: string;
    exists: boolean;
    sampleFields: string[];
  }[];
}

async function probeCollection(name: string): Promise<CollectionProbe> {
  try {
    const colRef = collection(db, name);
    const q = query(colRef, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { name, exists: true, docCount: 0, sampleFields: [] };
    }

    const sampleDoc = snapshot.docs[0];
    const data = sampleDoc.data();
    const fields = Object.keys(data);

    // Probe subcollections on this document
    const subcollections: CollectionProbe['subcollections'] = [];
    for (const subName of SUBCOLLECTION_CANDIDATES) {
      try {
        const subRef = collection(db, name, sampleDoc.id, subName);
        const subSnap = await getDocs(query(subRef, limit(1)));
        if (!subSnap.empty) {
          subcollections.push({
            name: subName,
            exists: true,
            sampleFields: Object.keys(subSnap.docs[0].data()),
          });
        }
      } catch (_subErr) {
        // Subcollection doesn't exist or no permission — skip
      }
    }

    return {
      name,
      exists: true,
      docCount: 1, // We only sampled 1
      sampleFields: fields,
      sampleData: data,
      subcollections: subcollections.length > 0 ? subcollections : undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('permission') || message.includes('PERMISSION')) {
      return { name, exists: true, docCount: -1, sampleFields: ['PERMISSION_DENIED'] };
    }
    return { name, exists: false, docCount: 0, sampleFields: [] };
  }
}

async function main() {
  console.log('\n════════════════════════════════════════════');
  console.log('  Firestore Schema Discovery');
  console.log(`  Project: ${firebaseConfig.projectId}`);
  console.log('════════════════════════════════════════════\n');

  const results: CollectionProbe[] = [];

  for (const name of TOP_LEVEL_CANDIDATES) {
    process.stdout.write(`  Probing ${name}...`);
    const result = await probeCollection(name);
    results.push(result);

    if (!result.exists) {
      console.log(' ❌ not found');
    } else if (result.docCount === -1) {
      console.log(' 🔒 PERMISSION DENIED');
    } else if (result.docCount === 0) {
      console.log(' 📂 no documents found (collection may not exist)');
    } else {
      console.log(` ✅ fields: [${result.sampleFields.join(', ')}]`);
      if (result.subcollections) {
        for (const sub of result.subcollections) {
          console.log(`    └─ ${sub.name}: [${sub.sampleFields.join(', ')}]`);
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Print recommendation
  // -----------------------------------------------------------------------

  console.log('\n────────────────────────────────────────────');
  console.log('  Recommended SchemaConfig');
  console.log('────────────────────────────────────────────\n');

  // Determine org collection
  const orgCollection =
    results.find((r) => r.name === 'organizations' && r.exists && r.docCount > 0) ??
    results.find((r) => r.name === 'orgs' && r.exists && r.docCount > 0) ??
    results.find((r) => r.name === 'chambers' && r.exists && r.docCount > 0);

  // Determine product strategy
  let productSource = 'SUBCOLLECTION';
  const topLevelProducts = results.find(
    (r) => r.name === 'products' && r.exists && r.docCount > 0,
  );
  const hasSubcollectionProducts = orgCollection?.subcollections?.some(
    (s) => s.name === 'products',
  );

  if (topLevelProducts) {
    productSource = 'TOP_LEVEL_COLLECTION';
  } else if (hasSubcollectionProducts) {
    productSource = 'SUBCOLLECTION';
  } else if (orgCollection?.sampleFields.includes('tiers')) {
    productSource = 'INLINE_TIERS';
  }

  // Determine leads and products collections
  const leadsCollection = results.find(r => r.name === 'leads' && r.exists && r.docCount > 0)?.name ?? 'leads';
  const productsCollection = results.find(r => r.name === 'products' && r.exists && r.docCount > 0)?.name ?? 'products';

  const config = {
    organizationsCollection: orgCollection?.name ?? 'organizations',
    leadsCollection,
    productsCollection,
    productSource,
  };

  console.log(JSON.stringify(config, null, 2));

  // -----------------------------------------------------------------------
  // Print field mapping comparison
  // -----------------------------------------------------------------------

  if (orgCollection && orgCollection.sampleData) {
    console.log('\n────────────────────────────────────────────');
    console.log('  Field Mapping: Firestore → Chamber type');
    console.log('────────────────────────────────────────────\n');

    const chamberFields = [
      'name', 'region', 'address', 'coordinates', 'industryTags',
      'description', 'logoUrl', 'websiteDomain', 'verificationStatus',
      'stripeConnected', 'tiers',
    ];

    for (const field of chamberFields) {
      const exists = orgCollection.sampleFields.includes(field);
      const icon = exists ? '✅' : '⚠️ ';
      console.log(`  ${icon} Chamber.${field} → ${exists ? 'FOUND' : 'MISSING in Firestore doc'}`);
    }
  }

  console.log('\n✨ Discovery complete. Copy the SchemaConfig above into BackendAgent.ts\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
