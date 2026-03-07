import React, { useState, useEffect } from 'react';
import {
  X, ArrowRight, Check, Dumbbell, Calendar,
  BarChart2, Zap, Play, Trophy, ChevronRight, Flame
} from 'lucide-react';
import { WorkoutCard, UserProfile, UserStats } from '../types';
import { getWorkoutImage } from '../lib/workoutImages';


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
  userProfile?: UserProfile;
  userStats?: UserStats;
  generatedWorkouts?: WorkoutCard[];
  workoutSchedule?: Record<string, WorkoutCard[]>;
}

// ── Mini Visuals ────────────────────────────────────────────────────────────────

const DashboardVisual: React.FC<{ accent: string; profile?: UserProfile; stats?: UserStats }> = ({ accent, profile, stats }) => {
  const name = profile?.name?.split(' ')[0] || 'Atleta';
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/8">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0" style={{ backgroundColor: `${accent}25`, color: accent }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-black text-sm">{name}</p>
          <p className="text-zinc-500 text-[10px]">{profile?.goal || 'muscle'} · {profile?.weight || 75}kg</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] text-zinc-600 font-bold">Streak</p>
          <p className="font-black text-base" style={{ color: accent }}>{stats?.streak || 0}🔥</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: stats?.workoutsCompleted || 0, l: 'Workout', icon: '💪' },
          { v: stats?.streak || 0, l: 'Streak', icon: '🔥' },
          { v: `${Math.floor((stats?.activeMinutes || 0) / 60)}h`, l: 'Attivo', icon: '⏱️' },
        ].map(s => (
          <div key={s.l} className="bg-white/5 border border-white/8 rounded-xl p-2.5 text-center">
            <div className="text-lg leading-none">{s.icon}</div>
            <div className="text-white font-black text-sm mt-1">{s.v}</div>
            <div className="text-zinc-600 text-[9px] font-bold uppercase">{s.l}</div>
          </div>
        ))}
      </div>
      {stats?.maxes && (
        <div className="bg-white/5 border border-white/8 rounded-xl p-3">
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">Massimali 1RM</p>
          {[
            { l: 'Panca', v: stats.maxes.bench || 0, max: 200 },
            { l: 'Squat', v: stats.maxes.squat || 0, max: 260 },
            { l: 'Stacco', v: stats.maxes.deadlift || 0, max: 300 },
          ].map(m => (
            <div key={m.l} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <span className="text-zinc-500 text-[10px] w-9">{m.l}</span>
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (m.v / m.max) * 100)}%`, backgroundColor: accent }} />
              </div>
              <span className="text-white text-xs font-black w-10 text-right">{m.v}<span className="text-zinc-600 text-[9px]">kg</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PlanVisual: React.FC<{ accent: string; workouts?: WorkoutCard[]; schedule?: Record<string, WorkoutCard[]> }> = ({ accent, workouts, schedule }) => {
  // Find next 3 scheduled workouts
  const today = new Date();
  const upcoming: Array<{ day: string; dayNum: number; workout: WorkoutCard; isToday: boolean }> = [];
  for (let i = 0; i < 14 && upcoming.length < 3; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const ws = schedule?.[key];
    if (ws && ws.length > 0) {
      const days = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
      upcoming.push({ day: days[d.getDay()], dayNum: d.getDate(), workout: ws[0], isToday: i === 0 });
    }
  }
  // Fallback if no schedule yet
  const items = upcoming.length > 0 ? upcoming : (workouts || []).slice(0, 3).map((w, i) => ({
    day: ['Lun','Mer','Ven'][i], dayNum: new Date().getDate() + i * 2, workout: w, isToday: i === 0
  }));

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.isToday ? 'border-white/20 bg-white/8' : 'border-white/6 bg-white/3'}`}>
          <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-[9px] font-black`}
            style={item.isToday ? { backgroundColor: `${accent}25`, color: accent } : { backgroundColor: '#1f1f23', color: '#52525b' }}>
            <span>{item.day}</span>
            <span className="text-sm">{item.dayNum}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-xs truncate">{item.workout.title}</p>
            <p className="text-zinc-500 text-[10px] mt-0.5">{item.workout.category} · {item.workout.exercises?.length || 0} esercizi</p>
          </div>
          {item.isToday && (
            <span className="shrink-0 text-[9px] font-black uppercase px-2 py-1 rounded-lg" style={{ backgroundColor: `${accent}20`, color: accent }}>Oggi</span>
          )}
        </div>
      ))}
    </div>
  );
};

const LibraryVisual: React.FC<{ accent: string; workouts?: WorkoutCard[] }> = ({ accent, workouts }) => {
  const catColors: Record<string, string> = { 'Massa': '#10b981', 'Definizione': '#8b5cf6', 'Perdita Peso': '#f97316', 'Resistenza': '#3b82f6', 'Custom': '#a855f7' };
  const items = (workouts || []).slice(0, 3);
  return (
    <div className="space-y-2">
      {items.map((w, i) => {
        const c = catColors[w.category] || accent;
        return (
          <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <img src={getWorkoutImage(w)} alt={w.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-xs truncate">{w.title}</p>
              <p className="text-[10px] mt-0.5" style={{ color: c }}>{w.category}<span className="text-zinc-500"> · {w.exercises?.length || 0} esercizi</span></p>
            </div>
            <ChevronRight size={13} className="text-zinc-700 shrink-0" />
          </div>
        );
      })}
      {(workouts?.length || 0) > 3 && (
        <p className="text-center text-zinc-600 text-[10px] font-bold pt-1">+{(workouts?.length || 0) - 3} altre schede disponibili</p>
      )}
    </div>
  );
};

const SessionVisual: React.FC<{ accent: string }> = ({ accent }) => (
  <div className="space-y-2">
    <div className="flex gap-2">
      <div className="flex-1 bg-white/5 border border-white/8 rounded-xl p-3 text-center">
        <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-wide">Durata</p>
        <p className="text-white font-black text-2xl">32:14</p>
      </div>
      <div className="flex-1 border rounded-xl p-3 text-center" style={{ backgroundColor: `${accent}12`, borderColor: `${accent}30` }}>
        <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: accent }}>Recupero</p>
        <p className="text-white font-black text-2xl">0:45</p>
      </div>
    </div>
    <div className="bg-white/8 border border-white/15 rounded-xl p-3">
      <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>Esercizio attuale</p>
      <p className="text-white font-bold text-sm">Panca Piana Bilanciere</p>
      <div className="flex gap-1.5 mt-2">
        {[1,2,3,4].map(s => <div key={s} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: s <= 2 ? accent : '#27272a' }} />)}
      </div>
      <p className="text-zinc-600 text-[10px] mt-1.5">Serie 3 / 4 · 6–8 reps · 80kg</p>
    </div>
    <div className="flex gap-2">
      {['Foto workout', 'Peso custom', 'Note set'].map(f => (
        <div key={f} className="flex-1 bg-white/3 border border-white/6 rounded-lg p-2 text-center">
          <p className="text-zinc-600 text-[9px] font-bold">{f}</p>
        </div>
      ))}
    </div>
  </div>
);

const BadgesVisual: React.FC<{ accent: string }> = ({ accent }) => (
  <div className="space-y-2.5">
    <div className="bg-white/5 border border-white/8 rounded-xl p-3">
      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">Classifica Globale</p>
      {[
        { rank: 1, name: 'Marco R.', wo: 48, medal: '🥇' },
        { rank: 2, name: 'Luca F.', wo: 41, medal: '🥈' },
        { rank: 3, name: 'Tu', wo: 12, medal: '🥉', isUser: true },
      ].map(e => (
        <div key={e.rank} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg ${e.isUser ? '' : ''}`}
          style={e.isUser ? { backgroundColor: `${accent}15` } : {}}>
          <span className="text-sm">{e.medal}</span>
          <span className={`flex-1 text-xs font-bold ${e.isUser ? 'text-white' : 'text-zinc-400'}`}>{e.name}</span>
          <span className="text-zinc-500 text-[10px] font-bold">{e.wo} WO</span>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-4 gap-2">
      {[
        { icon: '🥉', t: 'Primo Passo', c: '#b45309' },
        { icon: '🔥', t: 'On Fire', c: '#f97316' },
        { icon: '⚔️', t: 'Sfidante', c: '#9ca3af' },
        { icon: '🏆', t: 'Campione', c: '#3f3f46', locked: true },
      ].map(b => (
        <div key={b.t} className={`rounded-xl p-2 text-center border ${b.locked ? 'border-zinc-800/50 opacity-40 bg-zinc-900/40' : 'border-zinc-700/50'}`}
          style={!b.locked ? { backgroundColor: `${b.c}18` } : {}}>
          <div className="text-xl leading-none">{b.icon}</div>
          <p className="text-[8px] text-zinc-400 mt-1 font-bold leading-tight">{b.t}</p>
        </div>
      ))}
    </div>
  </div>
);

