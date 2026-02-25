/**
 * Frontend API client — all calls to the Express backend go through here.
 */

const API_BASE = "/api";

// ─── Types ───────────────────────────────────────────────

export interface SummarizeRequest {
  text: string;
  length: "short" | "medium" | "long";
  maxWords?: number;
  format?: "paragraph" | "bullets";
  extractKeywords?: boolean;
  sourceLang?: string;
  targetLang?: string;
}

export interface SummarizeResponse {
  success: boolean;
  data?: {
    summary: string;
    bullets?: string[] | null;
    keywords?: string[] | null;
    model: string;
    processingTimeMs: number;
    inputWordCount: number;
    summaryWordCount: number;
    historyId: string;
    translatedFrom?: string | null;
    translatedTo?: string | null;
  };
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    text: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    charCount: number;
    wordCount: number;
  };
  error?: string;
}

export interface URLExtractResponse {
  success: boolean;
  data?: {
    title: string;
    text: string;
    authors: string;
    wordCount: number;
  };
  error?: string;
}

export interface HistoryEntry {
  id: string;
  inputText: string;
  inputPreview: string;
  summary: string;
  summaryPreview: string;
  length: string;
  wordCount: number;
  summaryWordCount: number;
  modelUsed: string;
  createdAt: string;
}

export interface HistoryResponse {
  success: boolean;
  data?: {
    entries: HistoryEntry[];
    total: number;
  };
  error?: string;
}

// ─── API Functions ───────────────────────────────────────

/**
 * POST /api/summarize
 */
export async function apiSummarize(req: SummarizeRequest): Promise<SummarizeResponse> {
  const res = await fetch(`${API_BASE}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: req.text,
      length: req.length,
      maxWords: req.maxWords,
      format: req.format || "paragraph",
      extractKeywords: req.extractKeywords || false,
      sourceLang: req.sourceLang,
      targetLang: req.targetLang,
    }),
  });
  return res.json();
}

/**
 * POST /api/extract-url
 */
export async function apiExtractURL(url: string): Promise<URLExtractResponse> {
  const res = await fetch(`${API_BASE}/extract-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

/**
 * POST /api/upload
 */
export async function apiUploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

/**
 * GET /api/history
 */
export async function apiGetHistory(limit?: number): Promise<HistoryResponse> {
  const query = limit ? `?limit=${limit}` : "";
  const res = await fetch(`${API_BASE}/history${query}`);
  return res.json();
}

/**
 * DELETE /api/history/:id
 */
export async function apiDeleteHistory(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: "DELETE" });
  return res.json();
}

/**
 * DELETE /api/history  (clear all)
 */
export async function apiClearHistory(): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/history`, { method: "DELETE" });
  return res.json();
}
