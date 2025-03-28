import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { ingestFile } from "./ingest";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
});

export const embedAndStore = async (text: string, id: string) => {
    try {
        const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });

        const vector = embeddingRes.data[0].embedding;
        const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || "");

        await index.upsert([
            {
                id,
                values: vector,
                metadata: { text },
            },
        ]);

        console.log(`✅ Upserted ID: ${id}`);
    } catch (error) {
        console.error("❌ Error during embedding/upsert:", error);
    }
};

const run = async () => {
    try {
        await ingestFile("./qa.csv"); // เปลี่ยนชื่อไฟล์ให้ตรงของคุณ
    } catch (err) {
        console.error("❌ Ingestion failed:", err);
    }
};
run();
