import { z } from 'zod';

export const verificationSchema = z.object({
  chamberId: z.string().min(1, "Chamber ID is required"),
});

export type VerificationInput = z.infer<typeof verificationSchema>;
