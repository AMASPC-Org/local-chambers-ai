/**
 * Admin Elevation Script
 * 
 * Usage: node scripts/set-admin.js --email user@example.com
 * 
 * This script uses the Firebase Admin SDK to set the `admin: true` custom claim.
 * Requires GOOGLE_APPLICATION_CREDENTIALS to be set to a valid service-account.json.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initializing Admin SDK
if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  admin.initializeApp({
    projectId: 'ama-ecosystem-prod', // Or any dummy ID used by your local emulator
  });
  console.log('Initialized in Emulator Mode (FIREBASE_AUTH_EMULATOR_HOST is set)');
} else if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const saPath = resolve(process.cwd(), 'service-account.json');
  try {
    const sa = JSON.parse(readFileSync(saPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(sa)
    });
    console.log('Initialized with service-account.json');
  } catch (err) {
    console.error('Error: GOOGLE_APPLICATION_CREDENTIALS is not set and service-account.json not found in root.');
    console.log('TIP: To run against emulators, set FIREBASE_AUTH_EMULATOR_HOST=localhost:9099');
    process.exit(1);
  }
} else {
  admin.initializeApp();
  console.log('Initialized with default credentials');
}

const args = process.argv.slice(2);
const emailArg = args.find(a => a.startsWith('--email='));
const email = emailArg ? emailArg.split('=')[1] : args[args.indexOf('--email') + 1];

if (!email) {
  console.error('Usage: node scripts/set-admin.js --email <email>');
  process.exit(1);
}

async function setAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`Successfully set admin claim for ${email} (uid: ${user.uid})`);
    console.log('User must re-log or refresh token to see changes.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  }
}

setAdmin(email);
