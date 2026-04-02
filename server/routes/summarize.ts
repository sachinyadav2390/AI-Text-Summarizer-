import { Router, Request, Response } from "express";
import path from "path";
import { PDFParse } from "pdf-parse";
import { validateTextInput, validateSummaryLength } from "../middleware/validate";
import { summarize, checkAIHealth, extractFromURL } from "../services/aiService";
import { historyStore } from "../store/historyStore";

export const summarizeRouter = Router();

/**
 * POST /api/summarize
 *
 * Body: { text, length?, model?, maxWords?, format?, extractKeywords?, sourceLang?, targetLang? }
 */
summarizeRouter.post(
  "/summarize",
  validateTextInput,
  validateSummaryLength,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        text,
        length,
        model,
        maxWords,
        format,
        extractKeywords,
        sourceLang,
        targetLang,
      } = req.body;

      console.log(
        `📝 Summarize request: ${text.length} chars, length=${length}, ` +
        `model=${model || "bart"}, format=${format || "paragraph"}`
      );

      const result = await summarize({
        text,
        length,
        model: model || "t5",
        maxWords: maxWords || undefined,
        format: format || "paragraph",
        extractKeywords: extractKeywords || false,
        sourceLang: sourceLang || undefined,
        targetLang: targetLang || undefined,
      });

      // Save to history (MongoDB)
      const historyEntry = await historyStore.add(text, result.summary, length, {
        modelUsed: result.model,
        processingTimeMs: result.processingTimeMs,
        device: result.device,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      });

      res.json({
        success: true,
        data: {
          summary: result.summary,
          bullets: result.bullets || null,
          keywords: result.keywords || null,
          model: result.model,
          processingTimeMs: result.processingTimeMs,
          device: result.device || "cpu",
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          inputWordCount: text.trim().split(/\s+/).length,
          summaryWordCount: result.summary.trim().split(/\s+/).length,
          historyId: historyEntry.id,
          translatedFrom: result.translatedFrom || null,
          translatedTo: result.translatedTo || null,
        },
      });
    } catch (error) {
      console.error("Summarize error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate summary. Please try again.",
      });
    }
  }
);

/**
 * POST /api/extract-url
 *
 * Body: { url: string }
 * Extracts article text from URL.
 */
summarizeRouter.post("/extract-url", async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      res.status(400).json({ success: false, error: "URL is required." });
      return;
    }

    let sanitizedUrl = url;
    // Handle chrome-extension://.../https://...
    if (url.startsWith("chrome-extension://") && url.includes("/http")) {
      const match = url.match(/\/https?:\/\/.+$/);
      if (match) {
        sanitizedUrl = match[0].substring(1); // remove leading /
        console.log(`🧹 Sanitized URL: ${sanitizedUrl}`);
      }
    }

    const result = await (async () => {
      // If it's a PDF URL, extract text directly in backend
      if (sanitizedUrl.toLowerCase().endsWith(".pdf")) {
        console.log("📄 Detected PDF URL, extracting directly in backend...");
        const response = await fetch(sanitizedUrl, {
          signal: AbortSignal.timeout(30_000), // 30s timeout
        });
        if (!response.ok) {
          throw new Error(`Failed to download PDF: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log(`📥 Downloaded PDF: ${buffer.length} bytes`);

        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        await parser.destroy();
        console.log(`🔍 Extracted PDF text: ${data.text.length} chars`);

        return {
          title: path.basename(sanitizedUrl),
          text: data.text,
          authors: "Extracted from PDF",
          wordCount: data.text.split(/\s+/).length,
        };
      } else {
        // Otherwise use the AI service (for HTML articles)
        return await extractFromURL(sanitizedUrl);
      }
    })();

    res.json({
      success: true,
      data: {
        title: result.title,
        text: result.text,
        authors: result.authors,
        wordCount: result.wordCount,
      },
    });
  } catch (error) {
    console.error("URL extraction error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract article from URL.",
    });
  }
});

/**
 * GET /api/ai-status
 */
summarizeRouter.get("/ai-status", async (_req: Request, res: Response): Promise<void> => {
  const healthy = await checkAIHealth();
  res.json({
    aiServiceOnline: healthy,
    fallbackAvailable: true,
    message: healthy
      ? "AI Transformer engine is online"
      : "AI service offline — using extractive fallback",
  });
});
