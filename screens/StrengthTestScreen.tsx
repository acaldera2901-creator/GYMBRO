import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Info, ChevronUp, ChevronDown } from 'lucide-react';

interface StrengthTestScreenProps {
  onNext: (data: {
    testExercise: string;
    testWeight: string;
    testReps: string;
    knownMaxes: { bench: number | null; squat: number | null; deadlift: number | null };
  }) => void;
  themeColor?: string;
}

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D', bg4: '#1E1E27',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  lime: '#C8FF00', coral: '#FF5D3B', amber: '#FFB347', sky: '#38BDF8',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif", mono: "'DM Mono', monospace",
};

const brzycki = (w: number, r: number): number => {
  if (r <= 0 || w <= 0) return 0;
  if (r === 1) return w;
  return Math.round((w / (1.0278 - 0.0278 * r)) / 2.5) * 2.5;
};

const LEVELS = {
  bench:    [{ label: 'Principiante', min: 0, max: 60, color: '#6b7280' },{ label: 'Intermedio', min: 60, max: 100, color: '#38BDF8' },{ label: 'Avanzato', min: 100, max: 140, color: '#A78BFA' },{ label: 'Elite', min: 140, max: 9999, color: '#FFB347' }],
  squat:    [{ label: 'Principiante', min: 0, max: 80, color: '#6b7280' },{ label: 'Intermedio', min: 80, max: 130, color: '#38BDF8' },{ label: 'Avanzato', min: 130, max: 180, color: '#A78BFA' },{ label: 'Elite', min: 180, max: 9999, color: '#FFB347' }],
  deadlift: [{ label: 'Principiante', min: 0, max: 100, color: '#6b7280' },{ label: 'Intermedio', min: 100, max: 160, color: '#38BDF8' },{ label: 'Avanzato', min: 160, max: 220, color: '#A78BFA' },{ label: 'Elite', min: 220, max: 9999, color: '#FFB347' }],
};
type ExKey = 'bench' | 'squat' | 'deadlift';

const getLevel = (key: ExKey, rm: number) => LEVELS[key].find(l => rm >= l.min && rm < l.max) || LEVELS[key][LEVELS[key].length - 1];
const getLevelPct = (key: ExKey, rm: number) => {
  const lvls = LEVELS[key];
  const idx = lvls.findIndex(l => rm >= l.min && rm < l.max);
  if (idx === -1) return 100;
  const l = lvls[idx];
  return l.max === 9999 ? 100 : Math.min(100, ((rm - l.min) / (l.max - l.min)) * 100);
};

const EXERCISES = [
  { key: 'bench'    as ExKey, emoji: '🏋️', name: 'Panca Piana',    desc: 'Busto superiore', tip: 'Presa larga, schiena arcuata naturale' },
  { key: 'squat'    as ExKey, emoji: '🦵', name: 'Squat',           desc: 'Gambe & Glutei',  tip: 'Scendi sotto il parallelo per il massimo risultato' },
  { key: 'deadlift' as ExKey, emoji: '⚡', name: 'Stacco da Terra', desc: 'Schiena & Core',  tip: 'Schiena dritta, spingi il pavimento verso il basso' },
];

const DEFAULTS: Record<ExKey, { w: number; r: number }> = {
  bench: { w: 60, r: 8 }, squat: { w: 80, r: 8 }, deadlift: { w: 100, r: 5 },
};

interface SlotState { active: boolean; weightStr: string; repsStr: string; }

