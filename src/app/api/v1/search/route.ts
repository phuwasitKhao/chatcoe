// app/api/v1/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getPineconeClient } from "@/lib/pinecone-client";
import { PineconeStore } from "@langchain/pinecone";
import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

export async function POST(req: NextRequest) {
  try {
    const { query, filters = {}, limit = 5 } = await req.json();
    
    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    
    console.log(`Searching for: "${query}"`);
    
    // สร้าง embedding จากคำค้นหา
    const embeddings = new OpenAIEmbeddings();
    const client = await getPineconeClient();
    const index = client.Index(process.env.PINECONE_INDEX_NAME || "your-index-name");
    
    // สร้าง vector store
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });
    
    // ค้นหาเอกสารที่เกี่ยวข้อง
    const results = await vectorStore.similaritySearch(query, limit, filters);
    
    // ดึงข้อมูลเอกสารต้นฉบับจาก MongoDB
    await connectDB();
    const documentIds = [...new Set(results.map(r => r.metadata.documentId))];
    const documents = await DocumentModel.find({ _id: { $in: documentIds } });
    
    // รวมข้อมูล
    const enrichedResults = results.map(result => {
      const sourceDoc = documents.find(d => d._id.toString() === result.metadata.documentId);
      return {
        content: result.pageContent,
        score: result.metadata.score,
        document: sourceDoc ? {
          id: sourceDoc._id,
          filename: sourceDoc.filename,
          type: sourceDoc.type,
          url: sourceDoc.url
        } : null,
        metadata: result.metadata
      };
    });
    
    return NextResponse.json({
      results: enrichedResults,
      query,
      totalChunks: results.length
    });
  } catch (error) {
    console.error("Error searching documents:", error);
    return NextResponse.json({ 
      error: "Failed to search documents",
      details: error.message 
    }, { status: 500 });
  }
}