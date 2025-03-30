import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  isRead: boolean;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  chatId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);