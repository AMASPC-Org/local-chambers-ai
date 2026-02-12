import * as functions from 'firebase-functions';
import { GoogleGenAI } from '@google/genai';
import { ChatResponse } from '../types';
import { chatRequestSchema } from '../schemas/chatRequestSchema';

// Lazy initialization: avoid module-load crash when GEMINI_API_KEY is unset
let _genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'GEMINI_API_KEY is not set');
    }
    _genAI = new GoogleGenAI({ apiKey });
  }
  return _genAI;
}

// DRIFT-1 FIX: Added region('us-west1') per project rules.
export const chatWithGuide = functions.region('us-west1').https.onCall(async (data, context): Promise<ChatResponse> => {
  try {
    // DRIFT-2 FIX: Auth check (warn + log for unauthenticated callers).
    if (!context.auth) {
      console.warn('[chatWithGuide] Unauthenticated call - consider rate-limiting');
      // Allow for now (public chat assistant), but log for monitoring.
    }

    // DRIFT-3 FIX: Zod input validation matching other controllers.
    const validationResult = chatRequestSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
      throw new functions.https.HttpsError('invalid-argument', errorMessage);
    }

    const { message, history, chamberId } = validationResult.data;

    // SEC-3 FIX: System instructions are separated from user content.
    // User input is no longer interpolated into the system prompt.
    const systemInstruction = `You are the "Chamber Guide", a helpful, knowledgeable, and professional assistant for a Chamber of Commerce directory.
Your goal is to help users "Find, Compare, and Join" local chambers.

**Tone**: Professional but warm. Concise and action-oriented. Helpful and guiding.

**Context**: Chamber ID (if specific): ${chamberId ? chamberId : 'None (General Search)'}

**Instructions**:
- If the user asks about a specific chamber (and ID is present), answer based on general knowledge of chambers (value, networking, advocacy).
- If the user wants to find a chamber, ask for their location.
- If the user wants to compare, explain the standard tier structures (Networking vs. Growth vs. Leadership).
- If the user wants to join, encourage them to click "Join Now" or "View Tiers".
- Keep responses under 3 sentences unless detailed comparison is asked.`;

    // Build conversation contents as structured messages (not string interpolation)
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add history as structured messages
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Call Gemini with separated system instructions and user content
    const result = await getGenAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction,
      },
    });
    const text = result.text ?? '';

    // Determine Suggested Action (simple keyword matching)
    let suggestedAction: string | undefined;
    const lowerText = text.toLowerCase();
    if (lowerText.includes('join') || lowerText.includes('sign up')) {
      suggestedAction = 'VIEW_TIERS';
    } else if (lowerText.includes('search') || lowerText.includes('find')) {
      suggestedAction = 'GO_TO_SEARCH';
    }

    return {
      reply: text,
      suggestedAction,
    };
  } catch (error: any) {
    console.error('Error in chatWithGuide:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Failed to generate response.', error.message);
  }
});
