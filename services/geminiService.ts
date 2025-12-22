
import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, WorkoutDay } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askCoach = async (question: string, context: string): Promise<string> => {
  try {
    // For general Q&A tasks, use 'gemini-3-flash-preview'
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert fitness coach named "Coach Gemini". You are helpful, motivating, and concise.
      The user speaks Turkish. Respond in Turkish.
      
      Instructions for Exercise Questions:
      If the user asks about a specific exercise (form, how to do it, tips):
      1. Structure answer as: Setup (Pozisyon), Execution (Hareket), Common Mistakes (Hatalar).
      2. Emphasize safety and breathing.
      3. If asked for variations, suggest biomechanically similar movements.
      
      Context about user's routine:
      ${context}
      
      User Question: ${question}`,
      config: {
        temperature: 0.7,
      }
    });

    // Directly access the text property as per guidelines
    return response.text || "Üzgünüm, şu an cevap veremiyorum.";
  } catch (error: any) {
    console.error("AI Error:", error);
    return "Bağlantı hatası oluştu. Lütfen tekrar deneyin.";
  }
};

export const getWorkoutAnalysis = async (recentLogs: WorkoutLog[], program: WorkoutDay[]): Promise<string> => {
  try {
    // Simplify logs summary to reduce token usage
    const logsSummary = recentLogs.map(log => ({
      date: log.date,
      day: log.dayId,
      duration: log.duration,
      exercises: Object.entries(log.exercises).map(([id, sets]) => {
        const completedSets = sets.filter(s => s.completed);
        if (completedSets.length === 0) return null;
        const maxWeight = Math.max(...completedSets.map(s => s.weight));
        return `${id}: ${completedSets.length} sets (max ${maxWeight}kg)`;
      }).filter(Boolean)
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

    // Use gemini-3-flash-preview for analysis tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Şu an analiz yapılamıyor.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Analiz servisi şu an kullanılamıyor.";
  }
};
