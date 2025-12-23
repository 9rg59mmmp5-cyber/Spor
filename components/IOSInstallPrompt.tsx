
import React, { useState, useEffect } from 'react';
import { Share, X, PlusSquare } from 'lucide-react';

export const IOSInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    // Detect standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Show prompt only if on iOS and NOT installed
    if (isIOS && !isStandalone) {
        // Optional: Check if user dismissed it recently in localStorage
        const hasDismissed = localStorage.getItem('ios_prompt_dismissed');
        if (!hasDismissed) {
            // Delay slightly for better UX
            const timer = setTimeout(() => setShowPrompt(true), 2000);
            return () => clearTimeout(timer);
        }
    }
  }, []);

  const handleDismiss = () => {
      setShowPrompt(false);
      localStorage.setItem('ios_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 z-50 pb-safe animate-in slide-in-from-bottom duration-500 shadow-2xl">
      <div className="max-w-md mx-auto relative">
        <button 
            onClick={handleDismiss} 
            className="absolute -top-2 -right-2 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full border border-slate-700"
        >
            <X size={16} />
        </button>
        
        <div className="flex gap-4 pr-6 mb-4">
            <img 
                src="/app-icon.png" 
                alt="App Icon" 
                className="w-14 h-14 rounded-xl shadow-lg border border-slate-700"
            />
            <div>
                <h3 className="font-bold text-white text-sm mb-1">Uygulamayı Yükle</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                    Tam ekran antrenman deneyimi için bu uygulamayı ana ekranınıza ekleyin.
                </p>
            </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
                <span className="flex items-center justify-center min-w-[24px] h-6 bg-slate-700 rounded-full text-xs font-bold text-primary">1</span>
                <span>Tarayıcının altındaki <Share size={16} className="inline mx-1 text-blue-400" /> paylaş butonuna basın.</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="flex items-center justify-center min-w-[24px] h-6 bg-slate-700 rounded-full text-xs font-bold text-primary">2</span>
                <span>Aşağı kaydırıp <span className="font-bold text-white inline-flex items-center gap-1"><PlusSquare size={14}/> Ana Ekrana Ekle</span> seçeneğine dokunun.</span>
            </div>
             <div className="flex items-center gap-3">
                <span className="flex items-center justify-center min-w-[24px] h-6 bg-slate-700 rounded-full text-xs font-bold text-primary">3</span>
                <span>Sağ üst köşedeki <span className="font-bold text-white">Ekle</span> butonuna basarak tamamlayın.</span>
            </div>
        </div>
        
        {/* Arrow pointing down to the share button area (approximate position) */}
        <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 text-slate-500 animate-bounce">
            ▼
        </div>
      </div>
    </div>
  );
};
