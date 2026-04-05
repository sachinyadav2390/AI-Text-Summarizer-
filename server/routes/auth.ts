import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import twilio from "twilio";
import { User } from "../models/User";
import { sendWelcomeEmail } from "../services/mailService";

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "450894164921-do6q96rk4pbl0rsai7i5t6as5cr02ag6.apps.googleusercontent.com";

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

// In-memory OTP store (for dev/simulation)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * POST /api/auth/register
 * 
 * Create a new user with Email/Password.
 */
authRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: "Name, email, and password are required." });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, error: "User already exists with this email." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Note: Added 'password' field to User model (should check User.ts)
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

    // Send Welcome Email
    sendWelcomeEmail(email, name).catch(err => console.error("Welcome email failed:", err));

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, error: "Server error during registration." });
  }
});

/**
 * POST /api/auth/login
 * 
 * Sign in with Email/Password.
 */
authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: "Server error during login." });
  }
});

/**
 * POST /api/auth/google
 * 
 * Sign in/Up with Google.
 */
authRouter.post("/google", async (req: Request, res: Response): Promise<void> => {
  try {
    const { token: googleToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, error: "Invalid Google token." });
      return;
    }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = new User({
        name: name || email.split("@")[0],
        email,
        avatar: picture,
      });
      await user.save();
      isNewUser = true;
      
      // Send Welcome Email
      sendWelcomeEmail(email, name || "").catch(err => console.error("Welcome email failed:", err));
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      isNewUser,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, error: "Server error during Google authentication." });
  }
});

/**
 * POST /api/auth/send-otp
 */
authRouter.post("/send-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, error: "Phone number is required." });
      return;
    }
    
    // Generate a random 6 digit code for real SMS
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Fallback to console mock if no credentials
    if (!twilioClient) {
      const mockCode = "123456"; 
      otpStore.set(phone, { code: mockCode, expiresAt: Date.now() + 5 * 60 * 1000 });
      console.log(`\n=== TWILIO UNCONFIGURED ===\n📡 Simulated OTP to ${phone}: ${mockCode}\n===========================\n`);
      res.json({ success: true, message: "OTP sent successfully (Simulated)." });
      return;
    }

    try {
      if (!process.env.TWILIO_PHONE_NUMBER) throw new Error("TWILIO_PHONE_NUMBER missing from env.");
      await twilioClient.messages.create({
        body: `Your Text Summarizer login OTP is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      
      otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
      console.log(`\n📡 Real Twilio OTP successfully sent to ${phone}`);
      res.json({ success: true, message: "OTP sent successfully." });

    } catch (twilioErr: any) {
      console.error("Twilio SMS Dispatch error:", twilioErr);
      res.status(500).json({ success: false, error: "Failed to send SMS. Ensure number is verified in Twilio or configs are correct." });
    }

  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ success: false, error: "Server error during sending OTP." });
  }
});

/**
 * POST /api/auth/verify-otp
 */
authRouter.post("/verify-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      res.status(400).json({ success: false, error: "Phone number and code are required." });
      return;
    }
    
    const record = otpStore.get(phone);
    if (!record) {
      res.status(400).json({ success: false, error: "OTP not requested or expired." });
      return;
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      res.status(400).json({ success: false, error: "OTP has expired." });
      return;
    }
    if (record.code !== code) {
      res.status(400).json({ success: false, error: "Invalid OTP code." });
      return;
    }
    
    otpStore.delete(phone);
    
    // Find or Create user
    let user = await User.findOne({ phone });
    let isNewUser = false;
    
    if (!user) {
      const generatedName = `User-${phone.slice(-4)}`;
      user = new User({
        name: generatedName,
        phone,
      });
      await user.save();
      isNewUser = true;
    }
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
      },
      isNewUser,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, error: "Server error during verifying OTP." });
  }
});
