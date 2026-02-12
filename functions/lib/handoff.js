"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMembershipPacket = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const pdf_lib_1 = require("pdf-lib");
const crypto = require("crypto");
/**
 * generateMembershipPacket
 *
 * Generates an immutable, salted PDF snapshot of the chamber's current state.
 *
 * Input: { chamberId: string }
 * Security: Caller must have 'chamber_id' custom claim matching the input.
 */
exports.generateMembershipPacket = functions.https.onCall(async (data, context) => {
    // Security 1 verification mechanism is implicitly handled here by checking the context
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }
    const { chamberId } = data;
    const callerChamberId = context.auth.token.chamber_id;
    if (!chamberId || chamberId !== callerChamberId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not authorized to access this chamber\'s data.');
    }
    try {
        // 1. Fetch Data
        const db = admin.firestore();
        const chamberDoc = await db.collection('organizations').doc(chamberId).get();
        const chamberData = chamberDoc.data() || {};
        // Fetch members (example subcollection or query)
        // MVP: Just snapshot the Chamber Metadata + stats
        const memberCountSnap = await db.collection('organizations').doc(chamberId).collection('members').count().get();
        const memberCount = memberCountSnap.data().count;
        // 2. Generate PDF
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage();
        const { height } = page.getSize();
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const fontSize = 20;
        page.drawText('Official Membership Packet', {
            x: 50,
            y: height - 50,
            size: fontSize,
            font: font,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText(`Chamber: ${chamberData.name || 'Unknown'}`, { x: 50, y: height - 100, size: 12, font });
        page.drawText(`Region: ${chamberData.region || 'Unknown'}`, { x: 50, y: height - 120, size: 12, font });
        page.drawText(`Member Count: ${memberCount}`, { x: 50, y: height - 140, size: 12, font });
        page.drawText(`Generated: ${new Date().toISOString()}`, { x: 50, y: height - 160, size: 12, font });
        // 3. Salt & Hash
        const pdfBytes = await pdfDoc.save();
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.createHmac('sha256', salt).update(Buffer.from(pdfBytes)).digest('hex');
        // Append hash/salt to a metadata page or logs (for now, just log it)
        console.log(`Packet Generated. Salt: ${salt}, Hash: ${hash}`);
        // 4. Upload to Secure Storage
        const bucketName = process.env.SECURE_HANDOFF_BUCKET || 'secure-handoff-bucket';
        const bucket = admin.storage().bucket(bucketName);
        const filename = `packets/${chamberId}_${Date.now()}.pdf`;
        const file = bucket.file(filename);
        await file.save(Buffer.from(pdfBytes), {
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    salt: salt,
                    hash: hash,
                    generator: context.auth.uid
                }
            }
        });
        // 5. Generate Signed URL
        // Allow 15 minute access
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000
        });
        return {
            downloadUrl: url,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            hash: hash // Return hash so client can verify integrity if they want
        };
    }
    catch (error) {
        console.error('Error generating packet:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate membership packet.');
    }
});
//# sourceMappingURL=handoff.js.map