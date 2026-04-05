import nodemailer from "nodemailer";

/**
 * Mail Service
 * 
 * Handles sending emails using Nodemailer.
 * Configure with environment variables for security.
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an App Password for Gmail
  },
});

export interface ContactMailData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(data: ContactMailData): Promise<void> {
  const receiver = process.env.CONTACT_RECEIVER || "textsummarizer07@gmail.com";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: receiver,
    subject: `Contact Form: ${data.category.toUpperCase()} - ${data.subject || "No Subject"}`,
    text: `
Name: ${data.name}
Email: ${data.email}
Category: ${data.category}
Subject: ${data.subject}

Message:
${data.message}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${data.message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to AI Text Summarizer! 🚀",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #dc2626;">Welcome to AI Text Summarizer, ${name}!</h2>
        <p>We're thrilled to have you on board. Our AI-powered tool is designed to help you save time by distilling complex text into clear, concise summaries.</p>
        <p><strong>What you can do now:</strong></p>
        <ul style="line-height: 1.6;">
          <li>✨ Summarize long articles in seconds.</li>
          <li>📄 Upload PDFs and Docs for instant insights.</li>
          <li>🌐 Extract and summarize content directly from any URL.</li>
          <li>📜 Keep a history of all your summaries in one place.</li>
        </ul>
        <p>If you have any questions or feedback, just reply to this email or use the contact form on our website.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Launch the App</a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Explore the power of transformers with AI Text Summarizer.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
