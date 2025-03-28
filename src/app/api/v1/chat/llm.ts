import { OpenAI } from "openai";
// import dotenv from "dotenv";

// dotenv.config();
// import { processDocument } from "./proccessDocs";
const openai = new OpenAI({
  baseURL: process.env.API_KEY_URL ||"",
  apiKey: process.env.API_KEY_LLM || "",
});

const model_name: string = process.env.MODEL_ID || "";
const temperature: number = process.env.MODEL_TEMPERATURE
  ? parseFloat(process.env.MODEL_TEMPERATURE)
  : 0.0;
const maxToken: number = process.env.MODEL_MAX_TOKEN
  ? parseInt(process.env.MODEL_MAX_TOKEN)
  : 150;

export const createCompletion = async (message: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create(
      {
      messages: [
        { role: "system", content: process.env.MODEL_SYSTEM_PROMPT || "" },
        { role: "user", content: message },
      ],
      model: model_name,
      temperature: temperature,
      max_tokens: maxToken,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    throw new Error(`Completion failed: ${(error as Error).message}`);
    
  }
}

export const createStreamingCompletion = async (message: string) => {
  try {
    const stream = await openai.chat.completions.create({
      messages: [
        { role: "system", content: process.env.MODEL_SYSTEM_PROMPT || "" },
        { role: "user", content: message },
      ],
      model: model_name,
      temperature: temperature,
      max_tokens: maxToken,
      stream: true,
    });

    return stream;
  } catch (error) {
    throw new Error(`Completion failed: ${(error as Error).message}`);
  }
};