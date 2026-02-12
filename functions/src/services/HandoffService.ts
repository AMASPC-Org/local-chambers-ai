import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as functions from 'firebase-functions';

export class HandoffService {
  private db = admin.firestore();
  private storage = admin.storage();

  async generateMembershipPacket(chamberId: string, userId: string, userChamberClaim?: string): Promise<{ downloadUrl: string; expiresAt: string; hash: string }> {
    // Security Check
    if (!userChamberClaim || userChamberClaim !== chamberId) {
      throw new functions.https.HttpsError('permission-denied', 'You are not authorized to access this chamber\'s data.');
    }

    try {
      // 1. Fetch Data
      const chamberDoc = await this.db.collection('organizations').doc(chamberId).get();
      const chamberData = chamberDoc.data() || {};

      const memberCountSnap = await this.db.collection('organizations').doc(chamberId).collection('members').count().get();
      const memberCount = memberCountSnap.data().count;

      // 2. Generate PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 20;

      page.drawText('Official Membership Packet', {
        x: 50,
        y: height - 50,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Chamber: ${chamberData.name || 'Unknown'}`, { x: 50, y: height - 100, size: 12, font });
      page.drawText(`Region: ${chamberData.region || 'Unknown'}`, { x: 50, y: height - 120, size: 12, font });
      page.drawText(`Member Count: ${memberCount}`, { x: 50, y: height - 140, size: 12, font });
      page.drawText(`Generated: ${new Date().toISOString()}`, { x: 50, y: height - 160, size: 12, font });

      // 3. Salt & Hash
      const pdfBytes = await pdfDoc.save();
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.createHmac('sha256', salt).update(Buffer.from(pdfBytes)).digest('hex');

      functions.logger.info(`Packet Generated. Salt: ${salt}, Hash: ${hash}`);

      // 4. Upload to Secure Storage
      const bucketName = process.env.SECURE_HANDOFF_BUCKET || 'secure-handoff-bucket';
      const bucket = this.storage.bucket(bucketName);
      const filename = `packets/${chamberId}_${Date.now()}.pdf`;
      const file = bucket.file(filename);

      await file.save(Buffer.from(pdfBytes), {
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            salt: salt,
            hash: hash,
            generator: userId
          }
        }
      });

      // 5. Generate Signed URL (15 min)
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000
      });

      return {
        downloadUrl: url,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        hash: hash
      };

    } catch (error: any) {
      functions.logger.error('Error generating packet:', error);
      throw new functions.https.HttpsError('internal', 'Failed to generate membership packet.');
    }
  }
}