const StrengthTestScreen: React.FC<StrengthTestScreenProps> = ({ onNext, themeColor = 'emerald' }) => {
  const isRose = themeColor === 'rose';
  const accent = isRose ? T.coral : T.lime;

  const [slots, setSlots] = useState<Record<ExKey, SlotState>>({
    bench:    { active: false, weightStr: String(DEFAULTS.bench.w),    repsStr: String(DEFAULTS.bench.r) },
    squat:    { active: false, weightStr: String(DEFAULTS.squat.w),    repsStr: String(DEFAULTS.squat.r) },
    deadlift: { active: false, weightStr: String(DEFAULTS.deadlift.w), repsStr: String(DEFAULTS.deadlift.r) },
  });
  const [expanded, setExpanded] = useState<ExKey | null>(null);

  const getW = (k: ExKey) => parseFloat(slots[k].weightStr) || DEFAULTS[k].w;
  const getR = (k: ExKey) => parseInt(slots[k].repsStr)     || DEFAULTS[k].r;
  const setW = (k: ExKey, v: string) => setSlots(p => ({ ...p, [k]: { ...p[k], weightStr: v } }));
  const setR = (k: ExKey, v: string) => setSlots(p => ({ ...p, [k]: { ...p[k], repsStr: v } }));
  const adjW = (k: ExKey, d: number) => setW(k, String(Math.max(2.5, Math.min(500, Math.round((getW(k) + d) / 2.5) * 2.5))));
  const adjR = (k: ExKey, d: number) => setR(k, String(Math.max(1,   Math.min(30,  getR(k) + d))));

  const activate = (k: ExKey) => {
    setSlots(p => ({ ...p, [k]: { ...p[k], active: true } }));
    setExpanded(k);
  };
  const deactivate = (k: ExKey) => {
    setSlots(p => ({ ...p, [k]: { active: false, weightStr: String(DEFAULTS[k].w), repsStr: String(DEFAULTS[k].r) } }));
    if (expanded === k) setExpanded(null);
  };

  const activeCount = Object.values(slots).filter(s => s.active).length;

  const handleContinue = () => {
    const primary = EXERCISES.find(e => slots[e.key].active);
    if (!primary) return;
    const s = slots[primary.key];
    const knownMaxes: Record<ExKey, number | null> = {
      bench:    slots.bench.active    ? brzycki(getW('bench'),    getR('bench'))    : null,
      squat:    slots.squat.active    ? brzycki(getW('squat'),    getR('squat'))    : null,
      deadlift: slots.deadlift.active ? brzycki(getW('deadlift'), getR('deadlift')) : null,
    };
    onNext({ testExercise: primary.name, testWeight: s.weightStr, testReps: s.repsStr, knownMaxes });
  };

  const card: React.CSSProperties = { background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22 };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ padding: '56px 24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, opacity: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 3, background: T.bg3, borderRadius: 100, marginBottom: 6 }}>
            <div style={{ height: '100%', background: accent, borderRadius: 100, width: '66%', transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>STEP 4 DI 6</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 24px 8px' }}>
        <h1 style={{ fontFamily: T.display, fontSize: 52, lineHeight: 0.9, marginBottom: 8 }}>
          TEST DI<br /><span style={{ color: accent }}>FORZA</span>
        </h1>
        <p style={{ fontSize: 13, color: T.muted2 }}>Aggiungi i massimali che conosci. Gli altri verranno stimati automaticamente.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 120px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {EXERCISES.map(({ key, emoji, name, desc, tip }) => {
          const s = slots[key];
          const isActive = s.active;
          const isExp = expanded === key;
          const oneRM = isActive ? brzycki(getW(key), getR(key)) : null;
          const level = oneRM ? getLevel(key, oneRM) : null;
          const pct = oneRM ? getLevelPct(key, oneRM) : 0;

          return (
            <div key={key} style={{ ...card, overflow: 'hidden', border: `1px solid ${isActive ? `${accent}35` : T.border}`, background: isActive ? `rgba(${accent === T.lime ? '200,255,0' : '255,93,59'},0.04)` : T.bg2 }}>
              {/* Header row */}
              <div
                onClick={() => isActive ? setExpanded(isExp ? null : key) : activate(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, background: isActive ? `${accent}15` : T.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>
                  {emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: isActive ? accent : T.text }}>{name}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{desc}</div>
                </div>

                {isActive ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {oneRM && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: T.display, fontSize: 22, color: accent, lineHeight: 1 }}>{oneRM}<span style={{ fontSize: 10, color: T.muted }}>kg</span></div>
                        {level && <div style={{ fontSize: 9, fontWeight: 700, color: level.color }}>{level.label}</div>}
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deactivate(key); }}
                      style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,93,59,0.1)', border: '1px solid rgba(255,93,59,0.2)', color: T.coral, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
                    >×</button>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, fontWeight: 700, color: accent, background: `${accent}12`, border: `1px solid ${accent}25`, borderRadius: 100, padding: '5px 12px' }}>+ Aggiungi</div>
                )}
              </div>

              {/* Level bar (collapsed but active) */}
              {isActive && !isExp && oneRM && level && (
                <div style={{ padding: '0 18px 14px' }}>
                  <div style={{ height: 3, background: T.bg4, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: level.color, width: `${pct}%`, borderRadius: 100, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )}

              {/* Expanded panel */}
              {isActive && isExp && (
                <div style={{ padding: '0 18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ height: 1, background: T.border }} />

                  {/* Tip */}
                  <div style={{ display: 'flex', gap: 10, background: T.bg3, borderRadius: 12, padding: '10px 14px' }}>
                    <Info size={13} style={{ color: T.muted, flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{tip}</span>
                  </div>

                  {/* Weight input */}
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Carico Sollevato</div>
                    <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 16, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <button onClick={() => adjW(key, -2.5)} style={{ width: 56, height: 56, border: 'none', background: 'transparent', color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronDown size={20} /></button>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                        <input type="number" value={s.weightStr} onChange={e => setW(key, e.target.value)} onBlur={() => { const v = parseFloat(s.weightStr); if (isNaN(v) || v <= 0) setW(key, String(DEFAULTS[key].w)); else setW(key, String(Math.max(2.5, Math.round(v / 2.5) * 2.5))); }} style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: T.display, fontSize: 36, color: T.text, width: 80, textAlign: 'center' }} inputMode="decimal" />
                        <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>kg</span>
                      </div>
                      <button onClick={() => adjW(key, 2.5)} style={{ width: 56, height: 56, border: 'none', background: accent, color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronUp size={20} /></button>
                    </div>
                  </div>

                  {/* Reps input */}
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Ripetizioni Consecutive</div>
                    <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 16, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <button onClick={() => adjR(key, -1)} style={{ width: 56, height: 56, border: 'none', background: 'transparent', color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronDown size={20} /></button>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                        <input type="number" value={s.repsStr} onChange={e => setR(key, e.target.value)} onBlur={() => { const v = parseInt(s.repsStr); if (isNaN(v) || v < 1) setR(key, String(DEFAULTS[key].r)); else setR(key, String(Math.min(30, Math.max(1, v)))); }} style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: T.display, fontSize: 36, color: T.text, width: 80, textAlign: 'center' }} inputMode="numeric" />
                        <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>reps</span>
                      </div>
                      <button onClick={() => adjR(key, 1)} style={{ width: 56, height: 56, border: 'none', background: accent, color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronUp size={20} /></button>
                    </div>
                  </div>

                  {/* 1RM result */}
                  {oneRM && level && (
                    <div style={{ background: T.bg4, border: `1px solid ${T.border2}`, borderRadius: 16, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>Massimale Stimato (Brzycki)</div>
                          <div style={{ fontFamily: T.display, fontSize: 40, color: accent, lineHeight: 1 }}>{oneRM}<span style={{ fontSize: 14, color: T.muted, marginLeft: 4 }}>kg</span></div>
                          <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{getW(key)}kg × {getR(key)} reps</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>Livello</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: level.color }}>{level.label}</div>
                        </div>
                      </div>
                      <div style={{ height: 4, background: T.bg2, borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: level.color, width: `${pct}%`, borderRadius: 100, transition: 'width 0.5s', boxShadow: `0 0 8px ${level.color}60` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 9, color: T.muted }}>Prossimo livello</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: level.color }}>{Math.round(pct)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Summary */}
        {activeCount > 0 && (
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>RIEPILOGO CALCOLATO</div>
            {EXERCISES.map(({ key, emoji, name }) => {
              const s = slots[key];
              const val = s.active ? brzycki(getW(key), getR(key)) : null;
              const isEst = !s.active;
              let estimated = 0;
              if (isEst) {
                const b  = slots.bench.active    ? brzycki(getW('bench'),    getR('bench'))    : null;
                const sq = slots.squat.active    ? brzycki(getW('squat'),    getR('squat'))    : null;
                const dl = slots.deadlift.active ? brzycki(getW('deadlift'), getR('deadlift')) : null;
                if (key === 'bench')    estimated = sq ? Math.round(sq / 1.35 / 2.5) * 2.5 : dl ? Math.round(dl / 1.6 / 2.5) * 2.5 : 0;
                if (key === 'squat')   estimated = b  ? Math.round(b  * 1.35 / 2.5) * 2.5 : dl ? Math.round(dl / 1.6 * 1.35 / 2.5) * 2.5 : 0;
                if (key === 'deadlift')estimated = b  ? Math.round(b  * 1.6 / 2.5) * 2.5  : sq ? Math.round(sq / 1.35 * 1.6 / 2.5) * 2.5 : 0;
              }
              const display = val || estimated;
              const lvl = display > 0 ? getLevel(key, display) : null;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{emoji}</span>
                    <span style={{ fontSize: 13, color: T.muted2 }}>{name}</span>
                    {isEst && display > 0 && <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', background: T.bg3, color: T.muted, padding: '2px 6px', borderRadius: 5 }}>STIMA</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {lvl && <span style={{ fontSize: 10, fontWeight: 700, color: lvl.color }}>{lvl.label}</span>}
                    <span style={{ fontFamily: T.display, fontSize: 20, color: s.active ? accent : T.muted }}>{display > 0 ? `${display}` : '—'}<span style={{ fontSize: 10, color: T.muted }}>{display > 0 ? 'kg' : ''}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info note */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Info size={13} style={{ color: T.muted, flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>I livelli sono basati su standard internazionali. Puoi aggiornare i massimali dal profilo in qualsiasi momento.</span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px 24px 36px', background: `linear-gradient(to top, ${T.bg} 70%, transparent)` }}>
        {activeCount > 0 && (
          <div style={{ textAlign: 'center', fontSize: 11, color: T.muted, marginBottom: 10 }}>
            {activeCount === 3 ? '🎯 Tutti i massimali inseriti!' : `${3 - activeCount} massimal${3 - activeCount !== 1 ? 'i' : 'e'} stimat${3 - activeCount !== 1 ? 'i' : 'o'} automaticamente`}
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={activeCount === 0}
          style={{ width: '100%', background: activeCount > 0 ? accent : T.bg3, color: activeCount > 0 ? '#000' : T.muted, border: 'none', borderRadius: 16, padding: '17px', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', cursor: activeCount > 0 ? 'pointer' : 'not-allowed', fontFamily: T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: activeCount > 0 ? `0 4px 24px ${accent}25` : 'none', opacity: activeCount === 0 ? 0.4 : 1 }}
        >
          {activeCount === 0 ? 'Aggiungi almeno un massimale' : 'GENERA PIANO'}
          {activeCount > 0 && <ArrowRight size={20} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
};

export default StrengthTestScreen;
