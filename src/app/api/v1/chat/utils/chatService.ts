import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Chat {
  _id?: string | ObjectId;
  ownerId: string;
  title: string;
  createdAt: Date;
  updatedAt?: Date;
}

export async function getChats(userId: string) {
  const { db } = await connectDB();
  const chats = await db
    .collection("chats")
    .find({ ownerId: userId })
    .sort({ updatedAt: -1 })
    .toArray();
  
  return chats;
}

export async function createChat(chat: Chat) {
  const { db } = await connectDB();
  const result = await db.collection("chats").insertOne({
    ...chat,
    updatedAt: new Date()
  });
  
  return {
    _id: result.insertedId,
    ...chat
  };
}

export async function updateChatTitle(chatId: string, message: string) {
  const { db } = await connectDB();
  
  // ตรวจสอบว่าเป็นข้อความแรกหรือไม่
  const messageCount = await db
    .collection("messages")
    .countDocuments({ chatId });
  
  // ถ้าเป็นข้อความแรก (คือมี 1 ข้อความที่เพิ่งบันทึก)
  if (messageCount === 1) {
    // ใช้ข้อความเป็นชื่อแชท แต่ตัดให้สั้นลงถ้ายาวเกินไป
    const title = message.length > 30 
      ? message.substring(0, 30) + "..." 
      : message;
    
    await db.collection("chats").updateOne(
      { _id: new ObjectId(chatId) },
      { 
        $set: { 
          title,
          updatedAt: new Date()
        } 
      }
    );
    
    return true;
  }
  
  // อัพเดต updatedAt เสมอเมื่อมีการแชท
  await db.collection("chats").updateOne(
    { _id: new ObjectId(chatId) },
    { $set: { updatedAt: new Date() } }
  );
  
  return false;
}