
import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Dumbbell, Flame, Activity, Zap, Building2, Home, Sparkles } from 'lucide-react';

interface GoalSelectionScreenProps {
  onFinish: (goal: string, experience?: string, equipment?: string, frequency?: number) => void;
}

type Step = 'goal' | 'experience' | 'equipment' | 'frequency';

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  lime: '#C8FF00', coral: '#FF5D3B', amber: '#FFB347', violet: '#A78BFA', sky: '#38BDF8',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

const GOALS = [
  { id: 'muscle',      title: 'Ipertrofia',   sub: 'Massimizza volume e forza muscolare.',     icon: Dumbbell, color: '#C8FF00', tag: 'Più popolare', emoji: '💪' },
  { id: 'definition',  title: 'Definizione',  sub: 'Scolpisci i dettagli, mantieni la massa.', icon: Zap,      color: '#A78BFA', tag: null,           emoji: '⚡' },
  { id: 'weight_loss', title: 'Perdita Peso', sub: 'Brucia calorie ad alta intensità.',        icon: Flame,    color: '#FF5D3B', tag: null,           emoji: '🔥' },
  { id: 'endurance',   title: 'Resistenza',   sub: 'Migliora fiato e stamina cardio.',         icon: Activity, color: '#38BDF8', tag: null,           emoji: '🏃' },
];

const EXPERIENCES = [
  { id: 'beginner',     emoji: '🌱', title: 'Principiante',  sub: 'Meno di 1 anno di allenamento',        detail: 'Piano graduale con progressioni sicure' },
  { id: 'intermediate', emoji: '💪', title: 'Intermedio',    sub: '1–3 anni di allenamento costante',     detail: 'Periodizzazione e volumi moderati' },
  { id: 'advanced',     emoji: '⚡', title: 'Avanzato',      sub: '3+ anni, conosco tecniche avanzate',   detail: 'Volume elevato, tecniche speciali' },
];

const EQUIPMENTS = [
  { id: 'full_gym',   emoji: '🏢', title: 'Palestra Completa', sub: 'Bilancieri, macchine, cavi',            icon: Building2, color: '#C8FF00' },
  { id: 'home_gym',   emoji: '🏠', title: 'Home Gym',          sub: 'Manubri, barra, spazio limitato',       icon: Home,      color: '#A78BFA' },
  { id: 'bodyweight', emoji: '🤸', title: 'Solo Corpo Libero', sub: 'Nessun attrezzo, ovunque',              icon: Sparkles,  color: '#38BDF8' },
];

const FREQ_PLANS: Record<number, { label: string; desc: string }> = {
  2: { label: 'Full Body × 2', desc: 'Riposo abbondante, ideale per iniziare' },
  3: { label: 'Push / Pull / Legs', desc: 'Split classico, ottimo equilibrio' },
  4: { label: 'Upper / Lower × 2', desc: 'Alta frequenza per ogni muscolo' },
  5: { label: '5-Day Split', desc: 'Un muscolo al giorno, massimo volume' },
  6: { label: '6-Day PPL', desc: 'Push Pull Legs × 2, livello elite' },
};

const STEPS: Step[] = ['goal', 'experience', 'equipment', 'frequency'];

