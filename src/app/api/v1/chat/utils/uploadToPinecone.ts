// src/api/v1/chat/utils/uploadTextsToPinecone.ts

import { OpenAI } from "openai";
import pinecone from "./pineconeClient";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function uploadTextsToPinecone(
    texts: string[],
    namespace = "default"
) {
    // 🔹 Ensure Pinecone is initialized (ถ้าใช้ PineconeClient แบบใหม่)
    await pinecone.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    for (let i = 0; i < texts.length; i++) {
        const input = texts[i];

        const embeddingResponse = await openai.embeddings.create({
            input,
            model: "text-embedding-3-small",
        });

        const vector = embeddingResponse.data[0].embedding;

        await index.upsert([
            {
                id: `doc-${i}`,
                values: vector,
                metadata: { text: input },
            },
        ], namespace);
    }

    console.log(`✅ Uploaded ${texts.length} documents to Pinecone.`);
}
