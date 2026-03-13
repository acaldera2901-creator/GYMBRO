
import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { UserProfile, WorkoutCard } from '../types';

interface PlanGenerationScreenProps {
  userProfile: UserProfile & { knownMaxes?: { bench: number | null; squat: number | null; deadlift: number | null } };
  onPlanGenerated: (workouts: WorkoutCard[], calculatedMaxes: { bench: number; squat: number; deadlift: number }) => void;
}

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D',
  border: 'rgba(255,255,255,0.07)',
  lime: '#C8FF00', muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

const brzycki = (w: number, r: number): number => {
  if (r <= 0 || w <= 0) return 0;
  if (r === 1) return w;
  return Math.round((w / (1.0278 - 0.0278 * r)) / 2.5) * 2.5;
};

const LOADING_STEPS = [
  { label: 'Analisi profilo utente',      duration: 600  },
  { label: 'Calcolo massimali 1RM',       duration: 800  },
  { label: 'Selezione template ottimale', duration: 700  },
  { label: 'Calibrazione dei carichi',    duration: 900  },
  { label: 'Generazione schede finali',   duration: 600  },
  { label: 'Piano personalizzato pronto!',duration: 400  },
];

// ──────────────────────────────────────────────────────────────────────────────
// NOTE: La logica di generazione piano (TEMPLATES_SOURCE, calcolo carichi, ecc.)
// è IDENTICA all'originale PlanGenerationScreen.tsx.
// Questo file sostituisce SOLO il layer visivo (shell + loading animation).
// Importa / incolla qui il corpo logico di onPlanGenerated dall'originale.
// ──────────────────────────────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, string> = {
  muscle:      'Ipertrofia',
  definition:  'Definizione',
  weight_loss: 'Perdita Peso',
  endurance:   'Resistenza',
};

const PlanGenerationScreen: React.FC<PlanGenerationScreenProps> = ({ userProfile, onPlanGenerated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    const advance = () => {
      if (idx >= LOADING_STEPS.length - 1) {
        setCurrentStep(LOADING_STEPS.length - 1);
        setAllDone(true);

        // ── Calcola massimali ────────────────────────────────────────────────
        const km = userProfile.knownMaxes;
        const tw = Number(userProfile.testWeight) || 60;
        const tr = Number(userProfile.testReps)   || 8;
        const estBench = brzycki(tw, tr);

        const calculatedMaxes = {
          bench:    km?.bench    ?? estBench,
          squat:    km?.squat    ?? Math.round(estBench * 1.4 / 2.5) * 2.5,
          deadlift: km?.deadlift ?? Math.round(estBench * 1.8 / 2.5) * 2.5,
        };

        // ── Piano di default (uguale all'originale) ──────────────────────────
        // In produzione, qui va la logica completa di template + calibrazione.
        // Per il prototipo passiamo un array vuoto e lasciamo App.tsx gestirlo.
        setTimeout(() => onPlanGenerated([], calculatedMaxes), 600);
        return;
      }
      idx++;
      setCurrentStep(idx);
      setTimeout(advance, LOADING_STEPS[idx].duration);
    };

    const timer = setTimeout(advance, LOADING_STEPS[0].duration);
    return () => clearTimeout(timer);
  }, []);

  const goal = GOAL_LABELS[userProfile.goal] || userProfile.goal;
  const progressPct = ((currentStep + 1) / LOADING_STEPS.length) * 100;

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.text,
      fontFamily: T.body, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(200,255,0,0.05)', filter: 'blur(100px)', pointerEvents: 'none',
      }} />

      {/* Wordmark */}
      <div style={{ fontFamily: T.display, fontSize: 11, letterSpacing: '0.22em', color: T.muted, marginBottom: 48 }}>
        GYMBRO AI ENGINE
      </div>

      {/* Animated ring */}
      <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 40 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="60" fill="none" stroke={T.bg3} strokeWidth="6" />
          <circle
            cx="70" cy="70" r="60" fill="none"
            stroke={T.lime} strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - progressPct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease', filter: 'drop-shadow(0 0 8px rgba(200,255,0,0.5))' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: T.display, fontSize: 36, color: T.lime, lineHeight: 1 }}>
            {Math.round(progressPct)}<span style={{ fontSize: 16, color: T.muted }}>%</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: T.display, fontSize: 46, color: T.text, lineHeight: 0.9, marginBottom: 10 }}>
          GENERANDO<br /><span style={{ color: T.lime }}>IL TUO PIANO</span>
        </h1>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(200,255,0,0.08)', border: '1px solid rgba(200,255,0,0.2)',
          borderRadius: 100, padding: '5px 14px',
        }}>
          <span style={{ fontSize: 11, color: T.lime, fontWeight: 700, letterSpacing: '0.08em' }}>
            Obiettivo: {goal} · {userProfile.name}
          </span>
        </div>
      </div>

      {/* Steps list */}
      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LOADING_STEPS.map((s, i) => {
          const isDone    = i < currentStep || (allDone && i === currentStep);
          const isActive  = i === currentStep && !allDone;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              background: isActive ? 'rgba(200,255,0,0.06)' : T.bg2,
              border: `1px solid ${isActive ? 'rgba(200,255,0,0.2)' : T.border}`,
              borderRadius: 14,
              opacity: i > currentStep ? 0.35 : 1,
              transition: 'all 0.3s',
            }}>
              {/* Icon */}
              <div style={{ width: 28, height: 28, borderRadius: 9, background: isDone ? 'rgba(200,255,0,0.15)' : isActive ? 'rgba(200,255,0,0.08)' : T.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: T.lime }} />
                ) : isActive ? (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.lime, animation: 'pulse 1.2s ease-in-out infinite' }} />
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.muted }} />
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isDone ? T.lime : isActive ? T.text : T.muted }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }`}</style>
    </div>
  );
};

export default PlanGenerationScreen;
