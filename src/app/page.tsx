"use client";

import { useState, useCallback, useEffect } from "react";
import TextEditor from "@/components/TextEditor";
import FileUploader from "@/components/FileUploader";
import URLInput from "@/components/URLInput";
import SummaryOptions, { SummaryOptionsState } from "@/components/SummaryOptions";
import ResultViewer from "@/components/ResultViewer";
import HistoryPanel, { HistoryEntry } from "@/components/HistoryPanel";
import Navbar from "@/components/Navbar";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";
import {
  apiSummarize,
  apiGetHistory,
  apiClearHistory,
  HistoryEntry as ApiHistoryEntry,
} from "@/lib/api";

// Map backend history to frontend shape
function toFrontendEntry(e: ApiHistoryEntry): HistoryEntry {
  return {
    id: e.id,
    inputPreview: e.inputPreview,
    summaryPreview: e.summaryPreview,
    length: e.length,
    timestamp: new Date(e.createdAt),
    fullInput: e.inputText,
    fullSummary: e.summary,
  };
}

const DEFAULT_OPTIONS: SummaryOptionsState = {
  length: "medium",
  maxWords: 120,
  format: "paragraph",
  extractKeywords: false,
  sourceLang: "",
  targetLang: "",
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [options, setOptions] = useState<SummaryOptionsState>(DEFAULT_OPTIONS);
  const [summary, setSummary] = useState("");
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [keywords, setKeywords] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"text" | "file" | "url">("text");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulated Auth Handlers
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);
  const handleSignin = () => setIsLoggedIn(true);

  // Load history from backend on mount
  useEffect(() => {
    apiGetHistory(20)
      .then((res) => {
        if (res.success && res.data) {
          setHistory(res.data.entries.map(toFrontendEntry));
        }
      })
      .catch(() => { });
  }, []);

  const handleFileText = useCallback((text: string) => {
    setInputText(text);
    setActiveTab("text");
  }, []);

  const handleURLText = useCallback((text: string) => {
    setInputText(text);
    setActiveTab("text");
  }, []);

  const handleSummarize = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setSummary("");
    setBullets(null);
    setKeywords(null);
    setError("");

    try {
      let finalSourceLang = options.sourceLang || undefined;
      let finalTargetLang = options.targetLang || undefined;

      // Auto-detect Hindi and translate to English if no language options are specifically set
      if (!finalSourceLang && /[\u0900-\u097F]/.test(inputText)) {
        finalSourceLang = "hi";
        if (!finalTargetLang) {
          finalTargetLang = "en";
        }
      }

      const res = await apiSummarize({
        text: inputText,
        length: options.length,
        maxWords: options.maxWords,
        format: options.format,
        extractKeywords: options.extractKeywords,
        sourceLang: finalSourceLang,
        targetLang: finalTargetLang,
      });

      if (res.success && res.data) {
        setSummary(res.data.summary);
        setBullets(res.data.bullets || null);
        setKeywords(res.data.keywords || null);

        // Refresh history from backend
        const histRes = await apiGetHistory(20);
        if (histRes.success && histRes.data) {
          setHistory(histRes.data.entries.map(toFrontendEntry));
        }
      } else {
        setError(res.error || "Failed to generate summary. Please try again.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setInputText(entry.fullInput);
    setSummary(entry.fullSummary);
    setBullets(null);
    setKeywords(null);
    setError("");
  }, []);

  const handleClearHistory = useCallback(async () => {
    await apiClearHistory().catch(() => { });
    setHistory([]);
  }, []);

  const canSummarize = inputText.trim().length > 0 && !isLoading;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLoginSuccess={handleLogin}
        onLogout={handleLogout}
      />

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Input */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tab Switcher: Text / File / URL */}
            <div className="glass-card p-6">
              <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: "var(--bg-input)" }}>
                <button
                  onClick={() => setActiveTab("text")}
                  className={`tab-btn ${activeTab === "text" ? "active" : "inactive"}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Paste Text
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("file")}
                  className={`tab-btn ${activeTab === "file" ? "active" : "inactive"}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload File
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("url")}
                  className={`tab-btn ${activeTab === "url" ? "active" : "inactive"}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    URL
                  </span>
                </button>
              </div>

              {/* Active Tab Content */}
              {activeTab === "text" ? (
                <TextEditor text={inputText} onTextChange={setInputText} />
              ) : activeTab === "file" ? (
                <FileUploader onFileText={handleFileText} />
              ) : (
                <URLInput onArticleText={handleURLText} />
              )}
            </div>

            {/* Options + Summarize */}
            <div className="glass-card p-6">
              <div className="flex flex-col gap-4">
                <SummaryOptions options={options} onChange={setOptions} />

                <div className="flex justify-end">
                  <button
                    onClick={handleSummarize}
                    disabled={!canSummarize}
                    className="btn-primary flex items-center gap-2 shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Summarize
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="glass-card p-6">
              <ResultViewer
                summary={summary}
                bullets={bullets}
                keywords={keywords}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-1">
            <div className="glass-card p-5 lg:sticky lg:top-24">
              <HistoryPanel
                history={history}
                onSelectEntry={handleSelectHistory}
                onClearHistory={handleClearHistory}
              />
            </div>
          </div>
        </div>
      </main>

      <TeamSection />
      <ContactSection />

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: "1px solid var(--border)" }} className="mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              AI Text Summarizer — Built with Next.js, Tailwind & 🤗 Transformers
            </p>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="status-dot" />
              Transformer Model Ready
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
