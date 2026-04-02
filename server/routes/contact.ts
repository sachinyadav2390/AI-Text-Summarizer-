import { Router, Request, Response } from "express";
import { sendContactEmail } from "../services/mailService";

export const contactRouter = Router();

/**
 * POST /api/contact
 * 
 * Body: { name, email, category, subject, message }
 */
contactRouter.post("/contact", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, category, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ 
        success: false, 
        error: "Missing required fields: name, email, and message are required." 
      });
      return;
    }

    console.log(`📩 New contact message from ${name} (${email})`);

    // In a real environment, you'd want to validate the email format here too

    await sendContactEmail({
      name,
      email,
      category: category || "general",
      subject: subject || "No Subject",
      message,
    });

    res.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ Contact form error details:", {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message. Please try again later.",
    });
  }
});
