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
exports.verifyChamberClaim = void 0;
const functions = __importStar(require("firebase-functions"));
const VerificationService_1 = require("../services/VerificationService");
const verificationSchema_1 = require("../schemas/verificationSchema");
const verificationService = new VerificationService_1.VerificationService();
exports.verifyChamberClaim = functions.region('us-west1').https.onCall(async (data, context) => {
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
    const validationResult = verificationSchema_1.verificationSchema.safeParse(data);
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
        throw new functions.https.HttpsError('invalid-argument', errorMessage);
    }
    const { chamberId } = validationResult.data;
    // Service Call
    return await verificationService.verifyChamberClaim(chamberId, uid, userEmail);
});
//# sourceMappingURL=verificationController.js.map