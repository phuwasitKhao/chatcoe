import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  ownerId: string;
  title: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
