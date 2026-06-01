import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { Checkbox, Spinner } from '@material-tailwind/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'src/app/core/api/apiProvider';
import { useUser } from 'src/app/core/feature-user/provider/userProvider';
import Button from 'src/app/ui/Button';

// Comment to trigger CI/CD
interface Goal {
  id: number;
  name: string;
  status: string;
  create_date: string;
  expiration_date: string;
  content: number;
  content_name: string;
  content_type: string;
  content_theme_id: string;
  priority: string;
  user: number;
  quiz_id?: number;
  quiz_completed: boolean;
  loading?: boolean;
  score: any;
}

const CERTIFICATE_PAGE_WIDTH = 842;
const CERTIFICATE_PAGE_HEIGHT = 595;

const encodePdfLatin1 = (value: string) => {
  const bytes = new Uint8Array(value.length);

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    bytes[index] = code <= 255 ? code : 32;
  }

  return bytes;
};

const getPdfByteLength = (value: string) => {
  return encodePdfLatin1(value).length;
};

const normalizeAssessmentSpelling = (value: string) => {
  return value
    .replace(/\bAsessment\b/g, 'Assessment')
    .replace(/\basessment\b/g, 'assessment')
    .replace(/\bASESSMENT\b/g, 'ASSESSMENT');
};

// ── Helvetica character width table (units per 1000, standard PDF metrics) ──
// Used for accurate text measurement and centering.
const HELVETICA_WIDTHS: Record<number, number> = {
  32: 278, 33: 278, 34: 355, 35: 556, 36: 556, 37: 889, 38: 667, 39: 191,
  40: 333, 41: 333, 42: 389, 43: 584, 44: 278, 45: 333, 46: 278, 47: 278,
  48: 556, 49: 556, 50: 556, 51: 556, 52: 556, 53: 556, 54: 556, 55: 556,
  56: 556, 57: 556, 58: 278, 59: 278, 60: 584, 61: 584, 62: 584, 63: 556,
  64: 1015, 65: 667, 66: 667, 67: 722, 68: 722, 69: 667, 70: 611, 71: 778,
  72: 722, 73: 278, 74: 500, 75: 667, 76: 556, 77: 833, 78: 722, 79: 778,
  80: 667, 81: 778, 82: 722, 83: 667, 84: 611, 85: 722, 86: 667, 87: 944,
  88: 667, 89: 667, 90: 611, 91: 278, 92: 278, 93: 278, 94: 469, 95: 556,
  96: 333, 97: 556, 98: 556, 99: 500, 100: 556, 101: 556, 102: 278, 103: 556,
  104: 556, 105: 222, 106: 222, 107: 500, 108: 222, 109: 833, 110: 556,
  111: 556, 112: 556, 113: 556, 114: 333, 115: 500, 116: 278, 117: 556,
  118: 500, 119: 722, 120: 500, 121: 500, 122: 500, 123: 334, 124: 260,
  125: 334, 126: 584,
  160: 278, 161: 333, 162: 556, 163: 556, 164: 556, 165: 556, 166: 260,
  167: 556, 168: 333, 169: 737, 170: 370, 171: 556, 172: 584, 173: 333,
  174: 737, 175: 333, 176: 400, 177: 584, 178: 333, 179: 333, 180: 333,
  181: 556, 182: 537, 183: 278, 184: 333, 185: 333, 186: 365, 187: 556,
  188: 834, 189: 834, 190: 834, 191: 611,
  192: 667, 193: 667, 194: 667, 195: 667, 196: 667, 197: 667, 198: 1000,
  199: 722, 200: 667, 201: 667, 202: 667, 203: 667, 204: 278, 205: 278,
  206: 278, 207: 278, 208: 722, 209: 722, 210: 778, 211: 778, 212: 778,
  213: 778, 214: 778, 215: 584, 216: 778, 217: 722, 218: 722, 219: 722,
  220: 722, 221: 667, 222: 667, 223: 611,
  224: 556, 225: 556, 226: 556, 227: 556, 228: 556, 229: 556, 230: 889,
  231: 500, 232: 556, 233: 556, 234: 556, 235: 556, 236: 278, 237: 278,
  238: 278, 239: 278, 240: 556, 241: 556, 242: 556, 243: 556, 244: 556,
  245: 556, 246: 556, 247: 584, 248: 611, 249: 556, 250: 556, 251: 556,
  252: 556, 253: 500, 254: 556, 255: 500,
};

const HELVETICA_BOLD_FACTOR = 1.06;

const measureText = (text: string, fontSize: number, bold: boolean): number => {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const w = HELVETICA_WIDTHS[code] ?? 556;
    width += w;
  }
  const scale = bold ? HELVETICA_BOLD_FACTOR : 1;
  return (width / 1000) * fontSize * scale;
};

