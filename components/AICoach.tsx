
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setInput('');
    setLoading(true);

    // Prepare context from the static program
    const context = JSON.stringify(WEEKLY_PROGRAM);
    
    const response = await askCoach(messageText, context);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden border border-slate-700 shadow-lg">
      <div className="bg-slate-900 p-4 border-b border-slate-700 flex items-center gap-3 sticky top-0 z-10">
        <div className="bg-primary/20 p-2 rounded-full">
            <Bot size={24} className="text-primary" />
        </div>
        <div>
            <h2 className="font-bold text-white">AI Koç</h2>
            <p className="text-xs text-slate-400">Powered by Gemini 2.5</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/20' 
                : 'bg-slate-700 text-slate-100 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-700 rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                <Loader2 className="animate-spin text-slate-400" size={16} />
                <span className="text-xs text-slate-400">Yazıyor...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {!loading && messages.length < 4 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
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
            placeholder="Bir soru sor..."
            className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary border border-slate-700 placeholder:text-slate-500"
            disabled={loading}
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-500/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
