
import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, Users, Swords, Trophy, Medal } from 'lucide-react';

interface CommunityTutorialOverlayProps {
  onComplete: () => void;
  onRequestTabChange: (tab: 'social' | 'arena') => void;
  themeColor: string;
}

const STEPS = [
  {
    title: "Benvenuto nella Community",
    desc: "Qui puoi condividere i tuoi progressi, vedere le storie degli altri GymBro e trovare motivazione nel Social Feed.",
    tab: 'social' as const,
    icon: Users
  },
  {
    title: "Entra nell'Arena",
    desc: "Spostati nella sezione Arena per competere. Lancia sfide 1vs1 agli altri utenti per guadagnare punti.",
    tab: 'arena' as const,
    icon: Swords
  },
  {
    title: "Scala la Classifica",
    desc: "Ogni sfida vinta ti dà punti. I migliori atleti della settimana appaiono in cima alla leaderboard globale.",
    tab: 'arena' as const,
    icon: Trophy
  },
  {
    title: "Colleziona Medaglie",
    desc: "Sblocca obiettivi speciali come 'On Fire' o 'Campione'. Le tue medaglie saranno visibili a tutti nel tuo profilo.",
    tab: 'arena' as const,
    icon: Medal
  }
];

const CommunityTutorialOverlay: React.FC<CommunityTutorialOverlayProps> = ({ onComplete, onRequestTabChange, themeColor }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Trigger tab change when step changes
  useEffect(() => {
    const targetTab = STEPS[currentStep].tab;
    onRequestTabChange(targetTab);
  }, [currentStep, onRequestTabChange]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = () => {
    setIsVisible(false);
    setTimeout(() => {
        onRequestTabChange('social'); // Reset to default view
        onComplete();
    }, 300);
  };

  if (!isVisible) return null;

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center p-6 pointer-events-none">
      {/* Dimmer */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto"></div>

      {/* Tutorial Card */}
      <div className={`w-full max-w-sm bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl relative z-10 pointer-events-auto transition-all duration-500 animate-in zoom-in-95 fade-in`}>
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? `bg-${themeColor}-500 w-6` : 'bg-slate-700'}`}></div>
            ))}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-${themeColor}-400 to-${themeColor}-600 flex items-center justify-center mb-6 text-white shadow-lg shadow-${themeColor}-500/20`}>
                <StepIcon size={36} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">{STEPS[currentStep].title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">{STEPS[currentStep].desc}</p>

            <div className="flex gap-3 w-full">
                {currentStep < STEPS.length - 1 && (
                    <button 
                        onClick={finishTutorial} 
                        className="flex-1 py-3.5 rounded-xl font-bold text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        Salta
                    </button>
                )}
                
                <button 
                    onClick={handleNext} 
                    className={`flex-[2] py-3.5 rounded-xl font-bold text-slate-950 bg-${themeColor}-500 hover:bg-${themeColor}-400 shadow-lg shadow-${themeColor}-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95`}
                >
                    {currentStep === STEPS.length - 1 ? 'Capito!' : 'Avanti'}
                    {currentStep === STEPS.length - 1 ? <Check size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityTutorialOverlay;
