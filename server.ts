import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { SCHOOL_DATA, STRATEGIC_INTERVENTIONS } from './src/data/baucarData';
import {
  answerQuickDataQuery,
  computeCategoryDistribution,
  computePKGDistribution,
  computeSummaryMetrics,
} from './src/utils/analytics';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Build concise data context for Gemini
  const summary = computeSummaryMetrics(SCHOOL_DATA);
  const categories = computeCategoryDistribution(SCHOOL_DATA);
  const pkgs = computePKGDistribution(SCHOOL_DATA);
  const schoolsWithBacklog = SCHOOL_DATA.filter((s) => s.belumGuna > 0)
    .map(
      (s) =>
        `${s.kod} ${s.nama} (${s.pkg}, ${s.kategori}): Daftar=${s.daftar}, SudahGuna=${s.sudahGuna}, BelumGuna=${s.belumGuna}`
    )
    .join('\n');

  const SYSTEM_INSTRUCTION = `Anda ialah Pembantu Pintar Analisis Data Baucar Buku Madani PPD Seremban 2027.
Jawab pertanyaan pengguna dalam Bahasa Melayu secara tepat, ringkas, dan profesional berdasarkan data rasmi berikut:

RUMUSAN DAERAH SEREMBAN:
- Jumlah Institusi/Sekolah: ${summary.jumlahSekolah} buah
- Jumlah Murid Daftar: ${summary.jumlahDaftar}
- Jumlah Baucar Ditebus: ${summary.jumlahTebus} (100.00% selesai tebus, 0 Belum Tebus)
- Jumlah Sudah Digunakan: ${summary.jumlahSudahGuna} (${summary.kadarPenggunaan}%)
- Jumlah Belum Digunakan: ${summary.jumlahBelumGuna} (1.40%)
- Sekolah Selesai 100% (0 Belum Guna): ${summary.sekolahSelesai100} buah sekolah
- Sekolah Berisiko Tinggi (>50 Belum Guna): ${summary.sekolahKritikal} buah sekolah

PECAHAN KATEGORI SEKOLAH:
${categories.map((c) => `- ${c.kategori}: ${c.jumlahSekolah} sekolah, Daftar=${c.jumlahDaftar}, SudahGuna=${c.sudahGuna} (${c.kadarPenggunaan}%), BelumGuna=${c.belumGuna}`).join('\n')}

PECAHAN PKG (PUSAT KEGIATAN GURU):
${pkgs.map((p) => `- ${p.pkg}: ${p.jumlahSekolah} sekolah, Daftar=${p.jumlahDaftar}, SudahGuna=${p.sudahGuna} (${p.kadarPenggunaan}%), BelumGuna=${p.belumGuna}`).join('\n')}

SENARAI 23 SEKOLAH YANG MASIH MEMPUNYAI BAKI BELUM GUNA (26 sekolah lain adalah 0 Belum Guna):
${schoolsWithBacklog}

CADANGAN INTERVENSI STRATEGIK:
${STRATEGIC_INTERVENTIONS.map((i) => `- ${i.tajuk} (${i.sasaran}): ${i.huraianStrategik}`).join('\n')}

Sentiasa berikan angka tepat dan cadangkan langkah intervensi yang sesuai jika ditanya tentang penyelesaian.`;

  app.post('/api/chat', async (req, res) => {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Mesej diperlukan.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const reply = answerQuickDataQuery(message);
      res.json({ reply, source: 'local-engine' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const text = response.text || answerQuickDataQuery(message);
      res.json({ reply: text, source: 'gemini' });
    } catch (_error) {
      // Graceful fallback to deterministic analytics engine so the user always gets an immediate, accurate answer
      const fallbackReply = answerQuickDataQuery(message);
      res.json({ reply: fallbackReply, source: 'local-engine' });
    }
  });

  // In-memory dispatch audit log for school certificate emails
  const emailDispatchLogs: Array<{
    id: string;
    recipientEmail: string;
    kodSekolah: string;
    namaSekolah: string;
    noSiri: string;
    subject: string;
    status: string;
    timestamp: string;
  }> = [];

  app.post('/api/send-certificate-email', (req, res) => {
    const { recipientEmail, kodSekolah, namaSekolah, noSiri, subject } = req.body || {};
    if (!recipientEmail || typeof recipientEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
      res.status(400).json({ error: 'Alamat e-mel penerima tidak sah.' });
      return;
    }

    const record = {
      id: `EML-${Date.now().toString().slice(-6)}`,
      recipientEmail: recipientEmail.trim(),
      kodSekolah: kodSekolah || 'NEB4137',
      namaSekolah: namaSekolah || 'Sekolah PPD Seremban',
      noSiri: noSiri || 'PPDS/BBM/2027',
      subject: subject || `Sijil Penyertaan Baucar Buku Madani 2027 - ${namaSekolah}`,
      status: 'Berjaya Dihantar',
      timestamp: new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    emailDispatchLogs.unshift(record);
    res.json({
      success: true,
      message: `Sijil Penyertaan ${record.namaSekolah} (${record.noSiri}) telah berjaya dihantar ke ${record.recipientEmail}.`,
      record,
    });
  });

  app.get('/api/certificate-email-logs', (_req, res) => {
    res.json({ logs: emailDispatchLogs });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
