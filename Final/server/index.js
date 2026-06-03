const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT) || 3001;
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const transcriptApiKey = process.env.TRANSCRIPT_API_KEY;
const summaryMaxChars = 1500;

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
      (part) =>
        (part?.type === 'output_text' || part?.type === 'text') &&
        typeof part.text === 'string'
    )
    .map((part) => part.text)
    .join('\n')
    .trim();
}

const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();

const extractTextDeep = (value) => {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    const text = normalizeWhitespace(value);
    return text ? [text] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractTextDeep(item));
  }

  if (typeof value === 'object') {
    const directKeys = [
      'text',
      'transcript',
      'content',
      'caption',
      'value',
      'body',
    ];

    for (const key of directKeys) {
      const directValue = value[key];
      if (typeof directValue === 'string' && directValue.trim()) {
        return [normalizeWhitespace(directValue)];
      }
    }

    const nestedKeys = [
      'data',
      'results',
      'items',
      'segments',
      'snippets',
      'captions',
      'transcripts',
      'paragraphs',
      'lines',
      'utterances',
    ];

    for (const key of nestedKeys) {
      if (key in value) {
        const nestedText = extractTextDeep(value[key]);
        if (nestedText.length > 0) {
          return nestedText;
        }
      }
    }

    return Object.values(value).flatMap((item) => extractTextDeep(item));
  }

  return [];
};

const fetchYoutubeTranscript = async (videoUrl) => {
  if (!transcriptApiKey) {
    throw new Error('Falta TRANSCRIPT_API_KEY en server/.env');
  }

  const url = new URL('https://transcriptapi.com/api/v2/youtube/transcript');
  url.searchParams.set('video_url', videoUrl);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${transcriptApiKey}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        'No se ha podido obtener la transcripcion del video.'
    );
  }

  const transcript = extractTextDeep(data).join(' ');
  const normalizedTranscript = normalizeWhitespace(transcript);

  if (!normalizedTranscript) {
    throw new Error('La transcripcion ha llegado vacia.');
  }

  return normalizedTranscript;
};

const buildSummaryPrompt = (transcript) => `
Quiero que conviertas este transcript de YouTube en un texto titulado mentalmente como "aspectos destacados".

Reglas obligatorias:
- Escribe en espanol.
- El resultado debe tener SI O SI menos de ${summaryMaxChars} caracteres.
- No cortes el texto con puntos suspensivos al final.
- No uses un tono robotico ni repetitivo.
- Evita construir todas las frases con el mismo patron tipo "se comunica", "se hace", "se transforma".
- Hazlo mas humano, cercano, natural y facil de leer.
- Que suene a una persona explicando lo mas interesante del contenido.
- Un unico bloque de texto.
- Sin introduccion ni despedida.
- No inventes nada.

Transcript:
${transcript}
`.trim();

const rewriteUnderLimitPrompt = (summary) => `
Reescribe este texto para que tenga SI O SI menos de ${summaryMaxChars} caracteres.

Reglas obligatorias:
- Mantén el espanol.
- Mantén el tono humano, cercano y natural.
- No lo cortes con puntos suspensivos al final.
- Un unico bloque de texto.
- No inventes nada.
- Devuelve solo la version final.

Texto:
${summary}
`.trim();

const summarizeWithOpenAI = async (transcript) => {
  if (!openAiApiKey) {
    throw new Error('Falta OPENAI_API_KEY en server/.env');
  }

  const requestSummary = async (input) => {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: openAiModel,
        instructions:
          'Escribes resúmenes muy humanos, cercanos, naturales y claros, evitando estructuras repetitivas.',
        input,
        max_output_tokens: 500,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.error?.message || 'No se ha podido generar el resumen con OpenAI.'
      );
    }

    const text = extractResponseText(data);
    if (!text) {
      throw new Error('OpenAI no ha devuelto texto para el resumen.');
    }

    return normalizeWhitespace(text);
  };

  let summary = await requestSummary(buildSummaryPrompt(transcript));

  if (summary.length >= summaryMaxChars) {
    summary = await requestSummary(rewriteUnderLimitPrompt(summary));
  }

  if (summary.length >= summaryMaxChars) {
    throw new Error('No se ha podido generar un resumen por debajo del limite.');
  }

  return summary;
};

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

app.post('/api/quick-summary', async (req, res) => {
  try {
    const { videoUrl, contentId } = req.body || {};

    if (!videoUrl || typeof videoUrl !== 'string') {
      return res.status(400).json({ error: 'videoUrl required' });
    }

    const transcript = await fetchYoutubeTranscript(videoUrl);
    const summary = await summarizeWithOpenAI(transcript);

    return res.json({
      ok: true,
      contentId: contentId || null,
      summary,
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'quick summary request failed',
    });
  }
});

app.listen(port, () => {
  console.log(`Coach backend escuchando en http://localhost:${port}`);
});