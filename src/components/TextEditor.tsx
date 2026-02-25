"use client";

import { useState, useCallback } from "react";

interface TextEditorProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function TextEditor({ text, onTextChange }: TextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleClear = useCallback(() => {
    onTextChange("");
  }, [onTextChange]);

  const handlePaste = useCallback(async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      onTextChange(clipText);
    } catch {
      // Clipboard access denied
    }
  }, [onTextChange]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            style={{ color: "var(--accent)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Input Text
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePaste} className="btn-secondary flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Paste
          </button>
          {text && (
            <button onClick={handleClear} className="btn-secondary flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          className="input-area"
          style={{ minHeight: "280px" }}
          placeholder="Paste your article, paragraph, or any text here to summarize..."
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Focus indicator line */}
        <div
          className="absolute bottom-0 left-0 h-0.5 transition-all duration-300 rounded-b-lg"
          style={{
            background: "linear-gradient(90deg, #dc2626, #ef4444)",
            width: isFocused ? "100%" : "0%",
          }}
        />
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-3">
          <span className="word-badge">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            {wordCount} words
          </span>
          <span className="word-badge">
            {charCount} chars
          </span>
        </div>
        {wordCount > 0 && wordCount < 30 && (
          <span className="text-xs" style={{ color: "var(--warning)" }}>
            Add more text for better results
          </span>
        )}
      </div>
    </div>
  );
}
