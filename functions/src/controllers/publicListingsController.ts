/**
 * publicListingsController.ts
 *
 * Maintains a denormalized `public_listings` collection for fast,
 * low-cost directory reads. Triggers on every write to `organizations/{orgId}`.
 *
 * public_listings schema:
 *   - name: string       (mapped from org_name)
 *   - region: string
 *   - websiteUrl: string  (mapped from website)
 *   - industryTags: string[] (defaults to [] — seed data lacks this field)
 *   - updatedAt: Timestamp
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const onOrganizationWrite = functions.firestore
  .document('organizations/{orgId}')
  .onWrite(async (change, context) => {
    // Lazy-init: admin.firestore() must be called INSIDE the handler,
    // not at module-level, because the emulator stubs firebase-admin
    // after module loading completes.
    const db = admin.firestore();
    const orgId = context.params.orgId;
    const listingRef = db.collection('public_listings').doc(orgId);

    // --- DELETE ---
    if (!change.after.exists) {
      functions.logger.info(`[PublicListings] Organization deleted: ${orgId}. Removing listing.`);
      await listingRef.delete();
      return;
    }

    // --- CREATE / UPDATE ---
    const data = change.after.data();
    if (!data) {
      functions.logger.warn(`[PublicListings] No data on after snapshot for ${orgId}. Skipping.`);
      return;
    }

    const listing = {
      name: data.org_name || data.name || 'Unnamed',
      region: data.region || '',
      websiteUrl: data.website || data.websiteUrl || '',
      industryTags: Array.isArray(data.industryTags) ? data.industryTags : [],
      updatedAt: FieldValue.serverTimestamp(),
    };

    functions.logger.info(`[PublicListings] Syncing listing for ${orgId}: ${listing.name}`);
    await listingRef.set(listing, { merge: true });
  });
