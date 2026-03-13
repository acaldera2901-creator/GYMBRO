import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Plus, X, Check, Dumbbell, Zap, Edit3 } from 'lucide-react';
import { WorkoutCard, CategoryType } from '../types';

interface CustomWorkoutBuilderProps {
  onBack: () => void;
  onSave: (workout: WorkoutCard) => void;
  isDarkMode: boolean;
  themeColor: string;
  initialWorkout?: WorkoutCard | null;
}

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D', bg4: '#1E1E27',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  lime: '#C8FF00', coral: '#FF5D3B', amber: '#FFB347', sky: '#38BDF8', violet: '#A78BFA',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif", mono: "'DM Mono', monospace",
};

const CATEGORIES: { value: CategoryType; label: string; emoji: string; color: string }[] = [
  { value: 'Massa',        label: 'Massa',          emoji: '💪', color: '#C8FF00' },
  { value: 'Definizione',  label: 'Definizione',    emoji: '⚡', color: '#A78BFA' },
  { value: 'Perdita Peso', label: 'Perdita Peso',   emoji: '🔥', color: '#FF5D3B' },
  { value: 'Resistenza',   label: 'Resistenza',     emoji: '🏃', color: '#38BDF8' },
  { value: 'Custom',       label: 'Personalizzato', emoji: '✨', color: '#A855F7' },
];

const SUGGESTIONS = [
  'Panca Piana','Squat','Stacco da Terra','Military Press','Trazioni','Rematore',
  'Curl Bilanciere','French Press','Leg Press','Affondi','Shoulder Press',
  'Lat Machine','Croci Cavi','Hip Thrust','Leg Curl','Calf Raise',
  'Panca Inclinata','Dip','Facepull','Shrug',
];

interface ExEntry { id: string; name: string; sets: string; reps: string; rest: string; }

type Step = 'info' | 'exercises' | 'review';

