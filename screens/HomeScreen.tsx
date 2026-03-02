import React, { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Bell, X, Star, ArrowUpRight, Play, Plus, Activity, Flame, Users, BarChart2, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { ScreenName, UserProfile, UserStats, WorkoutCard, AppNotification } from '../types';

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

const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate, userProfile, userStats, availableWorkouts,
  onStartWorkout, isDarkMode, themeColor, notifications = [], onMarkNotificationsRead
}) => {
  const firstName = userProfile.name ? userProfile.name.split(' ')[0] : 'Atleta';
  const unreadCount = notifications.filter(n => !n.read).length;
  const isRose = themeColor === 'rose';
  const accentHex = isRose ? '#f43f5e' : '#10b981';
  const accentBg = isRose ? 'bg-rose-500' : 'bg-emerald-500';
  const accent = isRose ? 'text-rose-400' : 'text-emerald-400';

  const [showNotifications, setShowNotifications] = useState(false);
  const [workoutIdx, setWorkoutIdx] = useState(0);

  useEffect(() => {
    if (availableWorkouts.length <= 1) return;
    const t = setInterval(() => setWorkoutIdx(p => (p + 1) % availableWorkouts.length), 5000);
    return () => clearInterval(t);
  }, [availableWorkouts.length]);

  const todayWorkout = availableWorkouts.length > 0 ? availableWorkouts[workoutIdx] : null;

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  }, []);

  const isTrainingDay = useMemo(() => {
    const dow = new Date().getDay();
    const appDay = dow === 0 ? 6 : dow - 1;
    return (userProfile.trainingDays || []).includes(appDay);
  }, [userProfile.trainingDays]);

  const handleToggleNotif = () => {
    if (!showNotifications && onMarkNotificationsRead) onMarkNotificationsRead();
    setShowNotifications(v => !v);
  };

  const QUICK_ACTIONS = [
    { label: 'Calendario', icon: CalendarIcon, screen: 'calendar' as ScreenName, color: '#6366f1' },
    { label: 'Community', icon: Users, screen: 'community' as ScreenName, color: '#f59e0b' },
    { label: 'Statistiche', icon: BarChart2, screen: 'profile' as ScreenName, color: '#06b6d4' },
    { label: 'Crea Scheda', icon: Plus, screen: 'custom-workout-builder' as ScreenName, color: accentHex },
  ];

  return (
    <div className="min-h-screen bg-[#080808] pb-28 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 blur-[100px]" style={{ backgroundColor: accentHex }} />
        <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full opacity-10 blur-[80px] bg-blue-500" />
      </div>

      {/* HEADER */}
      <div className="relative px-5 pt-14 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-zinc-600 text-xs font-medium capitalize">{todayLabel}</p>
            <h1 className="text-3xl font-black text-white mt-0.5">
              Ciao, <span style={{ color: accentHex }}>{firstName}</span>
            </h1>
            {isTrainingDay ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentHex }} />
                <span className="text-xs font-bold" style={{ color: accentHex }}>Giorno di allenamento</span>
              </div>
            ) : (
              <p className="text-zinc-600 text-xs mt-1">Giorno di riposo 💤</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Foto profilo piccola */}
            <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-2xl overflow-hidden border-2 active:scale-90 transition-transform shrink-0" style={{ borderColor: accentHex }}>
              {userProfile.image ? (
                <img src={userProfile.image} alt="profilo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${accentHex}25` }}>
                  <span className="text-sm font-black" style={{ color: accentHex }}>{firstName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </button>
            <button onClick={handleToggleNotif} className="relative w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-90 transition-transform">
              {showNotifications ? <X size={18} className="text-zinc-400" /> : <Bell size={18} className="text-zinc-400" />}
              {unreadCount > 0 && !showNotifications && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#080808] flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">{unreadCount}</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {showNotifications && (
          <div className="absolute top-full left-4 right-4 z-50 mt-2 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl">
              <p className="font-bold text-white text-sm mb-3">Notifiche</p>
              {notifications.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-3">Nessuna notifica</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-3 p-2 rounded-xl hover:bg-zinc-800 cursor-pointer transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accentBg}`}>
                        {n.type === 'badge_unlock' ? <Star size={14} className="text-black" /> : <Dumbbell size={14} className="text-black" />}
                      </div>
                      <div><p className="text-white text-xs font-bold">{n.title}</p><p className="text-zinc-500 text-xs">{n.message}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: <Flame size={14} fill="currentColor" className="text-orange-400" />, val: userStats.streak, lbl: 'Streak', bg: '#f9731610' },
            { icon: <Dumbbell size={14} className={accent} />, val: userStats.workoutsCompleted, lbl: 'Workout', bg: `${accentHex}10` },
            { icon: <Activity size={14} className="text-sky-400" />, val: `${Math.floor(userStats.activeMinutes / 60)}h`, lbl: 'Attivo', bg: '#0ea5e910' },
          ].map(({ icon, val, lbl, bg }) => (
            <div key={lbl} className="bg-zinc-900/70 rounded-2xl border border-zinc-800/50 p-3.5 flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>{icon}</div>
              <span className="text-lg font-black text-white leading-none">{val}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TODAY WORKOUT CARD */}
      <div className="px-5 mb-5">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/50" style={{ background: `linear-gradient(135deg, #111 0%, ${accentHex}12 100%)` }}>
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-30 blur-2xl" style={{ backgroundColor: accentHex }} />
          <div className="relative p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentHex }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Consigliato Oggi</span>
                </div>
                <h2 className="text-xl font-black text-white leading-tight">
                  {todayWorkout ? todayWorkout.title : 'Scegli allenamento'}
                </h2>
                {todayWorkout && <p className="text-zinc-500 text-xs mt-1">{todayWorkout.category} · {todayWorkout.exercises.length} esercizi</p>}
              </div>
              <button id="action-workout-main"
                onClick={() => todayWorkout ? onStartWorkout(todayWorkout.id) : onNavigate('workout')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 active:scale-90 transition-transform shadow-lg" style={{ backgroundColor: accentHex }}>
                <Play size={20} fill="black" className="text-black ml-0.5" />
              </button>
            </div>
            {todayWorkout && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {todayWorkout.exercises.slice(0, 4).map((ex, i) => (
                  <div key={i} className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white text-[10px] font-medium whitespace-nowrap">{ex.name}</p>
                  </div>
                ))}
                {todayWorkout.exercises.length > 4 && (
                  <div className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-zinc-500 text-[10px] font-medium">+{todayWorkout.exercises.length - 4}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-5 mb-5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Azioni Rapide</p>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ label, icon: Icon, screen, color }) => (
            <button key={screen} onClick={() => onNavigate(screen)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/50 active:scale-90 transition-transform">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-[9px] font-bold text-zinc-500 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WORKOUT LIBRARY */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Libreria Schede</p>
          <button onClick={() => onNavigate('workout')} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: accentHex }}>
            Vedi tutto <ArrowUpRight size={10} />
          </button>
        </div>
        <div className="space-y-2">
          {availableWorkouts.slice(0, 3).map(w => (
            <div key={w.id} onClick={() => onStartWorkout(w.id)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/50 cursor-pointer active:scale-[0.98] transition-transform">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentHex}15` }}>
                <Dumbbell size={16} style={{ color: accentHex }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{w.title}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{w.category} · {w.exercises.length} esercizi</p>
              </div>
              {w.isCustom && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md text-purple-400 bg-purple-500/10 border border-purple-500/20 shrink-0">Custom</span>}
              <ChevronRight size={14} className="text-zinc-700 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* MASSIMALI */}
      {(userStats.maxes?.bench || userStats.maxes?.squat || userStats.maxes?.deadlift) ? (
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Massimali 1RM</p>
            <button onClick={() => onNavigate('profile')} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: accentHex }}>
              Modifica <ArrowUpRight size={10} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[{lbl:'Panca',em:'🏋️',val:userStats.maxes?.bench},{lbl:'Squat',em:'🦵',val:userStats.maxes?.squat},{lbl:'Stacco',em:'⚡',val:userStats.maxes?.deadlift}].map(({lbl,em,val})=>(
              <div key={lbl} className="bg-zinc-900/70 rounded-2xl border border-zinc-800/50 p-3 text-center">
                <span className="text-lg">{em}</span>
                <p className="text-white font-black text-base mt-1">{val||0}<span className="text-zinc-600 text-[9px] ml-0.5">kg</span></p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HomeScreen;
