import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export class VerificationService {
  private db = admin.firestore();
  private auth = admin.auth();

  async verifyChamberClaim(chamberId: string, uid: string, userEmail: string): Promise<{ success: boolean; message: string }> {
    // 1. Fetch Chamber Data
    const chamberDoc = await this.db.collection('organizations').doc(chamberId).get();
    if (!chamberDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Chamber not found.');
    }
    const chamberData = chamberDoc.data();
    const websiteDomain = chamberData?.websiteDomain;

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
        if (data?.verificationStatus === 'Verified' && data?.adminUserId !== uid) {
          throw new functions.https.HttpsError('already-exists', 'This chamber is already verified by another administrator.');
        }

        t.update(docRef, {
          verificationStatus: 'Verified',
          adminUserId: uid,
          verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    } catch (error: any) {
      functions.logger.error('Transaction failure:', error);
      if (error?.code === 'already-exists' || error?.code === 'not-found') {
        throw error;
      }
      throw new functions.https.HttpsError('aborted', 'Verification failed due to a conflict. Please try again.');
    }

    // 4. Set Custom Claims
    try {
      const userRecord = await this.auth.getUser(uid);
      const existingClaims = userRecord.customClaims || {};
      await this.auth.setCustomUserClaims(uid, {
        ...existingClaims,
        chamber_id: chamberId,
        role: 'admin'
      });
    } catch (error) {
      functions.logger.error('Error setting custom claims:', error);
      throw new functions.https.HttpsError('internal', 'Verification recorded, but failed to assign admin privileges. Please contact support.');
    }

    return { success: true, message: `Successfully verified as admin for ${chamberData?.name}` };
  }
}
