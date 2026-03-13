
import React, { useState, useRef } from 'react';
import { ArrowRight, Camera, Loader2, ChevronLeft, Check } from 'lucide-react';
import { saveFullProfile } from '../lib/supabase';
import { UserProfile } from '../types';

interface PreferencesScreenProps {
  onNext: (favorites: string[], trainingDays: number[], image?: string | null) => void;
  userId?: string;
  accumulatedProfile?: Partial<UserProfile> & {
    goal?: string; experience?: string; equipment?: string;
    trainingDays?: number[];
    maxes?: { bench: number; squat: number; deadlift: number };
    knownMaxes?: { bench: number | null; squat: number | null; deadlift: number | null };
  };
}

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  lime: '#C8FF00', coral: '#FF5D3B',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

const PREF_OPTIONS = [
  { id: 'Panca Piana',    label: 'Panca Piana',  group: 'PETTO',   emoji: '🏋️' },
  { id: 'Squat',          label: 'Squat',         group: 'GAMBE',   emoji: '🦵' },
  { id: 'Trazioni',       label: 'Trazioni',      group: 'DORSO',   emoji: '🔝' },
  { id: 'Military Press', label: 'Military',      group: 'SPALLE',  emoji: '💪' },
  { id: 'Stacco',         label: 'Stacco',        group: 'SCHIENA', emoji: '⚡' },
  { id: 'Curl Bicipiti',  label: 'Curl',          group: 'BRACCIA', emoji: '💎' },
];

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const GOAL_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  muscle:      { label: 'Ipertrofia',   emoji: '💪', color: T.lime },
  definition:  { label: 'Definizione',  emoji: '⚡', color: '#A78BFA' },
  weight_loss: { label: 'Perdita Peso', emoji: '🔥', color: T.coral },
  endurance:   { label: 'Resistenza',   emoji: '🏃', color: '#38BDF8' },
};

type Step = 'prefs' | 'days' | 'recap';

