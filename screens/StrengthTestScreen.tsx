import React, { useState } from 'react';
import { Activity, ArrowRight, Info, ChevronUp, ChevronDown, CheckCircle2, Plus } from 'lucide-react';

// Nuova interfaccia: passa i 3 massimali diretti + quale esercizio è stato testato
interface StrengthTestScreenProps {
  onNext: (data: {
    testExercise: string;
    testWeight: string;
    testReps: string;
    knownMaxes: { bench: number | null; squat: number | null; deadlift: number | null };
  }) => void;
  themeColor?: string;
}

// Formula Brzycki: stima 1RM
const brzycki = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const rm = weight / (1.0278 - 0.0278 * reps);
  return Math.round(rm / 2.5) * 2.5; // arrotonda ai 2.5kg
};

// Valori di default realistici per ogni esercizio
const DEFAULTS = {
  bench:    { weight: 60,  reps: 8 },
  squat:    { weight: 80,  reps: 8 },
  deadlift: { weight: 100, reps: 5 },
};

const EXERCISES = [
  { key: 'bench'    as const, name: 'Panca Piana',    emoji: '🏋️', label: 'Panca',  desc: 'Busto superiore' },
  { key: 'squat'    as const, name: 'Squat',          emoji: '🦵', label: 'Squat',  desc: 'Gambe & Glutei'  },
  { key: 'deadlift' as const, name: 'Stacco da Terra',emoji: '⚡', label: 'Stacco', desc: 'Schiena & Core'   },
];

type ExKey = 'bench' | 'squat' | 'deadlift';

interface SlotState {
  active: boolean;   // l'utente ha attivato questo slot
  weight: number;
  reps: number;
}

