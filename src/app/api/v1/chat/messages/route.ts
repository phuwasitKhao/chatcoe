import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Chat from '@/models/Chat';

// สร้างข้อความใหม่
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { chatId, content, senderId, isBot = false } = body;

    const message = new Message({
      chatId,
      senderId: isBot ? 'bot' : senderId,
      content,
      timestamp: new Date(),
      type: 'text',
      isRead: true
    });

    await message.save();

    // อัพเดท updatedAt ของแชท
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

// ดึงข้อความทั้งหมดในแชท
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const chatId = req.nextUrl.searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }
    console.log("Message ID:", chatId);


    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .lean();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
