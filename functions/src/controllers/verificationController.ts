import * as functions from 'firebase-functions';
import { VerificationService } from '../services/VerificationService';
import { verificationSchema } from '../schemas/verificationSchema';

const verificationService = new VerificationService();

export const verifyChamberClaim = functions.region('us-west1').https.onCall(async (data, context) => {
  // Security: Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { uid, token } = context.auth;
  const userEmail = token.email;

  if (!userEmail) {
    throw new functions.https.HttpsError('failed-precondition', 'User must have a verified email address.');
  }

  // Validation: Zod
  const validationResult = verificationSchema.safeParse(data);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    throw new functions.https.HttpsError('invalid-argument', errorMessage);
  }

  const { chamberId } = validationResult.data;

  // Service Call
  return await verificationService.verifyChamberClaim(chamberId, uid, userEmail);
});