const CustomWorkoutBuilder: React.FC<CustomWorkoutBuilderProps> = ({
  onBack, onSave, isDarkMode, themeColor, initialWorkout,
}) => {
  const isRose = themeColor === 'rose';
  const accent = isRose ? T.coral : T.lime;
  const isEdit = Boolean(initialWorkout);

  const [step, setStep] = useState<Step>('info');
  const [title, setTitle] = useState('');
  const [focus, setFocus] = useState('');
  const [category, setCategory] = useState<CategoryType>('Custom');
  const [exercises, setExercises] = useState<ExEntry[]>([{ id: `ex_${Date.now()}`, name: '', sets: '3', reps: '10', rest: '60' }]);
  const [showSug, setShowSug] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialWorkout) {
      setTitle(initialWorkout.title);
      setFocus(initialWorkout.focus ?? '');
      setCategory(initialWorkout.category);
      if (initialWorkout.exercises.length > 0) {
        setExercises(initialWorkout.exercises.map((ex, i) => {
          const r = ex.reps ?? '3 x 10';
          const sm = r.match(/^(\d+)\s*[x×X]/i);
          const rm = r.match(/[x×X]\s*(\d+)/i);
          const rem = r.match(/Rec[.\s]+(\d+)/i);
          return { id: `ex_${Date.now()}_${i}`, name: ex.name, sets: sm?.[1] ?? '3', reps: rm?.[1] ?? '10', rest: rem?.[1] ?? '60' };
        }));
      }
    }
  }, [initialWorkout]);

  const addEx = () => {
    if (exercises.length >= 12) return;
    setExercises(p => [...p, { id: `ex_${Date.now()}`, name: '', sets: '3', reps: '10', rest: '60' }]);
  };
  const removeEx = (id: string) => {
    if (exercises.length <= 1) return;
    setExercises(p => p.filter(e => e.id !== id));
  };
  const updateEx = (id: string, field: keyof ExEntry, val: string) =>
    setExercises(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Inserisci un nome per la scheda.');
    if (step === 'exercises') {
      if (!exercises.some(e => e.name.trim())) errs.push('Aggiungi almeno un esercizio.');
      if (exercises.some(e => !e.name.trim())) errs.push('Tutti gli esercizi devono avere un nome.');
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step === 'info') setStep('exercises');
    else if (step === 'exercises') setStep('review');
  };

  const handleSave = () => {
    const workout: WorkoutCard = {
      id: isEdit && initialWorkout ? initialWorkout.id : `custom_${Date.now()}`,
      category, title: title.trim(),
      focus: focus.trim() || 'Scheda personalizzata',
      exercises: exercises.filter(e => e.name.trim()).map(e => ({
        name: e.name.trim(), reps: `${e.sets} x ${e.reps} (Rec. ${e.rest}")`,
      })),
      isCustom: true, affinityScore: 100, image: initialWorkout?.image,
    };
    setSaved(true);
    setTimeout(() => onSave(workout), 400);
  };

  const selCat = CATEGORIES.find(c => c.value === category) ?? CATEGORIES[4];
  const STEPS: Step[] = ['info', 'exercises', 'review'];
  const stepIdx = STEPS.indexOf(step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const card: React.CSSProperties = { background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22 };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ padding: '52px 20px 0', borderBottom: `1px solid ${T.border}`, paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 14, background: T.bg2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: T.display, fontSize: 24, color: T.text }}>{isEdit ? 'MODIFICA SCHEDA' : 'CREA SCHEDA'}</span>
              {isEdit && <Edit3 size={14} style={{ color: T.amber }} />}
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>
              {step === 'info' ? 'Dettagli generali' : step === 'exercises' ? `${exercises.filter(e => e.name.trim()).length} esercizi` : 'Anteprima finale'}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 3, background: T.bg3, borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: accent, width: `${progress}%`, borderRadius: 100, transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>STEP {stepIdx + 1} / 3</span>
        </div>

        {/* Step pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          {STEPS.map((s, i) => {
            const isDone = i < stepIdx;
            const isActive = s === step;
            return (
              <React.Fragment key={s}>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: isDone ? accent : isActive ? T.bg3 : T.bg3, border: `1.5px solid ${isDone ? accent : isActive ? accent : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isDone
                    ? <Check size={13} style={{ color: '#000' }} strokeWidth={3} />
                    : <span style={{ fontFamily: T.mono, fontSize: 11, color: isActive ? accent : T.muted }}>{i + 1}</span>}
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1.5, background: isDone ? accent : T.border, borderRadius: 100, transition: 'background 0.3s' }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 120px' }}>

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ background: 'rgba(255,93,59,0.08)', border: '1px solid rgba(255,93,59,0.2)', borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
            {errors.map((e, i) => <div key={i} style={{ fontSize: 12, color: T.coral }}>{e}</div>)}
          </div>
        )}

        {/* ── STEP 1: INFO ────────────────────────────────────────────── */}
        {step === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>NOME SCHEDA *</div>
              <input
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="es. Push Day, Gambe Esplosive..."
                style={{ width: '100%', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px', color: T.text, fontSize: 15, fontWeight: 500, outline: 'none', fontFamily: T.body, boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = `${accent}70`)}
                onBlur={e => (e.target.style.borderColor = T.border)}
              />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>FOCUS / DESCRIZIONE</div>
              <input
                value={focus} onChange={e => setFocus(e.target.value)}
                placeholder="es. Ipertrofia e forza massima"
                style={{ width: '100%', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px', color: T.text, fontSize: 15, fontWeight: 500, outline: 'none', fontFamily: T.body, boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = `${accent}70`)}
                onBlur={e => (e.target.style.borderColor = T.border)}
              />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>CATEGORIA</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    style={{ padding: '14px', borderRadius: 18, border: `1px solid ${category === cat.value ? cat.color : T.border}`, background: category === cat.value ? `${cat.color}10` : T.bg2, cursor: 'pointer', textAlign: 'left', fontFamily: T.body, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: category === cat.value ? cat.color : T.text }}>{cat.label}</div>
                      {category === cat.value && <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: cat.color, letterSpacing: '0.08em', marginTop: 1 }}>Selezionato</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: EXERCISES ──────────────────────────────────────── */}
        {step === 'exercises' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Aggiungi gli esercizi. Massimo 12.</div>
            {exercises.map((ex, idx) => (
              <div key={ex.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden' }}>
                {/* Name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: `1px solid ${T.border}`, position: 'relative' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, background: T.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: T.muted }}>{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      value={ex.name}
                      onChange={e => { updateEx(ex.id, 'name', e.target.value); setShowSug(ex.id); }}
                      onFocus={() => setShowSug(ex.id)}
                      onBlur={() => setTimeout(() => setShowSug(null), 200)}
                      placeholder="Nome esercizio..."
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, fontWeight: 600, fontFamily: T.body }}
                    />
                    {showSug === ex.id && ex.name.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: T.bg3, border: `1px solid ${T.border2}`, borderRadius: 14, zIndex: 20, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                        {SUGGESTIONS.filter(s => s.toLowerCase().includes(ex.name.toLowerCase()) && s !== ex.name).slice(0, 5).map(s => (
                          <button key={s} onMouseDown={() => updateEx(ex.id, 'name', s)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: T.muted2, fontSize: 13, cursor: 'pointer', fontFamily: T.body, borderBottom: `1px solid ${T.border}` }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeEx(ex.id)} disabled={exercises.length <= 1} style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,93,59,0.08)', border: 'none', cursor: exercises.length <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.coral, opacity: exercises.length <= 1 ? 0.3 : 1 }}>
                    <X size={13} />
                  </button>
                </div>
                {/* Sets / Reps / Rest */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {[
                    { label: 'Serie', field: 'sets' as keyof ExEntry },
                    { label: 'Reps', field: 'reps' as keyof ExEntry },
                    { label: 'Rec (s)', field: 'rest' as keyof ExEntry },
                  ].map(({ label, field }, i) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', borderRight: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                      <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.muted, marginBottom: 4 }}>{label}</div>
                      <input
                        type="number" value={ex[field]}
                        onChange={e => updateEx(ex.id, field, e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: T.display, fontSize: 28, color: accent, width: 60, textAlign: 'center' }}
                        inputMode="numeric"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {exercises.length < 12 && (
              <button onClick={addEx} style={{ width: '100%', padding: '16px', borderRadius: 18, background: 'none', border: `1.5px dashed ${T.border2}`, color: T.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                <Plus size={16} /> Aggiungi Esercizio
              </button>
            )}
          </div>
        )}

        {/* ── STEP 3: REVIEW ─────────────────────────────────────────── */}
        {step === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Hero card */}
            <div style={{ borderRadius: 24, padding: '20px', overflow: 'hidden', position: 'relative', background: `linear-gradient(135deg, ${selCat.color}12, ${T.bg2})`, border: `1px solid ${selCat.color}25` }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: selCat.color, opacity: 0.05, filter: 'blur(20px)' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, position: 'relative' }}>
                <span style={{ fontSize: 32 }}>{selCat.emoji}</span>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 2 }}>{selCat.label}</div>
                  <div style={{ fontFamily: T.display, fontSize: 28, color: T.text, lineHeight: 1 }}>{title}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{focus || 'Scheda personalizzata'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: selCat.color }}>
                  <Dumbbell size={12} /> {exercises.filter(e => e.name.trim()).length} Esercizi
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: selCat.color }}>
                  <Zap size={12} /> {exercises.filter(e => e.name.trim()).reduce((a, e) => a + parseInt(e.sets || '0'), 0)} Serie
                </div>
              </div>
            </div>

            {/* Exercise list */}
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22, overflow: 'hidden' }}>
              {exercises.filter(e => e.name.trim()).map((ex, i, arr) => (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, width: 20 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ex.name}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 2, fontFamily: T.mono }}>{ex.sets}×{ex.reps} · Rec {ex.rest}"</div>
                  </div>
                </div>
              ))}
            </div>

            {isEdit && (
              <div style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: 14, padding: '12px 16px', fontSize: 12, color: T.amber, textAlign: 'center' }}>
                ✏️ Stai modificando una scheda esistente. Le modifiche verranno salvate subito.
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM ACTION */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: `linear-gradient(to top, ${T.bg} 60%, transparent)`, borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {step !== 'info' && (
            <button onClick={() => setStep(step === 'exercises' ? 'info' : 'exercises')} style={{ width: 48, height: 48, borderRadius: 16, background: T.bg2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <button
            onClick={step === 'review' ? handleSave : handleNext}
            disabled={saved}
            style={{ flex: 1, padding: '14px', borderRadius: 16, border: 'none', background: saved ? T.bg3 : accent, color: saved ? T.muted : '#000', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', cursor: saved ? 'not-allowed' : 'pointer', fontFamily: T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saved ? 'none' : `0 4px 24px ${accent}25`, transition: 'all 0.2s' }}
          >
            {saved ? (
              <><Check size={18} strokeWidth={3} /> {isEdit ? 'Aggiornata!' : 'Salvata!'}</>
            ) : step === 'review' ? (
              <><Check size={18} strokeWidth={3} /> {isEdit ? 'AGGIORNA SCHEDA' : 'SALVA SCHEDA'}</>
            ) : (
              <>AVANTI <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomWorkoutBuilder;
