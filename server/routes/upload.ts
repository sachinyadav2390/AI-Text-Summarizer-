import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

export const uploadRouter = Router();

// ─── Multer config ───────────────────────────────────────
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = [".txt", ".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowedExtensions.join(", ")}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * POST /api/upload
 *
 * Accepts a file upload (TXT/PDF/DOC/DOCX) and extracts text from it.
 * Returns the extracted text for the frontend to use with /summarize.
 *
 * FormData: file (field name = "file")
 * Response: { text, fileName, fileSize, fileType }
 */
uploadRouter.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "No file uploaded. Please attach a file.",
        });
        return;
      }

      const filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();

      let extractedText = "";

      if (ext === ".txt") {
        // Plain text — read directly
        extractedText = fs.readFileSync(filePath, "utf-8");
      } else if (ext === ".pdf" || ext === ".doc" || ext === ".docx") {
        // For PDF/DOC — attempt text read (basic fallback)
        // In production, use: pdf-parse, mammoth, or a Python extraction service
        try {
          extractedText = fs.readFileSync(filePath, "utf-8");
        } catch {
          extractedText = "";
        }

        if (!extractedText.trim() || extractedText.includes("\x00")) {
          // Binary file — can't extract with plain fs
          // Clean up
          fs.unlinkSync(filePath);
          res.status(422).json({
            success: false,
            error:
              "Could not extract text from this file. For PDF/DOC files, please copy-paste the text directly or use a TXT file.",
          });
          return;
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      if (!extractedText.trim()) {
        res.status(422).json({
          success: false,
          error: "The uploaded file appears to be empty.",
        });
        return;
      }

      console.log(
        `📁 File uploaded: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB) → ${extractedText.length} chars`
      );

      res.json({
        success: true,
        data: {
          text: extractedText.trim(),
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: ext.replace(".", "").toUpperCase(),
          charCount: extractedText.trim().length,
          wordCount: extractedText.trim().split(/\s+/).length,
        },
      });
    } catch (error) {
      // Multer errors (file too large, wrong type, etc.)
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          res.status(413).json({
            success: false,
            error: "File is too large. Maximum size is 10MB.",
          });
          return;
        }
      }

      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process the uploaded file.",
      });
    }
  }
);
