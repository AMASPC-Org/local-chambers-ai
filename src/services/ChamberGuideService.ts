
import { httpsCallable } from 'firebase/functions';
import { functions } from '../agents/CloudAgent';
import { ChatRequest, ChatResponse, ChatMessage } from '../types';

export const chamberGuideService = {
  async chatWithGuide(message: string, history: ChatMessage[], chamberId?: string): Promise<ChatResponse> {
    try {
      const chatFunction = httpsCallable<ChatRequest, ChatResponse>(functions, 'chatWithGuide');
      const result = await chatFunction({
        message,
        history,
        chamberId
      });
      return result.data;
    } catch (error: any) {
      console.error('Error calling chatWithGuide:', error);
      // Fallback response if the service is down or errors
      return {
        reply: "I'm having trouble connecting to the chamber network right now. Please try again in a moment.",
        suggestedAction: undefined
      };
    }
  }
};
