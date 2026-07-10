import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are a helpful AI assistant for Everest Academy. Answer in Arabic unless the user writes in English. Be friendly and concise.

About Everest Academy:
- Everest Academy is an online education platform specializing in trading, investment, digital marketing, AI, programming, and freelancing.
- The platform offers courses with both free preview lessons and paid premium content.
- Students earn E-Money rewards through the affiliate/referral program.
- The academy has a multi-level ranking system (Star, Executive, Executive Star, Senior Leader, Regional Leader, Everest Elite, Everest Master, Everest Legend, Everest Ambassador, Everest Chairman).
- Users can join via referral codes and earn commissions when their referrals join and purchase courses.
- The platform supports multiple payment methods: E-Money, Vodafone Cash, and InstaPay.
- New users start as "Registration" accounts and can upgrade to "Student" accounts to purchase courses.`;

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "I understand. I'll help users with information about Everest Academy and general questions." }] },
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === "user" || msg.role === "model") {
          contents.push({ role: msg.role, parts: [{ text: msg.text }] });
        }
      }
    }

    contents.push({ role: "user", parts: [{ text: message }] });

    const result = await model.generateContent({ contents });
    const text = result.response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Chat failed" });
  }
});

export default router;
