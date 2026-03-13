
import React, { useState, useEffect, useMemo } from 'react';
import { Bell, X, ArrowUpRight, Play, Plus, Activity, Flame, Users, BarChart2, Calendar as CalendarIcon, ChevronRight, Droplets, Beef, Wheat, Zap } from 'lucide-react';
import { ScreenName, UserProfile, UserStats, WorkoutCard, AppNotification } from '../types';
import { getWorkoutImage } from '../lib/workoutImages';

interface HomeScreenProps {
  onNavigate: (screen: ScreenName) => void;
  userProfile: UserProfile;
  userStats: UserStats;
  availableWorkouts: WorkoutCard[];
  onStartWorkout: (workoutId: string) => void;
  isDarkMode: boolean;
  themeColor: string;
  notifications?: AppNotification[];
  onMarkNotificationsRead?: () => void;
}

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  lime: '#C8FF00', coral: '#FF5D3B', amber: '#FFB347', sky: '#38BDF8', violet: '#A78BFA',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

// Rose variant keeps the coral accent for female theme
const getAccent = (themeColor: string) => themeColor === 'rose' ? '#FF5D3B' : T.lime;
const getGlow   = (themeColor: string) => themeColor === 'rose' ? 'rgba(255,93,59,0.2)' : 'rgba(200,255,0,0.18)';

