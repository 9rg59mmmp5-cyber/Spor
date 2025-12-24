
import React, { useState, useEffect } from 'react';
import { Share, X, PlusSquare, Download, Smartphone } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Android Native Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform('android');
      
      // Zaten yüklenmiş mi kontrolü (localStorage ile)
      const hasDismissed = localStorage.getItem('install_prompt_dismissed');
      if (!hasDismissed) {
          setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. iOS Detection
    const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIOS && !isStandalone) {
        setPlatform('ios');
        const hasDismissed = localStorage.getItem('install_prompt_dismissed');
        if (!hasDismissed) {
            setTimeout(() => setShowPrompt(true), 2000);
        }
    }

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
      setShowPrompt(false);
      localStorage.setItem('install_prompt_dismissed', 'true');
  };

  const handleAndroidInstall = async () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
              setDeferredPrompt(null);
              setShowPrompt(false);
          }
      }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-700 z-[100] pb-safe animate-in slide-in-from-bottom duration-500 shadow-2xl">
      <div className="max-w-md mx-auto relative">
        <button 
            onClick={handleDismiss} 
            className="absolute -top-2 -right-2 p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full border border-zinc-700"
        >
            <X size={16} />
        </button>
        
        <div className="flex gap-4 pr-6 mb-4">
            <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-700 rounded-xl shadow-lg border border-white/10 flex items-center justify-center">
                    <Smartphone size={28} className="text-white" />
                </div>
            </div>
            <div>
                <h3 className="font-bold text-white text-sm mb-1">Uygulamayı Yükle</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                    Daha iyi performans ve tam ekran deneyimi için ana ekrana ekleyin.
                </p>
            </div>
        </div>

        {platform === 'android' && (
             <button 
                onClick={handleAndroidInstall}
                className="w-full py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
             >
                <Download size={18} />
                Şimdi Yükle
             </button>
        )}

        {platform === 'ios' && (
            <div className="space-y-3 text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center min-w-[24px] h-6 bg-zinc-700 rounded-full text-xs font-bold text-primary">1</span>
                    <span>Tarayıcının altındaki <Share size={16} className="inline mx-1 text-blue-400" /> paylaş butonuna basın.</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center min-w-[24px] h-6 bg-zinc-700 rounded-full text-xs font-bold text-primary">2</span>
                    <span><span className="font-bold text-white inline-flex items-center gap-1"><PlusSquare size={14}/> Ana Ekrana Ekle</span> seçeneğine dokunun.</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center min-w-[24px] h-6 bg-zinc-700 rounded-full text-xs font-bold text-primary">3</span>
                    <span>Sağ üstteki <span className="font-bold text-white">Ekle</span> butonuna basın.</span>
                </div>
                
                 {/* Arrow pointing down */}
                <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 text-zinc-500 animate-bounce">
                    ▼
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
