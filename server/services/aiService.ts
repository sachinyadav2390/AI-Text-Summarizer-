/**
 * AI Summarization Service
 *
 * Connects to the Python FastAPI Transformer engine at localhost:8000.
 * Falls back to extractive summarization if the AI service is unavailable.
 * Supports: bullet points, keyword extraction, multilingual, URL extraction.
 */

export type SummaryLength = "short" | "medium" | "long";
export type ModelKey = "bart" | "t5" | "pegasus";
export type SummaryFormat = "paragraph" | "bullets";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

export interface SummarizeOptions {
  text: string;
  length: SummaryLength;
  model?: ModelKey;
  maxWords?: number;
  format?: SummaryFormat;
  extractKeywords?: boolean;
  sourceLang?: string;
  targetLang?: string;
}

export interface SummarizeResult {
  summary: string;
  bullets?: string[];
  keywords?: string[];
  model: string;
  processingTimeMs: number;
  device?: string;
  inputTokens?: number;
  outputTokens?: number;
  translatedFrom?: string;
  translatedTo?: string;
}

interface AIHealthResponse {
  status: string;
}

interface AISummarizeResponse {
  success: boolean;
  summary: string;
  bullets?: string[];
  keywords?: string[];
  model: string;
  model_key: string;
  device: string;
  processing_time_ms: number;
  input_tokens: number;
  output_tokens: number;
  translated_from?: string;
  translated_to?: string;
}

interface AIErrorResponse {
  detail?: string;
}

export interface URLExtractResponse {
  success: boolean;
  title: string;
  text: string;
  authors: string;
  wordCount: number;
}

/**
 * Check if the Python AI service is healthy.
 */
export async function checkAIHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = (await res.json()) as AIHealthResponse;
    return data.status === "ok";
  } catch {
    return false;
  }
}

/**
 * Summarize text — tries the Python Transformer engine first,
 * falls back to extractive method if unavailable.
 */
export async function summarize(opts: SummarizeOptions): Promise<SummarizeResult> {
  const {
    text,
    length,
    model = "t5",
    maxWords,
    format = "paragraph",
    extractKeywords = false,
    sourceLang,
    targetLang,
  } = opts;

  const start = Date.now();

  try {
    const res = await fetch(`${AI_SERVICE_URL}/ai/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        length,
        model,
        max_words: maxWords || null,
        format,
        extract_keywords: extractKeywords,
        source_lang: sourceLang || null,
        target_lang: targetLang || null,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as AIErrorResponse;
      throw new Error(err.detail || `AI service returned ${res.status}`);
    }

    const data = (await res.json()) as AISummarizeResponse;

    if (data.success && data.summary) {
      console.log(
        `🤖 AI Summary: model=${data.model}, device=${data.device}, ` +
        `${data.input_tokens}→${data.output_tokens} tokens, ${data.processing_time_ms}ms`
      );

      return {
        summary: data.summary,
        bullets: data.bullets || undefined,
        keywords: data.keywords || undefined,
        model: data.model || `${model}-transformer`,
        processingTimeMs: data.processing_time_ms || (Date.now() - start),
        device: data.device,
        inputTokens: data.input_tokens,
        outputTokens: data.output_tokens,
        translatedFrom: data.translated_from || undefined,
        translatedTo: data.translated_to || undefined,
      };
    }

    throw new Error("Invalid response from AI service");
  } catch (error) {
    console.warn(
      `⚠️  AI service unavailable, using extractive fallback: ${error instanceof Error ? error.message : "unknown error"
      }`
    );

    const summary = extractiveSummarize(text, length, maxWords);
    const result: SummarizeResult = {
      summary,
      model: "extractive-fallback-v1",
      processingTimeMs: Date.now() - start,
    };

    if (format === "bullets") {
      result.bullets = summary
        .replace(/([.!?])\s+/g, "$1|||")
        .split("|||")
        .map(s => s.trim())
        .filter(s => s.length > 10);
    }

    if (extractKeywords) {
      result.keywords = extractKeywordsFallback(text);
    }

    if (targetLang && targetLang !== "en") {
      try {
        console.log(`🌐 Fallback: Translating summary to ${targetLang}...`);
        result.summary = await translateText(result.summary, "en", targetLang);
        result.translatedTo = targetLang;
        if (result.bullets) {
          result.bullets = await Promise.all(
            result.bullets.map((b) => translateText(b, "en", targetLang).catch(() => b))
          );
        }
      } catch (transError) {
        console.warn(`❌ Fallback translation failed: ${transError instanceof Error ? transError.message : "unknown"}`);
      }
    }

    return result;
  }
}

/**
 * Translate text via Python AI service.
 */
export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/ai/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`Translation service returned ${res.status}`);
    }

    const data = (await res.json()) as { success: boolean; translatedText: string };
    return data.translatedText;
  } catch (error) {
    console.error(`❌ Translation failed: ${error instanceof Error ? error.message : "unknown"}`);
    return text; // Fallback to original text
  }
}

/**
 * Extract article text from URL via Python AI service.
 */
export async function extractFromURL(url: string): Promise<URLExtractResponse> {
  const res = await fetch(`${AI_SERVICE_URL}/ai/extract-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as AIErrorResponse;
    throw new Error(err.detail || `URL extraction failed with status ${res.status}`);
  }

  return (await res.json()) as URLExtractResponse;
}

// ─── Extractive Fallback ──────────────────────────────────────

function extractiveSummarize(text: string, length: SummaryLength, maxWords?: number): string {
  const sentences = text
    .replace(/([.!?])\s+/g, "$1|||")
    .split("|||")
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  if (sentences.length === 0) {
    return text.slice(0, 300).trim();
  }

  const scored = sentences.map((s, i) => ({
    text: s,
    index: i,
    score: scoreSentence(s, i, sentences.length),
  }));

  scored.sort((a, b) => b.score - a.score);

  const counts: Record<SummaryLength, number> = {
    short: Math.max(2, Math.ceil(sentences.length * 0.15)),
    medium: Math.max(4, Math.ceil(sentences.length * 0.3)),
    long: Math.max(6, Math.ceil(sentences.length * 0.5)),
  };

  const topN = scored.slice(0, counts[length]);
  topN.sort((a, b) => a.index - b.index);

  let result = topN.map((s) => s.text).join(" ");

  if (maxWords && maxWords > 0) {
    const words = result.split(/\s+/);
    if (words.length > maxWords) {
      result = words.slice(0, maxWords).join(" ");
      if (result && !".!?".includes(result[result.length - 1])) {
        result += ".";
      }
    }
  }

  return result;
}

function scoreSentence(sentence: string, index: number, total: number): number {
  let score = 0;
  if (index === 0) score += 3;
  if (index === total - 1) score += 1.5;
  score += (1 - index / total) * 2;

  const words = sentence.split(/\s+/).length;
  if (words >= 10 && words <= 40) score += 1.5;
  else if (words > 40) score += 0.5;

  if (/\d/.test(sentence)) score += 0.5;
  if (/[""\u201C\u201D]/.test(sentence)) score += 0.3;

  return score;
}

function extractKeywordsFallback(text: string, max = 8): string[] {
  const stopWords = new Set(
    "a an the and or but in on at to for of is it its was were be been being have has had do does did will would shall should can could may might must i me my we our you your he him his she her they them their this that these those what which who whom when where why how all each every both few more most other some such no not only same so than too very just about above after again against as before between by during from into out over through under until up with also are if then because while".split(" ")
  );

  const words = text.toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!stopWords.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, max)
    .map(([word]) => word);
}
