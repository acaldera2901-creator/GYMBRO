
import React, { useEffect, useState } from 'react';
import { ScanFace, Lock, Unlock, Fingerprint } from 'lucide-react';

interface BiometricGateProps {
  onUnlock: () => void;
  isDarkMode: boolean;
}

const BiometricGate: React.FC<BiometricGateProps> = ({ onUnlock, isDarkMode }) => {
  const [status, setStatus] = useState<'scanning' | 'success' | 'failed'>('scanning');

  useEffect(() => {
    // Simulazione scansione FaceID
    const timer = setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onUnlock();
      }, 800);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onUnlock]);

  const bgColor = isDarkMode ? 'bg-black' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-black';

  return (
    <div className={`fixed inset-0 z-[9999] ${bgColor} flex flex-col items-center justify-center transition-colors duration-300`}>
      <div className="flex flex-col items-center animate-in fade-in duration-700">
        
        <div className="relative mb-8">
            {/* Pulsing Rings */}
            {status === 'scanning' && (
                <>
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-pulse delay-75"></div>
                </>
            )}

            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                status === 'success' ? 'bg-emerald-500 text-white scale-110' : 
                status === 'failed' ? 'bg-red-500 text-white' : 
                isDarkMode ? 'bg-zinc-900 text-emerald-500' : 'bg-zinc-100 text-emerald-600'
            }`}>
                {status === 'success' ? (
                    <Unlock size={40} className="animate-bounce" />
                ) : (
                    <ScanFace size={40} className={status === 'scanning' ? 'animate-pulse' : ''} />
                )}
            </div>
        </div>

        <h2 className={`text-2xl font-bold mb-2 ${textColor}`}>
            {status === 'success' ? 'Identità Confermata' : 'GymBro Locked'}
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {status === 'success' ? 'Benvenuto' : 'Richiesto FaceID per accedere'}
        </p>

        {status === 'scanning' && (
            <div className="mt-12 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
        )}
      </div>

      <div className="absolute bottom-10">
          <button onClick={() => setStatus('scanning')} className="flex flex-col items-center gap-2 text-zinc-500 active:text-emerald-500 transition-colors">
              <Fingerprint size={32} />
              <span className="text-xs font-bold uppercase tracking-widest">Usa Touch ID</span>
          </button>
      </div>
    </div>
  );
};

export default BiometricGate;
