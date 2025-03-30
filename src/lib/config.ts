import z from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1),
  PINECONE_API_KEY: z.string().trim().min(1),
  AZURE_API_ENDPOINT: z.string().trim().min(1),
  AZURE_API_VERSION: z.string().trim().min(1),
  AZURE_API_MODEL: z.string().trim().min(1),
  AZURE_API_DEPLOYMENT: z.string().trim().min(1),
  PINECONE_INDEX_NAME: z.string().trim().min(1),
});

export const env = envSchema.parse(process.env);