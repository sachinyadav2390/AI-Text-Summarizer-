/**
 * MongoDB-backed history store.
 * Wraps the Summary model to provide the same interface
 * the routes previously used with the in-memory store.
 */

import { Summary, ISummary } from "../models";
import mongoose from "mongoose";

// Default userId is no longer used once auth is implemented.

export interface HistoryEntry {
  id: string;
  inputText: string;
  inputPreview: string;
  summary: string;
  summaryPreview: string;
  length: "short" | "medium" | "long";
  modelUsed: string;
  wordCount: number;
  summaryWordCount: number;
  processingTimeMs?: number;
  device?: string;
  createdAt: string;
}

/** Convert a Mongoose Summary doc → HistoryEntry DTO */
function toHistoryEntry(doc: ISummary): HistoryEntry {
  const text = doc.originalText;
  const sum = doc.summaryText;

  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    inputText: text,
    inputPreview: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
    summary: sum,
    summaryPreview: sum.slice(0, 150) + (sum.length > 150 ? "..." : ""),
    length: doc.length,
    modelUsed: doc.modelUsed,
    wordCount: doc.inputWordCount,
    summaryWordCount: doc.summaryWordCount,
    processingTimeMs: doc.processingTimeMs,
    device: doc.device,
    createdAt: doc.createdAt.toISOString(),
  };
}

class HistoryStore {
  /** Get all summaries for a specific user (newest first) */
  async getAll(userId: string, limit = 50): Promise<HistoryEntry[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];

    const docs = await Summary.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return (docs as unknown as ISummary[]).map(toHistoryEntry);
  }

  /** Get a single entry by its Mongo _id, ensuring it belongs to the user */
  async getById(id: string, userId: string): Promise<HistoryEntry | null> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) return null;

    const doc = await Summary.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    return doc ? toHistoryEntry(doc as unknown as ISummary) : null;
  }

  /** Create a new summary record and return a HistoryEntry */
  async add(
    userId: string,
    input: string,
    summary: string,
    length: "short" | "medium" | "long",
    extra: {
      modelUsed?: string;
      processingTimeMs?: number;
      device?: string;
      inputTokens?: number;
      outputTokens?: number;
    } = {}
  ): Promise<HistoryEntry> {
    const doc = await Summary.create({
      userId: new mongoose.Types.ObjectId(userId),
      originalText: input,
      summaryText: summary,
      modelUsed: extra.modelUsed || "extractive-fallback",
      length,
      inputWordCount: input.trim().split(/\s+/).length,
      summaryWordCount: summary.trim().split(/\s+/).length,
      inputTokens: extra.inputTokens,
      outputTokens: extra.outputTokens,
      processingTimeMs: extra.processingTimeMs,
      device: extra.device,
    });

    return toHistoryEntry(doc);
  }

  /** Delete a single entry by _id, ensuring it belongs to the user */
  async deleteById(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) return false;

    const result = await Summary.deleteOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    return result.deletedCount > 0;
  }

  /** Clear all summaries for the specific user */
  async clearAll(userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return;
    await Summary.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
  }
}

export const historyStore = new HistoryStore();
