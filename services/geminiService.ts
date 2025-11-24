'use server'; // <--- BU SATIR EKSİK OLDUĞU İÇİN ÇALIŞMIYOR OLABİLİR

import { GoogleGenerativeAI } from "@google/generative-ai";

// Yardımcı fonksiyon: API anahtarını güvenli bir şekilde çeker
const getAI = () => {
  let apiKey = '';
  try {
    // Vercel veya lokal ortam değişkenini kontrol et
    if (process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.error("Ortam değişkenlerine erişilemedi.");
  }
  
  // Eğer anahtar yoksa null döndür, uygulamayı çökertme
  if (!apiKey) {
      console.warn("API Key bulunamadı! Vercel ayarlarında 'API_KEY' tanımladığından emin ol.");
      return null;
  }

  return new GoogleGenerativeAI(apiKey);
};

export const askCoach = async (question: string, context: string): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "API anahtarı eksik. Lütfen ayarlardan kontrol edin.";

    // DÜZELTME: Model ismi 1.5-flash yapıldı
    const model = ai.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
            temperature: 0.7,
        }
    });
    
    // DÜZELTME: Doğru SDK metod yapısı
    const result = await model.generateContent(`
      You are an expert fitness coach named "Coach Gemini". You are helpful, motivating, and concise.
      The user speaks Turkish. Respond in Turkish.
      
      Instructions for Exercise Questions:
      If the user asks about a specific exercise (form, how to do it, tips):
      1. Structure answer as: Setup (Pozisyon), Execution (Hareket), Common Mistakes (Hatalar).
      2. Emphasize safety and breathing.
      3. If asked for variations, suggest biomechanically similar movements.
      
      Context about user's routine:
      ${context}
      
      User Question: ${question}
    `);

    const response = await result.response;
    const text = response.text();

    // DÜZELTME: Eksik olan || işareti eklendi
    return text || "Üzgünüm, şu an cevap veremiyorum.";

  } catch (error) {
    console.error("AI Error:", error);
    return "Bağlantı hatası oluştu. Lütfen internetinizi kontrol edin.";
  }
};

// Not: WorkoutLog ve WorkoutDay tipleri kendi projende tanımlı olduğu varsayılmıştır.
// Hata alırsan 'any[]' olarak değiştirebilirsin.
export const getWorkoutAnalysis = async (recentLogs: any[], program: any[]): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "API anahtarı eksik.";

    // DÜZELTME: Model ismi 1.5-flash yapıldı
    const model = ai.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
            temperature: 0.7,
        }
    });
    
    // Logları özetle (Token tasarrufu için)
    const logsSummary = recentLogs.map(log => ({
      date: log.date,
      day: log.dayId,
      duration: log.duration,
      exercises: log.exercises ? Object.entries(log.exercises).map(([id, sets]: [string, any]) => {
        const completedSets = sets.filter((s: any) => s.completed);
        if (completedSets.length === 0) return null;
        const maxWeight = Math.max(...completedSets.map((s: any) => s.weight));
        return ${id}: ${completedSets.length} sets (max ${maxWeight}kg);
      }).filter(Boolean) : []
    }));

    const prompt = `
      Act as a senior personal trainer focused on scientific hypertrophy training. Analyze the user's last ${recentLogs.length} workouts against their program.
      
      Program Context: ${JSON.stringify(program.map(p => ({id: p.id, name: p.name})))}
      Recent History: ${JSON.stringify(logsSummary)}
      
      Task: Provide 3 short, bulleted, high-impact recommendations for their next week. 
      Focus on:
      1. Progressive Overload (weight/reps increases)
      2. Consistency
      3. Volume management
      
      Language: Turkish. Keep it motivating but strict. Use emojis.
      Format: Plain text with bullet points.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // DÜZELTME: Eksik olan || işareti eklendi
    return text || "Şu an analiz yapılamıyor.";

  } catch (error) {
    console.

halil ibrahim, [25.11.2025 02:03]
error("Analysis Error:", error);
    return "Analiz servisi şu an kullanılamıyor.";
  }
};
