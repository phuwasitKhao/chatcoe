import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";

// ดึงรายการแชททั้งหมดของผู้ใช้
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const chats = await Chat.find({ ownerId: userId })
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// สร้างแชทใหม่
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { ownerId, title = 'New Chat' } = body;
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }
    
    const chat = new Chat({
      ownerId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
    
    await chat.save();
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}