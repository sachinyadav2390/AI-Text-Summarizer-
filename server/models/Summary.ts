import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISummary extends Document {
  userId: Types.ObjectId;
  originalText: string;
  summaryText: string;
  modelUsed: string;
  length: "short" | "medium" | "long";
  inputWordCount: number;
  summaryWordCount: number;
  inputTokens?: number;
  outputTokens?: number;
  processingTimeMs?: number;
  device?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SummarySchema = new Schema<ISummary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    summaryText: {
      type: String,
      required: true,
    },
    modelUsed: {
      type: String,
      required: true,
      default: "bart",
    },
    length: {
      type: String,
      required: true,
      enum: ["short", "medium", "long"],
      default: "medium",
    },
    inputWordCount: {
      type: Number,
      default: 0,
    },
    summaryWordCount: {
      type: Number,
      default: 0,
    },
    inputTokens: {
      type: Number,
      default: null,
    },
    outputTokens: {
      type: Number,
      default: null,
    },
    processingTimeMs: {
      type: Number,
      default: null,
    },
    device: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // auto createdAt, updatedAt
  }
);

// Compound index: fetch user's summaries sorted by newest first
SummarySchema.index({ userId: 1, createdAt: -1 });

export const Summary = mongoose.model<ISummary>("Summary", SummarySchema);
export default Summary;
