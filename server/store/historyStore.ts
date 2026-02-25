/**
 * MongoDB-backed history store.
 * Wraps the Summary model to provide the same interface
 * the routes previously used with the in-memory store.
 */

import { Summary, ISummary } from "../models";
import mongoose from "mongoose";

// Default userId when no auth is present.
// Replace with real userId from auth middleware later.
const DEFAULT_USER_ID = new mongoose.Types.ObjectId("000000000000000000000001");

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
  /** Get all summaries for the default user (newest first) */
  async getAll(limit = 50): Promise<HistoryEntry[]> {
    const docs = await Summary.find({ userId: DEFAULT_USER_ID })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return (docs as unknown as ISummary[]).map(toHistoryEntry);
  }

  /** Get a single entry by its Mongo _id */
  async getById(id: string): Promise<HistoryEntry | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const doc = await Summary.findOne({
      _id: id,
      userId: DEFAULT_USER_ID,
    }).lean();

    return doc ? toHistoryEntry(doc as unknown as ISummary) : null;
  }

  /** Create a new summary record and return a HistoryEntry */
  async add(
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
      userId: DEFAULT_USER_ID,
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

  /** Delete a single entry by _id */
  async deleteById(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;

    const result = await Summary.deleteOne({
      _id: id,
      userId: DEFAULT_USER_ID,
    });

    return result.deletedCount > 0;
  }

  /** Clear all summaries for the default user */
  async clearAll(): Promise<void> {
    await Summary.deleteMany({ userId: DEFAULT_USER_ID });
  }
}

export const historyStore = new HistoryStore();
