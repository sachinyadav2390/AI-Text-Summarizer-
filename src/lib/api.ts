/**
 * Frontend API client — all calls to the Express backend go through here.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

/**
 * Helper to get authentication headers from localStorage.
 */
function getAuthHeaders(contentType = "application/json") {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: Record<string, string> = {};
  if (contentType !== "multipart/form-data") {
    headers["Content-Type"] = contentType;
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

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
 * POST /api/auth/send-otp
 */
export async function apiSendOTP(phone: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  } catch (err) {
    console.error("Send OTP connection error:", err);
    return { success: false, error: "Failed to connect to the server." };
  }
}

/**
 * POST /api/auth/verify-otp
 */
export async function apiVerifyOTP(phone: string, code: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    return res.json();
  } catch (err) {
    console.error("Verify OTP connection error:", err);
    return { success: false, error: "Failed to connect to the server." };
  }
}

/**
 * POST /api/summarize
 */
export async function apiSummarize(req: SummarizeRequest): Promise<SummarizeResponse> {
  try {
    const res = await fetch(`${API_BASE}/summarize`, {
      method: "POST",
      headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders("multipart/form-data"),
    body: formData,
  });
  return res.json();
}

/**
 * GET /api/history
 */
export async function apiGetHistory(limit?: number): Promise<HistoryResponse> {
  const query = limit ? `?limit=${limit}` : "";
  const res = await fetch(`${API_BASE}/history${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

/**
 * DELETE /api/history/:id
 */
export async function apiDeleteHistory(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/history/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

/**
 * DELETE /api/history  (clear all)
 */
export async function apiClearHistory(): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/history`, { 
    method: "DELETE",
    headers: getAuthHeaders(),
  });
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

/**
 * Generic Auth-aware POST helper for simple JSON data.
 */
export async function postData(endpoint: string, data: any) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  } catch (err) {
    console.error(`Post error to ${endpoint}:`, err);
    return { success: false, error: "Connection error." };
  }
}
