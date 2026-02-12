"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationSchema = void 0;
const zod_1 = require("zod");
exports.verificationSchema = zod_1.z.object({
    chamberId: zod_1.z.string().min(1, "Chamber ID is required"),
});
//# sourceMappingURL=verificationSchema.js.map