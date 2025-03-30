import { uploadTextsToPinecone } from "./utils/uploadToPinecone";

const documents = [
    "การเรียนรู้ของเครื่องคือการทำให้คอมพิวเตอร์สามารถเรียนรู้จากข้อมูลได้",
    "Pinecone คือฐานข้อมูลเวกเตอร์ที่เหมาะกับการค้นหาแบบใกล้เคียง (semantic search)",
    "OpenAI มีโมเดลสำหรับสร้างข้อความและสร้าง embedding",
];

uploadTextsToPinecone(documents);
