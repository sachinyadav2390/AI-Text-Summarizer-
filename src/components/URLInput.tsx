"use client";

import { useState, useCallback } from "react";
import { apiExtractURL } from "@/lib/api";

interface URLInputProps {
  onArticleText: (text: string, title?: string) => void;
}

export default function URLInput({ onArticleText }: URLInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleInfo, setArticleInfo] = useState<{ title: string; wordCount: number } | null>(null);

  const handleExtract = useCallback(async () => {
    if (!url.trim()) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (e.g. https://example.com/article)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setArticleInfo(null);

    try {
      const res = await apiExtractURL(url);

      if (res.success && res.data) {
        setArticleInfo({
          title: res.data.title,
          wordCount: res.data.wordCount,
        });
        onArticleText(res.data.text, res.data.title);
      } else {
        setError(res.error || "Failed to extract article. Please try a different URL.");
      }
    } catch {
      setError("Could not connect to the server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  }, [url, onArticleText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleExtract();
    },
    [handleExtract]
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          URL Article Summarizer
        </h2>
      </div>

      <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
        Paste a news article or blog URL to extract and summarize its content
      </p>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/article..."
            className="input-area w-full"
            style={{ minHeight: "auto", padding: "12px 16px", fontSize: "0.9rem" }}
          />
        </div>
        <button
          onClick={handleExtract}
          disabled={!url.trim() || isLoading}
          className="btn-primary shrink-0 flex items-center gap-2"
          style={{ padding: "12px 20px" }}
        >
          {isLoading ? (
            <>
              <div className="spinner" />
              Extracting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Extract
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 rounded-lg flex items-center gap-2" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <svg className="w-4 h-4 shrink-0" style={{ color: "#dc2626" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm" style={{ color: "#dc2626" }}>{error}</span>
        </div>
      )}

      {/* Success info */}
      {articleInfo && (
        <div className="mt-3 p-3 rounded-lg flex items-center gap-2" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <svg className="w-4 h-4 shrink-0" style={{ color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium block truncate" style={{ color: "#16a34a" }}>
              {articleInfo.title || "Article extracted"}
            </span>
            <span className="text-xs" style={{ color: "#4ade80" }}>
              {articleInfo.wordCount} words extracted — switched to Text tab
            </span>
          </div>
        </div>
      )}

      {/* Flow diagram */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="px-2 py-1 rounded" style={{ background: "var(--bg-input)" }}>Paste URL</span>
        <span>→</span>
        <span className="px-2 py-1 rounded" style={{ background: "var(--bg-input)" }}>Extract Article</span>
        <span>→</span>
        <span className="px-2 py-1 rounded" style={{ background: "var(--bg-input)" }}>Summarize</span>
      </div>
    </div>
  );
}
