import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFile extends Document {
  userId: Types.ObjectId;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  charCount: number;
  wordCount: number;
  summaryId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ["TXT", "PDF", "DOC", "DOCX"],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    charCount: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    summaryId: {
      type: Schema.Types.ObjectId,
      ref: "Summary",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

FileSchema.index({ userId: 1, createdAt: -1 });

export const File = mongoose.model<IFile>("File", FileSchema);
export default File;
