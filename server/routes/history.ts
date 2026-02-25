import { Router, Request, Response } from "express";
import { historyStore } from "../store/historyStore";

export const historyRouter = Router();

/**
 * GET /api/history
 *
 * Returns all summary history entries (newest first).
 * Query params: ?limit=10 (optional)
 */
historyRouter.get("/history", async (_req: Request, res: Response): Promise<void> => {
  const limit = parseInt(_req.query.limit as string) || 50;
  const entries = await historyStore.getAll(limit);

  res.json({
    success: true,
    data: {
      entries,
      total: entries.length,
    },
  });
});

/**
 * GET /api/history/:id
 *
 * Returns a single history entry by ID.
 */
historyRouter.get("/history/:id", async (req: Request, res: Response): Promise<void> => {
  const entry = await historyStore.getById(req.params.id as string);

  if (!entry) {
    res.status(404).json({
      success: false,
      error: "History entry not found.",
    });
    return;
  }

  res.json({
    success: true,
    data: entry,
  });
});

/**
 * DELETE /api/history/:id
 *
 * Deletes a single history entry by ID.
 */
historyRouter.delete("/history/:id", async (req: Request, res: Response): Promise<void> => {
  const deleted = await historyStore.deleteById(req.params.id as string);

  if (!deleted) {
    res.status(404).json({
      success: false,
      error: "History entry not found.",
    });
    return;
  }

  res.json({
    success: true,
    message: "History entry deleted successfully.",
  });
});

/**
 * DELETE /api/history
 *
 * Clears all history entries.
 */
historyRouter.delete("/history", async (_req: Request, res: Response): Promise<void> => {
  await historyStore.clearAll();

  res.json({
    success: true,
    message: "All history cleared.",
  });
});
