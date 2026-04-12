import { useState, useEffect } from 'react';

export default function BootScreen({ onComplete }) {
  const [phase, setPhase] = useState('boot'); // boot -> login -> done

  useEffect(() => {
    if (sessionStorage.getItem('macos-booted')) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('macos-booted', '1');
      setTimeout(onComplete, 100);
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center transition-opacity duration-500 opacity-0 pointer-events-none" />
    );
  }

  // boot phase
  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center">
      <svg width="48" height="58" viewBox="0 0 14 17" fill="white" opacity="0.9" className="mb-8">
        <path d="M11.3 8.9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.7-.7-2.8-.7C2.8 4.1 1.4 5 .6 6.4c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.3.9-1.3 1.2-2.5 1.3-2.6 0 0-2.5-1-2.5-3.2zM9 3.2C9.6 2.4 10 1.4 9.9.3 9 .3 7.9.9 7.3 1.7c-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2z"/>
      </svg>
      <div className="w-48 h-1 rounded-full bg-white/20 overflow-hidden">
        <div className="h-full bg-white/80 rounded-full" style={{ animation: 'boot-progress 1.4s ease-in-out forwards' }} />
      </div>
    </div>
  );
}
