"use client";

import { useState } from "react";

export type SummaryLength = "short" | "medium" | "long";
export type SummaryFormat = "paragraph" | "bullets";

export interface SummaryOptionsState {
  length: SummaryLength;
  maxWords: number;
  format: SummaryFormat;
  extractKeywords: boolean;
  sourceLang: string;
  targetLang: string;
}

interface SummaryOptionsProps {
  options: SummaryOptionsState;
  onChange: (opts: SummaryOptionsState) => void;
}

const LENGTH_OPTIONS: { value: SummaryLength; label: string; words: number; icon: string }[] = [
  { value: "short", label: "Short", words: 50, icon: "⚡" },
  { value: "medium", label: "Medium", words: 120, icon: "📝" },
  { value: "long", label: "Long", words: 200, icon: "📄" },
];

const LANGUAGES = [
  { code: "", label: "Auto (English)" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ja", label: "Japanese" },
  { code: "ru", label: "Russian" },
];

export default function SummaryOptions({ options, onChange }: SummaryOptionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (patch: Partial<SummaryOptionsState>) => {
    onChange({ ...options, ...patch });
  };

  const handleLengthClick = (opt: typeof LENGTH_OPTIONS[0]) => {
    update({ length: opt.value, maxWords: opt.words });
  };

  return (
    <div className="animate-fade-in w-full">
      {/* ── Length Selector ── */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Summary Options
        </h2>
      </div>

      {/* Length pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {LENGTH_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleLengthClick(opt)}
            className={`option-pill flex items-center gap-2 ${options.length === opt.value ? "active" : ""}`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
            <span
              className="text-xs opacity-70"
              style={{ color: options.length === opt.value ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}
            >
              ~{opt.words}w
            </span>
          </button>
        ))}
      </div>

      {/* Word Limit Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Max Words
          </label>
          <span className="word-badge">{options.maxWords} words</span>
        </div>
        <input
          type="range"
          min={20}
          max={500}
          step={10}
          value={options.maxWords}
          onChange={(e) => update({ maxWords: Number(e.target.value) })}
          className="range-slider w-full"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          <span>20</span>
          <span>250</span>
          <span>500</span>
        </div>
      </div>

      {/* Format + Keywords toggles */}
      <div className="flex flex-wrap gap-3 mb-3">
        {/* Bullet Toggle */}
        <button
          onClick={() => update({ format: options.format === "bullets" ? "paragraph" : "bullets" })}
          className={`option-pill flex items-center gap-2 ${options.format === "bullets" ? "active" : ""}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Bullet Points
        </button>

        {/* Keywords Toggle */}
        <button
          onClick={() => update({ extractKeywords: !options.extractKeywords })}
          className={`option-pill flex items-center gap-2 ${options.extractKeywords ? "active" : ""}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Keywords
        </button>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`option-pill flex items-center gap-2 ${showAdvanced ? "active" : ""}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          Multilingual
        </button>
      </div>

      {/* Advanced: Language selectors */}
      {showAdvanced && (
        <div className="p-4 rounded-xl animate-fade-in" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
            🌐 Multilingual Summarization
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Input Language</label>
              <select
                value={options.sourceLang}
                onChange={(e) => update({ sourceLang: e.target.value })}
                className="lang-select"
              >
                {LANGUAGES.map((l) => (
                  <option key={`src-${l.code}`} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Output Language</label>
              <select
                value={options.targetLang}
                onChange={(e) => update({ targetLang: e.target.value })}
                className="lang-select"
              >
                {LANGUAGES.map((l) => (
                  <option key={`tgt-${l.code}`} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Input in any language → Translates → Summarizes → Translates back
          </p>
        </div>
      )}
    </div>
  );
}
