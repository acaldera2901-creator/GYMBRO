import React, { useState } from 'react';
import { Activity, Weight, Dumbbell, ArrowRight, Info, ChevronUp, ChevronDown } from 'lucide-react';

interface StrengthTestScreenProps {
  onNext: (data: { testExercise: string, testWeight: string, testReps: string }) => void;
  themeColor?: string;
}

const EXERCISES = [
    { name: 'Panca Piana', emoji: '🏋️', desc: 'Parte superiore' },
    { name: 'Squat',       emoji: '🦵', desc: 'Gambe & Glutei' },
    { name: 'Stacco',      emoji: '⚡', desc: 'Schiena & Core' },
];

const StrengthTestScreen: React.FC<StrengthTestScreenProps> = ({ onNext, themeColor = 'emerald' }) => {
  const [exercise, setExercise] = useState('Panca Piana');
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(8);

  const accent      = themeColor === 'rose' ? 'bg-rose-500'            : 'bg-emerald-500';
  const accentHover = themeColor === 'rose' ? 'hover:bg-rose-400'       : 'hover:bg-emerald-400';
  const accentText  = themeColor === 'rose' ? 'text-rose-500'           : 'text-emerald-500';
  const accentBg    = themeColor === 'rose' ? 'bg-rose-500/10'          : 'bg-emerald-500/10';
  const accentBorder= themeColor === 'rose' ? 'border-rose-500'         : 'border-emerald-500';
  const accentShadow= themeColor === 'rose' ? 'shadow-rose-500/20'      : 'shadow-emerald-500/20';

  // Stima 1RM con formula Brzycki
  const oneRM = reps === 1 ? weight : Math.round(weight / (1.0278 - 0.0278 * reps));

  const adjust = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number, min: number, max: number) => {
      setter(prev => Math.min(max, Math.max(min, prev + delta)));
  };

  const handleContinue = () => {
      onNext({ testExercise: exercise, testWeight: String(weight), testReps: String(reps) });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">

      {/* Header */}
      <div className="px-6 pt-16 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">
            <Activity size={14} /> Step 3 di 4
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Test di Forza</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Inserisci i dati di un esercizio base. Calcoleremo tutto il resto da qui.
        </p>
      </div>

      <div className="flex-1 px-6 space-y-6 pb-32 overflow-y-auto">

        {/* Selezione Esercizio */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">
            Scegli Esercizio
          </label>
          <div className="grid grid-cols-3 gap-3">
            {EXERCISES.map(({ name, emoji, desc }) => {
              const isSelected = exercise === name;
              return (
                <button
                  key={name}
                  onClick={() => setExercise(name)}
                  className={`rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 py-5 px-2 active:scale-95 ${
                    isSelected
                      ? `${accentBg} ${accentBorder} shadow-lg ${accentShadow}`
                      : 'bg-[#121212] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? accentText : 'text-slate-400'}`}>
                      {name.split(' ')[0]}
                    </p>
                    <p className="text-[9px] text-slate-600 mt-0.5">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carico */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">
            Carico Utilizzato
          </label>
          <div className="bg-[#121212] border border-slate-800 rounded-3xl flex items-center overflow-hidden">
            <button
              onClick={() => adjust(setWeight, -2.5, 5, 500)}
              className="w-16 h-20 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
            >
              <ChevronDown size={24} />
            </button>
            <div className="flex-1 flex flex-col items-center py-4">
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(Math.max(5, parseFloat(e.target.value) || 0))}
                className="bg-transparent text-5xl font-black text-white text-center w-full focus:outline-none"
              />
              <span className="text-slate-600 text-xs font-bold uppercase tracking-wider mt-1">kg</span>
            </div>
            <button
              onClick={() => adjust(setWeight, 2.5, 5, 500)}
              className={`w-16 h-20 flex items-center justify-center text-white ${accent} ${accentHover} transition-colors active:scale-95`}
            >
              <ChevronUp size={24} />
            </button>
          </div>
        </div>

        {/* Ripetizioni */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">
            Ripetizioni Eseguite
          </label>
          <div className="bg-[#121212] border border-slate-800 rounded-3xl flex items-center overflow-hidden">
            <button
              onClick={() => adjust(setReps, -1, 1, 30)}
              className="w-16 h-20 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
            >
              <ChevronDown size={24} />
            </button>
            <div className="flex-1 flex flex-col items-center py-4">
              <input
                type="number"
                value={reps}
                onChange={e => setReps(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-transparent text-5xl font-black text-white text-center w-full focus:outline-none"
              />
              <span className="text-slate-600 text-xs font-bold uppercase tracking-wider mt-1">ripetizioni</span>
            </div>
            <button
              onClick={() => adjust(setReps, 1, 1, 30)}
              className={`w-16 h-20 flex items-center justify-center text-white ${accent} ${accentHover} transition-colors active:scale-95`}
            >
              <ChevronUp size={24} />
            </button>
          </div>
        </div>

        {/* 1RM Preview */}
        <div className={`${accentBg} border ${accentBorder} rounded-2xl p-4 flex items-center justify-between`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Massimale Stimato (1RM)</p>
            <p className={`text-3xl font-black ${accentText} mt-1`}>{oneRM} <span className="text-base font-bold text-slate-400">kg</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-medium">Formula Brzycki</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{weight}kg × {reps} reps</p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex gap-3 items-start">
          <Info size={18} className={`${accentText} shrink-0 mt-0.5`} />
          <p className="text-xs text-slate-400 leading-relaxed">
            Il massimale teorico viene usato per calibrare i carichi di tutti gli esercizi del tuo piano personalizzato.
          </p>
        </div>

      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
        <button
          onClick={handleContinue}
          className={`w-full ${accent} ${accentHover} text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}
        >
          GENERA PIANO <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>

    </div>
  );
};

export default StrengthTestScreen;
