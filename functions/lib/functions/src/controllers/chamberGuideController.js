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
exports.chatWithGuide = void 0;
const functions = __importStar(require("firebase-functions"));
const genai_1 = require("@google/genai");
const genAI = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
exports.chatWithGuide = functions.https.onCall(async (data, context) => {
    try {
        const { message, history, chamberId } = data;
        // 1. Validate Input
        if (!message) {
            throw new functions.https.HttpsError('invalid-argument', 'Message is required.');
        }
        // 2. Build System Prompt
        const systemPrompt = `
    You are the "Chamber Guide", a helpful, knowledgeable, and professional assistant for a Chamber of Commerce directory.
    Your goal is to help users "Find, Compare, and Join" local chambers.

    **Tone**:
    - Professional but warm.
    - Concise and action-oriented.
    - Helpful and guiding.

    **Context**:
    - User is asking: "${message}"
    - Chamber ID (if specific): ${chamberId || 'None (General Search)'}

    **Instructions**:
    - If the user asks about a specific chamber (and ID is present), answer based on general knowledge of chambers (value, networking, advocacy).
    - If the user wants to find a chamber, ask for their location.
    - If the user wants to compare, explain the standard tier structures (Networking vs. Growth vs. Leadership).
    - If the user wants to join, encourage them to click "Join Now" or "View Tiers".
    - Keep responses under 3 sentences unless detailed comparison is asked.
    `;
        // 3. Format History for Gemini (Simplified)
        // We map our strict 'system' | 'user' | 'assistant' to Gemini's expected roles if needed,
        // but for this simple implementation, we'll just append the history to the prompt 
        // or use a chat session if we were maintaining state. 
        // For a stateless Cloud Function, we'll construct a single prompt with history context.
        let fullPrompt = systemPrompt + "\n\n**Conversation History:**\n";
        history.forEach(msg => {
            fullPrompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
        });
        fullPrompt += `USER: ${message}\nASSISTANT:`;
        // 4. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        // 5. Determine Suggested Action (Simple keyword matching for now)
        let suggestedAction = undefined;
        const lowerText = text.toLowerCase();
        if (lowerText.includes('join') || lowerText.includes('sign up')) {
            suggestedAction = 'VIEW_TIERS';
        }
        else if (lowerText.includes('search') || lowerText.includes('find')) {
            suggestedAction = 'GO_TO_SEARCH';
        }
        return {
            reply: text,
            suggestedAction
        };
    }
    catch (error) {
        console.error('Error in chatWithGuide:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate response.', error.message);
    }
});
//# sourceMappingURL=chamberGuideController.js.map