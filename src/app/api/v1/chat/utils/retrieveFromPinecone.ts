// src/api/v1/chat/utils/retrieveFromPinecone.ts
import { Pinecone } from '@pinecone-database/pinecone'

import pinecone from "./pineconeClient"; // default import ถูกต้อง
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function retrieveContextFromData(
    query: string,
    namespace = "default"
): Promise<string> {
    try {
        // ✅ Ensure Pinecone is initialized (เฉพาะถ้ายังไม่ได้ init ที่อื่น)
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });

        const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

        // 🔍 Embed query
        const embeddingResponse = await openai.embeddings.create({
            input: query,
            model: "text-embedding-3-small",
        });

        const vector = embeddingResponse.data[0].embedding;

        // 🔍 ค้นหาข้อมูลจาก Pinecone
        const result = await index.query({
            vector,
            topK: 3,
            includeMetadata: true,
        });

        const texts = result.matches
            ?.map((m) => m.metadata?.text)
            .filter(Boolean);

        return texts?.join("\n---\n") || "ไม่พบข้อมูลที่เกี่ยวข้อง";
    } catch (err: any) {
        console.error("🔴 retrieveContextFromData error:", err?.message || err);
        return "เกิดข้อผิดพลาดในการค้นหาข้อมูลจาก Pinecone หรือฝั่ง Embedding";
    }
}
