import React, { useState, useMemo, useEffect } from 'react';
import { Bell, ChevronRight, Moon, Sun, Trash2, Award, BarChart2, Calendar, User, Edit2, Flame, Clock, Dumbbell } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserProfile, UserStats, WorkoutCard, Badge, ScreenName } from '../types';
import { updateProfileField, updateUserStats } from '../lib/supabase';

interface ProfileScreenProps {
  onLogout: () => void;
  userProfile: UserProfile;
  userStats: UserStats;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onEditProfile: () => void;
  onNavigate?: (screen: ScreenName | string) => void;
  themeColor: string;
  workoutSchedule?: Record<string, WorkoutCard[]>;
  onDeleteWorkout?: (id: string, date: string) => void;
  onProfileUpdated?: (profile: Partial<UserProfile>, stats: Partial<UserStats>) => void;
}

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D', bg4: '#1E1E27',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  lime: '#C8FF00', coral: '#FF5D3B', amber: '#FFB347', sky: '#38BDF8', violet: '#A78BFA',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

type Tab = 'stats' | 'badges' | 'history';

const GOAL_LABELS: Record<string, string> = {
  muscle: 'Ipertrofia', definition: 'Definizione',
  weight_loss: 'Perdita Peso', endurance: 'Resistenza', custom: 'Custom',
};
const BADGE_TIER_COLORS: Record<string, string> = {
  locked: '#3f3f46', bronze: '#b45309', silver: '#9ca3af',
  gold: '#d97706', diamond: '#06b6d4', legendary: '#a855f7',
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout, userProfile, userStats, isDarkMode, toggleTheme, onEditProfile,
  onNavigate, themeColor, workoutSchedule = {}, onDeleteWorkout, onProfileUpdated,
}) => {
  const isRose = themeColor === 'rose';
  const accent = isRose ? T.coral : T.lime;
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [localImage, setLocalImage] = useState(userProfile.image);
  useEffect(() => setLocalImage(userProfile.image), [userProfile.image]);

  const firstName = (userProfile.name || 'Atleta').split(' ')[0];

  const { chartData, weeklyMins, weeklyDone } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dow = today.getDay();
    const mon = new Date(today); mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const labels = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
    let total = 0, done = 0;
    const data = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      const dk = d.toISOString().split('T')[0];
      const completed = ((workoutSchedule[dk] || []) as WorkoutCard[]).filter(w => w.isCompleted || w.id.startsWith('done_'));
      const secs = completed.reduce((a, w) => a + (w.completedDuration || 0), 0);
      total += secs; if (secs > 0) done++;
      return { name: labels[i], minutes: Math.round(secs / 60) };
    });
    return { chartData: data, weeklyMins: Math.floor(total / 60), weeklyDone: done };
  }, [workoutSchedule]);

  const recentHistory = useMemo(() => {
    const dn = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const h: any[] = [];
    Object.entries(workoutSchedule).forEach(([dk, ws]) => {
      (ws as WorkoutCard[]).filter(w => w.isCompleted || w.id.startsWith('done_')).forEach(w => {
        const d = new Date(dk);
        h.push({ id: w.id, date: dk, dayName: dn[d.getDay()], dayNum: d.getDate(), title: w.title, duration: w.completedDuration || 0, category: w.category });
      });
    });
    return h.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workoutSchedule]);

  const weeklyGoal = userProfile.trainingDays?.length || 3;
  const weeklyPct = Math.min(100, (weeklyDone / weeklyGoal) * 100);
  const unlockedBadges = userStats.badges?.filter(b => b.tier !== 'locked') || [];

  const card: React.CSSProperties = { background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22 };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, paddingBottom: 112, position: 'relative', overflow: 'hidden' }}>

      {/* BG orb */}
      <div style={{ position: 'fixed', top: -60, right: -80, width: 280, height: 280, borderRadius: '50%', background: `${accent}06`, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '56px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 40, color: T.text, lineHeight: 1 }}>{firstName.toUpperCase()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: 100, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: accent }}>
                {GOAL_LABELS[userProfile.goal] || 'Obiettivo'}
              </div>
              {userProfile.experience && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 100, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: T.sky }}>
                  {{ beginner: '🌱 Principiante', intermediate: '💪 Intermedio', advanced: '⚡ Avanzato' }[userProfile.experience] || userProfile.experience}
                </div>
              )}
            </div>
          </div>

          {/* Avatar + edit */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: T.bg3, border: `2px solid ${accent}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${accent}20` }}>
              {localImage
                ? <img src={localImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: T.display, fontSize: 34, color: accent }}>{firstName.charAt(0).toUpperCase()}</span>}
            </div>
            <button onClick={onEditProfile} style={{ position: 'absolute', bottom: -6, right: -6, width: 26, height: 26, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.bg}`, cursor: 'pointer' }}>
              <Edit2 size={11} style={{ color: '#000' }} />
            </button>
          </div>
        </div>

        {/* Weekly goal progress */}
        <div style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Obiettivo Settimanale</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{weeklyDone}/{weeklyGoal} allenamenti</span>
            </div>
            <div style={{ height: 4, background: T.bg4, borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: accent, width: `${weeklyPct}%`, borderRadius: 100, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${accent}60` }} />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
          {[
            { icon: '🔥', value: userStats.streak, label: 'Streak', color: T.amber },
            { icon: '🏋️', value: userStats.workoutsCompleted, label: 'Workout', color: accent },
            { icon: '⚡', value: `${Math.floor(userStats.activeMinutes / 60)}h`, label: 'Attivo', color: T.sky },
          ].map(({ icon, value, label, color }) => (
            <div key={label} style={{ ...card, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontFamily: T.display, fontSize: 28, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Physical metrics */}
        <div style={{ ...card, overflow: 'hidden', marginTop: 14 }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>Metriche Fisiche</div>
            <button onClick={onEditProfile} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: accent, background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: 100, padding: '4px 10px', cursor: 'pointer' }}>Modifica</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { label: 'Peso', value: userProfile.weight || 0, unit: 'kg' },
              { label: 'Altezza', value: userProfile.height || 0, unit: 'cm' },
              { label: 'BMI', value: (userProfile.weight && userProfile.height) ? (userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1) : '—', unit: '', color: accent },
            ].map(({ label, value, unit, color }, i) => (
              <div key={label} style={{ padding: '14px 10px', textAlign: 'center', borderRight: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ fontFamily: T.display, fontSize: 28, color: (color as string) || T.text, lineHeight: 1 }}>{value}<span style={{ fontSize: 10, color: T.muted }}>{unit}</span></div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 4 }}>
          {([
            { id: 'stats' as Tab, label: 'Stats', icon: BarChart2 },
            { id: 'badges' as Tab, label: `Badge${unlockedBadges.length > 0 ? ` (${unlockedBadges.length})` : ''}`, icon: Award },
            { id: 'history' as Tab, label: 'Storico', icon: Calendar },
          ]).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none', background: activeTab === id ? T.bg3 : 'transparent', color: activeTab === id ? T.text : T.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s', boxShadow: activeTab === id ? '0 2px 8px rgba(0,0,0,0.4)' : 'none' }}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <>
            {/* 1RM Maxes */}
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>MASSIMALI 1RM</div>
              {[
                { label: 'Panca Piana', emoji: '🏋️', val: userStats.maxes?.bench || 0, max: 200 },
                { label: 'Squat',       emoji: '🦵', val: userStats.maxes?.squat || 0, max: 260 },
                { label: 'Stacco',      emoji: '⚡', val: userStats.maxes?.deadlift || 0, max: 300 },
              ].map(({ label, emoji, val, max }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.muted2 }}>{label}</span>
                      <span style={{ fontFamily: T.display, fontSize: 20, color: accent }}>{val}<span style={{ fontSize: 10, color: T.muted }}>kg</span></span>
                    </div>
                    <div style={{ height: 3, background: T.bg4, borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: accent, width: `${Math.min(100, (val / max) * 100)}%`, borderRadius: 100, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly chart */}
            <div style={{ ...card, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Questa Settimana</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>Minuti attivi</div>
                </div>
                <div style={{ background: `${accent}12`, border: `1px solid ${accent}25`, borderRadius: 10, padding: '5px 10px', fontSize: 12, fontWeight: 700, color: accent }}>{weeklyMins}m totali</div>
              </div>
              <div style={{ height: 110 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: T.muted, fontSize: 9, fontWeight: 700 }} dy={8} />
                    <Tooltip cursor={{ fill: T.bg3, radius: 6 }} content={({ active, payload }) => active && payload?.length ? <div style={{ padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: T.bg4, color: T.text, border: `1px solid ${T.border}` }}>{payload[0].payload.minutes} min</div> : null} />
                    <Bar dataKey="minutes" radius={[5, 5, 5, 5]} barSize={22}>
                      {chartData.map((e, i) => <Cell key={i} fill={e.minutes > 0 ? accent : T.bg3} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* BADGES TAB */}
        {activeTab === 'badges' && (
          <>
            {unlockedBadges.length > 0 && (
              <div style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 16, background: `${accent}12`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: T.display, fontSize: 22, color: accent }}>{unlockedBadges.length}</span>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{unlockedBadges.length}/{userStats.badges?.length || 5} Badge</div>
                  <div style={{ fontSize: 12, color: T.muted }}>sbloccati · continua ad allenarti!</div>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {(userStats.badges || []).map(b => {
                const c = BADGE_TIER_COLORS[b.tier] || BADGE_TIER_COLORS.locked;
                const pct = b.nextThreshold ? Math.min(100, (b.currentValue / b.nextThreshold) * 100) : 100;
                const isLocked = b.tier === 'locked';
                return (
                  <div key={b.id} style={{ background: isLocked ? T.bg2 : T.bg2, border: `1px solid ${isLocked ? T.border : `${c}30`}`, borderRadius: 18, padding: '14px 14px', opacity: isLocked ? 0.5 : 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: `${c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Award size={16} style={{ color: c }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: c, marginTop: 1 }}>{isLocked ? 'Bloccato' : b.tier}</div>
                      </div>
                    </div>
                    {b.nextThreshold !== undefined && (
                      <>
                        <div style={{ height: 3, background: T.bg4, borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: c, width: `${pct}%`, borderRadius: 100, transition: 'width 0.5s' }} />
                        </div>
                        <div style={{ fontSize: 9, color: T.muted }}>{b.currentValue}/{b.nextThreshold}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          recentHistory.length === 0 ? (
            <div style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
              <div style={{ fontSize: 14, color: T.muted }}>Nessun allenamento completato ancora.</div>
            </div>
          ) : (
            <div style={{ ...card, overflow: 'hidden' }}>
              {recentHistory.slice(0, 15).map((item, i, arr) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: T.muted }}>{item.dayName}</span>
                    <span style={{ fontFamily: T.display, fontSize: 20, color: T.text, lineHeight: 1 }}>{item.dayNum}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                      <span style={{ color: accent, fontWeight: 700 }}>{item.category}</span> · {Math.round(item.duration / 60)} min
                    </div>
                  </div>
                  {onDeleteWorkout && (
                    <button onClick={() => onDeleteWorkout(item.id, item.date)} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,93,59,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={13} style={{ color: T.coral }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* SETTINGS */}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, paddingLeft: 2, paddingTop: 6 }}>IMPOSTAZIONI</div>
        <div style={{ ...card, overflow: 'hidden' }}>
          {[
            { label: 'Notifiche', sub: 'Promemoria allenamento', icon: Bell, iconBg: `${accent}12`, iconColor: accent },
            { label: 'Dark Mode', sub: isDarkMode ? 'Attivo' : 'Disattivo', icon: isDarkMode ? Moon : Sun, iconBg: isDarkMode ? 'rgba(99,102,241,0.12)' : 'rgba(251,191,36,0.12)', iconColor: isDarkMode ? '#6366f1' : '#fbbf24', toggle: true },
          ].map(({ label, sub, icon: Icon, iconBg, iconColor, toggle }, i) => (
            <div key={label} onClick={toggle ? toggleTheme : undefined} style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: i === 0 ? `1px solid ${T.border}` : 'none', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 14 }}>
                <Icon size={16} style={{ color: iconColor }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{label}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{sub}</div>
              </div>
              {toggle ? (
                <div style={{ width: 44, height: 26, borderRadius: 100, background: isDarkMode ? accent : T.bg4, position: 'relative', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: isDarkMode ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: isDarkMode ? '#000' : '#fff', transition: 'left 0.2s cubic-bezier(0.34,1.4,0.64,1)' }} />
                </div>
              ) : (
                <ChevronRight size={16} style={{ color: T.muted }} />
              )}
            </div>
          ))}
        </div>

        {onNavigate && (
          <button onClick={() => onNavigate('nutrizione')} style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.2)', color: T.lime, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            🥗 Piano Nutrizionale
          </button>
        )}

        <button onClick={onLogout} style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'rgba(255,93,59,0.06)', border: '1px solid rgba(255,93,59,0.2)', color: T.coral, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.body }}>
          Esci dall'account
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