const encodePdfString = (value: string): string => {
  let out = '';
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code === 0x5c) {
      out += '\\\\';
    } else if (code === 0x28) {
      out += '\\(';
    } else if (code === 0x29) {
      out += '\\)';
    } else if (code === 0x0a) {
      out += '\\n';
    } else if (code === 0x0d) {
      out += '\\r';
    } else if (code > 127 && code <= 255) {
      out += '\\' + code.toString(8).padStart(3, '0');
    } else if (code <= 127) {
      out += value[i];
    }
  }
  return out;
};

const preparePdfText = (value: string): string => {
  return value
    .replace(/\r?\n/g, ' ')
    .split('')
    .map((ch) => (ch.charCodeAt(0) > 255 ? ' ' : ch))
    .join('');
};

const wrapCertificateText = (value: string, maxChars: number) => {
  const words = preparePdfText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxChars) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const buildTextCommand = (
  text: string,
  x: number,
  y: number,
  font: 'F1' | 'F2',
  fontSize: number
) => {
  const prepared = preparePdfText(text);
  return `BT
/${font} ${fontSize} Tf
1 0 0 1 ${x} ${y} Tm
(${encodePdfString(prepared)}) Tj
ET`;
};

const generateCertificateId = (goalId: number, userId: number): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seed = goalId * 31 + userId * 17;
  let id = '';
  let state = seed;
  for (let i = 0; i < 10; i++) {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    id += chars[Math.abs(state) % chars.length];
  }
  return id;
};

const buildCenteredTextCommand = (
  text: string,
  y: number,
  font: 'F1' | 'F2',
  fontSize: number
) => {
  const prepared = preparePdfText(text);
  const bold = font === 'F2';
  const textWidth = measureText(prepared, fontSize, bold);
  const x = Math.round((CERTIFICATE_PAGE_WIDTH - textWidth) / 2);
  return `BT
/${font} ${fontSize} Tf
1 0 0 1 ${x} ${y} Tm
(${encodePdfString(prepared)}) Tj
ET`;
};

