import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";
import { env } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const textToEmbed = "ทดสอบการสร้าง embedding สำหรับคณะวิศวกรรมศาสตร์";
    console.log("Testing embedding with text:", textToEmbed);
    
    // สร้าง AzureOpenAI client โดยตรง
    const azureEndpoint = env.AZURE_API_ENDPOINT || "";
    const apiKey = env.OPENAI_API_KEY || "";
    const apiVersion = env.AZURE_API_VERSION || "";
    const deployment = env.AZURE_API_DEPLOYMENT || "";
    const modelName = env.AZURE_API_MODEL || "";
    
    if (!azureEndpoint || !apiKey || !apiVersion || !deployment || !modelName) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required Azure OpenAI configuration",
        config: {
          hasEndpoint: !!azureEndpoint,
          hasApiKey: !!apiKey,
          hasApiVersion: !!apiVersion,
          hasDeployment: !!deployment,
          hasModelName: !!modelName
        }
      }, { status: 500 });
    }
    
    const client = new AzureOpenAI({
      endpoint: azureEndpoint, 
      apiKey, 
      apiVersion,
      deployment
    });
    
    console.log("Sending request to Azure OpenAI API");
    
    const response = await client.embeddings.create({
      input: [textToEmbed],
      model: modelName
    });
    
    return NextResponse.json({ 
      success: true, 
      embeddingLength: response.data[0].embedding.length,
      embedding: response.data[0].embedding.slice(0, 5) // แสดงเฉพาะ 5 ค่าแรก
    });
  } catch (error) {
    console.error("Embedding test failed:", error);
    
    let errorDetails = "Unknown error";
    let errorResponse = null;
    
    if (error.response) {
      try {
        errorResponse = {
          status: error.response.status,
          data: error.response.data,
          headers: Object.fromEntries(
            Object.entries(error.response.headers)
              .filter(([key]) => !key.toLowerCase().includes("authorization"))
          )
        };
      } catch (e) {
        errorResponse = "Could not parse error response";
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: errorDetails,
      response: errorResponse
    }, { status: 500 });
  }
}