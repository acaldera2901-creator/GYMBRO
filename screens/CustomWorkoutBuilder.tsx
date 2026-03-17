import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, Plus, Trash2, Check, Dumbbell, X,
  Zap, ChevronDown, Edit3
} from 'lucide-react';
import { WorkoutCard, CategoryType } from '../types';

interface CustomWorkoutBuilderProps {
  onBack: () => void;
  onSave: (workout: WorkoutCard) => void | Promise<void>;
  isDarkMode: boolean;
  themeColor: string;
  initialWorkout?: WorkoutCard | null;
}

const CATEGORY_OPTIONS: { value: CategoryType; label: string; emoji: string; color: string }[] = [
  { value: 'Massa',        label: 'Massa',          emoji: '💪', color: '#6366f1' },
  { value: 'Definizione',  label: 'Definizione',    emoji: '⚡', color: '#f59e0b' },
  { value: 'Perdita Peso', label: 'Perdita Peso',   emoji: '🔥', color: '#ef4444' },
  { value: 'Resistenza',   label: 'Resistenza',     emoji: '🏃', color: '#06b6d4' },
  { value: 'Custom',       label: 'Personalizzato', emoji: '✨', color: '#a855f7' },
];

const EXERCISE_SUGGESTIONS = [
  'Panca Piana', 'Squat', 'Stacco da Terra', 'Military Press',
  'Trazioni', 'Rematore', 'Curl Bilanciere', 'French Press',
  'Leg Press', 'Affondi', 'Shoulder Press', 'Lat Machine',
  'Croci Cavi', 'Hip Thrust', 'Leg Curl', 'Calf Raise',
  'Push Up', 'Dip', 'Curl Manubri', 'Tricep Overhead',
];

