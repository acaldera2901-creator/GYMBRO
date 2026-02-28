
import React, { useState, useLayoutEffect, useRef } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

export interface Step {
  targetId: string;
  title: string;
  desc: string;
  position?: 'top' | 'bottom';
}

interface CoachMarksProps {
  steps: Step[];
  onComplete: () => void;
  themeColor: string;
}

const CoachMarks: React.FC<CoachMarksProps> = ({ steps, onComplete, themeColor }) => {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Calcola la posizione dell'elemento target
  const updateRect = () => {
    const element = document.getElementById(steps[index].targetId);
    if (element) {
      const r = element.getBoundingClientRect();
      // Check visibility to avoid computing invisible elements
      if (r.width === 0 && r.height === 0) return;

      setRect({
        ...r,
        top: r.top - 8,
        left: r.left - 8,
        width: r.width + 16,
        height: r.height + 16,
        bottom: r.bottom + 8,
        right: r.right + 8,
        x: r.x - 8,
        y: r.y - 8,
        toJSON: () => {}
      });
    }
  };

  useLayoutEffect(() => {
    updateRect();
    
    // Use ResizeObserver instead of window.resize for better performance
    observerRef.current = new ResizeObserver(() => {
        // Debounce simple via requestAnimationFrame
        window.requestAnimationFrame(updateRect);
    });
    
    observerRef.current.observe(document.body);

    return () => {
        if(observerRef.current) observerRef.current.disconnect();
    };
  }, [index]);

  const handleNext = () => {
    if (index < steps.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!rect) return null;

  const currentStep = steps[index];
  const isLast = index === steps.length - 1;

  const tooltipStyle: React.CSSProperties = currentStep.position === 'top' 
    ? { bottom: window.innerHeight - rect.top + 20, left: 20, right: 20 }
    : { top: rect.bottom + 20, left: 20, right: 20 };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto touch-none">
      
      {/* SPOTLIGHT CUTOUT LAYER */}
      <div 
        className="absolute rounded-2xl transition-all duration-500 ease-in-out shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] border-2 border-white/20"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      >
        <div className={`absolute inset-0 rounded-2xl border-2 border-${themeColor}-500 opacity-50 animate-ping`}></div>
      </div>

      {/* TOOLTIP CARD */}
      <div 
        className="absolute flex flex-col items-start animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={tooltipStyle}
      >
        <div className="w-full max-w-sm mx-auto bg-[#1c1c1e] border border-white/10 rounded-2xl p-5 shadow-2xl relative">
            <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1c1c1e] rotate-45 border-l border-t border-white/10 ${currentStep.position === 'top' ? '-bottom-2 border-l-0 border-t-0 border-r border-b' : '-top-2'}`}></div>

            <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
                <span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">
                    {index + 1} / {steps.length}
                </span>
            </div>
            
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                {currentStep.desc}
            </p>

            <div className="flex gap-3 relative z-10">
                <button 
                    onClick={onComplete}
                    className="flex-1 py-3 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors text-xs"
                >
                    Salta
                </button>
                <button 
                    onClick={handleNext}
                    className={`flex-[2] py-3 rounded-xl font-bold text-slate-950 bg-${themeColor}-500 flex items-center justify-center gap-2 shadow-lg shadow-${themeColor}-500/20 active:scale-95 transition-transform text-sm`}
                >
                    {isLast ? 'Finito' : 'Avanti'}
                    {isLast ? <Check size={16} /> : <ArrowRight size={16} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CoachMarks;
