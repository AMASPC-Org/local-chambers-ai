/**
 * verify-ingestion.ts
 * Cloud Agent: Verify the organizations collection in Firestore.
 * Run: npx tsx scripts/verify-ingestion.ts
 *
 * Auth Strategy:
 *   - Emulator: FIRESTORE_EMULATOR_HOST env var — no credentials needed.
 *   - Production: Application Default Credentials (ADC).
 *     Run `gcloud auth application-default login` once on your machine.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Load project ID from env file or default
  let projectId = 'localchambersai';
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/VITE_FIREBASE_PROJECT_ID=(.*)/);
      if (match) projectId = match[1].trim();
    }
  } catch (e) { }
  // In emulator mode, use the same project ID the Functions emulator registered under
  const EMULATOR_PROJECT = 'ama-ecosystem-prod'; // matches .firebaserc default
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  if (isEmulator) projectId = EMULATOR_PROJECT;

  const appConfig: Record<string, any> = { projectId };
  if (!isEmulator) {
    appConfig.credential = applicationDefault();
  }
  const app = initializeApp(appConfig);
  const db = getFirestore(app);

  if (isEmulator) {
    console.log(`[Verification] 🧪 EMULATOR MODE — Firestore at ${process.env.FIRESTORE_EMULATOR_HOST}`);
  } else {
    console.log(`[Verification] 🚀 PRODUCTION MODE — Using ADC for project: ${projectId}`);
  }

  // Prevent hanging forever
  const timeoutId = setTimeout(() => {
    console.error('\n❌ Error: Verification timed out after 30 seconds.');
    process.exit(1);
  }, 30000);

  console.log(`[Verification] Checking 'organizations' collection in project '${projectId}'...`);
  try {
    const snapshot = await db.collection('organizations').get();
    console.log(`\n✅ Total Organizations Found: ${snapshot.size}`);

    if (snapshot.size === 0) {
      console.warn('⚠️  No organizations found. Seeding might have failed.');
    } else {
      console.log('--- List of IDs ---');
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id} (${data.org_name})`);
      });
      console.log('-------------------');
    }

    // Verify public_listings (denormalized by onOrganizationWrite Cloud Function)
    console.log(`\n[Verification] Checking 'public_listings' collection...`);
    const listingsSnapshot = await db.collection('public_listings').get();
    console.log(`✅ Total Public Listings Found: ${listingsSnapshot.size}`);

    if (listingsSnapshot.size === 0) {
      console.warn('⚠️  No public_listings found. Cloud Function trigger may not have fired.');
      if (isEmulator) {
        console.warn('   Ensure the Firebase emulator suite is running (firebase emulators:start).');
      } else {
        console.warn('   Ensure the onOrganizationWrite Cloud Function is deployed.');
      }
    } else {
      console.log('--- Public Listings ---');
      listingsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name} (${data.region})`);
      });
      console.log('-----------------------');
    }

    clearTimeout(timeoutId);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Verification Failed:', err.message);
    if (err.code === 'permission-denied') {
      console.error('   Ensure your ADC credentials have Firestore read permissions.');
      console.error('   Run: gcloud auth application-default login');
    }
    clearTimeout(timeoutId);
    process.exit(1);
  }
}

main();
