"use client";

import { useCallback } from "react";

export interface HistoryEntry {
  id: string;
  inputPreview: string;
  summaryPreview: string;
  length: string;
  timestamp: Date;
  fullInput: string;
  fullSummary: string;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelectEntry: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

export default function HistoryPanel({
  history,
  onSelectEntry,
  onClearHistory,
}: HistoryPanelProps) {
  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }, []);

  const lengthColor = useCallback((length: string) => {
    switch (length) {
      case "short":
        return "#dc2626";
      case "medium":
        return "#ea580c";
      case "long":
        return "#9333ea";
      default:
        return "#94a3b8";
    }
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            History
          </h2>
          {history.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent)",
              }}
            >
              {history.length}
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* History List */}
      <div
        className="space-y-2 overflow-y-auto pr-1"
        style={{ maxHeight: "400px" }}
      >
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "var(--accent-soft)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--text-muted)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No summaries yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Your summaries will appear here
            </p>
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              className="history-item"
              onClick={() => onSelectEntry(entry)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: `${lengthColor(entry.length)}20`,
                    color: lengthColor(entry.length),
                  }}
                >
                  {entry.length}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatTime(entry.timestamp)}
                </span>
              </div>
              <p
                className="text-sm font-medium mb-1 line-clamp-1"
                style={{ color: "var(--text-primary)" }}
              >
                {entry.inputPreview}
              </p>
              <p
                className="text-xs line-clamp-2"
                style={{ color: "var(--text-muted)", lineHeight: "1.5" }}
              >
                {entry.summaryPreview}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