// ── Slide Definitions ────────────────────────────────────────────────────────────

const FEATURE_SLIDES = [
  {
    id: 'dashboard',
    icon: BarChart2,
    tag: 'DASHBOARD & PROFILO',
    title: 'Il tuo centro\ndi controllo',
    desc: 'Streak, massimali, kg sollevati — tutto calibrato sui tuoi dati reali. La tua evoluzione sempre davanti a te.',
    visual: 'dashboard' as const,
    highlights: ['Stats in tempo reale', 'Massimali 1RM', 'Storico allenamenti'],
  },
  {
    id: 'plan',
    icon: Zap,
    tag: 'PIANO PERSONALIZZATO',
    title: 'Il tuo programma\nè già pronto',
    desc: 'Abbiamo costruito le schede su peso, obiettivo e test di forza che hai fatto. Ogni sessione è calibrata su di te.',
    visual: 'plan' as const,
    highlights: ['Generato dai tuoi dati', 'Giorni già programmati', 'Auto-aggiornante'],
  },
  {
    id: 'library',
    icon: Dumbbell,
    tag: 'LIBRERIA ALLENAMENTI',
    title: '20 schede\npronti all\'uso',
    desc: 'Massa, Definizione, Perdita Peso, Resistenza. Ogni scheda con serie, reps e recuperi ottimizzati. Oppure crea le tue.',
    visual: 'library' as const,
    highlights: ['4 categorie', 'Foto per ogni scheda', 'Crea schede custom'],
  },
  {
    id: 'session',
    icon: Play,
    tag: 'SESSIONE GUIDATA',
    title: 'Ti guidiamo\nset per set',
    desc: 'Cronometro recupero automatico, tracker carichi, foto del workout a fine sessione. Solo tu e il ferro.',
    visual: 'session' as const,
    highlights: ['Timer recupero', 'Tracker carichi', 'Foto workout'],
  },
  {
    id: 'badges',
    icon: Trophy,
    tag: 'GAMIFICATION & ARENA',
    title: 'Sfida, vinci,\nscala la classifica',
    desc: 'Badge da sbloccare, streak da mantenere, sfide 1vs1 con altri atleti. Ogni allenamento conta per la leaderboard.',
    visual: 'badges' as const,
    highlights: ['5 badge con tier', 'Sfide live 1vs1', 'Classifica globale'],
  },
];