const buildCertificatePdf = ({
  userName,
  goalName,
  score,
  goalId = 0,
  userId = 0,
}: {
  userName: string;
  goalName: string;
  score?: number | null;
  goalId?: number;
  userId?: number;
}) => {
  const issueDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const certId = generateCertificateId(goalId, userId);
  const normalizedGoalName = normalizeAssessmentSpelling(goalName);
  const wrappedGoalName = wrapCertificateText(normalizedGoalName, 52);
  const safeUserName = preparePdfText(userName || 'Usuario Open KX');
  const safeDate = preparePdfText(issueDate);

  const W = CERTIFICATE_PAGE_WIDTH;
  const H = CERTIFICATE_PAGE_HEIGHT;
  const cx = W / 2;

  const commands: string[] = [
    '0.97 0.96 1.00 rg',
    `0 0 ${W} ${H} re`,
    'f',

    '0.28 0.11 0.45 rg',
    'q',
    `0 ${H} m`,
    `0 ${H - 160} l`,
    `80 ${H - 80} l`,
    `160 ${H} l`,
    'f',
    'Q',

    '0.40 0.20 0.60 rg',
    'q',
    `0 ${H} m`,
    `0 ${H - 110} l`,
    `55 ${H - 55} l`,
    `110 ${H} l`,
    'f',
    'Q',

    '0.56 0.35 0.75 rg',
    'q',
    `0 ${H} m`,
    `0 ${H - 60} l`,
    `30 ${H - 30} l`,
    `60 ${H} l`,
    'f',
    'Q',

    '0.28 0.11 0.45 rg',
    'q',
    `${W} 0 m`,
    `${W} 160 l`,
    `${W - 80} 80 l`,
    `${W - 160} 0 l`,
    'f',
    'Q',

    '0.40 0.20 0.60 rg',
    'q',
    `${W} 0 m`,
    `${W} 110 l`,
    `${W - 55} 55 l`,
    `${W - 110} 0 l`,
    'f',
    'Q',

    '0.56 0.35 0.75 rg',
    'q',
    `${W} 0 m`,
    `${W} 60 l`,
    `${W - 30} 30 l`,
    `${W - 60} 0 l`,
    'f',
    'Q',

    '0.28 0.11 0.45 RG',
    '1.5 w',
    '22 22 798 551 re',
    'S',

    '0.56 0.35 0.75 RG',
    '0.7 w',
    '34 34 774 527 re',
    'S',

    '0.28 0.11 0.45 rg',
    buildCenteredTextCommand('OPEN KX', H - 54, 'F2', 11),

    '0.28 0.11 0.45 rg',
    buildCenteredTextCommand('CERTIFICADO', H - 112, 'F2', 46),

    '0.40 0.20 0.60 rg',
    buildCenteredTextCommand('DE PARTICIPACIÓN', H - 138, 'F2', 16),

    '0.56 0.35 0.75 RG',
    '0.8 w',
    `${cx - 160} ${H - 152} m`,
    `${cx + 160} ${H - 152} l`,
    'S',

    '0.55 0.50 0.60 rg',
    buildCenteredTextCommand(
      'SE EXTIENDE EL PRESENTE CERTIFICADO A:',
      H - 178,
      'F1',
      11
    ),

    '0.28 0.11 0.45 rg',
    buildCenteredTextCommand(safeUserName, H - 240, 'F2', 36),

    '0.40 0.20 0.60 RG',
    '1.2 w',
    (() => {
      const nameWidth = measureText(preparePdfText(safeUserName), 36, true);
      const nameX = Math.round((CERTIFICATE_PAGE_WIDTH - nameWidth) / 2);
      const pad = 20;
      return `${nameX - pad} ${H - 252} m\n${
        nameX + nameWidth + pad
      } ${H - 252} l\nS`;
    })(),

    '0.55 0.50 0.60 rg',
    buildCenteredTextCommand(
      'POR HABER COMPLETADO CON ÉXITO LA META:',
      H - 285,
      'F1',
      12
    ),
  ];

  const lastGoalLineIndex = wrappedGoalName.length - 1;
  wrappedGoalName.forEach((line, index) => {
    commands.push(
      '0.28 0.11 0.45 rg',
      buildCenteredTextCommand(line.toUpperCase(), H - 316 - index * 26, 'F2', 16)
    );
  });

  if (typeof score === 'number' && Number.isFinite(score)) {
    const scoreY = H - 316 - lastGoalLineIndex * 26 - 30;
    commands.push(
      '0.55 0.50 0.60 rg',
      buildCenteredTextCommand(
        `Puntuación obtenida: ${score} puntos`,
        scoreY,
        'F1',
        10
      )
    );
  }

  const boxY = 185;
  const boxH = 34;
  const box1X = cx - 220;
  const box2X = cx + 10;
  const boxW = 200;
  const qrSize = 100;
  const qrX = Math.round(cx - qrSize / 2);
  const qrY = 68;

  commands.push(
    '0.56 0.35 0.75 RG',
    '0.8 w',
    `${box1X} ${boxY} ${boxW} ${boxH} re`,
    'S',
    `${box2X} ${boxY} ${boxW} ${boxH} re`,
    'S',

    '0.55 0.50 0.60 rg',
    buildTextCommand(`ID: ${certId}`, box1X + 12, boxY + 11, 'F1', 10),

    buildTextCommand(
      `FECHA DE EMISIÓN: ${safeDate}`,
      box2X + 12,
      boxY + 11,
      'F1',
      10
    ),

    `q ${qrSize} 0 0 ${qrSize} ${qrX} ${qrY} cm /Im1 Do Q`,

    '0.28 0.11 0.45 rg',
    buildCenteredTextCommand('Open KX', 52, 'F2', 11),
    '0.55 0.50 0.60 rg',
    buildCenteredTextCommand('AI Platform', 38, 'F1', 9)
  );

  const contentStream = commands.join('\n');
  const contentLength = getPdfByteLength(contentStream);

  const QR_JPEG_B64 = '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';
  const qrJpegBytes = atob(QR_JPEG_B64);
  const qrLength = qrJpegBytes.length;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n',
    `3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${CERTIFICATE_PAGE_WIDTH} ${CERTIFICATE_PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 7 0 R >> >> /Contents 6 0 R >>
endobj
`,
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj
<< /Length ${contentLength} >>
stream
${contentStream}
endstream
endobj
`,
    `7 0 obj
<< /Type /XObject /Subtype /Image /Width 110 /Height 110 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${qrLength} >>
stream
${qrJpegBytes}
endstream
endobj
`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = getPdfByteLength(pdf);
    pdf += object;
  });

  const xrefOffset = getPdfByteLength(pdf);

  pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n 
`;
  }

  pdf += `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`;

  return encodePdfLatin1(pdf);
};

