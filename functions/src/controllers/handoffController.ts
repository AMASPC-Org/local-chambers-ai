import * as functions from 'firebase-functions';
import { HandoffService } from '../services/HandoffService';
import { handoffSchema } from '../schemas/handoffSchema';

const handoffService = new HandoffService();

export const generateMembershipPacket = functions.region('us-west1').https.onCall(async (data, context) => {
  // Security: Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  // Validation: Zod
  const validationResult = handoffSchema.safeParse(data);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    throw new functions.https.HttpsError('invalid-argument', errorMessage);
  }

  const { chamberId } = validationResult.data;
  const callerChamberId = context.auth.token.chamber_id;

  // Service Call
  return await handoffService.generateMembershipPacket(chamberId, context.auth.uid, callerChamberId);
});
