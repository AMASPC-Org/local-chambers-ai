import * as admin from 'firebase-admin';

// Initialize Admin SDK if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

export { generateMembershipPacket } from './controllers/handoffController';
export { verifyChamberClaim } from './controllers/verificationController';
export { onOrganizationWrite } from './controllers/publicListingsController';
export { chatWithGuide } from './controllers/chamberGuideController';