// ── Main Component ───────────────────────────────────────────────────────────────

const CoachMarks: React.FC<CoachMarksProps> = ({
  steps, onComplete, themeColor,
  userProfile, userStats, generatedWorkouts, workoutSchedule
}) => {
  // 0 = welcome, 1..N = features, N+1 = ready
  const TOTAL = FEATURE_SLIDES.length;
  const [page, setPage] = useState(0); // 0=welcome, 1-5=features, 6=ready
  const [visible, setVisible] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  const isRose = themeColor === 'rose';
  const accent = isRose ? '#f43f5e' : '#10b981';
  const firstName = userProfile?.name?.split(' ')[0] || 'Atleta';

  const isWelcome = page === 0;
  const isReady = page === TOTAL + 1;
  const featureIdx = page - 1; // 0-based index into FEATURE_SLIDES
  const slide = !isWelcome && !isReady ? FEATURE_SLIDES[featureIdx] : null;

  const go = (next: number) => {
    setAnimKey(k => k + 1);
    setPage(next);
  };

  const finish = () => {
    setVisible(false);
    setTimeout(onComplete, 350);
  };

  const renderVisual = (type: string) => {
    switch (type) {
      case 'dashboard': return <DashboardVisual accent={accent} profile={userProfile} stats={userStats} />;
      case 'plan':      return <PlanVisual accent={accent} workouts={generatedWorkouts} schedule={workoutSchedule} />;
      case 'library':   return <LibraryVisual accent={accent} workouts={generatedWorkouts} />;
      case 'session':   return <SessionVisual accent={accent} />;
      case 'badges':    return <BadgesVisual accent={accent} />;
      default:          return null;
    }
  };

  if (!visible) return null;

  // ── BG shared ──
  const BG = (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full blur-[130px] opacity-20" style={{ backgroundColor: accent }} />
      <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full blur-[100px] opacity-8 bg-blue-600" />
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
    </div>
  );

  // ── WELCOME ──────────────────────────────────────────────────────────────────
  if (isWelcome) return (
    <div className="fixed inset-0 z-[150] flex flex-col overflow-hidden" style={{ background: 'linear-gradient(150deg,#040404 0%,#0c0c0c 100%)' }}>
      {BG}
      {/* Skip */}
      <div className="relative flex justify-end px-5 pt-14">
        <button onClick={finish} className="flex items-center gap-1 text-zinc-600 text-xs font-bold px-3 py-2 rounded-xl hover:text-zinc-400 transition-colors">
          Salta <X size={11} />
        </button>
      </div>

      {/* Hero content */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-8">
        {/* Icon */}
        <div className="relative mb-7">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center border" style={{ backgroundColor: `${accent}18`, borderColor: `${accent}30` }}>
            <Dumbbell size={46} strokeWidth={1.4} style={{ color: accent }} />
          </div>
          <div className="absolute -inset-2.5 rounded-[1.75rem] border border-white/5 animate-pulse" style={{ borderColor: `${accent}18` }} />
          <div className="absolute -inset-5 rounded-[2.25rem] border" style={{ borderColor: `${accent}08` }} />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: accent }}>GymBro · Benvenuto</p>

        <h1 className="text-[2.6rem] font-black text-white leading-[1.02] tracking-tight mb-4">
          Ciao,<br /><span style={{ color: accent }}>{firstName}!</span> 👋
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed max-w-[270px] mb-8">
          Il tuo programma è pronto. In <span className="text-white font-bold">30 secondi</span> ti mostriamo tutto quello che hai a disposizione.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { icon: Zap, label: 'Piano su misura' },
            { icon: Dumbbell, label: '20 schede' },
            { icon: Trophy, label: 'Badge & Sfide' },
            { icon: Calendar, label: 'Calendario auto' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-zinc-400 text-[10px] font-bold" style={{ borderColor: `${accent}28`, backgroundColor: `${accent}08` }}>
              <Icon size={10} style={{ color: accent }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="relative px-6 pb-12 space-y-3">
        <button onClick={() => go(1)}
          className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
          style={{ backgroundColor: accent, color: '#000', boxShadow: `0 8px 36px ${accent}45` }}>
          Inizia il tour <ArrowRight size={20} strokeWidth={2.5} />
        </button>
        <button onClick={finish} className="w-full py-3 text-zinc-500 text-sm font-bold">
          Conosco già l'app
        </button>
      </div>
    </div>
  );

  // ── READY ────────────────────────────────────────────────────────────────────
  if (isReady) return (
    <div className="fixed inset-0 z-[150] flex flex-col overflow-hidden" style={{ background: 'linear-gradient(150deg,#040404 0%,#0c0c0c 100%)' }}>
      {BG}
      <div className="flex-1" />
      <div className="relative flex flex-col items-center text-center px-8">
        {/* Check burst */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}18` }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}28` }}>
              <Check size={40} strokeWidth={3} style={{ color: accent }} />
            </div>
          </div>
          {[0,60,120,180,240,300].map((deg, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{
              backgroundColor: accent, opacity: 0.3 + (i % 3) * 0.2,
              top: '50%', left: '50%',
              transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(-55px)`
            }} />
          ))}
        </div>

        <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
          Sei pronto,<br /><span style={{ color: accent }}>{firstName}.</span>
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-[250px] mb-8">
          Il primo allenamento ti aspetta già in calendario. Forgia il tuo destino.
        </p>

        {/* Recap grid */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {[
            { icon: '⚡', t: 'Piano calibrato sui tuoi dati' },
            { icon: '📅', t: 'Calendario già organizzato' },
            { icon: '🏋️', t: `${generatedWorkouts?.length || 20} schede disponibili` },
            { icon: '🏆', t: 'Badge & sfide attivi' },
          ].map(item => (
            <div key={item.t} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 border border-white/8">
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] text-zinc-300 font-bold leading-tight">{item.t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1" />
      <div className="relative px-6 pb-12">
        <button onClick={finish}
          className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
          style={{ backgroundColor: accent, color: '#000', boxShadow: `0 8px 36px ${accent}45` }}>
          Vai alla Home <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );

  // ── FEATURE SLIDES ────────────────────────────────────────────────────────────
  if (!slide) return null;
  const SlideIcon = slide.icon;
  const isLastFeature = featureIdx === TOTAL - 1;

  return (
    <div key={animKey} className="fixed inset-0 z-[150] flex flex-col overflow-hidden animate-in fade-in duration-250"
      style={{ background: 'linear-gradient(150deg,#040404 0%,#0a0a0a 100%)' }}>
      {BG}

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 pt-14 pb-3 shrink-0">
        {/* Progress dots */}
        <div className="flex gap-1.5 items-center">
          {FEATURE_SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i + 1)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === featureIdx ? 20 : 6,
                height: 6,
                backgroundColor: i === featureIdx ? accent : i < featureIdx ? `${accent}50` : '#27272a'
              }} />
          ))}
        </div>
        <button onClick={finish} className="flex items-center gap-1 text-zinc-600 text-xs font-bold px-3 py-2 rounded-xl hover:text-zinc-400 transition-colors">
          Salta <X size={11} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="relative flex-1 overflow-y-auto px-5 pb-2">
        {/* Tag */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}20` }}>
            <SlideIcon size={12} style={{ color: accent }} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>{slide.tag}</span>
        </div>

        {/* Title */}
        <h2 className="text-[1.75rem] font-black text-white leading-tight tracking-tight mb-2 whitespace-pre-line">
          {slide.title}
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{slide.desc}</p>

        {/* Highlight chips */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {slide.highlights.map(h => (
            <div key={h} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-zinc-400 text-[9px] font-bold" style={{ borderColor: `${accent}25`, backgroundColor: `${accent}06` }}>
              <Check size={9} style={{ color: accent }} strokeWidth={3} />{h}
            </div>
          ))}
        </div>

        {/* Visual preview */}
        <div className="w-full rounded-2xl p-4 border border-white/8 bg-white/[0.02] mb-4">
          {renderVisual(slide.visual)}
        </div>
      </div>

      {/* Navigation */}
      <div className="relative shrink-0 px-5 pb-10 pt-3 border-t border-white/5">
        <div className="flex gap-3 mb-3">
          {featureIdx > 0 && (
            <button onClick={() => go(featureIdx)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform shrink-0">
              <ChevronRight size={18} className="text-zinc-500 rotate-180" />
            </button>
          )}
          <button onClick={() => go(isLastFeature ? TOTAL + 1 : featureIdx + 2)}
            className="flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ backgroundColor: accent, color: '#000', boxShadow: `0 4px 24px ${accent}38` }}>
            {isLastFeature ? 'Iniziamo!' : 'Avanti'}
            {isLastFeature ? <Check size={16} strokeWidth={3} /> : <ArrowRight size={16} strokeWidth={2.5} />}
          </button>
        </div>
        <p className="text-center text-zinc-700 text-[10px] font-bold">
          {featureIdx + 1} di {TOTAL}
        </p>
      </div>
    </div>
  );
};

export default CoachMarks;
