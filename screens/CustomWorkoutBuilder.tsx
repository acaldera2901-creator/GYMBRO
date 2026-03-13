import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, Plus, Check, Dumbbell, X,
  Zap, ChevronDown, Edit3
} from 'lucide-react';
import { WorkoutCard, CategoryType } from '../types';

interface CustomWorkoutBuilderProps {
  onBack: () => void;
  onSave: (workout: WorkoutCard) => void;
  isDarkMode: boolean;
  themeColor: string;
  initialWorkout?: WorkoutCard | null; // null = nuova, WorkoutCard = modifica
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
  'Panca Inclinata', 'Dip', 'Facepull', 'Shrug',
];

interface ExerciseEntry {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

// Converte Exercise (WorkoutCard format) → ExerciseEntry (builder format)
const parseExerciseFromCard = (ex: { name: string; reps?: string }, idx: number): ExerciseEntry => {
  const repsStr = ex.reps ?? '3 x 10 (Rec. 60")';
  const setsMatch = repsStr.match(/^(\d+)\s*[x×X]/i);
  const repsMatch = repsStr.match(/[x×X]\s*(\d+)/i);
  const restMatch = repsStr.match(/Rec[.\s]+(\d+)/i);
  return {
    id: `ex_${Date.now()}_${idx}`,
    name: ex.name,
    sets: setsMatch?.[1] ?? '3',
    reps: repsMatch?.[1] ?? '10',
    rest: restMatch?.[1] ?? '60',
  };
};

const CustomWorkoutBuilder: React.FC<CustomWorkoutBuilderProps> = ({
  onBack, onSave, isDarkMode, themeColor, initialWorkout
}) => {
  const isEdit = Boolean(initialWorkout);
  const isRose = themeColor === 'rose';
  const accentHex = isRose ? '#f43f5e' : '#10b981';
  const accentBg  = isRose ? 'bg-rose-500' : 'bg-emerald-500';
  const accentText = isRose ? 'text-rose-400' : 'text-emerald-400';

  const [step, setStep] = useState<'info' | 'exercises' | 'review'>('info');
  const [title, setTitle]     = useState('');
  const [focus, setFocus]     = useState('');
  const [category, setCategory] = useState<CategoryType>('Custom');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { id: `ex_${Date.now()}`, name: '', sets: '3', reps: '10', rest: '60' }
  ]);
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);
  const [errors, setErrors]   = useState<string[]>([]);
  const [saved, setSaved]     = useState(false);

  // Precompila se siamo in edit mode
  useEffect(() => {
    if (initialWorkout) {
      setTitle(initialWorkout.title);
      setFocus(initialWorkout.focus ?? '');
      setCategory(initialWorkout.category);
      setExercises(
        initialWorkout.exercises.length > 0
          ? initialWorkout.exercises.map((ex, i) => parseExerciseFromCard(ex, i))
          : [{ id: `ex_${Date.now()}`, name: '', sets: '3', reps: '10', rest: '60' }]
      );
    }
  }, [initialWorkout]);

  const addExercise = () => {
    setExercises(prev => [...prev, { id: `ex_${Date.now()}_${Math.random()}`, name: '', sets: '3', reps: '10', rest: '60' }]);
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
      if (exercises.filter(e => e.name.trim()).length === 0) errs.push('Aggiungi almeno un esercizio');
      if (exercises.some(e => !e.name.trim())) errs.push('Tutti gli esercizi devono avere un nome');
    }
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    if (step === 'info') setStep('exercises');
    else if (step === 'exercises') setStep('review');
  };

  const handleSave = () => {
    const workout: WorkoutCard = {
      // In edit mode mantieni lo stesso ID, altrimenti genera nuovo
      id: isEdit && initialWorkout ? initialWorkout.id : `custom_${Date.now()}`,
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
      // Mantieni immagine se era già presente
      image: initialWorkout?.image,
    };
    setSaved(true);
    setTimeout(() => onSave(workout), 500);
  };

  const selectedCat = CATEGORY_OPTIONS.find(c => c.value === category) ?? CATEGORY_OPTIONS[4];

  // ── Step Indicator ────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['info', 'exercises', 'review'] as const).map((s, i) => {
        const active = step === s;
        const done = ['info', 'exercises', 'review'].indexOf(step) > i;
        return (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all ${
              done ? `${accentBg} text-black` :
              active ? 'bg-zinc-100 text-black scale-110' : 'bg-zinc-800 text-zinc-600'
            }`}>
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </div>
            {i < 2 && <div className="h-px w-8 transition-all" style={{ backgroundColor: done ? accentHex : '#27272a' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ── Step 1: Info ───────────────────────────────────────────────────────────
  const renderInfo = () => (
    <div className="space-y-5">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Nome Scheda *</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="es. Push Day, Gambe Esplosive..."
          className="w-full bg-zinc-900 text-white rounded-2xl py-4 px-4 border border-zinc-800 focus:border-zinc-600 outline-none transition-all font-medium placeholder-zinc-700"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Focus / Descrizione</label>
        <input
          value={focus}
          onChange={e => setFocus(e.target.value)}
          placeholder="es. Ipertrofia e forza massima"
          className="w-full bg-zinc-900 text-white rounded-2xl py-4 px-4 border border-zinc-800 focus:border-zinc-600 outline-none transition-all font-medium placeholder-zinc-700"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-3">Categoria</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_OPTIONS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                category === cat.value ? 'border-zinc-500 bg-zinc-800' : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              <span className="text-xl">{cat.emoji}</span>
              <div>
                <p className="text-white text-xs font-bold">{cat.label}</p>
                {category === cat.value && <p className="text-[9px] mt-0.5" style={{ color: cat.color }}>Selezionato</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 2: Esercizi ───────────────────────────────────────────────────────
  const renderExercises = () => (
    <div className="space-y-3">
      <p className="text-zinc-500 text-xs mb-4">Aggiungi gli esercizi della tua scheda. Puoi ordinarne fino a 12.</p>
      {exercises.map((ex, idx) => (
        <div key={ex.id} className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60">
            <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-zinc-500">{idx + 1}</span>
            </div>
            <div className="flex-1 relative">
              <input
                value={ex.name}
                onChange={e => { updateExercise(ex.id, 'name', e.target.value); setShowSuggestions(ex.id); }}
                onFocus={() => setShowSuggestions(ex.id)}
                onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                placeholder="Nome esercizio..."
                className="w-full bg-transparent text-white text-sm font-medium placeholder-zinc-700 outline-none"
              />
              {showSuggestions === ex.id && ex.name.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 rounded-xl border border-zinc-700 shadow-2xl z-20 max-h-36 overflow-y-auto">
                  {EXERCISE_SUGGESTIONS
                    .filter(s => s.toLowerCase().includes(ex.name.toLowerCase()) && s !== ex.name)
                    .slice(0, 5)
                    .map(s => (
                      <button key={s} onMouseDown={() => updateExercise(ex.id, 'name', s)}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors first:rounded-t-xl last:rounded-b-xl">
                        {s}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <button onClick={() => removeExercise(ex.id)} disabled={exercises.length <= 1}
              className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-20 shrink-0">
              <X size={13} />
            </button>
          </div>
          <div className="grid grid-cols-3 divide-x divide-zinc-800/60">
            {[
              { label: 'Serie', field: 'sets' as const, suffix: '' },
              { label: 'Ripetizioni', field: 'reps' as const, suffix: '' },
              { label: 'Recupero (s)', field: 'rest' as const, suffix: '"' },
            ].map(({ label, field, suffix }) => (
              <div key={field} className="flex flex-col items-center py-3 px-2">
                <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 mb-1">{label}</p>
                <div className="flex items-baseline gap-0.5">
                  <input
                    type="number" value={ex[field]}
                    onChange={e => updateExercise(ex.id, field, e.target.value)}
                    className="bg-transparent text-white text-lg font-black text-center w-10 outline-none"
                    inputMode="numeric"
                  />
                  {suffix && <span className="text-zinc-600 text-xs">{suffix}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {exercises.length < 12 && (
        <button onClick={addExercise}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-600 flex items-center justify-center gap-2 hover:border-zinc-600 hover:text-zinc-400 transition-all active:scale-[0.98] font-bold text-sm">
          <Plus size={16} /> Aggiungi Esercizio
        </button>
      )}
    </div>
  );

  // ── Step 3: Review ─────────────────────────────────────────────────────────
  const renderReview = () => (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 border border-zinc-800 overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${selectedCat.color}15, #111)` }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10" style={{ backgroundColor: selectedCat.color }} />
        <div className="flex items-start gap-3 relative z-10">
          <span className="text-3xl">{selectedCat.emoji}</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">{selectedCat.label}</p>
            <h2 className="text-xl font-black text-white">{title}</h2>
            <p className="text-zinc-500 text-sm mt-0.5">{focus || 'Scheda personalizzata'}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 relative z-10">
          <div className="bg-black/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <Dumbbell size={12} style={{ color: selectedCat.color }} />
            <span className="text-xs font-bold text-zinc-300">{exercises.filter(e => e.name.trim()).length} Esercizi</span>
          </div>
          <div className="bg-black/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <Zap size={12} style={{ color: selectedCat.color }} />
            <span className="text-xs font-bold text-zinc-300">
              {exercises.filter(e => e.name.trim()).reduce((acc, e) => acc + parseInt(e.sets || '0'), 0)} Serie Totali
            </span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden">
        {exercises.filter(e => e.name.trim()).map((ex, i, arr) => (
          <div key={ex.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
            <span className="text-zinc-600 font-bold text-sm w-5">{i + 1}</span>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{ex.name}</p>
              <p className="text-zinc-600 text-xs mt-0.5 font-mono">{ex.sets}×{ex.reps} · Rec {ex.rest}"</p>
            </div>
          </div>
        ))}
      </div>

      {isEdit && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
          <p className="text-amber-400 text-xs font-medium text-center">
            ✏️ Stai modificando una scheda esistente. Le modifiche verranno salvate subito.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3 border-b border-zinc-800/60 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft size={18} className="text-zinc-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black">{isEdit ? 'Modifica Scheda' : 'Crea Scheda'}</h1>
            {isEdit && <Edit3 size={14} className="text-amber-400" />}
          </div>
          <p className="text-xs text-zinc-600">
            {step === 'info' ? 'Dettagli generali' : step === 'exercises' ? `${exercises.filter(e => e.name.trim()).length} esercizi` : 'Anteprima finale'}
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

      {/* Bottom action */}
      <div className="px-5 py-5 border-t border-zinc-800/50 shrink-0 bg-[#080808]">
        <div className="flex gap-3">
          {step !== 'info' && (
            <button
              onClick={() => setStep(step === 'exercises' ? 'info' : 'exercises')}
              className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-95 transition-transform">
              <ChevronLeft size={20} className="text-zinc-400" />
            </button>
          )}
          <button
            onClick={step === 'review' ? handleSave : validateAndProceed}
            disabled={saved}
            className={`flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              saved ? 'bg-zinc-800 text-zinc-600' : `${accentBg} text-black`
            }`}>
            {saved ? (
              <><Check size={16} strokeWidth={3} /> {isEdit ? 'Aggiornata!' : 'Salvata!'}</>
            ) : step === 'review' ? (
              <><Check size={16} strokeWidth={3} /> {isEdit ? 'Aggiorna Scheda' : 'Salva Scheda'}</>
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
