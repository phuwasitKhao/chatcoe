// import { env } from "./config";
// import { PineconeStore } from "@langchain/pinecone";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

// export async function embedAndStoreDocs(
//   client: PineconeClient,
//   // @ts-ignore docs type error
//   docs: Document<Record<string, any>>[]
// ) {
//   /*create and store the embeddings in the vectorStore*/
//   try {
//     const embeddings = new OpenAIEmbeddings();
//     const index = client.Index(env.PINECONE_INDEX_NAME);

//     //embed the PDF documents
//     await PineconeStore.fromDocuments(docs, embeddings, {
//       pineconeIndex: index,
//       textKey: "text",
//     });
//   } catch (error) {
//     console.log("error ", error);
//     throw new Error("Failed to load your docs !");
//   }
// }

// // Returns vector-store handle to be used a retrievers on langchains
// export async function getVectorStore(client: PineconeClient) {
//   try {
//     const embeddings = new OpenAIEmbeddings();
//     const index = client.Index(env.PINECONE_INDEX_NAME);

//     const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
//       pineconeIndex: index,
//       textKey: "text",
//     });

//     return vectorStore;
//   } catch (error) {
//     console.log("error ", error);
//     throw new Error("Something went wrong while getting vector store !");
//   }
// }

// vector-store.ts
import { env } from "./config";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { AzureOpenAI } from "openai";

// Create a custom embeddings class compatible with LangChain
// class AzureOpenAIEmbeddings {
//   private client: AzureOpenAI;
//   private modelName: string;

//   constructor() {
//     const endpoint = env.AZURE_API_ENDPOINT || "";
//     const apiKey = env.OPENAI_API_KEY || "";
//     const apiVersion = env.AZURE_API_VERSION || "";
//     const deployment = env.AZURE_API_DEPLOYMENT || "";
//     const modelName = env.AZURE_API_MODEL || "";
    
//     const options = { endpoint, apiKey, deployment, apiVersion }

//     this.client = new AzureOpenAI(options);
//     this.modelName = modelName;
//   }

//   async embedDocuments(texts: string[]): Promise<number[][]> {
//     try {
//       const response = await this.client.embeddings.create({
//         input: texts,
//         model: this.modelName
//       });

//       return response.data.map(item => item.embedding);
//     } catch (error) {
//       console.error("Error embedding documents:", error);
//       throw new Error("Failed to generate embeddings");
//     }
//   }

//   async embedQuery(text: string): Promise<number[]> {
//       console.log("Attempting to embed query:", text); // Added this line
//       try {
//         const response = await this.client.embeddings.create({
//           input: [text],
//           model: this.modelName,
//         });
//         console.log("Embed query successful"); // Added this line
//         return response.data[0].embedding;
//       } catch (error) {
//         console.error("Error embedding query:", error);
//         throw new Error("Failed to generate query embedding");
//       }
//     }
// }

// export async function embedAndStoreDocs(
//   client: PineconeClient,
//   docs: Document<Record<string, any>>[]
// ) {
//   /*create and store the embeddings in the vectorStore*/
//   try {
//     const embeddings = new AzureOpenAIEmbeddings();
//     console.log("Index" , env.PINECONE_INDEX_NAME);

//     const index = client.Index(env.PINECONE_INDEX_NAME);

    
//     //embed the documents using Azure OpenAI
//     await PineconeStore.fromDocuments(docs, embeddings, {
//       pineconeIndex: index,
//       textKey: "text",
//     });
//   } catch (error) {
//     console.log("error ", error);
//     throw new Error("Failed to load your docs!");
//   }
// }

// // Returns vector-store handle to be used as retrievers on langchains
// export async function getVectorStore(client: PineconeClient) {
//   try {
//     const embeddings = new AzureOpenAIEmbeddings();
//     const index = client.Index(env.PINECONE_INDEX_NAME);
    
//     const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
//       pineconeIndex: index,
//       textKey: "text",
//     });
//     return vectorStore;
//   } catch (error) {
//     console.log("error ", error);
//     throw new Error("Something went wrong while getting vector store!");
//   }
// }


// แก้ไขคลาส AzureOpenAIEmbeddings ใน vector-store.ts

class AzureOpenAIEmbeddings {
  private client: AzureOpenAI;
  private modelName: string;

  constructor() {
    const endpoint = env.AZURE_API_ENDPOINT || "";
    const apiKey = env.OPENAI_API_KEY || "";
    const apiVersion = env.AZURE_API_VERSION || "";
    const deployment = env.AZURE_API_DEPLOYMENT || "";
    const modelName = env.AZURE_API_MODEL || "";
    
    const options = { endpoint, apiKey, deployment, apiVersion }

    this.client = new AzureOpenAI(options);
    this.modelName = modelName;
    
    console.log("AzureOpenAIEmbeddings initialized with:", {
      hasEndpoint: !!endpoint,
      hasApiKey: !!apiKey,
      hasDeployment: !!deployment,
      hasModelName: !!modelName,
      apiVersion
    });
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      console.log(`Embedding ${texts.length} documents with model ${this.modelName}`);
      
      if (!texts.length) {
        console.warn("Attempted to embed empty texts array");
        return [];
      }
      
      // ตรวจสอบว่า texts มีข้อมูลที่ถูกต้อง
      const validTexts = texts.filter(text => typeof text === 'string' && text.trim().length > 0);
      
      if (validTexts.length === 0) {
        console.warn("No valid texts to embed after filtering");
        return [];
      }
      
      const response = await this.client.embeddings.create({
        input: validTexts, // ส่ง array ของข้อความ
        model: this.modelName
      });

      console.log(`Successfully embedded ${response.data.length} documents`);
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error("Error embedding documents:", error);
      
      // แสดงข้อมูลเพิ่มเติมเกี่ยวกับข้อผิดพลาด
      if (error.response) {
        console.error("Response error details:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      console.log("Attempting to embed query:", text);
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error("Invalid query text: text must be a non-empty string");
      }
      
      // ตรวจสอบการทำงานของ API
      console.log("Sending request to Azure OpenAI with:", {
        model: this.modelName,
        inputType: typeof text,
        inputLength: text.length
      });
      
      const response = await this.client.embeddings.create({
        input: [text], // ต้องเป็น array เสมอ แม้จะมีข้อความเดียว
        model: this.modelName,
      });
      
      if (!response.data || response.data.length === 0) {
        throw new Error("Empty response from embeddings API");
      }
      
      console.log("Embed query successful, vector length:", response.data[0].embedding.length);
      return response.data[0].embedding;
    } catch (error) {
      console.error("Error embedding query:", error);
      
      // ลองตรวจสอบข้อมูลเพิ่มเติมจาก error object
      if (error.response) {
        console.error("Response error details:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw new Error(`Failed to generate query embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}


export async function getVectorStore(client: PineconeClient) {
  try {
    const embeddings = new AzureOpenAIEmbeddings();
    const index = client.Index(env.PINECONE_INDEX_NAME);
    
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });
    return vectorStore;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Something went wrong while getting vector store!");
  }
}