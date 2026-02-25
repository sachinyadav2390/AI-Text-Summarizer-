import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error("❌ Server Error:", err.message);
  console.error(err.stack);

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : err.message,
  });
}
