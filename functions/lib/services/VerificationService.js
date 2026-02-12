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
exports.VerificationService = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
class VerificationService {
    constructor() {
        this.db = admin.firestore();
        this.auth = admin.auth();
    }
    async verifyChamberClaim(chamberId, uid, userEmail) {
        // 1. Fetch Chamber Data
        const chamberDoc = await this.db.collection('organizations').doc(chamberId).get();
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
        // 3. Transactional Verification
        try {
            await this.db.runTransaction(async (t) => {
                const docRef = this.db.collection('organizations').doc(chamberId);
                const doc = await t.get(docRef);
                if (!doc.exists) {
                    throw new functions.https.HttpsError('not-found', 'Chamber not found.');
                }
                const data = doc.data();
                if ((data === null || data === void 0 ? void 0 : data.verificationStatus) === 'Verified' && (data === null || data === void 0 ? void 0 : data.adminUserId) !== uid) {
                    throw new functions.https.HttpsError('already-exists', 'This chamber is already verified by another administrator.');
                }
                t.update(docRef, {
                    verificationStatus: 'Verified',
                    adminUserId: uid,
                    verifiedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });
        }
        catch (error) {
            functions.logger.error('Transaction failure:', error);
            if ((error === null || error === void 0 ? void 0 : error.code) === 'already-exists' || (error === null || error === void 0 ? void 0 : error.code) === 'not-found') {
                throw error;
            }
            throw new functions.https.HttpsError('aborted', 'Verification failed due to a conflict. Please try again.');
        }
        // 4. Set Custom Claims
        try {
            const userRecord = await this.auth.getUser(uid);
            const existingClaims = userRecord.customClaims || {};
            await this.auth.setCustomUserClaims(uid, Object.assign(Object.assign({}, existingClaims), { chamber_id: chamberId, role: 'admin' }));
        }
        catch (error) {
            functions.logger.error('Error setting custom claims:', error);
            throw new functions.https.HttpsError('internal', 'Verification recorded, but failed to assign admin privileges. Please contact support.');
        }
        return { success: true, message: `Successfully verified as admin for ${chamberData === null || chamberData === void 0 ? void 0 : chamberData.name}` };
    }
}
exports.VerificationService = VerificationService;
//# sourceMappingURL=VerificationService.js.map