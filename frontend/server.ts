import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI SDK (lazy initialization pattern)
  let aiClient: GoogleGenAI | null = null;
  function getAiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not configured');
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'SI LAPOR FASYANKES' });
  });

  // Gemini AI Analysis Endpoint
  app.post('/api/ai-analysis', async (req, res) => {
    try {
      const { reportType, month, puskesmas, dataSummary } = req.body;

      const ai = getAiClient();

      const systemInstruction = `Anda adalah Asisten Pakar Epidemiologi dan Analis Kesehatan Publik untuk Dinas Kesehatan Kabupaten Rote Ndao, Nusa Tenggara Timur.
Tugas Anda adalah menganalisis data Sistem Informasi Pelaporan Fasilitas Pelayanan Kesehatan (SI LAPOR FASYANKES).
Berikan hasil analisis yang lugas, profesional, akurat, dan dapat ditindaklanjuti oleh Kepala Dinas Kesehatan dan Kepala Puskesmas.`;

      const userPrompt = `
Analisis Laporan Fasyankes Berikut:
- Jenis Laporan: ${reportType || 'Keseluruhan'}
- Periode/Bulan: ${month || 'Semua Bulan'}
- Puskesmas/Faskes: ${puskesmas || 'Seluruh Kabupaten Rote Ndao'}

Ringkasan Data Laporan:
${dataSummary}

Berikan output JSON dengan format:
{
  "title": "Judul Eksekutif Analisis",
  "summary": "Ringkasan eksekutif 2-3 kalimat mengenai kondisi kesehatan masyarakat.",
  "keyInsights": ["Temuan kunci 1", "Temuan kunci 2", "Temuan kunci 3"],
  "anomaliesOrAlerts": ["Peringatan kewaspadaan dini atau tren anomali 1", "Peringatan 2"],
  "recommendations": ["Rekomendasi kebijakan/tindakan fasyankes 1", "Rekomendasi 2"]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyInsights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              anomaliesOrAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['title', 'summary', 'keyInsights', 'anomaliesOrAlerts', 'recommendations']
          }
        }
      });

      const responseText = response.text || '{}';
      const result = JSON.parse(responseText);
      res.json(result);
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      res.status(500).json({ 
        error: 'Gagal melakukan analisis AI', 
        message: err.message || 'Error occurred during AI generation' 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SI LAPOR FASYANKES running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
