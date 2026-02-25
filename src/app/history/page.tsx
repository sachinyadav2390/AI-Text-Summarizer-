"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGetHistory, apiDeleteHistory, apiClearHistory, HistoryEntry } from "@/lib/api";

export default function HistoryDashboard() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewEntry, setViewEntry] = useState<HistoryEntry | null>(null);
  const [filter, setFilter] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetHistory(100);
      if (res.success && res.data) {
        setEntries(res.data.entries);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = useCallback(async (id: string) => {
    await apiDeleteHistory(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (viewEntry?.id === id) setViewEntry(null);
  }, [viewEntry]);

  const handleClearAll = useCallback(async () => {
    if (!confirm("Clear all history?")) return;
    await apiClearHistory();
    setEntries([]);
    setViewEntry(null);
  }, []);

  const filtered = entries.filter((e) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      e.inputPreview.toLowerCase().includes(q) ||
      e.summaryPreview.toLowerCase().includes(q) ||
      e.length.toLowerCase().includes(q) ||
      (e.modelUsed || "").toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="header-gradient sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)", boxShadow: "0 2px 12px rgba(220, 38, 38, 0.3)" }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">History Dashboard</h1>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>All your past summaries</p>
                </div>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/" className="btn-secondary flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </a>
              {entries.length > 0 && (
                <button onClick={handleClearAll} className="btn-secondary flex items-center gap-1.5" style={{ color: "var(--error)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Summaries", value: entries.length, icon: "📊" },
            { label: "Short", value: entries.filter(e => e.length === "short").length, icon: "⚡" },
            { label: "Medium", value: entries.filter(e => e.length === "medium").length, icon: "📝" },
            { label: "Long", value: entries.filter(e => e.length === "long").length, icon: "📄" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent)" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search history..."
            className="input-area w-full"
            style={{ minHeight: "auto", padding: "12px 16px" }}
          />
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="spinner mx-auto mb-3" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
              <p style={{ color: "var(--text-muted)" }}>Loading history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent-soft)" }}>
                <svg className="w-8 h-8" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {filter ? "No matching summaries" : "No summaries yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="history-table w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Length</th>
                    <th>Words</th>
                    <th>Model</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="history-table-row">
                      <td className="whitespace-nowrap">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {formatDate(entry.createdAt)}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm font-medium line-clamp-1" style={{ color: "var(--text-primary)", maxWidth: "300px" }}>
                          {entry.inputPreview}
                        </p>
                      </td>
                      <td>
                        <span className="length-badge" data-length={entry.length}>
                          {entry.length}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {entry.wordCount} → {entry.summaryWordCount}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {(entry.modelUsed || "bart").split("(")[0].trim().slice(0, 20)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewEntry(entry)}
                            className="btn-secondary flex items-center gap-1"
                            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="btn-secondary flex items-center gap-1"
                            style={{ padding: "4px 10px", fontSize: "0.75rem", color: "var(--error)" }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* View Modal */}
      {viewEntry && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setViewEntry(null)}
        >
          <div
            className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Summary Details</h3>
              <button onClick={() => setViewEntry(null)} className="btn-secondary" style={{ padding: "4px 8px" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <span className="length-badge" data-length={viewEntry.length}>{viewEntry.length}</span>
                <span className="word-badge">{viewEntry.wordCount} → {viewEntry.summaryWordCount} words</span>
                <span className="word-badge">{formatDate(viewEntry.createdAt)}</span>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--accent)" }}>Original Text</h4>
                <div className="p-4 rounded-lg text-sm" style={{ background: "var(--bg-input)", color: "var(--text-secondary)", lineHeight: "1.7", maxHeight: "200px", overflow: "auto" }}>
                  {viewEntry.inputText}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--accent)" }}>Summary</h4>
                <div className="p-4 rounded-lg text-sm" style={{ background: "var(--accent-soft)", color: "var(--text-primary)", lineHeight: "1.7" }}>
                  {viewEntry.summary}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
