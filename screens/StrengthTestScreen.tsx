import React, { useState } from 'react';
import { Activity, ArrowRight, Info, ChevronUp, ChevronDown, Plus, Zap, Target, TrendingUp } from 'lucide-react';

interface StrengthTestScreenProps {
  onNext: (data: {
    testExercise: string;
    testWeight: string;
    testReps: string;
    knownMaxes: { bench: number | null; squat: number | null; deadlift: number | null };
  }) => void;
  themeColor?: string;
}

const brzycki = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const rm = weight / (1.0278 - 0.0278 * reps);
  return Math.round(rm / 2.5) * 2.5;
};

// Livelli per ogni esercizio (uomo - standard generali)
const LEVELS = {
  bench: [
    { label: 'Principiante', min: 0, max: 60, color: '#6b7280' },
    { label: 'Intermedio', min: 60, max: 100, color: '#3b82f6' },
    { label: 'Avanzato', min: 100, max: 140, color: '#8b5cf6' },
    { label: 'Elite', min: 140, max: 999, color: '#f59e0b' },
  ],
  squat: [
    { label: 'Principiante', min: 0, max: 80, color: '#6b7280' },
    { label: 'Intermedio', min: 80, max: 130, color: '#3b82f6' },
    { label: 'Avanzato', min: 130, max: 180, color: '#8b5cf6' },
    { label: 'Elite', min: 180, max: 999, color: '#f59e0b' },
  ],
  deadlift: [
    { label: 'Principiante', min: 0, max: 100, color: '#6b7280' },
    { label: 'Intermedio', min: 100, max: 160, color: '#3b82f6' },
    { label: 'Avanzato', min: 160, max: 220, color: '#8b5cf6' },
    { label: 'Elite', min: 220, max: 999, color: '#f59e0b' },
  ],
};

const getLevel = (key: ExKey, oneRM: number) => {
  const levels = LEVELS[key];
  return levels.find(l => oneRM >= l.min && oneRM < l.max) || levels[levels.length - 1];
};

const getLevelProgress = (key: ExKey, oneRM: number): number => {
  const levels = LEVELS[key];
  const idx = levels.findIndex(l => oneRM >= l.min && oneRM < l.max);
  if (idx === -1) return 100;
  const level = levels[idx];
  if (level.max === 999) return 100;
  return Math.min(100, ((oneRM - level.min) / (level.max - level.min)) * 100);
};

const DEFAULTS = {
  bench:    { weight: 60,  reps: 8 },
  squat:    { weight: 80,  reps: 8 },
  deadlift: { weight: 100, reps: 5 },
};

const EXERCISES = [
  { key: 'bench'    as const, name: 'Panca Piana',    emoji: '🏋️', label: 'Panca',  desc: 'Busto superiore', tip: 'Usa la presa larga, schiena arcuata naturale' },
  { key: 'squat'    as const, name: 'Squat',          emoji: '🦵', label: 'Squat',  desc: 'Gambe & Glutei', tip: 'Scendi sotto il parallelo per il massimo risultato' },
  { key: 'deadlift' as const, name: 'Stacco da Terra',emoji: '⚡', label: 'Stacco', desc: 'Schiena & Core', tip: 'Schiena dritta, spingere dal pavimento' },
];

type ExKey = 'bench' | 'squat' | 'deadlift';

interface SlotState {
  active: boolean;
  weightStr: string;
  repsStr: string;
}

