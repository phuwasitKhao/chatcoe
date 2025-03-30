// app/api/v1/documents/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { createDocumentsFromImages } from "@/lib/image-process";
import { getPineconeClient } from "@/lib/pinecone-client";
import { embedAndStoreDocs } from "@/lib/vector-store";
import connectDB from '@/lib/mongodb';
import DocumentModel from "@/models/Document";

export async function POST(req: NextRequest) {
  try {
    const { documentId, urls, fileTypes, userId = "anonymous" } = await req.json();
    console.log("Processing document:", { documentId, urls, fileTypes });
    
    if (!urls || urls.length === 0) {
      return NextResponse.json({ 
        error: "No URLs provided",
        status: "error" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    const client = await getPineconeClient();
    console.log("Pinecone client initialized");
    
    let allDocs = [];
    let processingStatus = "indexed";
    
    // try {
    //   for (let i = 0; i < urls.length; i++) {
    //     const url = urls[i];
    //     const fileType = fileTypes[i];
    //     console.log(`Processing ${fileType} file: ${url}`);
        
    //     if (fileType === 'pdf') {
    //       console.log("Getting chunked docs from PDF");
    //       const chunks = await getChunkedDocsFromPDF({
    //         type: "url",
    //         source: url,
    //       });
    //       console.log(`PDF processed, got ${chunks.length} chunks`);
    //       allDocs = [...allDocs, ...chunks];
    //     } else if (fileType === 'image') {
    //       console.log("Creating documents from images");
    //       const imageDoc = await createDocumentsFromImages([url]);
    //       console.log(`Image processed, got ${imageDoc.length} documents`);
    //       allDocs = [...allDocs, ...imageDoc];
    //     }
    //   }
      
    //   if (allDocs.length > 0) {
    //     console.log(`Creating embeddings for ${allDocs.length} chunks`);
    //     // สร้าง embeddings และเก็บใน vector store
    //     await embedAndStoreDocs(client, allDocs);
    //     console.log("Embeddings created and stored in Pinecone");
    //   } else {
    //     console.warn("No documents to process");
    //     processingStatus = "failed";
    //   }
    // } catch (error) {
    //   console.error("Error processing documents:", error);
    //   processingStatus = "failed";
    // }
    const docs = await getChunkedDocsFromPDF({
      type: "url",
      source: urls[0],
    })

    console.log("DOC" , docs[0])

    await embedAndStoreDocs(client, docs) 


    console.log("URLs to process:", urls);

    if (documentId) {
      try {
        const updatedDoc = await DocumentModel.findByIdAndUpdate(
          documentId,
          { 
            status: processingStatus,
            updatedAt: new Date()
          },
          { new: true }
        );
        console.log("Document status updated:", updatedDoc?.status);
      } catch (dbError) {
        console.error("Error updating document status:", dbError);
      }
    }
    
    return NextResponse.json({ 
      message: `ประมวลผลเอกสารเรียบร้อยแล้ว ${urls.length} ไฟล์`,
      status: processingStatus === "indexed" ? "success" : "error",
      documentId
    });
  } catch (error) {
    console.error("Unexpected error in document processing:", error);
    return NextResponse.json({ 
      error: "ไม่สามารถประมวลผลเอกสารได้",
      status: "error" 
    }, { status: 500 });
  }
}