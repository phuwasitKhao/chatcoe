import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  filename: string;
  url: string;
  type: string;
  size?: number;
  uploadedBy: string;
  status: "indexed" | "processing" | "failed";
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["pdf", "image", "docx", "txt", "url", "unknown"],
    },
    size: {
      type: Number,
    },
    uploadedBy: {
      type: String,
      required: true,
      default: "anonymous",
    },
    status: {
      type: String,
      required: true,
      enum: ["indexed", "processing", "failed"],
      default: "processing",
    },
    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.models?.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);