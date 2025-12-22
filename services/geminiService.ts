
import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, WorkoutDay } from "../types";

// API anahtarı kontrolü
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch {
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const askCoach = async (question: string, context: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "AI özellikleri için API anahtarı gereklidir.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert fitness coach named "Coach Gemini". Respond in Turkish.
      Context: ${context}
      User Question: ${question}`,
      config: { temperature: 0.7 }
    });
    return response.text || "Üzgünüm, şu an cevap veremiyorum.";
  } catch (error: any) {
    console.error("AI Error:", error);
    return "Bağlantı hatası oluştu.";
  }
};

export const getWorkoutAnalysis = async (recentLogs: WorkoutLog[], program: WorkoutDay[]): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Analiz için API anahtarı gereklidir.";

  try {
    const logsSummary = recentLogs.map(log => ({
      date: log.date,
      exercises: Object.entries(log.exercises).map(([id, sets]) => {
        const completed = sets.filter(s => s.completed);
        return completed.length > 0 ? `${id}: ${completed.length} sets` : null;
      }).filter(Boolean)
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiz yap: ${JSON.stringify(logsSummary)}. Dil: Türkçe.`,
      config: { temperature: 0.7 }
    });
    return response.text || "Şu an analiz yapılamıyor.";
  } catch (error) {
    return "Analiz servisi şu an kullanılamıyor.";
  }
};
