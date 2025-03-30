// import { NextRequest, NextResponse } from "next/server";
// import { createStreamingCompletion } from "@/app/api/v1/chat/llm";
// export async function POST(req: NextRequest) {
//     const body = await req.json();
//     const { message } = body;
//     console.log(message);
//     const completion = await createStreamingCompletion(message);
//     if (!completion) {
//         console.log("Generate Error")
//         return NextResponse.json(
//             { error: "Failed to generate completion" },
//             { status: 500 }
//         )
//     }

//     const encoder = new TextEncoder();
//     const customStream = new ReadableStream({
//         async start(controller) {
//             const onPart = async (part: any) => {
//                 if (part.choices && part.choices[0]?.delta?.content) {
//                     const text = part.choices[0].delta.content;
//                     controller.enqueue(encoder.encode(text));
//                 }
//             };

//             // Process the stream
//             try {
//                 for await (const part of completion) {
//                     await onPart(part);
//                 }
//                 controller.close();
//             } catch (error) {
//                 console.error("Stream processing error:", error);
//                 controller.error(error);
//             }
//         },
//     });
//     return new Response(customStream, {
//         headers: {
//             "Content-Type": "text/plain; charset=utf-8",
//         },
//     });
// }


import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import Message from '@/models/Message';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { ownerId, title = 'New Chat' } = body;

    console.log("Creating chat with owner ID:", ownerId);

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }

    const chat = new Chat({
      ownerId, // ใช้ ID ตามที่ส่งมา
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    const savedChat = await chat.save();
    console.log("Chat created:", savedChat);

    return NextResponse.json(savedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = req.nextUrl.searchParams.get('userId');
    const includeLatestMessage = req.nextUrl.searchParams.get('includeLatestMessage') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let chats = await Chat.find({ ownerId: userId })
      .sort({ updatedAt: -1 })
      .lean();

    if (includeLatestMessage && chats.length > 0) {

      const chatsWithMessages = await Promise.all(chats.map(async (chat) => {
        const lastestMessages = await Message.find({ chatId: chat._id })
          .sort({ timestamp: -1 })
          .lean();
        return {
          ...chat,
          lastestMessages: lastestMessages || []
        };
      }));

      chats = chatsWithMessages;

    }

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}
