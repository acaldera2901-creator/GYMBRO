
import React, { useState, useRef } from 'react';
import { Dumbbell, ArrowRight, CheckCircle2, Heart, Calendar, Camera, User, ChevronLeft } from 'lucide-react';
import { supabase, updateGuestProfile } from '../lib/supabase';

interface PreferencesScreenProps {
  onNext: (favorites: string[], trainingDays: number[]) => void;
}

const PREF_OPTIONS = [
    { id: 'Panca Piana', label: 'Panca Piana', group: 'CHEST' },
    { id: 'Squat', label: 'Squat', group: 'LEGS' },
    { id: 'Trazioni', label: 'Trazioni', group: 'BACK' },
    { id: 'Military', label: 'Military', group: 'SHOULDERS' }, 
    { id: 'Stacco', label: 'Stacco', group: 'BACK' },
    { id: 'Curl', label: 'Curl', group: 'ARMS' }
];

const WEEK_DAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ onNext }) => {
  // Step 1: Favorites, Step 2: Final Setup
  const [step, setStep] = useState<'prefs' | 'final'>('prefs');
  const [selected, setSelected] = useState<string[]>([]);
  
  // Final Setup State
  const [trainingDays, setTrainingDays] = useState<number[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSelection = (id: string) => {
      setSelected(prev => {
          if (prev.includes(id)) {
              return prev.filter(item => item !== id);
          } else {
              return [...prev, id];
          }
      });
  };

  const handlePreferencesNext = () => {
      setStep('final');
  };

  const toggleDay = (index: number) => {
    setTrainingDays(prev => {
        if (prev.includes(index)) {
            return prev.filter(d => d !== index);
        } else {
            return [...prev, index].sort((a, b) => a - b);
        }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
          setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteSetup = async () => {
      // Data to update - IMPORTANT: Add setup_completed flag implied by presence of training_days
      const updates: any = { 
          updated_at: new Date().toISOString(),
          setup_completed: true 
      };
      if (trainingDays.length > 0) updates.training_days = trainingDays;
      if (image) updates.image = image;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
          // Update Supabase
          await supabase.from('profiles').update(updates).eq('id', session.user.id);
      } else {
          // Update Guest Local Storage
          await updateGuestProfile(updates);
      }
      
      onNext(selected, trainingDays);
  };

  // --- RENDER PREFS ---
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

          <div className="flex-1 px-6 pb-24 overflow-y-auto">
             <div className="grid grid-cols-2 gap-3">
                {PREF_OPTIONS.map((opt) => {
                    const isSelected = selected.includes(opt.id);
                    return (
                        <button
                            key={opt.id}
                            onClick={() => toggleSelection(opt.id)}
                            className={`relative aspect-square p-4 rounded-3xl border transition-all flex flex-col justify-between text-left group ${
                                isSelected 
                                ? 'bg-[#121212] border-white text-white' 
                                : 'bg-[#121212] border-slate-800 hover:border-slate-600'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white text-black' : 'bg-slate-800 text-slate-500'}`}>
                                <Dumbbell size={18} />
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
              onClick={handlePreferencesNext}
              className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              SALTA E CREA <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      );
  }

  // --- RENDER FINAL SETUP ---
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans animate-in slide-in-from-right duration-300">
        <div className="px-6 pt-16 pb-4">
            <button onClick={() => setStep('prefs')} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#121212] border border-slate-800 mb-6">
                <ChevronLeft size={20} className="text-white" />
            </button>
            <div className="flex justify-center gap-2 mb-8">
                <div className="w-8 h-1.5 bg-red-500 rounded-full"></div>
                <div className="w-8 h-1.5 bg-red-500 rounded-full"></div>
                <div className="w-8 h-1.5 bg-red-500 rounded-full"></div>
            </div>
            
            <h1 className="text-4xl font-black text-white mb-2">Setup Finale</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
                Quando ti allenerai? Imposta la tua routine.
            </p>
        </div>

        <div className="flex-1 px-6 space-y-10 pb-24">
            
            {/* Days Selector */}
            <div className="bg-[#121212] border border-slate-800 rounded-3xl p-6">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-4">Giorni di Allenamento</label>
                <div className="flex justify-between gap-1">
                    {WEEK_DAYS.map((day, idx) => {
                        const isSelected = trainingDays.includes(idx);
                        return (
                            <button 
                                key={idx}
                                onClick={() => toggleDay(idx)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                    isSelected 
                                    ? 'bg-slate-800 border-slate-600 text-white' 
                                    : 'bg-black border-slate-800 text-slate-600'
                                }`}
                            >
                                {day}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col items-center">
                <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-40 h-40 rounded-full bg-[#121212] border-2 border-slate-800 flex items-center justify-center overflow-hidden relative">
                        {image ? (
                            <img src={image} className="w-full h-full object-cover" />
                        ) : (
                            <User size={64} className="text-slate-700" />
                        )}
                        {/* Camera Badge */}
                        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center border-4 border-black shadow-lg">
                            <Camera size={16} className="text-white" />
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <p className="text-slate-500 text-xs mt-4">Aggiungi foto profilo (opzionale)</p>
            </div>

        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
            <button 
              onClick={handleCompleteSetup}
              className="w-full bg-slate-500 hover:bg-slate-400 text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              COMPLETA SETUP <ArrowRight size={20} strokeWidth={3} />
            </button>
        </div>
    </div>
  );
};

export default PreferencesScreen;
