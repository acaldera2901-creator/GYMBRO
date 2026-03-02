import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Bell, Moon, ChevronRight, User, X, Sun, Flame, Dumbbell,
  Calendar, Clock, Trash2, Camera, Check, Loader2, Lock,
  Award, Target, BarChart2, Plus, Minus, Edit2
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserProfile, UserStats, WorkoutCard, Badge } from '../types';
import { SecureStorageManager } from '../lib/secureStorage';
import { updateProfileField, updateUserStats } from '../lib/supabase';

interface ProfileScreenProps {
  onLogout: () => void;
  userProfile: UserProfile;
  userStats: UserStats;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onEditProfile: () => void;
  themeColor: string;
  workoutSchedule?: Record<string, WorkoutCard[]>;
  onDeleteWorkout?: (id: string, date: string) => void;
  onProfileUpdated?: (profile: Partial<UserProfile>, stats: Partial<UserStats>) => void;
}

const PREF_OPTIONS = [
  { id: 'Panca Piana', label: 'Panca', group: 'CHEST' },
  { id: 'Squat', label: 'Squat', group: 'LEGS' },
  { id: 'Trazioni', label: 'Trazioni', group: 'BACK' },
  { id: 'Military Press', label: 'Military', group: 'SHLDRS' },
  { id: 'Stacco', label: 'Stacco', group: 'BACK' },
  { id: 'Curl Bicipiti', label: 'Curl', group: 'ARMS' },
];

const Ring: React.FC<{ pct: number; size: number; stroke: number; color: string }> = ({ pct, size, stroke, color }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f1f23" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
};

