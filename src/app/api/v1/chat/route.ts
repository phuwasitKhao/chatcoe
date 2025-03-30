import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStore } from "@/lib/vector-store";
import { processUserMessage } from "@/lib/langchain";
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

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.5,
      openAIApiKey: process.env.API_KEY_MODEL,
      configuration: {
        baseURL: process.env.API_KEY_URL,
        defaultHeaders: {
          // "HTTP-Referer": "http://localhost:3000",
          "HTTP-Referer": "https://chatcoe-iota.vercel.app",
          "X-Title": "CoE Assistant",
        },
      },
    });

    const client = await getPineconeClient();
    const vectorStore = await getVectorStore(client);

    const answer = await processUserMessage({
      userPrompt: currentMessage,
      conversationHistory: chatHistory,
      vectorStore,
      model,
    });

    let answerString = "";
    for await (const chunk of answer) {
      answerString += chunk;
    }

    const botMessage = new Message({
      chatId,
      senderId: "bot",
      content: answerString,
      timestamp: new Date(),
      type: "text",
      isRead: true,
    });
    await botMessage.save();

    return NextResponse.json({
      completion: answer,
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

// ฟังก์ชันสำหรับดึงประวัติการสนทนา
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
            `${msg.senderId === "bot" ? "assistant" : "user"}: ${msg.content}`
        )
        .join("\n");
    }
    return "";
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return "";
  }
}

async function saveMessage(
  chatId: string,
  senderId: string,
  content: string,
  role: string
) {
  // ไม่ต้องใช้ fetch ในฝั่ง server เพราะเราสามารถใช้โมเดล MongoDB โดยตรงได้
  try {
    await connectDB();
    const message = new Message({
      chatId,
      senderId,
      content,
      timestamp: new Date(),
      type: "text",
      isRead: true,
    });
    await message.save();
  } catch (error) {
    console.error("Error saving message:", error);
  }
}
