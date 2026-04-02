"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface TextEditorProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function TextEditor({ text, onTextChange }: TextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!text.trim()) return;
      window.speechSynthesis.cancel(); // Prevent stuck speech
      const utterance = new SpeechSynthesisUtterance(text);

      // Auto-detect Hindi script for proper pronunciation
      const isHindi = /[\u0900-\u097F]/.test(text);
      utterance.lang = isHindi ? "hi-IN" : "en-US";

      // Use a cute/female voice if available
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      if (isHindi) {
        selectedVoice = voices.find(v => v.lang.includes("hi") && (v.name.includes("Female") || v.name.includes("Google")));
      } else {
        selectedVoice = voices.find(v =>
          (v.lang.includes("en") && (v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Samantha")))
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Adjust pitch for a slightly "cuter" tone
      utterance.pitch = 1.2;
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false); // Graceful fallback
      utteranceRef.current = utterance; // Prevent garbage collection
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  }, [text, isSpeaking]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={handlePaste} className="btn-secondary flex items-center gap-1.5 px-2.5 sm:px-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="hidden sm:inline">Paste</span>
          </button>
          {text && (
            <>
              <button
                onClick={handleSpeak}
                className={`btn-secondary flex items-center gap-1.5 px-2.5 sm:px-4 ${isSpeaking ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? (
                  <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
                <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Read"}</span>
              </button>
              <button onClick={handleClear} className="btn-secondary flex items-center gap-1.5 px-2.5 sm:px-4">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
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
