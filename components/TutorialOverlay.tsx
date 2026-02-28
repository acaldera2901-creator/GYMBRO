
import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Sparkles, Calendar, Users, BarChart2, Dumbbell } from 'lucide-react';
import { ScreenName } from '../types';

interface TutorialOverlayProps {
  onComplete: () => void;
  onRequestNavigation: (screen: ScreenName) => void;
  themeColor: string;
}

const STEPS = [
  {
    title: "Benvenuto in GymBro",
    desc: "L'app definitiva per trasformare il tuo corpo. Facciamo un rapido tour per mostrarti i superpoteri che hai a disposizione.",
    screen: 'home' as ScreenName,
    icon: Sparkles
  },
  {
    title: "La tua Dashboard",
    desc: "Qui trovi il riepilogo giornaliero, le statistiche vitali e l'accesso rapido al tuo prossimo allenamento. Scorri le schede per scegliere cosa fare oggi.",
    screen: 'home' as ScreenName,
    icon: BarChart2
  },
  {
    title: "Il tuo Calendario",
    desc: "Pianifica la settimana. Vedi i giorni di allenamento, sposta le sessioni e visualizza i tuoi 'Workout Memories' completati.",
    screen: 'calendar' as ScreenName,
    icon: Calendar
  },
  {
    title: "Community & Arena",
    desc: "Condividi i progressi nel Feed Social o entra nell'Arena per sfidare altri utenti e scalare la classifica globale.",
    screen: 'community' as ScreenName,
    icon: Users
  },
  {
    title: "Allenamento Guidato",
    desc: "Quando avvii un workout, ti guideremo set dopo set. Cronometro integrato, calcolo recuperi e tracker dei carichi.",
    screen: 'workout' as ScreenName,
    icon: Dumbbell
  }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onRequestNavigation, themeColor }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Trigger navigation when step changes
  useEffect(() => {
    const targetScreen = STEPS[currentStep].screen;
    onRequestNavigation(targetScreen);
  }, [currentStep, onRequestNavigation]);

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
        onRequestNavigation('home'); // Reset to home
        onComplete();
    }, 300);
  };

  if (!isVisible) return null;

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center pb-24 sm:pb-0 pointer-events-none">
      {/* Background Dimmer with Blur hole logic is hard, using simple dim */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto"></div>

      {/* Tutorial Card */}
      <div className={`w-[90%] max-w-sm bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl relative z-10 pointer-events-auto transition-all duration-500 animate-in slide-in-from-bottom-10 fade-in`}>
        
        {/* Progress Bar */}
        <div className="flex gap-1 mb-6">
            {STEPS.map((_, idx) => (
                <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx <= currentStep ? `bg-${themeColor}-500` : 'bg-slate-700'}`}></div>
            ))}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl bg-${themeColor}-500/10 flex items-center justify-center mb-4 text-${themeColor}-500 border border-${themeColor}-500/20`}>
                <StepIcon size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{STEPS[currentStep].title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 h-16">{STEPS[currentStep].desc}</p>

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
                    {currentStep === STEPS.length - 1 ? 'Iniziamo!' : 'Avanti'}
                    {currentStep === STEPS.length - 1 ? <Check size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
