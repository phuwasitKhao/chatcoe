// import { NextRequest, NextResponse } from "next/server";
// import { createCompletion } from "@/app/api/v1/chat/llm";
// import connectDB from "@/lib/mongodb";
// import Message from "@/models/Message";
// import Chat from "@/models/Chat";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { message, chatId, userId } = body;

//   if (!message || !chatId || !userId) {
//     return NextResponse.json(
//       { error: "Missing required fields" },
//       { status: 400 }
//     );
//   }

//   console.log(`Processing message for chat: ${chatId}`);

//   try {
//     await connectDB();

//     const userMessage = new Message({
//       chatId,
//       senderId: userId,
//       content: message,
//       timestamp: new Date(),
//       type: "text",
//       isRead: true
//     });

//     await userMessage.save();

//     console.log("Message saved:", userMessage);


//     const chat = await Chat.findById(chatId);

//     if (chat) {
//       chat.updatedAt = new Date();

//       if (chat.title === "New Chat") {
//         chat.title = message.substring(0, 30);
//       }
//       await chat.save();
//       console.log("Chat saved:", chat);
//     } else {
//       console.log("Chat not found:", chatId);

//     }

//     const completion = await createCompletion(message);

//     if (!completion) {
//       console.log("Generate Error");
//       return NextResponse.json(
//         { error: "Failed to generate completion" },
//         { status: 500 }
//       );
//     }

//     const botMessage = new Message({
//       chatId,
//       senderId: "bot",
//       content: completion,
//       timestamp: new Date(),
//       type: "text",
//       isRead: true
//     });

//     await botMessage.save();

//     await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

//     return NextResponse.json({ completion });

//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json(
//       { error: "Processing failed" },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStore } from "@/lib/vector-store";
import { processUserMessage } from "@/lib/langchain";
import { env } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { message, chatId, userId } = await req.json();

    // สร้าง model
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.5,
      openAIApiKey: env.OPENAI_API_KEY,
    });

    // เชื่อมต่อกับ Pinecone
    const client = await getPineconeClient();
    const vectorStore = await getVectorStore(client);

    // ดึงประวัติการสนทนา
    // เช่น จาก DB หรือ localStorage
    const chatHistory = await fetchChatHistory(chatId);
    
    // ใช้ RAG เพื่อสร้างคำตอบ
    const answer = await processUserMessage({
      userPrompt: message,
      conversationHistory: chatHistory,
      vectorStore,
      model,
    });

    // บันทึกข้อความลง database
    await saveMessage(chatId, userId, message, "user");
    let answerString = '';
    for await (const chunk of answer) {
      answerString += chunk;
    }
    await saveMessage(chatId, "bot", answerString, "bot");

    return NextResponse.json({ 
      completion: answer,
      status: "success" 
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      status: "error" 
    }, { status: 500 });
  }
}

// ฟังก์ชันสำหรับดึงประวัติการสนทนา
async function fetchChatHistory(chatId: string) {
  // ดึงประวัติการสนทนาจาก DB
  // ตัวอย่างเช่น:
  try {
    const response = await fetch(`/api/v1/chat/messages?chatId=${chatId}`);
    const data = await response.json();
    
    if (data.messages && data.messages.length > 0) {
      return data.messages
        .map((msg: any) => `${msg.senderId === 'bot' ? 'assistant' : 'user'}: ${msg.content}`)
        .join('\n');
    }
    return '';
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return '';
  }
}

// ฟังก์ชันสำหรับบันทึกข้อความ
async function saveMessage(chatId: string, senderId: string, content: string, role: string) {
  // บันทึกข้อความลง DB
  try {
    await fetch("/api/v1/chat/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        senderId,
        content,
        role
      }),
    });
  } catch (error) {
    console.error("Error saving message:", error);
  }
}