import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone-client";
import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    console.log("เริ่มกระบวนการอัปโหลดไฟล์");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;
    const uploadedBy = formData.get("uploadedBy") as string || "anonymous";

    if (!file && !url) {
      return NextResponse.json({ error: "ไม่พบไฟล์หรือ URL" }, { status: 400 });
    }

    // เชื่อมต่อฐานข้อมูล
    await connectDB();
    console.log("เชื่อมต่อ MongoDB สำเร็จ");

    let docs: Document[] = [];
    let fileType: string;
    let fileName: string;
    let fileSize: number = 0;

    // บันทึกเอกสารในฐานข้อมูลเบื้องต้น
    if (file) {
      // ตรวจสอบประเภทไฟล์
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      fileType =
        fileExtension === 'pdf' ? 'pdf' :
          ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension) ? 'image' :
            ['doc', 'docx'].includes(fileExtension) ? 'docx' :
              ['txt', 'text'].includes(fileExtension) ? 'txt' :
                'unknown';
      
      fileName = file.name;
      fileSize = file.size;

      // ตรวจสอบขนาดไฟล์ (10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json({
          error: "ขนาดไฟล์เกิน 10MB"
        }, { status: 400 });
      }
    } else if (url) {
      // ตรวจสอบประเภทของ URL
      if (url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
        fileType = 'image';
      } else if (url.match(/\.pdf$/i)) {
        fileType = 'pdf';
      } else {
        fileType = 'url';
      }
      fileName = url.split('/').pop() || url;
    } else {
      return NextResponse.json({ error: "ไม่พบไฟล์หรือ URL" }, { status: 400 });
    }

    // บันทึกข้อมูลเอกสารลงฐานข้อมูล
    const newDocument = new DocumentModel({
      filename: fileName,
      url: url || `/documents/${fileName}`,
      type: fileType,
      size: fileSize,
      uploadedBy: uploadedBy,
      status: "processing",
    });

    const savedDoc = await newDocument.save();
    console.log(`บันทึกเอกสารลง MongoDB ด้วย ID: ${savedDoc._id}`);

    try {
      // ประมวลผลตามประเภทของไฟล์
      if (file) {
        switch (fileType) {
          case 'pdf': {
            const bytes = await file.arrayBuffer();
            const pdfBlob = new Blob([bytes], { type: "application/pdf" });
            const loader = new WebPDFLoader(pdfBlob);
            const rawDocs = await loader.load();

            const textSplitter = new RecursiveCharacterTextSplitter({
              chunkSize: 1000,
              chunkOverlap: 200,
            });
            docs = await textSplitter.splitDocuments(rawDocs);
            break;
          }
          case 'image': {
            const bytes = await file.arrayBuffer();
            const imageBuffer = Buffer.from(bytes);

            // OCR ด้วย Tesseract (รองรับภาษาไทยและอังกฤษ)
            const worker = await createWorker('tha+eng');
            const { data } = await worker.recognize(imageBuffer);
            await worker.terminate();

            docs = [
              new Document({
                pageContent: data.text,
                metadata: {
                  filename: file.name,
                  source: savedDoc._id.toString(),
                  type: 'image'
                }
              })
            ];
            break;
          }
          case 'docx': {
            const bytes = await file.arrayBuffer();
            const result = await mammoth.extractRawText({
              buffer: Buffer.from(bytes)
            });

            const textSplitter = new RecursiveCharacterTextSplitter({
              chunkSize: 1000,
              chunkOverlap: 200,
            });
            docs = await textSplitter.createDocuments([result.value]);
            break;
          }
          case 'txt': {
            const text = await file.text();
            const textSplitter = new RecursiveCharacterTextSplitter({
              chunkSize: 1000,
              chunkOverlap: 200,
            });
            docs = await textSplitter.createDocuments([text]);
            break;
          }
          default: {
            throw new Error(`ประเภทไฟล์ไม่รองรับ: ${fileType}`);
          }
        }
      } else if (url) {
        // ประมวลผล URL
        if (fileType === 'image') {
          // ดาวน์โหลดรูปภาพและทำ OCR
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data);
          
          const worker = await createWorker('tha+eng');
          const { data } = await worker.recognize(imageBuffer);
          await worker.terminate();
          
          docs = [
            new Document({
              pageContent: data.text,
              metadata: {
                filename: fileName,
                source: savedDoc._id.toString(),
                type: 'image',
                url: url
              }
            })
          ];
        } else if (fileType === 'pdf') {
          // ดาวน์โหลด PDF และประมวลผล
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const pdfBlob = new Blob([response.data], { type: "application/pdf" });
          const loader = new WebPDFLoader(pdfBlob);
          const rawDocs = await loader.load();

          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
          });
          docs = await textSplitter.splitDocuments(rawDocs);
        } else {
          // สำหรับ URL ทั่วไป ใช้ axios ดึงเนื้อหา
          try {
            const response = await axios.get(url);
            let content = '';
            
            if (typeof response.data === 'string') {
              content = response.data;
            } else {
              content = JSON.stringify(response.data);
            }
            
            const textSplitter = new RecursiveCharacterTextSplitter({
              chunkSize: 1000,
              chunkOverlap: 200,
            });
            docs = await textSplitter.createDocuments([content]);
          } catch (error) {
            console.error("เกิดข้อผิดพลาดในการดึงข้อมูลจาก URL:", error);
            throw new Error(`ไม่สามารถดึงข้อมูลจาก URL ได้`);
          }
        }
      }

      // สร้าง embeddings และบันทึกลง Pinecone
      if (docs.length > 0) {
        console.log("สร้าง embeddings และบันทึกลง Pinecone");
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const client = await getPineconeClient();
        console.log("เชื่อมต่อ Pinecone สำเร็จ");

        const index = client.Index(process.env.PINECONE_INDEX_NAME || "your-index-name");

        // เพิ่ม document ID ใน metadata
        docs = docs.map(doc => {
          doc.metadata.documentId = savedDoc._id.toString();
          return doc;
        });

        // บันทึกลง Pinecone
        await PineconeStore.fromDocuments(docs, embeddings, {
          pineconeIndex: index,
          textKey: "text",
          namespace: savedDoc._id.toString(),
        });
        console.log("บันทึก embeddings ลง Pinecone สำเร็จ");

        // อัปเดตสถานะเอกสาร
        savedDoc.status = "indexed";
        savedDoc.metadata = {
          pageCount: docs.length,
          processingTime: Date.now() - new Date(savedDoc.createdAt).getTime(),
        };
        await savedDoc.save();
        console.log("อัปเดตสถานะเอกสารเป็น 'indexed'");
      } else {
        throw new Error("ไม่สามารถสร้าง document chunks ได้");
      }
    } catch (processingError) {
      console.error("เกิดข้อผิดพลาดในการประมวลผลเอกสาร:", processingError);

      savedDoc.status = "failed";
      savedDoc.metadata = {
        error: processingError instanceof Error ? processingError.message : "ข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      };
      await savedDoc.save();
      console.log("อัปเดตสถานะเอกสารเป็น 'failed'");

      return NextResponse.json({
        error: "การประมวลผลเอกสารล้มเหลว",
        details: processingError instanceof Error ? processingError.message : "ข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      }, { status: 500 });
    }

    // ส่งการตอบกลับเมื่อสำเร็จ
    return NextResponse.json({
      success: true,
      message: "อัปโหลดและประมวลผลเอกสารสำเร็จ",
      document: {
        id: savedDoc._id.toString(),
        filename: savedDoc.filename,
        status: savedDoc.status,
        type: savedDoc.type,
      },
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดที่ไม่คาดคิดในกระบวนการอัปโหลด:", error);
    return NextResponse.json(
      {
        error: "การประมวลผลการอัปโหลดล้มเหลว",
        details: error.message,
      },
      { status: 500 }
    );
  }
}