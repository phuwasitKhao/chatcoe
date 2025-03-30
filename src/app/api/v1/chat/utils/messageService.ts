import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Message {
  _id?: string | ObjectId;
  chatId: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

export async function getMessages(chatId: string) {
  const { db } = await connectDB();
  const messages = await db
    .collection("messages")
    .find({ chatId })
    .sort({ timestamp: 1 })
    .toArray();
  
  return messages;
}

export async function saveMessage(message: Message) {
  const { db } = await connectDB();
  const result = await db.collection("messages").insertOne(message);
  
  return {
    _id: result.insertedId,
    ...message
  };
}