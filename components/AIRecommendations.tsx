
import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCcw, Lightbulb } from 'lucide-react';
import { getWorkoutLogs, getProgram } from '../services/storageService';
import { getWorkoutAnalysis } from '../services/geminiService';
import { DEFAULT_PROGRAM } from '../constants';

export const AIRecommendations: React.FC = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(false);
    try {
      const logs = getWorkoutLogs();
      // Analysis uses the last 5 logs for context
      const recentLogs = logs
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      if (recentLogs.length === 0) {
        setAnalysis("Analiz için en az bir antrenman kaydı gerekli. Hadi salona!");
        setLoading(false);
        return;
      }

      // We use the current dynamic program instead of a static constant
      const result = await getWorkoutAnalysis(recentLogs, getProgram());
      setAnalysis(result);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl opacity-50 blur group-hover:opacity-75 transition duration-200"></div>
      <div className="relative bg-slate-900 rounded-xl p-5 border border-slate-800">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/20 p-2 rounded-lg">
                <Sparkles size={20} className="text-purple-400" />
            </div>
            <div>
                <h3 className="font-bold text-white">AI Performans Analizi</h3>
                <p className="text-xs text-slate-400">Gelişiminizi değerlendirin</p>
            </div>
          </div>
          
          {!analysis && !loading && (
             <button 
                onClick={handleAnalyze}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-full transition-colors font-medium"
             >
                Analiz Et
             </button>
          )}
        </div>

        {loading && (
          <div className="py-6 flex flex-col items-center text-slate-400 gap-2 animate-pulse">
            <Loader2 className="animate-spin text-purple-500" size={24} />
            <span className="text-xs">Geçmiş antrenmanlar inceleniyor...</span>
          </div>
        )}

        {error && (
           <div className="py-2 text-red-400 text-sm text-center">
              Analiz sırasında bir hata oluştu.
              <button onClick={handleAnalyze} className="ml-2 underline">Tekrar dene</button>
           </div>
        )}

        {analysis && (
          <div className="mt-2">
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
               {analysis}
            </div>
            <div className="mt-3 flex justify-end">
                <button 
                    onClick={handleAnalyze} 
                    className="text-xs text-slate-500 hover:text-purple-400 flex items-center gap-1"
                >
                    <RefreshCcw size={12} /> Yenile
                </button>
            </div>
          </div>
        )}

        {!analysis && !loading && !error && (
           <div className="mt-2 p-3 bg-slate-800/30 rounded-lg border border-dashed border-slate-700 flex gap-3 items-center text-slate-500 text-sm">
              <Lightbulb size={16} />
              <p>Son antrenman verilerinize göre size özel Progressive Overload tavsiyeleri alın.</p>
           </div>
        )}
      </div>
    </div>
  );
};
