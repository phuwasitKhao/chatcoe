//langchain.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { VectorStore } from "@langchain/core/vectorstores";
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: process.env.LLM_URL,
  apiKey: process.env.LLM_API_KEY,
});

// Environment variables with fallbacks
const model_name: string = process.env.LLM_MODEL || "";
const temperature: number = process.env.LLM_TEMPERATURE
  ? parseFloat(process.env.LLM_TEMPERATURE)
  : 0.0;
const maxToken: number = process.env.LLM_MAX_TOKEN
  ? parseInt(process.env.LLM_MAX_TOKEN)
  : 150;

interface ProcessMessageArgs {
  userPrompt: string;
  conversationHistory: string;
  vectorStore: VectorStore;
  model: ChatOpenAI;
}
interface ProcessMessageResponse {
  answer: string;
  inquiry: string;
}

export async function processUserMessage({
  userPrompt,
  conversationHistory,
  vectorStore,
  model,
}: ProcessMessageArgs) {
  try {
    console.log("Processing user message:", {
      promptLength: userPrompt.length,
      hasHistory: !!conversationHistory,
      modelInfo: {
        name: model.modelName,
        temperature: model.temperature,
        streaming: model.streaming,
      },
    });

    // สร้าง nonStreamingModel ที่ใช้ OpenRouter
    const nonStreamingModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.0,
      streaming: false,
      apiKey: process.env.API_KEY_MODEL,
      maxTokens: 20,
      configuration: {
        baseURL: process.env.API_KEY_URL,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000", // แก้ไขตามโดเมนของคุณ
          "X-Title": "CoE Assistant",
        },
      },
    });

    console.log("Generating inquiry using LLM");

    const inquiryResult = await inquiryPrompt
      .pipe(nonStreamingModel)
      .pipe(new StringOutputParser())
      .invoke({
        userPrompt,
        conversationHistory,
      });

    console.log("Generated inquiry:", inquiryResult);

    console.log("Searching vector store for relevant documents");
    const relevantDocs = await vectorStore.similaritySearch(inquiryResult, 5);
    console.log(`Found ${relevantDocs.length} relevant documents`);

    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");
    console.log("Context created with length:", context.length);

    console.log("Generating response stream");
    const responseStream = qaPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .stream({
        context,
        question: inquiryResult,
      });

    return responseStream;
  } catch (error) {
    console.error("Detailed error in processUserMessage:", error);
    throw new Error(
      `Failed to process your message: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

const inquiryPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `คุณเป็นระบบค้นหาข้อมูลสำหรับคณะวิศวกรรมศาสตร์ มหาวิทยาลัยขอนแก่น
    จากข้อความของผู้ใช้และประวัติการสนทนา ให้สร้างคำถามที่เฉพาะเจาะจงที่สุดเพื่อค้นหาข้อมูลจากฐานความรู้
    
    กฎ:
    - ให้ความสำคัญกับข้อความล่าสุดของผู้ใช้มากกว่าประวัติการสนทนา
    - ละเว้นประวัติการสนทนาที่ไม่เกี่ยวข้องโดยตรงกับคำถาม
    - คำถามควรเป็นประโยคเดียวที่กระชับและตรงประเด็น
    - ตัดคำที่ไม่จำเป็นออก
    - หากไม่สามารถสร้างคำถามได้ ให้ส่งคืนข้อความของผู้ใช้โดยตรง`,
  ],
  [
    "human",
    `ข้อความผู้ใช้: {userPrompt}\n\nประวัติการสนทนา: {conversationHistory}`,
  ],
]);

const qaPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `คุณเป็นผู้ช่วยตอบคำถามเกี่ยวกับคณะวิศวกรรมศาสตร์ มหาวิทยาลัยขอนแก่น คุณต้องให้ข้อมูลที่ถูกต้องและเป็นประโยชน์แก่ผู้ใช้

    คำแนะนำ:
    1. ใช้เฉพาะข้อมูลที่มีในบริบทที่ให้มา
    2. หากไม่มีข้อมูลในบริบท ให้แจ้งว่าไม่มีข้อมูลเพียงพอที่จะตอบคำถามนี้
    3. ให้คำตอบเป็นภาษาไทยที่เข้าใจง่าย
    4. อ้างอิงข้อมูลจากบริบทเมื่อจำเป็น
    5. หากมีข้อมูลเกี่ยวกับหลักสูตร อาจารย์ กิจกรรม หรือการรับสมัคร ให้ระบุวันที่ของข้อมูลด้วย

    ห้าม:
    - สร้างข้อมูลที่ไม่มีในบริบท
    - ให้ข้อมูลที่คลุมเครือหรือไม่ชัดเจน
    
    บริบท: {context}`,
  ],
  ["human", "คำถาม: {question}"],
]);
