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
exports.evaluateChamber = void 0;
const functions = __importStar(require("firebase-functions"));
const genai_1 = require("@google/genai");
// Initialize GenAI with the API key from environment configuration
// Ensure you set this with: firebase functions:config:set gemini.key="YOUR_KEY"
// Or use request.secrets if using Cloud Secret Manager
const API_KEY = process.env.GEMINI_API_KEY || '';
// We can instantiate this outside the handler for potential cold-start reuse
// providing the key is available at this scope. If using secrets, 
// initialization might need to happen inside the handler.
// For simple env vars, this is fine.
const genAI = new genai_1.GoogleGenAI({ apiKey: API_KEY });
const modelName = 'gemini-2.0-flash';
exports.evaluateChamber = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check (Optional but recommended)
    // if (!context.auth) {
    //   throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    // }
    var _a, _b, _c, _d;
    const { chamber, userContext } = data;
    if (!chamber || !chamber.name) {
        throw new functions.https.HttpsError('invalid-argument', 'Chamber data with a name is required.');
    }
    console.log(`[BoardRoom] Evaluating chamber: ${chamber.name}`);
    const prompt = `
    You are the "Board Room", a simulation of 5 expert advisors helping a business owner decide whether to join a Chamber of Commerce.
    
    **The Opportunity**:
    Chamber: ${chamber.name}
    Region: ${chamber.region || 'Unknown'}
    Description: ${chamber.description || 'No description provided.'}
    Tags: ${(chamber.industryTags || []).join(', ')}
    Tiers: ${JSON.stringify(chamber.tiers || {})}
    
    **The User Context**:
    ${userContext || "A local business owner considering membership for growth and networking."}

    **The Personas**:
    1. 🏛️ **Board Chair**: Focus on long-term vision, credibility, reputation.
    2. 🏪 **Local Business Owner**: Focus on ROI, leads, immediate value.
    3. 🏨 **Hospitality Rep**: Focus on tourism, events, visitor traffic.
    4. 🏗️ **Real Estate Developer**: Focus on growth, policy, zoning, economic development.
    5. 🏦 **Banker/Financier**: Focus on fiscal health, stability, high-net-worth networking.

    **Task**:
    Analyze this opportunity from EACH persona's unique perspective. 
    - Be critical but fair. 
    - If the chamber seems generic or low-value, point it out.
    - If it seems prestigious and strategic, highlight that.
    
    Return a STRICT JSON object with the following structure:
    {
      "consensus": "Buy" | "Wait" | "Pass",
      "messages": [
        {
          "persona": "Board Chair", // Exact name
          "icon": "🏛️",
          "message": "Advice string (max 2 sentences)",
          "sentiment": "positive" | "negative" | "neutral",
          "keyQuestion": "The specific question this persona asks the user"
        },
        ... (for all 5 personas)
      ]
    }
  `;
    try {
        const result = await genAI.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        consensus: { type: genai_1.Type.STRING, enum: ["Buy", "Wait", "Pass"] },
                        messages: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    persona: { type: genai_1.Type.STRING },
                                    icon: { type: genai_1.Type.STRING },
                                    message: { type: genai_1.Type.STRING },
                                    sentiment: { type: genai_1.Type.STRING, enum: ["positive", "negative", "neutral"] },
                                    keyQuestion: { type: genai_1.Type.STRING }
                                },
                                required: ["persona", "icon", "message", "sentiment", "keyQuestion"]
                            }
                        }
                    },
                    required: ["consensus", "messages"]
                }
            }
        });
        // Handle potential type mismatches or SDK version differences
        // The SDK types might differ from runtime behavior, so we safely casting to any.
        const resultAny = result;
        // Check if result itself has candidates (new SDK behavior) or if it has .response property (old SDK)
        const responseRoot = resultAny.response || resultAny;
        let responseText;
        try {
            if (typeof responseRoot.text === 'function') {
                responseText = responseRoot.text();
            }
            else if (responseRoot.candidates && responseRoot.candidates.length > 0) {
                responseText = (_d = (_c = (_b = (_a = responseRoot.candidates[0]) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.parts) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.text;
            }
        }
        catch (e) {
            console.warn("Error extracting text from response", e);
        }
        if (!responseText) {
            // Fallback: try accessing top-level text property if it exists directly on result
            if (typeof responseRoot === 'string') {
                responseText = responseRoot;
            }
        }
        if (!responseText) {
            throw new Error("Empty response from AI");
        }
        let cleanText = responseText.trim();
        // Remove markdown code fences if present, e.g. ```json ... ```
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
        }
        const evaluation = JSON.parse(cleanText);
        return evaluation;
    }
    catch (error) {
        console.error('[BoardRoom] Generation failed:', error);
        throw new functions.https.HttpsError('internal', 'AI generation failed', error);
    }
});
//# sourceMappingURL=boardRoomController.js.map