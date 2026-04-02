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
