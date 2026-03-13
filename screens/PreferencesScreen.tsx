import React, { useState, useRef } from 'react';
import {
  ArrowRight, CheckCircle2, Heart, Camera, User,
  ChevronLeft, Loader2, Building2, Home, Sparkles,
  Calendar, Trophy, Star
} from 'lucide-react';
import { saveFullProfile } from '../lib/supabase';
import { UserProfile } from '../types';

interface PreferencesScreenProps {
  onNext: (favorites: string[], trainingDays: number[], image?: string | null) => void;
  userId?: string;
  accumulatedProfile?: Partial<UserProfile> & {
    goal?: string;
    experience?: string;
    equipment?: string;
    trainingDays?: number[];
    maxes?: { bench: number; squat: number; deadlift: number };
    knownMaxes?: { bench: number | null; squat: number | null; deadlift: number | null };
  };
}

const PREF_OPTIONS = [
  { id: 'Panca Piana',    label: 'Panca Piana',    group: 'PETTO',   emoji: '🏋️' },
  { id: 'Squat',          label: 'Squat',           group: 'GAMBE',   emoji: '🦵' },
  { id: 'Trazioni',       label: 'Trazioni',        group: 'DORSO',   emoji: '🔝' },
  { id: 'Military Press', label: 'Military',        group: 'SPALLE',  emoji: '💪' },
  { id: 'Stacco',         label: 'Stacco',          group: 'SCHIENA', emoji: '⚡' },
  { id: 'Curl Bicipiti',  label: 'Curl',            group: 'BRACCIA', emoji: '💎' },
];

const WEEK_DAYS = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
const WEEK_SHORT = ['L','M','M','G','V','S','D'];

const GOAL_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  muscle:      { label: 'Ipertrofia',   emoji: '💪', color: '#10b981' },
  definition:  { label: 'Definizione',  emoji: '⚡', color: '#8b5cf6' },
  weight_loss: { label: 'Perdita Peso', emoji: '🔥', color: '#f97316' },
  endurance:   { label: 'Resistenza',   emoji: '🏃', color: '#3b82f6' },
};

const EXP_LABELS: Record<string, string> = {
  beginner:     'Principiante 🌱',
  intermediate: 'Intermedio 💪',
  advanced:     'Avanzato ⚡',
};

type EqKey = 'full_gym' | 'home_gym' | 'bodyweight';
const EQ_INFO: Record<EqKey, { label: string; Icon: React.ElementType }> = {
  full_gym:   { label: 'Palestra Completa', Icon: Building2 },
  home_gym:   { label: 'Home Gym',          Icon: Home },
  bodyweight: { label: 'Corpo Libero',      Icon: Sparkles },
};

type Step = 'prefs' | 'days' | 'recap';

