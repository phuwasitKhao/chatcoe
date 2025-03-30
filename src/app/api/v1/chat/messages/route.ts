// /app/api/v1/chat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    const chatId = req.nextUrl.searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเป็นเจ้าของแชทหรือไม่ (ถ้ามีการล็อกอิน)
    if (session?.user?.id) {
      const chat = await Chat.findOne({
        _id: chatId,
        ownerId: session.user.id,
      });

      if (!chat) {
        return NextResponse.json(
          { error: "Chat not found or unauthorized" },
          { status: 403 }
        );
      }
    }

    // ดึงข้อความทั้งหมดในแชท
    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .lean();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