// EDIT MODAL - Save button inside modal above bottom nav
const EditProfileModal: React.FC<{
  userProfile: UserProfile;
  userStats: UserStats;
  themeColor: string;
  onClose: () => void;
  onSave: (profile: Partial<UserProfile>, stats: Partial<UserStats>) => Promise<void>;
}> = ({ userProfile, userStats, themeColor, onClose, onSave }) => {
  const isRose = themeColor === 'rose';
  const accentBg = isRose ? 'bg-rose-500' : 'bg-emerald-500';

  const [weight, setWeight] = useState(String(userProfile.weight || 75));
  const [favorites, setFavorites] = useState<string[]>(userProfile.favoriteExercises || []);
  const [localImage, setLocalImage] = useState<string | undefined>(userProfile.image);
  const [imageKey, setImageKey] = useState(0);
  const [benchStr, setBenchStr] = useState<string | null>(userStats.maxes?.bench ? String(userStats.maxes.bench) : null);
  const [squatStr, setSquatStr] = useState<string | null>(userStats.maxes?.squat ? String(userStats.maxes.squat) : null);
  const [deadliftStr, setDeadliftStr] = useState<string | null>(userStats.maxes?.deadlift ? String(userStats.maxes.deadlift) : null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFav = (id: string) => setFavorites(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const adjMax = (setter: React.Dispatch<React.SetStateAction<string | null>>, cur: string | null, d: number) => {
    const v = parseFloat(cur || '0') || 0;
    setter(String(Math.max(2.5, Math.round((v + d) / 2.5) * 2.5)));
  };

  const normMax = (setter: React.Dispatch<React.SetStateAction<string | null>>, cur: string | null, fb = 60) => {
    if (cur === null) return;
    const v = parseFloat(cur);
    setter(isNaN(v) || v <= 0 ? String(fb) : String(Math.max(2.5, Math.round(v / 2.5) * 2.5)));
  };

  // FIX FOTO: aggiorna subito con key diversa per rimontare <img>
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalImage(reader.result as string);
      setImageKey(k => k + 1);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const wNum = parseFloat(weight);
    if (!weight || isNaN(wNum) || wNum < 30 || wNum > 300) { setError('Peso valido: 30–300 kg'); return; }
    setIsSaving(true); setError(null);
    try {
      await onSave(
        { weight: wNum, image: localImage, favoriteExercises: favorites },
        { weight: wNum, maxes: {
            bench: benchStr !== null ? (parseFloat(benchStr) || 0) : (userStats.maxes?.bench || 0),
            squat: squatStr !== null ? (parseFloat(squatStr) || 0) : (userStats.maxes?.squat || 0),
            deadlift: deadliftStr !== null ? (parseFloat(deadliftStr) || 0) : (userStats.maxes?.deadlift || 0),
        }}
      );
      onClose();
    } catch (err: any) { setError(err.message || 'Errore.'); setIsSaving(false); }
  };

  return (
    // z-[100] ensures modal is above everything including bottom nav
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d0d0d] rounded-t-[2rem] flex flex-col overflow-hidden" style={{ maxHeight: '93dvh' }}>
        <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 bg-zinc-800 rounded-full" /></div>
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/50 shrink-0">
          <h2 className="text-lg font-black text-white">Modifica Profilo</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center"><X size={15} className="text-zinc-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Foto */}
          <div className="flex flex-col items-center">
            <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-zinc-700 ring-offset-2 ring-offset-[#0d0d0d]">
                {localImage
                  ? <img key={imageKey} src={localImage} className="w-full h-full object-cover" alt="avatar" />
                  : <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><User size={36} className="text-zinc-600" /></div>
                }
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-8 h-8 ${accentBg} rounded-full flex items-center justify-center border-2 border-[#0d0d0d]`}>
                <Camera size={13} className="text-black" />
              </div>
            </div>
            <p className="text-zinc-600 text-xs mt-2">Tocca per cambiare</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Anagrafica */}
          <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-2"><Lock size={9} className="text-zinc-700" /><span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Anagrafica</span></div>
            <div className="flex gap-6">
              {[{ l: 'Nome', v: userProfile.name }, { l: 'Genere', v: userProfile.gender }].map(({ l, v }) => (
                <div key={l}><p className="text-[9px] text-zinc-600 uppercase font-bold mb-0.5">{l}</p><p className="text-white font-semibold text-sm">{v}</p></div>
              ))}
            </div>
          </div>

          {/* Peso */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Peso</p>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center overflow-hidden">
              <button onClick={() => setWeight(String(Math.max(30, (parseFloat(weight)||75) - 0.5)))}
                className="w-12 h-14 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors active:scale-90"><Minus size={16} /></button>
              <div className="flex-1 flex flex-col items-center">
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  onBlur={() => { const v=parseFloat(weight); if(isNaN(v)||v<30) setWeight('30'); else if(v>300) setWeight('300'); }}
                  className="bg-transparent text-white text-2xl font-black text-center w-full focus:outline-none" inputMode="decimal" />
                <span className="text-zinc-600 text-[9px] font-bold uppercase -mt-1">kg</span>
              </div>
              <button onClick={() => setWeight(String(Math.min(300, (parseFloat(weight)||75) + 0.5)))}
                className="w-12 h-14 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors active:scale-90"><Plus size={16} /></button>
            </div>
          </div>

          {/* Massimali - string based, normalizza onBlur */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Massimali 1RM</p>
            <div className="space-y-2">
              {([
                { label: 'Panca', em: '🏋️', val: benchStr, set: setBenchStr, fb: 60 },
                { label: 'Squat', em: '🦵', val: squatStr, set: setSquatStr, fb: 80 },
                { label: 'Stacco', em: '⚡', val: deadliftStr, set: setDeadliftStr, fb: 100 },
              ] as any[]).map(({ label, em, val, set, fb }) => (
                <div key={label} className="bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center px-4 py-3 gap-3">
                  <span className="text-lg">{em}</span>
                  <span className="text-white font-bold text-sm flex-1">{label}</span>
                  {val === null ? (
                    <button onClick={() => set(String(fb))} className="text-xs font-bold text-zinc-500 border border-zinc-700 rounded-xl px-3 py-1.5 hover:border-zinc-500 hover:text-zinc-300 transition-all active:scale-95">+ Aggiungi</button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjMax(set, val, -2.5)} className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 active:scale-95 font-bold">−</button>
                      <div className="flex items-baseline gap-0.5 w-16 justify-center">
                        <input type="number" value={val} onChange={e => set(e.target.value)} onBlur={() => normMax(set, val, fb)}
                          className="bg-transparent text-white font-black text-base text-center w-12 focus:outline-none" inputMode="decimal" />
                        <span className="text-zinc-600 text-[9px]">kg</span>
                      </div>
                      <button onClick={() => adjMax(set, val, 2.5)} className={`w-7 h-7 rounded-full ${accentBg} flex items-center justify-center text-black active:scale-95 font-bold`}>+</button>
                      <button onClick={() => set(null)} className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 active:scale-95 text-sm ml-0.5">×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preferiti */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Preferiti</p>
            <div className="grid grid-cols-3 gap-2">
              {PREF_OPTIONS.map(opt => {
                const sel = favorites.includes(opt.id);
                return (
                  <button key={opt.id} onClick={() => toggleFav(opt.id)}
                    className={`py-2.5 px-2 rounded-xl border text-center transition-all active:scale-95 ${sel ? 'border-zinc-600 text-white bg-zinc-800' : 'border-zinc-800 text-zinc-600 bg-zinc-900/60'}`}>
                    <p className="font-bold text-xs">{opt.label}</p>
                    <p className="text-[9px] opacity-50 mt-0.5">{opt.group}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs text-center">{error}</div>}
        </div>

        {/* FIX: Save button is INSIDE the modal sheet, not below the bottom nav */}
        <div className="shrink-0 px-5 py-4 bg-[#0d0d0d] border-t border-zinc-800/50">
          <button onClick={handleSave} disabled={isSaving}
            className={`w-full ${accentBg} disabled:opacity-40 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}>
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> Salvataggio...</> : <><Check size={18} strokeWidth={3} /> Salva Modifiche</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout, userProfile, userStats, isDarkMode, toggleTheme,
  onEditProfile, themeColor, workoutSchedule = {}, onDeleteWorkout, onProfileUpdated
}) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifSettings, setNotifSettings] = useState({ daily: true, sound: true, vibration: true });
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'history'>('stats');
  const [localImage, setLocalImage] = useState<string | undefined>(userProfile.image);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => { setLocalImage(userProfile.image); setImageKey(k => k + 1); }, [userProfile.image]);
  useEffect(() => { setBiometricsEnabled(SecureStorageManager.isBiometricsEnabled()); }, []);

  const isRose = themeColor === 'rose';
  const accentHex = isRose ? '#f43f5e' : '#10b981';
  const accentBg = isRose ? 'bg-rose-500' : 'bg-emerald-500';
  const accent = isRose ? 'text-rose-400' : 'text-emerald-400';

  const handleSaveProfile = async (profileUpdates: Partial<UserProfile>, statsUpdates: Partial<UserStats>) => {
    if (!userProfile.id) throw new Error('Utente non trovato.');
    // FIX: aggiorna immagine locale subito
    if (profileUpdates.image !== undefined) { setLocalImage(profileUpdates.image); setImageKey(k => k + 1); }
    await updateProfileField(userProfile.id, { weight: profileUpdates.weight, image: profileUpdates.image, favorite_exercises: profileUpdates.favoriteExercises });
    await updateUserStats(userProfile.id, statsUpdates);
    if (onProfileUpdated) onProfileUpdated(profileUpdates, statsUpdates);
  };

  const { chartData, weeklyMins } = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const dow = today.getDay();
    const mon = new Date(today); mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const labels = ['L','M','M','G','V','S','D'];
    let total = 0;
    const data = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      const dk = d.toLocaleDateString('en-CA');
      const done = ((workoutSchedule[dk] || []) as WorkoutCard[]).filter(w => w.isCompleted || w.id.startsWith('done_'));
      const secs = done.reduce((a, w) => a + (w.completedDuration || 0), 0);
      total += secs;
      return { name: labels[i], minutes: Math.round(secs / 60) };
    });
    return { chartData: data, weeklyMins: Math.floor(total / 60) };
  }, [workoutSchedule]);

  const recentHistory = useMemo(() => {
    const dn = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
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
  const weeklyDone = chartData.filter(d => d.minutes > 0).length;
  const weeklyPct = Math.min(100, (weeklyDone / weeklyGoal) * 100);
  const unlockedBadges = userStats.badges?.filter(b => b.tier !== 'locked') || [];

  if (showNotif) return (
    <div className="min-h-screen bg-[#080808]">
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => setShowNotif(false)} className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"><ChevronRight size={16} className="text-zinc-400 rotate-180" /></button>
        <h2 className="text-xl font-black text-white">Notifiche</h2>
      </div>
      <div className="px-5 space-y-2">
        {[{l:'Promemoria',d:'Ogni giorno alle 09:00',k:'daily'as const},{l:'Suoni',d:'Effetti sonori UI',k:'sound'as const},{l:'Vibrazione',d:'Feedback aptico',k:'vibration'as const}].map(({l,d,k})=>(
          <div key={k} className="bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center justify-between p-4">
            <div><p className="font-medium text-white text-sm">{l}</p><p className="text-xs text-zinc-600">{d}</p></div>
            <button onClick={()=>setNotifSettings(p=>({...p,[k]:!p[k]}))} className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${notifSettings[k]?accentBg:'bg-zinc-700'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${notifSettings[k]?'left-[22px]':'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] pb-28">
      {showEdit && <EditProfileModal userProfile={userProfile} userStats={userStats} themeColor={themeColor} onClose={()=>setShowEdit(false)} onSave={handleSaveProfile} />}

      {/* HERO */}
      <div className="relative px-5 pt-14 pb-6">
        <div className="absolute inset-0 pointer-events-none" style={{background:`radial-gradient(ellipse at 70% 0%, ${accentHex}18 0%, transparent 65%)`}} />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white">Profilo</h1>
          <button onClick={()=>setShowEdit(true)} className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 active:scale-95 transition-transform">
            <Edit2 size={11} /> Modifica
          </button>
        </div>
        <div className="flex items-end gap-5">
          <div className="relative shrink-0">
            <Ring pct={weeklyPct} size={96} stroke={3} color={accentHex} />
            <div className="absolute inset-[5px] rounded-full overflow-hidden">
              {localImage
                ? <img key={imageKey} src={localImage} className="w-full h-full object-cover" alt="profilo" />
                : <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><User size={32} className="text-zinc-600" /></div>
              }
            </div>
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-xl font-black text-white leading-tight truncate">{userProfile.name||'Atleta'}</h2>
            {userProfile.goal&&<p className="text-zinc-500 text-xs mt-0.5">Obiettivo: {userProfile.goal}</p>}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${weeklyPct}%`,backgroundColor:accentHex,transition:'width 0.6s ease'}} />
              </div>
              <span className="text-[10px] font-bold text-zinc-600 shrink-0">{weeklyDone}/{weeklyGoal} sett.</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {[
            {icon:<Flame size={14} fill="currentColor" className="text-orange-400"/>,val:userStats.streak,lbl:'Streak',bg:'bg-orange-500/10'},
            {icon:<Dumbbell size={14} className={accent}/>,val:userStats.workoutsCompleted,lbl:'Workout',bg:isRose?'bg-rose-500/10':'bg-emerald-500/10'},
            {icon:<Clock size={14} className="text-sky-400"/>,val:`${Math.floor(userStats.activeMinutes/60)}h`,lbl:'Attivo',bg:'bg-sky-500/10'},
          ].map(({icon,val,lbl,bg})=>(
            <div key={lbl} className="bg-zinc-900/70 rounded-2xl border border-zinc-800/50 p-3 flex flex-col items-center gap-1.5">
              <div className={`${bg} w-7 h-7 rounded-xl flex items-center justify-center`}>{icon}</div>
              <span className="text-base font-black text-white leading-none">{val}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="px-5 mb-4">
        <div className="bg-zinc-900/70 rounded-2xl p-1 flex border border-zinc-800/50">
          {([
            {id:'stats',label:'Stats',Icon:BarChart2},
            {id:'badges',label:`Badge${unlockedBadges.length>0?` (${unlockedBadges.length})`:''}`,Icon:Award},
            {id:'history',label:'Storico',Icon:Calendar},
          ] as const).map(({id,label,Icon})=>(
            <button key={id} onClick={()=>setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab===id?'bg-zinc-800 text-white':'text-zinc-600'}`}>
              <Icon size={11}/>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {activeTab==='stats'&&(
          <>
            <div className="bg-zinc-900/70 rounded-2xl border border-zinc-800/50 overflow-hidden">
              <div className="px-4 pt-4 pb-1 flex items-center gap-1.5"><Target size={10} className="text-zinc-600"/><p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Massimali 1RM</p></div>
              {[{lbl:'Panca',em:'🏋️',val:userStats.maxes?.bench,max:200},{lbl:'Squat',em:'🦵',val:userStats.maxes?.squat,max:260},{lbl:'Stacco',em:'⚡',val:userStats.maxes?.deadlift,max:300}].map(({lbl,em,val,max},i)=>(
                <div key={lbl} className={`flex items-center px-4 py-3 gap-3 ${i<2?'border-b border-zinc-800/50':''}`}>
                  <span className="text-base">{em}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-zinc-300">{lbl}</span>
                      <span className={`text-sm font-black ${accent}`}>{val||0}<span className="text-[10px] text-zinc-700 ml-0.5">kg</span></span>
                    </div>
                    <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${Math.min(100,((val||0)/max)*100)}%`,backgroundColor:accentHex,transition:'width 0.8s ease'}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-900/70 rounded-2xl p-4 border border-zinc-800/50">
              <div className="flex justify-between items-baseline mb-4">
                <div><p className="text-sm font-bold text-white">Questa Settimana</p><p className="text-[9px] text-zinc-600 uppercase tracking-wider">Minuti attivi</p></div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{color:accentHex,backgroundColor:`${accentHex}15`}}>{weeklyMins}m totali</span>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{top:0,right:0,left:-22,bottom:0}}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#3f3f46',fontSize:9,fontWeight:'bold'}} dy={8} />
                    <Tooltip cursor={{fill:'#1f1f23',radius:6}} content={({active,payload})=>active&&payload?.length?<div className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 text-white shadow-xl">{payload[0].payload.minutes} min</div>:null} />
                    <Bar dataKey="minutes" radius={[4,4,4,4]} barSize={20}>
                      {chartData.map((e,i)=><Cell key={i} fill={e.minutes>0?accentHex:'#1a1a1e'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab==='badges'&&(
          <>
            {unlockedBadges.length>0&&(
              <div className="bg-zinc-900/70 rounded-2xl p-4 border border-zinc-800/50 flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <Ring pct={(unlockedBadges.length/(userStats.badges?.length||1))*100} size={56} stroke={4} color={accentHex} />
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-black text-sm">{unlockedBadges.length}</span></div>
                </div>
                <div><p className="text-white font-black">{unlockedBadges.length}<span className="text-zinc-600 font-medium text-sm">/{userStats.badges?.length}</span></p><p className="text-zinc-500 text-xs">badge sbloccati</p></div>
              </div>
            )}
            {userStats.badges?.length>0?(
              <div className="grid grid-cols-2 gap-2.5">
                {userStats.badges.map(b=>{
                  const colors:Record<string,string>={locked:'#3f3f46',bronze:'#b45309',silver:'#9ca3af',gold:'#d97706',diamond:'#06b6d4',legendary:'#a855f7'};
                  const c=colors[b.tier]||colors.locked;
                  const pct=b.nextThreshold?Math.min(100,(b.currentValue/b.nextThreshold)*100):100;
                  return(
                    <div key={b.id} className={`rounded-2xl p-3 border flex flex-col gap-2 ${b.tier==='locked'?'bg-zinc-900/40 border-zinc-800/40':'bg-zinc-800/60 border-zinc-700/50'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor:`${c}20`}}><Award size={14} style={{color:c}}/></div>
                        <div className="flex-1 min-w-0"><p className="text-xs font-black text-white truncate">{b.title}</p><p className="text-[9px] font-bold capitalize" style={{color:c}}>{b.tier==='locked'?'Bloccato':b.tier}</p></div>
                      </div>
                      {b.nextThreshold!==undefined&&(
                        <div>
                          <div className="h-0.5 bg-zinc-700 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${pct}%`,backgroundColor:c}}/></div>
                          <p className="text-[9px] text-zinc-600 mt-0.5">{b.currentValue}/{b.nextThreshold}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ):(
              <div className="bg-zinc-900/60 rounded-2xl p-10 text-center border border-dashed border-zinc-800">
                <Award size={28} className="mx-auto mb-2 text-zinc-700"/><p className="text-sm text-zinc-500">Completa allenamenti per sbloccare badge</p>
              </div>
            )}
          </>
        )}

        {activeTab==='history'&&(
          recentHistory.length===0?(
            <div className="bg-zinc-900/60 rounded-2xl p-10 text-center border border-dashed border-zinc-800">
              <Calendar size={28} className="mx-auto mb-2 text-zinc-700"/><p className="text-sm text-zinc-500">Nessun allenamento completato.</p>
            </div>
          ):(
            <div className="bg-zinc-900/70 rounded-2xl overflow-hidden border border-zinc-800/50">
              {recentHistory.slice(0,15).map((item,i,arr)=>(
                <div key={item.id} className={`flex items-center gap-3 p-3.5 ${i<arr.length-1?'border-b border-zinc-800/40':''}`}>
                  <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 bg-zinc-800/80">
                    <span className="text-[8px] font-bold uppercase text-zinc-500">{item.dayName}</span>
                    <span className="text-sm font-black text-white">{item.dayNum}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className={`font-bold ${accent}`}>{item.category}</span><span>·</span><span>{Math.round(item.duration/60)} min</span>
                    </p>
                  </div>
                  {onDeleteWorkout&&<button onClick={()=>onDeleteWorkout(item.id,item.date)} className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors active:scale-90"><Trash2 size={13}/></button>}
                </div>
              ))}
            </div>
          )
        )}

        {/* SETTINGS */}
        <div className="pb-6">
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-3 pl-1">Impostazioni</p>
          <div className="bg-zinc-900/70 rounded-2xl overflow-hidden border border-zinc-800/50 divide-y divide-zinc-800/40">
            <div className="flex items-center justify-between p-4">
              <div><p className="font-medium text-white text-sm">FaceID</p><p className="text-xs text-zinc-600">Sicurezza account</p></div>
              <button onClick={()=>{const v=!biometricsEnabled;setBiometricsEnabled(v);SecureStorageManager.setBiometricsEnabled(v);}} className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${biometricsEnabled?accentBg:'bg-zinc-700'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${biometricsEnabled?'left-[22px]':'left-0.5'}`}/>
              </button>
            </div>
            <div onClick={()=>setShowNotif(true)} className="flex items-center justify-between p-4 cursor-pointer active:opacity-70">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-500"><Bell size={13}/></div>
                <span className="text-white text-sm">Notifiche</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600"/>
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={toggleTheme}>
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDarkMode?'bg-indigo-500/20 text-indigo-400':'bg-orange-500/20 text-orange-500'}`}>
                  {isDarkMode?<Moon size={13}/>:<Sun size={13}/>}
                </div>
                <span className="text-white text-sm">Dark Mode</span>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode?accentBg:'bg-zinc-700'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode?'left-[22px]':'left-0.5'}`}/>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full mt-4 py-3.5 text-red-500 text-sm font-medium bg-zinc-900/60 hover:bg-red-500/10 rounded-2xl border border-zinc-800/50 transition-colors">
            Esci dall'account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