const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({ onFinish }) => {
  const [step, setStep] = useState<Step>('goal');
  const [selectedGoal, setSelectedGoal]   = useState('muscle');
  const [experience, setExperience]       = useState('intermediate');
  const [equipment, setEquipment]         = useState('full_gym');
  const [frequency, setFrequency]         = useState(4);

  const stepIdx = STEPS.indexOf(step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step === 'goal')       setStep('experience');
    else if (step === 'experience') setStep('equipment');
    else if (step === 'equipment')  setStep('frequency');
    else onFinish(selectedGoal, experience, equipment, frequency);
  };

  const handleBack = () => {
    if (step === 'experience') setStep('goal');
    else if (step === 'equipment') setStep('experience');
    else if (step === 'frequency') setStep('equipment');
  };

  const titles: Record<Step, { display: string; sub: string; cta: string }> = {
    goal:       { display: 'IL TUO\nOBIETTIVO',  sub: "L'algoritmo calibrerà intensità e volume.", cta: 'CONTINUA' },
    experience: { display: 'IL TUO\nLIVELLO',    sub: 'Adattiamo il piano al tuo punto di partenza.', cta: 'CONTINUA' },
    equipment:  { display: 'LA TUA\nATTREZZATURA', sub: 'Gli esercizi saranno adattati a ciò che hai.', cta: 'CONTINUA' },
    frequency:  { display: 'LA TUA\nFREQUENZA',  sub: 'Quante volte a settimana vuoi allenarti?', cta: 'GENERA IL PIANO' },
  };
  const t = titles[step];

  // ── SHARED SELECTION CARD ──────────────────────────────────────────────────
  const SelectCard = ({
    id, isSelected, onClick, children,
    accentColor = T.lime,
  }: { id: string; isSelected: boolean; onClick: () => void; children: React.ReactNode; accentColor?: string }) => (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? `rgba(${accentColor === T.lime ? '200,255,0' : '167,139,250'},0.08)` : T.bg2,
        border: `1px solid ${isSelected ? accentColor : T.border}`,
        borderRadius: 20, padding: '18px 20px', cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isSelected ? `0 0 24px rgba(${accentColor === T.lime ? '200,255,0' : '167,139,250'},0.08)` : 'none',
      }}
    >
      {children}
    </div>
  );

  const RadioDot = ({ active, color = T.lime }: { active: boolean; color?: string }) => (
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? color : T.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ padding: '56px 24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleBack}
          style={{
            width: 40, height: 40, borderRadius: 14, background: T.bg2,
            border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: T.text,
            opacity: stepIdx === 0 ? 0 : 1, pointerEvents: stepIdx === 0 ? 'none' : 'auto',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 3, background: T.bg3, borderRadius: 100, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', background: T.lime, borderRadius: 100, width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>
            STEP {stepIdx + 1} DI {STEPS.length}
          </span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 24px 8px' }}>
        <h1 style={{ fontFamily: T.display, fontSize: 52, lineHeight: 0.9, color: T.text, whiteSpace: 'pre-line', marginBottom: 8 }}>
          {t.display.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i === 1 ? <span style={{ color: T.lime }}>{line}</span> : line}
              {i === 0 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <p style={{ fontSize: 13, color: T.muted2 }}>{t.sub}</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* GOAL STEP */}
        {step === 'goal' && GOALS.map(goal => {
          const isSelected = selectedGoal === goal.id;
          const Icon = goal.icon;
          return (
            <SelectCard key={goal.id} id={goal.id} isSelected={isSelected} onClick={() => setSelectedGoal(goal.id)} accentColor={goal.color}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
                {goal.tag && (
                  <div style={{ position: 'absolute', top: -8, right: -4, background: `rgba(200,255,0,0.15)`, border: `1px solid rgba(200,255,0,0.3)`, borderRadius: 100, padding: '2px 8px', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.lime }}>
                    {goal.tag}
                  </div>
                )}
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${goal.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} style={{ color: goal.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? goal.color : T.text }}>{goal.title}</div>
                  <div style={{ fontSize: 12, color: T.muted2, marginTop: 2 }}>{goal.sub}</div>
                </div>
                <RadioDot active={isSelected} color={goal.color} />
              </div>
            </SelectCard>
          );
        })}

        {/* EXPERIENCE STEP */}
        {step === 'experience' && EXPERIENCES.map(ex => {
          const isSelected = experience === ex.id;
          return (
            <SelectCard key={ex.id} id={ex.id} isSelected={isSelected} onClick={() => setExperience(ex.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 28 }}>{ex.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{ex.title}</div>
                    <RadioDot active={isSelected} />
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{ex.sub}</div>
                  {isSelected && (
                    <div style={{ marginTop: 8, fontSize: 11, color: T.lime, fontWeight: 600 }}>
                      ✓ {ex.detail}
                    </div>
                  )}
                </div>
              </div>
            </SelectCard>
          );
        })}

        {/* EQUIPMENT STEP */}
        {step === 'equipment' && EQUIPMENTS.map(eq => {
          const isSelected = equipment === eq.id;
          const Icon = eq.icon;
          return (
            <SelectCard key={eq.id} id={eq.id} isSelected={isSelected} onClick={() => setEquipment(eq.id)} accentColor={eq.color}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${eq.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} style={{ color: eq.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{eq.title}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{eq.sub}</div>
                </div>
                <RadioDot active={isSelected} color={eq.color} />
              </div>
            </SelectCard>
          );
        })}

        {/* FREQUENCY STEP */}
        {step === 'frequency' && (
          <>
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>Giorni a settimana</div>
                  <div style={{ fontFamily: T.display, fontSize: 72, color: T.lime, lineHeight: 1 }}>{frequency}</div>
                </div>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(200,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⏱️</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => setFrequency(n)}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 12, border: `1px solid ${n === frequency ? T.lime : T.border}`,
                      background: n === frequency ? `rgba(200,255,0,0.12)` : T.bg3,
                      color: n === frequency ? T.lime : T.muted,
                      fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: T.body,
                      transition: 'all 0.2s',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {FREQ_PLANS[frequency] && (
              <div style={{ background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', borderRadius: 16, padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.lime, marginBottom: 4 }}>📋 {FREQ_PLANS[frequency].label}</div>
                <div style={{ fontSize: 12, color: T.muted2 }}>{FREQ_PLANS[frequency].desc}</div>
              </div>
            )}

            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.5 }}>
                💡 Potrai sempre modificare i giorni di allenamento dal tuo profilo.
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px 24px 36px', background: `linear-gradient(to top, ${T.bg} 70%, transparent)` }}>
        <button
          onClick={handleNext}
          style={{
            width: '100%', background: T.lime, color: '#000', border: 'none',
            borderRadius: 16, padding: '17px', fontSize: 14, fontWeight: 800,
            letterSpacing: '0.08em', cursor: 'pointer', fontFamily: T.body,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 24px rgba(200,255,0,0.25)',
          }}
        >
          {t.cta} <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default GoalSelectionScreen;
