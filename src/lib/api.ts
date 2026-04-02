/**
 * Frontend API client — all calls to the Express backend go through here.
 */

const API_BASE = "http://127.0.0.1:5000/api";

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
  try {
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
      // AI inference on CPU can take 60–120s — keep connection open for 3 min
      signal: AbortSignal.timeout(180_000),
    });
    return res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return { success: false, error: "The AI model is still processing. Please wait and try again in a moment." };
    }
    if (err instanceof TypeError) {
      return { success: false, error: "Could not reach the backend server. Make sure it is running on port 5000." };
    }
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
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

/**
 * POST /api/contact
 */
export async function apiSendContactMessage(data: {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const result = await res.json();
    if (!res.ok) {
      console.error("❌ API Error:", result);
      return { success: false, error: result.error || `Server returned ${res.status}` };
    }
    return result;
  } catch (err) {
    console.error("❌ Connection Error:", err);
    return { success: false, error: "Failed to connect to the server. Please check if the backend is running on port 5000." };
  }
}
