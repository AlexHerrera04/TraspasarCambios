const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT) || 3001;
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

function extractResponseText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (!Array.isArray(data?.output)) {
    return '';
  }

  return data.output
    .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
    .filter(
      (part) => part?.type === 'output_text' && typeof part.text === 'string'
    )
    .map((part) => part.text)
    .join('\n')
    .trim();
}

app.use(
  cors({
    origin: ['http://localhost:4200', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: openAiModel });
});

app.post('/api/coach', async (req, res) => {
  try {
    const { instructions, input, maxTokens = 900 } = req.body || {};

    if (!openAiApiKey) {
      return res.status(500).json({
        error: 'Falta OPENAI_API_KEY en server/.env',
      });
    }

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        error: 'El campo input es obligatorio y debe ser texto.',
      });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: openAiModel,
        instructions:
          typeof instructions === 'string' && instructions.trim()
            ? instructions.trim()
            : 'Eres un coach ejecutivo útil y concreto.',
        input: input.trim(),
        max_output_tokens: Number(maxTokens) || 900,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Error al llamar a OpenAI.',
      });
    }

    const text = extractResponseText(data);

    if (!text) {
      return res.status(502).json({
        error: 'OpenAI no ha devuelto texto en la respuesta.',
      });
    }

    return res.json({ text });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Error interno del coach.',
    });
  }
});

app.listen(port, () => {
  console.log(`Coach backend escuchando en http://localhost:${port}`);
});