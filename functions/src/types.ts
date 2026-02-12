/**
 * Local type definitions for Cloud Functions.
 * Duplicated from src/types.ts to avoid cross-directory imports
 * that break the functions build output layout.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  chamberId?: string;
}

export interface ChatResponse {
  reply: string;
  suggestedAction?: string;
}
