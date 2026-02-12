import { z } from 'zod';

export const handoffSchema = z.object({
  chamberId: z.string().min(1, "Chamber ID is required"),
});

export type HandoffInput = z.infer<typeof handoffSchema>;
