
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ArrowRight, Calendar, User, Ruler, Weight } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileConfigScreenProps {
  onNext: (data: Partial<UserProfile>) => void;
  onSkip: () => void; // Not used in this strict flow but kept for interface
  initialData?: UserProfile;
}

// Internal Wizard Steps
type ConfigStep = 'identity' | 'measures';

const ProfileConfigScreen: React.FC<ProfileConfigScreenProps> = ({ onNext, initialData }) => {
  const [step, setStep] = useState<ConfigStep>('identity');
  
  // Form State
  const [gender, setGender] = useState<'Uomo' | 'Donna' | 'Altro'>('Uomo');
  const [name, setName] = useState('');
  const [dob, setDob] = useState(''); 
  const [weight, setWeight] = useState(''); 
  const [height, setHeight] = useState(''); 
  
  // Init
  useEffect(() => {
    if (initialData) {
        if (initialData.name) setName(initialData.name);
        if (initialData.gender) setGender(initialData.gender);
        if (initialData.weight) setWeight(initialData.weight.toString());
        if (initialData.height) setHeight(initialData.height.toString());
    }
  }, [initialData]);

  const handleNextStep = async () => {
      if (step === 'identity') {
          if (!name.trim() || !dob) return; // Basic validation
          setStep('measures');
      } else {
          // Finalize this screen's data
          if (!weight || !height) return;
          
          const weightNum = parseFloat(weight);
          const heightNum = parseFloat(height);

          // Save to DB immediately or pass up
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
              await supabase.from('profiles').upsert({
                  id: session.user.id,
                  name,
                  gender,
                  weight: weightNum,
                  height: heightNum,
                  updated_at: new Date().toISOString()
              });
          }

          onNext({ name, gender, weight: weightNum, height: heightNum });
      }
  };

  const handleBack = () => {
      if (step === 'measures') setStep('identity');
  };

  // --- RENDER IDENTITY STEP ---
  const renderIdentity = () => (
      <>
        <div className="flex justify-center gap-2 mb-8">
            <div className="w-8 h-1.5 bg-emerald-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Chi sei?</h1>
        <p className="text-slate-400 text-sm mb-8">Iniziamo dalle basi per conoscerti meglio.</p>

        <div className="space-y-6">
            <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1 block mb-2">Genere</label>
                <div className="flex gap-2">
                    {['Uomo', 'Donna', 'Altro'].map((g) => (
                        <button
                            key={g}
                            onClick={() => setGender(g as any)}
                            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all border ${
                                gender === g 
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                                : 'bg-[#121212] border-slate-800 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1 block mb-2">Nome Completo</label>
                <div className="relative group">
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Il tuo nome"
                        className="w-full bg-[#121212] text-white rounded-xl py-4 px-4 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1 block mb-2">Data di Nascita</label>
                <div className="relative group">
                    <input 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={`w-full bg-[#121212] text-white rounded-xl py-4 px-4 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium appearance-none ${!dob && 'text-slate-500'}`}
                    />
                    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
            </div>
        </div>
      </>
  );

  // --- RENDER MEASURES STEP ---
  const renderMeasures = () => (
      <>
        <div className="flex justify-center gap-2 mb-8">
            <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full"></div>
            <div className="w-8 h-1.5 bg-emerald-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Le tue misure</h1>
        <p className="text-slate-400 text-sm mb-8">Serviranno per calcolare i tuoi parametri ideali.</p>

        <div className="space-y-4">
            <div className="bg-[#121212] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group focus-within:border-emerald-500/50 transition-colors">
                <Weight className="absolute right-4 top-4 text-slate-800 w-24 h-24 -mr-4 -mt-4 opacity-50" />
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Peso Corporeo</label>
                <div className="flex items-baseline gap-1 relative z-10">
                    <input 
                        type="number" 
                        value={weight} 
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0"
                        className="bg-transparent text-5xl font-black text-white placeholder-slate-700 outline-none w-32"
                    />
                    <span className="text-slate-500 font-bold text-lg">kg</span>
                </div>
            </div>

            <div className="bg-[#121212] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group focus-within:border-emerald-500/50 transition-colors">
                <Ruler className="absolute right-4 top-4 text-slate-800 w-24 h-24 -mr-4 -mt-4 opacity-50 transform rotate-45" />
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Altezza</label>
                <div className="flex items-baseline gap-1 relative z-10">
                    <input 
                        type="number" 
                        value={height} 
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="0"
                        className="bg-transparent text-5xl font-black text-white placeholder-slate-700 outline-none w-32"
                    />
                    <span className="text-slate-500 font-bold text-lg">cm</span>
                </div>
            </div>
        </div>
      </>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Navbar */}
      <div className="px-6 pt-16 pb-4 flex items-center justify-between">
        <button 
            onClick={handleBack} 
            className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#121212] border border-slate-800 hover:border-slate-600 transition-colors ${step === 'identity' ? 'opacity-0 pointer-events-none' : ''}`}
        >
             <ChevronLeft size={20} className="text-white" />
        </button>
        {/* Simple Progress dots logic handled in render functions */}
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
          {step === 'identity' ? renderIdentity() : renderMeasures()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
        <button 
          onClick={handleNextStep}
          className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          CONTINUA <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default ProfileConfigScreen;
