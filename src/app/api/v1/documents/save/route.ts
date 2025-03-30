// app/api/v1/documents/save/route.ts (ใช้ route.ts ไม่ใช่ route.js)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

export async function POST(req: NextRequest) {
  try {
    const { filename, url, type, uploadedBy } = await req.json();
    
    console.log("Saving document to MongoDB:", { filename, url, type });
    
    await connectDB();
    
    const newDocument = new DocumentModel({
      filename,
      url,
      type: type || "pdf",
      uploadedBy: uploadedBy || "anonymous",
      status: "processing",
    });
    
    const savedDoc = await newDocument.save();
    console.log("Document saved:", savedDoc._id);
    
    return NextResponse.json({
      success: true,
      documentId: savedDoc._id.toString(),
      document: savedDoc
    });
  } catch (error) {
    console.error("Error saving document:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save document"
    }, { status: 500 });
  }
}