const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate, userProfile, userStats, availableWorkouts,
  onStartWorkout, isDarkMode, themeColor, notifications = [], onMarkNotificationsRead,
}) => {
  const accent  = getAccent(themeColor);
  const glow    = getGlow(themeColor);
  const firstName = userProfile.name ? userProfile.name.split(' ')[0] : 'Atleta';
  const unread  = notifications.filter(n => !n.read).length;

  const [showNotif, setShowNotif] = useState(false);
  const [workoutIdx, setWorkoutIdx] = useState(0);

  useEffect(() => {
    if (availableWorkouts.length <= 1) return;
    const t = setInterval(() => setWorkoutIdx(p => (p + 1) % availableWorkouts.length), 5000);
    return () => clearInterval(t);
  }, [availableWorkouts.length]);

  const todayWorkout = availableWorkouts.length > 0 ? availableWorkouts[workoutIdx] : null;

  const todayLabel = useMemo(() =>
    new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }), []);

  const isTrainingDay = useMemo(() => {
    const dow = new Date().getDay();
    const appDay = dow === 0 ? 6 : dow - 1;
    return (userProfile.trainingDays || []).includes(appDay);
  }, [userProfile.trainingDays]);

  const QUICK_ACTIONS = [
    { label: 'Piano',       icon: CalendarIcon, screen: 'calendar'              as ScreenName, color: '#6366F1' },
    { label: 'Social',      icon: Users,        screen: 'community'             as ScreenName, color: T.amber   },
    { label: 'Statistiche', icon: BarChart2,     screen: 'profile'              as ScreenName, color: T.sky     },
    { label: 'Crea\nScheda',icon: Plus,          screen: 'custom-workout-builder' as ScreenName, color: accent  },
  ];

  const CAT_COLORS: Record<string, string> = {
    'Massa': T.lime, 'Definizione': T.violet,
    'Perdita Peso': T.coral, 'Resistenza': T.sky, 'Custom': '#A855F7',
  };

  // Nutrition calc
  const { kcal, protein, carbs, fat } = useMemo(() => {
    const w = userProfile.weight || 75;
    const m: Record<string, any> = {
      muscle:      { kcal: 36, protein: 2.2, carbs: 4.5, fat: 1.0 },
      definition:  { kcal: 29, protein: 2.4, carbs: 2.5, fat: 0.9 },
      weight_loss: { kcal: 24, protein: 2.0, carbs: 2.0, fat: 0.7 },
      endurance:   { kcal: 33, protein: 1.6, carbs: 5.5, fat: 0.8 },
    };
    const v = m[userProfile.goal] || m.muscle;
    return { kcal: Math.round(w * v.kcal), protein: Math.round(w * v.protein), carbs: Math.round(w * v.carbs), fat: Math.round(w * v.fat) };
  }, [userProfile.weight, userProfile.goal]);

  // ── SHARED STYLE HELPERS ─────────────────────────────────────────────────────
  const card: React.CSSProperties = { background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22 };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, paddingBottom: 112, overflowX: 'hidden', position: 'relative' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: `${accent}08`, filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(56,189,248,0.05)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* HEADER ─────────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '56px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: 'capitalize', letterSpacing: '0.06em' }}>{todayLabel}</div>
            <div style={{ fontFamily: T.display, fontSize: 46, color: T.text, lineHeight: 1 }}>
              CIAO, <span style={{ color: accent }}>{firstName.toUpperCase()}</span>
            </div>
            {isTrainingDay ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: 100, padding: '4px 10px 4px 6px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', color: accent }}>GIORNO DI ALLENAMENTO</span>
              </div>
            ) : (
              <div style={{ marginTop: 6, fontSize: 12, color: T.muted }}>Giorno di riposo 💤</div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            {/* Avatar */}
            <button onClick={() => onNavigate('profile')} style={{ width: 44, height: 44, borderRadius: 15, background: `${accent}12`, border: `1.5px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 0 14px ${accent}20` }}>
              {userProfile.image
                ? <img src={userProfile.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                : <span style={{ fontFamily: T.display, fontSize: 20, color: accent }}>{firstName.charAt(0).toUpperCase()}</span>}
            </button>

            {/* Bell */}
            <button
              onClick={() => { if (!showNotif && onMarkNotificationsRead) onMarkNotificationsRead(); setShowNotif(v => !v); }}
              style={{ position: 'relative', width: 44, height: 44, borderRadius: 15, background: T.bg2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.muted2 }}
            >
              {showNotif ? <X size={18} /> : <Bell size={18} />}
              {unread > 0 && !showNotif && (
                <div style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: T.coral, border: `1.5px solid ${T.bg}` }} />
              )}
            </button>
          </div>
        </div>

        {/* Notification dropdown */}
        {showNotif && (
          <div style={{ position: 'absolute', top: '100%', left: 16, right: 16, zIndex: 50, marginTop: 8 }}>
            <div style={{ ...card, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Notifiche</div>
              {notifications.length === 0
                ? <div style={{ fontSize: 13, color: T.muted, textAlign: 'center', padding: '12px 0' }}>Nessuna notifica</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ display: 'flex', gap: 10, padding: 8, borderRadius: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Bell size={14} style={{ color: accent }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{n.title}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>{n.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        )}
      </div>

      {/* TODAY WORKOUT HERO ─────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 20px' }}>
        <div
          onClick={() => todayWorkout ? onStartWorkout(todayWorkout.id) : onNavigate('workout')}
          style={{ borderRadius: 26, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
        >
          {todayWorkout && (
            <img
              src={getWorkoutImage(todayWorkout)}
              alt={todayWorkout.title}
              style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
            />
          )}
          {!todayWorkout && <div style={{ width: '100%', height: 200, background: T.bg3 }} />}

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(7,7,10,0.95) 0%, rgba(7,7,10,0.3) 60%, transparent 100%)' }} />

          <div style={{ position: 'absolute', inset: 0, padding: '20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted2 }}>CONSIGLIATO OGGI</span>
              </div>
              <div style={{ fontFamily: T.display, fontSize: 34, color: T.text, lineHeight: 0.95 }}>
                {todayWorkout ? todayWorkout.title.toUpperCase() : 'SCEGLI\nALLENAMENTO'}
              </div>
              {todayWorkout && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: `${accent}15`, border: `1px solid ${accent}25`, borderRadius: 100, padding: '4px 10px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: accent }}>{todayWorkout.category}</span>
                  <span style={{ fontSize: 10, color: T.muted }}> · {todayWorkout.exercises.length} esercizi</span>
                </div>
              )}
            </div>

            <button
              style={{ width: 48, height: 48, borderRadius: 16, background: accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', boxShadow: `0 4px 20px ${glow}` }}
              onClick={e => { e.stopPropagation(); todayWorkout ? onStartWorkout(todayWorkout.id) : onNavigate('workout'); }}
            >
              <Play size={22} fill="#000" style={{ color: '#000', marginLeft: 2 }} />
            </button>
          </div>

          {/* Exercise pills */}
          {todayWorkout && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 14px', display: 'flex', gap: 8, overflowX: 'auto' }}>
              {todayWorkout.exercises.slice(0, 4).map((ex, i) => (
                <div key={i} style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 10, fontWeight: 600, color: T.muted2, whiteSpace: 'nowrap' }}>
                  {ex.name}
                </div>
              ))}
              {todayWorkout.exercises.length > 4 && (
                <div style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', fontSize: 10, color: T.muted }}>
                  +{todayWorkout.exercises.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STATS ROW ──────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 20px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 12 }}>LE TUE STATISTICHE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { icon: '🔥', value: userStats.streak, label: 'Streak',  color: T.amber },
            { icon: '🏋️', value: userStats.workoutsCompleted, label: 'Workout', color: accent },
            { icon: '⚡', value: `${Math.floor(userStats.activeMinutes / 60)}h`, label: 'Attivo', color: T.sky },
          ].map(({ icon, value, label, color }) => (
            <div key={label} style={{ ...card, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{icon}</div>
              <div style={{ fontFamily: T.display, fontSize: 30, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 20px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 12 }}>AZIONI RAPIDE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {QUICK_ACTIONS.map(({ label, icon: Icon, screen, color }) => (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', cursor: 'pointer', border: `1px solid ${T.border}`, transition: 'transform 0.15s' }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ width: 36, height: 36, borderRadius: 11, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted2, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WORKOUT LIBRARY ────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>LIBRERIA SCHEDE</div>
          <button onClick={() => onNavigate('workout')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: accent, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            VEDI TUTTO <ArrowUpRight size={10} />
          </button>
        </div>
        <div style={{ ...card, overflow: 'hidden' }}>
          {availableWorkouts.slice(0, 3).map((w, i) => (
            <React.Fragment key={w.id}>
              <div
                onClick={() => onStartWorkout(w.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={getWorkoutImage(w)} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.title}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                    <span style={{ color: CAT_COLORS[w.category] || accent, fontWeight: 700 }}>{w.category}</span>
                    {` · ${w.exercises.length} esercizi`}
                  </div>
                </div>
                {w.isCustom && <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 6px', borderRadius: 6, color: T.violet, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', flexShrink: 0 }}>Custom</span>}
                <ChevronRight size={14} style={{ color: T.muted, flexShrink: 0 }} />
              </div>
              {i < Math.min(availableWorkouts.length - 1, 2) && <div style={{ height: 1, background: T.border, margin: '0 16px' }} />}
            </React.Fragment>
          ))}
          {availableWorkouts.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
              Nessuna scheda disponibile.<br />
              <button onClick={() => onNavigate('custom-workout-builder')} style={{ color: accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>Crea la tua prima scheda →</button>
            </div>
          )}
        </div>
      </div>

      {/* NUTRITION ──────────────────────────────────────────────────────────── */}
      {userProfile.weight > 0 && (
        <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>PIANO NUTRIZIONALE</div>
            <button onClick={() => onNavigate('nutrizione' as ScreenName)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: accent, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              DETTAGLI <ArrowUpRight size={10} />
            </button>
          </div>
          <div onClick={() => onNavigate('nutrizione' as ScreenName)} style={{ ...card, overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>Fabbisogno Giornaliero</div>
                <div>
                  <span style={{ fontFamily: T.display, fontSize: 48, color: accent, lineHeight: 1 }}>{kcal}</span>
                  <span style={{ fontSize: 13, color: T.muted, fontWeight: 500, marginLeft: 6 }}>kcal / giorno</span>
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔥</div>
            </div>
            <div style={{ display: 'flex', borderTop: `1px solid ${T.border}` }}>
              {[
                { label: 'Proteine', value: protein, unit: 'g', icon: '🥩', color: T.lime },
                { label: 'Carboidrati', value: carbs, unit: 'g', icon: '🌾', color: T.violet },
                { label: 'Grassi', value: fat, unit: 'g', icon: '🫒', color: T.amber },
              ].map(({ label, value, unit, icon, color }, i) => (
                <div key={label} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', borderRight: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontFamily: T.display, fontSize: 22, color: T.text, lineHeight: 1 }}>{value}<span style={{ fontSize: 9, color: T.muted }}>{unit}</span></div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.muted, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1RM MAXES ──────────────────────────────────────────────────────────── */}
      {(userStats.maxes?.bench || userStats.maxes?.squat || userStats.maxes?.deadlift) && (
        <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>MASSIMALI 1RM</div>
            <button onClick={() => onNavigate('profile')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: accent, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              MODIFICA <ArrowUpRight size={10} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Panca', emoji: '🏋️', value: userStats.maxes?.bench },
              { label: 'Squat', emoji: '🦵', value: userStats.maxes?.squat },
              { label: 'Stacco', emoji: '⚡', value: userStats.maxes?.deadlift },
            ].map(({ label, emoji, value }) => (
              <div key={label} style={{ ...card, padding: '16px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>{emoji}</div>
                <div style={{ fontFamily: T.display, fontSize: 30, color: T.text, lineHeight: 1, marginTop: 4 }}>
                  {value || 0}<span style={{ fontSize: 9, color: T.muted, marginLeft: 2 }}>kg</span>
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }`}</style>
    </div>
  );
};

export default HomeScreen;
