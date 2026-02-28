
import React, { useState } from 'react';
import { ChevronLeft, Dumbbell, Activity, Weight, ArrowRight, Info } from 'lucide-react';

interface StrengthTestScreenProps {
  onNext: (data: { testExercise: string, testWeight: string, testReps: string }) => void;
}

const StrengthTestScreen: React.FC<StrengthTestScreenProps> = ({ onNext }) => {
  const [exercise, setExercise] = useState('Panca Piana');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const handleContinue = () => {
    if (!weight || !reps) return;
    onNext({
      testExercise: exercise,
      testWeight: weight,
      testReps: reps
    });
  };

  const getExerciseIcon = (name: string) => {
      if (name === 'Squat') return Activity;
      if (name === 'Stacco') return Weight;
      return Dumbbell;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <div className="px-6 pt-16 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">
            <Activity size={14} /> Step 3 di 4
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Test di Forza</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Inserisci i dati di un esercizio base. Calcoleremo tutto il resto da qui.
        </p>
      </div>

      <div className="flex-1 px-6 space-y-8 pb-24 overflow-y-auto">
        
        <div>
           <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1 block mb-3">Scegli Esercizio</label>
           <div className="grid grid-cols-3 gap-3">
              {['Panca Piana', 'Squat', 'Stacco'].map((ex) => {
                const isSelected = exercise === ex;
                const Icon = getExerciseIcon(ex);
                return (
                    <button
                        key={ex}
                        onClick={() => setExercise(ex)}
                        className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                            isSelected 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30' 
                            : 'bg-[#121212] border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                    >
                        <Icon size={24} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{ex.split(' ')[0]}</span>
                    </button>
                );
              })}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#121212] border border-slate-800 rounded-3xl p-6 relative overflow-hidden group focus-within:border-blue-500/50 transition-colors aspect-square flex flex-col justify-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 text-center">Carico</label>
                <div className="flex items-center justify-center gap-1">
                    <input 
                        type="number" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0"
                        className="bg-transparent text-6xl font-black text-white placeholder-slate-800 outline-none w-full text-center"
                    />
                </div>
                <span className="text-slate-600 font-bold text-sm text-center">kg</span>
            </div>

            <div className="bg-[#121212] border border-slate-800 rounded-3xl p-6 relative overflow-hidden group focus-within:border-blue-500/50 transition-colors aspect-square flex flex-col justify-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 text-center">Reps</label>
                <div className="flex items-center justify-center gap-1">
                    <input 
                        type="number" 
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        placeholder="0"
                        className="bg-transparent text-6xl font-black text-white placeholder-slate-800 outline-none w-full text-center"
                    />
                </div>
                <span className="text-slate-600 font-bold text-sm text-center">x</span>
            </div>
        </div>

        <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex gap-3 items-start">
            <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
                Usiamo la formula <strong className="text-white">Brzycki</strong> per stimare il tuo massimale teorico (1RM) e generare i carichi di lavoro.
            </p>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
        <button 
          onClick={handleContinue}
          disabled={!weight || !reps}
          className={`w-full font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
             !weight || !reps ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'
          }`}
        >
          GENERA PIANO <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default StrengthTestScreen;
