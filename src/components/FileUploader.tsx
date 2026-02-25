"use client";

import { useState, useCallback, useRef } from "react";
import { apiUploadFile } from "@/lib/api";

interface FileUploaderProps {
  onFileText: (text: string) => void;
}

export default function FileUploader({ onFileText }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_EXTENSIONS = [".txt", ".pdf", ".doc", ".docx"];

  const readFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsLoading(true);
      setFileName(file.name);

      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setError("Unsupported file type. Please upload a TXT, PDF, or DOC file.");
        setIsLoading(false);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File is too large. Max size is 10MB.");
        setIsLoading(false);
        return;
      }

      try {
        // Send file to backend API for processing
        const res = await apiUploadFile(file);

        if (res.success && res.data) {
          onFileText(res.data.text);
        } else {
          // Fallback: try client-side text extraction for TXT files
          if (ext === ".txt") {
            const text = await file.text();
            onFileText(text);
          } else {
            setError(
              res.error ||
                "Could not extract text from this file. For PDF/DOC files, please paste the text directly."
            );
          }
        }
      } catch {
        // Backend not running — fallback to client-side read
        try {
          const text = await file.text();
          if (text.trim()) {
            onFileText(text);
          } else {
            setError("Could not extract text. Make sure the backend server is running for PDF/DOC support.");
          }
        } catch {
          setError("Failed to read the file. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onFileText]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  const handleRemoveFile = useCallback(() => {
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Upload File
        </h2>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all ${
          isDragging ? "drag-over" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="spinner" style={{ borderTopColor: "var(--accent)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Reading file...
            </span>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-glow)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--accent)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {fileName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="text-xs hover:underline"
              style={{ color: "var(--error)" }}
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "var(--bg-hover)" }}
            >
              <svg
                className="w-7 h-7"
                style={{ color: "var(--text-muted)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              Drop your file here or{" "}
              <span style={{ color: "var(--accent)" }}>browse</span>
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Supports TXT, PDF, DOC — Max 10MB
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="mt-3 p-3 rounded-lg text-sm flex items-center gap-2"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "var(--error)",
          }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