const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ onNext, userId, accumulatedProfile = {} }) => {
  const [step, setStep]             = useState<Step>('prefs');
  const [selected, setSelected]     = useState<string[]>([]);
  const [trainingDays, setTrainingDays] = useState<number[]>(
    accumulatedProfile.trainingDays?.length ? accumulatedProfile.trainingDays : [1, 3, 5]
  );
  const [image, setImage]           = useState<string | null>(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSel = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const toggleDay = (idx: number) =>
    setTrainingDays(p => p.includes(idx) ? p.filter(d => d !== idx) : [...p, idx].sort((a,b) => a-b));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteSetup = async () => {
    if (trainingDays.length === 0) { setSaveError('Seleziona almeno un giorno.'); return; }
    setIsSaving(true);
    setSaveError(null);
    try {
      const finalImage = image || accumulatedProfile?.image || null;
      const fullProfileData = { ...accumulatedProfile, favoriteExercises: selected, trainingDays, image: finalImage, setup_completed: true };
      if (userId) await saveFullProfile(userId, fullProfileData);
      onNext(selected, trainingDays, finalImage);
    } catch (err: any) {
      setSaveError(err.message || 'Errore nel salvataggio. Riprova.');
      setIsSaving(false);
    }
  };

  const goal     = accumulatedProfile.goal     || 'muscle';
  const exp      = accumulatedProfile.experience || 'intermediate';
  const equipment = (accumulatedProfile.equipment || 'full_gym') as EqKey;
  const goalInfo = GOAL_LABELS[goal] || GOAL_LABELS.muscle;
  const eqInfo   = EQ_INFO[equipment] || EQ_INFO.full_gym;
  const EqIcon   = eqInfo.Icon;

  const stepNum = { prefs: 1, days: 2, recap: 3 }[step];

  const Header = ({ onBack }: { onBack?: () => void }) => (
    <div className="px-5 pt-14 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className={`w-9 h-9 flex items-center justify-center rounded-full bg-[#121212] border border-slate-800 transition-all ${!onBack ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(stepNum / 3) * 100}%` }} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Step {stepNum} di 3</span>
      </div>
    </div>
  );

  // ── STEP 1: ESERCIZI PREFERITI ──────────────────────────────────
  if (step === 'prefs') return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <div className="px-5 pb-2">
        <h1 className="text-3xl font-black text-white mb-1">Cosa ti piace?</h1>
        <p className="text-slate-400 text-sm">Seleziona gli esercizi preferiti. Li includeremo più spesso.</p>
      </div>
      <div className="flex-1 px-5 pt-4 pb-32 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {PREF_OPTIONS.map(opt => {
            const isSel = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleSel(opt.id)}
                className={`relative p-5 rounded-3xl border transition-all text-left flex flex-col gap-3 ${
                  isSel
                    ? 'bg-[#1a1a1a] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                    : 'bg-[#121212] border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${isSel ? 'bg-emerald-500/20' : 'bg-slate-800/60'}`}>
                  {opt.emoji}
                </div>
                <div>
                  <h3 className={`font-black text-base ${isSel ? 'text-white' : 'text-slate-200'}`}>{opt.label}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isSel ? 'text-emerald-400' : 'text-slate-500'}`}>{opt.group}</p>
                </div>
                {isSel && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-black" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selected.length === 0 && (
          <p className="text-center text-slate-700 text-xs mt-5">Puoi saltare questa selezione</p>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent z-10">
        <button
          onClick={() => setStep('days')}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          CONTINUA <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );

  // ── STEP 2: GIORNI ──────────────────────────────────────────────
  if (step === 'days') return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header onBack={() => setStep('prefs')} />
      <div className="px-5 pb-4">
        <h1 className="text-3xl font-black text-white mb-1">Quando ti alleni?</h1>
        <p className="text-slate-400 text-sm">Costruiremo il piano esattamente su questi giorni.</p>
      </div>
      <div className="flex-1 px-5 pb-32 space-y-4 overflow-y-auto">
        <div className="bg-[#121212] border border-slate-800 rounded-3xl p-5">
          <div className="flex justify-between gap-1.5 mb-4">
            {WEEK_DAYS.map((day, idx) => {
              const isSel = trainingDays.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${
                    isSel ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-black border-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isSel ? 'text-black/60' : 'text-slate-600'}`}>{day}</span>
                  <span className={`text-sm font-black ${isSel ? 'text-black' : 'text-slate-400'}`}>{WEEK_SHORT[idx]}</span>
                </button>
              );
            })}
          </div>
          <p className={`text-xs font-medium text-center ${trainingDays.length > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
            {trainingDays.length > 0 ? `✓ ${trainingDays.length} giorn${trainingDays.length === 1 ? 'o' : 'i'} selezionat${trainingDays.length === 1 ? 'o' : 'i'}` : 'Seleziona almeno 1 giorno'}
          </p>
        </div>
        {trainingDays.length >= 2 && (() => {
          const splits: Record<number, { name: string; desc: string }> = {
            2: { name: 'Full Body × 2', desc: 'Tutto il corpo, due volte a settimana' },
            3: { name: 'Push / Pull / Legs', desc: 'Il classico split a 3 giorni' },
            4: { name: 'Upper / Lower × 2', desc: 'Alta frequenza su ogni muscolo' },
            5: { name: '5-Day Split', desc: 'Un gruppo muscolare al giorno' },
            6: { name: 'PPL × 2', desc: 'Push Pull Legs ripetuto due volte' },
          };
          const n = Math.min(trainingDays.length, 6);
          const s = splits[n] || splits[3];
          return (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
              <p className="text-emerald-400 font-black text-sm">📋 {s.name}</p>
              <p className="text-slate-400 text-xs mt-1">{s.desc}</p>
            </div>
          );
        })()}
        <div className="bg-[#121212] border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-500 text-xs leading-relaxed">
            💡 Puoi sempre modificare i giorni dal Profilo. Il piano si aggiornerà automaticamente.
          </p>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent z-10">
        {saveError && <p className="text-red-400 text-xs text-center mb-3">{saveError}</p>}
        <button
          onClick={() => { if (trainingDays.length > 0) setStep('recap'); else setSaveError('Seleziona almeno un giorno.'); }}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          CONTINUA <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );

  // ── STEP 3: RIEPILOGO + FOTO + LANCIO ───────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header onBack={() => setStep('days')} />
      <div className="px-5 pb-5 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          <Trophy size={30} className="text-black" />
        </div>
        <h1 className="text-3xl font-black text-white mb-1">Tutto pronto!</h1>
        <p className="text-slate-400 text-sm">Conferma i dettagli e lancia GymBro.</p>
      </div>

      <div className="flex-1 px-5 pb-32 space-y-3 overflow-y-auto">

        {/* Summary */}
        <div className="bg-[#121212] border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/60">
          {/* Goal */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xl" style={{ backgroundColor: `${goalInfo.color}15` }}>
              {goalInfo.emoji}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Obiettivo</p>
              <p className="text-white font-bold">{goalInfo.label}</p>
            </div>
          </div>
          {/* Experience */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 flex items-center justify-center shrink-0">
              <Star size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Esperienza</p>
              <p className="text-white font-bold">{EXP_LABELS[exp] || 'Intermedio 💪'}</p>
            </div>
          </div>
          {/* Equipment */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <EqIcon size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Attrezzatura</p>
              <p className="text-white font-bold">{eqInfo.label}</p>
            </div>
          </div>
          {/* Training days */}
          <div className="flex items-start gap-4 p-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Giorni — {trainingDays.length}x a settimana
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {WEEK_SHORT.map((d, i) => (
                  <span key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black ${
                    trainingDays.includes(i) ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-600'
                  }`}>{d}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Favorites */}
          {selected.length > 0 && (
            <div className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Heart size={18} className="text-rose-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Esercizi Preferiti</p>
                <div className="flex gap-1.5 flex-wrap">
                  {selected.map(s => (
                    <span key={s} className="text-[11px] font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Maxes recap */}
        {(() => {
          const km = accumulatedProfile.knownMaxes || {};
          const bench    = km.bench    || 0;
          const squat    = km.squat    || 0;
          const deadlift = km.deadlift || 0;
          if (!bench && !squat && !deadlift) return null;
          return (
            <div className="bg-[#121212] border border-slate-800 rounded-3xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Massimali Inseriti</p>
              <div className="flex gap-2">
                {[['🏋️','Panca',bench],['🦵','Squat',squat],['⚡','Stacco',deadlift]].map(([em, lbl, val]) => (
                  <div key={lbl as string} className={`flex-1 rounded-2xl p-3 text-center border ${(val as number) > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black border-slate-800 opacity-40'}`}>
                    <span className="text-base">{em}</span>
                    <p className={`font-black text-base mt-1 ${(val as number) > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {(val as number) > 0 ? `${Math.round(val as number)}kg` : '—'}
                    </p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase mt-0.5">{lbl}</p>
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-[10px] mt-3 text-center">I massimali mancanti verranno stimati dall'algoritmo</p>
            </div>
          );
        })()}

        {/* Foto profilo */}
        <div className="bg-[#121212] border border-slate-800 rounded-3xl p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
            Foto Profilo <span className="text-slate-700 normal-case font-normal">(opzionale)</span>
          </p>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
                {image
                  ? <img src={image} className="w-full h-full object-cover" alt="profilo" />
                  : <User size={32} className="text-slate-600" />
                }
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-black shadow">
                <Camera size={14} className="text-black" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{image ? 'Foto caricata ✓' : 'Aggiungi una foto'}</p>
              <p className="text-slate-500 text-xs mt-0.5">{image ? 'Tocca per cambiare' : 'Visibile nella community'}</p>
            </div>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
            {saveError}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent z-10">
        <button
          onClick={handleCompleteSetup}
          disabled={isSaving}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.25)]"
        >
          {isSaving
            ? <><Loader2 size={20} className="animate-spin" /> SALVATAGGIO...</>
            : <>🚀 INIZIA CON GYMBRO <ArrowRight size={20} strokeWidth={3} /></>
          }
        </button>
        <p className="text-center text-slate-700 text-[10px] mt-2">Tutto modificabile dal Profilo in qualsiasi momento</p>
      </div>
    </div>
  );
};

export default PreferencesScreen;
