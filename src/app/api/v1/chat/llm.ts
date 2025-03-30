import { openai } from "./openaiClient";
import { retrieveContextFromData } from "./utils/retrieveFromPinecone";

const defaultModelName = "meta-llama/llama-3.3-70b-instruct:free";
const temperature = process.env.MODEL_TEMPERATURE
  ? parseFloat(process.env.MODEL_TEMPERATURE)
  : 0.0;
const maxToken = process.env.MODEL_MAX_TOKEN
  ? parseInt(process.env.MODEL_MAX_TOKEN)
  : 150;

export const createCompletion = async (
  message: string,
  modelName?: string
): Promise<string> => {
  const chosenModel = modelName || defaultModelName;

  if (
    chosenModel === process.env.LLM_MODEL_ID ||
    chosenModel === process.env.DEEPSEEK_MODEL_ID
  ) {
    const context = await retrieveContextFromData(message);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: process.env.MODEL_SYSTEM_PROMPT || "" },
        { role: "system", content: `ข้อมูลประกอบ:\n${context}` },
        { role: "user", content: message },
      ],
      model: chosenModel,
      temperature,
      max_tokens: maxToken,
    });

    return completion.choices[0].message.content || "";
  } else {
    return "Model not found";
  }
};

export const createStreamingCompletion = async (
  message: string,
  onChunk: (chunk: string) => void,
  modelName?: string,
  chunkSize: number = 10
): Promise<void> => {
  const chosenModel = modelName || defaultModelName;

  if (
    chosenModel === process.env.LLM_MODEL_ID ||
    chosenModel === process.env.DEEPSEEK_MODEL_ID
  ) {
    const context = await retrieveContextFromData(message);

    const stream = await openai.chat.completions.create({
      messages: [
        { role: "system", content: process.env.MODEL_SYSTEM_PROMPT || "" },
        { role: "system", content: `ข้อมูลประกอบ:\n${context}` },
        { role: "user", content: message },
      ],
      model: chosenModel,
      temperature,
      max_tokens: maxToken,
      stream: true,
    });

    let buffer = "";

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        buffer += content;

        if (buffer.length >= chunkSize) {
          onChunk(buffer);
          buffer = "";
        }
      }
    }

    if (buffer.length > 0) {
      onChunk(buffer);
    }
  } else {
    throw new Error("Model not found");
  }
};
