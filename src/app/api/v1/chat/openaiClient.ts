import { OpenAI } from "openai";

export const openai = new OpenAI({
    baseURL: process.env.API_KEY_URL || "",
    apiKey: process.env.API_KEY_MODEL || "",
});
