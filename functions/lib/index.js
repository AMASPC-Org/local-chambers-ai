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
exports.chatWithGuide = exports.onOrganizationWrite = exports.verifyChamberClaim = exports.generateMembershipPacket = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK if not already done
if (!admin.apps.length) {
    admin.initializeApp();
}
var handoffController_1 = require("./controllers/handoffController");
Object.defineProperty(exports, "generateMembershipPacket", { enumerable: true, get: function () { return handoffController_1.generateMembershipPacket; } });
var verificationController_1 = require("./controllers/verificationController");
Object.defineProperty(exports, "verifyChamberClaim", { enumerable: true, get: function () { return verificationController_1.verifyChamberClaim; } });
var publicListingsController_1 = require("./controllers/publicListingsController");
Object.defineProperty(exports, "onOrganizationWrite", { enumerable: true, get: function () { return publicListingsController_1.onOrganizationWrite; } });
var chamberGuideController_1 = require("./controllers/chamberGuideController");
Object.defineProperty(exports, "chatWithGuide", { enumerable: true, get: function () { return chamberGuideController_1.chatWithGuide; } });
//# sourceMappingURL=index.js.map