const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ onNext, userId, accumulatedProfile = {} }) => {
  const [step, setStep] = useState<Step>('prefs');
  const [selected, setSelected] = useState<string[]>([]);
  const [trainingDays, setTrainingDays] = useState<number[]>(
    accumulatedProfile.trainingDays?.length ? accumulatedProfile.trainingDays : [1, 3, 5]
  );
  const [image, setImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSel  = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleDay  = (idx: number) => setTrainingDays(p => p.includes(idx) ? p.filter(d => d !== idx) : [...p, idx].sort((a,b) => a-b));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(file); }
  };

  const handleComplete = async () => {
    if (trainingDays.length === 0) { setSaveError('Seleziona almeno un giorno.'); return; }
    setIsSaving(true); setSaveError(null);
    try {
      const finalImage = image || accumulatedProfile?.image || null;
      const fullData = { ...accumulatedProfile, favoriteExercises: selected, trainingDays, image: finalImage, setup_completed: true };
      if (userId) await saveFullProfile(userId, fullData);
      onNext(selected, trainingDays, finalImage);
    } catch (err: any) {
      setSaveError(err.message || 'Errore nel salvataggio. Riprova.');
      setIsSaving(false);
    }
  };

  const goal = accumulatedProfile.goal || 'muscle';
  const goalInfo = GOAL_INFO[goal] || GOAL_INFO.muscle;

  const stepTitles: Record<Step, { display: string; sub: string }> = {
    prefs: { display: 'I TUOI\nFAVORITI', sub: 'Seleziona gli esercizi che ami di più. (Opzionale)' },
    days:  { display: 'I TUOI\nGIORNI',   sub: 'Quando ti alleni durante la settimana?' },
    recap: { display: 'TUTTO\nPRONTO!',   sub: 'Controlla il tuo profilo e inizia il viaggio.' },
  };
  const steps: Step[] = ['prefs', 'days', 'recap'];
  const stepIdx = steps.indexOf(step);
  const progress = ((stepIdx + 1) / steps.length) * 100;

  const handleNext = () => {
    if (step === 'prefs') setStep('days');
    else if (step === 'days') setStep('recap');
    else handleComplete();
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ padding: '56px 24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => { if (step === 'days') setStep('prefs'); else if (step === 'recap') setStep('days'); }}
          style={{ width: 40, height: 40, borderRadius: 14, background: T.bg2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text, opacity: stepIdx === 0 ? 0 : 1, pointerEvents: stepIdx === 0 ? 'none' : 'auto' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 3, background: T.bg3, borderRadius: 100, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', background: T.lime, borderRadius: 100, width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>STEP {stepIdx + 1} DI {steps.length}</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 24px 8px' }}>
        <h1 style={{ fontFamily: T.display, fontSize: 52, lineHeight: 0.9, whiteSpace: 'pre-line', marginBottom: 8 }}>
          {stepTitles[step].display.split('\n').map((line, i) => (
            <React.Fragment key={i}>{i === 1 ? <span style={{ color: T.lime }}>{line}</span> : line}{i === 0 && <br />}</React.Fragment>
          ))}
        </h1>
        <p style={{ fontSize: 13, color: T.muted2 }}>{stepTitles[step].sub}</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 120px' }}>

        {/* PREF STEP */}
        {step === 'prefs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PREF_OPTIONS.map(opt => {
              const isSel = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSel(opt.id)}
                  style={{
                    padding: '16px 14px', borderRadius: 18, border: `1px solid ${isSel ? T.lime : T.border}`,
                    background: isSel ? 'rgba(200,255,0,0.08)' : T.bg2,
                    color: T.text, cursor: 'pointer', textAlign: 'left', position: 'relative',
                    transition: 'all 0.2s', fontFamily: T.body,
                  }}
                >
                  {isSel && (
                    <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: T.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} style={{ color: '#000' }} strokeWidth={3} />
                    </div>
                  )}
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{opt.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isSel ? T.lime : T.text }}>{opt.label}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginTop: 2 }}>{opt.group}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* DAYS STEP */}
        {step === 'days' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 20 }}>
              {WEEK_DAYS.map((day, idx) => {
                const isActive = trainingDays.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    style={{
                      aspectRatio: '1', borderRadius: 14, border: `1px solid ${isActive ? T.lime : T.border}`,
                      background: isActive ? 'rgba(200,255,0,0.12)' : T.bg2,
                      color: isActive ? T.lime : T.muted, fontSize: 10, fontWeight: 800,
                      cursor: 'pointer', fontFamily: T.body, transition: 'all 0.2s',
                    }}
                  >
                    {day.charAt(0)}
                  </button>
                );
              })}
            </div>
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.5 }}>
                📅 <strong style={{ color: T.text }}>{trainingDays.length}</strong> giorni selezionati:{' '}
                {trainingDays.map(d => WEEK_DAYS[d]).join(', ')}
              </div>
            </div>
          </>
        )}

        {/* RECAP STEP */}
        {step === 'recap' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Avatar upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 90, height: 90, borderRadius: 24, border: `2px dashed ${T.lime}`,
                  background: image ? 'transparent' : 'rgba(200,255,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', position: 'relative',
                }}
              >
                {image
                  ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ textAlign: 'center' }}>
                      <Camera size={24} style={{ color: T.lime }} />
                      <div style={{ fontSize: 9, color: T.muted, marginTop: 4, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Foto</div>
                    </div>
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <div style={{ fontSize: 11, color: T.muted }}>Foto profilo opzionale</div>
            </div>

            {/* Summary cards */}
            {[
              { label: 'Obiettivo', value: `${goalInfo.emoji} ${goalInfo.label}`, color: goalInfo.color },
              { label: 'Esperienza', value: { beginner: '🌱 Principiante', intermediate: '💪 Intermedio', advanced: '⚡ Avanzato' }[accumulatedProfile.experience || 'intermediate'] || '💪 Intermedio', color: T.text },
              { label: 'Attrezzatura', value: { full_gym: '🏢 Palestra Completa', home_gym: '🏠 Home Gym', bodyweight: '🤸 Corpo Libero' }[accumulatedProfile.equipment || 'full_gym'] || '🏢 Palestra', color: T.text },
              { label: 'Giorni di Allenamento', value: `${trainingDays.length} giorni / settimana`, color: T.lime },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}</span>
              </div>
            ))}

            {/* Exercises */}
            {selected.length > 0 && (
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Esercizi Preferiti</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selected.map(id => (
                    <div key={id} style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(200,255,0,0.08)', border: '1px solid rgba(200,255,0,0.2)', fontSize: 11, fontWeight: 700, color: T.lime }}>{id}</div>
                  ))}
                </div>
              </div>
            )}

            {saveError && (
              <div style={{ background: 'rgba(255,93,59,0.08)', border: '1px solid rgba(255,93,59,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: T.coral }}>{saveError}</div>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px 24px 36px', background: `linear-gradient(to top, ${T.bg} 70%, transparent)` }}>
        <button
          onClick={handleNext}
          disabled={isSaving}
          style={{ width: '100%', background: T.lime, color: '#000', border: 'none', borderRadius: 16, padding: '17px', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', cursor: 'pointer', fontFamily: T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 24px rgba(200,255,0,0.25)', opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? <><Loader2 size={20} className="animate-spin" /> Salvataggio...</> : step === 'recap' ? <><Check size={20} strokeWidth={3} /> INIZIA L&apos;ALLENAMENTO!</> : <>CONTINUA <ArrowRight size={20} strokeWidth={3} /></>}
        </button>
      </div>
    </div>
  );
};

export default PreferencesScreen;
