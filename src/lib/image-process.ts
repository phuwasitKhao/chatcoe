import { Document } from "@langchain/core/documents";
import axios from "axios";
import { createWorker } from 'tesseract.js';

export async function getTextFromImage(imageUrl: string): Promise<string> {
  try {
    // ดาวน์โหลดรูปภาพ
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    
    // ใช้ Tesseract.js สำหรับ OCR
    const worker = await createWorker('tha+eng'); // รองรับทั้งภาษาไทยและอังกฤษ
    const { data } = await worker.recognize(imageBuffer);
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to process image");
  }
}

export async function createDocumentsFromImages(imageUrls: string[]): Promise<Document[]> {
  const documents: Document[] = [];
  
  for (const url of imageUrls) {
    try {
      const text = await getTextFromImage(url);
      if (text.trim()) {
        documents.push(
          new Document({
            pageContent: text,
            metadata: {
              source: url,
              type: 'image'
            }
          })
        );
      }
    } catch (error) {
      console.error(`Error processing image ${url}:`, error);
    }
  }
  
  return documents;
}