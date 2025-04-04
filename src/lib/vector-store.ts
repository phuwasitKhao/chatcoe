
// vector-store.ts
import { env } from "./config";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { AzureOpenAI } from "openai";

// Create a custom embeddings class compatible with LangChain
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
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        input: texts,
        model: this.modelName
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error("Error embedding documents:", error);
      throw new Error("Failed to generate embeddings");
    }
  }

  async embedQuery(text: string): Promise<number[]> {
      console.log("Attempting to embed query:", text); // Added this line
      try {
        const response = await this.client.embeddings.create({
          input: [text],
          model: this.modelName,
        });
        console.log("Embed query successful"); // Added this line
        return response.data[0].embedding;
      } catch (error) {
        console.error("Error embedding query:", error);
        throw new Error("Failed to generate query embedding");
      }
    }
}

export async function embedAndStoreDocs(
  client: PineconeClient,
  docs: Document<Record<string, any>>[]
) {
  /*create and store the embeddings in the vectorStore*/
  try {
    const embeddings = new AzureOpenAIEmbeddings();
    console.log("Index" , env.PINECONE_INDEX_NAME);

    const index = client.Index(env.PINECONE_INDEX_NAME);

    
    //embed the documents using Azure OpenAI
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });
  } catch (error) {
    console.log("error ", error);
    throw new Error("Failed to load your docs!");
  }
}

// Returns vector-store handle to be used as retrievers on langchains
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
