import { Request, Response, NextFunction } from "express";

/**
 * Validates that the request body contains non-empty text.
 */
export function validateTextInput(req: Request, res: Response, next: NextFunction): void {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    res.status(400).json({
      error: "Validation failed",
      message: "Text field is required and must be a string.",
    });
    return;
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    res.status(400).json({
      error: "Validation failed",
      message: "Text cannot be empty.",
    });
    return;
  }

  if (trimmed.length < 20) {
    res.status(400).json({
      error: "Validation failed",
      message: "Text is too short. Provide at least 20 characters for a meaningful summary.",
    });
    return;
  }

  if (trimmed.length > 500_000) {
    res.status(400).json({
      error: "Validation failed",
      message: "Text exceeds the maximum length of 500,000 characters.",
    });
    return;
  }

  // Attach cleaned text
  req.body.text = trimmed;
  next();
}

/**
 * Validates summary length parameter.
 */
export function validateSummaryLength(req: Request, res: Response, next: NextFunction): void {
  const { length } = req.body;
  const allowed = ["short", "medium", "long"];

  if (length && !allowed.includes(length)) {
    res.status(400).json({
      error: "Validation failed",
      message: `Invalid summary length. Allowed values: ${allowed.join(", ")}`,
    });
    return;
  }

  // Default to medium if not provided
  if (!length) {
    req.body.length = "medium";
  }

  next();
}
