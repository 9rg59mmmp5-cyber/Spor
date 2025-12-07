
import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, WorkoutDay } from "../types";
import { AnatomyInfo } from "../constants";

// Helper to safely get API key from Env or LocalStorage
const getAI = () => {
  let apiKey = '';

  // 1. Check Local Storage (User entered via UI) - PRIORITY 1
  // This allows the user to override any broken/dummy env key
  if (typeof window !== 'undefined') {
    try {
        apiKey = localStorage.getItem('gemini_api_key') || '';
    } catch (e) {
        console.warn("Local storage access failed for API key");
    }
  }
  
  // 2. Check Process Env (Fallback) - PRIORITY 2
  if (!apiKey) {
      try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
          apiKey = process.env.API_KEY;
        }
      } catch (e) {
        // Ignore error
      }
  }
  
  // Initialize with provided key or a dummy one to prevent constructor error if key is missing
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
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
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.message?.includes('API key')) {
        return "API Anahtarı hatası. Lütfen Ayarlar (Çark Simgesi) kısmından geçerli bir anahtar girin.";
    }
    return "Bağlantı hatası oluştu. Lütfen tekrar deneyin.";
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
    return "Analiz servisi şu an kullanılamıyor. API anahtarınızı kontrol edin.";
  }
};

export const generateAnatomyImage = async (info: AnatomyInfo): Promise<string | null> => {
  try {
    const ai = getAI();
    const model = 'gemini-2.5-flash-image'; 

    const prompt = JSON.stringify({
      fixed_prompt_components: {
        composition: "Wide angle full body shot, the entire figure is visible from head to toe, far shot, vertical portrait framing, centered and symmetrical stance",
        background: "Isolated on a seamless pure black background, dark studio backdrop, clean dark environment",
        art_style: "Photorealistic 3D medical render, ZBrush digital sculpture style, scientific anatomy model aesthetics",
        texture_and_material: "Monochromatic silver-grey skin with brushed metal texture, micro-surface details, highly detailed muscle striation, matte finish, semi-transparent X-Ray skin",
        lighting_and_tech: "Cinematic rim lighting, global illumination, raytracing, ambient occlusion, 8k resolution, UHD, sharp focus, hyper-detailed"
      },
      variables: info.variables,
      negative_prompt: "text, infographic, chart, diagram, labels, arrows, UI, cropped image, close-up, macro shot, headshot, cut off feet, cut off head, partial body, grey background, gradient background, shadows on floor, blurry, low resolution, distortion, watermark"
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: `Generate an image based on this JSON description: ${prompt}` }]
      }
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
         }
       }
    }
    
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
