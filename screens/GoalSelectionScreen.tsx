
import React, { useState } from 'react';
import { ChevronLeft, Dumbbell, Flame, Activity, Zap, CheckCircle2, Target, ArrowRight } from 'lucide-react';

interface GoalSelectionScreenProps {
  onFinish: (goal: string) => void;
}

interface Goal {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}

const goals: Goal[] = [
  { id: 'muscle', title: 'Ipertrofia', desc: 'Massimizza volume e forza muscolare.', icon: Dumbbell, color: 'emerald' },
  { id: 'definition', title: 'Definizione', desc: 'Scolpisci i dettagli, mantieni i muscoli.', icon: Zap, color: 'emerald' }, // Changed color logic to match screenshot selection style
  { id: 'weight_loss', title: 'Perdita Peso', desc: 'Brucia calorie ad alta intensità.', icon: Flame, color: 'emerald' },
  { id: 'endurance', title: 'Resistenza', desc: 'Migliora fiato e stamina.', icon: Activity, color: 'emerald' },
];

const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({ onFinish }) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('muscle');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <div className="px-6 pt-16 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">
            <Target size={14} /> Step 2 di 4
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2">Il tuo Obiettivo</h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            L'algoritmo calibrerà intensità e volume in base a questa scelta.
        </p>
      </div>

      <div className="flex-1 px-6 space-y-3 pb-24 overflow-y-auto">
        {goals.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            const Icon = goal.icon;

            return (
                <div 
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group flex items-center justify-between ${
                        isSelected 
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                        : 'bg-[#121212] border-slate-800 text-slate-400 hover:bg-[#1a1a1a]'
                    }`}
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-black/20 text-slate-950' : 'bg-slate-800/50 text-slate-500'
                        }`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <h3 className={`font-black text-lg ${isSelected ? 'text-slate-950' : 'text-white'}`}>{goal.title}</h3>
                            <p className={`text-xs mt-0.5 font-medium leading-tight max-w-[200px] ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>{goal.desc}</p>
                        </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected 
                        ? 'border-slate-950' 
                        : 'border-slate-600'
                    }`}>
                        {isSelected && <div className="w-3 h-3 rounded-full bg-slate-950"></div>}
                    </div>
                </div>
            );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
        <button 
          onClick={() => onFinish(selectedGoal)}
          className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          CONTINUA <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default GoalSelectionScreen;
