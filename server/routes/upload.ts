import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

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

      console.log(`🔍 [UPLOAD] Processing file: ${req.file.originalname}, ext: ${ext}`);
      let extractedText = "";

      if (ext === ".txt") {
        console.log("🔍 [UPLOAD] Reading TXT file...");
        extractedText = fs.readFileSync(filePath, "utf-8");
      } else if (ext === ".pdf") {
        console.log("🔍 [UPLOAD] Extracting PDF text...");
        const dataBuffer = fs.readFileSync(filePath);
        console.log(`🔍 [UPLOAD] Buffer size: ${dataBuffer.length} bytes`);
        try {
          const parser = new PDFParse({ data: dataBuffer });
          const data = await parser.getText();
          await parser.destroy();
          console.log("🔍 [UPLOAD] PDF extraction successful");
          extractedText = data.text;
        } catch (pdfErr) {
          console.error("❌ [UPLOAD] PDFParse error:", pdfErr);
          throw pdfErr;
        }
      } else if (ext === ".docx") {
        console.log("🔍 [UPLOAD] Extracting DOCX text...");
        const result = await mammoth.extractRawText({ path: filePath });
        console.log("🔍 [UPLOAD] DOCX extraction successful");
        extractedText = result.value;
      } else if (ext === ".doc") {
        console.log("🔍 [UPLOAD] Rejected .DOC file");
        res.status(422).json({
          success: false,
          error: "Binary .DOC format is not supported. Please save as .DOCX or .PDF.",
        });
        fs.unlinkSync(filePath);
        return;
      } else {
        console.log(`🔍 [UPLOAD] Unsupported extension: ${ext}`);
        res.status(422).json({
          success: false,
          error: "Unsupported file type.",
        });
        fs.unlinkSync(filePath);
        return;
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

      console.error("❌ Upload error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to process the uploaded file.",
      });
    }
  }
);
