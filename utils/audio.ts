
// Web Audio API kullanarak ses efektleri oluşturur (harici dosya gerektirmez)

const audioCtx = typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext) 
  ? new (window.AudioContext || (window as any).webkitAudioContext)() 
  : null;

export const playSuccessSound = () => {
  if (!audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};

export const playTimerFinishedSound = () => {
  if (!audioCtx) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  
  // Double beep
  [0, 0.2, 0.4].forEach(offset => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, now + offset);
    
    gainNode.gain.setValueAtTime(0.1, now + offset);
    gainNode.gain.linearRampToValueAtTime(0.001, now + offset + 0.1);

    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.1);
  });
};

export const triggerHaptic = (duration: number = 50) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};