const downloadCertificate = ({
  goal,
  userName,
}: {
  goal: Goal;
  userName: string;
}) => {
  const normalizedGoalName = normalizeAssessmentSpelling(goal.name);

  const pdfBytes = buildCertificatePdf({
    userName,
    goalName: normalizedGoalName,
    score:
      typeof goal.score === 'number'
        ? goal.score
        : Number.isFinite(Number(goal.score))
          ? Number(goal.score)
          : null,
    goalId: goal.id,
    userId: goal.user,
  });

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeGoalName = normalizedGoalName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  link.href = url;
  link.download = `certificado-${safeGoalName || `meta-${goal.id}`}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const navigate = useNavigate();
  const { userInfo, userAccountInfo } = useUser();

  const { isFetching } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data } = await api.get(`${import.meta.env.VITE_API_URL}/goals`);

      const normalizedGoals = data.map((goal: Goal) =>
        goal.quiz_completed ? { ...goal, status: 'done' } : goal
      );

      setGoals(normalizedGoals);
      return normalizedGoals;
    },
  });

  const handleCheckboxChange = async (goal: Goal) => {
    if (goal.quiz_completed) {
      return;
    }

    const updatedGoal = {
      ...goal,
      status: goal.status === 'pending' ? 'done' : 'pending',
      loading: true,
    };

    let updatedGoals = goals.map((g) => (g.id === goal.id ? updatedGoal : g));

    setGoals(updatedGoals);

    await api.patch(
      `${import.meta.env.VITE_API_URL}/goals/update/${goal.id}/`,
      updatedGoal
    );

    updatedGoal.loading = false;

    updatedGoals = goals.map((g) => (g.id === goal.id ? updatedGoal : g));

    setGoals(updatedGoals);
  };

  const handleCertificateDownload = (goal: Goal) => {
    if (!goal.quiz_completed) {
      toast.error(
        'Debes completar la evaluación antes de descargar el certificado.'
      );
      return;
    }

    const userName =
      userAccountInfo?.public_name ||
      [userInfo?.first_name, userInfo?.last_name].filter(Boolean).join(' ') ||
      userInfo?.username ||
      'Usuario Open KX';

    downloadCertificate({ goal, userName });
    toast.success('Certificado descargado correctamente.');
  };

  const isOutdated = (goal: Goal) => {
    const expirationDate = new Date(goal.expiration_date);
    const currentDate = new Date();

    return expirationDate < currentDate && goal.status !== 'done';
  };

  return (
    <>
      {isFetching ? (
        <div className="flex justify-center">
          <Spinner className="h-16 w-16"></Spinner>
        </div>
      ) : goals.length === 0 ? (
        <div className="my-3 flex items-center justify-between rounded-md border border-tertiary p-3">
          <h2 className="text-base">No tienes metas asignadas</h2>
        </div>
      ) : (
        goals.map((goal: Goal) => (
          <div
            key={goal.id}
            className={`my-3 flex items-center justify-between overflow-x-auto rounded-md border border-tertiary p-3 ${
              isOutdated(goal) ? '!border-red-500 bg-red-500/10' : ''
            }`}
          >
            <h2 className="max-w-md text-base">{goal.name}</h2>

            <div className="flex items-center gap-3">
              <Button
                outline
                onClick={() => {
                  if (goal.content_type === 'quiz') {
                    localStorage.setItem(
                      'themes',
                      goal.content_theme_id.toString()
                    );
                    localStorage.setItem('goal', goal.id.toString());
                    navigate('/diagnosticador/questionare');
                  } else {
                    navigate(`/explorer/${goal.content}`);
                  }
                }}
                disabled={goal.quiz_completed && goal.content_type === 'quiz'}
              >
                Acceder
              </Button>

              <span className="w-28 rounded-md border border-tertiary bg-tertiary/70 p-2 text-center text-sm">
                {goal.expiration_date}
              </span>

              <div
                className={`hidden items-center sm:flex ${
                  goal.loading ? 'animate-pulse' : ''
                }`}
              >
                <Checkbox
                  checked={goal.status === 'done' || goal.quiz_completed}
                  color="deep-purple"
                  onClick={() => handleCheckboxChange(goal)}
                  id={`goal-status-${goal.id}`}
                  disabled={goal.loading || goal.quiz_completed}
                />
                <label htmlFor={`goal-status-${goal.id}`} className="w-[160px]">
                  He finalizado la tarea
                </label>
              </div>

              <div className="hidden sm:block">
                <Button
                  outline
                  variant="primary"
                  className="w-44"
                  disabled={
                    goal.status != 'done' || !goal.quiz_id || goal.quiz_completed
                  }
                  onClick={() => navigate(`/quiz/${goal.content}`)}
                >
                  {goal.quiz_completed
                    ? 'Evaluación completada'
                    : goal.score < 50
                      ? 'Hacer evaluación'
                      : `Finalizado: ${goal.score} puntos`}
                </Button>
              </div>

              <div className="hidden sm:block">
                <Button
                  outline
                  variant="secondary"
                  disabled={!goal.quiz_completed}
                  onClick={() => handleCertificateDownload(goal)}
                >
                  <AcademicCapIcon className="mr-2 h-5 w-5" />
                  Descargar certificado
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}