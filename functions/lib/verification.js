"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyChamberClaim = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Admin SDK once
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * verifyChamberClaim
 *
 * Callable function for a user to claim they are the admin of a specific chamber.
 *
 * Input: { chamberId: string }
 * Context: User must be authenticated.
 * Logic:
 *   1. Check if chamber exists.
 *   2. Check if user's verified email domain matches the chamber's website domain.
 *   3. If match, set Custom Claims { chamber_id: chamberId }.
 *   4. Mark chamber as 'Verified' in Firestore.
 */
exports.verifyChamberClaim = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { chamberId } = data;
    const uid = context.auth.uid;
    const userEmail = context.auth.token.email; // Use the verified email from token
    if (!chamberId || typeof chamberId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "chamberId".');
    }
    if (!userEmail) {
        throw new functions.https.HttpsError('failed-precondition', 'User must have a verified email address.');
    }
    // 1. Fetch Chamber Data
    const chamberDoc = await admin.firestore().collection('organizations').doc(chamberId).get();
    if (!chamberDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Chamber not found.');
    }
    const chamberData = chamberDoc.data();
    const websiteDomain = chamberData === null || chamberData === void 0 ? void 0 : chamberData.websiteDomain;
    if (!websiteDomain) {
        throw new functions.https.HttpsError('failed-precondition', 'Chamber does not have a registered website domain for verification.');
    }
    // 2. Domain Check
    const emailDomain = userEmail.split('@')[1];
    if (emailDomain.toLowerCase() !== websiteDomain.toLowerCase()) {
        throw new functions.https.HttpsError('permission-denied', `Email domain (@${emailDomain}) does not match Chamber domain (@${websiteDomain}).`);
    }
    // 3. Transactional Verification (Prevent Race Conditions)
    try {
        await admin.firestore().runTransaction(async (t) => {
            const docRef = admin.firestore().collection('organizations').doc(chamberId);
            const doc = await t.get(docRef);
            if (!doc.exists) {
                throw new functions.https.HttpsError('not-found', 'Chamber not found.');
            }
            const data = doc.data();
            // Critical: Check inside the transaction
            if ((data === null || data === void 0 ? void 0 : data.verificationStatus) === 'Verified' && (data === null || data === void 0 ? void 0 : data.adminUserId) !== uid) {
                throw new functions.https.HttpsError('already-exists', 'This chamber is already verified by another administrator.');
            }
            // Update within transaction
            t.update(docRef, {
                verificationStatus: 'Verified',
                adminUserId: uid,
                verifiedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
    }
    catch (error) {
        console.error('Transaction failure:', error);
        if (error.code === 'already-exists' || error.code === 'not-found') {
            throw error; // Re-throw the specific error
        }
        throw new functions.https.HttpsError('aborted', 'Verification failed due to a conflict. Please try again.');
    }
    // 4. Set Custom Claims (Post-Transaction)
    // If transaction succeeded, we "own" the chamber. Now we get the keys.
    try {
        const userRecord = await admin.auth().getUser(uid);
        const existingClaims = userRecord.customClaims || {};
        await admin.auth().setCustomUserClaims(uid, Object.assign(Object.assign({}, existingClaims), { chamber_id: chamberId, role: 'admin' }));
    }
    catch (error) {
        console.error('Error setting custom claims:', error);
        // Note: If this fails, the DB says they are verified, but they don't have the claim.
        // They can retry verification (logic allows it if adminUserId matches) or support can fix.
        throw new functions.https.HttpsError('internal', 'Verification recorded, but failed to assign admin privileges. Please contact support.');
    }
    return { success: true, message: `Successfully verified as admin for ${chamberData === null || chamberData === void 0 ? void 0 : chamberData.name}` };
});
//# sourceMappingURL=verification.js.map