import { openai } from "./openaiClient";

const defaultModelName: string = "meta-llama/llama-3.3-70b-instruct:free";
const temperature: number = process.env.MODEL_TEMPERATURE
    ? parseFloat(process.env.MODEL_TEMPERATURE)
    : 0.0;
const maxToken: number = process.env.MODEL_MAX_TOKEN
    ? parseInt(process.env.MODEL_MAX_TOKEN)
    : 150;

// 🔹 Non-stream แบบตอบทีเดียว
export const createCompletion = async (
    message: string,
    modelName?: string
): Promise<string> => {
    const chosenModel = modelName || defaultModelName;

    if (
        chosenModel === process.env.LLM_MODEL_ID ||
        chosenModel === process.env.DEEPSEEK_MODEL_ID
    ) {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: process.env.MODEL_SYSTEM_PROMPT || "" },
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

// 🔹 Streaming แบบ chunk จริง (ส่งทุก 10 ตัวอักษร)
export const createStreamingCompletion = async (
    message: string,
    onChunk: (chunk: string) => void,
    modelName?: string,
    chunkSize: number = 10 // ขนาด chunk ที่ต้องการ
): Promise<void> => {
    const chosenModel = modelName || defaultModelName;

    if (
        chosenModel === process.env.LLM_MODEL_ID ||
        chosenModel === process.env.DEEPSEEK_MODEL_ID
    ) {
        const stream = await openai.chat.completions.create({
            messages: [
                { role: "system", content: process.env.MODEL_SYSTEM_PROMPT || "" },
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

        // ส่งส่วนที่เหลือ
        if (buffer.length > 0) {
            onChunk(buffer);
        }
    } else {
        throw new Error("Model not found");
    }
};