interface ExerciseEntry {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

// Parsa "3 x 10 (Rec. 60")" → { sets: "3", reps: "10", rest: "60" }
const parseRepsString = (repsStr: string): { sets: string; reps: string; rest: string } => {
  const setsMatch = repsStr.match(/^(\d+)\s*[x×X]/i);
  const repsMatch = repsStr.match(/[x×X]\s*(\d+[-–]?\d*)/i);
  const restMatch = repsStr.match(/Rec\.?\s*(\d+)/i);
  return {
    sets: setsMatch?.[1] || '3',
    reps: repsMatch?.[1]?.replace(/[-–]\d+$/, '') || '10',
    rest: restMatch?.[1] || '60',
  };
};

const CustomWorkoutBuilder: React.FC<CustomWorkoutBuilderProps> = ({
  onBack, onSave, isDarkMode, themeColor, initialWorkout
}) => {
  const isEditing = !!initialWorkout;
  const isRose = themeColor === 'rose';
  const bgClass = isDarkMode ? 'bg-black' : 'bg-[#f0f0f5]';
  const textClass = isDarkMode ? 'text-white' : 'text-slate-900';
  const cardClass = isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const inputClass = isDarkMode
    ? 'bg-zinc-900 text-white border-zinc-800 focus:border-zinc-600 placeholder-zinc-700'
    : 'bg-white text-slate-900 border-slate-200 focus:border-slate-400 placeholder-slate-400';
  const accentHex = isRose ? '#f43f5e' : '#10b981';
  const accentBg  = isRose ? 'bg-rose-500' : 'bg-emerald-500';

  const [step, setStep] = useState<'info' | 'exercises' | 'review'>('info');
  const [title,    setTitle]    = useState('');
  const [focus,    setFocus]    = useState('');
  const [category, setCategory] = useState<CategoryType>('Custom');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { id: `ex_${Date.now()}`, name: '', sets: '3', reps: '10', rest: '60' }
  ]);
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved,  setSaved]  = useState(false);

  // Pre-fill form when editing an existing workout
  useEffect(() => {
    if (initialWorkout) {
      setTitle(initialWorkout.title || '');
      setFocus(initialWorkout.focus?.split(' •')[0] || '');
      setCategory(initialWorkout.category || 'Custom');
      if (initialWorkout.exercises?.length > 0) {
        setExercises(initialWorkout.exercises.map((ex, i) => {
          const parsed = parseRepsString(ex.reps || '');
          return {
            id: `ex_edit_${i}_${Date.now()}`,
            name: ex.name || '',
            sets: parsed.sets,
            reps: parsed.reps,
            rest: parsed.rest,
          };
        }));
      }
    }
  }, [initialWorkout]);

  const addExercise = () => {
    if (exercises.length >= 12) return;
    setExercises(prev => [...prev, {
      id: `ex_${Date.now()}_${Math.random()}`,
      name: '', sets: '3', reps: '10', rest: '60'
    }]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length <= 1) return;
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const updateExercise = (id: string, field: keyof ExerciseEntry, value: string) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const validateAndProceed = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Inserisci un nome per la scheda');
    if (step === 'exercises') {
      const empty = exercises.filter(e => !e.name.trim());
      if (empty.length > 0) errs.push('Tutti gli esercizi devono avere un nome');
      if (exercises.filter(e => e.name.trim()).length === 0) errs.push('Aggiungi almeno un esercizio');
    }
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    if (step === 'info') setStep('exercises');
    else if (step === 'exercises') setStep('review');
  };

  const handleSave = () => {
    const workout: WorkoutCard = {
      // Se stiamo editando, preserva l'ID originale (upsert invece di insert)
      id: initialWorkout?.id || `custom_${Date.now()}`,
      category,
      title: title.trim(),
      focus: focus.trim() || 'Scheda personalizzata',
      exercises: exercises
        .filter(e => e.name.trim())
        .map(e => ({
          name: e.name.trim(),
          reps: `${e.sets} x ${e.reps} (Rec. ${e.rest}")`,
        })),
      isCustom: true,
      affinityScore: 100,
    };
    setSaved(true);
    setTimeout(() => { onSave(workout); }, 500);
  };

  const selectedCat = CATEGORY_OPTIONS.find(c => c.value === category) || CATEGORY_OPTIONS[4];

  // ── Step Indicator ────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['info', 'exercises', 'review'] as const).map((s, i) => {
        const steps = ['info', 'exercises', 'review'];
        const active = step === s;
        const done   = steps.indexOf(step) > i;
        return (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all ${
              done  ? `${accentBg} text-black` :
              active ? (isDarkMode ? 'bg-zinc-100 text-black scale-110' : 'bg-slate-800 text-white scale-110')
                     : (isDarkMode ? 'bg-zinc-800 text-zinc-600' : 'bg-slate-200 text-slate-500')
            }`}>
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </div>
            {i < 2 && (
              <div className="h-px w-8 transition-all rounded-full"
                style={{ backgroundColor: done ? accentHex : (isDarkMode ? '#27272a' : '#e2e8f0') }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ── Step 1: Info ──────────────────────────────────────────────────────────
  const renderInfo = () => (
    <div className="space-y-5">
      <div>
        <label className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Nome Scheda *</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="es. Push Day, Gambe Esplosive..."
          className={`w-full rounded-2xl py-4 px-4 border outline-none transition-all font-medium ${inputClass}`}
        />
      </div>
      <div>
        <label className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Focus / Descrizione</label>
        <input
          value={focus}
          onChange={e => setFocus(e.target.value)}
          placeholder="es. Ipertrofia e forza massima"
          className={`w-full rounded-2xl py-4 px-4 border outline-none transition-all font-medium ${inputClass}`}
        />
      </div>
      <div>
        <label className={`text-[10px] font-bold uppercase tracking-widest block mb-3 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Categoria</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_OPTIONS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                category === cat.value
                  ? (isDarkMode ? 'border-zinc-500 bg-zinc-800' : 'border-slate-400 bg-slate-100')
                  : (isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-white')
              }`}
            >
              <span className="text-xl">{cat.emoji}</span>
              <div>
                <p className={`text-xs font-bold ${textClass}`}>{cat.label}</p>
                {category === cat.value && <p className="text-[9px] mt-0.5" style={{ color: cat.color }}>Selezionato</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 2: Esercizi ──────────────────────────────────────────────────────
  const renderExercises = () => (
    <div className="space-y-3">
      <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
        Aggiungi gli esercizi della tua scheda (max 12).
      </p>
      {exercises.map((ex, idx) => (
        <div key={ex.id} className={`rounded-2xl border overflow-hidden ${cardClass}`}>
          <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-100'}`}>
              <span className={`text-[10px] font-black ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{idx + 1}</span>
            </div>
            <div className="flex-1 relative">
              <input
                value={ex.name}
                onChange={e => { updateExercise(ex.id, 'name', e.target.value); setShowSuggestions(ex.id); }}
                onFocus={() => setShowSuggestions(ex.id)}
                onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                placeholder="Nome esercizio..."
                className={`w-full bg-transparent text-sm font-medium outline-none ${textClass} placeholder-zinc-600`}
              />
              {showSuggestions === ex.id && ex.name.length > 0 && (() => {
                const matches = EXERCISE_SUGGESTIONS.filter(s =>
                  s.toLowerCase().includes(ex.name.toLowerCase()) && s.toLowerCase() !== ex.name.toLowerCase()
                ).slice(0, 5);
                return matches.length > 0 ? (
                  <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-2xl z-20 max-h-36 overflow-y-auto ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}>
                    {matches.map(s => (
                      <button key={s} onMouseDown={() => updateExercise(ex.id, 'name', s)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${isDarkMode ? 'text-zinc-300 hover:bg-zinc-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
            <button onClick={() => removeExercise(ex.id)} disabled={exercises.length <= 1}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20 shrink-0 ${isDarkMode ? 'bg-zinc-800 text-zinc-600 hover:text-red-400 hover:bg-red-500/10' : 'bg-slate-100 text-slate-400 hover:text-red-400 hover:bg-red-50'}`}>
              <X size={13} />
            </button>
          </div>
          <div className={`grid grid-cols-3 divide-x ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
            {[
              { label: 'Serie',        field: 'sets' as const },
              { label: 'Ripetizioni',  field: 'reps' as const },
              { label: 'Recupero (s)', field: 'rest' as const },
            ].map(({ label, field }) => (
              <div key={field} className="flex flex-col items-center py-3 px-2">
                <p className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>{label}</p>
                <input
                  type="number"
                  value={ex[field]}
                  onChange={e => updateExercise(ex.id, field, e.target.value)}
                  className={`bg-transparent text-lg font-black text-center w-12 outline-none ${textClass}`}
                  inputMode="numeric"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {exercises.length < 12 && (
        <button onClick={addExercise}
          className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-[0.98] ${
            isDarkMode ? 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400' : 'border-slate-200 text-slate-400 hover:border-slate-400'
          }`}>
          <Plus size={16} /> Aggiungi Esercizio
        </button>
      )}
    </div>
  );

  // ── Step 3: Review ────────────────────────────────────────────────────────
  const renderReview = () => (
    <div className="space-y-4">
      {isEditing && (
        <div className={`rounded-xl p-3 border flex items-center gap-2 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <Edit3 size={14} className="text-amber-400 shrink-0" />
          <p className="text-amber-400 text-xs font-medium">Stai modificando una scheda esistente</p>
        </div>
      )}
      <div className="rounded-3xl p-5 border overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${selectedCat.color}15, ${isDarkMode ? '#111' : '#f8f8f8'})`, borderColor: `${selectedCat.color}30` }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
          style={{ backgroundColor: selectedCat.color }} />
        <div className="flex items-start gap-3 relative z-10">
          <span className="text-3xl">{selectedCat.emoji}</span>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{selectedCat.label}</p>
            <h2 className={`text-xl font-black ${textClass}`}>{title}</h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>{focus || 'Scheda personalizzata'}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 relative z-10">
          <div className={`rounded-xl px-3 py-1.5 flex items-center gap-1.5 ${isDarkMode ? 'bg-black/30' : 'bg-white/60'}`}>
            <Dumbbell size={12} style={{ color: selectedCat.color }} />
            <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{exercises.filter(e => e.name.trim()).length} Esercizi</span>
          </div>
          <div className={`rounded-xl px-3 py-1.5 flex items-center gap-1.5 ${isDarkMode ? 'bg-black/30' : 'bg-white/60'}`}>
            <Zap size={12} style={{ color: selectedCat.color }} />
            <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
              {exercises.filter(e => e.name.trim()).reduce((acc, e) => acc + parseInt(e.sets || '0'), 0)} Serie Tot.
            </span>
          </div>
        </div>
      </div>
      <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
        {exercises.filter(e => e.name.trim()).map((ex, i, arr) => (
          <div key={ex.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? (isDarkMode ? 'border-b border-zinc-800/60' : 'border-b border-slate-100') : ''}`}>
            <span className={`font-bold text-sm w-5 ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>{i + 1}</span>
            <div className="flex-1">
              <p className={`font-bold text-sm ${textClass}`}>{ex.name}</p>
              <p className={`text-xs mt-0.5 font-mono ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>{ex.sets}×{ex.reps} · Rec {ex.rest}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <div className={`px-5 pt-14 pb-4 flex items-center gap-3 border-b shrink-0 ${isDarkMode ? 'border-zinc-800/60' : 'border-slate-200'}`}>
        <button onClick={onBack} className={`w-9 h-9 rounded-full border flex items-center justify-center active:scale-90 transition-transform ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <ChevronLeft size={18} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
        </button>
        <div className="flex-1">
          <h1 className={`text-lg font-black ${textClass}`}>{isEditing ? 'Modifica Scheda' : 'Crea Scheda'}</h1>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
            {step === 'info' ? 'Dettagli generali' : step === 'exercises' ? `${exercises.filter(e => e.name.trim()).length} esercizi aggiunti` : 'Anteprima finale'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <StepIndicator />
        {errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
            {errors.map((e, i) => <p key={i} className="text-red-400 text-xs font-medium">{e}</p>)}
          </div>
        )}
        {step === 'info'      && renderInfo()}
        {step === 'exercises' && renderExercises()}
        {step === 'review'    && renderReview()}
      </div>

      {/* CTA */}
      <div className={`px-5 py-5 border-t shrink-0 ${isDarkMode ? 'border-zinc-800/50 bg-black' : 'border-slate-200 bg-white'}`}>
        <div className="flex gap-3">
          {step !== 'info' && (
            <button
              onClick={() => setStep(step === 'exercises' ? 'info' : 'exercises')}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center active:scale-95 transition-transform ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
              <ChevronLeft size={20} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
            </button>
          )}
          <button
            onClick={step === 'review' ? handleSave : validateAndProceed}
            disabled={saved}
            className={`flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              saved
                ? (isDarkMode ? 'bg-zinc-800 text-zinc-600' : 'bg-slate-100 text-slate-400')
                : `${accentBg} text-black shadow-lg`
            }`}>
            {saved ? (
              <><Check size={16} strokeWidth={3} /> {isEditing ? 'Aggiornata!' : 'Salvata!'}</>
            ) : step === 'review' ? (
              <><Check size={16} strokeWidth={3} /> {isEditing ? 'Aggiorna Scheda' : 'Salva Scheda'}</>
            ) : (
              <>Avanti <ChevronDown size={16} className="-rotate-90" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomWorkoutBuilder;