const StrengthTestScreen: React.FC<StrengthTestScreenProps> = ({ onNext, themeColor = 'emerald' }) => {
  const [slots, setSlots] = useState<Record<ExKey, SlotState>>({
    bench:    { active: false, weightStr: String(DEFAULTS.bench.weight),    repsStr: String(DEFAULTS.bench.reps) },
    squat:    { active: false, weightStr: String(DEFAULTS.squat.weight),    repsStr: String(DEFAULTS.squat.reps) },
    deadlift: { active: false, weightStr: String(DEFAULTS.deadlift.weight), repsStr: String(DEFAULTS.deadlift.reps) },
  });

  const [expanded, setExpanded] = useState<ExKey | null>(null);

  const ac = themeColor === 'rose';
  const accentBg     = ac ? 'bg-rose-500'       : 'bg-emerald-500';
  const accentHover  = ac ? 'hover:bg-rose-400'  : 'hover:bg-emerald-400';
  const accentText   = ac ? 'text-rose-400'      : 'text-emerald-400';
  const accentHex    = ac ? '#f43f5e' : '#10b981';

  const activeCount = Object.values(slots).filter(s => s.active).length;

  const getWeight = (key: ExKey): number => {
    const v = parseFloat(slots[key].weightStr);
    return isNaN(v) ? DEFAULTS[key].weight : v;
  };
  const getReps = (key: ExKey): number => {
    const v = parseInt(slots[key].repsStr);
    return isNaN(v) ? DEFAULTS[key].reps : v;
  };

  const setWeightStr = (key: ExKey, val: string) =>
    setSlots(prev => ({ ...prev, [key]: { ...prev[key], weightStr: val } }));
  const setRepsStr = (key: ExKey, val: string) =>
    setSlots(prev => ({ ...prev, [key]: { ...prev[key], repsStr: val } }));

  const normalizeWeight = (key: ExKey) => {
    const raw = parseFloat(slots[key].weightStr);
    if (isNaN(raw) || raw <= 0) setWeightStr(key, String(DEFAULTS[key].weight));
    else setWeightStr(key, String(Math.max(2.5, Math.round(raw / 2.5) * 2.5)));
  };
  const normalizeReps = (key: ExKey) => {
    const raw = parseInt(slots[key].repsStr);
    if (isNaN(raw) || raw < 1) setRepsStr(key, String(DEFAULTS[key].reps));
    else setRepsStr(key, String(Math.min(30, Math.max(1, raw))));
  };

  const adjustWeight = (key: ExKey, delta: number) => {
    const cur = parseFloat(slots[key].weightStr) || DEFAULTS[key].weight;
    setWeightStr(key, String(Math.max(2.5, Math.min(500, Math.round((cur + delta) / 2.5) * 2.5))));
  };
  const adjustReps = (key: ExKey, delta: number) => {
    const cur = parseInt(slots[key].repsStr) || DEFAULTS[key].reps;
    setRepsStr(key, String(Math.max(1, Math.min(30, cur + delta))));
  };

  const activateSlot = (key: ExKey) => {
    setSlots(prev => ({ ...prev, [key]: { ...prev[key], active: true } }));
    setExpanded(key);
  };
  const deactivateSlot = (key: ExKey) => {
    setSlots(prev => ({ ...prev, [key]: { active: false, weightStr: String(DEFAULTS[key].weight), repsStr: String(DEFAULTS[key].reps) } }));
    if (expanded === key) setExpanded(null);
  };
  const toggleExpand = (key: ExKey) => {
    if (!slots[key].active) { activateSlot(key); return; }
    setExpanded(prev => prev === key ? null : key);
  };

  const handleContinue = () => {
    const primary = EXERCISES.find(e => slots[e.key].active);
    if (!primary) return;
    const s = slots[primary.key];
    const knownMaxes: Record<ExKey, number | null> = {
      bench:    slots.bench.active    ? brzycki(getWeight('bench'),    getReps('bench'))    : null,
      squat:    slots.squat.active    ? brzycki(getWeight('squat'),    getReps('squat'))    : null,
      deadlift: slots.deadlift.active ? brzycki(getWeight('deadlift'), getReps('deadlift')) : null,
    };
    onNext({ testExercise: primary.name, testWeight: s.weightStr, testReps: s.repsStr, knownMaxes });
  };

  // Calcola total estimated 1RM per progress bar globale
  const totalActive = EXERCISES.filter(e => slots[e.key].active).length;

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans">

      {/* Header migliorato con progress indicator */}
      <div className="px-6 pt-14 pb-6">
        {/* Step progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1,2,3,4].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full transition-all ${n <= 3 ? (ac ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-zinc-800'}`} />
          ))}
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1">Step 3 · Forza</p>
            <h1 className="text-3xl font-black text-white">I tuoi Massimali</h1>
            <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed max-w-xs">
              Almeno un esercizio obbligatorio — il resto lo stimiamo noi con algoritmi biomeccanici.
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${ac ? 'bg-rose-500/15' : 'bg-emerald-500/15'} flex items-center justify-center shrink-0`}>
            <Zap size={22} className={accentText} />
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pb-36 overflow-y-auto space-y-3">

        {EXERCISES.map(({ key, name, emoji, label, desc, tip }) => {
          const s = slots[key];
          const isActive = s.active;
          const isExpanded = expanded === key;
          const weight = getWeight(key);
          const reps = getReps(key);
          const oneRM = isActive ? brzycki(weight, reps) : null;
          const level = oneRM ? getLevel(key, oneRM) : null;
          const progress = oneRM ? getLevelProgress(key, oneRM) : 0;

          return (
            <div key={key} className={`rounded-[1.75rem] border transition-all duration-300 overflow-hidden ${
              isActive ? 'border-zinc-700 bg-zinc-900/80' : 'bg-zinc-950 border-zinc-800/60'
            }`}>
              {/* Card header */}
              <div className="flex items-center gap-3 px-4 py-4 cursor-pointer" onClick={() => toggleExpand(key)}>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  isActive ? (ac ? 'bg-rose-500/15' : 'bg-emerald-500/15') : 'bg-zinc-800'
                }`}>
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-sm ${isActive ? 'text-white' : 'text-zinc-500'}`}>{label}</p>
                  <p className="text-[10px] text-zinc-600">{desc}</p>
                </div>

                {isActive && oneRM ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-black text-xl ${accentText}`}>{oneRM}<span className="text-xs text-zinc-600 ml-0.5">kg</span></p>
                      {level && (
                        <span className="text-[9px] font-bold" style={{ color: level.color }}>{level.label}</span>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deactivateSlot(key); }}
                      className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-all text-sm"
                    >×</button>
                  </div>
                ) : isActive ? (
                  <div className="flex items-center gap-3">
                    <div className={`text-right`}>
                      <p className="text-zinc-400 font-black text-xl">—</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deactivateSlot(key); }}
                      className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-all text-sm"
                    >×</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 border border-zinc-800 rounded-xl px-3 py-1.5 hover:border-zinc-600 transition-colors">
                    <Plus size={12} /> Aggiungi
                  </div>
                )}
              </div>

              {/* Level progress bar (quando attivo e collassato) */}
              {isActive && !isExpanded && oneRM && level && (
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Livello</span>
                    <span className="text-[9px] font-bold" style={{ color: level.color }}>{level.label}</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: level.color }}
                    />
                  </div>
                </div>
              )}

              {/* Pannello espanso */}
              {isActive && isExpanded && (
                <div className="px-4 pb-5 pt-1 space-y-4">
                  <div className="h-px bg-zinc-800/70" />

                  {/* Tip */}
                  <div className="flex gap-2 bg-zinc-800/50 rounded-xl p-3">
                    <Target size={13} className="text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-zinc-500">{tip}</p>
                  </div>

                  {/* Carico */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Carico sollevato</p>
                    <div className="bg-black/60 rounded-2xl flex items-center overflow-hidden border border-zinc-800">
                      <button onClick={() => adjustWeight(key, -2.5)} className="w-14 h-14 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800/80 transition-colors active:scale-95">
                        <ChevronDown size={20} />
                      </button>
                      <div className="flex-1 flex items-baseline justify-center gap-1">
                        <input
                          type="number"
                          value={s.weightStr}
                          onChange={e => setWeightStr(key, e.target.value)}
                          onBlur={() => normalizeWeight(key)}
                          className="bg-transparent text-3xl font-black text-white text-center w-20 focus:outline-none"
                          inputMode="decimal"
                        />
                        <span className="text-zinc-600 text-xs font-bold">kg</span>
                      </div>
                      <button onClick={() => adjustWeight(key, 2.5)} className={`w-14 h-14 flex items-center justify-center text-white ${accentBg} ${accentHover} transition-colors active:scale-95`}>
                        <ChevronUp size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Reps */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Ripetizioni consecutive</p>
                    <div className="bg-black/60 rounded-2xl flex items-center overflow-hidden border border-zinc-800">
                      <button onClick={() => adjustReps(key, -1)} className="w-14 h-14 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800/80 transition-colors active:scale-95">
                        <ChevronDown size={20} />
                      </button>
                      <div className="flex-1 flex items-baseline justify-center gap-1">
                        <input
                          type="number"
                          value={s.repsStr}
                          onChange={e => setRepsStr(key, e.target.value)}
                          onBlur={() => normalizeReps(key)}
                          className="bg-transparent text-3xl font-black text-white text-center w-16 focus:outline-none"
                          inputMode="numeric"
                        />
                        <span className="text-zinc-600 text-xs font-bold">reps</span>
                      </div>
                      <button onClick={() => adjustReps(key, 1)} className={`w-14 h-14 flex items-center justify-center text-white ${accentBg} ${accentHover} transition-colors active:scale-95`}>
                        <ChevronUp size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Risultato 1RM + livello */}
                  {oneRM && level && (
                    <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Massimale Stimato</p>
                          <p className={`text-3xl font-black mt-0.5 ${accentText}`}>
                            {oneRM} <span className="text-sm text-zinc-500">kg</span>
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">Brzycki · {weight}kg × {reps} reps</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-600 mb-1">Livello</p>
                          <span className="text-sm font-black" style={{ color: level.color }}>{level.label}</span>
                        </div>
                      </div>
                      {/* Progress verso prossimo livello */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[9px] text-zinc-600">Progresso livello</span>
                          <span className="text-[9px] font-bold" style={{ color: level.color }}>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-700/60 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: level.color }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Riepilogo massimali */}
        {activeCount > 0 && (
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800/60 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-zinc-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Riepilogo calcolato</p>
            </div>
            {EXERCISES.map(({ key, label, emoji }) => {
              const s = slots[key];
              const val = s.active ? brzycki(getWeight(key), getReps(key)) : null;
              const isEstimated = !s.active;

              let estimated = 0;
              if (isEstimated) {
                const b  = slots.bench.active    ? brzycki(getWeight('bench'),    getReps('bench'))    : null;
                const sq = slots.squat.active    ? brzycki(getWeight('squat'),    getReps('squat'))    : null;
                const dl = slots.deadlift.active ? brzycki(getWeight('deadlift'), getReps('deadlift')) : null;
                if (key === 'bench')    estimated = sq ? Math.round(sq / 1.35 / 2.5) * 2.5 : dl ? Math.round(dl / 1.60 / 2.5) * 2.5 : 0;
                if (key === 'squat')   estimated = b  ? Math.round(b  * 1.35 / 2.5) * 2.5 : dl ? Math.round(dl / 1.60 * 1.35 / 2.5) * 2.5 : 0;
                if (key === 'deadlift')estimated = b  ? Math.round(b  * 1.60 / 2.5) * 2.5 : sq ? Math.round(sq / 1.35 * 1.60 / 2.5) * 2.5 : 0;
              }
              const displayVal = val || estimated;
              const lvl = displayVal > 0 ? getLevel(key, displayVal) : null;

              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm text-zinc-400 font-medium">{label}</span>
                    {isEstimated && displayVal > 0 && (
                      <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md font-bold">STIMA</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {lvl && <span className="text-[10px] font-bold" style={{ color: lvl.color }}>{lvl.label}</span>}
                    <span className={`font-black text-base ${s.active ? accentText : 'text-zinc-600'}`}>
                      {displayVal > 0 ? `${displayVal}` : '—'}<span className="text-xs text-zinc-600 ml-0.5">{displayVal > 0 ? 'kg' : ''}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/60 flex gap-3 items-start">
          <Info size={15} className="text-zinc-600 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-600 leading-relaxed">
            I livelli sono basati su standard internazionali per adulti. Puoi sempre aggiornare i tuoi massimali dal profilo.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-6 bg-gradient-to-t from-[#080808] via-[#080808]/95 to-transparent z-10">
        {activeCount > 0 && (
          <p className="text-center text-xs text-zinc-600 mb-3">
            {activeCount === 3 ? '🎯 Tutti i massimali inseriti!' : `${3 - activeCount} massimale${3 - activeCount !== 1 ? 'i' : ''} stimato${3 - activeCount !== 1 ? 'i' : ''} automaticamente`}
          </p>
        )}
        <button
          onClick={handleContinue}
          disabled={activeCount === 0}
          className={`w-full ${accentBg} ${accentHover} disabled:opacity-20 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.97]`}
        >
          {activeCount === 0
            ? 'Aggiungi almeno un massimale'
            : `GENERA PIANO`
          }
          {activeCount > 0 && <ArrowRight size={20} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
};

export default StrengthTestScreen;