const StrengthTestScreen: React.FC<StrengthTestScreenProps> = ({ onNext, themeColor = 'emerald' }) => {
  // Ogni esercizio ha il suo slot indipendente
  const [slots, setSlots] = useState<Record<ExKey, SlotState>>({
    bench:    { active: false, ...DEFAULTS.bench },
    squat:    { active: false, ...DEFAULTS.squat },
    deadlift: { active: false, ...DEFAULTS.deadlift },
  });

  // Slot attualmente espanso (uno alla volta per semplicità)
  const [expanded, setExpanded] = useState<ExKey | null>(null);

  const ac = themeColor === 'rose';
  const accentBg     = ac ? 'bg-rose-500'      : 'bg-emerald-500';
  const accentHover  = ac ? 'hover:bg-rose-400' : 'hover:bg-emerald-400';
  const accentText   = ac ? 'text-rose-500'     : 'text-emerald-500';
  const accentBgSoft = ac ? 'bg-rose-500/10'   : 'bg-emerald-500/10';
  const accentBorder = ac ? 'border-rose-500'  : 'border-emerald-500';

  const activeCount = Object.values(slots).filter(s => s.active).length;

  const setSlotField = (key: ExKey, field: 'weight' | 'reps', val: number) => {
    setSlots(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  };

  const activateSlot = (key: ExKey) => {
    setSlots(prev => ({ ...prev, [key]: { ...prev[key], active: true } }));
    setExpanded(key);
  };

  const deactivateSlot = (key: ExKey) => {
    setSlots(prev => ({ ...prev, [key]: { ...prev[key], active: false, ...DEFAULTS[key] } }));
    if (expanded === key) setExpanded(null);
  };

  const toggleExpand = (key: ExKey) => {
    if (!slots[key].active) { activateSlot(key); return; }
    setExpanded(prev => prev === key ? null : key);
  };

  const adjust = (key: ExKey, field: 'weight' | 'reps', delta: number) => {
    const s = slots[key];
    const min = field === 'reps' ? 1 : 2.5;
    const max = field === 'reps' ? 30 : 500;
    const step = field === 'reps' ? 1 : 2.5;
    const newVal = Math.min(max, Math.max(min, Math.round((s[field] + delta) / step) * step));
    setSlotField(key, field, newVal);
  };

  const handleContinue = () => {
    // Trova il primo esercizio attivo come "testExercise" principale
    const primary = EXERCISES.find(e => slots[e.key].active);
    if (!primary) return;

    const s = slots[primary.key];
    const knownMaxes: Record<ExKey, number | null> = {
      bench:    slots.bench.active    ? brzycki(slots.bench.weight,    slots.bench.reps)    : null,
      squat:    slots.squat.active    ? brzycki(slots.squat.weight,    slots.squat.reps)    : null,
      deadlift: slots.deadlift.active ? brzycki(slots.deadlift.weight, slots.deadlift.reps) : null,
    };

    onNext({
      testExercise: primary.name,
      testWeight:   String(s.weight),
      testReps:     String(s.reps),
      knownMaxes,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-6 pt-16 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">
          <Activity size={14} /> Step 3 di 4
        </div>
        <h1 className="text-4xl font-black text-white mb-2">I tuoi Massimali</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Inserisci i carichi che conosci. Almeno uno obbligatorio — gli altri li stimiamo noi.
        </p>
      </div>

      <div className="flex-1 px-6 pb-36 overflow-y-auto space-y-3">

        {/* Slot esercizi */}
        {EXERCISES.map(({ key, name, emoji, label, desc }) => {
          const s = slots[key];
          const isActive = s.active;
          const isExpanded = expanded === key;
          const oneRM = isActive ? brzycki(s.weight, s.reps) : null;

          return (
            <div
              key={key}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                isActive
                  ? `${accentBgSoft} ${accentBorder}`
                  : 'bg-[#111] border-zinc-800'
              }`}
            >
              {/* Riga header slot */}
              <div
                className="flex items-center gap-3 px-4 py-4 cursor-pointer"
                onClick={() => toggleExpand(key)}
              >
                <span className="text-2xl">{emoji}</span>
                <div className="flex-1">
                  <p className={`font-black text-sm ${isActive ? accentText : 'text-slate-400'}`}>{label}</p>
                  <p className="text-[10px] text-slate-600">{desc}</p>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-3">
                    {/* Preview 1RM */}
                    <div className="text-right">
                      <p className={`font-black text-lg ${accentText}`}>{oneRM} <span className="text-xs text-slate-500">kg</span></p>
                      <p className="text-[9px] text-slate-600">1RM stimato</p>
                    </div>
                    {/* Rimuovi */}
                    <button
                      onClick={e => { e.stopPropagation(); deactivateSlot(key); }}
                      className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className={`flex items-center gap-1.5 text-xs font-bold text-zinc-600 border border-zinc-700 rounded-xl px-3 py-1.5`}>
                    <Plus size={12} /> Aggiungi
                  </div>
                )}
              </div>

              {/* Pannello espanso */}
              {isActive && isExpanded && (
                <div className="px-4 pb-5 space-y-4 border-t border-zinc-800/50 pt-4">
                  {/* Carico */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Carico</p>
                    <div className="bg-black/40 rounded-2xl flex items-center overflow-hidden border border-zinc-800">
                      <button onClick={() => adjust(key, 'weight', -2.5)} className="w-14 h-14 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors active:scale-95">
                        <ChevronDown size={20} />
                      </button>
                      <div className="flex-1 flex items-baseline justify-center gap-1">
                        <input
                          type="number"
                          value={s.weight}
                          onChange={e => setSlotField(key, 'weight', Math.max(2.5, parseFloat(e.target.value) || 0))}
                          className="bg-transparent text-3xl font-black text-white text-center w-20 focus:outline-none"
                        />
                        <span className="text-slate-600 text-xs font-bold">kg</span>
                      </div>
                      <button onClick={() => adjust(key, 'weight', 2.5)} className={`w-14 h-14 flex items-center justify-center text-white ${accentBg} ${accentHover} transition-colors active:scale-95`}>
                        <ChevronUp size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Reps */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Ripetizioni</p>
                    <div className="bg-black/40 rounded-2xl flex items-center overflow-hidden border border-zinc-800">
                      <button onClick={() => adjust(key, 'reps', -1)} className="w-14 h-14 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors active:scale-95">
                        <ChevronDown size={20} />
                      </button>
                      <div className="flex-1 flex items-baseline justify-center gap-1">
                        <input
                          type="number"
                          value={s.reps}
                          onChange={e => setSlotField(key, 'reps', Math.max(1, parseInt(e.target.value) || 1))}
                          className="bg-transparent text-3xl font-black text-white text-center w-16 focus:outline-none"
                        />
                        <span className="text-slate-600 text-xs font-bold">reps</span>
                      </div>
                      <button onClick={() => adjust(key, 'reps', 1)} className={`w-14 h-14 flex items-center justify-center text-white ${accentBg} ${accentHover} transition-colors active:scale-95`}>
                        <ChevronUp size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Risultato 1RM */}
                  <div className={`${accentBgSoft} rounded-xl p-3 flex items-center justify-between`}>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Massimale Stimato</p>
                      <p className={`text-2xl font-black ${accentText} mt-0.5`}>{oneRM} <span className="text-sm text-slate-400">kg</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-600">Formula Brzycki</p>
                      <p className="text-[9px] text-slate-700">{s.weight}kg × {s.reps} reps</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Riepilogo massimali */}
        {activeCount > 0 && (
          <div className="bg-[#111] rounded-2xl border border-zinc-800 p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Riepilogo calcolato</p>
            {EXERCISES.map(({ key, label, emoji }) => {
              const s = slots[key];
              const val = s.active ? brzycki(s.weight, s.reps) : null;
              const isEstimated = !s.active;

              // Stima dai massimali noti
              let estimated = 0;
              if (isEstimated) {
                const b = slots.bench.active    ? brzycki(slots.bench.weight,    slots.bench.reps)    : null;
                const sq = slots.squat.active   ? brzycki(slots.squat.weight,    slots.squat.reps)    : null;
                const dl = slots.deadlift.active ? brzycki(slots.deadlift.weight, slots.deadlift.reps) : null;

                if (key === 'bench')    estimated = sq ? Math.round(sq / 1.35 / 2.5) * 2.5 : dl ? Math.round(dl / 1.60 / 2.5) * 2.5 : 0;
                if (key === 'squat')   estimated = b  ? Math.round(b  * 1.35 / 2.5) * 2.5 : dl ? Math.round(dl / 1.60 * 1.35 / 2.5) * 2.5 : 0;
                if (key === 'deadlift')estimated = b  ? Math.round(b  * 1.60 / 2.5) * 2.5 : sq ? Math.round(sq / 1.35 * 1.60 / 2.5) * 2.5 : 0;
              }

              const displayVal = val || estimated;

              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{emoji}</span>
                    <span className="text-sm text-slate-400 font-medium">{label}</span>
                    {isEstimated && displayVal > 0 && (
                      <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md font-bold">STIMA</span>
                    )}
                  </div>
                  <span className={`font-black text-base ${s.active ? accentText : 'text-zinc-500'}`}>
                    {displayVal > 0 ? `${displayVal} kg` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        <div className="bg-[#111] p-4 rounded-xl border border-zinc-800 flex gap-3 items-start">
          <Info size={16} className={`${accentText} shrink-0 mt-0.5`} />
          <p className="text-xs text-slate-500 leading-relaxed">
            Inserisci almeno un massimale reale. Gli altri vengono stimati con coefficienti standard. Puoi sempre aggiornarli dal profilo.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
        <button
          onClick={handleContinue}
          disabled={activeCount === 0}
          className={`w-full ${accentBg} ${accentHover} disabled:opacity-30 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}
        >
          {activeCount === 0
            ? 'Aggiungi almeno un massimale'
            : `GENERA PIANO • ${activeCount} esercizio${activeCount > 1 ? 'i' : ''}`
          }
          {activeCount > 0 && <ArrowRight size={20} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
};

export default StrengthTestScreen;
