import { z } from 'zod';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
  timestamp: z.number(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  history: z.array(chatMessageSchema).max(50, 'History too long').default([]),
  chamberId: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid chamber ID format').optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
