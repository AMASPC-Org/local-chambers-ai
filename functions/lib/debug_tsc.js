"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
const genAI = new genai_1.GoogleGenAI({ apiKey: "test" });
async function test() {
    const result = await genAI.models.generateContent({ model: "gemini-2.0-flash", contents: "test" });
    const responseAny = result.response;
    console.log(responseAny);
}
//# sourceMappingURL=debug_tsc.js.map