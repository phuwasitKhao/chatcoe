// // import { NextRequest, NextResponse } from "next/server";
// // import { createCompletion } from "@/app/api/v1/chat/llm";
// // import connectDB from "@/lib/mongodb";
// // import Message from "@/models/Message";
// // import Chat from "@/models/Chat";

// // export async function POST(req: NextRequest) {
// //   const body = await req.json();
// //   const { message, chatId, userId } = body;

// //   if (!message || !chatId || !userId) {
// //     return NextResponse.json(
// //       { error: "Missing required fields" },
// //       { status: 400 }
// //     );
// //   }

// //   console.log(`Processing message for chat: ${chatId}`);

// //   try {
// //     await connectDB();

// //     const userMessage = new Message({
// //       chatId,
// //       senderId: userId,
// //       content: message,
// //       timestamp: new Date(),
// //       type: "text",
// //       isRead: true
// //     });

// //     await userMessage.save();

// //     console.log("Message saved:", userMessage);

// //     const chat = await Chat.findById(chatId);

// //     if (chat) {
// //       chat.updatedAt = new Date();

// //       if (chat.title === "New Chat") {
// //         chat.title = message.substring(0, 30);
// //       }
// //       await chat.save();
// //       console.log("Chat saved:", chat);
// //     } else {
// //       console.log("Chat not found:", chatId);

// //     }

// //     const completion = await createCompletion(message);

// //     if (!completion) {
// //       console.log("Generate Error");
// //       return NextResponse.json(
// //         { error: "Failed to generate completion" },
// //         { status: 500 }
// //       );
// //     }

// //     const botMessage = new Message({
// //       chatId,
// //       senderId: "bot",
// //       content: completion,
// //       timestamp: new Date(),
// //       type: "text",
// //       isRead: true
// //     });

// //     await botMessage.save();

// //     await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

// //     return NextResponse.json({ completion });

// //   } catch (error) {
// //     console.error("Error:", error);
// //     return NextResponse.json(
// //       { error: "Processing failed" },
// //       { status: 500 }
// //     );
// //   }
// // }

import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStore } from "@/lib/vector-store";
import { processUserMessage } from "@/lib/langchain";
import { env } from "@/lib/config";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Chat from "@/models/Chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, chatId, userId } = body;

    if (!messages || !Array.isArray(messages) || !chatId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // รับข้อความล่าสุดจาก messages array
    const currentMessage = messages[messages.length - 1].content;

    // บันทึกข้อความลง MongoDB
    await connectDB();
    const userMessage = new Message({
      chatId,
      senderId: userId,
      content: currentMessage,
      timestamp: new Date(),
      type: "text",
      isRead: true,
    });
    await userMessage.save();

    // อัปเดต Chat
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    // ถ้าสร้างในไฟล์เดียวกัน
    async function fetchChatHistory(chatId: string) {
      try {
        await connectDB();
        const messages = await Message.find({ chatId })
          .sort({ timestamp: 1 })
          .lean();

        if (messages && messages.length > 0) {
          return messages
            .map(
              (msg: any) =>
                `${msg.senderId === "bot" ? "assistant" : "user"}: ${
                  msg.content
                }`
            )
            .join("\n");
        }
        return "";
      } catch (error) {
        console.error("Error fetching chat history:", error);
        return "";
      }
    }

    const chatHistory = await fetchChatHistory(chatId);

    // สร้าง model
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.5,
      openAIApiKey: process.env.API_KEY_MODEL,
      configuration: {
        baseURL: process.env.API_KEY_URL,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "CoE Assistant",
        },
      },
    });

    // เชื่อมต่อกับ Pinecone
    const client = await getPineconeClient();
    const vectorStore = await getVectorStore(client);

    // ใช้ RAG เพื่อสร้างคำตอบ
    const answer = await processUserMessage({
      userPrompt: currentMessage,
      conversationHistory: chatHistory,
      vectorStore,
      model,
    });

    // แปลง stream เป็น string
    let answerString = "";
    for await (const chunk of answer) {
      answerString += chunk;
    }

    // บันทึกคำตอบของบอทลงฐานข้อมูล
    const botMessage = new Message({
      chatId,
      senderId: "bot",
      content: answerString,
      timestamp: new Date(),
      type: "text",
      isRead: true,
    });
    await botMessage.save();

    // ส่งคำตอบกลับ
    return NextResponse.json({
      completion: answerString,
      status: "success",
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// // import { isRateLimited } from "@/lib/ratelimit";
// import { Message } from "ai-stream-experimental";
// import { getPineconeClient } from "@/lib/pinecone-client";
// import { getVectorStore } from "@/lib/vector-store";
// import { processUserMessage } from "@/lib/langchain";
// import { ChatOpenAI } from "@langchain/openai";
// import { LangChainAdapter } from "ai";

// const baseURL = process.env.LLM_URL || "";
// const apiKey = process.env.LLM_API_KEY || "";
// const model_name: string = process.env.LLM_MODEL || "";
// const temperature: number = 0.3;

// export async function POST(req: NextRequest) {
//     // const ip = req.headers.get("x-forwarded-for") || "unknown";

//     // if (isRateLimited(ip)) {
//     //     return NextResponse.json(
//     //         { error: "Too many requests. Please try again later." },
//     //         { status: 429 }
//     //     );
//     // }

//     try {

//         const body = await req.json();
//         const { messages } = body;
//         const parsedMessages: Message[] = messages ?? [];
//         if (!parsedMessages.length) {
//             return NextResponse.json(
//                 { error: "No messages provided" },
//                 { status: 400 }
//             );
//         }
//         const currentQuestion = parsedMessages[parsedMessages.length - 1].content;
//         if (!currentQuestion?.trim()) {
//             return NextResponse.json(
//                 { error: "Empty question provided" },
//                 { status: 400 }
//             );
//         }

//         // console.log("Current Question", messages);

//         const formattedPreviousMessages = parsedMessages.slice(0, -1).map(
//             (message) =>
//                 `${message.role === "user" ? "user" : "Assistant"}: ${message.content}`
//         ).join("\n");

//         const pc = await getPineconeClient();
//         const vectorStore = await getVectorStore(pc);

//         const model = new ChatOpenAI({
//             modelName: model_name,
//             temperature: temperature,
//             streaming: true,
//             maxTokens: 500,
//             configuration: {
//                 baseURL,
//                 apiKey,
//             },
//         });
//         const stream = await processUserMessage({
//             userPrompt: currentQuestion,
//             conversationHistory: formattedPreviousMessages,
//             vectorStore,
//             model,
//         });

//         // console.log("Message Answer", stream);

//         const response = LangChainAdapter.toDataStreamResponse(stream);
//         return response;

//     } catch (error) {
//         console.error("Error processing request", error);
//         return NextResponse.json(
//             { error: "Error processing request" },
//             { status: 500 }
//         );

//     }
// }
