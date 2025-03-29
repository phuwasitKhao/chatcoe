// import { NextRequest, NextResponse } from "next/server";
// import { createCompletion } from "@/app/api/v1/chat/llm";
// // import { error } from "console";
// export async function POST(req: NextRequest) {
//     const body = await req.json();
//     const {message} = body;
//     console.log(message);
//     const completion = await createCompletion(message);
//     if (!completion) {
//         console.log("Generate Error")
//         return NextResponse.json(
//             { error: "Failed to generate completion" },
//             { status: 500 },
//         )
//     }else{
//         return NextResponse.json({ completion });
//     }
// }

import { NextRequest, NextResponse } from "next/server";
import { createCompletion } from "@/app/api/v1/chat/llm";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Chat from "@/models/Chat";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, chatId, userId } = body;

  if (!message || !chatId || !userId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  console.log(`Processing message for chat: ${chatId}`);

  try {
    await connectDB();

    const userMessage = new Message({
      chatId,
      senderId: userId,
      content: message,
      timestamp: new Date(),
      type: "text",
      isRead: true
    });

    await userMessage.save();

    const completion = await createCompletion(message);

    if (!completion) {
      console.log("Generate Error");
      return NextResponse.json(
        { error: "Failed to generate completion" },
        { status: 500 }
      );
    }

    const botMessage = new Message({
      chatId,
      senderId: "bot",
      content: completion,
      timestamp: new Date(),
      type: "text",
      isRead: true
    });

    await botMessage.save();

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    return NextResponse.json({ completion });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}