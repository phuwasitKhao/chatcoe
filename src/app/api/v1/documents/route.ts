import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const documents = await DocumentModel.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงเอกสาร:", error);
    return NextResponse.json(
      {
        error: "การดึงเอกสารล้มเหลว",
        details: error.message,
      },
      { status: 500 }
    );
  }
}