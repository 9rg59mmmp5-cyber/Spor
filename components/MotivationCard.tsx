
import React, { useState, useEffect } from 'react';
import { Quote, Zap, RefreshCw } from 'lucide-react';
import { MOTIVATION_QUOTES } from '../constants';

export const MotivationCard: React.FC = () => {
  const [quote, setQuote] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
    return MOTIVATION_QUOTES[randomIndex];
  };

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
        setQuote(getRandomQuote());
        setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 bg-indigo-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                <div className="bg-orange-500/10 p-2 rounded-xl">
                    <Zap size={16} className="text-orange-500 fill-orange-500" />
                </div>
                <span className="text-[10px] font-extrabold text-orange-500 tracking-widest uppercase">Günlük Motivasyon</span>
            </div>
            
            <button 
                onClick={handleRefresh}
                className={`text-slate-500 hover:text-white transition-all p-2 rounded-full hover:bg-slate-800 active:scale-90 ${isAnimating ? 'animate-spin' : ''}`}
            >
                <RefreshCw size={16} />
            </button>
        </div>
        
        <div className={`flex gap-4 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <Quote size={32} className="text-slate-700 flex-shrink-0 transform scale-x-[-1] -mt-2" />
          <p className="text-lg md:text-xl text-slate-200 font-medium italic leading-relaxed tracking-wide">
            "{quote}"
          </p>
        </div>
      </div>
    </div>
  );
};
