
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Sparkles, Key, Lock, Settings, ChevronRight, ExternalLink } from 'lucide-react';
import { askCoach } from '../services/geminiService';
import { WEEKLY_PROGRAM } from '../constants';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTIONS = [
  "Squat formu nasıl olmalı?",
  "Bench Press için ipuçları",
  "Deadlift yaparken belim ağrıyor",
  "Sırt için alternatif hareketler",
  "Antrenman öncesi ne yemeli?",
  "Nasıl daha hızlı toparlanırım?"
];

export const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Merhaba! Ben antrenman koçunuzum. Egzersiz formları, varyasyonları veya programınız hakkında bana soru sorabilirsiniz.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if key exists in env or local storage
    const envKey = process.env.API_KEY;
    const localKey = localStorage.getItem('gemini_api_key');
    
    // We consider user has a key if either exists, but we can override via UI
    if (envKey || localKey) {
        setHasApiKey(true);
        if (localKey) setApiKeyInput(localKey);
    } else {
        setShowKeyInput(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, hasApiKey, showKeyInput]);

  const handleSaveKey = () => {
    if (apiKeyInput.trim().length > 10) {
        localStorage.setItem('gemini_api_key', apiKeyInput.trim());
        setHasApiKey(true);
        setShowKeyInput(false);
        setMessages(prev => [...prev, { role: 'assistant', text: 'API anahtarı kaydedildi. Size nasıl yardımcı olabilirim?' }]);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('gemini_api_key');
    setHasApiKey(false);
    setShowKeyInput(true);
    setApiKeyInput('');
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || loading) return;

    if (!hasApiKey && !process.env.API_KEY) {
        setShowKeyInput(true);
        return;
    }

    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setInput('');
    setLoading(true);

    // Prepare context from the static program
    const context = JSON.stringify(WEEKLY_PROGRAM);
    
    const response = await askCoach(messageText, context);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  // Render Key Input Screen
  if (showKeyInput) {
      return (
        <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-lg p-6 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             
             <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 space-y-6">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-2xl">
                    <Key size={32} className="text-primary" />
                </div>
                
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {hasApiKey ? 'API Ayarları' : 'API Anahtarı Gerekiyor'}
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                        AI Koç'u ve analiz özelliklerini kullanabilmek için Google Gemini API anahtarınızı {hasApiKey ? 'güncelleyebilirsiniz' : 'giriniz'}.
                    </p>
                </div>

                <div className="w-full max-w-xs space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="API Anahtarınızı yapıştırın"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    
                    <button 
                        onClick={handleSaveKey}
                        disabled={apiKeyInput.length < 10}
                        className="w-full bg-primary hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                    >
                        {hasApiKey ? 'Güncelle' : 'Kaydet ve Başla'} <ChevronRight size={16} />
                    </button>

                    {/* Cancel Button - Only show if we already have a key (so we can go back to chat) */}
                    {hasApiKey && (
                        <button 
                            onClick={() => setShowKeyInput(false)}
                            className="w-full text-slate-400 hover:text-white py-2 transition-colors text-sm"
                        >
                            Vazgeç
                        </button>
                    )}
                </div>

                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-primary flex items-center gap-1 transition-colors mt-4"
                >
                    Anahtar nasıl alınır? <ExternalLink size={10} />
                </a>
             </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden border border-slate-700 shadow-lg">
      <div className="bg-slate-900 p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
                <Bot size={24} className="text-primary" />
            </div>
            <div>
                <h2 className="font-bold text-white">AI Koç</h2>
                <p className="text-xs text-slate-400">Powered by Gemini 2.5</p>
            </div>
        </div>
        
        <button 
            onClick={() => {
                const currentKey = localStorage.getItem('gemini_api_key') || '';
                setApiKeyInput(currentKey);
                setShowKeyInput(true);
            }} 
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="API Ayarları"
        >
            <Settings size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-950/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none shadow-primary/10' 
                : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-3 flex items-center gap-2 shadow-md">
                <Loader2 className="animate-spin text-primary" size={16} />
                <span className="text-xs text-slate-400">Yazıyor...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {!loading && messages.length < 4 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar bg-slate-950/50 pt-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Sparkles size={12} className="text-purple-400" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 sticky bottom-0 z-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={hasApiKey ? "Bir soru sor..." : "Önce API anahtarı girin"}
            className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary border border-slate-700 placeholder:text-slate-500 transition-all"
            disabled={loading}
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim() || (!hasApiKey && !process.env.API_KEY)}
            className="bg-primary hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-500/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
