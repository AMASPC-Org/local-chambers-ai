"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRequestSchema = void 0;
const zod_1 = require("zod");
const chatMessageSchema = zod_1.z.object({
    role: zod_1.z.enum(['user', 'assistant']),
    content: zod_1.z.string().min(1, 'Message content cannot be empty'),
    timestamp: zod_1.z.number(),
});
exports.chatRequestSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message is required').max(2000, 'Message too long'),
    history: zod_1.z.array(chatMessageSchema).max(50, 'History too long').default([]),
    chamberId: zod_1.z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid chamber ID format').optional(),
});
//# sourceMappingURL=chatRequestSchema.js.map