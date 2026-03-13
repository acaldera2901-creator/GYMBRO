import React, { useState } from 'react';
import { ChevronLeft, Dumbbell, Flame, Activity, Zap, ArrowRight, Target, Home, Building2, Sparkles, TrendingUp, Clock } from 'lucide-react';

interface GoalSelectionScreenProps {
  onFinish: (goal: string, experience?: string, equipment?: string, frequency?: number) => void;
}

type Step = 'goal' | 'experience' | 'equipment' | 'frequency';

const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({ onFinish }) => {
  const [step, setStep] = useState<Step>('goal');
  const [selectedGoal, setSelectedGoal] = useState('muscle');
  const [experience, setExperience] = useState('intermediate');
  const [equipment, setEquipment] = useState('full_gym');
  const [frequency, setFrequency] = useState(4);

  const steps: Step[] = ['goal', 'experience', 'equipment', 'frequency'];
  const stepIndex = steps.indexOf(step);

  const goals = [
    { id: 'muscle',      title: 'Ipertrofia',     desc: 'Massimizza volume e forza muscolare.',     icon: Dumbbell, tag: 'Più popolare' },
    { id: 'definition',  title: 'Definizione',    desc: 'Scolpisci i dettagli, mantieni i muscoli.', icon: Zap,      tag: null },
    { id: 'weight_loss', title: 'Perdita Peso',   desc: 'Brucia calorie ad alta intensità.',         icon: Flame,    tag: null },
    { id: 'endurance',   title: 'Resistenza',     desc: 'Migliora fiato e stamina.',                 icon: Activity, tag: null },
  ];

  const experiences = [
    { id: 'beginner',     title: 'Principiante',  desc: 'Meno di 1 anno di allenamento',         emoji: '🌱', detail: 'Piano su misura, progressioni graduali' },
    { id: 'intermediate', title: 'Intermedio',    desc: '1–3 anni di allenamento costante',      emoji: '💪', detail: 'Periodizzazione e intensità moderate' },
    { id: 'advanced',     title: 'Avanzato',      desc: '3+ anni, conosco le tecniche avanzate', emoji: '⚡', detail: 'Volume elevato, tecniche speciali' },
  ];

  const equipments = [
    { id: 'full_gym',   title: 'Palestra Completa', desc: 'Bilancieri, macchine, cavi, tutto',    icon: Building2, color: '#10b981' },
    { id: 'home_gym',   title: 'Home Gym',          desc: 'Manubri, barra, panca, spazio limitato', icon: Home,   color: '#6366f1' },
    { id: 'bodyweight', title: 'Solo Corpo Libero', desc: 'Senza attrezzi, ovunque',               icon: Sparkles, color: '#f59e0b' },
  ];

  const handleNext = () => {
    if (step === 'goal')       setStep('experience');
    else if (step === 'experience') setStep('equipment');
    else if (step === 'equipment')  setStep('frequency');
    else onFinish(selectedGoal, experience, equipment, frequency);
  };

  const handleBack = () => {
    if (step === 'experience') setStep('goal');
    else if (step === 'equipment') setStep('experience');
    else if (step === 'frequency') setStep('equipment');
  };

  const progressW = ((stepIndex + 1) / steps.length) * 100;

  const renderGoal = () => (
    <div className="space-y-3">
      {goals.map((goal) => {
        const isSelected = selectedGoal === goal.id;
        const Icon = goal.icon;
        return (
          <div key={goal.id} onClick={() => setSelectedGoal(goal.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              isSelected ? 'bg-emerald-500 border-emerald-400' : 'bg-[#121212] border-slate-800 hover:border-slate-600'
            }`}>
            {goal.tag && (
              <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {goal.tag}
              </span>
            )}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-black/20 text-black' : 'bg-slate-800/50 text-slate-400'}`}>
                <Icon size={22} />
              </div>
              <div>
                <h3 className={`font-black text-base ${isSelected ? 'text-black' : 'text-white'}`}>{goal.title}</h3>
                <p className={`text-xs mt-0.5 ${isSelected ? 'text-black/70' : 'text-slate-500'}`}>{goal.desc}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-3">
      {experiences.map((ex) => {
        const isSelected = experience === ex.id;
        return (
          <div key={ex.id} onClick={() => setExperience(ex.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              isSelected ? 'bg-[#1a1a1a] border-emerald-500' : 'bg-[#121212] border-slate-800 hover:border-slate-600'
            }`}>
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-0.5">{ex.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base">{ex.title}</h3>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-500' : 'border-slate-600'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">{ex.desc}</p>
                {isSelected && (
                  <p className="text-emerald-400 text-[11px] mt-2 font-medium">✓ {ex.detail}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderEquipment = () => (
    <div className="space-y-3">
      {equipments.map((eq) => {
        const isSelected = equipment === eq.id;
        const Icon = eq.icon;
        return (
          <div key={eq.id} onClick={() => setEquipment(eq.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              isSelected ? 'bg-[#1a1a1a] border-emerald-500' : 'bg-[#121212] border-slate-800 hover:border-slate-600'
            }`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: isSelected ? `${eq.color}20` : '#1f1f1f' }}>
                <Icon size={22} style={{ color: isSelected ? eq.color : '#6b7280' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-white text-base">{eq.title}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{eq.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-500' : 'border-slate-600'}`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderFrequency = () => (
    <div>
      <div className="bg-[#121212] border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Giorni a settimana</p>
            <p className="text-6xl font-black text-white">{frequency}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Clock size={28} className="text-emerald-400" />
          </div>
        </div>
        <div className="flex gap-2">
          {[2,3,4,5,6].map(n => (
            <button key={n} onClick={() => setFrequency(n)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                frequency === n ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Preview del piano */}
      <div className="space-y-2">
        {[
          { days: 2, label: 'Full Body × 2', rest: 'Riposo abbondante, ideale per principianti' },
          { days: 3, label: 'Push / Pull / Legs', rest: 'Split classico, ottimo equilibrio' },
          { days: 4, label: 'Upper / Lower × 2', rest: 'Alta frequenza per muscolo' },
          { days: 5, label: '5-Day Split', rest: 'Un muscolo al giorno, massimo volume' },
          { days: 6, label: '6-Day PPL', rest: 'Push Pull Legs × 2, elite' },
        ].filter(p => p.days === frequency).map(plan => (
          <div key={plan.days} className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 font-bold text-sm">📋 {plan.label}</p>
            <p className="text-slate-400 text-xs mt-1">{plan.rest}</p>
          </div>
        ))}
        <div className="bg-[#121212] border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-xs leading-relaxed">
            💡 Potrai sempre modificare i giorni dal profilo dopo il setup.
          </p>
        </div>
      </div>
    </div>
  );

  const titles: Record<Step, { step: string; title: string; sub: string }> = {
    goal:       { step: 'Step 1 di 4', title: 'Il tuo Obiettivo',  sub: "L'algoritmo calibrerà intensità e volume." },
    experience: { step: 'Step 2 di 4', title: 'La tua Esperienza', sub: 'Adaptiamo il piano al tuo livello attuale.' },
    equipment:  { step: 'Step 3 di 4', title: 'La tua Attrezzatura', sub: 'Gli esercizi saranno adattati a quello che hai.' },
    frequency:  { step: 'Step 4 di 4', title: 'Quante volte a settimana?', sub: 'Costruiamo la tua routine ideale.' },
  };

  const t = titles[step];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-3">
        <button onClick={handleBack} className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#121212] border border-slate-800 transition-all ${stepIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          {/* Progress bar */}
          <div className="h-1 bg-slate-800 rounded-full mb-2">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressW}%` }} />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.step}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="px-6 pb-6">
        <h1 className="text-3xl font-black text-white mb-1">{t.title}</h1>
        <p className="text-slate-400 text-sm">{t.sub}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {step === 'goal'       && renderGoal()}
        {step === 'experience' && renderExperience()}
        {step === 'equipment'  && renderEquipment()}
        {step === 'frequency'  && renderFrequency()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
        <button onClick={handleNext}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
          {step === 'frequency' ? 'GENERA IL MIO PIANO' : 'CONTINUA'}
          <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default GoalSelectionScreen;
