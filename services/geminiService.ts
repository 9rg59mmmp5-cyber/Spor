
import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, WorkoutDay } from "../types";

// Helper to safely get API key without crashing the browser if process is not defined
const getAI = () => {
  let apiKey = '';
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  
  // Initialize with provided key or a dummy one to prevent constructor error if key is missing
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY_PREVENTS_CRASH' });
};

export const askCoach = async (question: string, context: string): Promise<string> => {
  try {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
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

    return response.text || "Üzgünüm, şu an cevap veremiyorum.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Bağlantı hatası oluştu. API anahtarı eksik olabilir.";
  }
};

export const getWorkoutAnalysis = async (recentLogs: WorkoutLog[], program: WorkoutDay[]): Promise<string> => {
  try {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    
    // Simplify logs for the prompt to save tokens
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

    const response = await ai.models.generateContent({
      model: model,
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
