"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOrganizationWrite = void 0;
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
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
exports.onOrganizationWrite = functions.firestore
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
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    functions.logger.info(`[PublicListings] Syncing listing for ${orgId}: ${listing.name}`);
    await listingRef.set(listing, { merge: true });
});
//# sourceMappingURL=publicListingsController.js.map