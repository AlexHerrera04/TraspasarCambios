const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/coach", async (req, res) => {
  try {
    const { prompt, maxTokens = 500 } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt required" });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "AQUI_VA_LA_KEY") {
      return res.status(500).json({ error: "OPENAI_API_KEY not configured" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: maxTokens
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed"
      });
    }

    const text =
      data.output_text ||
      data.output
        ?.flatMap(item => item.content || [])
        .map(content => content.text || "")
        .join("")
        .trim() ||
      "";

    return res.json({ text });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "coach request failed"
    });
  }
});

app.listen(port, () => {
  console.log(`AI backend listening on http://localhost:${port}`);
});