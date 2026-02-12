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
exports.HandoffService = void 0;
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const pdf_lib_1 = require("pdf-lib");
const functions = __importStar(require("firebase-functions"));
class HandoffService {
    constructor() {
        this.db = admin.firestore();
        this.storage = admin.storage();
    }
    async generateMembershipPacket(chamberId, userId, userChamberClaim) {
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
        }
        catch (error) {
            functions.logger.error('Error generating packet:', error);
            throw new functions.https.HttpsError('internal', 'Failed to generate membership packet.');
        }
    }
}
exports.HandoffService = HandoffService;
//# sourceMappingURL=HandoffService.js.map