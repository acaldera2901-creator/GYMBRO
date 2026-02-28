import React, { useState, useRef } from 'react';
import { Dumbbell, ArrowRight, CheckCircle2, Heart, Calendar, Camera, User, ChevronLeft, Loader2 } from 'lucide-react';
import { saveFullProfile } from '../lib/supabase';
import { UserProfile } from '../types';

interface PreferencesScreenProps {
  onNext: (favorites: string[], trainingDays: number[]) => void;
  userId?: string;
  accumulatedProfile?: Partial<UserProfile>;
}

const PREF_OPTIONS = [
    { id: 'Panca Piana', label: 'Panca Piana', group: 'CHEST' },
    { id: 'Squat', label: 'Squat', group: 'LEGS' },
    { id: 'Trazioni', label: 'Trazioni', group: 'BACK' },
    { id: 'Military Press', label: 'Military', group: 'SHOULDERS' },
    { id: 'Stacco', label: 'Stacco', group: 'BACK' },
    { id: 'Curl Bicipiti', label: 'Curl', group: 'ARMS' }
];

const WEEK_DAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ onNext, userId, accumulatedProfile }) => {
  const [step, setStep] = useState<'prefs' | 'final'>('prefs');
  const [selected, setSelected] = useState<string[]>([]);
  const [trainingDays, setTrainingDays] = useState<number[]>([1, 3, 5]);
  const [image, setImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSelection = (id: string) => {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleDay = (index: number) => {
      setTrainingDays(prev => prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index].sort((a, b) => a - b));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleCompleteSetup = async () => {
      if (trainingDays.length === 0) {
          setSaveError('Seleziona almeno un giorno di allenamento.');
          return;
      }
      setIsSaving(true);
      setSaveError(null);
      try {
          // Salva TUTTO il profilo accumulato negli step precedenti in un'unica chiamata
          const fullProfileData = {
              ...accumulatedProfile,
              favoriteExercises: selected,
              trainingDays: trainingDays,
              image: image || accumulatedProfile?.image,
              maxes: accumulatedProfile?.maxes,
              setup_completed: true
          };

          if (userId) {
              await saveFullProfile(userId, fullProfileData);
          }

          onNext(selected, trainingDays);
      } catch (err: any) {
          console.error('Setup save error:', err);
          setSaveError(err.message || 'Errore nel salvataggio. Riprova.');
          setIsSaving(false);
      }
  };

  // --- STEP 1: PREFERENZE ---
  if (step === 'prefs') {
      return (
          <div className="min-h-screen bg-black text-white flex flex-col font-sans">
              <div className="px-6 pt-16 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">
                      <Heart size={14} /> Step 4 di 4
                  </div>
                  <h1 className="text-4xl font-black text-white mb-2">Cosa ti piace?</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                      Seleziona i tuoi esercizi preferiti. Li inseriremo più spesso.
                  </p>
              </div>

              <div className="flex-1 px-6 pb-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                      {PREF_OPTIONS.map((opt) => {
                          const isSelected = selected.includes(opt.id);
                          return (
                              <button
                                  key={opt.id}
                                  onClick={() => toggleSelection(opt.id)}
                                  className={`relative aspect-square p-4 rounded-3xl border transition-all flex flex-col justify-between text-left ${isSelected ? 'bg-[#121212] border-white' : 'bg-[#121212] border-slate-800 hover:border-slate-600'}`}
                              >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white text-black' : 'bg-slate-800 text-slate-500'}`}>
                                      {isSelected ? <CheckCircle2 size={18} /> : <Dumbbell size={18} />}
                                  </div>
                                  <div>
                                      <h3 className={`font-bold text-lg leading-none mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>{opt.label}</h3>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{opt.group}</p>
                                  </div>
                              </button>
                          );
                      })}
                  </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
                  <button
                      onClick={() => setStep('final')}
                      className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                      AVANTI <ArrowRight size={20} strokeWidth={3} />
                  </button>
              </div>
          </div>
      );
  }

  // --- STEP 2: SETUP FINALE ---
  return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
          <div className="px-6 pt-16 pb-4">
              <button onClick={() => setStep('prefs')} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#121212] border border-slate-800 mb-6">
                  <ChevronLeft size={20} className="text-white" />
              </button>
              <div className="flex justify-center gap-2 mb-8">
                  {[0,1,2].map(i => <div key={i} className="w-8 h-1.5 bg-emerald-500 rounded-full" />)}
              </div>
              <h1 className="text-4xl font-black text-white mb-2">Setup Finale</h1>
              <p className="text-slate-400 text-sm leading-relaxed">Quando ti allenerai? Imposta la tua routine.</p>
          </div>

          <div className="flex-1 px-6 space-y-8 pb-32 overflow-y-auto">
              {/* Giorni */}
              <div className="bg-[#121212] border border-slate-800 rounded-3xl p-6">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-4">
                      Giorni di Allenamento <span className="text-emerald-500">*</span>
                  </label>
                  <div className="flex justify-between gap-1">
                      {WEEK_DAYS.map((day, idx) => {
                          const isSelected = trainingDays.includes(idx);
                          return (
                              <button
                                  key={idx}
                                  onClick={() => toggleDay(idx)}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-black border-slate-800 text-slate-600'}`}
                              >
                                  {day}
                              </button>
                          );
                      })}
                  </div>
                  {trainingDays.length > 0 && (
                      <p className="text-emerald-400 text-xs mt-3 font-medium">{trainingDays.length} giorni selezionati</p>
                  )}
              </div>

              {/* Foto Profilo */}
              <div className="flex flex-col items-center">
                  <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-36 h-36 rounded-full bg-[#121212] border-2 border-slate-800 flex items-center justify-center overflow-hidden">
                          {image ? (
                              <img src={image} className="w-full h-full object-cover" alt="profilo" />
                          ) : (
                              <User size={56} className="text-slate-700" />
                          )}
                      </div>
                      <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-black shadow-lg">
                          <Camera size={14} className="text-white" />
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  <p className="text-slate-500 text-xs mt-3">Foto profilo (opzionale)</p>
              </div>

              {saveError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
                      {saveError}
                  </div>
              )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
              <button
                  onClick={handleCompleteSetup}
                  disabled={isSaving || trainingDays.length === 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                  {isSaving ? <><Loader2 size={20} className="animate-spin" /> SALVATAGGIO...</> : <>INIZIA <ArrowRight size={20} strokeWidth={3} /></>}
              </button>
          </div>
      </div>
  );
};

export default PreferencesScreen;
