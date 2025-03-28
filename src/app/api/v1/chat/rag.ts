import { openai } from "./openaiClient";
import { createCompletion, createStreamingCompletion } from "./chat";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
});

// 🔹 ฟังก์ชันปกติ: รวม context + ตอบทีเดียว
export const queryWithContext = async (
    message: string,
    modelName?: string
): Promise<string> => {
    try {
        const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: message,
        });

        const queryVector = embeddingRes.data[0].embedding;

        const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        const queryResult = await index.query({
            vector: queryVector,
            topK: 5,
            includeMetadata: true,
        });

        const contexts = queryResult.matches
            ?.map((match) => match.metadata?.text || "")
            .join("\n---\n");

        const prompt = `คุณจะได้รับ context ด้านล่าง ใช้ข้อมูลนี้ในการตอบคำถามให้ครบถ้วน

Context:
${contexts}

คำถามของผู้ใช้:
${message}
`;

        return await createCompletion(prompt, modelName);
    } catch (err) {
        console.error("❌ Failed to generate answer with context:", err);
        throw err;
    }
};

// 🔹 แบบ streaming: รวม context + ตอบเป็น chunk
export const streamWithContext = async (
    message: string,
    onChunk: (chunk: string) => void,
    modelName?: string
): Promise<void> => {
    try {
        const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: message,
        });

        const queryVector = embeddingRes.data[0].embedding;

        const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        const queryResult = await index.query({
            vector: queryVector,
            topK: 5,
            includeMetadata: true,
        });

        const contexts = queryResult.matches
            ?.map((match) => match.metadata?.text || "")
            .join("\n---\n");

        const prompt = `คุณจะได้รับ context ด้านล่าง ใช้ข้อมูลนี้ในการตอบคำถามให้ครบถ้วน

Context:
${contexts}

คำถามของผู้ใช้:
${message}
`;

        await createStreamingCompletion(prompt, onChunk, modelName);
    } catch (err) {
        console.error("❌ Failed to stream answer with context:", err);
        throw err;
    }
};
